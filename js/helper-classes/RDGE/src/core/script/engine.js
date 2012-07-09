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

/*
 *  Manage state instances
 */
RDGE.stateManager = function () {
    // a stack of states
    this.stateStack = [];

    // number of states on the stack
    this.stateTop       = undefined;

    // the states of the context
    this.RDGEInitState  = null;
    this.RDGERunState   = null;

    this.currentState = function () {
        if(this.stateTop != undefined)
            return this.stateStack[this.stateTop];

        return null;
    };

    /*
     *  Push new IRuntime state - engine executes the new state
     */
    this.PushState = function (state, flags) {
        if (state != null && typeof state.Init == 'function') {
            if(this.stateTop != undefined)
                this.stateStack[this.stateTop].LeaveState();

            if(flags == undefined || flags != "noInit")
                state.Init();

            this.stateTop = this.stateStack.push(state) - 1;
        }
    };

    /*
     *  Remove IRuntime state from stack, engine executes previous state
     */
    this.PopState = function () {
        state = this.stateStack.pop();
        if (state != null) {
            state.Shutdown();
        }

        this.stateTop = this.stateTop > 0 ? this.stateTop - 1 : 0;

        if (this.stateStack[this.stateTop]) {
            this.stateStack[this.stateTop].ReInit();
        }
    };

    /*
     *  Remove all states from the stack
     */
    this.PopAll = function () {
        while (this.stateStack[this.stateTop] != null) {
            this.PopState();
        }
    };

    this.tick = function (dt) {
        if (this.stateStack[this.stateTop] != null) {
            this.stateStack[this.stateTop].Update(dt);
            this.stateStack[this.stateTop].Resize();
            this.stateStack[this.stateTop].Draw();
        }
    };
};

RDGE.Engine = function () {
    this._assetPath = "assets/";

    // map of scene graphs to names
    this.sceneMap = [];

    // number of states on the stack
    this.stateTop = undefined;

    // size of the browser window
    this.lastWindowWidth = window.innerWidth;
    this.lastWindowHeight = window.innerHeight;

    this.defaultContext = null;

    this.lightManager = null;

    clearColor = [0.0, 0.0, 0.0, 0.0];

    this.initializeComplete = false;

    this.RDGECanvas = null;

    /*
    *   a map of canvas names to renderer
    */
    this.canvasToRendererMap = {};

    /*
    *   states to canvas map - maps a state stack to the canvas context it belongs to
    */
    this.canvasNameToStateStack = {};

    /*
    *   the list of context's that are active
    */
    this.canvasCtxList = [];

    /*
    *   regex object to verify runtime object is not some sort of exploit
    */
    invalidObj = new RegExp("([()]|function)");

    isValidObj = function (name) {
        // do a quick test make sure user isn't trying to execute a function
        if (invalidObj.test(name)) {
            window.console.error("invalid object name passed to RDGE, " + name + " - looks like a function");
            return false;
        }

        return true;
    };

    /*
    *   The context definition - every context shares these parameters
    */
    contextDef = function () {
        this.id = null;
        this.renderer = null;
        this.ctxStateManager = null;
        this.startUpState = null;
        this.sceneGraphMap = [];
        this.currentScene = null;
        this.getScene = function () {
            return this.sceneGraphMap[this.currentScene];
        }
        this.debug =
        {
            'frameCounter': 0,
            'mat4CallCount': 0
        }
    };

    // maintains the contexts
    contextManager = new RDGE.objectManager();
    this.ctxMan = contextManager;

    // the context currently being updated
    contextManager.currentCtx = null;

    contextManager._addObject = contextManager.addObject;
    contextManager.contextMap = {};

    contextManager.addObject = function (context) {
        this.contextMap[context.id] = context;
        return this._addObject(context);
    };

    contextManager.start = function () {
        var len = this.objects.length;
        for (var i = 0; i < len; ++i) {
            // set the current context
            contextManager.currentCtx = this.objects[i];
            this.objects[i].ctxStateManager.PushState(this.objects[i].startUpState);
        }
    };

    contextManager.forEach = function (cb) {
        var len = this.objects.length;
        for (var i = 0; i < len; ++i) {
            cb(this.objects[i]);
        }
    };

    this.getContext = function (optCanvasID) {
        if (!optCanvasID) {
            return contextManager.currentCtx;
        }
        else {
            return contextManager.contextMap[optCanvasID];
        }
    };

    this.clearContext = function (canvasID) {
        contextManager.contextMap[canvasID] = undefined;
    };

    /*
    *   give the contextID (canvas id) of the context to set
    */
    this.setContext = function (contextID) {
        contextManager.currentCtx = contextManager.contextMap[contextID];
    };

    this.tickContext = function (contextID) {
        var savedCtx = contextManager.currentCtx;
        contextManager.currentCtx = contextManager.contextMap[contextID];
        this.objects[i].ctxStateManager.tick(dt);
        contextManager.currentCtx = savedCtx;
    };

    this.setAssetPath = function (path) {
        this._assetPath = path.slice();
    };

    this.remapAssetFolder = function (url) {
        var searchStr = "assets/";
        var index = url.indexOf(searchStr);
        var rtnPath = url;
        if (index >= 0) {
            rtnPath = url.substr(index + searchStr.length);
            rtnPath = this._assetPath + rtnPath;
        }
        return rtnPath;
    };
};

