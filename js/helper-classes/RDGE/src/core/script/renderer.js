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

// runtime globals
RDGE.rdgeConstants = (function () {
    return {
        // clear flags
        colorBuffer: 0x00004000,
        depthBuffer: 0x00000100,
        stencilBuffer: 0x00000400,

        // primitive types
        POINTS: 0,
        LINES: 1,
        LINE_LOOP: 2,
        LINE_STRIP: 3,
        TRIANGLES: 4,
        TRIANGLE_STRIP: 5,
        TRIANGLE_FAN: 6,

        // primitive data types
        BYTE: 0x1400,
        UNSIGNED_BYTE: 0x1401,
        SHORT: 0x1402,
        UNSIGNED_SHORT: 0x1403,
        INT: 0x1404,
        UNSIGNED_INT: 0x1405,
        FLOAT: 0x1406,

        // pre-defined vertex element type
        VS_ELEMENT_FLOAT4: 4,
        VS_ELEMENT_POS: 3,
        VS_ELEMENT_NORM: 3,
        VS_ELEMENT_FLOAT3: 3,
        VS_ELEMENT_FLOAT2: 2,
        VS_ELEMENT_UV: 2,
        VS_ELEMENT_FLOAT: 1,
        MAX_ELEM_TYPES: 7,

        // GL Definition of buffer types
        BUFFER_STATIC: 0x88E0,
        BUFFER_DYNAMIC: 0x88E4,
        BUFFER_STREAM: 0x88E8,

        // render constants
        MAX_MATERIAL_LIGHTS: 4,

        //	Material categories determine sorting materials support the following categories
        categoryEnumeration:
        {
            'BACKGROUND': 0,
            'OPAQUE': 1,
            'TRANSPARENT': 2,
            'ADDITIVE': 3,
            'TRANSLUCENT': 4,
            'FOREGROUND': 5,
            'MAX_CAT': 6
        },

        // Node types supported by the scene graph
        nodeType:
        {
            'TRNODE': 0,
            'MESHNODE': 1,
            'MATNODE': 2,
            'LIGHTNODE': 3
        }
    };
})();

