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

// init the view
RDGE.LoadState = function(userRunState, context) {
    this.name                   = "LoadState";
    this.userRunState           = userRunState !== undefined ? userRunState : new RDGE.core.RDGEState;
    this.hasUserState           = userRunState !== undefined ? true : false;
    this.renderer               = context.renderer;
    this.loadingDone            = false;
    this.stateManager           = context.ctxStateManager;
    this.sceneLoadQueue         = [];
    this.textureLoadQueue       = [];
};

RDGE.LoadState.prototype.loadScene = function (addr, sceneName) {
    var request = new RDGE.sceneRequestDef(addr, sceneName);
    request.doSceneRequest = true;
    this.sceneLoadQueue.push( request );
};

RDGE.LoadState.prototype.loadTexture = function (textureObject) {
    if (this.stateManager.currentState().name != "LoadState") {
        this.stateManager.PushState( this.stateManager.RDGEInitState, "noInit" );
    }

    this.textureLoadQueue.push(textureObject);
};

RDGE.LoadState.prototype.Init = function () {
    if (this.sceneName) {
        this.loadScene("assets_web/mesh/" + this.sceneName + ".json", this.sceneName);
    }

    if (this.hasUserState && this.userRunState && this.userRunState.onLoadState)
        this.userRunState.onLoadState();
};

RDGE.LoadState.prototype.ReInit = function () {
    if (this.hasUserState && this.userRunState && this.userRunState.onLoadState)
        this.userRunState.onLoadState();
};

RDGE.LoadState.prototype.Resize = function () {
    if (RDGE.globals.engine.lastWindowWidth == window.innerWidth && RDGE.globals.engine.lastWindowHeight == window.innerHeight) {
        this.userRunState.resize();
        RDGE.globals.engine.lastWindowWidth = window.innerWidth;
        RDGE.globals.engine.lastWindowHeight = window.innerHeight;
}
};

RDGE.LoadState.prototype.Update = function (dt) {
    // for the current scene go through processing steps
    var sceneLoadTop = this.sceneLoadQueue.length - 1;
    var texLoadTop  = this.textureLoadQueue.length - 1;

    if (sceneLoadTop > -1) {
        var curSceneReq = this.sceneLoadQueue[sceneLoadTop];

        // check for completed mesh requests and load the data
        RDGE.globals.meshMan.processMeshData();

        if (curSceneReq.doSceneRequest) {
            curSceneReq.requestScene();
        }
        else if (curSceneReq.requestComplete) {
            if (curSceneReq.sceneBeginProcessing) {
                // Load meshes attached to the scene
                curSceneReq.scene = new RDGE.SceneGraph(curSceneReq.rawData);
                curSceneReq.scene.enableShadows( true );
                RDGE.globals.engine.AddScene(curSceneReq.name, curSceneReq.scene);

                // setup the scene and save a map of mesh names
                // that will be check off as the meshes load
                curSceneReq.scene.Traverse(curSceneReq.sceneProcessor, false);

                // processing is complete
                curSceneReq.sceneBeginProcessing = false;
            }
            // if we are here than the scene is processed but meshes are still loading/processing asynchronously
            else if (curSceneReq.processingComplete()) {
                // pop the head node
                var sceneReq = this.sceneLoadQueue.shift();
                this.userRunState.onComplete(sceneReq.name, sceneReq.scene);
            }
        }

    }

    // load any waiting textures
    while (this.textureLoadQueue.length > 0) {
        this.renderer.commitTexture( this.textureLoadQueue.shift() );
    }

    // if there is nothing left to load move back to the run state
    if (this.sceneLoadQueue.length == 0 && this.textureLoadQueue.length == 0) {
        // loaded... remove the state
        var stateMan = RDGE.globals.engine.getContext().ctxStateManager;
        stateMan.PopState();
    }

    if (RDGE.globals.engine.getContext().getScene() && RDGE.globals.engine.getContext().getScene() != "not-ready" && this.stateManager.RDGERunState.initialized)
        this.userRunState.update(dt);
};

RDGE.LoadState.prototype.Draw = function () {
    this.renderer._clear();

    if (RDGE.globals.engine.getContext().getScene() && RDGE.globals.engine.getContext().getScene() != "not-ready" && this.stateManager.RDGERunState.initialized)
        this.userRunState.draw();
};

RDGE.LoadState.prototype.Shutdown = function () {
};

RDGE.LoadState.prototype.LeaveState = function () {
    if (this.userRunState.onComplete != undefined) {
        this.userRunState.onComplete();
    }
};

RDGE.LoadState.prototype.MakeSceneRequest = function (addr, name) {

    this.hasScene = true;
    this.lastSceneName = name;
    var request = new XMLHttpRequest();
    request.initState = this;
    RDGE.globals.engine.getContext().sceneGraphMap[name] = "not-ready";
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200 || window.location.href.indexOf("http") == -1) {
                this.initState.scene = eval("(" + request.responseText + ")"); //retrieve result as an JavaScript object
                this.initState.loadingDone = true;
            }
            else {
                alert("An error has occured making the request");
            }
        }
    };

    request.open("GET", addr, true);
    request.send(null);
};

