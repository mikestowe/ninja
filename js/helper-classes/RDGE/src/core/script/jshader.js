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

/*
this API should be familiar to anyone who has worked with HLSL effect files.
*/

/*
 *  A map of types to uniform 'binding' functions
 */
RDGE.bindMap={};
RDGE.bindMap['int']     = function(ctx, a,b) { ctx.uniform1iv(a,b); };
RDGE.bindMap['float']   = function(ctx, a,b) { ctx.uniform1fv(a,b); };
RDGE.bindMap['vec2']        = function(ctx, a,b) { ctx.uniform2fv(a,b); };
RDGE.bindMap['vec3']        = function(ctx, a,b) { ctx.uniform3fv(a,b); };
RDGE.bindMap['vec4']        = function(ctx, a,b) { ctx.uniform4fv(a,b); };
RDGE.bindMap['mat3']        = function(ctx, a,b) { ctx.uniformMatrix3fv(a,false,b); };
RDGE.bindMap['mat4']        = function(ctx, a,b)
{
    ctx.uniformMatrix4fv(a,false,b);
    RDGE.globals.engine.getContext().debug.mat4CallCount++;
};

RDGE.bindMap['tex2d']   = function(ctx, a,b)
{
    ctx.activeTexture(ctx.TEXTURE0+b[0]);
    ctx.bindTexture(ctx.TEXTURE_2D, b[1]);
    ctx.uniform1iv(a,[b[0]]);
};

RDGE.bindMap['texCube']=function(ctx, a,b)
{
    ctx.activeTexture(ctx.TEXTURE0+b[0]);
    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, b[1]);
    ctx.uniform1iv(a,[b[0]]);
};

RDGE.lightDataMap =
[
    function(ctx, loc, lightNode) { ctx.uniform3fv(loc, lightNode.position); },
    function(ctx, loc, lightNode) { ctx.uniform4fv(loc, lightNode.lightDiffuse); },
    function(ctx, loc, lightNode) { ctx.uniform4fv(loc, lightNode.lightAmbient); },
    function(ctx, loc, lightNode) { ctx.uniform4fv(loc, lightNode.lightSpecular); }
];

RDGE.paramTypeNameMapping = null;

