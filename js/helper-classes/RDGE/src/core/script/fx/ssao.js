/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


/**
 * Implements SSAO.
 * See http://www.gamedev.net/page/resources/_/reference/programming/140/lighting-and-shading/a-simple-and-practical-approach-to-ssao-r2753
 * @param v2ScreenSize - size of the viewport in window coordinates
 */
function fxSSAO(enHRDepth)
{
  function renderInitSSAO(quad)
  {
    quad.shader = createShader(gl, 'ssao_vshader', enHRDepth ? 'ssaohr_fshader' : 'ssao_fshader', [ "vert", "texcoord"]);
    quad.renderObj = new RenderObject(quad.shader);

    var quadBuf = getScreenAlignedQuad();
    quad.vertBuffer = quadBuf.vertexObject;
    quad.uvBuffer = quadBuf.texCoordObject;

    quad.renderObj.addTexture("sColMap", 0, UNIFORMTYPE.TEXTURE2D);
    quad.renderObj.addTexture("sNormDepthMap", 1, UNIFORMTYPE.TEXTURE2D);
    quad.renderObj.addTexture("sRandMap", 2, UNIFORMTYPE.TEXTURE2D);
    if (enHRDepth)
      quad.renderObj.addTexture("sHRDepthMap", 3, UNIFORMTYPE.TEXTURE2D);

    quad.renderObj.addBuffers(quad.vertBuffer, gl.ARRAY_BUFFER, 3, 0, gl.FLOAT);
    quad.renderObj.addBuffers(quad.uvBuffer, gl.ARRAY_BUFFER, 2, 2, gl.FLOAT);
  }
  
  // Load random normal texture
  this.randTexture = createTexture(gl, g_Engine._assetPath+"images/random_normal.png");
  gl.bindTexture(gl.TEXTURE_2D, this.randTexture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);

  // Whether or not to use a high res depth texture
  this.enHRDepth = enHRDepth;

  // Quad for full screen pass
  this.ssaoQuad = new ScreenQuad(null);
  this.ssaoQuad.initialize(renderInitSSAO);

  // Set up uniforms
  var activeCam = g_cameraManager.getActiveCamera();
  this.v3FrustumFLT = activeCam.getFTR();
  this.ssaoQuad.renderObj.addUniform("u_frustumFLT", this.v3FrustumFLT, UNIFORMTYPE.FLOAT3);

  this.v4ArtVals = [1.0, 1.0, 1.0, 1.0];
  this.ssaoQuad.renderObj.addUniform("u_artVals", this.v4ArtVals, UNIFORMTYPE.FLOAT4);

  this.fRandMapSize = 64.0;
  this.ssaoQuad.renderObj.addUniform("u_randMapSize", this.fRandMapSize, UNIFORMTYPE.FLOAT);

  this.v2ScreenSize = [1024, 1024];
  this.ssaoQuad.renderObj.addUniform("u_screenSize", this.v2ScreenSize, UNIFORMTYPE.FLOAT2);
}

/**
 * Contributes SSAO to the passed offscreen surface, rendering to another surface.
 * See http://www.gamedev.net/page/resources/_/reference/programming/140/lighting-and-shading/a-simple-and-practical-approach-to-ssao-r2753
 * @param srcTexColor - color surface of rendered scene
 * @param srcTexNormDepth - screenspace normal+depth surface for scene; {nx, ny, nz, depth}
 * @param dstRenderTarget - where to put the result of SSAO
 * @param sampleRadius - 
 * @param intensity - 
 * @param distScale - 
 * @param bias - 
 */
fxSSAO.prototype.doSSAO = function(srcTexColor, srcTexNormDepth, srcTexHRDepth, dstRenderTarget, sampleRadius, intensity, distScale, bias)
{
  // Set art params and other uniforms
  this.v4ArtVals[0] = sampleRadius;
  this.v4ArtVals[1] = intensity;
  this.v4ArtVals[2] = distScale;
  this.v4ArtVals[3] = bias;

  this.v2ScreenSize[0] = dstRenderTarget ? dstRenderTarget.frameBuffer.width : g_width;
  this.v2ScreenSize[1] = dstRenderTarget ? dstRenderTarget.frameBuffer.height : g_height;

  // Do ssao
  gl.bindFramebuffer(gl.FRAMEBUFFER, dstRenderTarget ? dstRenderTarget.frameBuffer : null);
 // gl.viewport(0, 0, 99999, 99999);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.disable(gl.DEPTH_TEST);

  gl.useProgram(this.ssaoQuad.shader);

  this.ssaoQuad.renderObj.bindBuffers();
  this.ssaoQuad.renderObj.bindTextures();
  this.ssaoQuad.renderObj.bindUniforms();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, srcTexColor);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, srcTexNormDepth);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, this.randTexture);
  if (this.enHRDepth) {
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, srcTexHRDepth);
  }
  gl.activeTexture(gl.TEXTURE0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(null);

  return dstRenderTarget;
}
