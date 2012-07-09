/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

// RDGE namespaces
var RDGE = RDGE || {};
RDGE.animation = RDGE.animation || {};

/** 
 * channelController 
 * The channel controller is really the workhorse of the RDGE animation system. It handles timing, 
 * interpolation, and sampling of attributes over the lifetime of an animation. Each channel controller 
 * is responsible for animating a single attribute. The current implementation supports animating vector, 
 * boolean, or quaternion attributes. This class is used internally by the animation system.
 *
 * @param _animation - the animation resource
 * @param _channel - the channel id
 *
 */
RDGE.animation.channelController = function (_animation, _channel) {
    /** 
    * this.interpolate - Enable/Disable interpolation between animation frames.  
    * Typically this should be enabled for smoother looking animation. However, 
    * there may be applications where interpolation is undesireable. 
    */
    this.interpolate = false;

    /** 
    * this.animation - the animation resource. 
    * This is where the keyframes for the channel are stored. 
    */
    this.animation = _animation;

    /**
    * this.channel - the channel id. This is used to look up the keyframe data for this channel.
    */
    this.channel = _channel;

    /**
    * this.localTime - the current time, relative to the start time.
    */
    this.localTime = 0.0;

    /**
    * this.startTime - the start time of the animation clip window.
    */
    this.startTime = this.animation.clipStart / this.animation.framesPerSec;

    /**
    * this.endTime - the end time of the animation clip window.
    */
    this.endTime = this.animation.clipEnd / this.animation.framesPerSec;

    /** 
    * this.cachedFrame - cached frame index, this optimizes best case scenario computeFrame calls.
    */
    this.cachedFrame = -1;

    /** 
    * oneFrameInSecs - stores the interval of a single frame in seconds. This is used for internal calculations.
    */
    oneFrameInSecs = 1.0 / _animation.framesPerSec;

    /** 
    * this.channel.timeline - stores the animation timeline. 
    * Currently this is calculated based on the framePerSec settings of the animation. 
    * Eventually the timeline should be exported with the animation. Individual channels 
    * may have different timelines depending on which frames are keyed.
    */
    this.channel.timeline = new Array(this.channel.numKeys + 1);
    for (i = 0; i <= this.channel.numKeys; ++i) {
        this.channel.timeline[i] = i / this.animation.framesPerSec;
    }

    /** this.computeFrame 
    * Calculates the current frame index of the animation at the current time. 
    * In the worst case, this function will perform a binary search for the frame 
    * whose time is closest to and less than the current time. In the best case, 
    * the current frame is near the most recently cached frame, or it remains unchanged. 
    */
    this.computeFrame = function () {
        var absTime = this.localTime + this.startTime;
        var start = this.animation.clipStart;
        var end = this.animation.clipEnd;

        if (this.cachedFrame != -1) {
            // if the current time is reasonably close to the last frame processed try searching
            // forward or backward. best case it is the next frame.
            if (Math.abs(absTime - this.channel.timeline[this.cachedFrame]) < 5 * oneFrameInSecs) {
                if (this.channel.timeline[this.cachedFrame] < absTime) {
                    while (this.channel.timeline[this.cachedFrame + 1] <= absTime) {
                        this.cachedFrame++;
                        if (this.animation.looping) {
                            if (this.cachedFrame > this.numFrames - 1) {
                                this.cachedFrame -= this.numFrames - 1;
                            }
                        } else {
                            if (this.cachedFrame > this.numFrames - 1) {
                                this.cachedFrame = this.numFrames - 1;
                            }
                        }
                    }
                    return this.cachedFrame;

                } else {
                    while (this.channel.timeline[this.cachedFrame] > absTime) {
                        this.cachedFrame--;
                        if (this.animation.looping) {
                            if (this.cachedFrame < 0) {
                                this.cachedFrame += this.numFrames - 1;
                            }
                        } else {
                            if (this.cachedFrame > this.numFrames - 1) {
                                this.cachedFrame = this.numFrames - 1;
                            }
                        }
                    }
                    return this.cachedFrame;
                }
            }
        }

        // binary search...                 
        while (start + 1 < end) {
            var mid = Math.floor((start + end) / 2);
            if (absTime > this.channel.timeline[mid]) {
                start = mid + 1;
            } else {
                end = mid - 1;
            }
        }

        this.cachedFrame = start;

        return start;
    };

    /* this.sampleBool - Sample a boolean at the current frame, booleans are not interpolated.
    * This function is used internally.
    */
    this.sampleBool = function () {
        // no interpolation on flags...
        var index = this.computeFrame();
        return this.channel.keys[index];
    };

    /* this.sampleQuat - Sample a quaternion at the current frame.
    * if this.interpolate == true, quaternions are interpolated inbetween frames using spherical linear interpolation (SLERP).
    */
    this.sampleQuat = function () {
        var frame0 = this.computeFrame();
        var frame1 = frame0 + 1;

        var k0 = this.channel.timeline[frame0];
        var k1 = this.channel.timeline[frame1];
        var index0 = frame0 * 4;
        var index1 = frame1 * 4;

        if (this.interpolate) {
            var absTime = this.localTime + this.startTime;
            var t = (absTime - k0) / (k1 - k0);
            var a = [this.channel.keys[index0 + 0], this.channel.keys[index0 + 1], this.channel.keys[index0 + 2], this.channel.keys[index0 + 3]];
            var b = [this.channel.keys[index1 + 0], this.channel.keys[index1 + 1], this.channel.keys[index1 + 2], this.channel.keys[index1 + 3]];
            return RDGE.quat.slerp(a, b, t);
        }

        return [this.channel.keys[index0 + 0], this.channel.keys[index0 + 1], this.channel.keys[index0 + 2], this.channel.keys[index0 + 3]];
    };

    /* this.sampleVec3 - Sample a vector3 at the current frame.
    * if this.interpolate == true, vectors are interpolated inbetween frames using linear interpolation (LERP).
    */
    this.sampleVec3 = function () {
        var frame0 = this.computeFrame();
        var frame1 = frame0 + 1;

        var k0 = this.channel.timeline[frame0];
        var k1 = this.channel.timeline[frame1];
        var index0 = frame0 * 3;
        var index1 = frame1 * 3;

        if (this.interpolate) {
            var absTime = this.localTime + this.startTime;
            var t = (absTime - k0) / (k1 - k0);
            var a = [this.channel.keys[index0 + 0], this.channel.keys[index0 + 1], this.channel.keys[index0 + 2]];
            var b = [this.channel.keys[index1 + 0], this.channel.keys[index1 + 1], this.channel.keys[index1 + 2]];

            return RDGE.vec3.lerp(a, b, t);
        }
        return [this.channel.keys[index0 + 0], this.channel.keys[index0 + 1], this.channel.keys[index0 + 2]];
    };

    /* this.setTime - set the current time.
    */
    this.setTime = function (t) {
        this.localTime = t;
        if (this.localTime < 0.0) {
            this.localTime = 0.0;
        }
        if (this.localTime > this.animation.duration - oneFrameInSecs) {
            this.localTime = this.animation.duration - oneFrameInSecs;
        }
    };

    /* this.setProgress - set the current time as a percentage of the duration.
    */
    this.setProgress = function (f) {
        this.setTime(f * this.animation.duration);
    };

    /* this.setFrame - set the current time by frame number.
    */
    this.setFrame = function (f) {
        this.setTime(f / this.animation.framesPerSec);
    };

    /* this.step - advance time by the given timestep and wrap if looping.
    */
    this.step = function (_dt) {
        this.localTime += _dt;
        if (this.animation.looping) {
            while (this.localTime < 0.0) {
                this.localTime += this.animation.duration - oneFrameInSecs;
            }
            while (this.localTime >= this.animation.duration - oneFrameInSecs) {
                this.localTime -= this.animation.duration - oneFrameInSecs;
            }
        } else {
            if (this.localTime < 0.0) {
                this.localTime = 0.0;
            }
            if (this.localTime > this.animation.duration) {
                this.localTime = this.animation.duration;
            }
        }
    };
};

