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

var Montage =       require("montage/core/core").Montage,
    Component =     require("montage/ui/component").Component,
    UndoManager =   require("montage/core/undo-manager").UndoManager,
    AppData =       require("js/data/appdata").AppData,
    Popup =         require("js/components/popup.reel").Popup;

var matrix = require("js/lib/math/matrix");
var NjUtils = require("js/lib/NJUtils").NJUtils;

exports.Ninja = Montage.create(Component, {

    // SERIALIZABLE Properties
    //////////////////////////////
    rulerTop: {
        value: null,
        serializable: true
    },

    rulerLeft: {
        value: null,
        serializable: true
    },

    appModel: {
        value: null,
        serializable: true
    },

    toolsData: {
        value: null,
        serializable: true
    },

    toolsList: {
        value: null,
        serializable: true
    },

    toolsProperties: {
        value: null,
        serializable: true
    },

    stage: {
        value: null,
        serializable: true
    },

    elementMediator: {
        value: null,
        serializable: true
    },

    dragDropMediator: {
        value: null,
        serializable: true
    },

    undocontroller: {
        value: null,
        serializable: true
    },

    selectionController: {
        value: null,
        serializable: true
    },

    documentController: {
        value: null,
        serializable: true
    },

    popupManager: {
        value: null,
        serializable: true
    },

    colorController: {
        value: null,
        serializable: true
    },

    stylesController: {
        value: null,
        serializable: true
    },

    presetsController: {
        value: null,
        serializable: true
    },

    filePickerController: {
        value: null,
        serializable: true
    },

    newFileController: {
        value: null,
        serializable: true
    },

    coreIoApi: {
        value: null,
        serializable: true
    },

    documentBar: {
        value: null,
        serializable: true
    },

    editorViewOptions: {
        value: null,
        serializable: true
    },

    ioMediator: {
        value: null,
        serializable: true
    },

    timeline: {
        value: null,
        serializable: true
    },

    mainMenuController: {
        value: null,
        serializable: true
    },

    codeEditorWrapper: {
        value: null,
        serializable: true
    },

    rightPanelContainer: {
        value: null,
        serializable: true
    },

    panelSplitter: {
        value: null,
        serializable: true
    },

    timelineSplitter: {
        value: null,
        serializable: true
    },

    toolsSplitter: {
        value: null,
        serializable: true
    },

    optionsSplitter: {
        value: null,
        serializable: true
    },

    documentList: {
        value: null,
        serializable: true
    },
    //////////////////////////////

    ninjaVersion: {
        value: null
    },

    appData: {
        value: AppData
    },

    currentDocument: {
        get: function() {
            if(this.documentList.selectedObjects) {
                return this.documentList.selectedObjects[0];
            } else {
                return null;
            }
        }
    },

    _workspaceMode: {
        value: null
    },

    workspaceMode: {
        get: function() {
            return this._workspaceMode;
        },
        set: function(val) {
            if(this._workspaceMode !== val ) {
                if(this._workspaceMode !== null) {
                   document.body.classList.remove("ws-" + this._workspaceMode);
                }
                document.body.classList.add("ws-" + val);
                this._workspaceMode = val;
            }
        }
    },

    _isResizing: {
        value: null
    },

    _resizedHeight : {
        value: 0
    },

    _height: {
        value: null
    },

    height: {
        get: function() {
            if(this._height === null) {
                var storedData = this.application.localStorage.getItem("timelinePanel");
                if(storedData && storedData.value) {
                    this._height = storedData.value;
                }
            }
            return this._height;
        },
        set: function(val) {
            if(this._height != val) {
                this._height = val;
                this.application.localStorage.setItem("timelinePanel", {"version": this.version, "value": val});
                this.needsDraw = true;
            }

        }
    },

    _resizedWidth: {
        value: 0
    },

    _width: {
        value: null
    },

    width: {
        get: function() {
            if(this._width === null) {
                var storedData = this.application.localStorage.getItem("rightPanelsContainer");
                if(storedData && storedData.value) {
                    this._width = storedData.value;
                }
            }
            return this._width;
        },
        set: function(val) {
            if(this._width != val) {
                this._width = val;
                this.application.localStorage.setItem("rightPanelsContainer", {"version": this.version, "value": val});
                this.needsDraw = true;
            }

        }
    },

    handleResizeStart: {
        value:function(e) {
            this.isResizing = true;
            this.height = parseInt(this.timeline.element.offsetHeight);
            this.width = parseInt(this.rightPanelContainer.offsetWidth);
            this.rightPanelContainer.classList.add("disableTransition");
            this.timeline.element.classList.add("disableTransition");
            this.needsDraw = true;
        }
    },

    handleResizeMove: {
        value:function(e) {
            this._resizedHeight = e._event.dY;
            this._resizedWidth = e._event.dX;
            this.stage.resizeCanvases = true;
            this.needsDraw = true;
        }
    },

    handleResizeEnd: {
        value: function(e) {
            this.stage.resizeCanvases = true;
            this._resizedHeight = 0;
            this._resizedWidth = 0;
            this.isResizing = false;
            this.needsDraw = true;
            this.rightPanelContainer.classList.remove("disableTransition");
            this.timeline.element.classList.remove("disableTransition");
            this.height = this.timeline.element.offsetHeight;
            this.width = this.rightPanelContainer.offsetWidth;
        }
    },

    handleResizeReset: {
        value: function(e) {
            this.width = 253;
            this.height = 140;
            this._resizedHeight = 0;
            this._resizedWidth = 0;
            this.timelineSplitter.collapsed = false;
            this.panelSplitter.collapsed = false;
            this.stage.resizeCanvases = true;
            this.needsDraw = true;
        }
    },

    selectedElements: {
        value: []
    },

    templateDidLoad: {
        value: function() {
            this.ninjaVersion = window.ninjaVersion.ninja.version;
            this.undoManager = document.application.undoManager = UndoManager.create();
            document.application.njUtils = NjUtils;
        }
    },

    prepareForDraw: {
        value: function() {
            this.workspaceMode = "default";
            console.log("Loading Ninja --> ", this.ninjaVersion);

            this.application.ninja = this;

            this.toolsData.selectedTool = this.toolsData.defaultToolsData[this.application.ninja.toolsData.selectionToolIndex];
            this.toolsData.defaultSubToolsData = this.toolsData.defaultToolsData[this.application.ninja.toolsData.shapeToolIndex].subtools;
            this.toolsData.selectedSubTool = this.toolsData.defaultToolsData[this.application.ninja.toolsData.shapeToolIndex].subtools[1];
            this.toolsData.selectedToolInstance = this.toolsList[this.toolsData.selectedTool.action];

            this.setupGlobalHelpers();

            window.addEventListener("resize", this, false);
            //Prompting the user to make sure data was saved before closing Ninja
            window.onbeforeunload = function () {
                return 'Are you sure you want to close Ninja? Any unsaved data will be lost.';
            };

            this.eventManager.addEventListener("selectTool", this, false);
            this.eventManager.addEventListener("selectSubTool", this, false);

            this.addPropertyChangeListener("appModel.livePreview", this.executeLivePreview, false);
            this.addPropertyChangeListener("appModel.chromePreview", this.executeChromePreview, false);
            this.addPropertyChangeListener("appModel.debug", this.toggleDebug, false);
        }
    },


    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    //TODO: Expand method to allow other browsers for preview
    executeChromePreview: {
        value: function () {
            //TODO: Make into proper component
            this.saveOperationScreen = {};
            this._saveOperationPopup = {};
            //Show
            this.saveOperationScreen.show = function (ctxt) {
                //
                ctxt._saveOperationPopup.blackout = document.createElement('div');
                ctxt._saveOperationPopup.blackout.style.width = '100%';
                ctxt._saveOperationPopup.blackout.style.height = '100%';
                ctxt._saveOperationPopup.blackout.style.background = 'rgba(0,0,0,0.8)'; //'-webkit-radial-gradient(center, ellipse cover, rgba(0,0,0,.65) 0%, rgba(0,0,0,0.8) 80%)';
                ctxt.application.ninja.popupManager.addPopup(ctxt._saveOperationPopup.blackout);
            };
            //Hide
            this.saveOperationScreen.hide = function (ctxt) {
                ctxt.application.ninja.popupManager.removePopup(ctxt._saveOperationPopup.blackout);
            };
            //
            this.currentDocument.model.browserPreview('chrome', this.saveOperationScreen, this);
        }
    },
    ////////////////////////////////////////////////////////////////////

    //TODO: Make into proper component
    _saveOperationPopup: {
        value: null
    },
    //TODO: Make into proper component
    saveOperationScreen: {
        value: null
    },

    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////


    handleResize: {
        value: function() {
            this.stage.resizeCanvases = true;
        }
    },

    draw: {
        value: function() {
            if(this.isResizing) {
                this.timelineSplitter.collapsed = this.height - this._resizedHeight < 46;
                this.panelSplitter.collapsed = this.width - this._resizedWidth < 30;
            }

            this.rightPanelContainer.style.width = (this.width - this._resizedWidth) + "px";
            this.timeline.element.style.height = (this.height - this._resizedHeight) + "px";
        }
    },

    _didDraw: {
        value: false
    },

    didDraw: {
        value: function() {

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

    openDocument: {
        value: function(doc) {
            this.documentList.content.push(doc);
            // TODO: Check why this is still needed
            this.documentList.selectedObjects = [doc];

        }
    },

    closeFile: {
        value: function(document) {
            var doc = this.documentList.content[this.documentList.content.indexOf(document)], activeDocument;

            if(this.documentList.selectedObjects[0] !== doc) {
                activeDocument = this.documentList.selectedObjects[0];
            } else {
                activeDocument = null;
            }

            this.documentList.removeObjects(doc);

            if(activeDocument) {
                this.documentList.selectedObjects = [activeDocument];
            } else {
                if(this.documentList.content.length) {
                    this.documentList.selectedObjects = this.documentList.content[0];
                }
            }
        }
    },

    executeLivePreview: {
        value: function() {
            var transitionStopRule;
//            this.stage.hideCanvas(this.appModel.livePreview);

            if(this.appModel.livePreview) {
                transitionStopRule = "nj-css-garbage-selector";
                this.stage.bindingView.hide = true;
            } else {
                transitionStopRule = "*"
                this.stage.bindingView.hide = false;
            }

            this.application.ninja.stylesController._stageStylesheet.rules[0].selectorText = transitionStopRule;

            this._toggleWebGlAnimation(this.appModel.livePreview);
        }
    },

    // Turn on WebGL animation during preview
    _toggleWebGlAnimation: {
        value: function(inLivePreview) {
            var glCanvases = this.currentDocument.model.views.design.iframe.contentWindow.document.querySelectorAll('[data-RDGE-id]'),
                glShapeModel;
            if(glCanvases) {
                for(var i = 0, len = glCanvases.length; i<len; i++) {
                    glShapeModel = glCanvases[i].elementModel.shapeModel;
                    if(inLivePreview) {
                        glShapeModel.GLWorld._previewAnimation = true;
                        glShapeModel.GLWorld.restartRenderLoop();
                    } else if (!glShapeModel.animate ) {
                        glShapeModel.GLWorld._previewAnimation = false;
                        glShapeModel.GLWorld._canvas.task.stop();
                    }
                }
            }
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
