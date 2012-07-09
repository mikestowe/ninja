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

RDGE.RunState = function (userRunState, context) {
    this.name = "RunState";
    this.userRunState = userRunState != undefined ? userRunState : new RDGE.core.RDGEState;
    this.hasUserState = userRunState != undefined ? true : false;
    this.renderer = context.renderer;
    this.initialized = false;
};

RDGE.RunState.prototype.Init = function () {
    this.initialized = true;
    var width = this.renderer.vpWidth;
    var height = this.renderer.vpHeight;
    var cam = new RDGE.camera();
    cam.setPerspective(45.0, width / height, 1.0, 100.0);
    cam.setLookAt([0, 0, 20], [0, 0, 0], RDGE.vec3.up());

    this.renderer.cameraManager().setActiveCamera( cam );

    if (this.hasUserState && this.userRunState.init != undefined) {
        this.userRunState.init();
    }

    if (this.hasUserState && this.userRunState && this.userRunState.onRunState)
        this.userRunState.onRunState();


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  if(theScene=="Robots_rt") {
//      g_enableShadowMapping=false;
//      g_showSSAO=false;
    //      RDGE.globals.engine.defaultContext.uniforms[1]={ 'name': "u_lightAmb",'value': [0.5,0.5,0.5,1.0] };
    //      RDGE.globals.engine.defaultContext.uniforms[7]={ 'name': "u_matAmbient",'value': [0.8,0.8,0.8,1] };
//  }


//  g_hrDepthMapGenShader=createShader(this.renderer.ctx,'depthMap_vshader','depthMap_fshader',["vert","normal"]);
//  g_depthMapGenShader=createShader(this.renderer.ctx,'norm_depth_vshader','norm_depth_fshader',["vert","normal"]);

//  // shadow light
    //  g_mainLight=new RDGE.camera();        // camera to represent our light's point of view
//  g_mainLight.setPerspective(45.0,width/height,1.0,200.0);
    //  g_mainLight.setLookAt([-60,17,-15],[-5,-5,15],RDGE.vec3.up());       // lights position and point of view
    //  g_mainLight.mvMatrix=RDGE.mat4.copy(g_mainLight.view);   // hold model view transform
    //  g_mainLight.invViewMatrix=RDGE.mat4.inverse(g_mainLight.view);
    //  g_mainLight.mvpMatrix=RDGE.mat4.identity();
    //  g_mainLight.shadowMatrix=RDGE.mat4.identity();           // shadow matrix creates shadow bias
    //  g_mainLight.shadowMatrix=RDGE.mat4.scale(g_mainLight.shadowMatrix,[0.5,0.5,0.5]);
    //  g_mainLight.shadowMatrix=RDGE.mat4.translate(g_mainLight.shadowMatrix,[0.5,0.5,0.5]);
//  //g_cameraManager.setActiveCamera( g_mainLight );
//
    //  uniformEnableGlow = this.renderer.ctx.getUniformLocation(RDGE.globals.engine.defaultContext.shaderProg, "u_renderGlow");
//
//  depthRTT=createRenderTargetTexture(1024,1024);
//  glowRTT=createRenderTargetTexture(512,512);
    //  blurFX=new RDGE.fx.fxBlur([256,128,64],true);
//  mainRTT=createRenderTargetTexture(1024,1024);
    //  ssaoFX=new RDGE.fx.fxSSAO(true);
//  ssaoRTT=createRenderTargetTexture(1024,1024);
//  depthRTT=createRenderTargetTexture(1024,1024);
//  hrDepthRTT=createRenderTargetTexture(1024,1024);
//  hrDepthRTTSSAO=createRenderTargetTexture(1024,1024);
    //  mainSceneQuad=new RDGE.ScreenQuad(mainRTT);
    //  mainSceneQuad.initialize(RDGE.renderInitScreenQuad);

//  cubelight_Glow  = this.renderer.createTexture("assets/images/cubelight_Glow.png");
//  lightRack_Glow  = this.renderer.createTexture("assets/images/lightRack_Glow.png");
//  black           = this.renderer.createTexture("assets/images/black.png");

//  renderGlow=false;

//  // depth map and normal proc
//  renderProcDepth=new GenerateDepthMap();
//  renderProcGlow=new GenerateGlowMap();
    //  renderProc=new RDGE.SceneRender();
//  renderProcCreateShadowMap=new SceneCreateShadowMap();
//  renderProcHighResDepth=new GenerateHighResDepthMap();

    //  RDGE.globals.engine.defaultContext.textureList.push({ 'handle': hrDepthRTT,'unit': 7,'type': RDGE.UNIFORMTYPE.TEXTURE2D });
    //  RDGE.globals.engine.defaultContext.uniforms.push({ 'name': "depthMap",'value': [hrDepthRTT] });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};

RDGE.RunState.prototype.ReInit = function () {
    if (!this.initialized) {
        this.Init();
    }
    else {
        if (this.hasUserState && this.userRunState && this.userRunState.onRunState)
            this.userRunState.onRunState();
    }
};

RDGE.RunState.prototype.Update = function (dt) {
    this.userRunState.update(dt);
};

RDGE.RunState.prototype.Resize = function () {
    if (RDGE.globals.engine.lastWindowWidth == window.innerWidth && RDGE.globals.engine.lastWindowHeight == window.innerHeight) {
        this.userRunState.resize();
        RDGE.globals.engine.lastWindowWidth = window.innerWidth;
        RDGE.globals.engine.lastWindowHeight = window.innerHeight;
}
};

RDGE.RunState.prototype.Draw = function () {
    var width = this.renderer.vpWidth;
    var height = this.renderer.vpHeight;

//  this.renderer._clear();

    this.userRunState.draw();

// ~~~~ removing post process till multi-context and post process system is in place
//      if(this.currentScene==null)
//          return;

//      this.renderer.setClearColor([1.0,1.0,1.0,1.0]);

//      // post process will eventually be wrapped in
//      this.renderer.ctx.bindFramebuffer(renderer.ctx.FRAMEBUFFER, depthRTT.frameBuffer);
//      this.renderer.setViewPort(0,0,1024,1024);
//      this.renderer.clear(this.renderer.colorBuffer | this.renderer.depthBuffer);
//      this.currentScene.render(renderProcDepth);

//      this.renderer.ctx.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER,hrDepthRTTSSAO.frameBuffer);
//      this.renderer.setViewPort(0, 0, 1024, 1024);
//      this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//      renderProcHighResDepth.cullFront=false;
//      this.currentScene.render(renderProcHighResDepth);

//      if(g_enableShadowMapping)
//      {
//          this.renderer.cameraManager().pushCamera(g_mainLight);

//          this.renderer.ctx.bindFramebuffer( this.renderer.ctx.FRAMEBUFFER, hrDepthRTT.frameBuffer );
//          this.renderer.setViewPort(0, 0, 1024, 1024);
//          this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//          renderProcHighResDepth.cullFront=true;
//          this.currentScene.render(renderProcHighResDepth);

//          this.renderer.cameraManager().popCamera();
//      }

//      this.renderer.ctx.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER, mainRTT.frameBuffer);
//      this.renderer.setViewPort(0,0,1024,1024);

//      if(g_showScene)
//      {
//          this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//          this.currentScene.render(renderProc);
//      } else
//      {
//          this.renderer.clear( this.renderer.ctx.colorBuffer | this.renderer.ctx.depthBuffer );
//      }

//      if(g_showSSAO)
//      {
//          ssaoFX.doSSAO(mainRTT, depthRTT, hrDepthRTTSSAO, ssaoRTT, g_sampleRadius, g_intensity, g_distScale, g_bias);
//      }

//      if(g_showBloom) {
//          // render glow map
//          this.renderer.ctx.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER,glowRTT.frameBuffer);
//          this.renderer.setViewPort(0,0,512,512);
//          this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//          this.currentScene.render(renderProcGlow);

//          // Combine
//          blurFX.doBlur(glowRTT,null,[g_bloomIntensity1,g_bloomIntensity2,g_bloomIntensity3,g_bloomIntensity4],g_showSSAO?ssaoRTT:mainRTT);
//      }
//      else if(g_showScene||g_showSSAO)
//      {
//          this.renderer.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER,null);
//          this.renderer.setViewPort(0, 0, width, height);
//          this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );

//          mainSceneQuad.texture=g_showSSAO?ssaoRTT:mainRTT;
    //          RDGE.renderProcScreenQuad(mainSceneQuad);
//      }
//      else
//      {
//          this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//      }
};

RDGE.RunState.prototype.Shutdown = function () {
    if (this.userRunState.shutdown != undefined) {
        this.userRunState.shutdown();
    }
};

RDGE.RunState.prototype.LeaveState = function () {
    if (this.userRunState.onComplete != undefined) {
        this.userRunState.onComplete();
    }
};

/*
// These are currently unused for Ninja
///////////////////////////////////////////////////////////////////////////////
// render scene nodes
RDGE.SceneRender = function () {
    this.shaderProgram = RDGE.globals.engine.defaultContext.shaderProg;
};

String.prototype.contains=function(it) { return this.indexOf(it)!= -1; };

RDGE.SceneRender.prototype.process = function (context, trNode, parent) {
    var renderer = RDGE.globals.engine.getContext().renderer;

    // apply the context
    context.Apply(this.shaderProgram);

    this.shaderProgram.RDGEUniform.SetUni("u_shadowLightWorld",g_mainLight.world);
    this.shaderProgram.RDGEUniform.SetUni("u_shadowBiasMatrix",g_mainLight.shadowMatrix);
    this.shaderProgram.RDGEUniform.SetUni("u_vShadowLight",g_mainLight.view);


    if (((trNode.materialNode || {}).meshNode || {}) !== undefined && trNode.materialNode !== undefined) {
        // run through master list and bind the uniforms
        _bindUniforms(this.shaderProgram);

        var mesh;
        if(trNode.materialNode.meshNode.mesh.name!==undefined)
            mesh = RDGE.globals.meshMan.getModelByName(trNode.materialNode.meshNode.mesh.name);
        else
            mesh = RDGE.globals.meshMan.getModelByName(trNode.materialNode.meshNode.mesh.attrib.name);

        if(mesh==null)
            return;

        renderer.ctx.uniform1f(uniformEnableGlow,0.0);


        renderer.disableCulling();

        if(!g_wireframe)
            renderer.drawIndexedPrimitive(mesh.primitive, this.shaderProgram, {"vert":"vec3", "normal":"vec3", "texcoord":"vec2"} );
        else
            renderer.drawIndexedPrimitiveWireFrame(mesh.primitive, this.shaderProgram, {"vert":"vec3", "normal":"vec3", "texcoord":"vec2"} );

    }
};

// render scene nodes
RDGE.GenerateGlowMap = function () {
    this.shaderProgram = RDGE.globals.engine.defaultContext.shaderProg;
};

RDGE.GenerateGlowMap.prototype.process = function (context, trNode, parent) {
    var renderer = RDGE.globals.engine.getContext().renderer;

    // apply the context
    context.Apply(this.shaderProgram);


    if(((trNode.materialNode||{}).meshNode||{})!==undefined&&trNode.materialNode!==undefined) {
        // run through master list and bind the uniforms
        _bindUniforms(this.shaderProgram);

        var mesh;
        if(trNode.materialNode.meshNode.mesh.name!==undefined)
            mesh = RDGE.globals.meshMan.getModelByName(trNode.materialNode.meshNode.mesh.name);
        else
            mesh = RDGE.globals.meshMan.getModelByName(trNode.materialNode.meshNode.mesh.attrib.name);

        if(mesh==null)
            return;

        renderer.ctx.uniform1f(uniformEnableGlow,1.0);

        renderer.drawIndexedPrimitive(mesh.primitive, this.shaderProgram, {"vert":"vec3", "normal":"vec3", "texcoord":"vec2"} );

    }
};


RDGE.GenerateDepthMap = function () {
    this.shaderProgram=g_depthMapGenShader;
};

RDGE.GenerateDepthMap.prototype.process = function (context, trNode, parent) {
    var renderer = RDGE.globals.engine.getContext().renderer;

    // apply the context
    context.Apply(false);

    this.shaderProgram.RDGEUniform.SetUni("u_frustumFarZ",[renderer.cameraManager().getActiveCamera().zFar()]);


    var mesh=null;
    if(((trNode.materialNode||{}).meshNode||{})!==undefined&&trNode.materialNode!==undefined) {
        // run through master list and bind the uniforms
        _bindUniforms(this.shaderProgram);

        if(trNode.materialNode.meshNode.mesh.name!==undefined)
            mesh = RDGE.globals.meshMan.getModelByName(trNode.materialNode.meshNode.mesh.name);
        else
            mesh = RDGE.globals.meshMan.getModelByName(trNode.materialNode.meshNode.mesh.attrib.name);

        if(mesh==null)
            return;

        renderer.enablePolyOffsetFill();

        renderer.drawIndexedPrimitive(mesh.primitive, this.shaderProgram, {"vert":"vec3", "normal":"vec3", "texcoord":"vec2"} );

        renderer.disablePolyOffsetFill();
    }
};

RDGE.GenerateHighResDepthMap = function () {
    this.shaderProgram=g_hrDepthMapGenShader;
    this.cullFront=true;
};

RDGE.GenerateHighResDepthMap.prototype.process = function (context, trNode, parent) {
    var renderer = RDGE.globals.engine.getContext().renderer;

    // apply the context
    context.Apply(false);

    this.shaderProgram.RDGEUniform.SetUni("u_frustumFarZ",[renderer.cameraManager().getActiveCamera().zFar()]);


    var mesh=null;
    if(((trNode.materialNode||{}).meshNode||{})!==undefined&&trNode.materialNode!==undefined) {
        // run through master list and bind the uniforms
        _bindUniforms(this.shaderProgram);

        if(trNode.materialNode.meshNode.mesh.name!==undefined)
            mesh = RDGE.globals.meshMan.getModelByName(trNode.materialNode.meshNode.mesh.name);
        else
            mesh = RDGE.globals.meshMan.getModelByName(trNode.materialNode.meshNode.mesh.attrib.name);

        if(mesh==null)
            return;

        renderer.disableCulling();
        renderer.enablePolyOffsetFill();

        this.cullFront ? renderer.cullFrontFace() : renderer.cullBackFace();

        renderer.drawIndexedPrimitive( mesh.primitive, this.shaderProgram, { "vert":"vec3", "normal":"vec3", "texcoord":"vec2" } );

        renderer.disableCulling();
        renderer.cullBackFace();
        renderer.disablePolyOffsetFill();
    }
};

RDGE.SceneCreateShadowMap = function () {
    //this.shaderProgram = g_depthShadowMap;
};

RDGE.SceneCreateShadowMap.prototype.process = function (context, trNode, parent) {
};
//////////////////////////////////////////////////////////////////
*/
