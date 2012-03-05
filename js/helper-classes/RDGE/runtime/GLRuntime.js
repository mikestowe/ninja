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
	this._context		= null;
	this._importStr		= importStr;

	this.renderer		= null;
	this.myScene		= null;
	this.light			= null;
	this.light2			= null;
	this._rootNode		= null;

	this._firstRender	= true;
	this._initialized	= false;

	this._useWebGL		= false;

	// view parameters
	this._fov = 45.0;
	this._zNear = 0.1;
	this._zFar = 100.0;
	this._viewDist = 5.0;

	this._aspect = canvas.width/canvas.height;

	this._geomRoot;

	// all "live" materials
	this._materials = [];

    ///////////////////////////////////////////////////////////////////////
	// accessors
    ///////////////////////////////////////////////////////////////////////
	this.getZNear			= function()		{  return this._zNear;			}
	this.getZFar			= function()		{  return this._zFar;			}
	this.getFOV				= function()		{  return this._fov;			}
	this.getAspect			= function()		{  return this._aspect;			}
	this.getViewDistance	= function()		{  return this._viewDist;		}

	this.get2DContext		= function()		{  return this._context;		}

	this.getViewportWidth	= function()		{  return this._canvas.width;	}
	this.getViewportHeight	= function()		{  return this._canvas.height;	}

    ///////////////////////////////////////////////////////////////////////
	// accessors
    ///////////////////////////////////////////////////////////////////////
	this.loadScene = function()
	{
		// parse the data
		// the GL runtime must start with a "sceneData: "
		var index = importStr.indexOf( "scenedata: " );
		if (index >= 0)
		{
			this._useWebGL = true;

			var rdgeStr = importStr.substr( index+11 );
			var endIndex = rdgeStr.indexOf( "endscene\n" );
			if (endIndex < 0)  throw new Error( "ill-formed WebGL data" );
			var len = endIndex - index + 11;
			rdgeStr = rdgeStr.substr( 0, endIndex );

			this.myScene.importJSON( rdgeStr );
			this.importObjects( importStr );
			this.linkMaterials( this._geomRoot );
			this.initMaterials();
		}
		else
		{
			this._context = this._canvas.getContext( "2d" );
			this.importObjects( importStr );
			this.render();
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

		// load the scene graph data
		this.loadScene();
        
		// Add the scene to the engine - necessary if you want the engine to draw for you
		var name = "myScene" + this._canvas.getAttribute( "data-RDGE-id" ); 
		g_Engine.AddScene(name, this.myScene);

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

			this.updateMaterials();

			// now update all the nodes in the scene
			this.myScene.update(dt);
		}
    }

	this.updateMaterials = function()
	{
		var nMats = this._materials.length;
		for (var i=0;  i<nMats;  i++)
		{
			var mat = this._materials[i];
			mat.update();
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

	this.importObjects = function( importStr,  parent )
	{
		var index = importStr.indexOf( "OBJECT\n", 0 );
		while (index >= 0)
		{
			// update the string to the current object
			importStr = importStr.substr( index+7 );

			// read the next object
			var obj = this.importObject( importStr, parent );

			// determine if we have children
			var endIndex = importStr.indexOf( "ENDOBJECT\n" ),
				childIndex = importStr.indexOf( "OBJECT\n" );
			if (endIndex < 0)  throw new Error( "ill-formed object data" );
			if ((childIndex >= 0) && (childIndex < endIndex))
			{
				importStr = importStr.substr( childIndex + 7 );
				importStr = this.importObjects( importStr, obj );
				endIndex = importStr.indexOf( "ENDOBJECT\n" )
			}

			// remove the string for the object(s) just created
			importStr = importStr.substr( endIndex );

			// get the location of the next object
			index = importStr.indexOf( "OBJECT\n", endIndex );
		}

		return importStr;
	}

	this.importObject = function( objStr,  parent )
	{
		var type = Number( getPropertyFromString( "type: ", objStr ) );

		var obj;
		switch (type)
		{
			case 1:
				obj = new RuntimeRectangle();
				obj.import( objStr, parent );
				break;

			case 2:		// circle
				obj = new RuntimeOval();
				obj.import( objStr, parent );
				break;

			case 3:		// line
				obj = new RuntimeLine();
				obj.import( objStr, parent );
				break;

			default:
				throw new Error( "Attempting to load unrecognized object type: " + type );
				break;
		}

		if (obj)
			this.addObject( obj );

		return obj;
	}

	this.addObject = function( obj, parent )
	{
		if (!obj)  return;
		obj.setWorld( this );

		if (parent == null)
			this._geomRoot = obj;
		else
			parent.addChild( obj );
	}

	this.linkMaterials = function( obj )
	{
		if (!obj)  return;

		// get the array of materials from the object
		var matArray = obj._materials;
		var nMats = matArray.length;
		for (var i=0;  i<nMats;  i++)
		{
			var mat = matArray[i];
			var nodeName = mat._materialNodeName;
			var matNode = this.findMaterialNode( nodeName, this.myScene.scene );
			if (matNode)
			{
				mat._materialNode = matNode;
				mat._shader = matNode.shaderProgram;
				this._materials.push( mat );
			}
		}
	}

	this.initMaterials = function()
	{
		var nMats = this._materials.length;
		for (var i=0;  i<nMats;  i++)
		{
			var mat = this._materials[i];
			mat.init();
		}
	}

	this.findMaterialNode = function( nodeName,  node )
	{
		if (node.transformNode)
			node = node.transformNode;

		if (node.materialNode)
		{
			if (nodeName === node.materialNode.name)  return node.materialNode;
		}

		if (node.children)
		{
			var nKids = node.children.length;
			for (var i=0;  i<nKids;  i++)
			{
				var child = node.children[i];
				var rtnNode = this.findMaterialNode( nodeName, child );
				if (rtnNode)  return rtnNode;
			}
		}
	}

	this.render = function( obj )
	{
		if (!obj)  obj = this._geomRoot;
		obj.render();

		if (obj.children)
		{
			var nKids = obj.children.length;
			for (var i=0;  i<nKids;  i++)
			{
				var child = obj.children[i];
				if (child)
					this.render( child );
			}
		}
	}

	// start RDGE or load Canvas 2D objects
	if (this._useWebGL)
	{
		var id = canvas.getAttribute( "data-RDGE-id" ); 
		canvas.rdgeid = id;
		g_Engine.registerCanvas(canvas, this);
		RDGEStart( canvas );
	}
	else
	{
		this.loadScene();
	}
}




