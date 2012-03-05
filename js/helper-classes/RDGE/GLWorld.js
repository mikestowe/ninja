/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// globals
var shaderProgramArray = new Array;
var glContextArray = new Array;

var vertexShaderSource = "";
var fragmentShaderSource = "";

var rdgeStarted = false;

var worldCounter = 0;


///////////////////////////////////////////////////////////////////////
// Class GLWorld
//      Manages display in a canvas
///////////////////////////////////////////////////////////////////////
function GLWorld( canvas, use3D )
{
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////

	// flag to do the drawing with WebGL
    this._useWebGL = false;
    if(use3D)
        this._useWebGL = use3D;

    this._canvas = canvas;
	if (this._useWebGL)
		this._glContext = canvas.getContext("experimental-webgl");
	else
		this._2DContext = canvas.getContext( "2d" );
    
	this._viewportWidth = canvas.width;
    this._viewportHeight = canvas.height;

	// view parameters
	this._fov = 45.0;
	this._zNear = 0.1;
	this._zFar = 100.0;
	this._viewDist = 5.0;

	// default light parameters
	this._ambientLightColor  = [0.1, 0.1, 0.1,  1.0];
	this._diffuseLightColor  = [0.1, 0.1, 0.1,  1.0];
	this._specularLightColor = [0.6, 0.6, 0.6,  1.0];
	this._pointLightLoc = [0.0, 0.0, 0.05];

	// default material properties.  Material properties should be overridden
	// by the materials used by the objects
	this._materialShininess = 20.0;

    this._geomRoot = undefined;

	this._cameraMat = Matrix.I(4);
	this._cameraMat[14] = 5.0;
	this._cameraMatInv = Matrix.I(4);
	this._cameraMatInv[14] = -5.0;

	this._camera;

	// keep a flag indicating whether a render has been completed.
	// this allows us to turn off automatic updating if there are
	// no animated materials
	this._firstRender = true;

	this._worldCount = worldCounter;
	worldCounter++;

	// keep a counter for generating node names
	this._nodeCounter = 0;


    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////
    this.getGLContext		= function()		{  return this._glContext;			}
    this.setGLContext		= function(gl)		{  this._glContext = gl;			}

    this.get2DContext		= function()		{  return this._2DContext;			}
    this.set2DContext		= function(c)		{  this._2DContext = c;				}

    this.getCanvas			= function()		{  return this._canvas;				}
    this.setCanvas			= function(c)		{  this._canvas = c;				}

    this.getShaderProgram	= function()		{  return this._shaderProgram;		}

	this.getViewportWidth	= function()		{  return this._viewportWidth;		}
	this.getViewportHeight  = function()		{  return this._viewportHeight;		}

	this.getAspect			= function()		{  return this._viewportWidth/this._viewportHeight;  }

	this.getGeomRoot			= function()		{  return this._geomRoot;			}
	this.getZNear				= function()		{  return this._zNear;				}
	this.getZFar				= function()		{  return this._zFar;				}
	this.getFOV					= function()		{  return this._fov;				}

	this.getCamera				= function()		{  return this._camera;				}

	this.getCameraMat			= function()		{  return this._cameraMat.slice(0);	}
	this.setCameraMat			= function(c)		{  this._cameraMat = c.slice(0);  this._cameraMatInv = glmat4.inverse(c, []);  }

	this.getCameraMatInverse  = function()		{  return this._cameraMatInv.slice(0); }

	this.getViewDistance		= function()		{  return this._viewDist;			}

	this.getRootNode			= function()		{  return this._rootNode;			}
	this.setRootNode			= function(r)		{  this._rootNode = r;				}

	this.isWebGL				= function()		{  return this._useWebGL;			}

	this.getRenderer			= function()		{  return this.renderer;			}

  ////////////////////////////////////////////////////////////////////////////////////
  // RDGE
  // local variables
    this.myScene = null;
    this.elapsed = 0;
    this.light = null;
    this.light2 = null;
    this.fillShader = null;
    this.strokeShader = null;
    this.renderer = null;

	// keep an array of texture maps that need to be loaded
	this._texMapsToLoad = [];
	this._allMapsLoaded = true;

	// this is the node to which objects get hung
	this._rootNode;

	// set up the camera matrix
	var camMat = Matrix.I(4);
	camMat[14] = this.getViewDistance();
	this.setCameraMat( camMat );
    
    // post-load processing of the scene
    this.init = function()
    { 
		var ctx1 = g_Engine.ctxMan.handleToObject(this._canvas.rdgeCtxHandle),
			ctx2 = g_Engine.getContext();
		if (ctx1 != ctx2)  console.log( "***** different contexts *****" );
		this.renderer = ctx1.renderer;
		this.renderer._world = this;
      
		// create a camera, set its perspective, and then point it at the origin
		var cam = new camera();
		this._camera = cam;
		cam.setPerspective(this.getFOV(), this.getAspect(), this.getZNear(), this.getZFar());
		cam.setLookAt([0, 0, this.getViewDistance()], [0, 0, 0], vec3.up());
        
		// make this camera the active camera
		this.renderer.cameraManager().setActiveCamera(cam);

		// change clear color
		//this.renderer.setClearFlags(g_Engine.getContext().DEPTH_BUFFER_BIT);
		this.renderer.setClearColor([0.0, 0.0, 0.0, 0.0]);
		//this.renderer.NinjaWorld = this;
        
		// create an empty scene graph
		this.myScene = new SceneGraph();
        
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
        
		// Add the scene to the engine - necessary if you want the engine to draw for you
		//g_Engine.AddScene("myScene" + this._canvas.id, this.myScene);
		var name = this._canvas.getAttribute( "data-RDGE-id" ); 
		g_Engine.AddScene("myScene" + name, this.myScene);
	}
    
	// main code for handling user interaction and updating the scene   
	this.update = function(dt)
    {
		if (!dt)  dt = 0.2;
        
		dt = 0.01;	// use our own internal throttle
		this.elapsed += dt;
        
		if (this._useWebGL)
		{
			// changed the global position uniform of light 0, another way to change behavior of a light
			rdgeGlobalParameters.u_light0Pos.set( [5*Math.cos(this.elapsed), 5*Math.sin(this.elapsed), 20]);
        
			// orbit the light nodes around the boxes
			this.light.setPosition([1.2*Math.cos(this.elapsed*2.0), 1.2*Math.sin(this.elapsed*2.0), 1.2*Math.cos(this.elapsed*2.0)]);
			this.light2.setPosition([-1.2*Math.cos(this.elapsed*2.0), 1.2*Math.sin(this.elapsed*2.0), -1.2*Math.cos(this.elapsed)]);
		}
        
		this.updateMaterials( this.getGeomRoot(), this.elapsed );

		// now update all the nodes in the scene
		if (this._useWebGL)
			this.myScene.update(dt);
    }

    // defining the draw function to control how the scene is rendered      
	this.draw = function()
    {
		if (this._useWebGL)
		{
			g_Engine.setContext( this._canvas.rdgeid );
			var ctx = g_Engine.getContext();
			var renderer = ctx.renderer;
			if (renderer.unloadedTextureCount <= 0)
			{
				renderer.disableCulling();
				//console.log( "GLWorld.draw " + renderer._world._worldCount );
				renderer._clear();
				this.myScene.render();

				if (this._firstRender)
				{
					if (this._canvas.task)
					{
						this._firstRender = false;

						if (!this.hasAnimatedMaterials())
						{
							this._canvas.task.stop();
							//this._renderCount = 10;
						}
					}
				}
				else if (this._renderCount >= 0)
				{
					if (this._canvas.task)
					{
						this._renderCount--;
						if (this._renderCount <= 0)
							this._canvas.task.stop();
					}
				}
			}
		}
		else
		{
			this.render();
		}
    }
	
    this.onRunState = function()
	{
//		console.log( "GLWorld.onRunState" );
		this.restartRenderLoop();
	}
	
    this.onLoadState = function()
	{
//		console.log( "GLWorld.onLoadState" );
	}

	this.textureToLoad = function( texture )
	{
		if (!texture.previouslyReferenced)
		{
			var name = texture.lookUpName;
			texture._world = this;
			texture.callback = this.textureMapLoaded;
			this._texMapsToLoad[name] = true;
			this._allMapsLoaded = false;

			// stop the draw loop until all textures have been loaded
			this._canvas.task.stop();
		}
	}

	this.textureMapLoaded = function( texture )
	{
		var world = texture._world;
		if (!world)
		{
			console.log( "**** loaded texture does not have world defined ****" );
			return;
		}

		var name = texture.lookUpName;
		if (!world._texMapsToLoad[name])
		{
			console.log( "loaded an unregistered texture map: " + name );
		}
		else
		{
			//console.log( "loaded a registered texture map: " + name );
			world._texMapsToLoad[name] = undefined;
		}

		// check if all the texture maps are loaded.  if so, resume the render loop
		world._allMapsLoaded = world.allTextureMapsLoaded();
		if (world._allMapsLoaded)
			world._canvas.task.start();
	}

	this.allTextureMapsLoaded = function()
	{
		for (var name in this._texMapsToLoad)
		{
			var needsLoad = this._texMapsToLoad[name];
			if (needsLoad)  return false;
		}

		return true;
	}

	this.textureLoadedCallback = function( name )
	{
//		console.log( "*** material texture loaded: " + name );

		var world = this._world;
		if (!world)
			console.log( "**** world not defined for loaded texture map: " + name );
		else
			world.textureMapLoaded( name );
	}
	
	this.hasAnimatedMaterials = function()
	{
		var root = this.getGeomRoot();
		var rtnVal = false;
		if (root)
			rtnVal = this.hHasAnimatedMaterials( root );

		return rtnVal;
	}

	this.hHasAnimatedMaterials = function( obj )
	{
		if (obj)
		{
			if (obj.getFillMaterial())
			{
				if (obj.getFillMaterial().isAnimated())  return true;
			}

			if (obj.getStrokeMaterial())
			{
				if (obj.getStrokeMaterial().isAnimated())  return true;
			}


			// do the sibling
			var hasAnim = false;
			if  (obj.getNext())  hasAnim = this.hHasAnimatedMaterials( obj.getNext() );
			if (hasAnim)  return true;
			if  (obj.getChild())  hasAnim = this.hHasAnimatedMaterials( obj.getChild() );
			if (hasAnim)  return true;
		}

		return false;
	}


	// END RDGE
	////////////////////////////////////////////////////////////////////////////////////

    
    // start RDGE passing your runtime object, and false to indicate we don't need a an initialization state
    // in the case of a procedurally built scene an init state is not needed for loading data
	if (this._useWebGL)
	{
		rdgeStarted = true;
		var id = this._canvas.getAttribute( "data-RDGE-id" ); 
		this._canvas.rdgeid = id;
		g_Engine.registerCanvas(this._canvas, this);
		RDGEStart( this._canvas );
		this._canvas.task.stop()
	}

	this.generateUniqueNodeID = function()
	{
		var str = String( this._nodeCounter );
		this._nodeCounter++;
		return str;
	}
}


