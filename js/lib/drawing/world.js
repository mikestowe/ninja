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


var GeomObj = require("js/lib/geom/geom-obj").GeomObj;
var Line = require("js/lib/geom/line").Line;
var Rectangle = require("js/lib/geom/rectangle").Rectangle;
var Circle = require("js/lib/geom/circle").Circle;
var MaterialsModel = require("js/models/materials-model").MaterialsModel;

var worldCounter = 0;

///////////////////////////////////////////////////////////////////////
// Class GLWorld
//      Manages display in a canvas
///////////////////////////////////////////////////////////////////////
var World = function GLWorld( canvas, use3D, preserveDrawingBuffer ) {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////

    // flag to do the drawing with WebGL
    this._useWebGL = false;
    if(use3D) {
        this._useWebGL = use3D;
    }

    this._canvas = canvas;
    if (this._useWebGL)
    {
        if(preserveDrawingBuffer)
        {
            this._glContext = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
        }
        else
        {
            this._glContext = canvas.getContext("experimental-webgl");
        }
    }
    else
    {
        this._2DContext = canvas.getContext( "2d" );
    }

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

    this._camera = null;
    // keep a flag indicating whether a render has been completed.
    // this allows us to turn off automatic updating if there are
    // no animated materials
    this._firstRender = true;

    this._worldCount = worldCounter;
    worldCounter++;

    // keep a counter for generating node names
    this._nodeCounter = 0;

    // for sending notifications to listeners
    this._notifier = new Notifier();

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////
    this.getGLContext       = function()        {  return this._glContext;          };
    this.setGLContext       = function(gl)      {  this._glContext = gl;            };

    this.get2DContext       = function()        {  return this._2DContext;          };
    this.set2DContext       = function(c)       {  this._2DContext = c;             };

    this.getCanvas          = function()        {  return this._canvas;             };
    this.setCanvas          = function(c)       {  this._canvas = c;                };

    this.getShaderProgram   = function()        {  return this._shaderProgram;      };

    this.getViewportWidth   = function()        {  return this._viewportWidth;      };
    this.getViewportHeight  = function()        {  return this._viewportHeight;     };

    this.getAspect          = function()        {  return this._viewportWidth/this._viewportHeight;  };

    this.getGeomRoot            = function()        {  return this._geomRoot;           };
    this.getZNear               = function()        {  return this._zNear;              };
    this.getZFar                = function()        {  return this._zFar;               };
    this.getFOV                 = function()        {  return this._fov;                };

    this.getCamera              = function()        {  return this._camera;             };

    this.getCameraMat           = function()        {  return this._cameraMat.slice(0); };
    this.setCameraMat           = function(c)       {  this._cameraMat = c.slice(0);  this._cameraMatInv = glmat4.inverse(c, []);  };

    this.getCameraMatInverse  = function()      {  return this._cameraMatInv.slice(0); };

    this.getViewDistance        = function()        {  return this._viewDist;           };

    this.getRootNode            = function()        {  return this._rootNode;           };
    this.setRootNode            = function(r)       {  this._rootNode = r;              };

    this.isWebGL                = function()        {  return this._useWebGL;           };

    this.getRenderer            = function()        {  return this.renderer;            };

    // Flag to play/pause animation at authortime
    this._previewAnimation = true;

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
    this._rootNode = null;

    // set up the camera matrix
    var camMat = Matrix.I(4);
    camMat[14] = this.getViewDistance();
    this.setCameraMat( camMat );

    // post-load processing of the scene
    this.init = function()
    {
        var ctx1 = RDGE.globals.engine.ctxMan.handleToObject(this._canvas.rdgeCtxHandle),
            ctx2 = RDGE.globals.engine.getContext();
        if (ctx1 != ctx2)  console.log( "***** different contexts *****" );
        this.renderer = ctx1.renderer;
        this.renderer._world = this;

        // create a camera, set its perspective, and then point it at the origin
        var cam = new RDGE.camera();
        this._camera = cam;
        cam.setPerspective(this.getFOV(), this.getAspect(), this.getZNear(), this.getZFar());
        cam.setLookAt([0, 0, this.getViewDistance()], [0, 0, 0], RDGE.vec3.up());

        // make this camera the active camera
        this.renderer.cameraManager().setActiveCamera(cam);

        // change clear color
        //this.renderer.setClearFlags(RDGE.globals.engine.getContext().DEPTH_BUFFER_BIT);
        this.renderer.setClearColor([0.0, 0.0, 0.0, 0.0]);
        //this.renderer.NinjaWorld = this;

        // create an empty scene graph
        this.myScene = new RDGE.SceneGraph();

        // create some lights
        // light 1
//      this.light = RDGE.createLightNode("myLight");
//      this.light.setPosition([0,0,1.2]);
//      this.light.setDiffuseColor([0.75,0.9,1.0,1.0]);

        // light 2
//      this.light2 = RDGE.createLightNode("myLight2");
//      this.light2.setPosition([-0.5,0,1.2]);
//      this.light2.setDiffuseColor([1.0,0.9,0.75,1.0]);

        // create a light transform
        var lightTr = RDGE.createTransformNode("lightTr");

        // create and attach a material - materials hold the light data
        lightTr.attachMaterial(RDGE.createMaterialNode("lights"));

        // enable light channels 1, 2 - channel 0 is used by the default shader
//      lightTr.materialNode.enableLightChannel(1, this.light);
//      lightTr.materialNode.enableLightChannel(2, this.light2);

        // all added objects are parented to the light node
        this._rootNode = lightTr;

        // add the light node to the scene
        this.myScene.addNode(lightTr);

        // Add the scene to the engine - necessary if you want the engine to draw for you
        //RDGE.globals.engine.AddScene("myScene" + this._canvas.id, this.myScene);
        var name = this._canvas.getAttribute( "data-RDGE-id" );
        RDGE.globals.engine.AddScene("myScene" + name, this.myScene);
    };

    // main code for handling user interaction and updating the scene
    this.update = function(dt)
    {
        if (!dt)  dt = 0.2;

        dt = 0.01;  // use our own internal throttle
        this.elapsed += dt;

        if (this._useWebGL)
        {
            // changed the global position uniform of light 0, another way to change behavior of a light
            RDGE.rdgeGlobalParameters.u_light0Pos.set([5 * Math.cos(this.elapsed), 5 * Math.sin(this.elapsed), 20]);

            // orbit the light nodes around the boxes
//          this.light.setPosition([1.2*Math.cos(this.elapsed*2.0), 1.2*Math.sin(this.elapsed*2.0), 1.2*Math.cos(this.elapsed*2.0)]);
//          this.light2.setPosition([-1.2*Math.cos(this.elapsed*2.0), 1.2*Math.sin(this.elapsed*2.0), -1.2*Math.cos(this.elapsed)]);
        }

        this.updateMaterials( this.getGeomRoot(), this.elapsed );

        // now update all the nodes in the scene
        if (this._useWebGL)
            this.myScene.update(dt);
    };

    // defining the draw function to control how the scene is rendered
    this.draw = function()
    {
        if (this._useWebGL)
        {
            RDGE.globals.engine.setContext( this._canvas.rdgeid );
            var ctx = RDGE.globals.engine.getContext();
            var renderer = ctx.renderer;
            if (renderer.unloadedTextureCount <= 0)
            {
                renderer.disableCulling();
                renderer._clear();
                this.myScene.render();

                if (this._firstRender)
                {
                    this._notifier.sendNotification( this._notifier.FIRST_RENDER );
                    if (this._canvas.task)
                    {
                        this._firstRender = false;

                        if (!this.hasAnimatedMaterials() || !this._previewAnimation)
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
                        {
                            this._canvas.task.stop();
                        }
                    }
                }
            }
        }
        else
        {
            this.render();
        }
    };

    this.onRunState = function() {
//      console.log( "GLWorld.onRunState" );
        this.restartRenderLoop();
    };

    this.onLoadState = function() {
//      console.log( "GLWorld.onLoadState" );
    };

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
    };

    this.textureMapLoaded = function( texture )
    {
        var world = texture._world;
        if (!world) {
            console.log( "**** loaded texture does not have world defined ****" );
            return;
        }

        var name = texture.lookUpName;
        if (!world._texMapsToLoad[name]) {
            console.log( "loaded an unregistered texture map: " + name );
        }
        else {
            //console.log( "loaded a registered texture map: " + name );
            world._texMapsToLoad[name] = undefined;
        }

        // check if all the texture maps are loaded.  if so, resume the render loop
        world._allMapsLoaded = world.allTextureMapsLoaded();
        if (world._allMapsLoaded) {
            world._canvas.task.start();
        }
    };

    this.allTextureMapsLoaded = function() {
        for (var name in this._texMapsToLoad) {
            var needsLoad = this._texMapsToLoad[name];
            if (needsLoad)  return false;
        }

        return true;
    };

    this.textureLoadedCallback = function( name ) {
//      console.log( "*** material texture loaded: " + name );

        var world = this._world;
        if (!world) {
            console.log( "**** world not defined for loaded texture map: " + name );
        }
        else {
            world.textureMapLoaded( name );
        }
    };

    this.hasAnimatedMaterials = function() {
        var root = this.getGeomRoot();
        var rtnVal = false;
        if (root) {
            rtnVal = this.hHasAnimatedMaterials( root );
            this._hasAnimatedMaterials = rtnVal;
        }
        else
        {
            // currently...
            // we set this case to true - cloud materials create a
            // world with no objects but cloud materials animate.
            // TODO - find a better way to do this
            rtnVal = true;
            this._hasAnimatedMaterials = true;
        }

        return rtnVal;
    };

    this.hHasAnimatedMaterials = function( obj ) {
        if (obj) {
            if (obj.getFillMaterial()) {
                if (obj.getFillMaterial().isAnimated())  return true;
            }

            if (obj.getStrokeMaterial()) {
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
    };

    this.generateUniqueNodeID = function() {
        var str = "" + this._nodeCounter;
        this._nodeCounter++;
        return str;
    };

    this.addListener = function( obj,  callbackFunc,  calleeData )
    {
        this._notifier.addListener( obj, callbackFunc, calleeData );
    }

    this.removeListener = function( obj )
    {
        this._notifier.removeListener( obj );
    }

    // start RDGE passing your runtime object, and false to indicate we don't need a an initialization state
    // in the case of a procedurally built scene an init state is not needed for loading data
    this._canvas.rdgeid = this._canvas.getAttribute( "data-RDGE-id" );
    if (this._useWebGL) {
        rdgeStarted = true;
        RDGE.globals.engine.unregisterCanvas( this._canvas );
        RDGE.globals.engine.registerCanvas(this._canvas, this);
        RDGE.RDGEStart( this._canvas );
        this._canvas.task.stop()
    }
};


///////////////////////////////////////////////////////////////////////
// Property Accessors
///////////////////////////////////////////////////////////////////////
World.prototype.getGeomRoot = function()  {
    return this._geomRoot;
};


///////////////////////////////////////////////////////////////////////
// Methods
///////////////////////////////////////////////////////////////////////
World.prototype.updateObject = function (obj) {
    if (!this._useWebGL)  return;

    var prims = obj.getPrimitiveArray();
    var materialNodes = obj.getMaterialNodeArray();
    if (prims.length != materialNodes.length)
        throw new Error("inconsistent material and primitive counts");
    var nPrims = prims.length;
	var iPrim = 0;
    var ctrTrNode;
    if (nPrims > 0)
    {
        ctrTrNode = obj.getTransformNode();
        if (ctrTrNode == null) {
            ctrTrNode = RDGE.createTransformNode("objRootNode_" + this._nodeCounter++);
            this._rootNode.insertAsChild( ctrTrNode );
            obj.setTransformNode( ctrTrNode );
        }

        ctrTrNode.meshes.forEach(
            function(thisMesh) {
                RDGE.globals.meshMan.deleteMesh(thisMesh.mesh.name);
            }
        );
        ctrTrNode.meshes = [];

        ctrTrNode.attachMaterial(materialNodes[0]);
		while ((iPrim < nPrims) && (materialNodes[iPrim] == materialNodes[0]))
		{
			ctrTrNode.attachMeshNode(this.renderer.id + "_prim_" + this._nodeCounter++, prims[iPrim]);
			iPrim++;
    }
	}

    // delete all of the child nodes
    var i;
    var childTrNode;
    var children = ctrTrNode.children;
    for (i=0;  i<children.length;  i++)
    {
        childTrNode = children[i].transformNode;
        childTrNode.meshes.forEach(
            function(thisMesh)
            {
                RDGE.globals.meshMan.deleteMesh(thisMesh.mesh.name);
            }
        );
        childTrNode.meshes = [];
        children[i] = null;
    }
    ctrTrNode.children = [];

	while (iPrim < nPrims)
    {
        childTrNode = RDGE.createTransformNode("objNode_" + this._nodeCounter++);
        ctrTrNode.insertAsChild(childTrNode);
		var matNode = materialNodes[iPrim];
		childTrNode.attachMaterial(matNode);

		while ((iPrim < nPrims) && (materialNodes[iPrim] == matNode))
		{
			childTrNode.attachMeshNode(this.renderer.id + "_prim_" + this._nodeCounter++, prims[iPrim]);
			iPrim++;
    }
	}

    // send a notification that the tree has changed
    this._notifier.sendNotification( this._notifier.OBJECT_CHANGE );
};

World.prototype.addObject = function( obj )
{
    if (!obj)  return;

    try {
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
        if (this._useWebGL) {
            obj.buildBuffers();
            this.restartRenderLoop();
        }

        // send a notification that the tree has changed
        this._notifier.sendNotification( this._notifier.OBJECT_CHANGE );
    }

    catch(e) {
        alert( "Exception in GLWorld.addObject " + e );
    }
};

World.prototype.restartRenderLoop = function()
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
};

