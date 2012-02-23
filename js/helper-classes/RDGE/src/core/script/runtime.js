/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// runtime globals
g_Engine = new Engine();
g_width = 0;
g_height = 0;
g_cam = null;
g_camMoveSpeed = 25.0;
gl = null; //webGL handle
g_worldObjects = [];
g_shaderMan = null
g_defaultTex = null;
g_alphaTex = null;
g_hiQu = true;
g_meshMan = null;

/*
 *	RDGEState a RDGEstate is an interface that is defined by the user and called by the engine
 */
function RDGEState()
{
	this.init = function()
	{
	
	}
	
	this.update = function(dt)
	{
	
	}
	
	this.draw = function()
	{
	
	}
	
	this.resize = function()
	{	
	
	}
	
	this.shutdown = function()
	{
	
	}
	
	this.onComplete = function()
	{
	
	}
}

/*
 *	Calling this makes sure the passed in run state has all the functions
 *  that are required, adding dummy functions where needed
 */
function validateUserState( userState )
{
	if(!userState.init)
	{
		userState.init = function(){};
	}
	if(!userState.update)
	{
		userState.update = function(dt) 
		{
			var currentScene = g_Engine.getContext().currentScene;
			currentScene = g_Engine.getScene(currentScene);
			
			if(currentScene != null)
				currentScene.update(dt);
		}
	}
	if(!userState.draw)
	{
		userState.draw = function()
		{
			var currentScene = g_Engine.getContext().currentScene;
			currentScene = g_Engine.getScene(currentScene);
			
			if(currentScene==null)
				return;

			currentScene.render();
		}
	}
	if(!userState.resize)
	{
		userState.resize = function(){};
	}
	if(!userState.shutdown)
	{
		userState.shutdown = function(){};
	}
	if(!userState.onComplete)
	{
		userState.onComplete = function(){};
	}
}

/*
 *	Used to start the RDGE engine, pass the initState and runState, both of which are RDGEState objects
 *	initState is used to asynchronously load scene data while allowing you to render and update if needed
 *	runState is used clear the execution path for regular rendering and updating once loading is complete
 *	@param initState	- the initialization state, false if you don't want to use one
 *	@param runState		- the run state
 */
function RDGEStart(canvasOrID)
{
	var canvas = canvasOrID;

	if (typeof(canvasOrID) === "string")
		canvas = document.getElementById(canvasOrID);
	
	if (!canvas)
		return;

	g_Engine.registerCanvas(canvas);

	canvas.task = new RDGETask(canvas, true);

	if (!g_shaderMan)
		g_shaderMan = new ShaderManager();

	if (!g_meshMan)
		g_meshMan = new MeshManager();
	
	// start rdge
	if (!g_Engine.initializeComplete)
		g_Engine.init();
}

function RDGEStop()
{
	if(RDGEShutdown != undefined)
	{
		RDGEShutdown();
	}
}

// the runtime interface
function IRuntime()
{
    this.init       = null; // called when state is pushed on the  stack
    this.ReInit     = null; // called when state above is popped from stack
    this.Resize     = null; // called every tick to setup the viewport/projection
    this.Update     = null; // called every tick to update scene
    this.Draw       = null; // called every tick to draw scene
    this.Shutdown   = null; // called when state is popped from stack
}

// add the connection Pool's to this list for auto polling
g_poolList = [];
function ConnPoll()
{
	var len = g_poolList.length;
	for(var i = 0; i < len; ++i)
	{
		g_poolList[i].Poll();
	}
}

/* RDGE Task */
RDGERequestAnimationFrame = (function() {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(/* function FrameRequestCallback */callback, /* DOMElement Element */element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

RDGETask = (function() {
    var tasks = {};
    return function(canvas, startNow) {
        this.id = canvas.rdgeid;
        this.currTime = 0.0;
        this.lastTime = 0.0;
        this.running = false;
        this.context = null;

        if (!canvas) {
            return;
        }
        
        this.context = g_Engine.ctxMan.handleToObject(canvas.rdgeCtxHandle);

        tasks[this.id] = function() {
            if (!self.running) {
                return;
            }

            self.currTime = new Date().getTime();
            var dt = (self.currTime - self.lastTime) / 1000.0;

            self.step(dt);

            RDGERequestAnimationFrame(tasks[self.id], canvas);

            self.lastTime = self.currTime;
        }

        this.start = function()
		{
			if (!this.running)
			{
				this.running = true;
				this.currTime = new Date().getTime();
				this.lastTime = this.currTime;
				tasks[this.id]();
			}
        }

        this.stop = function() {
            this.running = false;
        }

        this.kill = function() {
            this.running = false;
            tasks[this.id] = null;
        }

        this.step = function(dt) {
            contextManager.currentCtx = this.context;
            this.context.fpsTracker.sample();
            this.context.ctxStateManager.tick(dt);
        }

        var self = this;

        if (startNow) {
            self.start();
        }
    }
})();
