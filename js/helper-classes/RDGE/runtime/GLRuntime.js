/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */



///////////////////////////////////////////////////////////////////////
// Class GLRuntime
//      Manages runtime fora WebGL canvas
///////////////////////////////////////////////////////////////////////
function GLRuntime( canvas, importStr )
{
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._canvas		= canvas;
	this._importStr		= importStr;

	this.renderer		= null;
	this.myScene		= null;
	this.light			= null;
	this.light2			= null;
	this._rootNode		= null;

	this._firstRender	= true;
	this._initialized	= false;

	// view parameters
	this._fov = 45.0;
	this._zNear = 0.1;
	this._zFar = 100.0;
	this._viewDist = 5.0;

	this._aspect = canvas.width/canvas.height;

    ///////////////////////////////////////////////////////////////////////
	// accessors
    ///////////////////////////////////////////////////////////////////////
	this.getZNear			= function()		{  return this._zNear;			}
	this.getZFar			= function()		{  return this._zFar;			}
	this.getFOV				= function()		{  return this._fov;			}
	this.getAspect			= function()		{  return this._aspect;			}
	this.getViewDistance	= function()		{  return this._viewDist;		}

	this.loadScene = function()
	{
		// parse the data
		// the GL runtime must start with a "sceneData: "
		var index = importStr.indexOf( "scenedata: " );
		if (index >= 0)
		{
			var rdgeStr = importStr.substr( index+11 );
			var endIndex = rdgeStr.indexOf( "endscene\n" );
			if (endIndex < 0)  throw new Error( "ill-formed WebGL data" );
			var len = endIndex - index + 11;
			rdgeStr = rdgeStr.substr( 0, endIndex );

			this.myScene.importJSON( rdgeStr );
		}
	}

	this.init = function()
    { 
		var ctx1 = g_Engine.ctxMan.handleToObject(this._canvas.rdgeCtxHandle),
			ctx2 = g_Engine.getContext();
		if (ctx1 != ctx2)  console.log( "***** different contexts *****" );
		this.renderer = ctx1.renderer;
      
		// create a camera, set its perspective, and then point it at the origin
		var cam = new camera();
		this._camera = cam;
		cam.setPerspective(this.getFOV(), this.getAspect(), this.getZNear(), this.getZFar());
		cam.setLookAt([0, 0, this.getViewDistance()], [0, 0, 0], vec3.up());
        
		// make this camera the active camera
		this.renderer.cameraManager().setActiveCamera(cam);

		// change clear color
		this.renderer.setClearColor([1.0, 1.0, 1.0, 0.0]);
        
		// create an empty scene graph
		this.myScene = new SceneGraph();
		
		/*
		// create some lights
		// light 1
		this.light = createLightNode("myLight");
		this.light.setPosition([0,0,1.2]);
		this.light.setDiffuseColor([0.75,0.9,1.0,1.0]);
        
		// light 2
		this.light2 = createLightNode("myLight2");
		this.light2.setPosition([-0.5,0,1.2]);
		this.light2.setDiffuseColor([1.0,0.9,0.75,1.0]);
        
		// create a light transform
		var lightTr = createTransformNode("lightTr");
        
		// create and attach a material - materials hold the light data
		lightTr.attachMaterial(createMaterialNode("lights"));
        
		// enable light channels 1, 2 - channel 0 is used by the default shader
		lightTr.materialNode.enableLightChannel(1, this.light);
		lightTr.materialNode.enableLightChannel(2, this.light2);
     
		// all added objects are parented to the light node
		this._rootNode = lightTr;
        
		// add the light node to the scene
		this.myScene.addNode(lightTr);
		*/

		// load the scene graph data
		this.loadScene();
        
		// Add the scene to the engine - necessary if you want the engine to draw for you
		//var name = "myScene" + this._canvas.getAttribute( "data-RDGE-id" ); 
		//g_Engine.AddScene(name, this.myScene);

		this._initialized = true;
	}
    
	// main code for handling user interaction and updating the scene   
	this.update = function(dt)
    {
		if (this._initialized)
		{
			if (!dt)  dt = 0.2;
        
			dt = 0.01;	// use our own internal throttle
			this.elapsed += dt;
        
			// changed the global position uniform of light 0, another way to change behavior of a light
			//rdgeGlobalParameters.u_light0Pos.set( [5*Math.cos(this.elapsed), 5*Math.sin(this.elapsed), 20]);
        
			// orbit the light nodes around the boxes
			//this.light.setPosition([1.2*Math.cos(this.elapsed*2.0), 1.2*Math.sin(this.elapsed*2.0), 1.2*Math.cos(this.elapsed*2.0)]);
			//this.light2.setPosition([-1.2*Math.cos(this.elapsed*2.0), 1.2*Math.sin(this.elapsed*2.0), -1.2*Math.cos(this.elapsed)]);

			// now update all the nodes in the scene
			this.myScene.update(dt);
		}
    }

    // defining the draw function to control how the scene is rendered      
	this.draw = function()
    {
		if (this._initialized)
		{
			g_Engine.setContext( this._canvas.rdgeid );

			var ctx = g_Engine.getContext();
			var renderer = ctx.renderer;
			if (renderer.unloadedTextureCount <= 0)
			{
				renderer.disableCulling();
				renderer._clear();
				this.myScene.render();

				if (this._firstRender)
				{
					if (this._canvas.task)
					{
						this._firstRender = false;
						//this._canvas.task.stop();
					}
				}
			}
		}
    }

	// start RDGE
	var id = canvas.getAttribute( "data-RDGE-id" ); 
	canvas.rdgeid = id;
	g_Engine.registerCanvas(canvas, this);
	RDGEStart( canvas );

}