World.prototype.stop = function()
{
    if (this._canvas && this._canvas.task)
        this._canvas.task.stop();
}

World.prototype.start = function()
{
    if (this._canvas && this._canvas.task)
        this._canvas.task.start();
}

//append to the list of objects if obj doesn't already exist
//if obj exists, then don't add to list of objects
World.prototype.addIfNewObject = function (obj) {
    if (!obj) return;

    try {
        obj.setWorld(this);

        if (this._geomRoot == null)
        {
            this._geomRoot = obj;
        }
        else if (this._geomRoot !== obj)
        {
            var go = this._geomRoot;
            while (go.getNext() && go.getNext() !== obj)
            {
                go = go.getNext();
            }

            if (go.getNext() === null)
            {
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
        if (this._useWebGL) {
            obj.buildBuffers();
            this.restartRenderLoop();
        }

        // send a notification that the tree has changed
        this._notifier.sendNotification( this._notifier.OBJECT_CHANGE );

    } catch (e) {
        alert("Exception in GLWorld.addIfNewObject " + e);
    }
};

World.prototype.clearTree = function()
{
    this._notifier.sendNotification( this._notifier.OBJECT_DELETE );

    if (this._useWebGL)
    {
        this.stop();
        var root = this._rootNode;
        root.children = new Array();
        RDGE.globals.engine.unregisterCanvas( this._canvas.rdgeid );

        this.update( 0 );
        this.draw();
    }
};

World.prototype.updateMaterials = function( obj, time ) {
    if (!obj)  return;

    var matArray = obj.getMaterialArray();
    if (matArray) {
        var n = matArray.length;
        for (var i=0;  i<n;  i++) {
            matArray[i].update( time );
    }
    }

    this.updateMaterials( obj.getNext(),  time );
    this.updateMaterials( obj.getChild(), time );
};

// return the origin of the world in NDC
World.prototype.getNDCOrigin = function() {
  var pt = MathUtils.transformPoint( [0,0,0], this.getCameraMatInverse() );
  var projMat = Matrix.makePerspective( this.getFOV(), this.getAspect(), this.getZNear(), this.getZFar());
  var ndcPt = MathUtils.transformHomogeneousPoint( pt, projMat );

  return  MathUtils.applyHomogeneousCoordinate( ndcPt );
};

World.prototype.worldToScreen = function(v) {
    var pMatrix = Matrix.makePerspective( this._fov, this.getAspect(), this._zNear, this._zFar);
    var mvMatrix = this.getCameraMatInverse();
    //var tmpMat = pMatrix.multiply( mvMatrix );
    var tmpMat = glmat4.multiply(pMatrix, mvMatrix, []);
    //var v2 = tmpMat.multiply( v );
    var v2 = glmat4.multiplyVec3( tmpMat, v, []);
    var v3 = MathUtils.transformHomogeneousPoint( v, tmpMat );
    v3 = MathUtils.applyHomogeneousCoordinate( v3 );
    var x = v2[0],  y = v2[1],  z = v2[2];

    var h = this.getGLContext().viewportHeight/2.0, w = this.getGLContext().viewportWidth/2.0;
    var x2 = w * (1 + x), y2 = h * ( 1 - y );
    return [x2, y2, z, 1];
};

World.prototype.screenToView = function( x, y ) {
    var gl = this._glContext;
    var w = gl.viewportWidth/2.0,
        h = gl.viewportHeight/2.0;

    var xv = x/w - 1,
        yv = 1.0 - y/h;

    return [xv,yv];
};

World.prototype.screenToWorld = function( xScr,  yScr ) {
    var viewVec = this.screenToView( xScr, yScr );
    var xView = viewVec[0],  yView = viewVec[1];

    var tmp = this.worldToScreen( [0,0,0,1] );
    var zView = tmp[2];

    // get the perspective matrix
    var pMatrix = Matrix.makePerspective( this._fov, this.getAspect(), this._zNear, this._zFar);
    var mvMatrix = Matrix.I(4);   // this would be the inverse of the camera matrix (if we had one).

    //var tmpMat = pMatrix.multiply( mvMatrix );
    var tmpMat = glmat4.multiply( pMatrix, mvMatrix, []);
    //var tmpInv = tmpMat.inverse();
    var tmpInv = glmat4.inverse( tmpMat, []);
    var v3 = [xView,  yView, zView, 1 ];
    //var w = tmpInv.multiply( v3 );
    var w = glmat4.multiplyVec4( tmpInv, v3, []);
    w[0] /= w[3];
    w[1] /= w[3];
    w[2] /= w[3];
    w[3] = 1.0;

    return w;
};

World.prototype.GLToScreen = function( glPt ) {
};

World.prototype.ScreenToGL = function( scrPt ) {
};


World.prototype.resetMatrixStack = function() {
    this._matStack = new Array();
    this._matStack.push( Matrix.I(4) );
};

World.prototype.pushMatrix = function( mat ) {
    if (mat) {
        var mat2 = this.stackTop();
        if (mat2) {
            var mat12 = glmat4.multiply( mat, mat2, []);
            this._matStack.push( mat12 );
        }
    }
};

World.prototype.stackTop = function() {
    var mat;
    if (this._matStack && (this._matStack.length > 0)) {
        mat = this._matStack[ this._matStack.length-1];
    }

    return mat;
};

World.prototype.popMatrix = function() {
    if (this._matStack.length == 0) {
        throw "Invalid popMatrix!";
    }

    return this._matStack.pop();
};

World.prototype.setMVMatrix = function() {
    var mat = this.stackTop();
    if (mat) {
        var gl = this._glContext;

        //var mvMatrix = this._cameraMatInv.multiply(mat);
        var mvMatrix = glmat4.multiply( this._cameraMatInv, mat, []);
        //var mat2 = mat.multiply( this._cameraMatInv );
        gl.uniformMatrix4fv(this._shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix));

        var normalMatrix = mat3.create();
        // RDGE.mat4.toInverseMat3(mvMatrix, normalMatrix);
        // RDGE.mat4.toInverseMat3(new Float32Array(mvMatrix.flatten()), normalMatrix);
        RDGE.mat4.toInverseMat3(new Float32Array(mvMatrix), normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(this._shaderProgram.nMatrixUniform, false, normalMatrix);
    }
};

World.prototype.makePerspectiveMatrix = function() {
  return Matrix.makePerspective( this.getFOV(),  this.getAspect(),  this.getZNear(),  this.getZFar() );
};

World.prototype.render = function()
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
        RDGE.globals.engine.setContext( this._canvas.rdgeid );
        //this.draw();
        this.restartRenderLoop();
    }
};