///////////////////////////////////////////////////////////////////////
// Property Accessors
///////////////////////////////////////////////////////////////////////
GLWorld.prototype.getGeomRoot = function()  {  return this._geomRoot;  }


///////////////////////////////////////////////////////////////////////
// Methods
///////////////////////////////////////////////////////////////////////
GLWorld.prototype.updateObject = function (obj)
{
	if (!this._useWebGL)  return;

    var prims = obj.getPrimitiveArray();
	var materialNodes = obj.getMaterialNodeArray();
    if (prims.length != materialNodes.length)
        throw new Error("inconsistent material and primitive counts");
    var nPrims = prims.length;
    var ctrTrNode;
    if (nPrims > 0) {
        ctrTrNode = obj.getTransformNode();
		if (ctrTrNode == null)
		{
			ctrTrNode = createTransformNode("objRootNode_" + this._nodeCounter++);
			this._rootNode.insertAsChild( ctrTrNode );
			obj.setTransformNode( ctrTrNode );
		}

		ctrTrNode.meshes.forEach(function(thisMesh) {
			g_meshMan.deleteMesh(thisMesh.mesh.name);
		});
		ctrTrNode.meshes = [];

        ctrTrNode.attachMeshNode(this.renderer.id + "_prim_" + this._nodeCounter++, prims[0]);
        ctrTrNode.attachMaterial(materialNodes[0]);
    }
	
	var children = ctrTrNode.children;
    for (var i = 1; i < nPrims; i++)
	{
        // get the next primitive
        var prim = prims[i];

        // get a previously created transform node.  If the transform has not been created, create it
        var childTrNode;
		if (children && children.length >= i)
		{
			childTrNode = children[i-1].transformNode;

			childTrNode.meshes.forEach(function(thisMesh) {
				g_meshMan.deleteMesh(thisMesh.mesh.name);
			});
			childTrNode.meshes = [];
		}
		else
		{
			childTrNode = createTransformNode("objNode_" + this._nodeCounter++);
			ctrTrNode.insertAsChild(childTrNode);
		}

        // attach the instanced box goe
        childTrNode.attachMeshNode(this.renderer.id + "_prim_" + this._nodeCounter++, prim);
        childTrNode.attachMaterial(materialNodes[i]);
    }
}

