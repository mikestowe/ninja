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

var RDGE = RDGE || {};

RDGE.particle = function (def, id) {
    this.id = id;
    this.def = def;
    if (this.def.numFrames == undefined) {
        if (this.def.textureSize && this.def.frameSize) {
            this.def.numFrames = (this.def.textureSize[0] / this.def.frameSize[0]) * (this.def.textureSize[1] / this.def.frameSize[1]);
        } else {
            this.def.numFrames = 0;
        }
    }

    this.pos = RDGE.vec3.zero();
    this.delta = RDGE.vec3.zero();
    this.rotate = 0.0;
    this.age = 0.0;
    this.lifespan = 0.0;
    this.velocity = RDGE.vec3.zero();
    this.gravity = RDGE.vec3.zero();
    this.frame = 0;
    this.frameCount = 0;
    this.lastPos = RDGE.vec3.zero();
    this.state = 0;
    this.hide = false;
    this.color = RDGE.vec4.zero();

    this.randomize = function (min, max) {
        return min + (max - min) * Math.random();
    };
    this.rate = this.randomize(-1.0, 1.0);

    this.randomize3 = function (min, max) {
        return [this.randomize(min[0], max[0]),
                            this.randomize(min[1], max[1]),
                            this.randomize(min[2], max[2])];
    };

    this.spawn = function (spawnMatrix) {
        if (this.def.initialframe == undefined) {
            this.frame = this.id % this.def.numFrames;
        } else {
            this.frame = this.randomize(this.def.initialframe[0], this.def.initialframe[1]);
        }
        this.pos = this.randomize3(this.def.initialpos[0], this.def.initialpos[1]);
        if (this.def.worldSpace) {
            // calculate the initial position in world space.
            this.pos = RDGE.mat4.transformPoint(spawnMatrix, this.pos);
        }
        // all other values are assumed to be defined in local or world space depending on
        // the particles worldSpace designation.
        var toRadians = Math.PI / 180.0;
        if (this.def.initialsize) {
            this.size = this.randomize(this.def.initialsize[0], this.def.initialsize[1]);
        } else {
            this.size = 1.0;
        }
        this.velocity = this.randomize3(this.def.initialvel[0], this.def.initialvel[1]);
        this.gravity = [this.def.gravity[0], this.def.gravity[1], this.def.gravity[2]];
        this.rotate = this.randomize(this.def.initialrot[0] * toRadians, this.def.initialrot[1] * toRadians);
        this.lifespan = this.randomize(this.def.lifespan[0], this.def.lifespan[1]);
        this.age = 0.0;
        this.delta = [0.0, 0.0, 0.0];
        this.lastPos = RDGE.vec3.add(this.pos, RDGE.vec3.scale(this.velocity, -1.0 / 30.0));
        this.color = [1, 1, 1, 1]; //RDGE.vec4.random( [0.0, 0.0, 0.0, 1.0], [1.0, 1.0, 1.0, 1.0] );
    };
};

// double buffered array utility class
RDGE.DoubleBuffer = function (arrType, size) {
    this.buffer = {};
    this.buffer[0] = new arrType(size);
    this.buffer[1] = new arrType(size);
    this.bufferIndex = 0;

    this.flip = function () {
        this.bufferIndex = 1 - this.bufferIndex;
    }
    this.front = function () {
        return this.buffer[this.bufferIndex];
    }
    this.back = function () {
        return this.buffer[1 - this.bufferIndex];
    }
};