World.prototype.hRender = function( obj )
{
    if (!obj)  return;
    obj.render();

    this.hRender( obj.getChild() );
    this.hRender( obj.getNext() );
};

World.prototype.setViewportFromCanvas = function(canvas) {
    this._viewportWidth = canvas.width;
    this._viewportHeight = canvas.height;

    if (this._useWebGL) {
        this._glContext.viewportWidth = canvas.width;
        this._glContext.viewportHeight = canvas.height;

        this.getCamera().setPerspective(this.getFOV(), this.getAspect(), this.getZNear(), this.getZFar());

        this.renderer.setViewPort(0, 0, canvas.width, canvas.height);
    }
};

World.prototype.getShapeFromPoint = function( offsetX, offsetY ) {
    var x = offsetX/this._canvas.width;
    var y = offsetY/this._canvas.height;

    var go = this._geomRoot;
    if(go.collidesWithPoint(x,y)) {
//      console.log("collision found");
        return go;
    }

    while (go.getNext()) {
        go = go.getNext();
        if(go.collidesWithPoint(x,y)) {
//          console.log("collision found");
            return go;
        }
    }
};



World.prototype.exportJSON = function ()
{
    // world properties
    var worldObj =
    {
        'version'   : 1.1,
        'id'        : this.getCanvas().getAttribute( "data-RDGE-id" ),
        'fov'       : this._fov,
        'zNear'     : this._zNear,
        'zFar'      : this._zFar,
        'viewDist'  : this._viewDist,
        'webGL'     : this._useWebGL
    };

    // RDGE scenegraph
    if (this._useWebGL)
        worldObj.scenedata = this.myScene.exportJSON();

    // object data
    var strArray = [];
    this.exportObjectsJSON( this._geomRoot, worldObj );

    // You would think that the RDGE export function
    // would not be destructive of the data.  You would be wrong...
    // We need to rebuild everything
    if (this._useWebGL) {
        if (worldObj.children && (worldObj.children.length >= 1)) {
            this.rebuildTree(this._geomRoot);
            this.restartRenderLoop();
        }
    }

    // convert the object to a string
    var jStr = JSON.stringify( worldObj );

    // prepend some version information to the string.
    // this string is also used to differentiate between JSON
    // and pre-JSON versions of fileIO.
    // the ending ';' in the version string is necessary
    jStr = "v1.0;" + jStr;

    return jStr;
};


