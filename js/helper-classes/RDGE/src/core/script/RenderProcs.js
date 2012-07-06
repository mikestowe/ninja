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

/**
*  supported uniform types
*/
RDGE.UNIFORMTYPE = function () {
    this.INT = 0x3F0;
    this.FLOAT = 0x3E8;
    this.FLOAT2 = 0x3E9;
    this.FLOAT3 = 0x3EA;
    this.FLOAT4 = 0x3EB;
    this.MATRIX3 = 0x3EC;
    this.MATRIX4 = 0x3ED;
    this.TEXTURE2D = 0x3EE;
    this.TEXTURECUBE = 0x3EF;
};

/**
* RDGE.RenderObject - contains references to all the data need to render, including vertex buffers, uniform handles, and matrices
* @param shaderHandle
*/
RDGE.RenderObject = function (shaderHandle) {
    this.shader = shaderHandle;
    this.world = null;
    this.bindings = new RDGE.ShaderData();
    this.initRenderProc = null;
    this.renderProc = null;
    this.postRenderProc = null;
};

/**
* Adds a uniform to the render object to bound during render
* @param name - name of the uniform
* @param value - reference to value that will get bound (will be referenced from now on, don't delete the ref)
* @param type  - type of uniform, use RDGE.UNIFORMTYPE
*/
RDGE.RenderObject.prototype.addUniform = function (name, value, type) {
    var uniform = RDGE.globals.gl.getUniformLocation(this.shader, name);
    if (uniform) {
        uniform.debugName = name;
        this.bindings.uniforms.push(new RDGE.UniformPair(uniform, value, type));
    }
    /*
    else
    {
    gl.console.log("ERROR: uniform - " + name + " not found!");
    }
    */
};

/**
* Adds a uniform to the render object to bound during render
* @param name - name of the uniform
* @param value - reference to value that will get bound (will be referenced from now on, don't delete the ref)
* @param type - type of uniform, use RDGE.UNIFORMTYPE
*/
RDGE.RenderObject.prototype.addUniformArray = function (name, value, type, size) {
    var uniform = RDGE.globals.gl.getUniformLocation(this.shader, name);
    if (uniform) {
        for (var index = 0; index < size; index++) {
            uniform.debugName = name + index;
            this.bindings.uniforms.push(new RDGE.UniformPair(uniform, value[index], type));
            uniform += value[index].length;
            value++;
        }
    }
    /*
    else
    {
    gl.console.log("ERROR: uniform - " + name + " not found!");
    }*/
};

/**
* Add texture to uniform
* @param name - handle to the texture
* @param unit - texture slot to use
* @param type - RDGE.UNIFORMTYPE.TEXTURE2D or TEXTURE2D.TEXTURECUBE
*/
RDGE.RenderObject.prototype.addTexture = function (name, unit, type) {
    var uniform = RDGE.globals.gl.getUniformLocation(this.shader, name);
    if (uniform) {
        this.bindings.textures.push(new RDGE.TexUniform(uniform, unit, type));
    }
    /*
    else
    {
    gl.console.log("ERROR: texture uniform - " + name + " not found!");
    }
    */
};

/**
* Adds a vertex buffer to the render object
* @param buffer    - buffer to use
* @param glBufferType  - type of buffer i.e. gl.ARRAY_BUFFER
* @param attribSize  - if using attrib the size of an element (3 for vec3)
* @param attribIndex - the index slot the attrib goes in
* @param glAttribType  - type of the attrib i.e. gl.FLOAT
*/
RDGE.RenderObject.prototype.addBuffers = function (buffer, glBufferType, attribSize, attribIndex, glAttribType) {
    //gl.useProgram(this.shader);
    if (attribSize == undefined || attribIndex == undefined || glAttribType == undefined ||
    attribSize == null || attribIndex == null || glAttribType == null) {
        this.bindings.buffers.push(new RDGE.BufferAttrib(buffer, glBufferType, null, null, null));
    }
    else {
        this.bindings.buffers.push(new RDGE.BufferAttrib(buffer, glBufferType, attribSize, attribIndex, glAttribType));
    }
    //gl.useProgram(null);
};

