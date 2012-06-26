/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// RDGE namespaces
var RDGE = RDGE || {};
RDGE.core = RDGE.core || {};
RDGE.utilities = RDGE.utilities || {};

// runtime globals
RDGE.globals = (function () {
    return {
        engine: new RDGE.Engine(),
        width: 0,
        height: 0,
        cam: null,
        shaderMan: null,
        meshMan: null,
        poolList: [],
        gl: null
    };
})();

// new code is above
/***************************************************************************************************************/

/*
 *	RDGEState a RDGEstate is an interface that is defined by the user and called by the engine
 */
RDGE.core.RDGEState = function RDGEState() { };
RDGE.core.RDGEState.prototype.init = function () { };
RDGE.core.RDGEState.prototype.update = function () { };
RDGE.core.RDGEState.prototype.draw = function () { };
RDGE.core.RDGEState.prototype.resize = function () { };
RDGE.core.RDGEState.prototype.shutdown = function () { };
RDGE.core.RDGEState.prototype.onComplete = function () { };

/*
 *	Calling this makes sure the passed in run state has all the functions
 *  that are required, adding dummy functions where needed
 */
RDGE.utilities.validateUserState = function (userState) {
    if (!userState.init) {
        userState.init = function () { };
    }
    if (!userState.update) {
        userState.update = function (dt) {
            var currentScene = RDGE.globals.engine.getContext().currentScene;
            currentScene = RDGE.globals.engine.getScene(currentScene);

            if (currentScene != null)
                currentScene.update(dt);
        }
    }
    if (!userState.draw) {
        userState.draw = function () {
            var currentScene = RDGE.globals.engine.getContext().currentScene;
            currentScene = RDGE.globals.engine.getScene(currentScene);

            if (currentScene == null)
                return;

            currentScene.render();
        }
    }
    if (!userState.resize) {
        userState.resize = function () { };
    }
    if (!userState.shutdown) {
        userState.shutdown = function () { };
    }
    if (!userState.onComplete) {
        userState.onComplete = function () { };
    }
};

/*
 *	Used to start the RDGE engine, pass the initState and runState, both of which are RDGEState objects
 *	initState is used to asynchronously load scene data while allowing you to render and update if needed
 *	runState is used clear the execution path for regular rendering and updating once loading is complete
 *	@param initState	- the initialization state, false if you don't want to use one
 *	@param runState		- the run state
 */
RDGE.RDGEStart = function (canvasOrID) {
    var canvas = canvasOrID;

    if (typeof (canvasOrID) === "string")
        canvas = document.getElementById(canvasOrID);

    if (!canvas)
        return;

    RDGE.globals.engine.registerCanvas(canvas);

	if (!canvas.task)
	{
		//canvas.task = new RDGE.RDGETask(canvas, true);
		canvas.task = new RDGE.RDGETask(canvas, false);
	}

    if (!RDGE.globals.shaderMan)
        RDGE.globals.shaderMan = new RDGE.ShaderManager();

    if (!RDGE.globals.meshMan)
        RDGE.globals.meshMan = new RDGE.MeshManager();

    // start RDGE
    if (!RDGE.globals.engine.initializeComplete)
        RDGE.globals.engine.init();
};

RDGE.RDGEStop = function () { };

RDGE.RequestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function FrameRequestCallback */callback, /* DOMElement Element */element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

RDGERequestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function FrameRequestCallback */callback, /* DOMElement Element */element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

/* RDGE Task */
RDGE.RDGETask = (function () {
    var tasks = {};

    return function (canvas, startNow) {
        this.id = canvas.rdgeid;
        this.currTime = 0.0;
        this.lastTime = 0.0;
        this.running = false;
        this.context = null;

        if (!canvas) {
            return;
        }

        this.context = RDGE.globals.engine.ctxMan.handleToObject(canvas.rdgeCtxHandle);

        tasks[this.id] = function () {
            if (!self.running) {
                return;
            }

            self.currTime = new Date().getTime();
            var dt = (self.currTime - self.lastTime) / 1000.0;

            self.step(dt);

            RDGERequestAnimationFrame(tasks[self.id], canvas);

            self.lastTime = self.currTime;
        }

        this.start = function () {
            if (!this.running) {
                this.running = true;
                this.currTime = new Date().getTime();
                this.lastTime = this.currTime;
                tasks[this.id]();
            }
        }

        this.stop = function () {
            this.running = false;
        }

        this.kill = function () {
            this.running = false;
            tasks[this.id] = null;
        }

        this.step = function (dt) {
            contextManager.currentCtx = this.context;
            this.context.ctxStateManager.tick(dt);
        }

        var self = this;

        if (startNow) {
            self.start();
        }
    }
})();