GLWorld.prototype.addObject = function( obj )
{
    if (!obj)  return;

    try
    {
        // undefine all the links of the object
        obj.setChild( undefined );
        obj.setNext( undefined );
        obj.setPrev( undefined );
        obj.setParent( undefined );

        obj.setWorld( this );

        if (this._geomRoot == null)
        {
            this._geomRoot = obj;
        }
        else
        {
            var go = this._geomRoot;
            while (go.getNext())  go = go.getNext();
            go.setNext( obj );
            obj.setPrev( go );
        }

		// build the WebGL buffers
		if (this._useWebGL)
		{
			obj.buildBuffers();
			this.restartRenderLoop();
		}
    }
    catch(e)
    {
        alert( "Exception in GLWorld.addObject " + e );
    }
}

GLWorld.prototype.restartRenderLoop = function()
{
	//console.log( "restartRenderLoop" );

	this._firstRender = true;
	this._renderCount  = -1;
	if (this._canvas.task)
	{
		if (this._allMapsLoaded)
		{
			//console.log( "starting task" );
			this._canvas.task.start();
		}
		else
		{
			//console.log( "stopping task" );
			this._canvas.task.stop();
		}
	}
}

//append to the list of objects if obj doesn't already exist
//if obj exists, then don't add to list of objects
GLWorld.prototype.addIfNewObject = function (obj)
{
    if (!obj) return;

    try {
        obj.setWorld(this);

        if (this._geomRoot == null) {
            this._geomRoot = obj;
        }
        else if (this._geomRoot !== obj) {
            var go = this._geomRoot;
            while (go.getNext() && go.getNext() !== obj) {
                go = go.getNext();
            }
            if (go.getNext() === null) {
                // undefine all the links of the object
                obj.setChild(undefined);
                obj.setNext(undefined);
                obj.setPrev(undefined);
                obj.setParent(undefined);

                go.setNext(obj);
                obj.setPrev(go);

            }
        }

		// build the WebGL buffers
		if (this._useWebGL)
		{
			obj.buildBuffers();
			this.restartRenderLoop();
		}
    }
    catch (e) {
        alert("Exception in GLWorld.addIfNewObject " + e);
    }
}

