/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
    *	makes the light the current 'camera'
    */
    this.activate = function () {
        this.cameraManager.pushCamera(this);
    };

    /*
    *	restores the camera stack
    */
    this.deactivate = function () {
        this.cameraManager.popCamera();
    };
}
