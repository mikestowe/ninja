/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var RDGE = RDGE || {};

// render flags, handles, states
RDGE.g_whiteTex = null;
RDGE.g_blackTex = null;
RDGE.g_blueTex = null;

/* These objects appear to be unused so they are currently commented out
RDGE.RDGEWebTexture = function () {
    this.handle;  // gl handle
    this.unit;    // the texture slot/unit
    this.type = RDGE.UNIFORMTYPE.TEXTURE2D;
};

RDGE.RDGEWebUniformPair = function (uniform, value, type) {
    this.uniform = uniform;
    this.value = value;
    this.type = type;
};


// pass a function that takes no parameters
RDGE.defaultState = function () {
    return [function () { gl.disable(gl.CULL_FACE) },
        function () { gl.enable(gl.DEPTH_TEST) } ]
};
*/

// this chunk of data contains uniform storage references set the data with RDGEUniform.set (ie RDGEUniform.set("u_name", RDGE.UNIFORMTYPE.FLOAT4, myData); )
RDGE.CreateMasterList = function () {
    _MasterUniformList =
  [
    { 'uniform': projMatrixUniform = 0, 'name': "u_projMatrix", 'type': RDGE.UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': mvMatrixUniform = 0, 'name': "u_mvMatrix", 'type': RDGE.UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': normalMatrixUniform = 0, 'name': "u_normalMatrix", 'type': RDGE.UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': worldMatrixUniform = 0, 'name': "u_worldMatrix", 'type': RDGE.UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': lightPos = 0, 'name': "u_lightPos", 'type': RDGE.UNIFORMTYPE.FLOAT3, 'value': new Float32Array(3) },
    { 'uniform': lightDiff = 0, 'name': "u_lightDiff", 'type': RDGE.UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': lightAmb = 0, 'name': "u_lightAmb", 'type': RDGE.UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': colMap = 0, 'name': "colMap", 'type': RDGE.UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) },
    { 'uniform': envMap = 0, 'name': "envMap", 'type': RDGE.UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) },
    { 'uniform': normalMap = 0, 'name': "normalMap", 'type': RDGE.UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) },
    { 'uniform': glowMap = 0, 'name': "glowMap", 'type': RDGE.UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) },
    { 'uniform': matAmbient = 0, 'name': "u_matAmbient", 'type': RDGE.UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': matDiffuse = 0, 'name': "u_matDiffuse", 'type': RDGE.UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': matSpecular = 0, 'name': "u_matSpecular", 'type': RDGE.UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': matShininess = 0, 'name': "u_matShininess", 'type': RDGE.UNIFORMTYPE.FLOAT, 'value': new Float32Array(1) },
    { 'uniform': matEmission = 0, 'name': "u_matEmission", 'type': RDGE.UNIFORMTYPE.FLOAT, 'value': new Float32Array(4) },
    { 'uniform': frustumFarZ = 0, 'name': "u_frustumFarZ", 'type': RDGE.UNIFORMTYPE.FLOAT, 'value': new Float32Array(1) },
    { 'uniform': shadowLightWorld = 0, 'name': "u_shadowLightWorld", 'type': RDGE.UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': shadowBiasMatrix = 0, 'name': "u_shadowBiasMatrix", 'type': RDGE.UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': vShadowLight = 0, 'name': "u_vShadowLight", 'type': RDGE.UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': depthMap = 0, 'name': "depthMap", 'type': RDGE.UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) }
  ];

    return _MasterUniformList;
};

RDGE.RDGEUniformInit = function () {
    this.uniformList = RDGE.CreateMasterList();
    this.uniformMap = [];
    for (var idx = 0; idx < this.uniformList.length; ++idx) {
        this.uniformMap[this.uniformList[idx].name] = this.uniformList[idx];
    }
};

RDGE.RDGEUniformInit.prototype.SetUni = function (name, _value) {
    //this.uniformMap[name].value.set(_value);

    this.uniformMap[name].value = _value;
};

// Globally available uniform storage
RDGE.RDGEUniform = new RDGE.RDGEUniformInit();

RDGE.RenderContext = function () {
    this.shaderProg = null;
    this.uniforms = [];
    this.textureList = [];
    this.curRenderProc = null;
    this.light0Color = [1, 1, 1, 0];
    this.parentID = 0;
    this.world = RDGE.mat4.identity();
    this.hide = false;
    enableNormalMapping = true;
    this.lights = [null, null, null, null];

    // state settings - set functions in the array that set states or 'other' so long as it makes since
    this.stateSettings = [];
};

RDGE.RenderContext.prototype.Load = function (ctx) {
    this.shaderProg = ctx.shaderProg;
    this.uniforms = ctx.uniforms.slice();
    this.textureList = ctx.textureList.slice();
    this.stateSettings = ctx.stateSettings.slice();
    this.curRenderProc = ctx.curRenderProc;
    this.light0Color = ctx.light0Color.slice();
    this.parentID = ctx.parentID;
    this.world = RDGE.mat4.copy(ctx.world);
    this.lights = ctx.lights.slice();

    // the camera
    this.cam = this.cam;

    // state settings - set functions in the array that set states or 'other' so long as it makes since
    this.stateSettings = this.stateSettings.slice();
};

RDGE.__lastInited = []; // keep list of initialized shaders

