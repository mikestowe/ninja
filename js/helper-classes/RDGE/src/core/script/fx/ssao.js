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
RDGE.fx = RDGE.fx || {};

/**
* Implements SSAO.
* See http://www.gamedev.net/page/resources/_/reference/programming/140/lighting-and-shading/a-simple-and-practical-approach-to-ssao-r2753
* @param v2ScreenSize - size of the viewport in window coordinates
*/
RDGE.fx.fxSSAO = function (enHRDepth) {
    function renderInitSSAO(quad) {
        quad.shader = RDGE.createShader(RDGE.globals.gl, 'ssao_vshader', enHRDepth ? 'ssaohr_fshader' : 'ssao_fshader', ["vert", "texcoord"]);
        quad.renderObj = new RDGE.RenderObject(quad.shader);

        var quadBuf = getScreenAlignedQuad();
        quad.vertBuffer = quadBuf.vertexObject;
        quad.uvBuffer = quadBuf.texCoordObject;

        quad.renderObj.addTexture("sColMap", 0, RDGE.UNIFORMTYPE.TEXTURE2D);
        quad.renderObj.addTexture("sNormDepthMap", 1, RDGE.UNIFORMTYPE.TEXTURE2D);
        quad.renderObj.addTexture("sRandMap", 2, RDGE.UNIFORMTYPE.TEXTURE2D);
        if (enHRDepth)
            quad.renderObj.addTexture("sHRDepthMap", 3, RDGE.UNIFORMTYPE.TEXTURE2D);

        quad.renderObj.addBuffers(quad.vertBuffer, RDGE.globals.gl.ARRAY_BUFFER, 3, 0, RDGE.globals.gl.FLOAT);
        quad.renderObj.addBuffers(quad.uvBuffer, RDGE.globals.gl.ARRAY_BUFFER, 2, 2, RDGE.globals.gl.FLOAT);
    };

    // Load random normal texture
    this.randTexture = createTexture(RDGE.globals.gl, RDGE.globals.engine._assetPath + "images/random_normal.png");
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, this.randTexture);
    RDGE.globals.gl.texParameteri(RDGE.globals.gl.TEXTURE_2D, RDGE.globals.gl.TEXTURE_MIN_FILTER, RDGE.globals.gl.LINEAR);
    RDGE.globals.gl.texParameteri(RDGE.globals.gl.TEXTURE_2D, RDGE.globals.gl.TEXTURE_WRAP_S, RDGE.globals.gl.REPEAT);
    RDGE.globals.gl.texParameteri(RDGE.globals.gl.TEXTURE_2D, RDGE.globals.gl.TEXTURE_WRAP_T, RDGE.globals.gl.REPEAT);

    // Whether or not to use a high res depth texture
    this.enHRDepth = enHRDepth;

    // Quad for full screen pass
    this.ssaoQuad = new RDGE.ScreenQuad(null);
    this.ssaoQuad.initialize(renderInitSSAO);

    // Set up uniforms
    var activeCam = g_cameraManager.getActiveCamera();
    this.v3FrustumFLT = activeCam.getFTR();
    this.ssaoQuad.renderObj.addUniform("u_frustumFLT", this.v3FrustumFLT, RDGE.UNIFORMTYPE.FLOAT3);

    this.v4ArtVals = [1.0, 1.0, 1.0, 1.0];
    this.ssaoQuad.renderObj.addUniform("u_artVals", this.v4ArtVals, RDGE.UNIFORMTYPE.FLOAT4);

    this.fRandMapSize = 64.0;
    this.ssaoQuad.renderObj.addUniform("u_randMapSize", this.fRandMapSize, RDGE.UNIFORMTYPE.FLOAT);

    this.v2ScreenSize = [1024, 1024];
    this.ssaoQuad.renderObj.addUniform("u_screenSize", this.v2ScreenSize, RDGE.UNIFORMTYPE.FLOAT2);
};

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
RDGE.fx.fxSSAO.prototype.doSSAO = function (srcTexColor, srcTexNormDepth, srcTexHRDepth, dstRenderTarget, sampleRadius, intensity, distScale, bias) {
    // Set art params and other uniforms
    this.v4ArtVals[0] = sampleRadius;
    this.v4ArtVals[1] = intensity;
    this.v4ArtVals[2] = distScale;
    this.v4ArtVals[3] = bias;

    this.v2ScreenSize[0] = dstRenderTarget ? dstRenderTarget.frameBuffer.width : RDGE.globals.width;
    this.v2ScreenSize[1] = dstRenderTarget ? dstRenderTarget.frameBuffer.height : RDGE.globals.height;

    // Do ssao
    RDGE.globals.gl.bindFramebuffer(RDGE.globals.gl.FRAMEBUFFER, dstRenderTarget ? dstRenderTarget.frameBuffer : null);
    // gl.viewport(0, 0, 99999, 99999);
    RDGE.globals.gl.clear(RDGE.globals.gl.COLOR_BUFFER_BIT);

    RDGE.globals.gl.disable(RDGE.globals.gl.DEPTH_TEST);

    RDGE.globals.gl.useProgram(this.ssaoQuad.shader);

    this.ssaoQuad.renderObj.bindBuffers();
    this.ssaoQuad.renderObj.bindTextures();
    this.ssaoQuad.renderObj.bindUniforms();

    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE0);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, srcTexColor);
    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE1);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, srcTexNormDepth);
    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE2);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, this.randTexture);
    if (this.enHRDepth) {
        RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE3);
        RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, srcTexHRDepth);
    }
    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE0);

    RDGE.globals.gl.drawArrays(RDGE.globals.gl.TRIANGLES, 0, 6);

    RDGE.globals.gl.enable(RDGE.globals.gl.DEPTH_TEST);
    RDGE.globals.gl.useProgram(null);

    return dstRenderTarget;
};
