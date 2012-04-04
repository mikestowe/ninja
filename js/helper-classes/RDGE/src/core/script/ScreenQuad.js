/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// RDGE namespaces
var RDGE = RDGE || {};

RDGE.ScreenQuad = function (texture) {
    this.vertBuffer = null;
    this.uvBuffer = null;
    this.texture = texture;
    this.shader = null;
    this.renderObj = null;
};

RDGE.ScreenQuad.prototype.initialize = function (initProc, shaderOpt) {
    initProc(this, shaderOpt);
};

RDGE.ScreenQuad.prototype.setTexture = function (texture) {
    this.texture = texture;
};


RDGE.ScreenQuad.prototype.render = function (renderProc) {
    renderProc(this);
};