RDGE._renderer = function (canvas) {
    /*
    *	Initialize the context associated with this canvas
    */
    try {
        this.ctx = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true }); // true, true, false, true, true);

        if (!this.ctx) {
            this.ctx = canvas.getContext("webgl", { preserveDrawingBuffer: true });
        }
        if (!this.ctx) {
            this.ctx = canvas.getContext("webkit-3d", { preserveDrawingBuffer: true });
        }
        if (!this.ctx) {
            this.ctx = canvas.getContext("moz-webgl", { preserveDrawingBuffer: true });
        }
    }
    catch (err) { }
    if (!this.ctx) {
        window.console.log("Could not create GL context");
        return null;
    }

    // set viewport for the first time
    this.ctx.viewport(0, 0, canvas.width, canvas.height);

    // Add a console output to the renderer
    this.console = ("console" in window) ? window.console : { log: function () { } };

    /*
    *	Set the default clear color
    */
    this.ctx.clearColor(1, 0, 0, 1);

    /*
    *	the clear color of this renderer
    */
    this.clearColor = [1, 0, 0, 1];

    /*
    *	The clear flags clear color and depth buffers by default
    */
    this.clearFlags = this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT

    /*
    *	clear flags
    */
    this.colorBuffer = this.ctx.COLOR_BUFFER_BIT;
    this.depthBuffer = this.ctx.DEPTH_BUFFER_BIT;
    this.stencilBuffer = this.ctx.STENCIL_BUFFER_BIT;

    /*
    *	buffer types
    */
    this.BUFFER_STATIC = 0;
    this.BUFFER_DYNAMIC = 1;
    this.BUFFER_STREAM = 2;

    /*
    *	primitive types
    */
    this.POINTS = 0;
    this.LINES = 1;
    this.LINE_LOOP = 2;
    this.LINE_STRIP = 3;
    this.TRIANGLES = 4;
    this.TRIANGLE_STRIP = 5;
    this.TRIANGLE_FAN = 6;

    /*
    *	primitive data types
    */
    this.BYTE = 0x1400;
    this.UNSIGNED_BYTE = 0x1401;
    this.SHORT = 0x1402;
    this.UNSIGNED_SHORT = 0x1403;
    this.INT = 0x1404;
    this.UNSIGNED_INT = 0x1405;
    this.FLOAT = 0x1406;

    /*
    *	pre-defined vertex element type
    */
    this.VS_ELEMENT_FLOAT4 = 4;
    this.VS_ELEMENT_POS = 3;
    this.VS_ELEMENT_NORM = 3;
    this.VS_ELEMENT_FLOAT3 = 3;
    this.VS_ELEMENT_FLOAT2 = 2;
    this.VS_ELEMENT_UV = 2;
    this.VS_ELEMENT_FLOAT = 1;
    this.MAX_ELEM_TYPES = 7;

    // GL Definition of buffer types
    this.BUFFER_STATIC = 0x88E0;
    this.BUFFER_DYNAMIC = 0x88E4;
    this.BUFFER_STREAM = 0x88E8;

    // render constants
    this.MAX_MATERIAL_LIGHTS = 4;

    // max system textures
    this.usedTextureUnits = 5;

    /*
    *	the renderers current viewport
    */
    this.vpX = 0;
    this.vpY = 0;
    this.vpWidth = canvas.width;
    this.vpHeight = canvas.height;

    /*
    *	the camera manager - contains the camera stack for this render context
    */
    this.cameraMan = new RDGE.cameraManager();

    /*
    *	a list of device buffers that are owned by this render context
    */
    this.buffers = [];


    /*
    *	State wrappers
    */
    this.cullBackFace = function () {
        this.ctx.cullFace(this.ctx.Back);
    };

    this.cullFrontFace = function () {
        this.ctx.cullFace(this.ctx.FRONT);
    };

    this.disableCulling = function () {
        this.ctx.disable(this.ctx.CULL_FACE);
    };

    this.enableCulling = function () {
        this.ctx.enable(this.ctx.CULL_FACE);
    };

    this.enablePolyOffsetFill = function () {
        this.ctx.enable(this.ctx.POLYGON_OFFSET_FILL);
    };

    this.disablePolyOffsetFill = function () {
        this.ctx.enable(this.ctx.POLYGON_OFFSET_FILL);
    };

    this.enablePointSprites = function () {
        //        this.ctx.enable(0x8642);
    };

    this.disablePointSprites = function () {
        //        this.ctx.enable(0x8642);
    };

    this.setClearColor = function (color) {
        this.clearColor = color.slice();
        this.ctx.clearColor(color[0], color[1], color[2], color[3]);
    };

    /*
    *	flags that specify how to clear the scene, can be OR'ed together
    */
    this.setClearFlags = function (flags) {
        this.clearFlags = flags;
    };

    /*
    *	called by the system to clear the video buffer according to pre-set flags
    */
    this._clear = function () {
        this.ctx.clear(this.clearFlags);
    };

    /*
    *	clears the video buffer with flags provided
    */
    this.clear = function (flags) {
        this.ctx.clear(flags);
    };

    /*
    *	flush the video buffer
    */
    this.flush = function () {
        this.ctx.flush();
    };

    /*
    *	Sets the current viewport
    */
    this.setViewPort = function (x, y, width, height) {
        this.vpX = x;
        this.vpY = y;
        this.vpWidth = width;
        this.vpHeight = height;
        this.ctx.viewport(this.vpX, this.vpY, this.vpWidth, this.vpHeight);
    };

    /*
    *	access the camera manager associated with the renderer
    */
    this.cameraManager = function () {
        return this.cameraMan;
    };

    /*
    *	Sets of texture maps owned by the renderer
    */
    this.textureMap = [];
    this.rttMap = [];

    /*
    *	gets the texture by name or creates the texture requested
    *	@param name - the name of the texture to try and get
    *	@param wrap - optional "CLAMP or "REPEAT", default is clamp
    *	@param mips - optional true/false value to create mipmaps, the default is true
    */
    this.getTextureByName = function (name, wrap, mips) {
        var ext = name.split('.')[1];

        if (!ext)
            ext = ".png";
        else
            ext = "";

        var tex = this.textureMap[name];

        if (tex === undefined) {
            // load the texture
			name = RDGE.globals.engine.remapAssetFolder( name );
            tex = this.createTexture(name + ext, wrap, mips);
            this.textureMap[name] = tex;
            tex.lookUpName = name;
            tex.previouslyReferenced = false;
        }
        else {
            //console.log( "texture already loaded: " + name );
            tex.previouslyReferenced = true;
        }

        return tex;
    };

    /*
    *	creates a texture from the given URL
    *	@param url - the resource location
    *	@param wrap - optional "CLAMP or "REPEAT", default is clamp
    *	@param mips - optional true/false value to create mipmaps, the default is true
    */
    this.unloadedTextureCount = 0;
    _texparams = function (wrap, mips) {
        this.wrap = wrap, this.mips = mips
    };
    this.createTexture = function (url, wrap, mips) {
        var texture = this.ctx.createTexture();
        this.unloadedTextureCount++;

        if (wrap === undefined)
            wrap = "CLAMP";
        if (mips === undefined)
            mips = true;

        if (texture) {
            texture.image = new Image();
            texture.image.src = url;
            texture.image.context = RDGE.globals.engine.getContext();
            texture.texparams = new _texparams(wrap, mips);
            texture.image.onload = function () {
                var stateMan = this.context.ctxStateManager;
                stateMan.RDGEInitState.loadTexture(texture);
                this.context.renderer.unloadedTextureCount--;
                //console.log( "loaded texture: " + texture.lookUpName + ",to: " + this.context.renderer._world._worldCount + ", textures remaining to load: " + this.context.renderer.unloadedTextureCount );
                if (texture.callback) texture.callback(texture);
                if (this.context.renderer.unloadedTextureCount < 0)
                    console.log("more textures loaded then created...");
            };
            texture.image.onerror = function () {
                this.context.renderer.unloadedTextureCount--;
                if (texture.callback) texture.callback(texture);
                //console.log( "Error loading texture: " + texture.image.src );
                if (this.context.renderer.unloadedTextureCount < 0)
                    console.log("more textures loaded then created...");
            };
        }
        return texture;
    };

    /*
    *	commits a texture to video memory
    *	@param - the texture object created by a call to create texture
    */
    this.commitTexture = function (texture) {
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, texture.image);

        if (texture.texparams.mips)
            this.ctx.generateMipmap(this.ctx.TEXTURE_2D);

        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, texture.texparams.mips ? this.ctx.LINEAR_MIPMAP_LINEAR : this.ctx.LINEAR);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, texture.texparams.wrap === "REPEAT" ? this.ctx.REPEAT : this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, texture.texparams.wrap === "REPEAT" ? this.ctx.REPEAT : this.ctx.CLAMP_TO_EDGE);

        this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);
    };

    this.verify = function (label) {
        var error = this.ctx.getError();
        if (error != 0) {
            window.console.log("GLError ( " + label + ") : " + error);
        }
    };

    this.createRenderTargetTexture = function (lookUpName, width, height, generateMips) {
        var ctx = this.ctx;
        // create framebuffer
        var renderTargetFrameBuffer = ctx.createFramebuffer();
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, renderTargetFrameBuffer);

        // setup parameters (width, hight, filtering)
        renderTargetFrameBuffer.width = width;
        renderTargetFrameBuffer.height = height;

        // create the texture
        var renderTarget = ctx.createTexture();
        ctx.bindTexture(ctx.TEXTURE_2D, renderTarget);

        try {
            // Do it the way the spec requires
            ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, renderTargetFrameBuffer.width, renderTargetFrameBuffer.height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);
        } catch (exception) {
            // Workaround for what appears to be a Minefield bug.
            var textureStorage = new WebctxUnsignedByteArray(renderTargetFrameBuffer.width * renderTargetFrameBuffer.height * 4);
            ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, renderTargetFrameBuffer.width, renderTargetFrameBuffer.height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, textureStorage);
        }

        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, generateMips ? ctx.LINEAR_MIPMAP_NEAREST : ctx.LINEAR);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);

        if (generateMips) {
            ctx.generateMipmap(ctx.TEXTURE_2D);
        }

        // set frame buffer storage and texture
        var renderBuffer = ctx.createRenderbuffer();
        ctx.bindRenderbuffer(ctx.RENDERBUFFER, renderBuffer);
        ctx.renderbufferStorage(ctx.RENDERBUFFER, ctx.DEPTH_COMPONENT16, renderTargetFrameBuffer.width, renderTargetFrameBuffer.height);

        // bind
        var error = ctx.getError(ctx.bindFramebuffer(ctx.FRAMEBUFFER, renderTargetFrameBuffer));
        error = ctx.getError(ctx.bindRenderbuffer(ctx.RENDERBUFFER, renderBuffer));
        error = ctx.getError(ctx.renderbufferStorage(ctx.RENDERBUFFER, ctx.DEPTH_COMPONENT16, renderTargetFrameBuffer.width, renderTargetFrameBuffer.height));

        ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);

        // bind texture handle and renderBuffer to frame buffer
        error = ctx.getError(ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, renderTarget, 0));

        error = ctx.getError(ctx.framebufferRenderbuffer(ctx.FRAMEBUFFER, ctx.DEPTH_ATTACHMENT, ctx.RENDERBUFFER, renderBuffer));

        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);

        /*
        var status=ctx.checkFramebufferStatus(ctx.FRAMEBUFFER);
        switch(status) {
        case ctx.FRAMEBUFFER_COMPLETE:
        break;
        case ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        ctx.console.log("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
        return null;
        case ctx.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        ctx.console.log("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
        return null;
        case ctx.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        ctx.console.log("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
        return null;
        case ctx.FRAMEBUFFER_UNSUPPORTED:
        ctx.console.log("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
        return null;
        default:
        ctx.console.log("Incomplete framebuffer: "+status);
        return null;
        }
        */

        // unbind
        ctx.bindTexture(ctx.TEXTURE_2D, null);
        ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);

        renderTarget.id = "RT_" + RDGE.nodeIdGen.getId();

        renderTarget.frameBuffer = renderTargetFrameBuffer;

        if (this.textureMap[lookUpName])
            window.console.log("Notification: render target: " + lookUpName + " has overwritten an existing render target");

        // add to lookup map
        this.textureMap[lookUpName] = renderTarget;

        return renderTarget;
    };

    /*
    *	The default shader setup
    */
    this.defaultShaderDefintion = {
        'shaders': {
            'defaultVShader': "assets/shaders/test_vshader.glsl",
            'defaultFShader': "assets/shaders/test_fshader.glsl"
        },
        'techniques': {
            'defaultTechnique': [{
                'vshader': 'defaultVShader',
                'fshader': 'defaultFShader',
                // attributes
                'attributes':
							 {
							     'vert': { 'type': 'vec3' },
							     'normal': { 'type': 'vec3' },
							     'texcoord': { 'type': 'vec2' }
							 },
                // parameters
                'params':
							 {
							 },

                // render states
                'states':
							 {
							     'depthEnable': true,
							     'blendEnable': false,
							     'culling': true,
							     'cullFace': "BACK"
							 }
            }]
        }
    };
};