/**
* bind the matrices, vertices and floats to shader uniforms
*/
RDGE.RenderObject.prototype.bindUniforms = function () {
    for (var uniIndex = 0; uniIndex < this.bindings.uniforms.length; uniIndex++) {
        var bind = this.bindings.uniforms[uniIndex];
        switch (bind.type) {
            case RDGE.UNIFORMTYPE.INT:
                RDGE.globals.gl.uniform1i(bind.uniform, bind.value);
                break;
            case RDGE.UNIFORMTYPE.FLOAT:
                RDGE.globals.gl.uniform1f(bind.uniform, bind.value);
                break;
            case RDGE.UNIFORMTYPE.FLOAT2:
                RDGE.globals.gl.uniform2fv(bind.uniform, bind.value);
                break;
            case RDGE.UNIFORMTYPE.FLOAT3:
                RDGE.globals.gl.uniform3fv(bind.uniform, bind.value);
                break;
            case RDGE.UNIFORMTYPE.FLOAT4:
                RDGE.globals.gl.uniform4fv(bind.uniform, bind.value);
                break;
            case RDGE.UNIFORMTYPE.MATRIX3:
                RDGE.globals.gl.uniformMatrix3fv(bind.uniform, false, bind.value);
                break;
            case RDGE.UNIFORMTYPE.MATRIX4:
                RDGE.globals.gl.uniformMatrix4fv(bind.uniform, false, bind.value);
                break;
            default:
                //          gl.console.log("RDGE.RenderObject: trying to bind unknown texture type");
                break;
        }
    }
};

/**
* binds the texture uniform to texture slots
*/
RDGE.RenderObject.prototype.bindTextures = function () {
    for (var uniIndex = 0; uniIndex < this.bindings.textures.length; uniIndex++) {
        var bind = this.bindings.textures[uniIndex];
        var error = 0;
        switch (bind.type) {
            case RDGE.UNIFORMTYPE.TEXTURE2D:
                RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE0 + bind.unit);
                RDGE.globals.gl.uniform1i(bind.uniform, bind.unit);
                break;
            case RDGE.UNIFORMTYPE.TEXTURECUBE:
                RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE0 + bind.unit);
                RDGE.globals.gl.uniform1i(bind.uniform, bind.unit);
                break;
            default:
                //        gl.console.log("RDGE.RenderObject: trying to bind unknown texture type");
                break;
        }
    }
};

/**
* Binds all buffers and enables any vertexAttribs
*/
RDGE.RenderObject.prototype.bindBuffers = function () {
    for (var bufIndex = 0; bufIndex < this.bindings.buffers.length; bufIndex++) {
        var bind = this.bindings.buffers[bufIndex];
        RDGE.globals.gl.bindBuffer(bind.glBufferType, bind.buffer);

        if (bind.glAttribType != null) {
            // enable the attribute and point buffer to it
            RDGE.globals.gl.enableVertexAttribArray(bind.attribIndex);

            RDGE.globals.gl.vertexAttribPointer(bind.attribIndex, bind.attribSize, bind.glAttribType, false, 0, 0);
        }
    }
};

RDGE.RenderObject.prototype.unBindBuffers = function () {
    for (var bufIndex = 0; bufIndex < this.bindings.buffers.length; bufIndex++) {
        var bind = this.bindings.buffers[bufIndex];

        if (bind.glAttribType != null) {
            // enable the attribute and point buffer to it
            RDGE.globals.gl.disableVertexAttribArray(bind.attribIndex);
        }

        RDGE.globals.gl.bindBuffer(bind.glBufferType, null);
    }
};

RDGE.RenderObject.prototype.initialize = function (initRenderProc) {
    initRenderProc(this);
};

RDGE.RenderObject.prototype.clear = function () {
    this.world = RDGE.mat4.identity();
    this.bindings = new RDGE.ShaderData();
};

/***
* Shader data proto
*/
RDGE.ShaderData = function () {
    this.uniforms = [];
    this.textures = [];
    this.buffers = [];
};

