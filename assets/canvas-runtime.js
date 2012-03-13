/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

///////////////////////////////////////////////////////////////////////
//Loading webGL/canvas data
function initWebGl (rootElement, directory) {
	var cvsDataMngr, ninjaWebGlData = JSON.parse((document.querySelectorAll(['script[data-ninja-webgl]'])[0].innerHTML.replace('(', '')).replace(')', ''));
	if (ninjaWebGlData && ninjaWebGlData.data) {
		for (var n=0; ninjaWebGlData.data[n]; n++) {
			ninjaWebGlData.data[n] = unescape(ninjaWebGlData.data[n]);
		}
	}
	//Creating data manager
	cvsDataMngr = new CanvasDataManager();
	//Loading data to canvas(es)
	cvsDataMngr.loadGLData(rootElement, ninjaWebGlData.data, directory);
}

///////////////////////////////////////////////////////////////////////
// Class ShapeRuntime
//      Manages runtime shape display
///////////////////////////////////////////////////////////////////////
function CanvasDataManager()
{
	this.loadGLData = function(root,  valueArray,  assetPath )
	{
		this._assetPath = assetPath.slice();

		var value = valueArray;
		var nWorlds = value.length;
		for (var i=0;  i<nWorlds;  i++)
		{
			var importStr = value[i];
			var startIndex = importStr.indexOf( "id: " );
			if (startIndex >= 0)
			{
				var endIndex = importStr.indexOf( "\n", startIndex );
				if (endIndex > 0)
				{
					var id = importStr.substring( startIndex+4, endIndex );
					var canvas = this.findCanvasWithID( id, root );
					if (canvas)
					{
						var rt = new GLRuntime( canvas, importStr,  assetPath );
					}
				}
			}
		}
	}

	this.collectGLData = function( elt,  dataArray )
	{
		if (elt.elementModel && elt.elementModel.shapeModel && elt.elementModel.shapeModel.GLWorld)
		{
			var data = elt.elementModel.shapeModel.GLWorld.export( true );
			dataArray.push( data );
		}

		if (elt.children)
		{
			var nKids = elt.children.length;
			for (var i=0;  i<nKids;  i++)
			{
				var child = elt.children[i];
				this.collectGLData( child, dataArray );
			}
		}
	}

	this.findCanvasWithID = function( id,  elt )
	{
		var cid = elt.getAttribute( "data-RDGE-id" );
		if (cid == id)  return elt;

		if (elt.children)
		{
			var nKids = elt.children.length;
			for (var i=0;  i<nKids;  i++)
			{
				var child = elt.children[i];
				var foundElt = this.findCanvasWithID( id, child );
				if (foundElt)  return foundElt;
			}
		}
	}
}