/*
*	Shader definitions
*/

/*
*	The default shader setup
*/
RDGE.rdgeDefaultShaderDefintion = {
    'shaders': {
        //'defaultVShader':"assets/shaders/test_vshader.glsl",
        //'defaultFShader':"assets/shaders/test_fshader.glsl"
        'defaultVShader': "assets/shaders/Basic.vert.glsl",
        'defaultFShader': "assets/shaders/Basic.frag.glsl"
    },
    'techniques': {
        'defaultTechnique': [{
            'vshader': 'defaultVShader',
            'fshader': 'defaultFShader',
            // attributes
            'attributes':
						 {
						     'vert': { 'type': 'vec3' },
						     'normal': { 'type': 'vec3' },
						     'texcoord': { 'type': 'vec2' }
						 },
            // parameters
            'params':
						 {
						 },

            // render states
            'states':
						 {
						     'depthEnable': true,
						     'blendEnable': false,
						     'culling': true,
						     'cullFace': "BACK"
						 }
        }]
    }
};

/*
*	The default depth map shader techniques
*/
// currently not used in Ninja
// RDGE.rdgeDepthMapShaderDef = {
//     'shaders': {
//         'depthMapVShader': "assets/shaders/depthMap_vshader.glsl",
//         'depthMapFShader': "assets/shaders/depthMap_fshader.glsl"
//     },
//     'techniques':
//     {
//         'shadowDepthMap':
// 	    [{
// 	        'vshader': 'depthMapVShader',
// 	        'fshader': 'depthMapFShader',
// 	        // attributes
// 	        'attributes':
// 				     { 'vert': { 'type': 'vec3' },
// 				         'normal': { 'type': 'vec3' },
// 				         'texcoord': { 'type': 'vec2' }
// 				     },
// 	        // parameters
// 	        'params': {},
// 	        // render states
// 	        'states':
// 				     { 'depthEnable': true,
// 				         'blendEnable': false,
// 				         'culling': true,
// 				         'cullFace': "BACK"
// 				     }
// 	    }],
//         'depthMap':
// 	    [{
// 	        'vshader': 'depthMapVShader',
// 	        'fshader': 'depthMapFShader',
// 	        // attributes
// 	        'attributes':
// 				     { 'vert': { 'type': 'vec3' },
// 				         'normal': { 'type': 'vec3' },
// 				         'texcoord': { 'type': 'vec2' }
// 				     },
// 	        // parameters
// 	        'params': {},
// 	        // render states
// 	        'states':
// 				     { 'depthEnable': true,
// 				         'blendEnable': false,
// 				         'culling': true,
// 				         'cullFace': "BACK"
// 				     }
// 	    }]
// 
//     }
// };

/*
*	capture normals in view space
*/
// currently not used in Ninja
// RDGE.rdgeViewSpaceNormalsShader = {
//     'shaders': {
//         'normalsVShader': "assets/shaders/norm_depth_vshader.glsl",
//         'normalsFShader': "assets/shaders/norm_depth_fshader.glsl"
//     },
//     'techniques':
//     {
//         'depthMapWNormal':
// 	    [{
// 	        'vshader': 'normalsVShader',
// 	        'fshader': 'normalsFShader',
// 	        // attributes
// 	        'attributes':
// 				     { 'vert': { 'type': 'vec3' },
// 				         'normal': { 'type': 'vec3'}
// 				     },
// 	        // parameters
// 	        'params': {},
// 	        // render states
// 	        'states':
// 				     { 'depthEnable': true,
// 				         'blendEnable': false,
// 				         'culling': true,
// 				         'cullFace': "BACK"
// 				     }
// 	    }]
// 
//     }
// };

/*
*	basic screen squad shader definition
*/
// currently not used in Ninja
// RDGE.rdgeScreenQuadShaderDef = {
//     'shaders': {
//         // Texture coordinates are setup so that the full texture
//         // is mapped completely onto the screen
//         'screenQuadVShader': "\
// 				attribute vec3 a_pos;\
// 				attribute vec2 a_uv;\
// 				uniform float u_inv_viewport_width;\
// 				uniform float u_inv_viewport_height;\
// 				varying vec2 vTexcoord;\
// 				void main()\
// 				{\
// 					gl_Position = vec4(a_pos.xy, 0.0, 1.0);\
// 				\
// 				vTexcoord.x = 0.5 * (1.0 + a_pos.x + u_inv_viewport_width);\
// 				vTexcoord.y = 0.5 * (1.0 - a_pos.y + u_inv_viewport_height);\
// 				}",
//         'screenQuadFShader': "\
// 				precision highp float;\
// 				uniform sampler2D u_mainRT;\
// 				uniform sampler2D u_glowFinal;\
// 				uniform sampler2D u_ssaoRT;\
// 				uniform sampler2D u_shadowMap;\
// 				varying vec2 vTexcoord;\
// 				void main()\
// 				{\
// 				 vec2 tex = vec2(vTexcoord.x, 1.0 - vTexcoord.y);\
// 				 vec4 glowTexel = texture2D(u_glowFinal, tex);\
// 				 vec4 ssaoTexel = texture2D(u_ssaoRT, tex);\
// 				 vec4 smapCoef = texture2D(u_shadowMap, tex);\
// 				 ssaoTexel.a = 0.0;\
// 				 vec4 texel		= texture2D(u_mainRT, tex);\
// 				 gl_FragColor = vec4(texel.r*((1.0 - glowTexel.r)*smapCoef.r), texel.g*((1.0 - glowTexel.g)*smapCoef.g), texel.b*((1.0 - glowTexel.b)*smapCoef.b), texel.a) + glowTexel - ssaoTexel;\
// 				}"
//     },
//     'techniques': {
//         // rendering control
//         'screenQuad': [{
//             'vshader': 'screenQuadVShader',
//             'fshader': 'screenQuadFShader',
// 
//             // attributes
//             'attributes': {
//                 'a_pos': { 'type': 'vec3' },
//                 'a_uv': { 'type': 'vec2' }
//             },
//             'params': {
//                 'u_mainRT': { 'type': "tex2d" },
//                 'u_glowFinal': { 'type': "tex2d", 'data': "assets/images/black" },
//                 'u_ssaoRT': { 'type': "tex2d", 'data': "assets/images/black" },
//                 'u_shadowMap': { 'type': "tex2d", 'data': "assets/images/white" }
//             },
//             // render states
//             'states': {
//                 'blendEnabled': true,
//                 'srcBlend': 'SRC_ALPHA',
//                 'dstcBlend': 'ONE_MINUS_SRC_ALPHA'
//             }
//         }]
//     }
// };