/***
* Structure to contain reference data for binding to during render
*/
RDGE.UniformPair = function (uniform, value, type) {
    this.uniform = uniform;
    this.value = value;
    this.type = type;
};

RDGE.TexUniform = function (uniform, unit, type) {
    this.uniform = uniform;
    this.unit = unit;
    this.type = type;
};

RDGE.BufferAttrib = function (buffer, glBufferType, attribSize, attribIndex, glAttribType) {
    // buffer data
    this.buffer = buffer;
    this.glBufferType = glBufferType;

    // attribute data (can be null)
    this.attribSize = attribSize;
    this.glAttribType = glAttribType;
    this.attribIndex = attribIndex;
};

RDGE.setActiveTexture = function (id, texture) {
    RDGE.globals.gl.activeTexture(id);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, texture);
};

RDGE.renderProcDefault = function (primSet) {
    //gl.disable(gl.DEPTH_TEST);
    //gl.disable(gl.CULL_FACE);
    var activeCam = RDGE.globals.cameraManager.getActiveCamera();
    RDGE.globals.gl.mvMatrix = activeCam.view;
    RDGE.globals.gl.mvMatrix = RDGE.mat4.mul(RDGE.globals.gl.mvMatrix, primSet.parentMesh.world);
    RDGE.globals.gl.invMvMatrix = RDGE.mat4.inverse(RDGE.globals.gl.mvMatrix);
    RDGE.globals.gl.normalMatrix = RDGE.mat4.transpose(RDGE.globals.gl.invMvMatrix);

    // update shadow light MV matrix
    RDGE.globals.gl.useProgram(arrayPeek(primSet.material.shader).shaderHandle);
    // Bind the texture

    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE0);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, arrayPeek(primSet.material.tex.set1).diff);

    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE1);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, arrayPeek(primSet.material.tex.set2).diff);

    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE2);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, arrayPeek(primSet.material.tex.set1).spec);

    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE3);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, arrayPeek(primSet.material.tex.set2).spec);

    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE4);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, arrayPeek(primSet.material.tex.env));

    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE5);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, arrayPeek(primSet.material.tex.envDiff));

    // stickers
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE7, RDGE.globals.cam.stickerTexture[0]);
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE8, RDGE.globals.cam.stickerTexture[1]);
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE9, RDGE.globals.cam.stickerTexture[2]);
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE10, RDGE.globals.cam.stickerTexture[3]);
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE11, RDGE.globals.cam.stickerTexture[4]);
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE12, RDGE.globals.cam.stickerTexture[5]);
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE13, RDGE.globals.cam.stickerTexture[6]);
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE14, RDGE.globals.cam.stickerTexture[7]);

    // copy current cams matrix
    for (var i = 0; i < 8; i++) {
        primSet.parentMesh.stickers[i].load(RDGE.globals.cam.stickers[i]);
        primSet.parentMesh.stickersPos[i].setvec(RDGE.globals.cam.stickersPos[i]);
    }
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE15, arrayPeek(primSet.material.tex.set1).norm);
    RDGE.setActiveTexture(RDGE.globals.gl.TEXTURE6, arrayPeek(primSet.material.tex.set2).norm);

    //bind buffers and attribs
    arrayPeek(primSet.material.renderObj).bindBuffers();

    // bind shader uniforms
    arrayPeek(primSet.material.renderObj).bindTextures();

    arrayPeek(primSet.material.renderObj).bindUniforms();

    RDGE.globals.gl.drawElements(RDGE.globals.gl.TRIANGLES, primSet.size, RDGE.globals.gl.UNSIGNED_SHORT, primSet.indexInBuffer * 2);
};

RDGE.renderProcLines = function (renderObj, r, g, b, a) {
    RDGE.globals.gl.useProgram(renderObj.shader);

    renderObj.lineColor[0] = r;
    renderObj.lineColor[1] = g;
    renderObj.lineColor[2] = b;
    renderObj.lineColor[3] = a;

    //bind buffers and attribs
    renderObj.bindBuffers();

    // bind shader uniforms
    renderObj.bindUniforms();

    // draw the AABBs
    RDGE.globals.gl.drawArrays(RDGE.globals.gl.LINES, 0, renderObj.numPoints / 3);

    RDGE.globals.gl.useProgram(null);
};

