/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// render flags, handles, states

var g_whiteTex = null;
var g_blackTex = null;
var g_blueTex = null;

function RDGEWebTexture()
{
  this.handle;  // gl handle
  this.unit;    // the texture slot/unit
  this.type = UNIFORMTYPE.TEXTURE2D;
}

function RDGEWebUniformPair(uniform, value, type) {
  this.uniform = uniform;
  this.value = value;
  this.type = type;
}


// pass a function that takes no parameters
function defaultState()
{
  return [  function(){gl.disable(gl.CULL_FACE)},
        function(){gl.enable(gl.DEPTH_TEST)}]
}
// this chunk of data contains uniform storage references set the data with RDGEUniform.set (ie RDGEUniform.set("u_name", UNIFORMTYPE.FLOAT4, myData); )
function CreateMasterList() {
  _MasterUniformList =
  [
    { 'uniform': projMatrixUniform = 0, 'name': "u_projMatrix", 'type': UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': mvMatrixUniform = 0, 'name': "u_mvMatrix", 'type': UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': normalMatrixUniform = 0, 'name': "u_normalMatrix", 'type': UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': worldMatrixUniform = 0, 'name': "u_worldMatrix", 'type': UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': lightPos = 0, 'name': "u_lightPos", 'type': UNIFORMTYPE.FLOAT3, 'value': new Float32Array(3) },
    { 'uniform': lightDiff = 0, 'name': "u_lightDiff", 'type': UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': lightAmb = 0, 'name': "u_lightAmb", 'type': UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': colMap = 0, 'name': "colMap", 'type': UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) },
    { 'uniform': envMap = 0, 'name': "envMap", 'type': UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) },
    { 'uniform': normalMap = 0, 'name': "normalMap", 'type': UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) },
    { 'uniform': glowMap = 0, 'name': "glowMap", 'type': UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) },
    { 'uniform': matAmbient = 0, 'name': "u_matAmbient", 'type': UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': matDiffuse = 0, 'name': "u_matDiffuse", 'type': UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': matSpecular = 0, 'name': "u_matSpecular", 'type': UNIFORMTYPE.FLOAT4, 'value': new Float32Array(4) },
    { 'uniform': matShininess = 0, 'name': "u_matShininess", 'type': UNIFORMTYPE.FLOAT, 'value': new Float32Array(1) },
    { 'uniform': matEmission = 0, 'name': "u_matEmission", 'type': UNIFORMTYPE.FLOAT, 'value': new Float32Array(4) },
    { 'uniform': frustumFarZ = 0, 'name': "u_frustumFarZ", 'type': UNIFORMTYPE.FLOAT, 'value': new Float32Array(1) },
    { 'uniform': shadowLightWorld = 0, 'name': "u_shadowLightWorld", 'type': UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': shadowBiasMatrix = 0, 'name': "u_shadowBiasMatrix", 'type': UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': vShadowLight = 0, 'name': "u_vShadowLight", 'type': UNIFORMTYPE.MATRIX4, 'value': new Float32Array(16) },
    { 'uniform': depthMap = 0, 'name': "depthMap", 'type': UNIFORMTYPE.TEXTURE2D, 'value': new Int32Array(1) }
  ];
  
  return _MasterUniformList;
}

function RDGEUniformInit()
{
  this.uniformList = CreateMasterList();
  this.uniformMap=[];
  for(var idx = 0; idx < this.uniformList.length; ++idx)
  {
    this.uniformMap[this.uniformList[idx].name] = this.uniformList[idx];
  }
}

RDGEUniformInit.prototype.SetUni = function(name, _value)
{
  //this.uniformMap[name].value.set(_value);

  this.uniformMap[name].value = _value;
}

// Globally available uniform storage
RDGEUniform = new RDGEUniformInit();


function RenderContext()
{

  this.shaderProg = null;
  this.uniforms =[];
  this.textureList =[];
  this.curRenderProc = null;
  this.light0Color = [1, 1, 1, 0];
  this.parentID = 0;
  this.world = mat4.identity();
  this.hide = false;
  enableNormalMapping=true;
  this.lights = [ null, null, null, null];
  
  // the camera
  this.cam;
  
  // state settings - set functions in the array that set states or 'other' so long as it makes since
  this.stateSettings = [];

}