/*
*	creates the glow map
*/
// currently not used in Ninja
// RDGE.rdgeGlowMapShader = {
//     'shaders': {
//         'createGlowVShader': "assets/shaders/glowMap_vshader.glsl",
//         'createGlowFShader': "assets/shaders/glowMap_fshader.glsl"
//     },
//     'techniques': {
//         'createGlowMap': [
// 			{
// 			    'vshader': 'createGlowVShader',
// 			    'fshader': 'createGlowFShader',
// 			    // attributes
// 			    'attributes':
// 				 {
// 				     'vert': { 'type': 'vec3' },
// 				     'normal': { 'type': 'vec3' },
// 				     'texcoord': { 'type': 'vec2' }
// 				 },
// 			    // parameters
// 			    'params':
// 				 {
// 				 },
// 
// 			    // render states
// 			    'states':
// 				 {
// 				     'depthEnable': true,
// 				     'blendEnable': false,
// 				     'culling': true,
// 				     'cullFace': "BACK"
// 				 }
// 			}
// 	]
//     }
// };

/* 
* Gaussian blur shader
*/
// currently not used in Ninja
// RDGE.rdgeGaussianBlurShader = {
//     'shaders': {
//         'blurVShader': "assets/shaders/separableBlur_vshader.glsl",
//         'blurFShader': "assets/shaders/separableBlur_fshader.glsl"
//     },
//     'techniques': {
//         'gaussianBlur': [
// 			{
// 			    'vshader': 'blurVShader',
// 			    'fshader': 'blurFShader',
// 			    // attributes
// 			    'attributes':
// 				 {
// 				     'vert': { 'type': 'vec3' },
// 				     'texcoord': { 'type': 'vec2' }
// 				 },
// 			    // parameters
// 			    'params':
// 				 {
// 				     'vCoeffs': { 'type': 'vec3', 'data': [5.0 / 16.0, 6.0 / 16.0, 5.0 / 16.0] },
// 				     'vOffset': { 'type': 'vec2', 'data': [0.00617, 0.00617] },
// 				     'u_weight': { 'type': 'float', 'data': [1.0] },
// 				     'sTexture': { 'type': "tex2d" }
// 				 },
// 			    // render states
// 			    'states':
// 				 {
// 				     'culling': false
// 				 }
// 			}
// 		]
//     }
// };

/* 
* Screen space ambient occlusion shader
*/
// currently not used in Ninja
// RDGE.rdgeSSAOShader = {
//     'shaders': {
//         'blurVShader': "assets/shaders/ssao_vshader.glsl",
//         'blurFShader': "assets/shaders/ssaohr_fshader.glsl"
//     },
//     'techniques': {
//         'ssao': [
// 			{
// 			    'vshader': 'blurVShader',
// 			    'fshader': 'blurFShader',
// 			    // attributes
// 			    'attributes':
// 				 {
// 				     'vert': { 'type': 'vec3' },
// 				     'texcoord': { 'type': 'vec2' }
// 				 },
// 			    // parameters
// 			    'params':
// 				 {
// 				     'u_normalsRT': { 'type': "tex2d" },
// 				     'u_depthMap': { 'type': "tex2d" },
// 				     'sRandMap': { 'type': "tex2d", 'data': "assets/images/random_normal.png", 'wrap': "REPEAT", 'mips': false },
// 				     'u_cameraFTR': { 'type': 'vec3' },
// 				     'u_artVals': { 'type': 'vec4', 'data': [0.36, 0.75, 0.60, 0.05] }, // sample radius, intensity, distScale, bias
// 				     'u_randMapSize': { 'type': 'float', 'data': [64.0] },
// 				     'u_screenSize': { 'type': 'vec2', 'data': [1024, 1024] }
// 				 },
// 			    // render states
// 			    'states':
// 				 {
// 				     'culling': false
// 				 }
// 			}
// 		]
//     }
// };

/*
*	Shadow map generation
*/
// currently not used in Ninja
// RDGE.rdgeShadowMapShader = {
//     'shaders': {
//         'shadowMapVShader': "assets/shaders/shadowMap_vshader.glsl",
//         'shadowMapFShader': "assets/shaders/shadowMap_fshader.glsl"
//     },
//     'techniques': {
//         'shadowMap': [
// 			{
// 			    'vshader': 'shadowMapVShader',
// 			    'fshader': 'shadowMapFShader',
// 			    // attributes
// 			    'attributes':
// 				 {
// 				     'a_pos': { 'type': 'vec3' },
// 				     'a_uv': { 'type': 'vec2' }
// 				 },
// 			    // parameters
// 			    'params':
// 				 {
// 				     'u_lightSize': { 'type': 'float', 'data': [7.93] },
// 				     // color is inverted, alpha represents intensity and is not inverted
// 				     'u_shadowColor': { 'type': 'vec4', 'data': [0.922, 0.7373, 0.4824, 0.5] }
// 				 },
// 			    // render states
// 			    'states':
// 				 {
// 				     'depthEnable': true,
// 				     'blendEnable': false,
// 				     'culling': true,
// 				     'cullFace': "BACK"
// 				 }
// 			}
// 		]
//     }
// };

/*
*	Noise blur filter
*/
// currently not used in Ninja
// RDGE.rdgeNoiseBlurShader = {
//     'shaders': {
//         'blurVShader': "assets/shaders/noiseBlur_vshader.glsl",
//         'blurFShader': "assets/shaders/noiseBlur_fshader.glsl"
//     },
//     'techniques': {
//         'blur': [
// 			{
// 			    'vshader': 'blurVShader',
// 			    'fshader': 'blurFShader',
// 			    // attributes
// 			    'attributes':
// 				 {
// 				     'a_pos': { 'type': 'vec3' },
// 				     'a_uv': { 'type': 'vec2' }
// 				 },
// 			    // parameters
// 			    'params':
// 				 {
// 				     'u_blurSourceMap': { 'type': "tex2d" }
// 				 },
// 			    // render states
// 			    'states':
// 				 {
// 				     'culling': false
// 				 }
// 			}
// 		]
//     }
// };

