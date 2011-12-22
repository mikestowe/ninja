/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


/**
 * Implements a 5x5 blur.
 * See http://prideout.net/archive/bloom/
 * @param mipSizes - up to three pow2 mip sizes to be separately blurred
 *          and combined with the src image, e.g. [256,128,64]
 * @param enAuxTexture - true to enable an extra texture to be added to 
 *          the weighted blur mips (see doBlur)
 */
function fxBlur(mipSizes, enAuxTexture)
{
  var separableBlurCombine_fshader = [
    "#ifdef GL_ES",
      "precision highp float;",
    "#endif",
    
    "varying vec2 vTexcoord;", // base tex coord
    "uniform vec4 vWeights;",  // blend weights

    enAuxTexture ? "uniform sampler2D sTextureAux;" : "", // aux image (unweighted)
                   "uniform sampler2D sTexture1;",        // source texture #1
    mipSizes[0]  ? "uniform sampler2D sTexture2;" : "",   // source texture #2
    mipSizes[1]  ? "uniform sampler2D sTexture3;" : "",   // source texture #3
    mipSizes[2]  ? "uniform sampler2D sTexture4;" : "",   // source texture #4

    "void main()",
    "{",
      "vec4 blurCol = vWeights.x * texture2D(sTexture1, vTexcoord, -32.0);",
      mipSizes[0]  ? "blurCol += vWeights.y * texture2D(sTexture2, vTexcoord, -32.0);" : "",
      mipSizes[1]  ? "blurCol += vWeights.z * texture2D(sTexture3, vTexcoord, -32.0);" : "",
      mipSizes[2]  ? "blurCol += vWeights.w * texture2D(sTexture4, vTexcoord, -32.0);" : "",
    
      enAuxTexture ? "gl_FragColor = texture2D(sTextureAux, vTexcoord, -32.0) + blurCol;" : "gl_FragColor = blurCol;",
    "}"

    ].join("\n");


  function renderInitBlur(quad)
  {
    quad.shader = createShader(gl, 'separableBlur_vshader', 'separableBlur_fshader', [ "vert", "texcoord"]);
    quad.renderObj = new RenderObject(quad.shader);

    quad.vertBuffer = quadBuf.vertexObject;
    quad.uvBuffer = quadBuf.texCoordObject;

    quad.renderObj.addTexture("sTexture", 0, UNIFORMTYPE.TEXTURE2D);

    quad.renderObj.addBuffers(quad.vertBuffer, gl.ARRAY_BUFFER, 3, 0, gl.FLOAT);
    quad.renderObj.addBuffers(quad.uvBuffer, gl.ARRAY_BUFFER, 2, 2, gl.FLOAT);
  }

  function renderInitCombine(quad)
  {
    quad.shader = createShader(gl, 'separableBlur_vshader', separableBlurCombine_fshader, [ "vert", "texcoord"]);
    quad.renderObj = new RenderObject(quad.shader);

    quad.vertBuffer = quadBuf.vertexObject;
    quad.uvBuffer = quadBuf.texCoordObject;

    quad.renderObj.addTexture("sTexture1",   0, UNIFORMTYPE.TEXTURE2D);
    quad.renderObj.addTexture("sTexture2",   1, UNIFORMTYPE.TEXTURE2D);
    quad.renderObj.addTexture("sTexture3",   2, UNIFORMTYPE.TEXTURE2D);
    quad.renderObj.addTexture("sTexture4",   3, UNIFORMTYPE.TEXTURE2D);
    quad.renderObj.addTexture("sTextureAux", 4, UNIFORMTYPE.TEXTURE2D);

    quad.renderObj.addBuffers(quad.vertBuffer, gl.ARRAY_BUFFER, 3, 0, gl.FLOAT);
    quad.renderObj.addBuffers(quad.uvBuffer, gl.ARRAY_BUFFER, 2, 2, gl.FLOAT);
  }

  // Screen aligned quad geometry
  var quadBuf = getScreenAlignedQuad();

  // Fbos for each mip level; two sets are used to pingpong horizontal and vertical blur
  mipSizes = mipSizes || [128, 64, 32];

  this.fboSet1 = [];
  this.fboSet2 = [];

  for(var i in mipSizes)
  {
    this.fboSet1.push(createRenderTargetTexture(mipSizes[i], mipSizes[i]));
    this.fboSet2.push(createRenderTargetTexture(mipSizes[i], mipSizes[i]));
  }

  // Blitter for downsampling
  this.blitQuad = new ScreenQuad(null);
  this.blitQuad.initialize(renderInitScreenQuad);

  // Blur shader
  this.blurQuad = new ScreenQuad(null);
  this.blurQuad.initialize(renderInitBlur);

  this.v3Kernel = [ 5.0 / 16.0, 6.0 / 16.0, 5.0 / 16.0 ];
  this.blurQuad.renderObj.addUniform("vCoeffs", this.v3Kernel, UNIFORMTYPE.FLOAT3);

  this.v2Offset  = vec2.zero();
  this.blurQuad.renderObj.addUniform("vOffset", this.v2Offset, UNIFORMTYPE.FLOAT2);

  // Combine/blend shader
  this.combineQuad = new ScreenQuad(null);
  this.combineQuad.initialize(renderInitCombine);
  
  this.v4Weights = [0.25, 0.25, 0.25, 0.25];
  this.combineQuad.renderObj.addUniform("vWeights", this.v4Weights, UNIFORMTYPE.FLOAT4);
}

