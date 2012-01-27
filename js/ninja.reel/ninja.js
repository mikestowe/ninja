/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component   = require("montage/ui/component").Component,
    AppData     = require("js/data/appdata").AppData;

exports.Ninja = Montage.create(Component, {

    _appLoaded: { value: false },
    _preload: { value: false },

    toolsData: { value: null },
    appData:    { value: AppData },

    currentDocument: {
        value: null
    },

    selectedElements: {
        value: []
    },

    currentSelectedContainer: {
        value: null
    },

    templateDidLoad: {
        value: function() {
            this.eventManager.addEventListener( "preloadFinish", this, false);
        }
    },

    prepareForDraw: {
        value: function() {

            this.application.ninja = this;

            this.toolsData.selectedTool = this.toolsData.defaultToolsData[0];
            this.toolsData.defaultSubToolsData = this.toolsData.defaultToolsData[7].subtools;
            this.toolsData.selectedSubTool = this.toolsData.defaultToolsData[7].subtools[1];
            this.toolsData.selectedToolInstance = this.toolsList[this.toolsData.selectedTool.action];

            this.setupGlobalHelpers();

            window.addEventListener("resize", this, false);

            this.eventManager.addEventListener( "appLoading", this, false);
            this.eventManager.addEventListener( "selectTool", this, false);
            this.eventManager.addEventListener( "selectSubTool", this, false);
            this.eventManager.addEventListener( "onOpenDocument", this, false);

            this.addEventListener("change@appModel.livePreview", this.executeLivePreview, false);
            this.addEventListener("change@appModel.debug", this.toggleDebug, false);

            NJevent("appLoading");
        }
    },

    handleResize: {
        value: function() {
            this.stage.resizeCanvases = true;
        }
    },

    handlePreloadFinish: {
            value: function(e) {
                this._preload = true;
                this.appLoaded();
            }
    },

    handleAppLoading: {
        value: function(e) {
            this._appLoaded = true;
            this.appLoaded();
        }
    },

    appLoaded: {
        value: function() {
            if(this._appLoaded && this._preload) {
                // App is now deserialized and files are preloaded
                this.appModel.materials = MaterialsLibrary.materials;
            }
        }
    },

    didDraw: {
        value: function() {
            NJevent("appLoaded");
        }
    },

    handleSelectTool: {
        value: function(event) {

            this.toolsData.defaultToolsData[this.toolsData.defaultToolsData.indexOf(this.toolsData.selectedTool)].selected = false;

            if(this.toolsData.selectedTool.container) {
                this.toolsList[this.toolsData.selectedSubTool.action]._configure(false);
            } else {
                this.toolsList[this.toolsData.selectedTool.action]._configure(false);
            }

            this.toolsData.selectedTool = event.detail;

            this.toolsData.defaultToolsData[this.toolsData.defaultToolsData.indexOf(this.toolsData.selectedTool)].selected = true;

            if(this.toolsData.selectedTool.container) {
                this.toolsData.selectedToolInstance = this.toolsList[this.toolsData.selectedSubTool.action];
            } else {
                this.toolsData.selectedToolInstance = this.toolsList[this.toolsData.selectedTool.action];
            }

            this.stage.SelectTool(this.toolsData.selectedTool.cursor);
            this.toolsData.selectedToolInstance._configure(true);

        }
    },

    handleSelectSubTool: {
        value: function(event) {

            this.toolsData.defaultSubToolsData[this.toolsData.defaultSubToolsData.indexOf(this.toolsData.selectedSubTool)].selected = false;

            this.toolsList[this.toolsData.selectedSubTool.action]._configure(false);

            this.toolsData.selectedSubTool = event.detail;

            this.toolsData.defaultSubToolsData[this.toolsData.defaultSubToolsData.indexOf(this.toolsData.selectedSubTool)].selected = true;
            this.toolsData.selectedToolInstance = this.toolsList[this.toolsData.selectedSubTool.action];

            this.toolsList[this.toolsData.selectedSubTool.action]._configure(true);

        }
    },

    handleOnOpenDocument: {
        value: function(event) {
            this.currentDocument = event.detail;

            this.appModel.show3dGrid = this.currentDocument.draw3DGrid;

            this.currentDocument._document.body.addEventListener("userTemplateDidLoad",  this.userTemplateDidLoad.bind(this), false);


            NJevent("openDocument");
        }
    },

    userTemplateDidLoad: {
        value: function(){
            this.currentSelectedContainer = this.currentDocument.documentRoot;
        }
    },

    handleLivePreview: {
        value: function(event) {

        }
    },

    executeLivePreview: {
        value: function() {
            var background, overflow, transitionStopRule;
            this.stage.hideCanvas(this.appModel.livePreview);

            if(this.appModel.livePreview) {
                background =  "#000000";
                overflow = "hidden";
                transitionStopRule = "nj-css-garbage-selector";
            } else {
                background =  "#808080";
                overflow = "visible";
                transitionStopRule = "*"
            }

            this.currentDocument.documentRoot.elementModel.controller.setProperty(this.currentDocument.documentRoot, "background", background);
            this.currentDocument.documentRoot.elementModel.controller.setProperty(this.currentDocument.documentRoot, "overflow", overflow);
            this.currentDocument.documentRoot.elementModel.controller.changeSelector(this.currentDocument.documentRoot, "transitionStopRule", transitionStopRule);

        }
    },

    // Property to hold the js console.log function when restoring it
    consoleLog: { value: null },
    toggleDebug: {
        value: function() {
            if(!this.consoleLog) this.consoleLog = console.log;

            this.appModel.debug ? console.log = this.consoleLog : console.log = function() {};
        }
    },

    getCurrentToolInstance: {
        value: function() {
            if(this.toolsData.selectedTool.container) {
                return this.toolsList[this.toolsData.selectedSubTool.action];
            } else {
                return this.toolsList[this.toolsData.selectedTool.action];
            }
        }
    },

    _handleAppLoaded: {
        value: function(event){

            /*
            Object.defineBinding(docBar, "type", {
                boundObject: DocumentManagerModule.DocumentManager,
                boundObjectPropertyPath: "activeDocument.documentType"
            });

            Object.defineBinding(docBar, "currentView", {
                boundObject: DocumentManagerModule.DocumentManager,
                boundObjectPropertyPath: "activeDocument.currentView",
                oneway: false
            });

            Object.defineBinding(docBar, "zoomFactor", {
                boundObject: DocumentManagerModule.DocumentManager,
                boundObjectPropertyPath: "activeDocument.zoomFactor",
                oneway: false
            });
            */

        }
    },
    
    setupGlobalHelpers: {
        value: function() {

            var self = this;

            NJevent = function( id, data ){

                var newEvent = document.createEvent( "CustomEvent" );
                newEvent.initCustomEvent( id, false, true, data );
                self.eventManager.dispatchEvent( newEvent );

            };
        }
    }

});