/*
 *   Initialize the RDGE web engine
 */
RDGE.Engine.prototype.init = function (userInitState, userRunState, canvasObject) {
    this.GlInit(canvasObject);

    globalParamFuncSet = function (param) {
        this.data = param.data;
        this.type =param.type;

        this.set = function (v) {
            var len = this.data ? this.data.length : 0;
            for(var i=0;i<len;++i)
                this.data[i]=v[i];
        }
        this.get = function () {
            if (this.data.length == undefined) {
                return this.data;
            }
            else {
                return this.data.slice();
            }
        }
    };

    // light manager init before global parameters structure is reconfigured
    this.lightManager = new RDGE.LightManager(RDGE.rdgeGlobalParameters.rdge_lights);

    // added getter and setter to global uniforms
    for (var p in RDGE.rdgeGlobalParameters) {
        if (p != "rdge_lights") {
            RDGE.rdgeGlobalParameters[p] = new globalParamFuncSet(RDGE.rdgeGlobalParameters[p]);
        }
        else {
            var lights = RDGE.rdgeGlobalParameters[p];
            for (var l in lights) {
                RDGE.rdgeGlobalParameters[l] = new globalParamFuncSet(lights[l]);
            }
        }
    }

    // initial window
    this.lastWindowWidth = window.innerWidth;
    this.lastWindowHeight = window.innerHeight;

    // setup default render context
    this.defaultContext = new RDGE.RenderContext();

    this.defaultContext.uniforms = [
        { 'name': "u_matAmbient", 'value': [0.02,0.02,0.02, 1.0] },
        { 'name': "u_matDiffuse", 'value': [1.0, 1.0, 1.0, 1.0] },
        { 'name': "u_matSpecular", 'value': [1.0, 1.0, 1.0, 1.0] },
        { 'name': "u_matShininess", 'value': [128.0] },
        { 'name': "u_matEmission", 'value': [0.0, 0.0, 0.0, 1.0] }
    ];

    // startup the contexts
    contextManager.start();

    this.initializeComplete = true;
};

// shutdown the engine clears all states
RDGE.Engine.prototype.Shutdown = function () {
    this.PopAll();
};

// initialize WebGL
RDGE.Engine.prototype.GlInit = function (canvasObject) {
    // Initialize
    var canvases = document.getElementsByTagName("canvas");

    // transverse the canvases and create the contexts
    var numCv = canvases.length;
    for (var cvIdx = 0; cvIdx < numCv; ++cvIdx) {
        var canvas;

        // if this canvas has a rdge attribute initialize the render context
        var rdgeAttr = canvases[cvIdx].getAttribute("rdge");
        if (rdgeAttr == "true") {
            // hack ~ while implementing multi-context
            canvas = canvases[cvIdx];
            this.registerCanvas(canvas);
        }

    }
/*
    canvas.addEventListener("webglcontextlost", contextLostHandler, false);
    canvas.addEventListener("webglcontextrestored", contextRestoredHandler, false);
*/
};