RDGE.renderProcScreenQuad = function (quad) {
    RDGE.globals.gl.disable(RDGE.globals.gl.DEPTH_TEST);
    RDGE.globals.gl.useProgram(quad.shader);

    //bind buffers and attribs
    quad.renderObj.bindBuffers();

    // bind shader uniforms
    quad.renderObj.bindTextures();
    quad.renderObj.bindUniforms();

    // render
    var offset = 0;
    // Bind the texture
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, quad.texture);
    RDGE.globals.gl.drawArrays(RDGE.globals.gl.TRIANGLES, 0, 6);

    RDGE.globals.gl.useProgram(null);
    RDGE.globals.gl.enable(RDGE.globals.gl.DEPTH_TEST);
};

// post render proc
RDGE.postRenderProcDefault = function (primSet) {
    RDGE.globals.gl.useProgram(arrayPeek(primSet.material.renderObj).shader);

    //bind buffers and attribs
    //arrayPeek(primSet.material.renderObj).unBindBuffers();

    RDGE.globals.gl.useProgram(null);
};

RDGE.renderProcDepthMap = function (primSet) {
    RDGE.globals.gl.useProgram(g_depthMap.shader)

    //bind buffers
    arrayPeek(primSet.material.renderObj).bindBuffers();

    g_depthMap.bindUniforms();

    RDGE.globals.gl.enable(RDGE.globals.gl.DEPTH_TEST);
    RDGE.globals.gl.enable(RDGE.globals.gl.CULL_FACE);
    RDGE.globals.gl.enable(RDGE.globals.gl.POLYGON_OFFSET_FILL);
    RDGE.globals.gl.cullFace(RDGE.globals.gl.FRONT);

    RDGE.globals.gl.drawElements(RDGE.globals.gl.TRIANGLES, primSet.size, RDGE.globals.gl.UNSIGNED_SHORT, primSet.indexInBuffer * 2);

    RDGE.globals.gl.cullFace(RDGE.globals.gl.BACK);
    RDGE.globals.gl.disable(RDGE.globals.gl.POLYGON_OFFSET_FILL);
    RDGE.globals.gl.disable(RDGE.globals.gl.CULL_FACE);
    //gl.disable(gl.DEPTH_TEST);

    RDGE.globals.gl.useProgram(null);
};