/** 
 * track 
 * Each track advances and samples from a list of channel controllers, and is assigned to a scene graph node. 
 *
 * @param _animation - the animation resource
 * @param _track - the track id
 * @param _node - the scene node
 *
 */
RDGE.animation.track = function (_animation, _track, _node) {
    this.track = _track;
    this.node = _node;

    this.channelControllers = new Array();
    for (ch in _track) {
        this.channelControllers[ch] = new RDGE.animation.channelController(_animation, _track[ch]);
    }

    this.step = function (_dt) {
        for (cc in this.channelControllers) {
            this.channelControllers[cc].step(_dt);
        }
        var rotate = this.channelControllers["rotate"].sampleQuat();
        var scale = this.channelControllers["scale"].sampleVec3();
        var translate = this.channelControllers["translate"].sampleVec3();
        if (this.channelControllers["vis"] != null) {
            var vis = this.channelControllers["vis"].sampleBool();
            this.node.hide = !vis;
        }

        var m = RDGE.mat4.identity();
        m = RDGE.mat4.scale(m, scale);
        m = RDGE.mat4.mul(m, RDGE.quat.toMatrix(rotate));
        m = RDGE.mat4.translate(m, translate);
        this.node.local = m;
    }
};

RDGE.animation.animation = function (_scene, _clipStart, _clipEnd, _loop) {
    this.animation = _scene.scene.animation;
    this.clipStart = _clipStart;
    // this is a little hacky, but it works for now.
    if (_clipEnd == -1) {
        for (tr in this.animation) {
            for (ch in this.animation[tr]) {
                _clipEnd = this.animation[tr][ch].numKeys - 1;
                break;
            }
            break;
        }
    }
    this.clipEnd = _clipEnd;
    this.numFrames = _clipEnd - _clipStart;
    this.framesPerSec = 30.0;
    this.duration = this.numFrames / this.framesPerSec;
    this.rate = 1.0;
    this.looping = _loop;
    this.tracks = new Array();

    // creating a mapping here to make binding tracks a little more
    // straightforward.
    mapping = new Array();
    mapping.process = function (trNode, parent) {
        mapping[trNode.name] = trNode;
    }

    RDGE.globals.engine.getContext().getScene().Traverse(mapping);
    //g_sg.Traverse(mapping);

    for (tr in this.animation) {
        if (mapping[tr] !== undefined) {
            this.tracks.push(new RDGE.animation.track(this, this.animation[tr], mapping[tr]));
        }
    }

    this.step = function (_dt) {
        for (tr in this.tracks) {
            this.tracks[tr].step(g_animationRate * this.rate * _dt);
        }
    }
};