/*
* defines a primitive using java script native types
*/
RDGE.rdgePrimitiveDefinition = function () {
    /*
    *	The type of primitive
    *	supported types are
    *	renderer.POINTS      
    *  renderer.LINES          
    *	renderer.LINE_LOOP      
    *	renderer.LINE_STRIP     
    *	renderer.TRIANGLES      
    *	renderer.TRIANGLE_STRIP 
    *	renderer.TRIANGLE_FAN   
    */
    this.type = RDGE.rdgeConstants.TRIANGLE_STRIP;

    /*
    *	Define vertex elements size in bytes and order the element appears in the stream
    *  Predefined size types:
    *  renderer.VS_ELEMENT_FLOAT4
    *	renderer.VS_ELEMENT_FLOAT3
    *	renderer.VS_ELEMENT_FLOAT2
    *	renderer.VS_ELEMENT_FLOAT
    *	renderer.VS_ELEMENT_UINT16
    *	renderer.VS_ELEMENT_UINT8
    */
    this.vertexDefinition =
	{
	    // usage example: two ways of declaring a float 3 stream
	    //"vert"	:{	'type':renderer.VS_ELEMENT_POS, 'bufferIndex':indexIntoBufferStream,	'usage': renderer.BUFFER_STATIC }
	    //"a_pos"	:{	'type':renderer.VS_ELEMENT_POS, 'bufferIndex':indexIntoBufferStream,	'usage': renderer.BUFFER_STATIC }
	};

    /*
    *	Arrays of buffer data listed in the order given by the vertex definition
    */
    this.bufferStreams =
	[

	];

    /*
    *	An array indicating the the stream usage listed in the order given by the vertex definition
    *  Valid usage values: renderer.BUFFER_STATIC  The data store contents will be specified once by the application, and used many times
    *						renderer.BUFFER_DYNAMIC The data store contents will be respecified repeatedly by the application, and used many times
    *						renderer.BUFFER_STREAM  The data store contents will be specified once by the application, and used at most a few times
    */
    this.streamUsage =
	[

	];

    /*
    *	indicates the the stream usage of the index buffer
    *  Valid usage values: renderer.BUFFER_STATIC  The data store contents will be specified once by the application, and used many times
    *						renderer.BUFFER_DYNAMIC The data store contents will be respecified repeatedly by the application, and used many times
    *						renderer.BUFFER_STREAM  The data store contents will be specified once by the application, and used at most a few times
    */
    this.indexUsage = RDGE.rdgeConstants.BUFFER_STREAM;

    /*
    *	a references to an array of indices
    */
    this.indexBuffer =
	[
	];

    /*
    *	the number of sets of geometry in this primitive
    */
    this.setCount = 0;

    /*
    * Offset of a primitive in an index buffer
    *	if the primitive represents a set each set array has a corresponding index offset
    */
    this.indexOffsets =
	 [
	 ];

    //////////////////////////////////////////////////////////////
    //						OUTPUT VALUES						//
    //////////////////////////////////////////////////////////////

    /*
    *	the number of coordinates's that make this primitive
    *	auto populated with a call to renderer.createPrimitive
    */
    this.posCount = 0;

    /*
    *	the number of triangle that make up this primitive
    *	auto populated with a call to renderer.createPrimitive
    */
    this.triCount = 0;

    /*
    *	the number of indices in the primitive
    *	auto populated with a call to renderer.createPrimitive
    */
    this.indexCount = 0;

    /*
    *	size of an index value in bytes
    */
    this.indexElementSize = RDGE.rdgeConstants.UNSIGNED_SHORT;

    /*
    *	bufferHanldes are created when passing a primitive to renderer.createPrimitive
    *	An array of handles to buffers in vram, listed in the order given by the vertex definition
    */
    this.bufferHandles =
	[
	];

    /*
    *	An index into the buffers table for the render context that created the buffer
    */
    this.buffersID = -1;

    /*
    *	Handle to index buffer object
    */
    this.indexHandle = null;


    /*
    *	------------------- Double buffer Setup-----------------------------
    */

    /*
    *	user flag used to create a double buffered primitive
    *	Double buffer flag - when double buffered a .front() and .back() buffer
    *	are available as well as a call .flip() to flip the buffers
    */
    this.useDoubleBuffer = false;

    /*
    *	The double buffer offset tells the renderer where in its 'bufferID' array for this primitive the 'doubled' buffers begin
    */
    this.doubleBufferOffset = 0;

    /*
    *	Keeps track of which buffer is the front buffer or active buffer
    */
    this.frontBufferIndex = 0;

    /*
    *	Helper function for retrieving the buffer for editing - successfully calling this makes the buffer dirty and will trigger a buffer swap
    *	@param bufIndex - buffer stream index
    *	@return buffer stream requested, or null if invalid index is given
    */
    this.update = function (bufIndex) {
        if (!this.bufferStreams[bufIndex])
            return null;

        this.bufferStreams[bufIndex].dirty = true;
        return this.bufferStreams[bufIndex];
    };


    /*
    *	Flips the front and back buffers
    */
    this.flip = function (renderer) {
        if (this.useDoubleBuffer === true) {
            // if a back buffer is dirty update it
            for (var i = 0, len = this.bufferStreams.length; i < len; ++i) {
                if (this.bufferStreams[i].dirty) {
                    this.bufferStreams[i].dirty = false;
                    renderer.updateBuffer(renderer.buffers[this.buffersID][this.frontBufferIndex * this.doubleBufferOffset + i], this.bufferStreams[i], this.streamUsage[i]);
                    this.frontBufferIndex = 1 - this.frontBufferIndex;
                }
            }
        }
    };
};


// generate an id for the renderer to map a render buffer to primitive
RDGE._renderer.prototype._rendererID = 0;
RDGE._renderer.prototype.getBufferID = function () {
    return RDGE._renderer.prototype._rendererID++;
};
/*
* @param bufferSizeOrData:	an array of indices, or the size in bytes to preallocate
* @param bufferUsage:		BUFFER_STATIC  The data store contents will be specified once by the application, and used many times
*							BUFFER_DYNAMIC The data store contents will be respecified repeatedly by the application, and used many times
*							BUFFER_STREAM  The data store contents will be specified once by the application, and used at most a few times
* @return an unsigned short index buffer object
*/
RDGE._renderer.prototype.createIndexBufferUINT16 = function (bufferSizeOrData, bufferUsage) {
    var bufferObject = this.ctx.createBuffer();
    bufferObject.type = bufferSizeOrData.type;
    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, bufferObject);
    this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, (typeof k == "number")
			? bufferSizeOrData
			: new Uint16Array(bufferSizeOrData), bufferUsage);
    return bufferObject;
};

/*
* @param bufferSizeOrData:	an array of indices, or the size in bytes to preallocate
* @param bufferUsage:		BUFFER_STATIC  The data store contents will be specified once by the application, and used many times
*							BUFFER_DYNAMIC The data store contents will be respecified repeatedly by the application, and used many times
*							BUFFER_STREAM  The data store contents will be specified once by the application, and used at most a few times
* @return an unsigned byte index buffer object
*/
RDGE._renderer.prototype.createIndexBufferUINT8 = function (bufferSizeOrData, bufferUsage) {
    var bufferObject = this.ctx.createBuffer();
    bufferObject.type = bufferSizeOrData.type;
    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, bufferObject);
    this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, (typeof k == "number")
			? bufferSizeOrData
			: new Uint8Array(bufferSizeOrData), bufferUsage);
    return bufferObject;
};

