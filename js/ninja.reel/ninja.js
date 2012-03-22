/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component   = require("montage/ui/component").Component,
    AppData     = require("js/data/appdata").AppData;

var matrix = require("js/lib/math/matrix");

exports.Ninja = Montage.create(Component, {

    ninjaVersion: {
        value: null
    },

    toolsData: { value: null },
    appData:    { value: AppData },

    currentDocument: {
        value: null
    },

    _isResizing: {
        value: false
    },
    _resizedHeight : {
        value: 0
    },
    _height: {
        value: null
    },

    height: {
        get: function() {
            return this._height;
        },
        set: function(val) {
            if(this._height != val) {
                this._height = val;
                this.needsDraw = true;
            }

        }
    },

    _resizedWidth : {
        value: 0
    },
    _width: {
        value: null
    },

    width: {
        get: function() {
            return this._width;
        },
        set: function(val) {
            if(this._width != val) {
                this._width = val;
                this.needsDraw = true;
            }

        }
    },

    handleResizeStart: {
        value:function(e) {
            this.isResizing = true;
            this.height = parseInt(this.timeline.element.offsetHeight);
            this.width = parseInt(this.rightPanelContainer.offsetWidth);
            this.needsDraw = true;
        }
    },

    handleResizeMove: {
        value:function(e) {
            this._resizedHeight = e._event.dY;
            this._resizedWidth = e._event.dX;
            console.log("resizing");
            this.stage.resizeCanvases = true;
            this.needsDraw = true;
        }
    },

    handleResizeEnd: {
        value: function(e) {
            this.height -= this._resizedHeight;
            this.width -= this._resizedWidth;
            this.stage.resizeCanvases = true;
            this._resizedHeight = 0;
            this._resizedWidth = 0;
            this.isResizing = false;
            this.needsDraw = true;
        }
    },

    selectedElements: {
        value: []
    },

    currentSelectedContainer: {
        value: null
    },

    templateDidLoad: {
        value: function() {
            this.ninjaVersion = window.ninjaVersion.ninja.version;
            this.eventManager.addEventListener( "preloadFinish", this, false);
        }
    },

    prepareForDraw: {
        value: function() {
            console.log("Loading Ninja --> ", this.ninjaVersion);

            this.application.ninja = this;

            this.toolsData.selectedTool = this.toolsData.defaultToolsData[0];
            this.toolsData.defaultSubToolsData = this.toolsData.defaultToolsData[7].subtools;
            this.toolsData.selectedSubTool = this.toolsData.defaultToolsData[7].subtools[1];
            this.toolsData.selectedToolInstance = this.toolsList[this.toolsData.selectedTool.action];

            this.setupGlobalHelpers();

            window.addEventListener("resize", this, false);

//            this.eventManager.addEventListener( "appLoading", this, false); // Don't need this anymore
            this.eventManager.addEventListener( "selectTool", this, false);
            this.eventManager.addEventListener( "selectSubTool", this, false);
            this.eventManager.addEventListener( "onOpenDocument", this, false);

            this.addEventListener("change@appModel.livePreview", this.executeLivePreview, false);
            this.addEventListener("change@appModel.chromePreview", this.executeChromePreview, false);
            this.addEventListener("change@appModel.debug", this.toggleDebug, false);

            NJevent("appLoading");
        }
    },
    
    executeChromePreview: {
    	value: function () {
    		this.application.ninja.documentController.activeDocument.livePreview();
    	}
    },

    handleResize: {
        value: function() {
            this.stage.resizeCanvases = true;
        }
    },

    willDraw: {
        value: function() {
            if (this.height === null) {
                this.height = parseInt(this.timeline.element.offsetHeight);
            }
            if (this.width === null) {
                this.width = parseInt(this.rightPanelContainer.offsetWidth);
            }
        }
    },

    draw: {
        value: function() {
            if (this.height - this._resizedHeight < 30) {
                this.timelineSplitter.collapsed = true;
            } else {
                this.timelineSplitter.collapsed = false;
            }
            if (this.width - this._resizedWidth < 30) {
                this.panelSplitter.collapsed = true;
            } else {
                this.panelSplitter.collapsed = false;
            }

            this.timeline.element.style.height = (this.height - this._resizedHeight) + "px";
            this.rightPanelContainer.style.width = (this.width - this._resizedWidth) + "px";
        }
    },

    _didDraw: {
        value: false
    },
    
    didDraw: {
        value: function() {
            if (!this.isResizing) {
                this.height = this.timeline.element.offsetHeight;
                this.width = this.rightPanelContainer.offsetWidth;
            }
            if(!this._didDraw) {
            	if (!this.application.ninja.coreIoApi.ioServiceDetected) {
            		var check = this.application.ninja.coreIoApi.cloudAvailable();
            	}
                NJevent("appLoaded");
                this._didDraw = true;
            }
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
            NJevent("openDocument");
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

            this.currentDocument.documentRoot.elementModel.controller.setProperty(this.currentDocument.documentRoot, "body-background", background);
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
