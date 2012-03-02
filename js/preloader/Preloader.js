/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;

var codeMirrorPath = "imports/codemirror";

exports.Preloader = Montage.create(Component, {

    ninjaJsRequire: {
        value:
            [
                {"type":"js", "url":"js/helper-classes/3D/GLMatrix/gl-matrix.js"},

                {"type":"js", "url":"js/helper-classes/RDGE/rdge-compiled.js"},

			// source RDGE
				/*
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/math/vec2.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/math/vec3.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/math/vec4.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/math/mat4.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/math/quat.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/util/statTracker.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/util/fpsTracker.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/objectManager.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/precompiled.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/renderer.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/renderUtils.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/jshader.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/jpass.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/RenderProcs.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/RenderInitProcs.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/MeshManager.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/TextureManager.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/ShaderManager.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/fx/blur.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/fx/ssao.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/ScreenQuad.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/box.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/camera.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/shadowLight.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/utilities.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/input.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/engine.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/scenegraphNodes.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/scenegraph.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/lightmanager.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/rendercontext.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/animation.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/particle.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/run_state.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/init_state.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/runtime.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/src/core/script/util/dbgpanel.js"},
				*/

                {"type":"js", "url":"js/helper-classes/3D/ParseUtils.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/GLLine.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/GLMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/GLLight.js"},

                {"type":"js", "url":"js/helper-classes/RDGE/runtime/CanvasDataManager.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/runtime/GLRuntime.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/runtime/RuntimeGeomObj.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/runtime/RuntimeMaterial.js"},

                {"type":"js", "url":"js/helper-classes/RDGE/Materials/FlatMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/TaperMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/TwistVertMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/UberMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/PlasmaMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/LinearGradientMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/RadialGradientMaterial.js"},
				{"type":"js", "url":"js/helper-classes/RDGE/Materials/RadialBlurMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/PulseMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/TunnelMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/ReliefTunnelMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/SquareTunnelMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/FlyMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/WaterMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/ZInvertMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/DeformMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/StarMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/TwistMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/KeleidoscopeMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/JuliaMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/MandelMaterial.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/Materials/BumpMetalMaterial.js"},

                {"type":"js", "url":"js/helper-classes/RDGE/GLWorld.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/GLGeomObj.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/GLCircle.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/GLRectangle.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/GLLine.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/GLPath.js"},
                {"type":"js", "url": "js/helper-classes/RDGE/GLAnchorPoint.js" },
                {"type":"js", "url": "js/helper-classes/RDGE/GLSubpath.js" },
                {"type":"js", "url": "js/helper-classes/RDGE/GLBrushStroke.js" },
                {"type":"js", "url":"js/helper-classes/RDGE/precompiled.js"},
                {"type":"js", "url":"js/helper-classes/RDGE/MaterialsLibrary.js"},
                {"type":"js", "url":"js/helper-classes/3D/glUtils.js"},                
                {"type":"js", "url": codeMirrorPath + "/lib/codemirror.js"},
                {"type":"js", "url": codeMirrorPath + "/mode/htmlmixed/htmlmixed.js"},
                {"type":"js", "url": codeMirrorPath + "/mode/xml/xml.js"},
                {"type":"js", "url": codeMirrorPath + "/mode/javascript/javascript.js"},
                {"type":"js", "url": codeMirrorPath + "/mode/css/css.js"}
            ]
    },

    ninjaCssRequire: {
        value:
            [
                {"type":"css", "url": codeMirrorPath + "/lib/codemirror.css"}
            ]
    },

    filesTotal: {
        value: 0
    },

    filesLoaded: {
        value: 0
    },

    executionHash: {
        value: {}
    },

    lastExecutedJsIndex: {
        value: -1
    },

    lastExecutedCssIndex: {
        value: -1
    },

    executionInProgress: {
        value: false
    },

    worker: {
        value: null
    },

    deserializedFromTemplate: {
        value: function() {

            this.filesTotal = this.ninjaJsRequire.length + this.ninjaCssRequire.length;

            this.loadFilesWithWorker();
            //this.loadFilesWithWorker(this.jsFiles, this.cssFiles.reverse(), this.publishLoadingStatus);
        }
    },

    loadFilesWithWorker: {
        value: function() {
            this.worker = new Worker('js/preloader/PreloaderWorker.js');
            this.worker.addEventListener("message", this, false);
            this.worker.addEventListener("error", this, false);
            var filesExecuted = 0;

            var baseUrl = location.href;
            if(baseUrl.charAt(baseUrl.length-1) !== "/"){
                baseUrl = baseUrl.substring(0, (baseUrl.lastIndexOf("/")+1));
            }

//            console.log("baseUrl="+baseUrl);
            //prepare the json command
            var startJson = {"command":"start", "jsFiles":this.ninjaJsRequire, "cssFiles":this.ninjaCssRequire.reverse(), "baseUrl":baseUrl};//will load ninjaInitJsDependencies and ninjaInitCssDependencies
            //start the worker thread
            this.worker.postMessage(startJson);
        }
    },

    handleEvent: {
        value: function(e) {
            e.type === "message"? this.workerOnMessage(e) : this.workerOnError(e);
        }
    },

    workerOnMessage: {
        value: function(e) {
            var msgJson;
            msgJson = e.data;

            switch(msgJson.command){
                case "newFile":
                    //console.log("**worker downloaded file: "+msgJson.url);
                    this.executionHash[""+msgJson.fileType+msgJson.fileIndex]={"url":msgJson.url, "fileContent":msgJson.fileContent};
                    this.triggerExecution(msgJson.fileIndex, msgJson.fileType);
                    break;
              case "log":
                    console.log(""+ msgJson.logMsg);
                    break;
              case "stop":
                    this.worker.terminate();
                break;
                    default:
                break;
            }

        }
    },

    workerOnError: {
        value: function(e) {
              console.log("error from worker: "+ e.message);
              this.worker.terminate();
        }
    },

    triggerExecution: {
        value: function(originIndex, fileType) {
            var sourceURLComment = "",
                url = "",
                fileContent = "";

            if(this.executionInProgress === false) {
                this.executionInProgress = true;
                while((this.executionHash != null) && (typeof this.executionHash[""+fileType+originIndex] != 'undefined')){
                    if(fileType === "js"){
                        if((originIndex -1)!== this.lastExecutedJsIndex) { //don't execute if previous file is not yet executed
                            break;
                        }
                        url = this.executionHash[""+fileType+originIndex].url;
                        fileContent = this.executionHash[""+fileType+originIndex].fileContent;

                        sourceURLComment = "\n//@ sourceURL="+this.extractFileName(url);
                        window.eval(""+fileContent+sourceURLComment);

                        this.lastExecutedJsIndex++;

                        this.pusblishLoadingStatus(url, fileType, originIndex);
                        //console.log("Executed: "+this.executionHash[""+fileType+originIndex].url+ " :: index="+originIndex);
                    }else if(fileType === "css"){
                        if((originIndex -1)!== this.lastExecutedCssIndex){//don't execute if previous file is not yet executed
                            break;
                        }
                        url = this.executionHash[""+fileType+originIndex].url;
                        this.insertCssNode(url);
                        this.lastExecutedCssIndex++;

                        this.pusblishLoadingStatus(url, fileType, originIndex);
                        //console.log("Executed: "+this.executionHash[""+fileType+originIndex].url+ " :: index="+originIndex);
                    }
                    originIndex++;
                }
                this.executionInProgress = false;
            }
        }
    },

    extractFileName: {
        value: function(url) {
            var fileName = "aFile";
            var arr;

            if(url && url !== null) {
                arr  = url.split("/");
                fileName = arr[arr.length -1];
            }

            return fileName;
        }
    },

    insertCssNode: {
        value: function(url) {
            var headID = document.getElementsByTagName("head")[0];
            var cssNode = document.createElement('link');
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.href = url;
            cssNode.media = 'screen';
            headID.insertBefore(cssNode, headID.firstChild); //append at the beginning of <head>
        }
    },

    pusblishLoadingStatus: {
        value: function(url, type, indexLoaded) {
            this.filesLoaded++;
            //this.percentageLoaded = Math.floor((this.filesloaded/this.filestotal)*100);

            //console.log("Preloader:loaded "+ type + " file: " + url + " :: done " + this.filesLoaded+"/"+this.filesTotal);

            if (this.filesLoaded === this.filesTotal) {
                var newEvent = document.createEvent( "CustomEvent" );
                newEvent.initCustomEvent( "preloadFinish", false, true );
                defaultEventManager.dispatchEvent( newEvent );
            }
        }
    }

});