/*
* @param bufferSizeOrData:	a buffer of data the represents a stream in a vertex, or the size in bytes to preallocate
* @param bufferUsage:		BUFFER_STATIC  The data store contents will be specified once by the application, and used many times
*							BUFFER_DYNAMIC The data store contents will be respecified repeatedly by the application, and used many times
*							BUFFER_STREAM  The data store contents will be specified once by the application, and used at most a few times
* @return an unsigned byte index buffer object
*/
RDGE._renderer.prototype.createBufferFLOAT32 = function (bufferSizeOrData, bufferUsage) {
    var bufferObject = this.ctx.createBuffer();
    bufferObject.type = bufferSizeOrData.type;
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, bufferObject);
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, (typeof k == "number")
			? bufferSizeOrData
			: new Float32Array(bufferSizeOrData), bufferUsage);
    return bufferObject;
};

/*
* @param bufferSizeOrData:	a buffer of data the represents a stream in a vertex, or the size in bytes to preallocate
* @param bufferUsage:		BUFFER_STATIC  The data store contents will be specified once by the application, and used many times
*							BUFFER_DYNAMIC The data store contents will be respecified repeatedly by the application, and used many times
*							BUFFER_STREAM  The data store contents will be specified once by the application, and used at most a few times
* @return an unsigned byte index buffer object
*/
RDGE._renderer.prototype.createBufferINT32 = function (bufferSizeOrData, bufferUsage) {
    var bufferObject = this.ctx.createBuffer();
    bufferObject.type = bufferSizeOrData.type;
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, bufferObject);
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, (typeof k == "number")
		? bufferSizeOrData
		: new Int32Array(bufferSizeOrData), bufferUsage);
    return bufferObject;
};

/*
* @param bufferSizeOrData:	a buffer of data the represents a stream in a vertex, or the size in bytes to preallocate
* @param bufferUsage:		BUFFER_STATIC  The data store contents will be specified once by the application, and used many times
*							BUFFER_DYNAMIC The data store contents will be respecified repeatedly by the application, and used many times
*							BUFFER_STREAM  The data store contents will be specified once by the application, and used at most a few times
* @return an unsigned byte index buffer object
*/
RDGE._renderer.prototype.createBufferINT16 = function (bufferSizeOrData, bufferUsage) {
    var bufferObject = this.ctx.createBuffer();
    bufferObject.type = bufferSizeOrData.type;
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, bufferObject);
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, (typeof k == "number")
		? bufferSizeOrData
		: new Int16Array(bufferSizeOrData), bufferUsage);
    return bufferObject;
};

RDGE._renderer.prototype.updateBuffer = function (dstBuffer, srcBuffer, bufferUsage, vertexOffset) {
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, dstBuffer);
    if (bufferUsage === RDGE.rdgeConstants.BUFFER_DYNAMIC) {
        // use bufferSubData
        this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, vertexOffset || 0, new Float32Array(srcBuffer));
    }
    else {
        // re-create the buffer
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(srcBuffer), bufferUsage);
    }
};

/*
*	@param primitiveDef defines a primitive using java script types, creates the video ram objects and attaches them to the primitive passed in
*/
RDGE._renderer.prototype.createPrimitive = function (primitiveDef) {
    if (!primitiveDef.built) {
        // store the buffer handle with the renderer as it is context specific, creating an ID to look up the buffer at render time
        primitiveDef.buffersID = this.getBufferID();
        primitiveDef.built = true;
    }
    else if (this.buffers[primitiveDef.buffersID]) {
        // already created
        return;
    }

    // this mapping in the array holds an array of buffers
    this.buffers[primitiveDef.buffersID] = [];
    this.buffers[primitiveDef.buffersID].ctxId = this.id;

    // set up buffers
    this.updatePrimitive(primitiveDef);
};

/*
*	@param primitiveDef defines a primitive using java script types, creates the video ram objects and attaches them to the primitive passed in
*/
RDGE._renderer.prototype.updatePrimitive = function (prim) {
    if (!prim.built) {
        this.createPrimitive(prim);
        return;
    }

    var bufIdxVisited = [];

    for (var e in prim.vertexDefinition) {
        var vert_element = prim.vertexDefinition[e];

        if (bufIdxVisited.indexOf(vert_element.bufferIndex) > -1)
            continue;
        bufIdxVisited.push(vert_element.bufferIndex);

        vert_element.debugName = e + " buffer";

        // flag the positional data
        if (vert_element.type == this.VS_ELEMENT_POS) {
            prim.posCount = prim.bufferStreams[vert_element.bufferIndex].length;

            // save a reference to the coordinates for later
            prim.positions = prim.bufferStreams[vert_element.bufferIndex];
        }

        // if we have not already created the buffer - do so now
        if (this.buffers[prim.buffersID][vert_element.bufferIndex] == undefined) {
            prim.bufferStreams[vert_element.bufferIndex].type = e + " PrimaryBuffer";

            if (prim.forceVertexCount) {
                this.buffers[prim.buffersID][vert_element.bufferIndex] = this.createBufferFLOAT32(4 * prim.forceVertexCount, vert_element.bufferUsage);
                this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, 0, new Float32Array(prim.bufferStreams[vert_element.bufferIndex]), vert_element.bufferUsage);
            }
            else {
                this.buffers[prim.buffersID][vert_element.bufferIndex] = this.createBufferFLOAT32(prim.bufferStreams[vert_element.bufferIndex], vert_element.bufferUsage);
            }
        }
        else {
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.buffers[prim.buffersID][vert_element.bufferIndex]);
            this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, 0, new Float32Array(prim.bufferStreams[vert_element.bufferIndex]), vert_element.bufferUsage);
        }

        // double up the buffer
        if (prim.useDoubleBuffer === true) {
            prim.doubleBufferOffset = prim.bufferStreams.length

            // debug data
            prim.bufferStreams[vert_element.bufferIndex].type = e + " SecondaryBuffer";

            // store double buffer at the doubleBuffer offset
            if (this.buffers[prim.buffersID][prim.doubleBufferOffset + vert_element.bufferIndex] == undefined) {
                if (prim.forceVertexCount) {
                    this.buffers[prim.buffersID][prim.doubleBufferOffset + vert_element.bufferIndex] = this.createBufferFLOAT32(4 * prim.prim.forceVertexCount, vert_element.bufferUsage);
                    this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, 0, new Float32Array(prim.bufferStreams[vert_element.bufferIndex]), vert_element.bufferUsage);
                }
                else {
                    this.buffers[prim.buffersID][prim.doubleBufferOffset + vert_element.bufferIndex] = this.createBufferFLOAT32(prim.bufferStreams[vert_element.bufferIndex], vert_element.bufferUsage);
                }
            }
            else {
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.buffers[prim.buffersID][prim.doubleBufferOffset + vert_element.bufferIndex]);
                this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, 0, new Float32Array(prim.bufferStreams[vert_element.bufferIndex]), vert_element.bufferUsage);
            }
        }
    }

    if (prim.indexBuffer.length > 0) {
        var indexBufLength = prim.indexBuffer.length;
        prim.indexBuffer.debugName = "index Buffer";

        if (this.buffers[prim.buffersID].indexHandle == undefined) {
            if (prim.forceIndexCount) {
                this.buffers[prim.buffersID].indexHandle = this.createIndexBufferUINT16(2 * prim.forceIndexCount, prim.indexUsage);
                this.ctx.bufferSubData(this.ctx.ELEMENT_ARRAY_BUFFER, 0, new Float32Array(prim.indexBuffer), prim.indexUsage);
            }
            else {
                this.buffers[prim.buffersID].indexHandle = this.createIndexBufferUINT16(prim.indexBuffer, prim.indexUsage);
            }
        }
        else {
            this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.buffers[prim.buffersID].indexHandle);
            this.ctx.bufferSubData(this.ctx.ELEMENT_ARRAY_BUFFER, 0, new Float32Array(prim.indexBuffer), prim.indexUsage);
        }

        prim.indexCount = indexBufLength;
        prim.triCount = indexBufLength / 3;
    }
    else {
        prim.triCount = prim.posCount / 3;
    }
};