RDGE.renderProcShadowReceiver = function (primSet) {

    // ---- initial pass, render shadow to target
    RDGE.globals.gl.bindFramebuffer(RDGE.globals.gl.FRAMEBUFFER, primSet.shadowTarget.frameBuffer);
    RDGE.globals.gl.viewport(0, 0, primSet.shadowTarget.frameBuffer.width, primSet.shadowTarget.frameBuffer.height);
    RDGE.globals.gl.clearDepth(g_farZ);
    RDGE.globals.gl.clear(RDGE.globals.gl.COLOR_BUFFER_BIT | RDGE.globals.gl.DEPTH_BUFFER_BIT);

    RDGE.globals.gl.useProgram(arrayPeek(primSet.material.shader).shaderHandle);

    // Bind the texture
    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE0);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, g_depthMap.depthRT);

    // bind shader uniforms
    arrayPeek(primSet.material.renderObj).bindTextures();

    //gl.disable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);

    RDGE.globals.gl.mvMatrix = RDGE.mat4.mul(g_defaultView, primSet.parentMesh.world);

    arrayPeek(primSet.material.renderObj).bindUniforms();
    error = RDGE.globals.gl.getError();

    //bind buffers and attribs
    arrayPeek(primSet.material.renderObj).bindBuffers();
    RDGE.globals.gl.drawElements(RDGE.globals.gl.TRIANGLES, primSet.size, RDGE.globals.gl.UNSIGNED_SHORT, primSet.indexInBuffer * 2);

    //gl.enable(gl.DEPTH_TEST);
    //gl.disable(gl.CULL_FACE);

    RDGE.globals.gl.useProgram(null);

    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, primSet.shadowTarget);
    RDGE.globals.gl.generateMipmap(RDGE.globals.gl.TEXTURE_2D);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, null);
    RDGE.globals.gl.bindFramebuffer(RDGE.globals.gl.FRAMEBUFFER, theSceneRTT.frameBuffer);
    RDGE.globals.gl.viewport(0, 0, theSceneRTT.frameBuffer.width, theSceneRTT.frameBuffer.height);

    //----------change buffers render blur pass to quad

    RDGE.globals.gl.bindFramebuffer(RDGE.globals.gl.FRAMEBUFFER, primSet.shadowTargetFinal.frameBuffer);
    RDGE.globals.gl.viewport(0, 0, primSet.shadowTargetFinal.frameBuffer.width, primSet.shadowTargetFinal.frameBuffer.height);
    RDGE.globals.gl.clearDepth(g_farZ);
    RDGE.globals.gl.clear(RDGE.globals.gl.COLOR_BUFFER_BIT | RDGE.globals.gl.DEPTH_BUFFER_BIT);

    primSet.screenQuad.setTexture(primSet.shadowTarget);
    primSet.screenQuad.render(RDGE.renderProcScreenQuad);

    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, primSet.shadowTargetFinal);
    RDGE.globals.gl.generateMipmap(RDGE.globals.gl.TEXTURE_2D);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, null);
    RDGE.globals.gl.bindFramebuffer(RDGE.globals.gl.FRAMEBUFFER, theSceneRTT.frameBuffer);
    RDGE.globals.gl.viewport(0, 0, theSceneRTT.frameBuffer.width, theSceneRTT.frameBuffer.height);

    //----------change buffers render blur pass to quad again


    RDGE.globals.gl.bindFramebuffer(RDGE.globals.gl.FRAMEBUFFER, primSet.shadowTarget.frameBuffer);
    RDGE.globals.gl.viewport(0, 0, primSet.shadowTarget.frameBuffer.width, primSet.shadowTarget.frameBuffer.height);
    RDGE.globals.gl.clearDepth(g_farZ);
    RDGE.globals.gl.clear(RDGE.globals.gl.COLOR_BUFFER_BIT | RDGE.globals.gl.DEPTH_BUFFER_BIT);

    primSet.screenQuad.setTexture(primSet.shadowTargetFinal);
    primSet.screenQuad.render(RDGE.renderProcScreenQuad);

    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, primSet.shadowTarget);
    RDGE.globals.gl.generateMipmap(RDGE.globals.gl.TEXTURE_2D);
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, null);
    RDGE.globals.gl.bindFramebuffer(RDGE.globals.gl.FRAMEBUFFER, theSceneRTT.frameBuffer);
    RDGE.globals.gl.viewport(0, 0, theSceneRTT.frameBuffer.width, theSceneRTT.frameBuffer.height);
};

RDGE.renderProcShadowProjection = function (primSet) {
    RDGE.globals.gl.useProgram(arrayPeek(primSet.material.shader).shaderHandle);
    // Bind the texture

    var error = RDGE.globals.gl.getError();
    RDGE.globals.gl.activeTexture(RDGE.globals.gl.TEXTURE0);
    error = RDGE.globals.gl.getError(RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, g_depthMap.shadowTarget));
    RDGE.globals.gl.bindTexture(RDGE.globals.gl.TEXTURE_2D, RDGE.globals.meshMan.getModelByName("backdropReceiver").mesh.shadowToProject);

    // bind shader uniforms
    arrayPeek(primSet.material.renderObj).bindTextures();

    RDGE.globals.gl.mvMatrix = RDGE.mat4.mul(g_defaultView, primSet.parentMesh.world);

    arrayPeek(primSet.material.renderObj).bindUniforms();

    //bind buffers and attribs
    arrayPeek(primSet.material.renderObj).bindBuffers();

    RDGE.globals.gl.drawElements(RDGE.globals.gl.TRIANGLES, primSet.size, RDGE.globals.gl.UNSIGNED_SHORT, primSet.indexInBuffer * 2);

    RDGE.globals.gl.useProgram(null);
};
