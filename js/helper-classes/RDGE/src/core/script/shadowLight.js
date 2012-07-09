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

/*
* shadow light - a modified camera used to describe a shadow casting light
*/
RDGE.shadowLight = function () {
    // inherit from the base class
    this.inheritedFrom = RDGE.camera;
    this.inheritedFrom();

    // matrices needed for shadow projection
    this.invViewMatrix = RDGE.mat4.identity();
    this.mvpMatrix = RDGE.mat4.identity();

    // texture matrix
    this.shadowMatrix = RDGE.mat4.identity();
    this.shadowMatrix = RDGE.mat4.scale(this.shadowMatrix, [0.5, 0.5, 0.5]);
    this.shadowMatrix = RDGE.mat4.translate(this.shadowMatrix, [0.5, 0.5, 0.5]);

    // cached references
    this.renderer = null;
    this.cameraManager = null;

    // shadow bias offset
    this.shadowBias = 0.0195;

    this.init = function () {
        this.renderer = RDGE.globals.engine.getContext().renderer;
        this.cameraManager = this.renderer.cameraManager();
    };

    /*
    *   makes the light the current 'camera'
    */
    this.activate = function () {
        this.cameraManager.pushCamera(this);
    };

    /*
    *   restores the camera stack
    */
    this.deactivate = function () {
        this.cameraManager.popCamera();
    };
}