/*
*	@param prim the primitive to delete from the GL context
*/
RDGE._renderer.prototype.deletePrimitive = function (prim) {
    var buffers = this.buffers[prim.buffersID];

    if (buffers) {
        var self = this;

        buffers.forEach(function (thisBuffer) {
            self.ctx.deleteBuffer(thisBuffer);
        });

        delete this.buffers[prim.buffersID];
    }
};

/*
*	@param prim the primitive for which to retrieve the GL VBO handle
*  @param bufferIndex which buffer name to retrieve
*/
RDGE._renderer.prototype.getPrimitiveBuffer = function (prim, bufferIndex) {
    return this.buffers[prim.buffersID][bufferIndex];
};

RDGE._renderer.prototype.drawPrimitive = function (prim, program, attribs) {
    if (prim.indexCount) {
        this.drawIndexedPrimitive(prim, program, attribs)
    }
    else {
        this.drawNonIndexedPrimitive(prim, program, attribs)
    }

    if (prim.useDoubleBuffer === true) {
        // after drawing flip the buffer
        prim.flip(this);
    }
};

/*
*	Draws a single primitive using indices
*	@param: prim a single primitive
*/
RDGE._renderer.prototype.drawIndexedPrimitive = function (prim, program, attribs) {
    var bufferIndex = 0;
    var loc = 0;
    var buffersId = prim.buffersID;
    var name = "";
    var attrCount = attribs.length
    var attrIdx = 0;
    var dbOffset = prim.frontBufferIndex * prim.doubleBufferOffset;

    var ctx = RDGE.globals.engine.getContext();

    for (; attrIdx < attrCount; ++attrIdx) {
        loc = attribs[attrIdx].loc;
        name = attribs[attrIdx].name;

        if (!prim.vertexDefinition[name])
            continue;

        bufferIndex = prim.vertexDefinition[name].bufferIndex;

        this.ctx.enableVertexAttribArray(loc);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.buffers[buffersId][dbOffset + bufferIndex]);
        this.ctx.vertexAttribPointer(loc, prim.vertexDefinition[name].type, this.FLOAT, false, 0, 0);
    }

    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.buffers[buffersId].indexHandle);

    this.ctx.drawElements(prim.type, prim.indexCount, prim.indexElementSize, 0);

    for (attrIdx = 0; attrIdx < attrCount; ++attrIdx) {
        this.ctx.disableVertexAttribArray(attribs[attrIdx].loc);
    }
};

/*
*	Draws a single primitive using indices in wireframe mode
*	@param: prim a single primitive
*/
RDGE._renderer.prototype.drawIndexedPrimitiveWireFrame = function (prim, program, attribs) {
    var bufferIndex = 0;
    var loc = 0;
    var buffersId = prim.buffersID;
    var name = "";
    var attrCount = attribs.length
    var attrIdx = 0;
    var dbOffset = prim.frontBufferIndex * prim.doubleBufferOffset;

    for (; attrIdx < attrCount; ++attrIdx) {
        loc = attribs[attrIdx].loc;
        name = attribs[attrIdx].name;

        if (!prim.vertexDefinition[name])
            continue;

        bufferIndex = prim.vertexDefinition[name].bufferIndex;

        this.ctx.enableVertexAttribArray(loc);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.buffers[buffersId][dbOffset + bufferIndex]);
        this.ctx.vertexAttribPointer(loc, prim.vertexDefinition[name].type, this.FLOAT, false, 0, 0);
    }

    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, this.buffers[buffersId].indexHandle);

    this.ctx.drawElements(this.LINE_LOOP, prim.indexCount, prim.indexElementSize, 0);

    for (attrIdx = 0; attrIdx < attrCount; ++attrIdx) {
        this.ctx.disableVertexAttribArray(attribs[attrIdx].loc);
    }
};

/*
*	Draws a single primitive (non-indexed primitive)
*	@param: prim a single primitive
*/
RDGE._renderer.prototype.drawNonIndexedPrimitive = function (prim, program, attribs) {
    var bufferIndex = 0;
    var loc = 0;
    var buffersId = prim.buffersID;
    var name = "";
    var attrCount = attribs.length
    var attrIdx = 0;
    var dbOffset = prim.frontBufferIndex * prim.doubleBufferOffset;

    for (; attrIdx < attrCount; ++attrIdx) {
        loc = attribs[attrIdx].loc;
        name = attribs[attrIdx].name;

        bufferIndex = prim.vertexDefinition[name].bufferIndex;

        if (!prim.vertexDefinition[name])
            continue;

        this.ctx.enableVertexAttribArray(loc);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.buffers[buffersId][dbOffset + bufferIndex]);
        this.ctx.vertexAttribPointer(loc, prim.vertexDefinition[name].type, this.FLOAT, false, 0, 0);
    }

    this.ctx.drawArrays(prim.type, 0, prim.triCount);

    for (attrIdx = 0; attrIdx < attrCount; ++attrIdx) {
        this.ctx.disableVertexAttribArray(attribs[attrIdx].loc);
    }
};

/*
*	Not yet supported but stubbed out here
*/
RDGE._renderer.prototype.drawIndexedPrimitiveSet = function (prim) {
    window.alert("drawIndexedPrimitiveSet is not implemented");
    for (var i = 0; i < prim.setCount; ++i) {
        this.ctx.drawElements(prim.type[i], mesh.numIndices[i], prim.indexElementSize[i], prim.indexOffsets[i]);
    }
};