RDGE.jshader = function (addr) {
    this.name = addr;
    this.def = null;
    this.technique = {};
    this.params = {};
    this.compiledShaders = {};
    this.resetRS = false;
    this.currentPass = 0;
    this.type_jshader = {};
    this.global = {};
    this.renderer = RDGE.globals.engine.getContext().renderer;
    this.ctx = this.renderer.ctx;

    // load jshader definition at addr (if provided)
    if (addr != undefined && addr != null) {
        // a synchronous ajax request
        request = new XMLHttpRequest();
        request.open("GET", addr, false);
        request.send(null);
        this.def = JSON.parse(request.responseText);
    }

    if (!RDGE.paramTypeNameMapping) {
        var gl = this.ctx;
        RDGE.paramTypeNameMapping = {};
        RDGE.paramTypeNameMapping[gl.BOOL] = "bool";
        RDGE.paramTypeNameMapping[gl.INT] = "int";
        RDGE.paramTypeNameMapping[gl.FLOAT] = "float";
        RDGE.paramTypeNameMapping[gl.FLOAT_VEC2] = "vec2";
        RDGE.paramTypeNameMapping[gl.FLOAT_VEC3] = "vec3";
        RDGE.paramTypeNameMapping[gl.FLOAT_VEC4] = "vec4";
        RDGE.paramTypeNameMapping[gl.INT_VEC2] = "vec2";
        RDGE.paramTypeNameMapping[gl.INT_VEC3] = "vec3";
        RDGE.paramTypeNameMapping[gl.INT_VEC4] = "vec4";
        RDGE.paramTypeNameMapping[gl.BOOL_VEC2] = "vec2";
        RDGE.paramTypeNameMapping[gl.BOOL_VEC3] = "vec3";
        RDGE.paramTypeNameMapping[gl.BOOL_VEC4] = "vec4";
        RDGE.paramTypeNameMapping[gl.FLOAT_MAT2] = "mat2";
        RDGE.paramTypeNameMapping[gl.FLOAT_MAT3] = "mat3";
        RDGE.paramTypeNameMapping[gl.FLOAT_MAT4] = "mat4";
        RDGE.paramTypeNameMapping[gl.SAMPLER_2D] = "tex2d";
        RDGE.paramTypeNameMapping[gl.SAMPLER_CUBE] = "texCube";
    }

    /*
    *   private helper functions
    */
    this.bindParameters = function (pass) {
        var params = pass.defParamsList; // global parameters to start with
        var lightParams = pass.lightParams;
        var lightContext = pass.lightContext;
        var length = params.length;
        var idx = 0;
        var texArg = new Array(2)

        // global parameters
        var texUnit = 0;
        for (idx = 0; idx < length; ++idx) {
            if (params[idx].type == 'tex2d' || params[idx].type == 'texCube') {
                texArg[0] = texUnit++;
                texArg[1] = params[idx].data[0];
                RDGE.bindMap[params[idx].type](this.ctx, params[idx].loc, texArg);
            }
            else {
                RDGE.bindMap[params[idx].type](this.ctx, params[idx].loc, RDGE.rdgeGlobalParameters[params[idx].name].data);
            }
        }

        // light settings defined by the material
        var len = RDGE.rdgeConstants.MAX_MATERIAL_LIGHTS;
        for (var i = 0; i < len; ++i) {
            // if there is a context for a light check to see if we have a binding to the light
            if (lightContext[i] != null) {
                // see if we have parameters to bind to this light
                if (lightParams[i]) {
                    // something is here lets bind it
                    var numParams = lightParams[i].length;
                    for (var lp = 0; lp < numParams; ++lp) {
                        // bind the parameters using the lightDataMap function lookup, dataIndex is the key
                        RDGE.lightDataMap[lightParams[i][lp].dataIndex](this.ctx, lightParams[i][lp].loc, lightContext[i]);
                    }
                }
            }
        }

        // let locally defined uniforms stomp globally defined uniforms
        texUnit = this.renderer.usedTextureUnits; // start adding texture after the default textures
        params = pass.paramsList;
        length = params.length;
        for (idx = 0; idx < length; ++idx) {
            if (params[idx].type == 'tex2d' || params[idx].type == 'texCube') {
                texArg[0] = texUnit++;
                texArg[1] = params[idx].data[0];
                RDGE.bindMap[params[idx].type](this.ctx, params[idx].loc, texArg);
            }
            else {
                RDGE.bindMap[params[idx].type](this.ctx, params[idx].loc, params[idx].data);
            }
        }
    };

    /*
    *   helper function for setting up a texture
    */
    createJShaderTexture = function (ctx, param) {
        var texHandle = null;
        if (typeof param.data == "string") {
            texHandle = ctx.canvas.renderer.getTextureByName(param.data, param.wrap, param.repeat, param.mips);
        }
        else {
            texHandle = ctx.canvas.renderer.getTextureByName(param.data.lookUpName, param.wrap, param.repeat, param.mips);
        }

        return [texHandle];
    };

    paramType = function (ctx, name, def, program, technique) {
        var texUnit = 0;

        // Get the uniform location and store it
        this.loc = ctx.getUniformLocation(program, name);

        // if the parameter does not exist in the shader cull it from the pass
        if (this.loc == null) {
            window.console.log("ctx:" + ctx.canvas.rdgeid + ", technique: " + technique + ", uniform: " + name + " was not found, jshader param will have no affect");
            //return;
        }

        var param = def[name];
        this.type = param.type;

        // if data was not provided then create default data
        if (param.data == undefined) {
            switch (param.type) {
                case "vec4": this.data = RDGE.vec4.zero(); break;
                case "vec3": this.data = RDGE.vec3.zero(); break;
                case "vec2": this.data = RDGE.vec2.zero(); break;
                case "mat4": this.data = RDGE.mat4.zero(); break;
                case "mat3": this.data = new Array(9); break;
                case "mat2": this.data = [0, 0, 0, 0]; break;
                case "float": this.data = [0]; break;
                case "int": this.data = [0]; break;
                case "tex2d": this.data = [ctx.canvas.renderer.getTextureByName(RDGE.globals.engine._assetPath+"images/white.png")]; break;
                case "texCube": this.data = [ctx.canvas.renderer.getTextureByName(RDGE.globals.engine._assetPath+"images/white.png")]; break;
            }
        }
        else {
            if (param.type == 'tex2d' || param.type == 'texCube') {
                this.data = createJShaderTexture(ctx, param);
            }
            else {
                this.data = param.data.slice();
            }
        }

        this.get = function () {
            return this.data.slice();
        };

        this.set = function (v) {
            if (this.type == 'tex2d' || this.type == 'texCube') {
                if (typeof v == "string") {
                    v = ctx.canvas.renderer.getTextureByName(v);
                }

                this.data[0] = v;
            }
            else {
                var len = this.data.length;
                for (var i = 0; i < len; ++i)
                    this.data[i] = v[i];
            }
        };
    };

    globalParam = function (ctx, name, param, program) {
        this.type = param.type;

        this.data = param.data;

        // Get the uniform location and store it
        this.loc = ctx.getUniformLocation(program, name);

        // if data was not provided then create default data
        if (!this.data) {
            switch (param.type) {
                case "vec4": this.data = RDGE.vec4.zero(); break;
                case "vec3": this.data = RDGE.vec3.zero(); break;
                case "vec2": this.data = RDGE.vec2.zero(); break;
                case "mat4": this.data = RDGE.mat4.zero(); break;
                case "mat3": this.data = new Array(9); break;
                case "mat2": this.data = [0, 0, 0, 0]; break;
                case "float": this.data = [0]; break;
                case "int": this.data = [0]; break;
                case "tex2d": this.data = [ctx.canvas.renderer.getTextureByName(RDGE.globals.engine._assetPath+"images/white.png")]; break;
                case "texCube": this.data = [ctx.canvas.renderer.getTextureByName(RDGE.globals.engine._assetPath+"images/white.png")]; break;
            }
        }
        else {
            if (param.type == 'tex2d' || param.type == 'texCube') {
                this.data = createJShaderTexture(ctx, param);
            }
            else {
                this.data = param.data.slice();
            }
        }

        this.get = function () {
            return this.data.slice();
        };

        this.set = function (v) {
            if (this.type == 'tex2d' || this.type == 'texCube') {
                if (typeof v == "string") {
                    v = ctx.canvas.renderer.getTextureByName(v);
                }

                this.data[0] = v;
            }
            else {
                var len = this.data.length;
                for (var i = 0; i < len; ++i)
                    this.data[i] = v[i];
            }
        };
    };


    this.init = function () {
        var techniques = this.def.techniques;
        var defaultTech = null;
        for (t in techniques) {
            defaultTech = t;
            var curTechnique = techniques[t];
            this[t] =
            {
                'passes': []
            };
            var numPasses = curTechnique.length;
            var i = 0;
            while (i < numPasses) {
                var program = this.buildProgram(curTechnique[i]);
                this.ctx.useProgram(program);

                // automatically create a parameter def for every active attribute in the shader.
                var numAttribs = this.ctx.getProgramParameter(program, this.ctx.ACTIVE_ATTRIBUTES);
                for (j = 0; j < numAttribs; ++j) {
                    var attribInfo = this.ctx.getActiveAttrib(program, j);
                    curTechnique[i].attributes[attribInfo.name] = { 'type': RDGE.paramTypeNameMapping[attribInfo.type] };
                }
                // automatically create a parameter def for every active uniform in the shader.
                var numUniforms = this.ctx.getProgramParameter(program, this.ctx.ACTIVE_UNIFORMS);
                for (j = 0; j < numUniforms; ++j) {
                    var uniformInfo = this.ctx.getActiveUniform(program, j);
                    if (!RDGE.rdgeGlobalParameters[uniformInfo.name]) {
                        curTechnique[i].params[uniformInfo.name] = { 'type': RDGE.paramTypeNameMapping[uniformInfo.type] };
                    }
                }

                program.ctxId = this.ctx.canvas.rdgeid;
                if (!program) {
                    this.renderer.console.log("Build errors found in technique: " + t);
                    this.def[t] = null; // remove bad technique
                    break;
                } else {
                    this[t].passes.push({ "program": program, "params": {}, "defParams": {}, "states": curTechnique[i].states, "attributes": curTechnique[i].attribPairs });
                }

                // init default parameters
                for (var p in RDGE.rdgeGlobalParameters) {
                    var gp = new globalParam(this.ctx, p, RDGE.rdgeGlobalParameters[p], program);

                    if (gp.loc != null) {
                        gp.loc.ctxID = this.ctx.canvas.rdgeid;
                        this[t].passes[i].defParams[p] = gp;
                        this.global[p] = gp;
                    }
                }

                // attach light parameters and container to light context
                this[t].passes[i].lightParams = [null, null, null, null];
                this[t].passes[i].lightContext = [null, null, null, null];

                // attach a parameter list that will be used to optimize binding attributes
                if (!this[t].passes[i].paramsList)
                    this[t].passes[i].paramsList = [];

                // locate individual light parameters to bind with local context
                var totalLights = RDGE.rdgeConstants.MAX_MATERIAL_LIGHTS;
                for (var lightIdx = 0; lightIdx < totalLights; ++lightIdx) {

                    // clear parameter
                    this[t].passes[i].lightParams[lightIdx] = null;

                    // 0 = pos, 1 = diff, 2 = amb, 3 = spec
                    // this is order assumed for light parameters

                    // the parameter index key - lets us know which piece of data we are getting/setting
                    var lightDataIndex = 0;

                    for (var lp in RDGE.globals.engine.lightManager.lightUniforms[lightIdx]) {
                        loc = this.ctx.getUniformLocation(program, lp);

                        // if item found enable this light param and set parameters to bind and lookup data
                        if (loc != null) {
                            if (!this[t].passes[i].lightParams[lightIdx])
                                this[t].passes[i].lightParams[lightIdx] = [];

                            this[t].passes[i].lightParams[lightIdx].push({ 'loc': loc, 'name': lp, 'dataIndex': lightDataIndex });
                        }

                        lightDataIndex++;
                    }
                }



                // init user defined parameters
                for (var p in curTechnique[i].params) {
                    if (typeof curTechnique[i].params[p] == 'string') {
                        continue;
                    }

                    var newParam = new paramType(this.ctx, p, curTechnique[i].params, program, t);

                    // if(newParam.loc != null)
                    // {
                    this[t].passes[i].params[p] = newParam;
                    this[t][p] = newParam;
                    // }
                }

                // link up aliases
                for (var p in curTechnique[i].params) {
                    if (typeof curTechnique[i].params[p] == 'string') {
                        // this just redirects to an already existing parameter.
                        this[t][p] = this[t].passes[i].params[p];
                    }
                }

                i++;
            }
        }

        // create linear lists of parameters - optimization
        for (t in techniques) {
            var numPasses = this[t].passes.length;

            for (var i = 0; i < numPasses; ++i) {

                this[t].passes[i].defParamsList = [];

                for (var p in this[t].passes[i].params) {
                    var param = this[t].passes[i].params[p];
                    param.name = p;
                    this[t].passes[i].paramsList.push(param);
                }

                for (var p in this[t].passes[i].defParams) {
                    var param = this[t].passes[i].defParams[p];
                    param.name = p;
                    this[t].passes[i].defParamsList.push(param);
                }
            }
        }

        this.setTechnique(defaultTech);
    };

    /*
    *   Init a local parameter at any time during the life of the jshader.
    *  This will add the parameter to the list of parameters to be bound
    *  before rendering
    */
    this.initLocalParameter = function (name, param) {
        var techniques = this.def.techniques;
        for (t in techniques) {
            var curTechnique = techniques[t];
            var numPasses = curTechnique.length;
            var i = 0;
            while (i < numPasses) {
                var newParam = new paramType(this.ctx, name, param, curTechnique[i].program, t);
                if (newParam) {
                    curTechnique[i][name] = newParam;

                    // this params list is created here because a parameter could be added before the jshader is initialized
                    if (!curTechnique[i].paramsList)
                        curTechnique[i].paramsList = [];

                    curTechnique[i].paramsList.push(newParam);
                }

                i++;
            }
        }
    };

    this.buildShader = function (shaderType, shaderStr) {
        // pre-pend preprocessor settings
        var preProcessor = "#define PC\n"
        preProcessor += shaderStr;
        shaderStr = preProcessor;

        // Create the shader object
        var shader = this.ctx.createShader(shaderType);
        if (shader == null) {
            this.renderer.console.log("*** Error: unable to create shader '" + shaderType + "'");
            return null;
        }

        // Load the shader source
        this.ctx.shaderSource(shader, shaderStr);

        // Compile the shader
        this.ctx.compileShader(shader);

        // Check the compile status
        var compiled = this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS);
        if (!compiled) {
            // compile failed, report error.
            var error = this.ctx.getShaderInfoLog(shader);
            window.console.error("*** Error compiling shader '" + shaderType + "':" + error);
            this.ctx.deleteShader(shader);
            return null;
        }

        return shader;
    };

    this.buildProgram = function (t) {
        window.console.log("building shader pair: <" + t.vshader + ", " + t.fshader + ">");
        var vShaderDef = RDGE.globals.engine.remapAssetFolder(this.def.shaders[t.vshader]);
        var fShaderDef = RDGE.globals.engine.remapAssetFolder(this.def.shaders[t.fshader]);

        this.ctx.useProgram(null);

        var vertexShader = null;
        var source = null;

        if (vShaderDef.indexOf('{') != -1) {
            source = vShaderDef;
        } else {
            var vshaderRequest = new XMLHttpRequest();
            var urlVertShader = vShaderDef;
            vshaderRequest.open("GET", urlVertShader, false);
            vshaderRequest.send(null);
            source = vshaderRequest.responseText;
        }

        vertexShader = this.buildShader(this.ctx.VERTEX_SHADER, source);

        var fragmentShader = null;
        var source = null;
        if (vShaderDef.indexOf('{') != -1) {
            source = fShaderDef;
        } else {
            var vshaderRequest = new XMLHttpRequest();
            var urlFragShader = fShaderDef;
            vshaderRequest.open("GET", urlFragShader, false);
            vshaderRequest.send(null);
            source = vshaderRequest.responseText;
        }

        fragmentShader = this.buildShader(this.ctx.FRAGMENT_SHADER, source);

        if (!vertexShader || !fragmentShader) {
            return null;
        }

        this.compiledShaders[t.vshader] = vertexShader;
        this.compiledShaders[t.fshader] = fragmentShader;

        // Create the program object
        var program = this.ctx.createProgram();
        if (!program) {
            return null;
        }

        // Attach our two shaders to the program
        this.ctx.attachShader(program, vertexShader);
        this.ctx.attachShader(program, fragmentShader);

        // Bind attributes
        var idx = 0;
        t.attribPairs = [];
        for (var i in t.attributes) {
            t.attribPairs.push({ 'loc': idx, 'name': i });
            this.ctx.bindAttribLocation(program, idx++, i);
        }

        // Link the program
        this.ctx.linkProgram(program);

        // Check the link status
        var linked = this.ctx.getProgramParameter(program, this.ctx.LINK_STATUS);
        if (!linked) {
            // failed to link
            var error = this.ctx.getProgramInfoLog(program);

            window.console.log("Error in program linking:" + error);

            this.ctx.deleteProgram(program);
            this.ctx.deleteProgram(fragmentShader);
            this.ctx.deleteProgram(vertexShader);

            return null;
        }

        return program;
    };

    /*
    *   Set the light nodes used by this jshader
    * array item 0 corresponds to light 0, item 1 tp light 1 and so on
    * place null for lights that are not there
    */
    this.setLightContext = function (lightRefArray) {
        for (t in this.technique) {
            var len = this.technique.passes.length;
            for (var i = 0; i < len; ++i) {
                this.technique.passes[i].lightContext = lightRefArray.slice();
            }
        }
    };

    /*
    *   Called by the system to add material textures settings to the jshader
    */
    this.setTextureContext = function (textureList) {
        var passCount = this.technique.passes.length;
        var param = null;

        for (var t = 0, texCount = textureList.length; t < texCount; ++t) {
            for (var i = 0; i < passCount; ++i) {
                var param = textureList[t];

                // set the rdge global parameters if the texture is in the list
                if (this.technique.passes[i].defParams[param.name])
                    this.technique.passes[i].defParams[param.name].set(param.handle);

                // and set the local parameters if the texture is in the list
                if (this.technique.passes[i].params[param.name])
                    this.technique.passes[i].params[param.name].set(param.data[0]);
            }
        }
    };

    this.setTechnique = function (name) {
        if (this[name] != undefined) {
            this.technique = this[name];
            return true;
        }

        this.ctx.console.log("Failed to set technique:" + name);
        return false;
    };

    this.beginRenderState = function (i) {
        var states = this.technique.passes[i].states;
        if (states == undefined) {
            return;
        }

        // depth enabled by default.
        var depthEnable = states.depthEnable != undefined ? states.depthEnable : true;
        if (!depthEnable) {
            this.ctx.disable(this.ctx.DEPTH_TEST);
            var depthFunc = states.depthFunc != undefined ? states.depthFunc : "LESS";
            this.ctx.depthFunc(this.ctx[states.depthFunc]);
            this.ctx.depthMask(true);
        }
        else {

            if (states.depthFunc) {
                this.ctx.depthFunc(this.ctx[states.depthFunc]);
            }

            if (states.offset) {
                this.ctx.enable(this.ctx.POLYGON_OFFSET_FILL);
                this.ctx.polygonOffset(states.offset[0], states.offset[1]);
            }

            // depth write
            if (states.depthWrite) {
                this.ctx.depthMask(states.depthWrite);
            }

            if (states.depthRangeMin) {
                this.ctx.depthRange(states.depthRangeMin);
            }

            if (states.depthRangeMax) {
                this.ctx.depthRange(states.depthRangeMax);
            }
        }

        // blend enabled by default.
        var blendEnabled = states.blendEnable != undefined ? states.blendEnable : false;
        if (blendEnabled) {
            var srcBlend = states.srcBlend != undefined ? states.srcBlend : "ONE"; // default src blend
            var dstBlend = states.dstBlend != undefined ? states.dstBlend : "ZERO"; // default dst blend
            this.ctx.enable(this.ctx.BLEND);
            this.ctx.blendFunc(this.ctx[srcBlend], this.ctx[dstBlend]);
        }

        if (states.culling) {
            if (states.culling)
                this.ctx.enable(this.ctx.CULL_FACE);
            else
                this.ctx.disable(this.ctx.CULL_FACE);

        }

        if (states.cullFace) {
            this.ctx.cullFace(this.ctx[states.cullFace]);
        }

        if (states.pointsprite) {
            if (states.pointsprite === true)
                this.renderer.enablePointSprites();
            else
                this.renderer.disablePointSprites();
        }

        this.resetRS = this.technique.passes[i].states.reset == undefined || this.technique.passes[i].states.reset == true;
    };

    this.endRenderState = function () {
        // restore render states to some default state.
        var ctx = this.ctx;
        if (this.resetRS) {
            ctx.enable(this.ctx.DEPTH_TEST);
            ctx.disable(this.ctx.BLEND);
            ctx.depthFunc(this.ctx.LESS);
            ctx.disable(this.ctx.POLYGON_OFFSET_FILL);
            ctx.disable(this.ctx.CULL_FACE);
            //            this.renderer.disablePointSprites();
            //ctx.enable(ctx.CULL_FACE);
            //ctx.cullFace(ctx.BACK);
        }
    };

    this.begin = function () {
        this.currentPass = null;
        if (this.def == null || this.technique == null) {
            return 0;
        }
        return this.technique.passes.length;
    };

    this.beginPass = function (i) {
        this.currentPass = this.technique.passes[i];
        this.ctx.useProgram(this.currentPass.program);
        this.bindParameters(this.currentPass);
        this.beginRenderState(i);
        return this.currentPass;
    };

    this.endPass = function () {
        this.endRenderState();
        this.ctx.useProgram(null);
    };

    this.end = function () {
    };

    this.exportShader = function () {

        for (t in this.def.techniques) {
            var numPasses = this[t].passes.length;

            for (var i = 0; i < numPasses; ++i) {
                this[t].passes[i].paramsList = [];
                this[t].passes[i].defParamsList = [];

                for (var p in this[t].passes[i].params) {
                    var tech = this.def.techniques[t][i];
                    if (tech && this[t].passes[i].params[p].type != "tex2d" && this[t].passes[i].params[p] != "texCube")
                        tech.params[p].data = this[t].passes[i].params[p].data;
                }
            }
        }

        return JSON.stringify(this.def);

    }
};