// cycling buffer
RDGE.particleBuffer = function (pdef, emitter, size) {
    var renderer = RDGE.globals.engine.getContext().renderer;
    var ctx = renderer.ctx;

    s_particleShader = new RDGE.jshader();
    s_particleShader.def = {
        'shaders': {
            'defaultVShader': "assets/shaders/particle_vshader.glsl",
            'defaultFShader': "assets/shaders/particle_fshader.glsl"
        },
        'techniques': {
            'defaultTechnique': [{
                'vshader': 'defaultVShader',
                'fshader': 'defaultFShader',
                'attributes': {
                    'a_pos': { 'type': 'vec4' },
                    'a_posId': { 'type': 'float' },
                    'a_rotation': { 'type': 'float' },
                    'a_size': { 'type': 'float' },
                    'a_color': { 'type': 'vec4' }
                },
                'params': {
                    'u_projMatrix': { 'type': 'mat4' },
                    'u_viewMatrix': { 'type': 'mat4' },
                    'u_worldMatrix': { 'type': 'mat4' },
                    'u_particleSizeX': { 'type': 'vec4' },
                    'u_particleSizeY': { 'type': 'vec4' },
                    'u_particleRot': { 'type': 'vec4' },
                    'u_particleColors': { 'type': 'mat4' },
                    'u_textureSize': { 'type': 'vec2' },
                    'u_frameSize': { 'type': 'vec2' },
                    's_texture0': { 'type': 'tex2d' }
                    //                  's_texture1' : { 'type' : 'tex2d' }
                }
            }]
        }
    }
    s_particleShader.init();
    s_particleTextures = {};

    this.shader = s_particleShader;
    this.owner = emitter;
    if (pdef.texture && s_particleTextures[pdef.texture] == undefined) {
        s_particleTextures[pdef.texture] = renderer.createTexture(pdef.texture);
        if (!pdef.textureSize || !pdef.frameSize) {
            pdef.textureSize = [];
            pdef.textureSize[0] = s_particleTextures[pdef.texture].image.width;
            pdef.textureSize[1] = s_particleTextures[pdef.texture].image.height;

        }

        if (!pdef.frameSize) {
            pdef.frameSize = [];
            pdef.frameSize[0] = s_particleTextures[pdef.texture].image.width;
            pdef.frameSize[1] = s_particleTextures[pdef.texture].image.height;
        }
    }
    if (pdef.texture2 && s_particleTextures[pdef.texture2] == undefined) {
        s_particleTextures[pdef.texture2] = renderer.createTexture(pdef.texture2);
    }
    this.texture = s_particleTextures[pdef.texture];
    this.texture2 = s_particleTextures[pdef.texture2];
    this.bounds = {};
    this.bounds.min = RDGE.vec3.zero();
    this.bounds.max = RDGE.vec3.zero();

    this.srcBlend = pdef.srcBlend;
    this.dstBlend = pdef.dstBlend;

    this.particles = new Array();

    this.posBuffer = new RDGE.DoubleBuffer(Float32Array, 16 * size); // 4 positions per particle, 4 components per position (particle age in w)
    this.posIdBuffer = new Float32Array(4 * size);
    this.sizeBuffer = new RDGE.DoubleBuffer(Float32Array, 4 * size);
    this.rotBuffer = new RDGE.DoubleBuffer(Float32Array, 4 * size);
    this.colorBuffer = new RDGE.DoubleBuffer(Float32Array, 16 * size);
    this.indexBuffer = new RDGE.DoubleBuffer(Uint16Array, 6 * size);
    this.indexBuffer.front().numIndices = 0;
    this.indexBuffer.back().numIndices = 0;

    for (i = 0; i < size; ++i) {
        this.particles.push(new RDGE.particle(pdef, i));

        // initialize double buffers.
        // the first pass will init the front buffers.
        // the second pass will init the back buffers.
        for (j = 0; j < 2; ++j) {
            // init position buffer
            var pfb = this.posBuffer.front();
            var i16 = i * 16;
            for (j = 0; j < 4; ++j) {
                var cmpBaseIndex = i16 + j * 4;
                pfb[cmpBaseIndex + 0] = 0;
                pfb[cmpBaseIndex + 1] = 0;
                pfb[cmpBaseIndex + 2] = 0;
                pfb[cmpBaseIndex + 3] = 1;
            }

            // init rotation buffer
            var i4 = i * 4;
            var rfb = this.rotBuffer.front();
            rfb[i4 + 0] = 0;
            rfb[i4 + 1] = 0;
            rfb[i4 + 2] = 0;
            rfb[i4 + 3] = 0;

            // init rotation buffer
            var i4 = i * 4;
            var sfb = this.sizeBuffer.front();
            rfb[i4 + 0] = 1;
            rfb[i4 + 1] = 1;
            rfb[i4 + 2] = 1;
            rfb[i4 + 3] = 1;

            // init color buffer
            var i4 = i * 4;
            var cfb = this.colorBuffer.front();
            cfb[i4] = 0xFFFFFF;

            // init index buffer
            var ifb = this.indexBuffer.front();
            var i6 = i * 6;
            ifb[i6 + 0] = i4 + 1;
            ifb[i6 + 1] = i4 + 0;
            ifb[i6 + 2] = i4 + 3;
            ifb[i6 + 3] = i4 + 1;
            ifb[i6 + 4] = i4 + 3;
            ifb[i6 + 5] = i4 + 2;

            // flip buffers
            this.posBuffer.flip();
            this.rotBuffer.flip();
            this.indexBuffer.flip();
        }

        var i4 = i * 4;
        this.posIdBuffer[i4 + 0] = 0;
        this.posIdBuffer[i4 + 1] = 1;
        this.posIdBuffer[i4 + 2] = 2;
        this.posIdBuffer[i4 + 3] = 3;
    }

    this.posBufferObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.posBufferObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, this.posBuffer.front(), ctx.DYNAMIC_DRAW);

    this.posIdBufferObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.posIdBufferObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, this.posIdBuffer, ctx.DYNAMIC_DRAW);

    this.rotBufferObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.rotBufferObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, this.rotBuffer.front(), ctx.DYNAMIC_DRAW);

    this.sizeBufferObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.sizeBufferObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, this.sizeBuffer.front(), ctx.DYNAMIC_DRAW);

    this.colorBufferObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.colorBufferObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, this.colorBuffer.front(), ctx.DYNAMIC_DRAW);

    this.indexBufferObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indexBufferObject);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, this.indexBuffer.front(), ctx.DYNAMIC_DRAW);

    this.start = 0;
    this.end = 0;
    this.cap = size;

    this.kill = function () {
        this.start++;
        if (this.start > (this.cap - 1))
            this.start = 0;
    };

    this.emit = function (parent) {
        this.end++;
        if (this.end >= this.cap) {
            this.end = 0;
        }
        if (this.end == this.start) {
            this.kill();
        }
        this.particles[this.end].spawn(this.owner.world);
    };

    this.sync = function () {
        this.posBuffer.flip();
        this.rotBuffer.flip();
        this.sizeBuffer.flip();
        this.colorBuffer.flip();
        this.indexBuffer.flip();

        // update the back buffer.
        var dstPosBuffer = this.posBuffer.back();
        var dstRotBuffer = this.rotBuffer.back();
        var dstSizeBuffer = this.sizeBuffer.back();
        var dstColorBuffer = this.colorBuffer.back();
        var dstIdxBuffer = this.indexBuffer.back();

        var bmin = this.bounds.min;
        var bmax = this.bounds.max;

        bmin[0] = 1e10;
        bmin[1] = 1e10;
        bmin[2] = 1e10;

        bmax[0] = -1e10;
        bmax[1] = -1e10;
        bmax[2] = -1e10;

        var numIndices = 0;
        var i = this.start;
        while (1) {
            var x, y, z, w;
            var p = this.particles[i];
            var age = (p.age / p.lifespan); // normalized age
            // combine frame number and age and store in w.
            // to decode :
            //      frame = floor( w );
            //      age = fract( w );
            var pw = Math.min(age, 0.999) + Math.floor(p.frame);
            if (age < 1.0) { // || (pdef.persist != undefined && pdef.persist == true)) {
                var px = p.pos[0];
                var py = p.pos[1];
                var pz = p.pos[2];

                if (px > bmax[0]) { bmax[0] = px; }
                if (px > bmax[1]) { bmax[1] = py; }
                if (px > bmax[2]) { bmax[2] = pz; }

                if (px < bmin[0]) { bmin[0] = px; }
                if (px < bmin[1]) { bmin[1] = py; }
                if (px < bmin[2]) { bmin[2] = pz; }

                var i16 = i * 16;
                for (j = 0; j < 4; ++j) {
                    var cmpBaseIndex = i16 + j * 4;
                    dstPosBuffer[cmpBaseIndex + 0] = px;
                    dstPosBuffer[cmpBaseIndex + 1] = py;
                    dstPosBuffer[cmpBaseIndex + 2] = pz;
                    dstPosBuffer[cmpBaseIndex + 3] = pw;
                }

                var i4 = i * 4;
                var r = 0.0;
                if (pdef.velocityAligned) {
                    r = Math.atan2(p.delta[0], p.delta[1]);
                }
                dstRotBuffer[i4 + 0] = p.rotate + r;
                dstRotBuffer[i4 + 1] = p.rotate + r;
                dstRotBuffer[i4 + 2] = p.rotate + r;
                dstRotBuffer[i4 + 3] = p.rotate + r;

                dstSizeBuffer[i4 + 0] = p.size;
                dstSizeBuffer[i4 + 1] = p.size;
                dstSizeBuffer[i4 + 2] = p.size;
                dstSizeBuffer[i4 + 3] = p.size;

                var i16 = i * 16;
                for (j = 0; j < 4; ++j) {
                    var cmpBaseIndex = i16 + j * 4;
                    dstColorBuffer[cmpBaseIndex + 0] = p.color[0];
                    dstColorBuffer[cmpBaseIndex + 1] = p.color[1];
                    dstColorBuffer[cmpBaseIndex + 2] = p.color[2];
                    dstColorBuffer[cmpBaseIndex + 3] = p.color[3];
                }

                dstIdxBuffer[numIndices + 0] = i4 + 1;
                dstIdxBuffer[numIndices + 1] = i4 + 0;
                dstIdxBuffer[numIndices + 2] = i4 + 3;
                dstIdxBuffer[numIndices + 3] = i4 + 1;
                dstIdxBuffer[numIndices + 4] = i4 + 2;
                dstIdxBuffer[numIndices + 5] = i4 + 3;

                numIndices += 6;
            }

            if (i == this.end) {
                break;
            }
            i++;
            if (i == this.cap && this.end != this.cap) {
                i = 0;
            }
        }
        dstIdxBuffer.numIndices = numIndices;

        if (!pdef.worldSpace) {
            // calculate the world space bounds from local space.
            // first transform our local space min-max coordinates to world space.
            var bminW = RDGE.mat4.mul(bmin, this.owner.world);
            var bmaxW = RDGE.mat4.mul(bmax, this.owner.world);

            // now calculate axis aligned bounds based on the world space coordinates.
            if (bmaxW[0] > bmax[0]) { bmax[0] = bmaxW[0]; }
            if (bmaxW[1] > bmax[1]) { bmax[1] = bmaxW[1]; }
            if (bmaxW[2] > bmax[2]) { bmax[2] = bmaxW[2]; }
            if (bminW[0] < bmin[0]) { bmin[0] = bminW[0]; }
            if (bminW[1] < bmin[1]) { bmin[1] = bminW[1]; }
            if (bminW[2] < bmin[2]) { bmin[2] = bminW[2]; }
        }
    };

    this.update = function (dt, movers) {
        var i = this.start;
        if (pdef.persist != undefined && pdef.persist == false) {
            while (1) {
                var p = this.particles[i];
                if (p.age < p.lifespan)
                    break;
                this.kill();
                if (i == this.end) {
                    break;
                }
                i++;
                if (i == this.cap && this.end != this.cap) {
                    i = 0;
                }
            }
        }

        i = this.start;
        while (1) {
            var p = this.particles[i];
            var j = movers.length;
            while (j) {
                movers[--j].move(p, dt);
            }
            if (i == this.end) {
                break;
            }
            i++;
            if (i == this.cap && this.end != this.cap) {
                i = 0;
            }
        }

        this.sync();
    };

    this.render = function () {

        var renderer = RDGE.globals.engine.getContext().renderer;
        var ctx = RDGE.globals.engine.getContext().renderer.ctx;

        // draw using the front buffer.
        var srcPosBuffer = this.posBuffer.front();
        var srcRotBuffer = this.rotBuffer.front();
        var srcSizeBuffer = this.sizeBuffer.front();
        var srcColBuffer = this.colorBuffer.front();
        var srcIdxBuffer = this.indexBuffer.front();

        if (srcIdxBuffer.numIndices > 0) {
            // set modelview matrix
            var shaderparms = this.shader.defaultTechnique;
            var activeCam = renderer.cameraManager().getActiveCamera();
            if (pdef.worldSpace) {
                shaderparms.u_viewMatrix.set(activeCam.view);
                shaderparms.u_worldMatrix.set(RDGE.mat4.identity());
            }
            else {
                shaderparms.u_viewMatrix.set(activeCam.view);
                shaderparms.u_worldMatrix.set(this.owner.world);
                //              shaderparms.u_mvMatrix.set(RDGE.mat4.mul(this.owner.world, activeCam.view));
            }
            shaderparms.u_projMatrix.set(activeCam.proj);

            shaderparms.u_particleSizeX.set(pdef.sizeX);
            shaderparms.u_particleSizeY.set(pdef.sizeY);
            shaderparms.u_particleRot.set(RDGE.vec4.scale(pdef.rotation, Math.PI / 180.0));
            shaderparms.u_particleColors.set(RDGE.mat4.transpose(pdef.colors));
            shaderparms.u_textureSize.set(pdef.textureSize);
            shaderparms.u_frameSize.set(pdef.frameSize);
            shaderparms.s_texture0.set(this.texture);
            //          shaderparms.s_texture1.set(null);

            var passCount = this.shader.begin();
            for (passIdx = 0; passIdx < passCount; ++passIdx) {
                this.shader.beginPass(passIdx);

                // setup render states
                if (!pdef.depthTest) {
                    ctx.disable(ctx.DEPTH_TEST);
                }

                ctx.enable(ctx.BLEND);
                ctx.blendFunc(ctx[pdef.srcBlend], ctx[pdef.dstBlend]);

                ctx.enableVertexAttribArray(0);
                ctx.enableVertexAttribArray(1);
                ctx.enableVertexAttribArray(2);
                ctx.enableVertexAttribArray(3);
                ctx.enableVertexAttribArray(4);

                // update position buffer
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.posBufferObject);
                ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, srcPosBuffer);
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.posBufferObject);
                ctx.vertexAttribPointer(0, 4, ctx.FLOAT, false, 0, 0);

                // position id buffer
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.posIdBufferObject);
                ctx.vertexAttribPointer(1, 1, ctx.FLOAT, false, 0, 0);

                // update rotation buffer
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.rotBufferObject);
                ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, srcRotBuffer);
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.rotBufferObject);
                ctx.vertexAttribPointer(2, 1, ctx.FLOAT, false, 0, 0);

                // update size buffer
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.sizeBufferObject);
                ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, srcSizeBuffer);
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.sizeBufferObject);
                ctx.vertexAttribPointer(3, 1, ctx.FLOAT, false, 0, 0);

                // update color buffer
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.colorBufferObject);
                ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, srcColBuffer);
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.colorBufferObject);
                ctx.vertexAttribPointer(4, 4, ctx.FLOAT, false, 0, 0);

                // update index buffer
                ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indexBufferObject);
                ctx.bufferSubData(ctx.ELEMENT_ARRAY_BUFFER, 0, srcIdxBuffer);

                // draw
                ctx.drawElements(ctx.TRIANGLES, srcIdxBuffer.numIndices, ctx.UNSIGNED_SHORT, 0);

                // restore render states
                ctx.disable(ctx.BLEND);
                if (!pdef.depthTest) {
                    ctx.enable(ctx.DEPTH_TEST);
                }
                ctx.blendFunc(ctx.ONE, ctx.ZERO);

                this.shader.endPass();
            }
            this.shader.end();
        }
    };
};