World.prototype.rebuildTree = function (obj)
{
    if (!obj)  return;

    obj.buildBuffers();

    if (obj.getChild()) {
         this.rebuildTree( obj.getChild () );
    }

    if (obj.getNext())
        this.rebuildTree( obj.getNext() );
};


World.prototype.exportObjectsJSON = function( obj,  parentObj )
{
    if (!obj)  return;

    var jObj = obj.exportJSON();
    if (!parentObj.children)  parentObj.children = [];
    parentObj.children.push( jObj );

    if (obj.getChild()) {
         this.exportObjectsJSON( obj.getChild (), jObj  );
    }

    if (obj.getNext())
        this.exportObjectsJSON( obj.getNext(), parentObj );
}

World.prototype.findTransformNodeByMaterial = function( materialNode,  trNode )
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
};

World.prototype.importJSON = function (jObj)
{
    if (jObj.webGL)
    {
        // start RDGE
        rdgeStarted = true;
        var id = this._canvas.getAttribute( "data-RDGE-id" );
        this._canvas.rdgeid = id;
        RDGE.globals.engine.registerCanvas(this._canvas, this);
        RDGE.RDGEStart(this._canvas);
        this._canvas.task.stop()
    }

    // import the objects
    // there should be exactly one child of the parent object
    if (jObj.children)
    {
        for (var i=0;  i<jObj.children.length;  i++)
            this.importObjectsJSON( jObj.children[i] );
    }
    else
        throw new Error ("unrecoverable canvas import error - inconsistent root object: " + jObj.children );

    if (!this._useWebGL)
    {
        // render using canvas 2D
        this.render();
    }
    else
        this.restartRenderLoop();
};