///////////////////////////////////////////////////////////////////////
// Class GLRuntime
//      Manages runtime fora WebGL canvas
///////////////////////////////////////////////////////////////////////
function GLRuntime( canvas, importStr,  assetPath )
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

		// provide the mapping for the asset directory
		this._assetPath = assetPath.slice();
		if (this._assetPath[this._assetPath.length-1] != '/')
			this._assetPath += '/';

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
			rdgeGlobalParameters.u_light0Pos.set( [5*Math.cos(this.elapsed), 5*Math.sin(this.elapsed), 20]);
        
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
			mat.init( this );
		}
	}

	this.remapAssetFolder = function( url )
	{
		var searchStr = "assets/";
		var index = url.indexOf( searchStr );
		var rtnPath = url;
		if (index >= 0)
		{
			rtnPath = url.substr( index + searchStr.length );
			rtnPath = this._assetPath + rtnPath;
		}
		return rtnPath;
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
	var index = importStr.indexOf( "scenedata: " );
	this._useWebGL = (index >= 0);
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

///////////////////////////////////////////////////////////////////////
// Class RuntimeGeomObj
//      Super class for all geometry classes
///////////////////////////////////////////////////////////////////////
function RuntimeGeomObj()
{
    ///////////////////////////////////////////////////////////////////////
    // Constants
    ///////////////////////////////////////////////////////////////////////
	this.GEOM_TYPE_RECTANGLE		=  1;
	this.GEOM_TYPE_CIRCLE			=  2;
	this.GEOM_TYPE_LINE             =  3;
	this.GEOM_TYPE_PATH			    =  4;
	this.GEOM_TYPE_CUBIC_BEZIER     =  5;
	this.GEOM_TYPE_UNDEFINED		= -1;
	
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._children;

    // stroke and fill colors
    this._strokeColor	= [0,0,0,0];
    this._fillColor		= [0,0,0,0];

	// array of materials
	this._materials = [];

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////

	this.geomType	= function()		{  return this.GEOM_TYPE_UNDEFINED;	}

	this.setWorld	= function(w)		{  this._world = w;					}
	this.getWorld	= function()		{  return this._world;				}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    this.makeStrokeMaterial = function()
    {
    }

    this.makeFillMaterial = function()
    {
    }


    this.render = function()
    {
    }
    
	this.addChild = function( child )
	{
		if (!this._children)  this._children = [];
		this._children.push( child );
	}

    this.import = function()
    {
	}

	this.importMaterials = function(importStr)
	{
		var nMaterials = Number( getPropertyFromString( "nMaterials: ", importStr )  );
		for (var i=0;  i<nMaterials;  i++)
		{
			var matNodeName = getPropertyFromString( "materialNodeName: ",	importStr );

			var mat;
			var materialType = getPropertyFromString( "material: ",	importStr );
			switch (materialType)
			{
				case "flat":			mat = new RuntimeFlatMaterial();				break;
				case "radialGradient":  mat = new RuntimeRadialGradientMaterial();		break;
				case "linearGradient":  mat = new RuntimeLinearGradientMaterial();		break;
				case "bumpMetal":		mat = new RuntimeBumpMetalMaterial();			break;
				case "uber":			mat = new RuntimeUberMaterial();				break;
				case "plasma":			mat = new RuntimePlasmaMaterial();				break;

				case "deform":
				case "water":
				case "tunnel":
				case "reliefTunnel":
				case "squareTunnel":
				case "twist":
				case "fly":
				case "julia":
				case "mandel":
				case "star":
				case "zinvert":
				case "keleidoscope":
				case "radialBlur":
				case "pulse":			mat = new RuntimePulseMaterial();				break;

				default:
					console.log( "material type: " + materialType + " is not supported" );
					break;
			}

			if (mat)
			{
				mat.import( importStr );
				mat._materialNodeName = matNodeName;
				this._materials.push( mat );
			}

			var endIndex = importStr.indexOf( "endMaterial\n" );
			if (endIndex < 0)  break;
			importStr = importStr.substr( endIndex );
		}
	}

	////////////////////////////////////////////////////////////////////
	// vector function

	this.vecAdd = function( dimen,  a, b )
	{
        var rtnVec;
        if ((a.length < dimen) || (b.length < dimen))
        {
            throw new Error( "dimension error in vecAdd" );
        }

        rtnVec = [];
        for (var i=0;  i<dimen;  i++)
            rtnVec[i] = a[i] + b[i];

        return rtnVec;
    }


	this.vecSubtract =  function( dimen, a, b )
	{
        var rtnVec;
        if ((a.length < dimen) || (b.length < dimen))
        {
            throw new Error( "dimension error in vecSubtract" );
        }

        rtnVec = [];
        for (var i=0;  i<dimen;  i++)
            rtnVec[i] = a[i] - b[i];

        return rtnVec;
    }

    this.vecDot = function( dimen,  v0, v1 )
	{
        if ((v0.length < dimen) || (v1.length < dimen))
        {
            throw new Error( "dimension error in vecDot" );
        }

        var sum = 0.0;
        for (var i=0;  i<dimen;  i++)
            sum += v0[i] * v1[i];

        return sum;
    }

	this.vecMag = function( dimen, vec )
	{
        var sum = 0.0;
        for (var i=0;  i<dimen;  i++)
            sum += vec[i]*vec[i];
        return Math.sqrt( sum );
    }

	this.vecScale = function(dimen, vec, scale)
	{
        for (var i=0;  i<dimen;  i++)
            vec[i] *= scale;

        return vec;
    }

    this.vecNormalize = function(dimen, vec, len)
	{
        var rtnVec;
		if (!len)  len = 1.0;

        var sum = 0.0;
        for (var i=0;  i<dimen;  i++)
            sum += vec[i]*vec[i];
        sum = Math.sqrt( sum );

        if (Math.abs(sum) >= 0.001)
        {
            var scale = len/sum;
            rtnVec = [];
            for (var i=0;  i<dimen;  i++)
                rtnVec[i] = vec[i]*scale;
        }

        return rtnVec;
    },

	this.transformPoint = function( srcPt, mat )
    {
        var pt = srcPt.slice(0);
        var	x = this.vecDot(3,  pt, [mat[0], mat[4], mat[ 8]] ) + mat[12],
            y = this.vecDot(3,  pt, [mat[1], mat[5], mat[ 9]] ) + mat[13],
            z = this.vecDot(3,  pt, [mat[2], mat[6], mat[10]] ) + mat[14];

        return [x, y, z];
    }
}

function getPropertyFromString( prop, str )
{
	var index = str.indexOf( prop );
	if (index < 0)  throw new Error( "property " + prop + " not found in string: " + str);

	var rtnStr = str.substr( index+prop.length );
	index = rtnStr.indexOf( "\n" );
	if (index >= 0)
		rtnStr = rtnStr.substr(0, index);

	return rtnStr;
}

///////////////////////////////////////////////////////////////////////
// Class RuntimeRectangle
///////////////////////////////////////////////////////////////////////
function RuntimeRectangle()
{
	// inherit the members of RuntimeGeomObj
	this.inheritedFrom = RuntimeGeomObj;
	this.inheritedFrom();

	this.import = function( importStr )
	{
		this._xOffset			= Number( getPropertyFromString( "xoff: ",			importStr )  );
		this._yOffset			= Number( getPropertyFromString( "yoff: ",			importStr )  );
		this._width				= Number( getPropertyFromString( "width: ",		importStr )  );
		this._height			= Number( getPropertyFromString( "height: ",		importStr )  );
		this._strokeWidth		= Number( getPropertyFromString( "strokeWidth: ",	importStr )  );
		this._innerRadius		= Number( getPropertyFromString( "innerRadius: ",	importStr )  );
		this._strokeStyle		= Number( getPropertyFromString( "strokeStyle: ",	importStr )  );
		var strokeMaterialName	= getPropertyFromString( "strokeMat: ",	importStr );
		var fillMaterialName	= getPropertyFromString( "fillMat: ",		importStr );
		this._strokeStyle		=  getPropertyFromString( "strokeStyle: ",	importStr );
		this._fillColor			=  eval( "[" + getPropertyFromString( "fillColor: ",	importStr ) + "]" );
		this._strokeColor		=  eval( "[" + getPropertyFromString( "strokeColor: ",	importStr ) + "]" );
		this._tlRadius			=  Number( getPropertyFromString( "tlRadius: ",	importStr )  );
		this._trRadius			=  Number( getPropertyFromString( "trRadius: ",	importStr )  );
		this._blRadius			=  Number( getPropertyFromString( "blRadius: ",	importStr )  );
		this._brRadius			=  Number( getPropertyFromString( "brRadius: ",	importStr )  );

		this.importMaterials( importStr );
	}

	this.renderPath = function( inset, ctx )
	{
		// various declarations
		var pt,  rad,  ctr,  startPt, bPts;
		var width  = Math.round(this._width),
			height = Math.round(this._height);

		pt = [inset, inset];	// top left corner

		var tlRad = this._tlRadius; //top-left radius
		var trRad = this._trRadius;
		var blRad = this._blRadius;
		var brRad = this._brRadius;

		if ((tlRad <= 0) && (blRad <= 0) && (brRad <= 0) && (trRad <= 0))
		{
			ctx.rect(pt[0], pt[1], width - 2*inset, height - 2*inset);
		}
		else
		{
			// get the top left point
			rad = tlRad - inset;
			if (rad < 0)  rad = 0;
			pt[1] += rad;
			if (Math.abs(rad) < 0.001)  pt[1] = inset;
			ctx.moveTo( pt[0],  pt[1] );

			// get the bottom left point
			pt = [inset, height - inset];
			rad = blRad - inset;
			if (rad < 0)  rad = 0;
			pt[1] -= rad;
			ctx.lineTo( pt[0],  pt[1] );

			// get the bottom left curve
			if (rad > 0.001)
				ctx.quadraticCurveTo( inset, height-inset,  inset+rad, height-inset );

			// do the bottom of the rectangle
			pt = [width - inset,  height - inset];
			rad = brRad - inset;
			if (rad < 0)  rad = 0;
			pt[0] -= rad;
			ctx.lineTo( pt[0], pt[1] );

			// get the bottom right arc
			if (rad > 0.001)
				ctx.quadraticCurveTo( width-inset, height-inset,  width-inset, height-inset-rad );

			// get the right of the rectangle
			pt = [width - inset,  inset];
			rad = trRad - inset;
			if (rad < 0)  rad = 0;
			pt[1] += rad;
			ctx.lineTo( pt[0], pt[1] );

			// do the top right corner
			if (rad > 0.001)
				ctx.quadraticCurveTo( width-inset, inset,  width-inset-rad, inset );

			// do the top of the rectangle
			pt = [inset, inset]
			rad = tlRad - inset;
			if (rad < 0)  rad = 0;
			pt[0] += rad;
			ctx.lineTo( pt[0], pt[1] );

			// do the top left corner
			if (rad > 0.001)
				ctx.quadraticCurveTo( inset, inset, inset, inset+rad );
			else
				ctx.lineTo( inset, 2*inset );
		}
	}

    this.render = function()
    {
        // get the world
        var world = this.getWorld();
        if (!world)  throw( "null world in rectangle render" );

         // get the context
		var ctx = world.get2DContext();
		if (!ctx)  return;

		// get some dimensions
		var lw = this._strokeWidth;
		var	w = world.getViewportWidth(),
			h = world.getViewportHeight();
		
		// render the fill
		ctx.beginPath();
		if (this._fillColor)
		{
			var c = "rgba(" + 255*this._fillColor[0] + "," + 255*this._fillColor[1] + "," + 255*this._fillColor[2] + "," + this._fillColor[3] + ")";  
			ctx.fillStyle = c;

			ctx.lineWidth	= lw;
			var inset = Math.ceil( lw ) + 0.5;
			this.renderPath( inset, ctx );
			ctx.fill();
			ctx.closePath();
		}

		// render the stroke
		ctx.beginPath();
		if (this._strokeColor)
		{
			var c = "rgba(" + 255*this._strokeColor[0] + "," + 255*this._strokeColor[1] + "," + 255*this._strokeColor[2] + "," + this._strokeColor[3] + ")";  
			ctx.strokeStyle = c;

			ctx.lineWidth	= lw;
			var inset = Math.ceil( 0.5*lw ) + 0.5;
			this.renderPath( inset, ctx );
			ctx.stroke();
			ctx.closePath();
		}
    }
}

///////////////////////////////////////////////////////////////////////
// Class RuntimeOval
///////////////////////////////////////////////////////////////////////
function RuntimeOval()
{
	// inherit the members of RuntimeGeomObj
	this.inheritedFrom = RuntimeGeomObj;
	this.inheritedFrom();

	this.import = function( importStr )
	{
		this._xOffset			= Number( getPropertyFromString( "xoff: ",			importStr ) );
		this._yOffset			= Number( getPropertyFromString( "yoff: ",			importStr ) );
		this._width				= Number( getPropertyFromString( "width: ",		importStr ) );
		this._height			= Number( getPropertyFromString( "height: ",		importStr ) );
		this._strokeWidth		= Number( getPropertyFromString( "strokeWidth: ",	importStr ) );
		this._innerRadius		= Number( getPropertyFromString( "innerRadius: ",	importStr ) );
		this._strokeStyle		= getPropertyFromString( "strokeStyle: ",	importStr );
		var strokeMaterialName	= getPropertyFromString( "strokeMat: ",	importStr );
		var fillMaterialName	= getPropertyFromString( "fillMat: ",		importStr );
		this._fillColor			=  eval( "[" + getPropertyFromString( "fillColor: ",	importStr ) + "]" );
		this._strokeColor		=  eval( "[" + getPropertyFromString( "strokeColor: ",	importStr ) + "]" );
		
		this.importMaterials( importStr );
	}

	this.render = function()
	{
		// get the world
		var world = this.getWorld();
		if (!world)  throw( "null world in buildBuffers" );

		 // get the context
		var ctx = world.get2DContext();
		if (!ctx)  return;

		// declare some variables
		var p0, p1;
		var x0, y1,   x1, y1;

		// create the matrix
		var lineWidth = this._strokeWidth;
		var innerRad  = this._innerRadius;
		var xScale = 0.5*this._width - lineWidth,
			yScale = 0.5*this._height - lineWidth;

		// translate
		var xCtr = 0.5*world.getViewportWidth() + this._xOffset,
			yCtr = 0.5*world.getViewportHeight() + this._yOffset;
		var mat = [
							[ xScale,     0.0,  0.0,  xCtr],
							[    0.0,  yScale,  0.0,  yCtr],
							[    0.0,     0.0,  1.0,   0.0],
							[    0.0,     0.0,  0.0,   1.0]
						];

		// get a bezier representation of the circle
		var bezPts = this.circularArcToBezier( [0,0,0],  [1,0,0], 2.0*Math.PI );
		if (bezPts)
		{
			var n = bezPts.length;

			// set up the fill style
			ctx.beginPath();
			ctx.lineWidth = 0;
			if (this._fillColor)
			{
				var c = "rgba(" + 255*this._fillColor[0] + "," + 255*this._fillColor[1] + "," + 255*this._fillColor[2] + "," + this._fillColor[3] + ")";  
				ctx.fillStyle = c;

				// draw the fill
				ctx.beginPath();
				var p = this.transformPoint( bezPts[0],   mat );
				ctx.moveTo( p[0],  p[1] );
				var index = 1;
				while (index < n)
				{
					p0 = this.transformPoint( bezPts[index],  mat );
					p1 = this.transformPoint( bezPts[index+1],  mat );

					x0 = p0[0];  y0 = p0[1];
					x1 = p1[0];  y1 = p1[1];
					ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
					index += 2;
				}

				if ( innerRad > 0.001)
				{
					xScale = 0.5*innerRad*this._width;
					yScale = 0.5*innerRad*this._height;
					mat[0] = xScale;
					mat[5] = yScale;

					// get the bezier points
					var bezPts = this.circularArcToBezier( Vector.create([0,0,0]), Vector.create([1,0,0]), -2.0*Math.PI );
					if (bezPts)
					{
						var n = bezPts.length;
						p = this.transformPoint( bezPts[0],   mat );
						ctx.moveTo( p[0],  p[1] );
						index = 1;
						while (index < n)
						{
							p0 = this.transformPoint( bezPts[index],    mat );
							p1 = this.transformPoint( bezPts[index+1],  mat );

							var x0 = p0[0],  y0 = p0[1],
								x1 = p1[0],  y1 = p1[1];
							ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
							index += 2;
						}
					}
				}

				// fill the path
				ctx.fill();
			}

			// calculate the stroke matrix
			xScale = 0.5*this._width  - 0.5*lineWidth;
			yScale = 0.5*this._height - 0.5*lineWidth;
			mat[0] = xScale;
			mat[5] = yScale;

			// set up the stroke style
			ctx.beginPath();
			ctx.lineWidth	= lineWidth;
			if (this._strokeColor)
			{
				var c = "rgba(" + 255*this._strokeColor[0] + "," + 255*this._strokeColor[1] + "," + 255*this._strokeColor[2] + "," + this._strokeColor[3] + ")";  
				ctx.strokeStyle = c;
			
				// draw the stroke
				p = this.transformPoint( bezPts[0],   mat );
				ctx.moveTo( p[0],  p[1] );
				index = 1;
				while (index < n)
				{
					var p0 = this.transformPoint( bezPts[index],  mat );
					var p1 = this.transformPoint( bezPts[index+1],  mat );

					var x0 = p0[0],  y0 = p0[1],
						x1 = p1[0],  y1 = p1[1];
					ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
					index += 2;
				}

				if (innerRad > 0.01)
				{
					// calculate the stroke matrix
					xScale = 0.5*innerRad*this._width  - 0.5*lineWidth;
					yScale = 0.5*innerRad*this._height - 0.5*lineWidth;
					mat[0] = xScale;
					mat[5] = yScale;
			
					// draw the stroke
					p = this.transformPoint( bezPts[0],   mat );
					ctx.moveTo( p[0],  p[1] );
					index = 1;
					while (index < n)
					{
						var p0 = this.transformPoint( bezPts[index],  mat );
						var p1 = this.transformPoint( bezPts[index+1],  mat );

						var x0 = p0[0],  y0 = p0[1],
							x1 = p1[0],  y1 = p1[1];
						ctx.quadraticCurveTo( x0,  y0,  x1, y1 );
						index += 2;
					}
				}

				// render the stroke
				ctx.stroke();
			}
		}
    }

    ///////////////////////////////////////////////////////////////////////
	// this function returns the quadratic Bezier approximation to the specified
	// circular arc.  The input can be 2D or 3D, determined by the minimum dimension
	// of the center and start point.
	// includedAngle is in radians, can be positiveor negative
	this.circularArcToBezier= function( ctr_, startPt_, includedAngle )
	{
        var dimen = 3;
        var ctr = ctr_.slice();
        var startPt = startPt_.slice();

        // make sure the start point is good
        var pt = this.vecSubtract(dimen, startPt, ctr);
        var rad = this.vecMag(dimen, pt);

        if ((dimen != 3) || (rad <= 0) || (includedAngle === 0))
        {
            if (dimen != 3)  console.log( "circularArcToBezier works for 3 dimensional points only.  Was " + dimen );
            return [ startPt.slice(0), startPt.slice(0), startPt.slice(0) ];
        }

        // determine the number of segments.  45 degree span maximum.
        var nSegs = Math.ceil( Math.abs(includedAngle)/(0.25*Math.PI) );
        if (nSegs <= 0)  return [ startPt.slice(0), startPt.slice(0), startPt.slice(0) ];
        var dAngle = includedAngle/nSegs;

        // determine the length of the center control point from the circle center
        var cs = Math.cos( 0.5*Math.abs(dAngle) ),  sn = Math.sin( 0.5*Math.abs(dAngle) );
        var  c = rad*sn;
        var  h = c*sn/cs;
        var  d = rad*cs + h;

        var rtnPts = [ this.vecAdd(dimen, pt, ctr) ];
        var rotMat = Matrix.RotationZ( dAngle );
        for ( var i=0;  i<nSegs;  i++)
        {
            // get the next end point
            var pt2 = this.transformPoint( pt, rotMat );

            // get the next center control point
            var midPt = this.vecAdd(3, pt, pt2);
            this.vecScale(dimen, midPt, 0.5);
            midPt = this.vecNormalize( dimen, midPt, d );

            // save the next segment
            rtnPts.push( this.vecAdd(dimen, midPt, ctr) );
            rtnPts.push( this.vecAdd(dimen,   pt2, ctr) );

            // advance for the next segment
            pt = pt2;
        }
        return rtnPts;
	}
}

///////////////////////////////////////////////////////////////////////
// Class RuntimeMaterial
//      Runtime representation of a material.
///////////////////////////////////////////////////////////////////////
function RuntimeMaterial( world )
{
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "GLMaterial";
	this._shaderName = "undefined";

	// variables for animation speed
	this._time = 0.0;
	this._dTime = 0.01;

	// RDGE variables
	this._shader;
	this._materialNode;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////

	// a material can be animated or not. default is not.  
	// Any material needing continuous rendering should override this method
	this.isAnimated			= function()	{  return false;	}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	this.init = function()
	{
	}

	this.update = function( time )
	{
	}

	this.import = function( importStr )
	{
	}

	this.getPropertyFromString = function( prop, str )
	{
		var index = str.indexOf( prop );
		if (index < 0)  throw new Error( "property " + prop + " not found in string: " + str);

		var rtnStr = str.substr( index+prop.length );
		index = rtnStr.indexOf( "\n" );
		if (index >= 0)
			rtnStr = rtnStr.substr(0, index);

		return rtnStr;
	}

}

function RuntimeFlatMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeMaterial;
	this.inheritedFrom();

	this._name = "FlatMaterial";
	this._shaderName = "flat";

	// assign a default color
	this._color = [1,0,0,1];

    this.import = function( importStr )
    {
		var colorStr = this.getPropertyFromString( "color: ",	importStr );
		if (colorStr)
			this._color  = eval( "[" + colorStr + "]" );
    };


	this.init = function()
	{
		if (this._shader)
		{
			 this._shader.colorMe["color"].set( this._color );
		}
	}
}

function RuntimePulseMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeMaterial;
	this.inheritedFrom();

	this._name = "PulseMaterial";
	this._shaderName = "pulse";

	this._texMap = 'assets/images/cubelight.png';

	this.isAnimated			= function()	{  return true;	}


	this.import = function( importStr )
	{
		this._texMap = this.getPropertyFromString( "texture: ",	importStr );
	}

	this.init = function( world )
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram.default;
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader.default)
				{
					var res = [ renderer.vpWidth,  renderer.vpHeight ];
					technique.u_resolution.set( res );

					var wrap = 'REPEAT',  mips = true;
					this._texMap = world.remapAssetFolder( this._texMap );
					var tex = renderer.getTextureByName(this._texMap, wrap, mips );
					if (tex)
						technique.u_tex0.set( tex );

					this._shader.default.u_time.set( [this._time] );
				}
			}
		}
	}

	// several materials inherit from pulse.
	// they may share this update method
	this.update = function( time )
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram.default;
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader.default)
					this._shader.default.u_time.set( [this._time] );
				this._time += this._dTime;
				if (this._time > 200.0)  this._time = 0.0;
			}
		}
	}
}

function RuntimeRadialGradientMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeMaterial;
	this.inheritedFrom();

	this._name = "RadialGradientMaterial";
	this._shaderName = "radialGradient";

	// setup default values
	this._color1 = [1,0,0,1];  this._colorStop1 = 0.0;
	this._color2 = [0,1,0,1];  this._colorStop2 = 0.3;
	this._color3 = [0,1,0,1];  this._colorStop3 = 0.6;
	this._color4 = [0,1,0,1];  this._colorStop4 = 1.0;

	this.init = function()
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram.default;
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader.default)
				{
					this._shader.default.u_color1.set( this._color1 );
					this._shader.default.u_color2.set( this._color2 );
					this._shader.default.u_color3.set( this._color3 );
					this._shader.default.u_color4.set( this._color4 );

					this._shader.default.u_colorStop1.set( [this._colorStop1] );
					this._shader.default.u_colorStop2.set( [this._colorStop2] );
					this._shader.default.u_colorStop3.set( [this._colorStop3] );
					this._shader.default.u_colorStop4.set( [this._colorStop4] );

					if (this._angle !== undefined)
						this._shader.default.u_cos_sin_angle.set([Math.cos(this._angle), Math.sin(this._angle)]);
				}
			}
		}
	}

	this.import = function( importStr )
	{
		var colorStr;
		colorStr = this.getPropertyFromString( "color1: ",	importStr );
		this._color1  = eval( "[" + colorStr + "]" );
		colorStr = this.getPropertyFromString( "color2: ",	importStr );
		this._color2  = eval( "[" + colorStr + "]" );
		colorStr = this.getPropertyFromString( "color3: ",	importStr );
		this._color3  = eval( "[" + colorStr + "]" );
		colorStr = this.getPropertyFromString( "color4: ",	importStr );
		this._color4  = eval( "[" + colorStr + "]" );

		this._colorStop1 = Number( this.getPropertyFromString( "colorStop1: ",	importStr ) );
		this._colorStop2 = Number( this.getPropertyFromString( "colorStop2: ",	importStr ) );
		this._colorStop3 = Number( this.getPropertyFromString( "colorStop3: ",	importStr ) );
		this._colorStop4 = Number( this.getPropertyFromString( "colorStop4: ",	importStr ) );

		if (this._angle !== undefined)
			this._angle = this.getPropertyFromString( "angle: ",	importStr );
	}

}

function RuntimeLinearGradientMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeRadialGradientMaterial;
	this.inheritedFrom();

	this._name = "LinearGradientMaterial";
	this._shaderName = "linearGradient";

	// the only difference between linear & radial gradient is the existance of an angle for linear.
	this._angle = 0.0;
}

function RuntimeBumpMetalMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeMaterial;
	this.inheritedFrom();

	this._name = "BumpMetalMaterial";
	this._shaderName = "bumpMetal";

	this._lightDiff = [0.3, 0.3, 0.3, 1.0];
	this._diffuseTexture = "assets/images/metal.png";
	this._specularTexture = "assets/images/silver.png";
	this._normalTexture = "assets/images/normalMap.png";

	this.import = function( importStr )
	{
		this._lightDiff  = eval( "[" + this.getPropertyFromString( "lightDiff: ",	importStr ) + "]" );
		this._diffuseTexture = this.getPropertyFromString( "diffuseTexture: ",	importStr );
		this._specularTexture = this.getPropertyFromString( "specularTexture: ",	importStr );
		this._normalTexture = this.getPropertyFromString( "normalMap: ",	importStr );
	}

	this.init = function()
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram.default;
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader.default)
				{
					technique.u_light0Diff.set( this._lightDiff );

					var tex;
					var wrap = 'REPEAT',  mips = true;
					if (this._diffuseTexture)
					{
						this._diffuseTexture = world.remapAssetFolder( this._diffuseTexture );
						tex = renderer.getTextureByName(this._diffuseTexture, wrap, mips );
						if (tex)  technique.u_colMap.set( tex );

					}
					if (this._normalTexture)
					{
						this._normalTexture = world.remapAssetFolder( this._normalTexture );
						tex = renderer.getTextureByName(this._normalTexture, wrap, mips );
						if (tex)  technique.u_normalMap.set( tex );
					}
					if (this._specularTexture)
					{
						this._specularTexture = world.remapAssetFolder( this._specularTexture );
						tex = renderer.getTextureByName(this._specularTexture, wrap, mips );
						technique.u_glowMap.set( tex );
					}
				}
			}
		}
	}
}

function RuntimeUberMaterial()
{
}

function RuntimePlasmaMaterial()
{
	// inherit the members of RuntimeMaterial
	this.inheritedFrom = RuntimeMaterial;
	this.inheritedFrom();

	this.init = function(  )
	{
		this.update();
	}

	this.update = function( time )
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram.default;
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._shader && this._shader.default)
					this._shader.default.u_time.set( [this._time] );
				this._time += this._dTime;
				if (this._time > 200.0)  this._time = 0.0;
			}
		}
	}
}