particleMoverDefault = function () {
    this.move = function (particle, dt) {
        particle.age += dt;

        if (particle.def.persist) {
            if (particle.def.cycle && particle.age > particle.lifespan * 0.99) {
                particle.age -= particle.lifespan * 0.99;
            } else {
                particle.age = Math.min(particle.age, particle.lifespan * 0.99);
            }

        } else {
            particle.age = Math.min(particle.age, particle.lifespan);
        }

        if (particle.def.frameRate > 0.0) {
            particle.frame += particle.def.frameRate * dt; //Math.min( particle.def.numFrames - 1, particle.frame + particle.def.frameRate * dt );
            if (particle.def.frameLoop) {
                particle.frame = particle.frame % particle.def.numFrames;
            }
            else {
                particle.frame = Math.min(particle.def.numFrames - 1, particle.frame)
            }
        }

        var oldPos = particle.pos;
        var pg = particle.gravity;
        var pv = particle.velocity;
        var pp = particle.pos;
        var pd = particle.delta;

        pv[0] += pg[0] * dt;
        pv[1] += pg[1] * dt;
        pv[2] += pg[2] * dt;
        pp[0] = pp[0] + pv[0] * dt;
        pp[1] = pp[1] + pv[1] * dt;
        pp[2] = pp[2] + pv[2] * dt;
        pd[0] = pp[0] - oldPos[0];
        pd[1] = pp[1] - oldPos[1];
        pd[2] = pp[2] - oldPos[2];

        // particle turbulence
        if (particle.def.turbulence) {
            var tMin = particle.def.turbulence[0];
            var tMax = particle.def.turbulence[1];
            var tx = Math.random() * (tMax[0] - tMin[0]) + tMin[0];
            var ty = Math.random() * (tMax[1] - tMin[1]) + tMin[1];
            var tz = Math.random() * (tMax[2] - tMin[2]) + tMin[2];
            pv[0] += tx;
            pv[1] += ty;
            pv[2] += tz;
        }

        // particle jitter
        if (particle.def.jitter) {
            var jMin = particle.def.jitter[0];
            var jMax = particle.def.jitter[1];
            var jx = Math.random() * (jMax[0] - jMin[0]) + jMin[0];
            var jy = Math.random() * (jMax[1] - jMin[1]) + jMin[1];
            var jz = Math.random() * (jMax[2] - jMin[2]) + jMin[2];
            pp[0] += jx;
            pp[1] += jy;
            pp[2] += jz;
        }
    };
};