GLWorld.prototype.clearTree = function()
{
	if (this._useWebGL)
	{
		var root = this._rootNode;
		root.children = new Array();
		g_Engine.unregisterCanvas( this._canvas.rdgeid )

		this.update( 0 );
		this.draw();
	}
}

GLWorld.prototype.updateMaterials = function( obj, time )
{
	if (!obj)  return;

	var matArray = obj.getMaterialArray();
	if (matArray)
	{
		var n = matArray.length;
		for (var i=0;  i<n;  i++)
			matArray[i].update( time );
	}

	this.updateMaterials( obj.getNext(),  time );
	this.updateMaterials( obj.getChild(), time );
}


// return the origin of the world in NDC
GLWorld.prototype.getNDCOrigin = function()
{
  var pt = MathUtils.transformPoint( Vector.create([0,0,0]), this.getCameraMatInverse() );
  var projMat = makePerspective( this.getFOV(), this.getAspect(), this.getZNear(), this.getZFar());
  var ndcPt = MathUtils.transformHomogeneousPoint( pt, projMat );
  var ndcOrigin = MathUtils.applyHomogeneousCoordinate( ndcPt );

  return ndcOrigin;
}

GLWorld.prototype.worldToScreen = function(v)
{
	var pMatrix = makePerspective( this._fov, this.getAspect(), this._zNear, this._zFar);
	var mvMatrix = this.getCameraMatInverse();
	//var tmpMat = pMatrix.multiply( mvMatrix );
	var tmpMat = glmat4.multiply(pMatrix, mvMatrix, []);
	//var v2 = tmpMat.multiply( v );
	var v2 = glmat4.multiplyVec3( tmpMat, v, []);
	var v3 = MathUtils.transformHomogeneousPoint( v, tmpMat );
	v3 = MathUtils.applyHomogeneousCoordinate( v3 );
	var x = v2[0],  y = v2[1],  z = v2[2];

	var h = this.getGLContext().viewportHeight/2.0, w = this.getGLContext().viewportWidth/2.0;
	var x2 = w*(1 + x),  y2 = h*( 1 - y ),  z2 = z;

	return Vector.create( [x2, y2, z2, 1]);
}

