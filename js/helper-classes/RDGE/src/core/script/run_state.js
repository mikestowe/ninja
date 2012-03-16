/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


function RunState(userRunState, context)
{
	this.name = "RunState";
	this.userRunState = userRunState != undefined ? userRunState : new RDGEState;
	this.hasUserState = userRunState != undefined ? true : false;
	this.renderer = context.renderer;
	this.initialized = false;
}

RunState.prototype.Init = function() 
{
	this.initialized = true;
	var width = this.renderer.vpWidth;
	var height = this.renderer.vpHeight;
	var cam = new camera();
	cam.setPerspective(45.0, width / height, 1.0, 100.0);
	cam.setLookAt([0, 0, 20], [0, 0, 0], vec3.up());

	this.renderer.cameraManager().setActiveCamera( cam );

	if(this.hasUserState && this.userRunState.init != undefined)
	{
		this.userRunState.init();
	}

	if (this.hasUserState && this.userRunState && this.userRunState.onRunState)
		this.userRunState.onRunState();


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//	if(theScene=="Robots_rt") {
//		g_enableShadowMapping=false;
//		g_showSSAO=false;
//		g_Engine.defaultContext.uniforms[1]={ 'name': "u_lightAmb",'value': [0.5,0.5,0.5,1.0] };
//		g_Engine.defaultContext.uniforms[7]={ 'name': "u_matAmbient",'value': [0.8,0.8,0.8,1] };
//	}


//	g_hrDepthMapGenShader=createShader(this.renderer.ctx,'depthMap_vshader','depthMap_fshader',["vert","normal"]);
//	g_depthMapGenShader=createShader(this.renderer.ctx,'norm_depth_vshader','norm_depth_fshader',["vert","normal"]);

//	// shadow light
//	g_mainLight=new camera();        // camera to represent our light's point of view
//	g_mainLight.setPerspective(45.0,width/height,1.0,200.0);
//	g_mainLight.setLookAt([-60,17,-15],[-5,-5,15],vec3.up());       // lights position and point of view
//	g_mainLight.mvMatrix=mat4.copy(g_mainLight.view);   // hold model view transform
//	g_mainLight.invViewMatrix=mat4.inverse(g_mainLight.view);
//	g_mainLight.mvpMatrix=mat4.identity();
//	g_mainLight.shadowMatrix=mat4.identity();           // shadow matrix creates shadow bias
//	g_mainLight.shadowMatrix=mat4.scale(g_mainLight.shadowMatrix,[0.5,0.5,0.5]);
//	g_mainLight.shadowMatrix=mat4.translate(g_mainLight.shadowMatrix,[0.5,0.5,0.5]);
//	//g_cameraManager.setActiveCamera( g_mainLight );
//	
//	uniformEnableGlow = this.renderer.ctx.getUniformLocation(g_Engine.defaultContext.shaderProg, "u_renderGlow");
//	
//	depthRTT=createRenderTargetTexture(1024,1024);
//	glowRTT=createRenderTargetTexture(512,512);
//	blurFX=new fxBlur([256,128,64],true);
//	mainRTT=createRenderTargetTexture(1024,1024);
//	ssaoFX=new fxSSAO(true);
//	ssaoRTT=createRenderTargetTexture(1024,1024);
//	depthRTT=createRenderTargetTexture(1024,1024);
//	hrDepthRTT=createRenderTargetTexture(1024,1024);
//	hrDepthRTTSSAO=createRenderTargetTexture(1024,1024);
//	mainSceneQuad=new ScreenQuad(mainRTT);
//	mainSceneQuad.initialize(renderInitScreenQuad);

//	cubelight_Glow	= this.renderer.createTexture("assets/images/cubelight_Glow.png");
//	lightRack_Glow	= this.renderer.createTexture("assets/images/lightRack_Glow.png");
//	black			= this.renderer.createTexture("assets/images/black.png");

//	renderGlow=false;

//	// depth map and normal proc
//	renderProcDepth=new GenerateDepthMap();
//	renderProcGlow=new GenerateGlowMap();
//	renderProc=new SceneRender();
//	renderProcCreateShadowMap=new SceneCreateShadowMap();
//	renderProcHighResDepth=new GenerateHighResDepthMap();

//	g_Engine.defaultContext.textureList.push({ 'handle': hrDepthRTT,'unit': 7,'type': UNIFORMTYPE.TEXTURE2D });
//	g_Engine.defaultContext.uniforms.push({ 'name': "depthMap",'value': [hrDepthRTT] });
		
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

RunState.prototype.ReInit = function() 
{
	if(!this.initialized)
	{
		this.Init();
	}
	else
	{
		if (this.hasUserState && this.userRunState && this.userRunState.onRunState)
			this.userRunState.onRunState();
	}
}

RunState.prototype.Update = function(dt) 
{
    this.userRunState.update(dt);
}

RunState.prototype.Resize = function() 
{
	if(g_Engine.lastWindowWidth == window.innerWidth && g_Engine.lastWindowHeight == window.innerHeight)
	{
		this.userRunState.resize();
		g_Engine.lastWindowWidth = window.innerWidth;
		g_Engine.lastWindowHeight = window.innerHeight;
	}
}

RunState.prototype.Draw = function () 
{	
	var width = this.renderer.vpWidth;
	var height = this.renderer.vpHeight;
	
//	this.renderer._clear();
	
	this.userRunState.draw();
	
// ~~~~ removing post process till multi-context and post process system is in place
//		if(this.currentScene==null)
//			return;

//		this.renderer.setClearColor([1.0,1.0,1.0,1.0]);

//		// post process will eventually be wrapped in
//		this.renderer.ctx.bindFramebuffer(renderer.ctx.FRAMEBUFFER, depthRTT.frameBuffer);
//		this.renderer.setViewPort(0,0,1024,1024);
//		this.renderer.clear(this.renderer.colorBuffer | this.renderer.depthBuffer);
//		this.currentScene.render(renderProcDepth);

//		this.renderer.ctx.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER,hrDepthRTTSSAO.frameBuffer);
//		this.renderer.setViewPort(0, 0, 1024, 1024);
//		this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//		renderProcHighResDepth.cullFront=false;
//		this.currentScene.render(renderProcHighResDepth);

//		if(g_enableShadowMapping) 
//		{
//			this.renderer.cameraManager().pushCamera(g_mainLight);

//			this.renderer.ctx.bindFramebuffer( this.renderer.ctx.FRAMEBUFFER, hrDepthRTT.frameBuffer );
//			this.renderer.setViewPort(0, 0, 1024, 1024);
//			this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//			renderProcHighResDepth.cullFront=true;
//			this.currentScene.render(renderProcHighResDepth);

//			this.renderer.cameraManager().popCamera();
//		}

//		this.renderer.ctx.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER, mainRTT.frameBuffer);
//		this.renderer.setViewPort(0,0,1024,1024);

//		if(g_showScene) 
//		{
//			this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//			this.currentScene.render(renderProc);
//		} else 
//		{
//			this.renderer.clear( this.renderer.ctx.colorBuffer | this.renderer.ctx.depthBuffer );
//		}

//		if(g_showSSAO) 
//		{
//			ssaoFX.doSSAO(mainRTT, depthRTT, hrDepthRTTSSAO, ssaoRTT, g_sampleRadius, g_intensity, g_distScale, g_bias);
//		}

//		if(g_showBloom) {
//			// render glow map
//			this.renderer.ctx.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER,glowRTT.frameBuffer);
//			this.renderer.setViewPort(0,0,512,512);
//			this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//			this.currentScene.render(renderProcGlow);

//			// Combine
//			blurFX.doBlur(glowRTT,null,[g_bloomIntensity1,g_bloomIntensity2,g_bloomIntensity3,g_bloomIntensity4],g_showSSAO?ssaoRTT:mainRTT);
//		}
//		else if(g_showScene||g_showSSAO) 
//		{
//			this.renderer.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER,null);
//			this.renderer.setViewPort(0, 0, width, height);
//			this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );

//			mainSceneQuad.texture=g_showSSAO?ssaoRTT:mainRTT;
//			renderProcScreenQuad(mainSceneQuad);
//		}
//		else 
//		{
//			this.renderer.clear( this.renderer.colorBuffer | this.renderer.depthBuffer );
//		}
	
	
}

RunState.prototype.Shutdown = function()
{
	if(this.userRunState.shutdown != undefined)
	{
		this.userRunState.shutdown();
	}
}

RunState.prototype.LeaveState = function() 
{
	if(this.userRunState.onComplete != undefined)
	{
		this.userRunState.onComplete();	
	}
}


debugCamHandler=function() 
{
	this.pos=vec2.zero();
	this.lastPos=vec2.zero();
	this.vel=vec2.zero();
	this.mouseDown=false;

	this.onMouseDown=function(ev) 
	{
		if(!g_enableFlyCam) 
		{
			return false;
		}
		this.mouseDown=true;
		this.pos=[ev.pageX,g_height-ev.pageY];
		this.lastPos=this.pos;
		return true;
	}

	this.onMouseUp=function(ev) 
	{
		if(!g_enableFlyCam) 
		{
			return false;
		}
		this.mouseDown=false;
		this.lastPos=this.pos;
		return true;
	}

	this.onMouseMove=function(ev) 
	{
		if(!g_enableFlyCam) 
		{
			return false;
		}

		this.pos=[ev.pageX,g_height-ev.pageY];
		return true;
	}

	this.update=function() 
	{
		if(this.mouseDown) 
		{
			var camera=this.renderer.cameraManager().getActiveCamera();
			var d=vec2.sub(this.pos,this.lastPos);
			
			d[0]/=g_width;
			d[1]/=g_height;
			
			var sensitivity=5.0;
			
			var pitch=mat4.rotateX(mat4.identity(),d[1]*sensitivity);
			var yaw=mat4.rotateY(mat4.identity(),-d[0]*sensitivity);
//			var yp = mat4.mul(yaw, pitch);
									
			var newworld=mat4.mul(yaw, camera.world);	
//			newworld=mat4.mul(yaw, newworld);
/*
			mat4.setRow(newworld, 1, [0,1,0]);  		
			mat4.setRow(newworld, 0, vec3.normalize( vec3.cross( vec3.basisY(newworld), vec3.basisZ(newworld) ) ) );
			mat4.setRow(newworld, 1, vec3.normalize( vec3.cross( vec3.basisZ(newworld), vec3.basisX(newworld) ) ) );
*/
			camera.setWorld(newworld);
		}
	}
	var self=this;
	var fr=function() { self.update(); };
	setInterval(fr,16);
}

///////////////////////////////////////////////////////////////////////////////
// render scene nodes
function SceneRender() 
{
	this.shaderProgram=g_Engine.defaultContext.shaderProg;
}

String.prototype.contains=function(it) { return this.indexOf(it)!= -1; };

SceneRender.prototype.process=function(context, trNode, parent) 
{
	var renderer = g_Engine.getContext().renderer;

	// apply the context
	context.Apply(this.shaderProgram);

	this.shaderProgram.RDGEUniform.SetUni("u_shadowLightWorld",g_mainLight.world);
	this.shaderProgram.RDGEUniform.SetUni("u_shadowBiasMatrix",g_mainLight.shadowMatrix);
	this.shaderProgram.RDGEUniform.SetUni("u_vShadowLight",g_mainLight.view);


	if(((trNode.materialNode||{}).meshNode||{})!==undefined&&trNode.materialNode!==undefined) 
	{
		// run through master list and bind the uniforms
		_bindUniforms(this.shaderProgram);

		var mesh;
		if(trNode.materialNode.meshNode.mesh.name!==undefined)
			mesh=g_meshMan.getModelByName(trNode.materialNode.meshNode.mesh.name);
		else
			mesh=g_meshMan.getModelByName(trNode.materialNode.meshNode.mesh.attrib.name);

		if(mesh==null)
			return;

		renderer.ctx.uniform1f(uniformEnableGlow,0.0);


		renderer.disableCulling();
		
		if(!g_wireframe)
			renderer.drawIndexedPrimitive(mesh.primitive, this.shaderProgram, {"vert":"vec3", "normal":"vec3", "texcoord":"vec2"} );
		else
			renderer.drawIndexedPrimitiveWireFrame(mesh.primitive, this.shaderProgram, {"vert":"vec3", "normal":"vec3", "texcoord":"vec2"} );

	}
}

// render scene nodes
function GenerateGlowMap() 
{
	this.shaderProgram=g_Engine.defaultContext.shaderProg;
}

GenerateGlowMap.prototype.process=function(context,trNode,parent) 
{
	var renderer = g_Engine.getContext().renderer;
	
	// apply the context
	context.Apply(this.shaderProgram);


	if(((trNode.materialNode||{}).meshNode||{})!==undefined&&trNode.materialNode!==undefined) {
		// run through master list and bind the uniforms
		_bindUniforms(this.shaderProgram);

		var mesh;
		if(trNode.materialNode.meshNode.mesh.name!==undefined)
			mesh=g_meshMan.getModelByName(trNode.materialNode.meshNode.mesh.name);
		else
			mesh=g_meshMan.getModelByName(trNode.materialNode.meshNode.mesh.attrib.name);

		if(mesh==null)
			return;

		renderer.ctx.uniform1f(uniformEnableGlow,1.0);

		renderer.drawIndexedPrimitive(mesh.primitive, this.shaderProgram, {"vert":"vec3", "normal":"vec3", "texcoord":"vec2"} );

	}
}


function GenerateDepthMap() {
	this.shaderProgram=g_depthMapGenShader;
}

GenerateDepthMap.prototype.process=function(context,trNode,parent) 
{
	var renderer = g_Engine.getContext().renderer;

	// apply the context
	context.Apply(false);

	this.shaderProgram.RDGEUniform.SetUni("u_frustumFarZ",[renderer.cameraManager().getActiveCamera().zFar()]);


	var mesh=null;
	if(((trNode.materialNode||{}).meshNode||{})!==undefined&&trNode.materialNode!==undefined) {
		// run through master list and bind the uniforms
		_bindUniforms(this.shaderProgram);

		if(trNode.materialNode.meshNode.mesh.name!==undefined)
			mesh=g_meshMan.getModelByName(trNode.materialNode.meshNode.mesh.name);
		else
			mesh=g_meshMan.getModelByName(trNode.materialNode.meshNode.mesh.attrib.name);

		if(mesh==null)
			return;

		renderer.enablePolyOffsetFill();
		
		renderer.drawIndexedPrimitive(mesh.primitive, this.shaderProgram, {"vert":"vec3", "normal":"vec3", "texcoord":"vec2"} );

		renderer.disablePolyOffsetFill();
	}
}

function GenerateHighResDepthMap() {
	this.shaderProgram=g_hrDepthMapGenShader;
	this.cullFront=true;
}

GenerateHighResDepthMap.prototype.process=function(context,trNode,parent) 
{
	var renderer = g_Engine.getContext().renderer;

	// apply the context
	context.Apply(false);

	this.shaderProgram.RDGEUniform.SetUni("u_frustumFarZ",[renderer.cameraManager().getActiveCamera().zFar()]);


	var mesh=null;
	if(((trNode.materialNode||{}).meshNode||{})!==undefined&&trNode.materialNode!==undefined) {
		// run through master list and bind the uniforms
		_bindUniforms(this.shaderProgram);

		if(trNode.materialNode.meshNode.mesh.name!==undefined)
			mesh=g_meshMan.getModelByName(trNode.materialNode.meshNode.mesh.name);
		else
			mesh=g_meshMan.getModelByName(trNode.materialNode.meshNode.mesh.attrib.name);

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
}

function SceneCreateShadowMap() {
	//this.shaderProgram = g_depthShadowMap;
}

SceneCreateShadowMap.prototype.process=function(context,trNode,parent) {


}
//////////////////////////////////////////////////////////////////