RDGE.Engine.prototype.loadScene = function (name) {
    var url = "assets_web/mesh/" + name + ".json"

    // if we are not in the load state than push it on again
    if (contextManager.currentCtx.stateMan.currentState().name == "RunState") {
        contextManager.currentCtx.stateMan.PushState(contextManager.currentCtx.stateMan.RDGEInitState);
        contextManager.currentCtx.loadScene(url, name);
    }
};

RDGE.Engine.prototype.getScene = function (name) {
    return contextManager.currentCtx.sceneGraphMap[name];
};

RDGE.Engine.prototype.AddScene = function (name, sceneGraph) {
    contextManager.currentCtx.sceneGraphMap[name] = sceneGraph;
    contextManager.currentCtx.currentScene = name;
};

RDGE.Engine.prototype.registerCanvas = function (canvas, runState) {
    if (canvas && this.getContext(canvas.rdgeid))
        return;

    canvas.renderer = new RDGE._renderer(canvas);   // create the renderer for the context
    this.canvasToRendererMap[canvas.rdgeid] = canvas; // store the canvas in the context map
    canvas.renderer.id = canvas.rdgeid;

    // configure the state manager for this context
    var stateMan = new RDGE.stateManager();

    // add this context to the contextManager and attach the handle to DOM canvas for user retrieval
    var context = new contextDef();

    context.id = canvas.rdgeid;
    context.renderer = canvas.renderer;
    context.ctxStateManager = stateMan;

    context.renderer.mvMatrix = RDGE.mat4.identity();
    context.renderer.invMvMatrix = RDGE.mat4.identity();
    context.renderer.projectionMatrix = RDGE.mat4.identity();
    context.renderer.normalMatrix = RDGE.mat4.identity();

    canvas.rdgeCtxHandle = contextManager.addObject(context);

    // set new context as the current context so that when the runtime object is instantiated
    // it can use the context during construction
    var oldCtx = contextManager.currentCtx;
    contextManager.currentCtx = context;

    var _runState;

    // check for runtime handlers
    if (runState) {
        _runState = runState;
    }
    else {
        var runAttr = canvas.getAttribute("rdgerun");

        if (runAttr) {
            // make sure attribute is valid
            if (!isValidObj(runAttr))
                return;
            try {
                var state = eval(runAttr);
                _runState = new state();
            }
            catch (err) {
                window.console.error("The provided RDGE state object \"" + runAttr + "\" is not defined");
            }
        }
        else {
            _runState = {};
            RDGE.utilities.validateUserState(_runState);
        }
    }

    // check for a scene
    var sceneName = canvas.getAttribute("rdgescene");

    // setup the RDGE states passing the user state or undefined
    stateMan.RDGEInitState = new RDGE.LoadState(_runState, context);
    stateMan.RDGERunState = new RDGE.RunState(_runState, context);

    // fill out any user state missing methods with dummy methods
    RDGE.utilities.validateUserState(_runState);

    if (sceneName) {
        stateMan.RDGEInitState.sceneName = sceneName;

        // run is now always the bottom state, loading can happen at any time
        stateMan.PushState(stateMan.RDGERunState, "noInit");

        context.startUpState = stateMan.RDGEInitState;
    }
    else {
        context.startUpState = stateMan.RDGERunState;
    }

    if (this.initializeComplete) {
        context.ctxStateManager.PushState(context.startUpState);
    }

    // restore previous context
    // NOTE: Ninja requires this to be commented out!
    //  if (oldCtx)
    //  {
    //      contextManager.currentCtx = oldCtx;
    //  }
};

RDGE.Engine.prototype.unregisterCanvas = function (canvas) {
     contextManager.removeObject(canvas.rdgeCtxHandle);
     this.clearContext( canvas.rdgeid );
};


RDGE.Engine.prototype.getCanvas = function (id)
{
    return this.canvasToRendererMap[id];
};