RDGE.particleEmitter = function (def) {
    this.def = def;
    this.world = RDGE.mat4.identity();
    this.pbuffer = new RDGE.particleBuffer(this.def.particle, this, this.def.maxParticles);

    this.movers = new Array();
    var creatorFunc = particleMoverDefault;
    if (def.particle.moverFunc) {
        creatorFunc = eval(def.particle.moverFunc);
    }
    this.movers.push(new creatorFunc());

    this.localTime = 0.0;
    this.lastEmitTime = 0.0;
    this.emitCounter = 0;
    this.firstUpdate = true;

    this.attachToNode = function (node) {
        this.controller = node;
    };

    this.update = function (dt) {
        this.localTime += dt;
        if (this.firstUpdate) {
            this.lastEmitTime = this.localTime;
            this.firstUpdate = false;
        }

        if (this.def.emit != undefined && this.def.emit == false) {
            this.lastEmitTime = this.localTime - 1.0 / this.def.emitRate;
        }

        // this needs to be handled differently..
        var maxParticles = this.def.maxParticles;
        var emitOnce = this.def.emitOnce;
        var emitCount = (this.def.emit == undefined || this.def.emit == true) ? Math.floor((this.localTime - this.lastEmitTime) * this.def.emitRate) : 0;
        while (emitCount--) {
            if (emitOnce && this.emitCounter++ >= maxParticles) {
                break;
            }
            this.pbuffer.emit(this.world);
            this.lastEmitTime = this.localTime;
        }

        this.pbuffer.update(dt, this.movers);
    };
};