/**
 * Blurs the passed render target.
 * See http://prideout.net/archive/bloom/
 * @param srcTexture - source image to blur
 * @param dstRenderTarget - where to put the result of the blur
 * @param weights - array of 4 blend weights for the blurred mip levels 
 *          levels in the form [srcTexture-weight, mip0-weight, 
 *          mip1-weight, mip2-weight]
 * @param auxTexture - null, else an extra texture to be added to the 
 *          weighted blur mips
 */
fxBlur.prototype.doBlur = function(srcTexture, dstRenderTarget, weights, auxTexture)
{
  // Set weights
  this.v4Weights[0] = (weights == undefined) ? 0.25 : weights[0];
  this.v4Weights[1] = (weights == undefined) ? 0.25 : weights[1];
  this.v4Weights[2] = (weights == undefined) ? 0.25 : weights[2];
  this.v4Weights[3] = (weights == undefined) ? 0.25 : weights[3];

  // Do horizontal blur of fbo set 1 into fbo set 2
  for (var i = 0, fboSrc, fboDst; (fboSrc = srcTexture) && (fboDst = this.fboSet2[i]); i++)
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboDst.frameBuffer);
    gl.viewport(0, 0, fboDst.frameBuffer.width, fboDst.frameBuffer.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);

    this.v2Offset[0] = 0.0;
    this.v2Offset[1] = 1.2 / fboDst.frameBuffer.width;

    this.blurQuad.texture = fboSrc;

    renderProcScreenQuad(this.blurQuad);
  }

  // Do vertical blur of fbo set 2 into fbo set 1
  for (var i = 0, fboSrc, fboDst; (fboSrc = this.fboSet2[i]) && (fboDst = this.fboSet1[i]); i++)
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboDst.frameBuffer);
    gl.viewport(0, 0, fboDst.frameBuffer.width, fboDst.frameBuffer.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);

    this.v2Offset[0] = 1.2 / fboDst.frameBuffer.width;
    this.v2Offset[1] = 0.0;

    this.blurQuad.texture = fboSrc;

    renderProcScreenQuad(this.blurQuad);
  }

  // Do a weighted combine of the textures in fbo set 1
  gl.bindFramebuffer(gl.FRAMEBUFFER, dstRenderTarget ? dstRenderTarget.frameBuffer : null);
  gl.viewport(0, 0, g_width, g_height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.disable(gl.DEPTH_TEST);

  gl.useProgram(this.combineQuad.shader);

  this.combineQuad.renderObj.bindBuffers();
  this.combineQuad.renderObj.bindTextures();
  this.combineQuad.renderObj.bindUniforms();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, srcTexture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, this.fboSet1[0]);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, this.fboSet1[1]);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, this.fboSet1[2]);
  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, auxTexture);
  gl.activeTexture(gl.TEXTURE0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(null);

  return dstRenderTarget;
}