// scene traversal functor to setup the scene
RDGE.SetupScene = function ()
{
    this.renderer           = RDGE.globals.engine.getContext().renderer;
    this.meshLoadingMap     = [];
    this.onMeshLoaded = function (meshName) {
        // if the mesh was loading (and is defined) mark it as no longer loading
        if(this.meshLoadingMap[meshName])
            this.meshLoadingMap[meshName].stillLoading = false;
    };

    // set a call back handler to notify us when a mesh is loaded
    RDGE.globals.meshMan.addOnLoadedCallback( this );
};

RDGE.SetupScene.prototype.process = function (trNode, parent) {
    RDGE.verifyTransformNode(trNode);

    // create and assign parent node
    trNode.parent = parent;

    if (trNode.local !== undefined) {
        trNode.local = RDGE.mat4.transpose(trNode.local);
    }

    if (((trNode.materialNode || {}).meshNode || {}) != 'undefined') {
        if (trNode.materialNode !== undefined) {

            var lookup = RDGE.globals.meshMan.loadMesh(trNode.materialNode.meshNode.mesh);

            //~~~~ Hack - the mesh node should be placed in an array of meshes under the transform when exported
            trNode.meshes.push(trNode.materialNode.meshNode);

            // if the mesh is not loaded add it to our map
            if (lookup == null) {
                // mark this mesh as loading
                this.meshLoadingMap[trNode.materialNode.meshNode.mesh.name] = { 'stillLoading':true, 'remotelyLoading':false };
            }
            else {
                // just because its in the mesh manager doesn't mean its ready, but
                // if the primitive exists than it is ready to go
                if (lookup.primitive) {
                    // create the buffer for this renderer
                    this.renderer.createPrimitive(lookup.primitive);
                }
                // first see if this scene is the scene already loading this mesh
                else if (!this.meshLoadingMap[trNode.materialNode.meshNode.mesh.name]) {
                    // mark this mesh as loading
                    this.meshLoadingMap[trNode.materialNode.meshNode.mesh.name] = { 'stillLoading':true, 'remotelyLoading':true };
                }

            }

            //add set texture helper function
            RDGE.verifyMaterialNode(trNode.materialNode);

            var mapLookUp = [];
            mapLookUp["TEX_DIF"]  = {'slot':0, 'uni':"colMap"};   // type to texture slot look up
            mapLookUp["TEX_SPEC"] = {'slot':1, 'uni':"envMap"};
            mapLookUp["TEX_NORM"] = {'slot':2, 'uni':"normalMap"};
            mapLookUp["TEX_GLOW"] = {'slot':3, 'uni':"glowMap"};

            // get handle and setup slot bindings
            var texList = trNode.materialNode.textureList;
            var extractedList = [];
            for (var i = 0; i < texList.length; ++i) {
                var handle = this.renderer.getTextureByName(texList[i].name);
                extractedList[i] = { 'name': mapLookUp[texList[i].type].uni, 'handle': handle, 'unit': mapLookUp[texList[i].type].slot, 'type': RDGE.UNIFORMTYPE.TEXTURE2D };
            }

            trNode.materialNode.textureList = extractedList;
        }
    }

    if ((trNode.lightNode || {}) != 'undefined') {
        if (trNode.lightNode !== undefined) {
            trNode.lightNode.parent = trNode;
            RDGE.globals.engine.lightManager.setMapping(trNode.lightNode, trNode.lightNode.links);
    }
}
};


RDGE.sceneRequestDef = function (addr, sceneName) {
    this.name                   = sceneName;
    this.addr                   = addr;
    this.sceneBeginProcessing   = false;
    this.requestComplete        = false;
    this.sceneProcessor = new RDGE.SetupScene();
    this.doSceneRequest         = false;

    /*
     *  @return - returns true when all meshes for the request are done
     */
    this.processingComplete = function () {
        for (var m in this.sceneProcessor.meshLoadingMap) {
            // if a mesh is still loading than loading is not complete
            if (this.sceneProcessor.meshLoadingMap[m].stillLoading == false) {

                if (this.sceneProcessor.meshLoadingMap[m].remotelyLoading == true) {
                    // In this case we need to generate the buffers on our render device
                    var mesh = RDGE.globals.meshMan.getModelByName(m);
                    this.sceneProcessor.renderer.createPrimitive(mesh.primitive);
                }
            }
            else {
                return false;
            }
        }

        // loading done
        return true;
    };

    this.requestScene = function () {
        this.doSceneRequest = false;

        var request = new XMLHttpRequest();
        request.handler = this;

        // set this scene as not-ready just in case anyone is looking for it
        RDGE.globals.engine.getContext().sceneGraphMap[name] = "not-ready";

        // on request complete - set the flags of this request to trigger the next step in loading
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200 || window.location.href.indexOf("http") == -1) {
                    this.handler.rawData = eval("(" + request.responseText + ")"); //retrieve result as an JavaScript object
                    this.handler.requestComplete = true;
                    this.handler.sceneBeginProcessing = true;
                }
                else {
                    alert("An error has occured making the request");
                }
            }
        }

        request.open("GET", addr, true);
        request.send(null);
    };
};