RDGE._SetShader = function (program) {
    gl.useProgram(program);

    if (RDGE.__lastInited[program.shaderID] === undefined) {
        RDGE.__lastInited[program.shaderID] = true;
        // init the uniforms
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);

        var deleteMe = [];
        for (var uniIndex = 0; uniIndex < program.RDGEUniform.uniformList.length; uniIndex++) {

            var handle = gl.getUniformLocation(program, program.RDGEUniform.uniformList[uniIndex].name);
            if (handle)
                program.RDGEUniform.uniformList[uniIndex].uniform = handle;
            else {
                program.RDGEUniform.uniformList.splice(uniIndex, 1);
                uniIndex = Math.max(uniIndex - 1, 0);
            }
        }
    }
}

// take a parameterless function
RDGE.RenderContext.prototype.AddStateSetting = function (functor) {
    this.stateSettings.push(functor);
};

// take a parameterless function
RDGE.RenderContext.prototype.Apply = function () {

    // set shader program to use
    shaderProg = null;
    if (this.shaderProg != null) {
        RDGE._SetShader(this.shaderProg);
        shaderProg = this.shaderProg;
    }
    else {
        RDGE._SetShader(RDGE.globals.engine.defaultContext.shaderProg);
        shaderProg = RDGE.globals.engine.defaultContext.shaderProg;
    }

    // set shader values (name/uniform pair must be in the master list)

    if (this.uniforms.length > 0) {
        for (var idx = 0; idx < this.uniforms.length; ++idx) {
            shaderProg.RDGEUniform.SetUni(this.uniforms[idx].name, this.uniforms[idx].value);
        }
    }

    // set the diffuse color
    shaderProg.RDGEUniform.SetUni("u_lightDiff", this.light0Color);


    for (var setIdx = 0; setIdx < this.stateSettings.length; ++setIdx) {
        // call state funcs
        this.stateSettings[setIdx]();
    }

    this.bindTextures();
};

RDGE.RenderContext.prototype.bindTextures = function () {

    var ctx = RDGE.globals.engine.getContext().renderer.ctx;
    //  gl.activeTexture(gl.TEXTURE0);
    //  gl.bindTexture(gl.TEXTURE_CUBE_MAP, RDGE.g_whiteTex);
    //  gl.activeTexture(gl.TEXTURE0);
    //  gl.bindTexture(gl.TEXTURE_2D, RDGE.g_whiteTex);

    //  gl.activeTexture(gl.TEXTURE2);
    //  gl.bindTexture(gl.TEXTURE_CUBE_MAP, RDGE.g_blueTex);
    //  gl.activeTexture(gl.TEXTURE2);
    //  gl.bindTexture(gl.TEXTURE_2D, RDGE.g_blueTex);

    //  gl.activeTexture(gl.TEXTURE3);
    //  gl.bindTexture(gl.TEXTURE_CUBE_MAP, RDGE.g_blackTex);
    //  gl.activeTexture(gl.TEXTURE3);
    //  gl.bindTexture(gl.TEXTURE_2D, RDGE.g_blackTex);

    for (var uniIndex = 0; uniIndex < this.textureList.length; uniIndex++) {
        var bind = this.textureList[uniIndex];

        switch (bind.type) {
            case RDGE.UNIFORMTYPE.TEXTURE2D:
                ctx.activeTexture(ctx.TEXTURE0 + bind.unit);
                ctx.bindTexture(ctx.TEXTURE_2D, bind.handle);
                break;
            case RDGE.UNIFORMTYPE.TEXTURECUBE:
                ctx.activeTexture(ctx.TEXTURE0 + bind.unit);
                ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, bind.handle);
                break;
            default:
                //        gl.console.log("!!!! - trying to bind unknown texture type");
                break;
        }
    }

    if (!enableNormalMapping) {
        ctx.activeTexture(ctx.TEXTURE2);
        ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, RDGE.g_blueTex);
        ctx.activeTexture(ctx.TEXTURE2);
        ctx.bindTexture(ctx.TEXTURE_2D, RDGE.g_blueTex);
    }
};

RDGE.funcmap = {};

RDGE.funcmap[RDGE.UNIFORMTYPE.INT] = function (a, b) {
    gl.uniform1iv(a, b);
};
RDGE.funcmap[RDGE.UNIFORMTYPE.FLOAT] = function (a, b) {
    gl.uniform1fv(a, b);
};
RDGE.funcmap[RDGE.UNIFORMTYPE.FLOAT2] = function (a, b) {
    gl.uniform2fv(a, b);
};
RDGE.funcmap[RDGE.UNIFORMTYPE.FLOAT3] = function (a, b) {
    gl.uniform3fv(a, b);
};
RDGE.funcmap[RDGE.UNIFORMTYPE.FLOAT4] = function (a, b) {
    gl.uniform4fv(a, b);
};
RDGE.funcmap[RDGE.UNIFORMTYPE.MATRIX3] = function (a, b) {
    gl.uniformMatrix3fv(a, false, b);
};
RDGE.funcmap[RDGE.UNIFORMTYPE.MATRIX4] = function (a, b) {
    gl.uniformMatrix4fv(a, false, b);
};
RDGE.funcmap[RDGE.UNIFORMTYPE.TEXTURE2D] = function (a, b) {
    gl.activeTexture(gl.TEXTURE0 + b);
    gl.uniform1iv(a, b);
};
RDGE.funcmap[RDGE.UNIFORMTYPE.TEXTURECUBE] = function (a, b) {
    gl.activeTexture(gl.TEXTURE0 + b);
    gl.uniform1iv(a, b);
};

RDGE._bindUniforms = function (shaderProg) {
    var len = shaderProg.RDGEUniform.uniformList.length;
    var uniforms = shaderProg.RDGEUniform.uniformList;

    for (var uniIndex = 0; uniIndex < len; uniIndex++) {
        var bind = uniforms[uniIndex];
        RDGE.funcmap[bind.type](bind.uniform, bind.value);
    }
};