// currently not used in Ninja
/*
RDGE.renderDebug = function (maxLines) {
    this.renderer = RDGE.globals.engine.getContext().renderer;
    this.ctx = RDGE.globals.engine.getContext().renderer.ctx;
    this.hidden = false;
    this.maxLines = maxLines;
    this.lineBuffer = [];
    this.posBufferData = new Float32Array(3 * this.maxLines);
    this.colorBufferData = new Float32Array(4 * this.maxLines);
    this.posBufferObject = renderer.createBufferFLOAT32(this.posBufferData, this.renderer.BUFFER_DYNAMIC);
    this.colorBufferObject = renderer.createBufferFLOAT32(this.colorBufferData, this.renderer.BUFFER_DYNAMIC);
    this.shader = new RDGE.jshader();
    this.shader.def = {
        'shaders': {
            'defaultVShader': "\
				uniform mat4 u_mvMatrix;\
				uniform mat4 u_projMatrix;\
				attribute vec3	a_pos;\
				attribute vec4  a_color;\
				varying vec4 v_color;\
				void main() {\
					gl_Position = u_projMatrix * u_mvMatrix * vec4(a_pos,1.0);\
					v_color = a_color;\
				}",
            'defaultFShader': "\
				precision mediump float;\
				varying vec4 v_color;\
				void main() {\
					gl_FragColor = v_color;\
					gl_FragColor.a = 1.0;\
				}"
        },
        'techniques': {
            'defaultTechnique': [{
                'vshader': 'defaultVShader',
                'fshader': 'defaultFShader',
                'attributes': {
                    'a_pos': { 'type': 'vec3' },
                    'a_color': { 'type': 'vec4' }
                },

                'params': {
                    'u_projMat': { 'type': 'mat4' },
                    'u_viewMat': { 'type': 'mat4' }
                }
            }]
        }
    }
    this.shader.init();
};

RDGE.renderDebug.prototype.hide = function () {
    this.hidden = true;
};

RDGE.renderDebug.prototype.show = function () {
    this.hidden = false;
};

RDGE.renderDebug.prototype.line = function (p0, p1, c0, c1) {
    if (this.hidden) {
        return;
    }

    if (c0 == undefined) {
        c0 = [1.0, 1.0, 1.0, 1.0];
    }
    if (c1 == undefined) {
        c1 = c0;
    }
    this.lineBuffer.push([p0, p1, c0, c1]);
};

RDGE.renderDebug.prototype.box = function (min, max, c) {
    this.line([min[0], min[1], min[2]], [max[0], min[1], min[2]], c, c);
    this.line([max[0], min[1], min[2]], [max[0], max[1], min[2]], c, c);
    this.line([max[0], max[1], min[2]], [min[0], max[1], min[2]], c, c);
    this.line([min[0], max[1], min[2]], [min[0], min[1], min[2]], c, c);
    this.line([min[0], min[1], max[2]], [max[0], min[1], max[2]], c, c);
    this.line([max[0], min[1], max[2]], [max[0], max[1], max[2]], c, c);
    this.line([max[0], max[1], max[2]], [min[0], max[1], max[2]], c, c);
    this.line([min[0], max[1], max[2]], [min[0], min[1], max[2]], c, c);

    this.line([max[0], min[1], min[2]], [max[0], min[1], max[2]], c, c);
    this.line([max[0], max[1], min[2]], [max[0], max[1], max[2]], c, c);
    this.line([min[0], max[1], min[2]], [min[0], max[1], max[2]], c, c);
    this.line([min[0], min[1], min[2]], [min[0], min[1], max[2]], c, c);
};

RDGE.renderDebug.prototype.frustum = function (p, c) {
    this.line(p[0], p[1], c, c);
    this.line(p[1], p[2], c, c);
    this.line(p[2], p[3], c, c);
    this.line(p[3], p[4], c, c);
    this.line(p[4], p[5], c, c);
    this.line(p[5], p[6], c, c);
    this.line(p[6], p[7], c, c);
};

RDGE.renderDebug.prototype.sphere = function (p, r, c) {
    var rho = 0.0;
    var rho_step = Math.PI / 8.0;

    var phi = 0.0;
    var phi_step = 2.0 * Math.PI / 8.0;
    while (rho < Math.PI) {
        var srho = Math.sin(rho);
        var crho = Math.cos(rho);
        while (phi < 2.0 * Math.PI) {
            var sphi = Math.sin(phi);
            var cphi = Math.cos(phi);

            var x0 = p[0] + cphi * srho * r;
            var y0 = p[1] + crho * r;
            var z0 = p[2] + sphi * srho * r;
            phi += phi_step;

            sphi = Math.sin(phi);
            cphi = Math.cos(phi);
            var x1 = p[0] + cphi * srho * r;
            var y1 = p[1] + crho * r;
            var z1 = p[2] + sphi * srho * r;
            phi += phi_step;

            this.line([x0, y0, z0],
					  [x1, y1, z1], c);
        }
        rho += rho_step;
    }
};

RDGE.renderDebug.prototype.flush = function () {
    var drawCalls = 0;
    var activeCam = this.renderer.cameraManager().getActiveCamera();

    RDGE.mat4.inplace_copy(this.ctx.projectionMatrix, activeCam.proj);
    RDGE.mat4.inplace_copy(this.ctx.mvMatrix, activeCam.view);
    while (this.lineBuffer.length > 0) {
        var count = Math.min(this.lineBuffer.length, this.maxLines);
        var index = 0;
        while (count > 0) {
            var line = this.lineBuffer.shift();
            var i6 = index * 6;
            var i8 = index * 8;
            this.posBufferData[i6 + 0] = line[0][0];
            this.posBufferData[i6 + 1] = line[0][1];
            this.posBufferData[i6 + 2] = line[0][2];
            this.posBufferData[i6 + 3] = line[1][0];
            this.posBufferData[i6 + 4] = line[1][1];
            this.posBufferData[i6 + 5] = line[1][2];
            this.colorBufferData[i8 + 0] = line[2][0];
            this.colorBufferData[i8 + 1] = line[2][1];
            this.colorBufferData[i8 + 2] = line[2][2];
            this.colorBufferData[i8 + 3] = line[2][3];
            this.colorBufferData[i8 + 4] = line[3][0];
            this.colorBufferData[i8 + 5] = line[3][1];
            this.colorBufferData[i8 + 6] = line[3][2];
            this.colorBufferData[i8 + 7] = line[3][3];
            count--;
            index++;
            if (count <= 0) {
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.posBufferObject);
                this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, 0, null);
                this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, 0, this.posBufferData);

                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.colorBufferObject);
                this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, 0, null);
                this.ctx.bufferSubData(this.ctx.ARRAY_BUFFER, 0, this.colorBufferData);

                this.ctx.disable(this.ctx.DEPTH_TEST);
                this.shader.begin();
                this.shader.beginPass(0);
                this.ctx.enableVertexAttribArray(0);
                this.ctx.enableVertexAttribArray(1);

                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.posBufferObject);
                this.ctx.vertexAttribPointer(0, 3, this.ctx.FLOAT, false, 0, 0);

                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.colorBufferObject);
                this.ctx.vertexAttribPointer(1, 4, this.ctx.FLOAT, false, 0, 0);

                this.ctx.drawArrays(this.ctx.LINES, 0, index * 2);
                this.shader.endPass();
                this.shader.end();
                this.ctx.enable(this.ctx.DEPTH_TEST);
                drawCalls++;
                this.ctx.finish();
                this.ctx.flush();
                break;
            }
        }
    }
};
*/