World.prototype.importObjectsJSON = function (jObj, parentGeomObj)
{
    // read the next object
    var gObj = this.importObjectJSON( jObj,  parentGeomObj );

    // determine if we have children
    if (jObj.children)
    {
        var nKids = jObj.children.length;
        for (var i = 0; i < nKids; i++)
        {
            var child = jObj.children[i];
            this.importObjectsJSON( child, gObj );
        }
    }
};

World.prototype.importObjectJSON = function( jObj, parentGeomObj )
{
    var type = jObj.type;
    var BrushStroke = require("js/lib/geom/brush-stroke").BrushStroke;
    var SubPath = require("js/lib/geom/sub-path").SubPath;
    var obj;
    switch (type)
    {
        case 1:
            obj = Object.create(Rectangle, {});
            obj.importJSON( jObj );
            break;

        case 2:     // circle
            obj = Object.create(Circle, {});
            obj.importJSON( jObj );
            break;

        case 3:     // line
            obj = Object.create(Line, {});
            obj.importJSON( jObj );
            break;

        case 5:     //cubic bezier
            obj = new SubPath();
            obj.importJSON(jObj);
            break;

        case 6:     //brush stroke
            obj = new BrushStroke();
            obj.importJSON(jObj);
            break;

        default:
            throw new Error( "Unrecognized object type: " + type );
            break;
    }

    if (obj)
        this.addObject( obj,  parentGeomObj );

    return obj;
};