GLWorld.prototype.screenToView = function( x, y )
{
	var gl = this._glContext;
	var w = gl.viewportWidth/2.0,
		h = gl.viewportHeight/2.0;

	var xv = x/w - 1,
		yv = 1.0 - y/h;

	return Vector.create( [xv,yv] );
}

GLWorld.prototype.screenToWorld = function( xScr,  yScr )
{
	var viewVec = this.screenToView( xScr, yScr );
	var xView = viewVec[0],  yView = viewVec[1];

	var tmp = this.worldToScreen( Vector.create( [0,0,0,1])  );
	var zView = tmp[2];

	// get the perspective matrix
	var pMatrix = makePerspective( this._fov, this.getAspect(), this._zNear, this._zFar);
	var mvMatrix = Matrix.I(4);   // this would be the inverse of the camera matrix (if we had one).

	//var tmpMat = pMatrix.multiply( mvMatrix );
	var tmpMat = glmat4.multiply( pMatrix, mvMatrix, []);
	//var tmpInv = tmpMat.inverse();
	var tmpInv = glmat4.inverse( tmpMat, []);
	var v3 = Vector.create( [xView,  yView, zView, 1 ]);
	//var w = tmpInv.multiply( v3 );
	var w = glmat4.multiplyVec4( tmpInv, v3, []);
	w[0] /= w[3];
	w[1] /= w[3];
	w[2] /= w[3];
	w[3] = 1.0;

	return w;
}

GLWorld.prototype.GLToScreen = function( glPt )
{
}

GLWorld.prototype.ScreenToGL = function( scrPt )
{
}


GLWorld.prototype.resetMatrixStack = function()
{
    this._matStack = new Array();
    this._matStack.push( Matrix.I(4) );
}

 GLWorld.prototype.pushMatrix = function( mat )
 {
    if (mat)
    {
        var mat2 = this.stackTop();
        if (mat2)
		{
			var mat12 = glmat4.multiply( mat, mat2, []);
			this._matStack.push( mat12 );
		}
    }
}

GLWorld.prototype.stackTop = function()
{
    var mat;
    if (this._matStack && (this._matStack.length > 0))
        mat = this._matStack[ this._matStack.length-1];

    return mat;
}

GLWorld.prototype.popMatrix = function()
 {
    if (this._matStack.length == 0)
        throw "Invalid popMatrix!";
    var mat = this._matStack.pop();
    return mat;
}


GLWorld.prototype.setMVMatrix = function()
{
    var mat = this.stackTop();
    if (mat)
    {
		var gl = this._glContext;

        //var mvMatrix = this._cameraMatInv.multiply(mat);
		var mvMatrix = glmat4.multiply( this._cameraMatInv, mat, []);
        //var mat2 = mat.multiply( this._cameraMatInv );
        gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix));

        var normalMatrix = mat3.create();
        //mat4.toInverseMat3(mvMatrix, normalMatrix);
//        mat4.toInverseMat3(new Float32Array(mvMatrix.flatten()), normalMatrix);
        mat4.toInverseMat3(new Float32Array(mvMatrix), normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(this._shaderProgram.nMatrixUniform, false, normalMatrix);

    }
}



