/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var MaterialParser		= require("js/lib/rdge/materials/material-parser").MaterialParser;
var Material			= require("js/lib/rdge/materials/material").Material;
var GLWorld				= require("js/lib/drawing/world").World;
var Texture				= require("js/lib/rdge/texture").Texture;
var ElementMediator		= require("js/mediators/element-mediator").ElementMediator;
var TagTool				= require("js/tools/TagTool").TagTool;

///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
var CloudMaterial = function CloudMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "CloudMaterial";
	this._shaderName = "cloud";

	this._texMap = 'assets/images/cloud10.png';
	//this._texMap = 'assets/images/us_flag.png';
	//this._texMap = 'assets/images/cubelight.png';
	this._diffuseColor = [0.5, 0.5, 0.5, 0.5];

	// base size of cloud polygons.  Random adjustments made to each quad
	this._cloudSize = 40;

	this._time = 0.0;
	this._dTime = 0.001;

	// parameter initial values
	this._time			= 0.0;
	this._surfaceAlpha	= 0.5;
	this._zmin			= 2.0;
	this._zmax			= 5.0;

	// the adjusted zMin and zMax values are
	// what get sent to the shader.  They are initialized
	// in buildGeometry
	this._adjustedZMin = this._zmin;
	this._adjustedZMax = this._zmax;



    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getName		= function()	{ return this._name;			};
	this.getShaderName	= function()	{  return this._shaderName;		};

	this.getTextureMap			= function()		{  return this._propValues[this._propNames[0]] ? this._propValues[this._propNames[0]].slice() : null	};
	this.setTextureMap			= function(m)		{  this._propValues[this._propNames[0]] = m ? m.slice(0) : null;  this.updateTexture();  	};

	this.isAnimated			= function()			{  return true;					};

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["texmap",		"diffusecolor"];
	this._propLabels		= ["Texture map",	"Diffuse Color"];
	this._propTypes			= ["file",			"color"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._texMap.slice(0);
	this._propValues[ this._propNames[1] ] = this._diffuseColor.slice();

    this.setProperty = function( prop, value )
	{
		if (prop === 'color')  prop = 'diffusecolor';

		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (!ok) {
			console.log( "invalid property in Radial Gradient Material:" + prop + " : " + value );
        }

		switch (prop)
		{
			case "texmap":
				this.setTextureMap(value);
				break;

			case "color":
				break;
		}
	};
    ///////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function( world )
	{
		// save the world
		if (world)  this.setWorld( world );

		// allocate a new uber material
		var newMat = new CloudMaterial();

		// copy over the current values;
		var propNames = [],  propValues = [],  propTypes = [],  propLabels = [];
		this.getAllProperties( propNames,  propValues,  propTypes,  propLabels);
		var n = propNames.length;
		for (var i=0;  i<n;  i++) {
			newMat.setProperty( propNames[i], propValues[i] );
        }

		return newMat;
	};

	this.init = function( world )
	{
		var GLWorld = require("js/lib/drawing/world").World,
		    NJUtils = require("js/lib/NJUtils").NJUtils;

		// save the world
		if (world)  this.setWorld( world );
		var dstWorld = world;

		// create a canvas to render into
		var dstCanvas = this.getWorld().getCanvas();
		var doc = this.getWorld().getCanvas().ownerDocument;
		var canvasID = "__canvas__";
		//this._srcCanvas = doc.createElement(canvasID);
		this._srcCanvas = NJUtils.makeNJElement("canvas", canvasID, "shape", {"data-RDGE-id": NJUtils.generateRandom()}, true);
		srcCanvas = this._srcCanvas;
		srcCanvas.width  = dstCanvas.width;
		srcCanvas.height = dstCanvas.height;

		//////////////////////////////////////////////////////////////////////////////////
		// IS THIS NECESSARY??
//        var elementModel = TagTool.makeElement(~~srcCanvas.width, ~~srcCanvas.height,
//                                                                        Matrix.I(4), [0,0,0], srcCanvas);
//        ElementMediator.addElement(srcCanvas, elementModel.data, true);
		//////////////////////////////////////////////////////////////////////////////////

		// build the source.
		// the source being the world/canvas/geometry of the clouds.
		// the source is used to create a texture map that is then used by
		// the destimation.
		this.buildSource();

		// set up the shader
		this._shader = new jshader();
		this._shader.def = cloudMapMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = createMaterialNode("cloudMapMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		// initialize the time
		this._time = 0;

		// create the texture to map the source cloud generation world/canvas to the destination
		var wrap = 'REPEAT',  mips = true;
		this._glTex = new Texture( world, this._srcCanvas,  wrap, mips );

		// set the shader values in the shader
		this.updateTexture();
		this.update( 0 );
	};

	this.updateTexture = function()
	{
		var material = this._materialNode;
		if (material) 
		{
			// save the current context
			var saveContext = g_Engine.getContext();
			g_Engine.setContext( this._srcCanvas.rdgeid );

			var technique = material.shaderProgram['default'];
			var renderer = g_Engine.getContext().renderer;
			if (renderer && technique) {
				var wrap = 'REPEAT',  mips = true;
                if (this._glTex)
                {
                    this._glTex.render();
                    var tex = this._glTex.getTexture();
					if (tex)
						technique.u_tex0.set( tex );
                }
			}

			// restore the context
			g_Engine.setContext( saveContext.id );
		}
	};
		
	this.updateTextures = function()
	{
		if (this._glTex)
		{
			if (!this._glTex.isAnimated())
			{
				this._glTex.render();
				this.updateTexture();
			}
		}
	}

	this.update = function( time )
	{
		if (this._srcWorld)
		{
			this._srcWorld.update();
			this._srcWorld.draw();
			g_Engine.setContext( this.getWorld()._canvas.rdgeid );
		}

		var technique, renderer, tex;
		
		// update the cloud map material
		var material = this._materialNode;
		if (material)
		{
			technique = material.shaderProgram['default'];
			renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._glTex)
				{
					this._glTex.render();
					tex = this._glTex.getTexture();
					technique.u_tex0.set( tex );
				}
			}
		}

		// update the source material
		material = this._srcMaterialNode;
		if (material)
		{
			technique = material.shaderProgram['default'];
			renderer = g_Engine.getContext().renderer;
			if (renderer && technique)
			{
				technique.u_time.set( [this._time] );
 				this._time += this._dTime;
			}
		}
	};

	this.buildSource = function()
	{
		// save the current RDGE context so we can reset it later
		var saveContext = g_Engine.getContext();
		this.getWorld().stop();	

		// build a world to do the rendering
		this._srcWorld = new GLWorld( this._srcCanvas, true, true );
		var srcWorld = this._srcWorld;
		if (!this._srcCanvas)  throw new Error( "No source canvas in Cloud material" );
		this._srcCanvas.__GLWorld = srcWorld;

		// build the geometry
		var prim = this.buildGeometry( srcWorld,  srcCanvas.width, srcCanvas.height );

		// set up the shader
		var shader = new jshader();
		shader.def = cloudMaterialDef;
		shader.init();
		this._srcShader = shader;

		// set up the material node
		var materialNode = createMaterialNode("cloudMaterial" + "_" + srcWorld.generateUniqueNodeID());
		materialNode.setShader(shader);
		this._srcMaterialNode = materialNode;

		// add the nodes to the tree
		var trNode = createTransformNode("objRootNode_" + srcWorld._nodeCounter++);
		srcWorld._rootNode.insertAsChild( trNode );
		trNode.attachMeshNode(srcWorld.renderer.id + "_prim_" + srcWorld._nodeCounter++, prim);
        trNode.attachMaterial( materialNode );

		// initialize the shader uniforms
		this._time = 0;
		if (shader['default']) {
			var t = shader['default'];
			if (t)
			{
				t.u_time.set( [this._time] );
				t.u_surfaceAlpha.set( [this._surfaceAlpha] );
				t.u_zmin.set( [this._adjustedZMin] );
				t.u_zmax.set( [this._adjustedZMax] );

				var wrap = 'REPEAT',  mips = true;
				var texMapName = this._propValues[this._propNames[0]];
				var tex = srcWorld.renderer.getTextureByName(texMapName, wrap, mips );
				if (tex)
				{
					srcWorld.textureToLoad( tex );
					t.u_tex0.set( tex );
				}
			}
		}

		// start the render loop on the source canvas
		srcWorld.restartRenderLoop();

		// restore the original context
		g_Engine.setContext( saveContext.id );
		this.getWorld().start();
	};

	this.buildGeometry = function(world,  canvasWidth,  canvasHeight)
	{
		var RectangleGeometry	= require("js/lib/geom/rectangle").RectangleGeometry;

		RectangleGeometry.init();

		// get the normalized device coordinates (NDC) for
		// all position and dimensions.
		var vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var xNDC = 0.0/vpw,  yNDC = 0.0/vph,
			xFillNDC = canvasWidth/vpw,  yFillNDC = canvasHeight/vph;

		var aspect = world.getAspect();
		var zn = world.getZNear(),  zf = world.getZFar();
		var t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
			b = -t,
			r = aspect*t,
			l = -r;

		// calculate the object coordinates from their NDC coordinates
		var z = -world.getViewDistance();

		// get the position of the origin
		var x = -z*(r-l)/(2.0*zn)*xNDC,
			y = -z*(t-b)/(2.0*zn)*yNDC;

		// get the x and y fill
		var hWidth = -z*(r-l)/(2.0*zn)*xFillNDC,
			hHeight = -z*(t-b)/(2.0*zn)*yFillNDC;

		
		//this.createFill([x,y],  2*xFill,  2*yFill,  tlRadius, blRadius, brRadius, trRadius, fillMaterial);
		var ctr = [x,y],  width = 2*hWidth,  height = 2*hHeight;
		var cloudSize = width > height ? 0.25*width : 0.25*height;
		var left = x - hHeight,
			top  = y - hHeight;

		// get the GL projection matrix so wecan calculate the z values from the user input z values
		var zNear = world.getZNear(),  zFar = world.getZFar();
		var viewDist = world.getViewDistance();
		var projMat = Matrix.makePerspective( world.getFOV(), world.getAspect(), world.getZNear(), world.getZFar());
		var camMat = world.getCameraMat();
		var camMatInv = glmat4.inverse( camMat, [] );
		var glCompleteMat = glmat4.multiply( projMat, camMatInv, [] );
		var zw1_c = MathUtils.transformAndDivideHomogeneousPoint( [0,0, -zNear + viewDist], glCompleteMat )[2],
			zw2_c = MathUtils.transformAndDivideHomogeneousPoint( [0,0,  -zFar + viewDist], glCompleteMat )[2];
		var glCompleteMatInv = glmat4.inverse( glCompleteMat, [] );
		var zMin = MathUtils.transformAndDivideHomogeneousPoint( [0,0, -this._zmin + viewDist], glCompleteMat )[2],
			zMax = MathUtils.transformAndDivideHomogeneousPoint( [0,0, -this._zmax + viewDist], glCompleteMat )[2];

		zMax = -this._zmin + viewDist;
		zMin = -this._zmax + viewDist;
		dz = zMax - zMin;

		// the adjusted values are what get sent to the shader
		this._adjustedZMin = zMin;
		this._adjustedZMax = zMax;

		
		// build the polygons
		var verts	= [],
			normals	= [ [0,0,1], [0,0,1], [0,0,1], [0,0,1] ],
			uvs		= [ [0,0], [1,0], [1,1], [0,1] ];
	
		for ( i = 0; i < 20; i++ )
		{
//			var x = hWidth*2*(Math.random() - 0.5),
//				y = hHeight*2.0*(Math.random() - 0.5),
			var x = left + Math.random()*width,
				y =  top + Math.random()*height,
				z = zMin + Math.random()*dz;
				zRot = (Math.random() - 0.5) * Math.PI,
				sz = cloudSize * Math.random();

			//x = 0.0;  y = 0.0;  z = 0.0;
			//zRot = 0.0;
			//z = 0;

			verts[0] = [-sz, -sz, 0];
			verts[1] = [-sz,  sz, 0];
			verts[2] = [ sz,  sz, 0];
			verts[3] = [ sz, -sz, 0];

			var rotMat = Matrix.RotationZ( zRot );
			var transMat = Matrix.Translation( [x,y,z] );
			var mat = glmat4.multiply( transMat, rotMat, [] );

			glmat4.multiplyVec3( mat, verts[0] );
			glmat4.multiplyVec3( mat, verts[1] );
			glmat4.multiplyVec3( mat, verts[2] );
			glmat4.multiplyVec3( mat, verts[3] );

			var tmp0 = MathUtils.transformAndDivideHomogeneousPoint( verts[0], glCompleteMat ),
				tmp1 = MathUtils.transformAndDivideHomogeneousPoint( verts[1], glCompleteMat ),
				tmp2 = MathUtils.transformAndDivideHomogeneousPoint( verts[2], glCompleteMat ),
				tmp3 = MathUtils.transformAndDivideHomogeneousPoint( verts[3], glCompleteMat );

			RectangleGeometry.addQuad( verts,  normals, uvs );
		}

		return RectangleGeometry.buildPrimitive();
	};

	// JSON export
	this.exportJSON = function()
	{
		var jObj =
		{
			'material'		: this.getShaderName(),
			'name'			: this.getName(),
			'texture'		: this._propValues[this._propNames[0]]
		};

		return jObj;
	};

	this.importJSON = function( jObj )
	{
        if (this.getShaderName() != jObj.material)  throw new Error( "ill-formed material" );
        this.setName(  jObj.name );

        try {
			this._propValues[this._propNames[0]] = jObj.texture;
        }
        catch (e)
        {
            throw new Error( "could not import material: " + jObj );
        }
	}
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// the cloud material def is used for cloud generation on the
// local world created by the cloud material.
var cloudMaterialDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/Cloud.vert.glsl",
		'defaultFShader':"assets/shaders/Cloud.frag.glsl"
	},
	'techniques':
	{ 
		'default':
		[
			{
				'vshader' : 'defaultVShader',
				'fshader' : 'defaultFShader',
				// attributes
				'attributes' :
				{
					'vert'  :   { 'type' : 'vec3' },
					'normal' :  { 'type' : 'vec3' },
					'texcoord'  :   { 'type' : 'vec2' }
				},
				// parameters
				'params' : 
				{
					'u_tex0'			: { 'type' : 'tex2d' },
					'u_time'			: { 'type' : 'float' },
					'u_surfaceAlpha'	: { 'type' : 'float' },
					'u_zmin'			: { 'type' : 'float' },
					'u_zmax'			: { 'type' : 'float' }
				},

				// render states
				'states' : 
				{
					'depthEnable' : true,
					'offset':[1.0, 0.1]
				}
			}
		]
	}
};
 
// the cloud map material def is used to map the cloud image onto
// the destination geometry
var cloudMapMaterialDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/Basic.vert.glsl",
		'defaultFShader':"assets/shaders/BasicTex.frag.glsl"
	},
	'techniques':
	{ 
		'default':
		[
			{
				'vshader' : 'defaultVShader',
				'fshader' : 'defaultFShader',
				// attributes
				'attributes' :
				{
					'vert'  :   { 'type' : 'vec3' },
					'normal' :  { 'type' : 'vec3' },
					'texcoord'  :   { 'type' : 'vec2' }
				},
				// parameters
				'params' : 
				{
					'u_tex0'			: { 'type' : 'tex2d' },
				},

				// render states
				'states' : 
				{
					'depthEnable' : true,
					'offset':[1.0, 0.1]
				}
			}
		]
	}
};



CloudMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.CloudMaterial = CloudMaterial;
}

