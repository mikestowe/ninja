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
/*
 * camera class
 */
var RDGE = RDGE || {};

RDGE.camera = function () {
    this.proj = RDGE.mat4.identity();
    this.view = RDGE.mat4.identity();
    this.world = RDGE.mat4.identity();
    this.viewProj = RDGE.mat4.identity();
    this.invViewProj = RDGE.mat4.identity();
    this.frustum = [];
    this.frustumPts = [];
    this.controller = null;

    this.setPerspective = function (fov, aratio, near, far) {
        this.ortho = null;
        this.persp = {};
        this.persp.fov = fov;
        this.persp.aratio = aratio;
        this.persp.near = near;
        this.persp.far = far;
        this.proj = RDGE.mat4.perspective(fov, aratio, near, far);
        this.recalc();
    };

    this.reset = function () {
        this.world = RDGE.mat4.identity();
        this.recalc();
    };

    this.copy = function (cam) {
        RDGE.mat4.inplace_copy(this.view, cam.view);
        RDGE.mat4.inplace_copy(this.world, cam.world);
        RDGE.mat4.inplace_copy(this.proj, cam.proj);
        RDGE.mat4.inplace_copy(this.viewProj, cam.viewProj);
        RDGE.mat4.inplace_copy(this.invViewProj, cam.invViewProj);
        this.frustum = cam.frustum.slice();
        this.frustumPts = cam.frustumPts.slice();
    };

    this.recalc = function () {
        // update frustum planes
        this.frustum = [];
        var vp = this.viewProj;

        normalizePlane = function (p) {
            var len = RDGE.vec3.length(p);
            if (Math.abs(1.0 - len) > 0.001) {
                p[0] /= len;
                p[1] /= len;
                p[2] /= len;
                p[3] /= len;
            }
            return p;
        };

        /* This is the old way
        var t = this.persp.near * Math.tan(0.017453292519943295769236 * this.persp.fov * 0.5);
        var r = t * this.persp.aratio;
        var u = t;
        var l = -r;
        var b = -u;

        tview = RDGE.mat4.transpose(this.view);
        this.frustum.push( normalizePlane( RDGE.mat4.transformPoint(tview, [this.persp.near, 0.0, l, 0.0] ) ) );     // left
        this.frustum.push( normalizePlane( RDGE.mat4.transformPoint(tview, [-this.persp.near, 0.0, -r, 0.0] ) ) );   // right
        this.frustum.push( normalizePlane( RDGE.mat4.transformPoint(tview, [0.0, this.persp.near, b, 0.0] ) ) );     // bottom
        this.frustum.push( normalizePlane( RDGE.mat4.transformPoint(tview, [0.0, -this.persp.near, -u, 0.0] ) ) );   // top
        this.frustum.push( normalizePlane( RDGE.mat4.transformPoint(tview, [0.0, 0.0, -1.0, -this.persp.near] ) ) ); // near
        this.frustum.push( normalizePlane( RDGE.mat4.transformPoint(tview, [0.0, 0.0, 1.0, this.persp.far] ) ) );    // far
        */
        var l = normalizePlane([vp[3] + vp[0], vp[7] + vp[4], vp[11] + vp[8], vp[15] + vp[12]]);
        var r = normalizePlane([vp[3] - vp[0], vp[7] - vp[4], vp[11] - vp[8], vp[15] - vp[12]]);
        var t = normalizePlane([vp[3] - vp[1], vp[7] - vp[5], vp[11] - vp[9], vp[15] - vp[13]]);
        var b = normalizePlane([vp[3] + vp[1], vp[7] + vp[5], vp[11] + vp[9], vp[15] + vp[13]]);
        var n = normalizePlane([vp[3] + vp[2], vp[7] + vp[6], vp[11] + vp[10], vp[15] + vp[14]]);
        var f = normalizePlane([vp[3] - vp[2], vp[7] - vp[6], vp[11] - vp[10], vp[15] - vp[14]]);

        this.frustum.push(l);
        this.frustum.push(r);
        this.frustum.push(t);
        this.frustum.push(b);
        this.frustum.push(n);
        this.frustum.push(f);

        // update frustum points
        this.frustumPts = [];
        var invvp = this.viewProj;
        this.frustumPts.push(RDGE.mat4.transformPoint(invvp, [-1, -1, -1]));
        this.frustumPts.push(RDGE.mat4.transformPoint(invvp, [-1, 1, -1]));
        this.frustumPts.push(RDGE.mat4.transformPoint(invvp, [1, 1, -1]));
        this.frustumPts.push(RDGE.mat4.transformPoint(invvp, [1, -1, -1]));
        this.frustumPts.push(RDGE.mat4.transformPoint(invvp, [-1, -1, 1]));
        this.frustumPts.push(RDGE.mat4.transformPoint(invvp, [-1, 1, 1]));
        this.frustumPts.push(RDGE.mat4.transformPoint(invvp, [1, 1, 1]));
        this.frustumPts.push(RDGE.mat4.transformPoint(invvp, [1, -1, 1]));
    };

    this.setWorld = function (m) {
        this.world = m;
        this.view = RDGE.mat4.inverse(m);
        this.viewProj = RDGE.mat4.mul(this.view, this.proj);
        this.invViewProj = RDGE.mat4.inverse(this.viewProj);
        this.recalc();
    };

    this.setView = function (m) {
        this.view = m;
        this.world = RDGE.mat4.inverse(m);
        this.viewProj = RDGE.mat4.mul(this.view, this.proj);
        this.invViewProj = RDGE.mat4.inverse(this.viewProj);
        this.recalc();
    };

    this.setLookAt = function (eyePos, targetPos, upVec) {
        this.setWorld(RDGE.mat4.lookAt(eyePos, targetPos, upVec));
        //this.recalc();
    };

    this.setPerspective = function (fov, aratio, near, far) {
        this.ortho = null;
        this.persp = {};
        this.persp.fov = fov;
        this.persp.aratio = aratio;
        this.persp.near = near;
        this.persp.far = far;
        this.proj = RDGE.mat4.perspective(fov, aratio, near, far);
        this.recalc();
    };

    this.setOrthographic = function (l, r, t, b, n, f) {
        this.persp = null;
        this.ortho = {};
        this.ortho.left = l;
        this.ortho.right = r;
        this.ortho.top = t;
        this.ortho.bottom = b;
        this.ortho.near = n;
        this.ortho.far = f;
        this.proj = RDGE.mat4.orthographic(l, r, t, b, n, f);
        this.recalc();
    };

    this.onResize = function (x, y, width, height) {
        if (this.persp) {
            this.setPerspective(this.persp.fov, width / height, this.persp.near, this.persp.far);
        }
        if (this.ortho) {
            this.setOrthographic(x, x + width, y, y + height, this.ortho.near, this.ortho.far);
        }
    };

    this.zNear = function () {
        if (this.persp) {
            return this.persp.near;
        }

        if (this.ortho) {
            return this.ortho.near;
        }

        return 0.0;
    };

    this.zFar = function () {
        if (this.persp) {
            return this.persp.far;
        }

        if (this.ortho) {
            return this.ortho.far;
        }

        return 0.0;
    };

    // this is used by ambient occlusion...
    this.getFTR = function () {
        var fovyRad = (this.persp.fov * 0.5) * Math.PI / 180.0;
        return [
        Math.tan(fovyRad) * this.persp.far,
        Math.tan(fovyRad / this.persp.aratio) * this.persp.far,
        this.persp.far];
    };

    this.attachCameraToNode = function (node) {
        this.controller = node;
    };
};