GLWorld.prototype.makePerspectiveMatrix = function()
{
  return makePerspective( this.getFOV(),  this.getAspect(),  this.getZNear(),  this.getZFar() );
}


function perspective(fovy, aspect, znear, zfar)
{
  return makePerspective(fovy, aspect, znear, zfar);
}

GLWorld.prototype.render = function()
{
	if (!this._useWebGL)
	{
		// clear the context
		var ctx = this.get2DContext();
		if (!ctx)  return;
		ctx.clearRect(0, 0, this.getViewportWidth(), this.getViewportHeight());
		
		// render the geometry
		var root = this.getGeomRoot();
		this.hRender( root );
	}
	else
	{
//		console.log( "GLWorld.render, " + this._worldCount );
		g_Engine.setContext( this._canvas.rdgeId );
		//this.draw();
		this.restartRenderLoop();
	}
}

GLWorld.prototype.hRender = function( obj )
{
	if (!obj)  return;
	obj.render();

	this.hRender( obj.getChild() );
	this.hRender( obj.getNext() );
}

GLWorld.prototype.setViewportFromCanvas = function(canvas)
{
	this._viewportWidth = canvas.width;
	this._viewportHeight = canvas.height;

	if (this._useWebGL)
	{
		this._glContext.viewportWidth = canvas.width;
		this._glContext.viewportHeight = canvas.height;

		this.getCamera().setPerspective(this.getFOV(), this.getAspect(), this.getZNear(), this.getZFar());
		
		this.renderer.setViewPort(0, 0, canvas.width, canvas.height);
	}
}

GLWorld.prototype.getShapeFromPoint = function( offsetX, offsetY )
{
	var x = offsetX/this._canvas.width;
	var y = offsetY/this._canvas.height;

	var go = this._geomRoot;
	if(go.collidesWithPoint(x,y))
	{
//		console.log("collision found");
		return go;
	}
	while (go.getNext())
	{
		go = go.getNext();
		if(go.collidesWithPoint(x,y))
		{
//			console.log("collision found");
			return go;
		}
	}
}

GLWorld.prototype.export = function( exportForPublish )
{
	var exportStr = "GLWorld 1.0\n";
	var id = this.getCanvas().getAttribute( "data-RDGE-id" );
	exportStr += "id: " + id + "\n";
	//exportStr += "id: " + this._canvas.rdgeid + "\n";
	exportStr += "fov: " + this._fov + "\n";
	exportStr += "zNear: " + this._zNear + "\n";
	exportStr += "zFar: " + this._zFar + "\n";
	exportStr += "viewDist: " + this._viewDist + "\n";
	if (this._useWebGL)
		exportStr += "webGL: true\n";

	// we need 2 export modes:  One for save/restore, one for publish.
	// hardcoding for now
	//var exportForPublish = false;
	if (!exportForPublish)  exportForPublish = false;
	exportStr += "publish: " + exportForPublish + "\n";

	if (exportForPublish && this._useWebGL)
	{
		exportStr += "scenedata: " + this.myScene.exportJSON() + "endscene\n";

		// write out all of the objects
		exportStr += "tree\n";
		exportStr += this.exportObjects( this._geomRoot );
		exportStr += "endtree\n";
	}
	else
	{
		// output the material library
		//exportStr += MaterialsLibrary.export();	// THIS NEEDS TO BE DONE AT THE DOC LEVEL

		// write out all of the objects
		exportStr += "tree\n";
		exportStr += this.exportObjects( this._geomRoot );
		exportStr += "endtree\n";
	}

	return exportStr;
}

GLWorld.prototype.exportObjects = function( obj )
{
	if (!obj)  return;

	var rtnStr = "OBJECT\n";
	rtnStr += obj.export();

	if (obj.getChild())
		rtnStr += this.exportObjects( obj.getChild ()  );

	// the end object goes outside the children
	rtnStr += "ENDOBJECT\n";

	if (obj.getNext())
		rtnStr += this.exportObjects( obj.getNext() );
	
	return rtnStr;
}

