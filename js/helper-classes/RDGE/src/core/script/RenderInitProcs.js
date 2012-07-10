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

// RDGE namespaces
var RDGE = RDGE || {};

RDGE.renderInitProcDefault = function (primSet, vertexData) {
    var material = primSet.material;

    //push envMap tex
    material.tex.env.push(arrayPeek(material.shader).envMap);
    material.tex.envDiff.push(arrayPeek(material.shader).envDiff);

    gl.useProgram(arrayPeek(material.shader).shaderHandle);

    arrayPeek(material.renderObj).addTexture("layerMap1", 0, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("layerMap2", 1, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("colorMeMap1", 2, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("colorMeMap2", 3, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("envMap", 4, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("envDiff", 5, RDGE.UNIFORMTYPE.TEXTURE2D);

    arrayPeek(material.renderObj).addTexture("normalMap1", 15, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("normalMap2", 6, RDGE.UNIFORMTYPE.TEXTURE2D);

    arrayPeek(material.renderObj).addTexture("stickerMap0", 7, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("stickerMap1", 8, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("stickerMap2", 9, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("stickerMap3", 10, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("stickerMap4", 11, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("stickerMap5", 12, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("stickerMap6", 13, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addTexture("stickerMap7", 14, RDGE.UNIFORMTYPE.TEXTURE2D);

    arrayPeek(material.renderObj).addUniform("u_normalMatrix", gl.normalMatrix, RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_mvMatrix", gl.mvMatrix, RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_invMvMatrix", gl.invMvMatrix, RDGE.UNIFORMTYPE.MATRIX4);

    arrayPeek(material.renderObj).addUniform("u_stickerMatrix0", primSet.parentMesh.stickers[0], RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_stickerMatrix1", primSet.parentMesh.stickers[1], RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_stickerMatrix2", primSet.parentMesh.stickers[2], RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_stickerMatrix3", primSet.parentMesh.stickers[3], RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_stickerMatrix4", primSet.parentMesh.stickers[4], RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_stickerMatrix5", primSet.parentMesh.stickers[5], RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_stickerMatrix6", primSet.parentMesh.stickers[6], RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_stickerMatrix7", primSet.parentMesh.stickers[7], RDGE.UNIFORMTYPE.MATRIX4);

    arrayPeek(material.renderObj).addUniform("u_stickerPos0", primSet.parentMesh.stickersPos[0], RDGE.UNIFORMTYPE.FLOAT3);
    arrayPeek(material.renderObj).addUniform("u_stickerPos1", primSet.parentMesh.stickersPos[1], RDGE.UNIFORMTYPE.FLOAT3);
    arrayPeek(material.renderObj).addUniform("u_stickerPos2", primSet.parentMesh.stickersPos[2], RDGE.UNIFORMTYPE.FLOAT3);
    arrayPeek(material.renderObj).addUniform("u_stickerPos3", primSet.parentMesh.stickersPos[3], RDGE.UNIFORMTYPE.FLOAT3);
    arrayPeek(material.renderObj).addUniform("u_stickerPos4", primSet.parentMesh.stickersPos[4], RDGE.UNIFORMTYPE.FLOAT3);
    arrayPeek(material.renderObj).addUniform("u_stickerPos5", primSet.parentMesh.stickersPos[5], RDGE.UNIFORMTYPE.FLOAT3);
    arrayPeek(material.renderObj).addUniform("u_stickerPos6", primSet.parentMesh.stickersPos[6], RDGE.UNIFORMTYPE.FLOAT3);
    arrayPeek(material.renderObj).addUniform("u_stickerPos7", primSet.parentMesh.stickersPos[7], RDGE.UNIFORMTYPE.FLOAT3);

    arrayPeek(material.renderObj).addUniform("u_projMatrix", gl.perspectiveMatrix, RDGE.UNIFORMTYPE.MATRIX4);

    arrayPeek(material.renderObj).addUniform("u_fillColor1", material.fillColor[0], RDGE.UNIFORMTYPE.FLOAT4);
    arrayPeek(material.renderObj).addUniform("u_fillColor2", material.fillColor[1], RDGE.UNIFORMTYPE.FLOAT4);
    arrayPeek(material.renderObj).addUniform("u_skinColor", material.fillColor[2], RDGE.UNIFORMTYPE.FLOAT4);

    // debug---
    vertexData.vertexObject.name = "vertexObject";
    vertexData.normalObject.name = "normalObject";
    vertexData.texCoordObject.name = "texCoordObject";
    vertexData.indexObject.name = "indexObject";
    //----------

    arrayPeek(material.renderObj).addBuffers(vertexData.vertexObject, gl.ARRAY_BUFFER, 3, 0, gl.FLOAT);
    arrayPeek(material.renderObj).addBuffers(vertexData.normalObject, gl.ARRAY_BUFFER, 3, 1, gl.FLOAT);
    arrayPeek(material.renderObj).addBuffers(vertexData.texCoordObject, gl.ARRAY_BUFFER, 2, 2, gl.FLOAT);
    arrayPeek(material.renderObj).addBuffers(vertexData.indexObject, gl.ELEMENT_ARRAY_BUFFER);

    gl.useProgram(null);
    //     gl.console.log("Mesh Init done!");
};

RDGE.renderInitScreenQuad = function (quad, shader) {
    if (shader == undefined) {
        quad.shader = RDGE.createShader(gl, 'screenQuad_vShader', 'screenQuad_fShader', ["vert", "texcoord"]);
    }
    else {
        quad.shader = shader;
    }

    quad.renderObj = new RDGE.RenderObject(quad.shader);

    quadBuf = getScreenAlignedQuad();

    quad.vertBuffer = quadBuf.vertexObject;
    quad.uvBuffer = quadBuf.texCoordObject;


    quad.renderObj.addTexture("basemap", 0, RDGE.UNIFORMTYPE.TEXTURE2D);

    var invWidth = (RDGE.globals.width == 0.0) ? 0.0 : 1.0 / RDGE.globals.width, invHeight = (RDGE.globals.height == 0.0) ? 0.0 : 1.0 / RDGE.globals.height;
    quad.renderObj.addUniform("u_inv_viewport_width", invWidth, RDGE.UNIFORMTYPE.FLOAT);
    quad.renderObj.addUniform("u_inv_viewport_height", invHeight, RDGE.UNIFORMTYPE.FLOAT);

    quad.renderObj.addBuffers(quad.vertBuffer, gl.ARRAY_BUFFER, 3, 0, gl.FLOAT);
    quad.renderObj.addBuffers(quad.uvBuffer, gl.ARRAY_BUFFER, 2, 2, gl.FLOAT);
};

RDGE.renderInitProcDepthMap = function (renderObj) {
    renderObj.shader = g_depthShader.shaderHandle; //RDGE.createShader(gl, depthMapVShader, depthMapFShader, [ "vert", "normal", "texcoord"]);

    gl.useProgram(renderObj.shader);

    renderObj.addUniform("u_mvpLightMatrix", g_mainLight.mvpMatrix, RDGE.UNIFORMTYPE.MATRIX4);
    //renderObj.addUniform("u_mvpLightMatrixWTF",  g_mainLight.mvpMatrix, RDGE.UNIFORMTYPE.MATRIX4);
    // var uni = gl.getUniformLocation(renderObj.shader, "u_mvpLightMatrixWTF");
    //    renderObj.addUniform("u_WTF1",  g_lightMat[0], RDGE.UNIFORMTYPE.FLOAT4);
    //    renderObj.addUniform("u_WTF2",  g_lightMat[1], RDGE.UNIFORMTYPE.FLOAT4);
    //    renderObj.addUniform("u_WTF3",  g_lightMat[2], RDGE.UNIFORMTYPE.FLOAT4);
    //    renderObj.addUniform("u_WTF4",  g_lightMat[3], RDGE.UNIFORMTYPE.FLOAT4);
    //
    // since the uniform data references should not change we can just bind one time
    renderObj.bindUniforms();

    gl.useProgram(null);
};

RDGE.renderInitShadowReceiver = function (primSet, vertexData) {
    // setup passes
    primSet.shadowTarget = g_texMan.loadRenderTarget("shadowTarget", 256, 256);
    primSet.shadowTargetFinal = g_texMan.loadRenderTarget("shadowTargetFinal", 256, 256);
    primSet.screenQuad = new RDGE.ScreenQuad(primSet.shadowTargetFinal);
    primSet.screenQuad.initialize(RDGE.renderInitRadialBlur);

    // set the target as the shadow to get projcetd
    primSet.parentMesh.shadowToProject = primSet.shadowTarget;

    //mainSceneQuad   = new RDGE.ScreenQuad(primSet.shadowTarget);
    //mainSceneQuad.initialize(renderInitScreenQuad);

    var material = primSet.material;

    //push envMap tex
    material.tex.env.push(arrayPeek(material.shader).envMap);
    material.tex.envDiff.push(arrayPeek(material.shader).envDiff);

    gl.useProgram(arrayPeek(material.shader).shaderHandle);

    arrayPeek(material.renderObj).addTexture("shadowMap", 0, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addUniform("u_mvMatrix", gl.mvMatrix, RDGE.UNIFORMTYPE.MATRIX4);

    arrayPeek(material.renderObj).addUniform("u_projMatrix", gl.perspectiveMatrix, RDGE.UNIFORMTYPE.MATRIX4);

    arrayPeek(material.renderObj).addUniform("u_shadowBiasMatrix", g_mainLight.shadowMatrix, RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_vShadowLight", g_mainLight.view, RDGE.UNIFORMTYPE.MATRIX4);


    // debug---
    vertexData.vertexObject.name = "vertexObject";
    vertexData.normalObject.name = "normalObject";
    vertexData.texCoordObject.name = "texCoordObject";
    vertexData.indexObject.name = "indexObject";
    //----------

    arrayPeek(material.renderObj).addBuffers(vertexData.vertexObject, gl.ARRAY_BUFFER, 3, 0, gl.FLOAT);
    arrayPeek(material.renderObj).addBuffers(vertexData.normalObject, gl.ARRAY_BUFFER, 3, 1, gl.FLOAT);
    arrayPeek(material.renderObj).addBuffers(vertexData.texCoordObject, gl.ARRAY_BUFFER, 2, 2, gl.FLOAT);
    arrayPeek(material.renderObj).addBuffers(vertexData.indexObject, gl.ELEMENT_ARRAY_BUFFER);

    gl.useProgram(null);

    //RDGE.renderInitShadowProjection(primSet, vertexData);
};


RDGE.renderInitShadowProjection = function (primSet, vertexData) {
    var material = primSet.material;

    //push envMap tex
    //material.tex.env.push(arrayPeek(material.shader).envMap);
    //material.tex.envDiff.push(arrayPeek(material.shader).envDiff);

    gl.useProgram(arrayPeek(material.shader).shaderHandle);

    arrayPeek(material.renderObj).addTexture("shadowMap", 0, RDGE.UNIFORMTYPE.TEXTURE2D);
    arrayPeek(material.renderObj).addUniform("u_mvMatrix", gl.mvMatrix, RDGE.UNIFORMTYPE.MATRIX4);

    arrayPeek(material.renderObj).addUniform("u_projMatrix", gl.perspectiveMatrix, RDGE.UNIFORMTYPE.MATRIX4);

    arrayPeek(material.renderObj).addUniform("u_shadowBiasMatrix", g_mainLight.shadowMatrix, RDGE.UNIFORMTYPE.MATRIX4);
    arrayPeek(material.renderObj).addUniform("u_vShadowLight", g_mainLight.view, RDGE.UNIFORMTYPE.MATRIX4);


    // debug---
    vertexData.vertexObject.name = "vertexObject";
    vertexData.normalObject.name = "normalObject";
    vertexData.texCoordObject.name = "texCoordObject";
    vertexData.indexObject.name = "indexObject";
    //----------

    arrayPeek(material.renderObj).addBuffers(vertexData.vertexObject, gl.ARRAY_BUFFER, 3, 0, gl.FLOAT);
    arrayPeek(material.renderObj).addBuffers(vertexData.normalObject, gl.ARRAY_BUFFER, 3, 1, gl.FLOAT);
    arrayPeek(material.renderObj).addBuffers(vertexData.texCoordObject, gl.ARRAY_BUFFER, 2, 2, gl.FLOAT);
    arrayPeek(material.renderObj).addBuffers(vertexData.indexObject, gl.ELEMENT_ARRAY_BUFFER);


    gl.useProgram(null);
};

RDGE.renderInitRadialBlur = function(quad, shader) {
    if (shader == undefined) {
        quad.shader = RDGE.createShader(gl, 'radialBlur_vshader', 'radialBlur_fshader', ["vert", "texcoord"]);
    }
    else {
        quad.shader = shader;
    }

    quad.renderObj = new RDGE.RenderObject(quad.shader);

    quadBuf = getScreenAlignedQuad();

    quad.vertBuffer = quadBuf.vertexObject;
    quad.uvBuffer = quadBuf.texCoordObject;


    quad.renderObj.addTexture("basemap", 0, RDGE.UNIFORMTYPE.TEXTURE2D);

    quad.renderObj.addUniform("u_inv_viewport_width", 1.0 / RDGE.globals.width, RDGE.UNIFORMTYPE.FLOAT);
    quad.renderObj.addUniform("u_inv_viewport_height", 1.0 / RDGE.globals.height, RDGE.UNIFORMTYPE.FLOAT);
    quad.renderObj.addUniform("u_sampRadius", 5.0, RDGE.UNIFORMTYPE.FLOAT);
    quad.renderObj.addUniform("u_numSamples", 16, RDGE.UNIFORMTYPE.INT);
    quad.renderObj.addUniform("u_mapSize", 256.0, RDGE.UNIFORMTYPE.FLOAT);

    quad.renderObj.addBuffers(quad.vertBuffer, gl.ARRAY_BUFFER, 3, 0, gl.FLOAT);
    quad.renderObj.addBuffers(quad.uvBuffer, gl.ARRAY_BUFFER, 2, 2, gl.FLOAT);
};