/** Camera Manager
 * This class is used to manage the active camera. It provides functionality
 * for getting and setting the active camera, as well as providing stack operations
 * to switch to and from multiple cameras.
 */
RDGE.cameraManager = function () {
    this.stack = [];

    /* Set the active camera.
    * This function sets the active camera to the given camera.
    */
    this.setActiveCamera = function (c) {
        // pop the active camera off the stack.
        if (this.stack.length > 0) {
            this.stack.pop();
        }
        // push the given camera onto the stack.
        this.stack.push(c);
    };

    /* Get the active camera.
    * The active camera always resides at the top of the stack.
    */
    this.getActiveCamera = function () {
        if (this.stack.length > 0) {
            return this.stack[this.stack.length - 1];
        } else {
            return null;
        }
    };

    /* Push a camera onto the stack.
    * The given camera becomes the active camera.
    */
    this.pushCamera = function (c) {
        this.stack.push(c);
    };

    /* Pop a camera off the stack.
    * Returns the camera that was popped.
    * The next camera on the stack becomes active.
    */
    this.popCamera = function () {
        return this.stack.pop();
    };

    this.onResize = function (x, y, w, h) {
        var i = this.stack.length - 1;
        while (i >= 0) {
            this.stack[i].onResize(x, y, w, h);
            i--;
        }
    };
};