GLWorld.prototype.findTransformNodeByMaterial = function( materialNode,  trNode )
{
	//if (trNode == null)  trNode = this._ctrNode;
	if (trNode == null)  trNode = this._rootNode;
	if ( trNode.transformNode && (materialNode == trNode.transformNode.materialNode))  return trNode;

	var rtnNode;
	if (trNode.children != null)
	{
		var nKids = trNode.children.length;
		for (var i=0;  i<nKids;  i++)
		{
			var child = trNode.children[i];
			rtnNode = this.findTransformNodeByMaterial( materialNode, child );
			if (rtnNode)  break;
		}
	}

	return rtnNode;
}


GLWorld.prototype.import = function( importStr )
{
	// import the worldattributes - not currently used

	// determine if the data was written for export (no Ninja objects)
	// or for save/restore
	var index = importStr.indexOf( "scenedata: " );
	if (index >= 0)
	{
		var rdgeStr = importStr.substr( index+11 );
		var endIndex = rdgeStr.indexOf( "endscene\n" );
		if (endIndex < 0)  throw new Error( "ill-formed WebGL data" );
		var len = endIndex - index + 11;
		rdgeStr = rdgeStr.substr( 0, endIndex );

		this.myScene.importJSON( rdgeStr );

		this.importObjects( importStr, this._rootNode );
	}
	else
	{
		// load the material library
		//importStr = MaterialsLibrary.import( importStr );

		// import the objects
		this.importObjects( importStr, this._rootNode );

		// render using canvas 2D
		this.render();
	}
}

GLWorld.prototype.importObjects = function( importStr,  parentNode )
{
	var index = importStr.indexOf( "OBJECT\n", 0 );
	while (index >= 0)
	{
		// update the string to the current object
		importStr = importStr.substr( index+7 );

		// read the next object
		this.importObject( importStr, parentNode );

		// determine if we have children
		var endIndex = importStr.indexOf( "ENDOBJECT\n" ),
			childIndex = importStr.indexOf( "OBJECT\n" );
		if (endIndex < 0)  throw new Error( "ill-formed object data" );
		if ((childIndex >= 0) && (childIndex < endIndex))
		{
			importStr = importStr.substr( childIndex + 7 );
			importStr = this.importObjects( importStr, node );
			endIndex = importStr.indexOf( "ENDOBJECT\n" )
		}

		// remove the string for the object(s) just created
		importStr = importStr.substr( endIndex );

		// get the location of the next object
		index = importStr.indexOf( "OBJECT\n", endIndex );
	}

	return importStr;
}

GLWorld.prototype.importObject = function( objStr,  parentNode )
{
	var go = new GLGeomObj();
	var type = Number( go.getPropertyFromString( "type: ", objStr ) );

	var obj;
	switch (type)
	{
		case 1:
			obj = new GLRectangle();
			obj.import( objStr );
			break;

		case 2:		// circle
			obj = new GLCircle();
			obj.import( objStr );
			break;

		case 3:		// line
            obj = new GLLine();
            obj.import( objStr );
            break;

		default:
			throw new Error( "Unrecognized object type: " + type );
			break;
	}

	if (obj)
		this.addObject( obj );
}

GLWorld.prototype.importSubObject = function( objStr,  parentNode )
{
	// get the mesh text
	var i0 = objStr.indexOf( "mesh: " ),
		i1 = objStr.indexOf( "endMesh\n" );
	if ((i0 < 0) || (i1 < 0))  throw new Error( "ill-formed sub object" );
	i0 += 6;
	var meshText = objStr.substr( i0, i1 - i0 );
	var meshObj = JSON.parse(meshText);

	// get the material text
	var i0 = objStr.indexOf( "material: " ),
		i1 = objStr.indexOf( "endMat\n" );
	if ((i0 < 0) || (i1 < 0))  throw new Error( "ill-formed sub object" );
	i0 += 10;
	var matText = objStr.substr( i0, i1 - i0 );
	var shaderDef = JSON.parse( matText );
	var shader = new jshader();
	shader.def = shaderDef;
	shader.init();
             
    // set the shader for this material
	var matNode = createMaterialNode("objMat")
    matNode.setShader(shader);

	// create the transformation node
	var trNode = createTransformNode("subObjNode_" );
    trNode.attachMeshNode(this.renderer.id + "_prim_", meshObj);
    trNode.attachMaterial(matNode);
	parentNode.insertAsChild(trNode);

	return trNode;
}