RenderContext.prototype.Load = function(ctx)
{
  this.shaderProg = ctx.shaderProg;
  this.uniforms = ctx.uniforms.slice();
  this.textureList = ctx.textureList.slice();
  this.stateSettings = ctx.stateSettings.slice();
  this.curRenderProc = ctx.curRenderProc;
  this.light0Color = ctx.light0Color.slice();
  this.parentID = ctx.parentID;
  this.world = mat4.copy(ctx.world);
  this.lights = ctx.lights.slice();

  // the camera
  this.cam = this.cam;

  // state settings - set functions in the array that set states or 'other' so long as it makes since
  this.stateSettings = this.stateSettings.slice();
}


__lastInited = []; // keep list of initialized shaders

function _SetShader(program)
{
  gl.useProgram(program);

  if(__lastInited[program.shaderID] === undefined)
  {
    __lastInited[program.shaderID] = true;
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
RenderContext.prototype.AddStateSetting = function(functor)
{
  this.stateSettings.push(functor);
}

// take a parameterless function
RenderContext.prototype.Apply = function() {

  // set shader program to use
  shaderProg = null;
  if (this.shaderProg != null) {
    _SetShader(this.shaderProg);
    shaderProg = this.shaderProg;
  }
  else {
    _SetShader(g_Engine.defaultContext.shaderProg);
    shaderProg = g_Engine.defaultContext.shaderProg;
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


}

RenderContext.prototype.bindTextures = function() {

	var ctx = g_Engine.getContext().renderer.ctx;
//  gl.activeTexture(gl.TEXTURE0);
//  gl.bindTexture(gl.TEXTURE_CUBE_MAP, g_whiteTex);
//  gl.activeTexture(gl.TEXTURE0);
//  gl.bindTexture(gl.TEXTURE_2D, g_whiteTex);

//  gl.activeTexture(gl.TEXTURE2);
//  gl.bindTexture(gl.TEXTURE_CUBE_MAP, g_blueTex);
//  gl.activeTexture(gl.TEXTURE2);
//  gl.bindTexture(gl.TEXTURE_2D, g_blueTex);

//  gl.activeTexture(gl.TEXTURE3);
//  gl.bindTexture(gl.TEXTURE_CUBE_MAP, g_blackTex);
//  gl.activeTexture(gl.TEXTURE3);
//  gl.bindTexture(gl.TEXTURE_2D, g_blackTex);

  for (var uniIndex = 0; uniIndex < this.textureList.length; uniIndex++) {
    var bind = this.textureList[uniIndex];

    switch (bind.type) {
      case UNIFORMTYPE.TEXTURE2D:
        ctx.activeTexture(ctx.TEXTURE0 + bind.unit);
        ctx.bindTexture(ctx.TEXTURE_2D, bind.handle);
        break;
      case UNIFORMTYPE.TEXTURECUBE:
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
    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, g_blueTex);
    ctx.activeTexture(ctx.TEXTURE2);
    ctx.bindTexture(ctx.TEXTURE_2D, g_blueTex);
  }
};

var funcmap = {};
funcmap[UNIFORMTYPE.INT] = function(a, b) {gl.uniform1iv(a, b);};
funcmap[UNIFORMTYPE.FLOAT] = function(a, b) {gl.uniform1fv(a, b);};
funcmap[UNIFORMTYPE.FLOAT2] = function(a, b) {gl.uniform2fv(a, b);};
funcmap[UNIFORMTYPE.FLOAT3] = function(a, b) {gl.uniform3fv(a, b);};
funcmap[UNIFORMTYPE.FLOAT4] = function(a, b) {gl.uniform4fv(a, b);};
funcmap[UNIFORMTYPE.MATRIX3] = function(a, b) {gl.uniformMatrix3fv(a, false, b);};
funcmap[UNIFORMTYPE.MATRIX4] = function(a, b) {gl.uniformMatrix4fv(a, false, b);};
funcmap[UNIFORMTYPE.TEXTURE2D] = function(a, b) {
  gl.activeTexture(gl.TEXTURE0 + b);
  gl.uniform1iv(a, b);
};
funcmap[UNIFORMTYPE.TEXTURECUBE] = function(a, b) {
  gl.activeTexture(gl.TEXTURE0 + b);
  gl.uniform1iv(a, b);
};

function _bindUniforms(shaderProg) {
  var len = shaderProg.RDGEUniform.uniformList.length;
  var uniforms = shaderProg.RDGEUniform.uniformList;
  
  for (var uniIndex = 0; uniIndex < len; uniIndex++) {
    var bind = uniforms[uniIndex];
    funcmap[bind.type](bind.uniform, bind.value);
  }
};
