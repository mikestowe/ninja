/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
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
 *  RDGEState a RDGEstate is an interface that is defined by the user and called by the engine
 */
RDGE.core.RDGEState = function RDGEState() { };
RDGE.core.RDGEState.prototype.init = function () { };
RDGE.core.RDGEState.prototype.update = function () { };
RDGE.core.RDGEState.prototype.draw = function () { };
RDGE.core.RDGEState.prototype.resize = function () { };
RDGE.core.RDGEState.prototype.shutdown = function () { };
RDGE.core.RDGEState.prototype.onComplete = function () { };

/*
 *  Calling this makes sure the passed in run state has all the functions
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
 *  Used to start the RDGE engine, pass the initState and runState, both of which are RDGEState objects
 *  initState is used to asynchronously load scene data while allowing you to render and update if needed
 *  runState is used clear the execution path for regular rendering and updating once loading is complete
 *  @param initState    - the initialization state, false if you don't want to use one
 *  @param runState     - the run state
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