function Notifier()
{
    // notification types supported
    this.OBJECT_DELETE          = 1;
    this.OBJECT_REINSTANTIATE   = 2;    // the object has come back after a deletion - as in undo
    this.OBJECT_CHANGE          = 3;
    this.FIRST_RENDER           = 4;


    // the array of listener objects
    this._listenerArray = [];

    this.sendNotification = function( type, callerData )
    {
        var n = this._listenerArray.length;
        for (var i=0;  i<n;  i++)
        {
            var obj = this._listenerArray[i];
            obj.callbackFunc( type, obj.callbackObj,  obj.calleeData,  callerData );
        }
    }

    this.addListener = function( obj,  callbackFunc,  calleeData )
    {
        var obj = { 'callbackObj': obj,  'callbackFunc': callbackFunc,  'calleeData':  calleeData };
        this._listenerArray.push( obj );
    }

    this.removeListener = function( obj )
    {
        var arr = this._listenerArray;
        var n = arr.length;
        for (var i=0;  i<n;  i++)
        {
            var localObj = arr[i];
            if (obj === localObj)
            {
                var tmp = arr[n-1];
                arr[n-1] = arr[i];
                arr.pop();
                return;
            }
        }

        console.log( "*** listener object not found in removeListener, " + obj );
    }
};


if (typeof exports === "object") {
    exports.World = World;
    exports.Notifier = Notifier;
}