RDGE.particleSys = function (addr) {
    loaded = (typeof loaded == 'undefined') ? {} : loaded;

    this.def = null;
    this.node = null;
    this.world = RDGE.mat4.identity();
    this.emitters = {};

    // load particle system definition at addr
    this.init = function () {
        if (this.def == null) {
            return;
        }
        for (e in this.def.emitters) {
            this.emitters[e] = new RDGE.particleEmitter(this.def.emitters[e]);
        }

        this.bounds = {};
        this.bounds.min = RDGE.vec3.zero();
        this.bounds.max = RDGE.vec3.zero();
    };

    if (!loaded[addr]) {
        var request = new XMLHttpRequest();
        request.sender = this;

        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200 || window.location.href.indexOf("http") == -1) {
                    request.sender.def = eval("(" + request.responseText + ")"); //retrieve result as an JavaScript object
                    loaded[addr] = request.sender.def;
                    request.sender.init();
                }
                else {
                    alert("An error has occured loading particle system.");
                }
            }
        }

        request.open("GET", addr, true);
        request.send(null);
    } else {
        this.def = loaded[addr];
        this.init();
    }

    this.update = function (dt) {
        if (this.def == null) {
            return;
        }

        var bmin = this.bounds.min;
        var bmax = this.bounds.max;

        bmin[0] = 1e10;
        bmin[1] = 1e10;
        bmin[2] = 1e10;

        bmax[0] = -1e10;
        bmax[1] = -1e10;
        bmax[2] = -1e10;

        var parent = this.node ? this.node.world : this.world;
        for (em in this.emitters) {
            var emitter = this.emitters[em];
            emitter.world = parent;
            emitter.update(dt);

            var emin = emitter.pbuffer.bounds.min;
            var emax = emitter.pbuffer.bounds.max;

            // calculate a bounds that fits all particles.
            if (emin[0] < bmin[0]) { bmin[0] = emin[0]; }
            if (emin[1] < bmin[1]) { bmin[1] = emin[1]; }
            if (emin[2] < bmin[2]) { bmin[2] = emin[2]; }
            if (emax[0] > bmax[0]) { bmax[0] = emax[0]; }
            if (emax[1] > bmax[1]) { bmax[1] = emax[1]; }
            if (emax[2] > bmax[2]) { bmax[2] = emax[2]; }
        }
    };

    this.render = function () {
        if (this.def == null) {
            return;
        }
        for (em in this.emitters) {
            var pbuffer = this.emitters[em].pbuffer;
            pbuffer.render();
        }
    };

    this.attachToNode = function (node) {
        this.node = node;
    };
};

RDGE.g_particleSystemManager = new RDGE.objectManager();
RDGE.g_particleSystemManager.update = function (dt) {
    var i = this.objects.length - 1;
    while (i >= 0) {
        var psys = this.objects[i];
        if (psys) {
            psys.update(dt);
        }
        i--;
    }
};

RDGE.g_particleSystemManager.render = function (dt) {
    var i = 0;
    while (i < this.objects.length) {
        var psys = this.objects[i];
        if (psys) {
            psys.render();
        }
        i++;
    }
};

