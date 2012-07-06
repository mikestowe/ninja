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

var Montage =   require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    vecUtils =  require("js/helper-classes/3D/vec-utils").VecUtils;

exports.Stage = Montage.create(Component, {

    appModel: {
        value: null,
        serializable: true
    },

    // TODO - Need to figure out how to remove this dependency
    // Needed by some tools that depend on selectionDrawn event to set up some logic
    drawNow: { value : false },
    switchedFromCodeDoc: { value : false },

    // TO REVIEW
    zoomFactor: {value : 1 },

    _canvasSelectionPrefs:  { value: { "thickness" : 1.0, "color" : "#46a1ff" } },
    _canvasDrawingPrefs:    { value: { "thickness" : 1.0, "color" : "#000" } },
    drawingContextPreferences: { get: function() { return this._canvasDrawingPrefs; } },
    bindingView: {
        value: null
    },

    _iframeContainer: {
        value: null,
        serializable: true
    },

    _scrollFlag: {value: true, writable: true},
    outFlag: { value: false, writable: true },

    _resizeCanvases: { value: true },

    viewUtils: {
        get: function()  {  return this.stageDeps.viewUtils;  }
    },

    snapManager: {
        get: function()  {  return this.stageDeps.snapManager;  }
    },

    drawUtils: {
        get: function()  {  return this.stageDeps.drawUtils;  }
    },

    resizeCanvases: {
        get: function() {
            return this._resizeCanvases;
        },
        set: function(value) {
            this._resizeCanvases = value;
            if(value) {
                this.needsDraw = true;
            }
        }
    },

    _updatedStage: { value: false },

    updatedStage: {
        get: function() {
            return this._updatedStage;
        },
        set: function(value) {
            this._updatedStage = value;
            if(value) {
                this.needsDraw = true;
            }
        }
    },

    _currentDocumentStageView: {
        value: "front"
    },

    currentDocumentStageView: {
        get: function() {
            return this._currentDocumentStageView;
        },
        set: function(value) {
            if(this._currentDocumentStageView !== value) {
                this._currentDocumentStageView = value;
                this.setStageView(this.currentDocumentStageView);
            }
        }
    },

    contextMenu: {
        value: false
    },

    /** MAIN CANVASES **/
    // selection bounds, 3d normals and the overall 3d selection box use this canvas
    _canvas: {
        value: null,
        serializable: true
    },

    canvas: {
        get: function() {
            return this._canvas;
        }
    },

    _context: { value: null },
    context: { get: function() { return this._context; } },

    _layoutCanvas: {
        value: null,
        serializable: true
    },

    layoutCanvas: {
        get: function() {
            return this._layoutCanvas;
        }
    },

    _gridCanvas: {
        value: null,
        serializable: true
    },

    gridCanvas: {
        get: function() {
            return this._gridCanvas;
        }
    },

    _gridContext: { value: null },
    gridContext: { get: function() { return this._gridContext; } },

    _drawingCanvas: {
        value: null,
        serializable: true
    },

    drawingCanvas: {
        get: function() {
            return this._drawingCanvas;
        }
    },

    _drawingContext: { value: null },
    drawingContext: { get: function() { return this._drawingContext; } },

    _clickPoint: { value: { x: { value: null }, y: { value: null } } },

    stageDeps: {
        value: null,
        serializable: true
    },

    layout: {
        value: null,
        serializable: true
    },

    textTool: {
        value: null,
        serializable: true
    },

    focusManager: {
        value: null,
        serializable: true
    },

    // We will set this to false while moving objects to improve performance
    showSelectionBounds: { value: true },

    _viewport:              { value: null },
    _documentOffsetLeft:    { value: 0 },
    _documentOffsetTop:     { value: 0 },
    _scrollLeft:            { value: 0 },
    _scrollTop:             { value: 0 },
    _userContentLeft:       { value: 0 },
    _userContentTop:        { value: 0 },
    _userContentBorder:     { value: 0 },

    viewport: {
        get: function () { return this._viewport; },
        set: function(value) { this._viewport = value; }
    },

    documentOffsetLeft: {
        get: function() { return this._documentOffsetLeft; },
        set: function(value) { this._documentOffsetLeft = value; }
    },

    documentOffsetTop: {
        get: function() { return this._documentOffsetTop },
        set: function(value) { this._documentOffsetTop = value; }
    },

    scrollLeft: {
        get: function() { return this._scrollLeft; }
    },

    scrollTop: {
        get: function() { return this._scrollTop; }
    },

    userContentLeft: {
        get: function() { return this._userContentLeft; },
        set: function(value) { this._userContentLeft = value;}
    },

    userContentTop: {
        get: function() { return this._userContentTop; },
        set: function(value) { this._userContentTop = value;}
    },

    userContentBorder: {
        get: function() { return this._userContentBorder; },
        set: function(value) { this._userContentBorder = value; }
    },

    _currentDocument: {
        value : null
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            if(!this._currentDocument && value.currentView === "design") {
                this.showRulers();
                this.hideCanvas(false);
            }

            if(this.currentDocument && (this.currentDocument.currentView === "design")) {
                this.currentDocument.model.scrollLeft = this._scrollLeft;
                this.currentDocument.model.scrollTop = this._scrollTop;
                this.currentDocument.model.userPaddingLeft = this._userPaddingLeft;
                this.currentDocument.model.userPaddingTop = this._userPaddingTop;
                this.currentDocument.model.documentOffsetLeft = this._documentOffsetLeft;
                this.currentDocument.model.documentOffsetTop = this._documentOffsetTop;
                this.currentDocument.model.userContentLeft = this._userContentLeft;
                this.currentDocument.model.userContentTop = this._userContentTop;
                this.currentDocument.model.templateLeft = this.templateLeft;
                this.currentDocument.model.templateTop = this.templateTop;
                this.currentDocument.model.minLeftElement = this.minLeftElement;
                this.currentDocument.model.minTopElement = this.minTopElement;

                //call configure false with the old document on the selected tool to tear down down any temp. stuff
                this.application.ninja.toolsData.selectedToolInstance._configure(false);
            } else if(this.currentDocument && (this.currentDocument.currentView === "code")) {
                this.switchedFromCodeDoc = true;   // Switching from code document affects stage's size and scrollbar
            }

            this._currentDocument = value;

            if(!value) {
                this.hideRulers();
                this.hideCanvas(true);
                drawUtils._eltArray.length = 0;
                drawUtils._planesArray.length = 0;
            } else if(this._currentDocument.currentView === "design") {
                this.restoreAllPanels(this.switchedFromCodeDoc);
                this.switchedFromCodeDoc = false;
                this.hideCanvas(false);
                this.showRulers();

                this.clearAllCanvas();
                this.initWithDocument();
            } else {
                this.collapseAllPanels();
                this.hideCanvas(true);
                this.hideRulers();
            }
        }
    },

    _userPaddingLeft: { value: 0 },
    _userPaddingTop: { value: 0 },

    templateLeft: { value: 0 },
    templateTop: { value: 0 },

    // keep track of the elements that determine the minimum left and top scrollable amount
    minLeftElement: { value: null },
    minTopElement: { value: null },

    userPaddingLeft: {
        get: function() { return this._userPaddingLeft; },
        set: function(value) {
            this._userPaddingLeft = value;
            this._documentOffsetLeft = -value;
            this.currentDocument.model.documentRoot.ownerDocument.getElementsByTagName("HTML")[0].style["padding-left"] = -value + "px";
            this.userContentLeft = this._documentOffsetLeft - this._scrollLeft;
            this.updatedStage = true;
        }
    },

    userPaddingTop: {
        get: function() { return this._userPaddingTop; },
        set: function(value) {
            this._userPaddingTop = value;
            this._documentOffsetTop = -value;
            this.currentDocument.model.documentRoot.ownerDocument.getElementsByTagName("HTML")[0].style["padding-top"] = -value + "px";
            this.userContentTop = this._documentOffsetTop - this._scrollTop;
            this.updatedStage = true;
        }
    },

    willDraw: {
        value: function() {
            if(this.resizeCanvases) {
                // TODO GET THE SCROLL SIZE FROM THE CSS -- 11 px
                this._canvas.width = this._layoutCanvas.width = this._drawingCanvas.width = this._gridCanvas.width = this.bindingView.width = this.element.offsetWidth - 11;
                this._canvas.height = this._layoutCanvas.height = this._drawingCanvas.height = this._gridCanvas.height =  this.bindingView.height = this.element.offsetHeight - 11;// - 26 - 26;
                // Hack for now until a full component
                this.layout.draw();
                if(this.currentDocument && (this.currentDocument.currentView === "design")) {
                    this.layout.draw3DInfo(true);
                }
            } else if(this.updatedStage) {
                this.layout.draw();
                this.layout.draw3DInfo(true);
            }
        }
    },

    didDraw: {
        value: function() {
            this.resizeCanvases = false;
            this.updatedStage = false;
        }
    },

    prepareForDraw: {
        value: function() {

            this._context = this._canvas.getContext("2d");
            this._drawingContext= this._drawingCanvas.getContext("2d");
            this._gridContext= this._gridCanvas.getContext("2d");

            // Setup event listeners
            this._drawingCanvas.addEventListener("mousedown", this, false);
            this._drawingCanvas.addEventListener("mouseup", this, false);
            this._drawingCanvas.addEventListener("dblclick", this, false);
            this._drawingCanvas.addEventListener("mousewheel", this, false);

            // Hide the canvas
            this.hideCanvas(true);

            this.eventManager.addEventListener( "enableStageMove", this, false);
            this.eventManager.addEventListener( "disableStageMove", this, false);

            this.eventManager.addEventListener( "selectionChange", this, false);
            this.eventManager.addEventListener( "elementChanging", this, false);
            this.eventManager.addEventListener( "elementChange", this, false);

            this.addPropertyChangeListener("currentDocument.model.domContainer", this, true);
//            this.addPropertyChangeListener("currentDocument.model.domContainer", this);

        }
    },

    initWithDocument: {
        value: function() {
            var model = this.currentDocument.model,
                designView = this.currentDocument.model.views.design,
                didSwitch = false;

            if(model.scrollLeft != null) {
                didSwitch = true;
                this._userPaddingLeft = this.currentDocument.model.userPaddingLeft;
                this._userPaddingTop = this.currentDocument.model.userPaddingTop;
                this._documentOffsetLeft = this.currentDocument.model.documentOffsetLeft;
                this._documentOffsetTop  = this.currentDocument.model.documentOffsetTop;
                this._userContentLeft = this.currentDocument.model.userContentLeft;
                this._userContentTop = this.currentDocument.model.userContentTop;
                this._scrollLeft = this.currentDocument.model.scrollLeft;
                this._scrollTop = this.currentDocument.model.scrollTop;
                this.templateLeft = this.currentDocument.model.templateLeft;
                this.templateTop = this.currentDocument.model.templateTop;
                this.minLeftElement = this.currentDocument.model.minLeftElement;
                this.minTopElement = this.currentDocument.model.minTopElement;
            } else {
                this._userPaddingLeft = 0;
                this._userPaddingTop = 0;
                this._documentOffsetLeft = 0;
                this._documentOffsetTop  = 0;
                this._userContentLeft = 0;
                this._userContentTop = 0;
                this._scrollLeft = 0;
                this._scrollTop = 0;
                this.templateLeft = 0;
                this.templateTop = 0;
                this.minLeftElement = null;
                this.minTopElement = null;
            }

            // Recalculate the canvas sizes because of splitter resizing
            this._canvas.width = this._layoutCanvas.width = this._drawingCanvas.width = this._gridCanvas.width = this.bindingView.width = this.element.offsetWidth - 11 ;
            this._canvas.height = this._layoutCanvas.height = this._drawingCanvas.height = this._gridCanvas.height = this.bindingView.height = this.element.offsetHeight - 11;

            designView.iframe.contentWindow.addEventListener("scroll", this, false);

            this.addPropertyChangeListener("appModel.show3dGrid", this, false);

            this.initialize3DOnOpenDocument(!didSwitch);

            if(designView._template) {
                var initialLeft = parseInt((this.canvas.width - designView._template.size.width)/2);
                var initialTop = parseInt((this.canvas.height - designView._template.size.height)/2);
                if(initialLeft > this.documentOffsetLeft) {
                    this.userPaddingLeft = -initialLeft;
                    this.templateLeft = -initialLeft;
                }
                if(initialTop > this.documentOffsetTop) {
                    this.userPaddingTop = -initialTop;
                    this.templateTop = -initialTop;
                }
            }

            if(didSwitch) {
                this.currentDocument.model.views.design.document.body.scrollLeft = this.currentDocument.model.scrollLeft;
                this.currentDocument.model.views.design.document.body.scrollTop = this.currentDocument.model.scrollTop;
                this.handleScroll();
            } else {
                this.centerStage();
            }
            // TODO - We will need to modify this once we support switching between multiple documents
            this.application.ninja.toolsData.selectedToolInstance._configure(true);
        }
    },

    /**
    * Event handler for the change @ 3DGrid
    */
    handleChange: {
        value: function(notification) {
            if("appModel.show3dGrid" === notification.currentPropertyPath) {
                if(this.appModel.show3dGrid) {

                    drawUtils.drawXY = true;
                    this.stageDeps.snapManager.updateWorkingPlaneFromView();
                    this.updatedStage = true;

                } else {

                    drawUtils.drawXY = false;
                    drawUtils.drawYZ = false;
                    drawUtils.drawXZ = false;
                    this.updatedStage = true;
                }
            }
            /*
            else if(notification.currentPropertyPath === "currentDocument.model.domContainer") {
                if()
            }
            */
        }
    },

    handleWillChange: {
        value: function(notification) {
//            console.log("stage -> container is about to change");
        }
    },

    enableMouseInOut: {
        value: function() {
            document.addEventListener("mouseup", this, true);
            this._drawingCanvas.addEventListener("mouseout", this, false);
            this._drawingCanvas.addEventListener("mouseover", this, false);
        }
    },

    disableMouseInOut: {
        value: function() {
            this._drawingCanvas.removeEventListener("mouseout", this, false);
            this._drawingCanvas.removeEventListener("mouseover", this, false);
        }
    },

    captureMouseup: {
        value: function(event) {
            var target = event._event.target.getAttribute("data-montage-id");

            if(target && target === "drawingCanvas") {
                return true;
            } else {
                this.handleAppMouseUp(event);
                return true;
            }
        }
    },

    handleMouseout: {
        value: function(event) {
            this.outFlag = true;
        }
    },

    handleMouseover : {
        value: function(event) {
            this.outFlag = false;
        }
    },

    handleMousedown: {
        value: function(event) {

            // Increase the canvas to cover the scroll bars
            this._drawingCanvas.height = this._drawingCanvas.height + 11;
            this._drawingCanvas.width = this._drawingCanvas.width + 11;

            // Call the focus manager to set focus to blur any focus'd elements
            this.focusManager.setFocus();


            var point;
//            event.preventDefault();   // commenting because HTML elements in the IDE are retaining focus
            // If right click set the context menu to true to prevent a mouse up.
            if (event._event.button == 2) {
                this.contextMenu = true;
                return;
            }

            point = webkitConvertPointFromPageToNode(this.canvas, new WebKitPoint(event.pageX, event.pageY));


            this._clickPoint.x = point.x; // event.layerX;
            this._clickPoint.y = point.y; // event.layerY;

            this.enableMouseInOut();

            this.application.ninja.toolsData.selectedToolInstance.downPoint.x = point.x;
            this.application.ninja.toolsData.selectedToolInstance.downPoint.y = point.y;
            this.application.ninja.toolsData.selectedToolInstance.HandleLeftButtonDown(event);

        }
    },

    handleMouseup: {
        value: function(event) {
            // Restore canvas to un-cover the scroll bars.
            this._drawingCanvas.height = this._drawingCanvas.height - 11;
            this._drawingCanvas.width = this._drawingCanvas.width - 11;
            // If the mouse up comes from dismissing the context menu return

            if(this.contextMenu) {
                this.contextMenu = false;
                return;
            }

            this.disableMouseInOut();
            document.removeEventListener("mouseup", this, true);

            this.application.ninja.toolsData.selectedToolInstance.HandleLeftButtonUp(event);

        }
    },

    handleDblclick: {
        value: function(event) {
            event.preventDefault();
            this.application.ninja.toolsData.selectedToolInstance.HandleDoubleClick(event);
        }
    },

    handleMousewheel: {
        value: function(event) {
            if(event._event.wheelDelta > 0) {
                this.currentDocument.model.views.design.document.body.scrollTop -= 20;
            } else {
                this.currentDocument.model.views.design.document.body.scrollTop += 20;
            }
        }
    },

    /**
     * Enables the MouseMove on Canvas
     */
    handleEnableStageMove: {
        value: function() {
            this._drawingCanvas.addEventListener("mousemove", this, false);
        }
    },

    handleDisableStageMove: {
        value: function() {
            this._drawingCanvas.removeEventListener("mousemove", this, false);
        }
    },

    handleMousemove: {
        value: function(event) {
            this.application.ninja.toolsData.selectedToolInstance.HandleMouseMove(event);
        }
    },

    handleAppMouseUp: {
        value: function(event) {
            if(this.outFlag) {
                this._drawingCanvas.height = this._drawingCanvas.height - 11;
                this._drawingCanvas.width = this._drawingCanvas.width - 11;

                if(this.application.ninja.toolsData.selectedToolInstance.isDrawing) {
                    this.application.ninja.toolsData.selectedToolInstance.HandleLeftButtonUp(event);
                }
                this.disableMouseInOut();
                this.outFlag = false;
            }

            document.removeEventListener("mouseup", this, true);
        }
    },

    handleSelectionChange: {
        value: function(event) {
            // TODO - this is a hack for now because some tools depend on selectionDrawn event for some logic
            if(this.drawNow) {
                this.draw();
                this.drawNow = false;
            } else {
                this.needsDraw = true;
            }
        }
    },

    handleElementChanging: {
        value: function(event) {
            this.needsDraw = true;
        }
    },

    handleElementChange: {
        value: function(event) {
            this.needsDraw = true;
        }
    },

    /**
     Handles the Stage Scroll.
     */
    handleScroll: {
        value: function() {

            this._scrollLeft = this.currentDocument.model.views.design.document.body.scrollLeft;
            this._scrollTop = this.currentDocument.model.views.design.document.body.scrollTop;

            this.userContentLeft = this._documentOffsetLeft - this._scrollLeft;
            this.userContentTop = this._documentOffsetTop - this._scrollTop;

            // Need to clear the snap cache and set up the drag plane
            //snapManager.setupDragPlaneFromPlane( workingPlane );
            this.stageDeps.snapManager._isCacheInvalid = true;
            this.updatedStage = true;
        }
    },


     /**
     * Toggles all Canvas on/off
     */
    hideCanvas: {
        value: function(hide) {

            if(hide) {
                this._canvas.style.visibility = "hidden";
                this._layoutCanvas.style.visibility = "hidden";
                this._drawingCanvas.style.visibility = "hidden";
                this._gridCanvas.style.visibility = "hidden";
            } else {
                this._canvas.style.visibility = "visible";
                this._layoutCanvas.style.visibility = "visible";
                this._drawingCanvas.style.visibility = "visible";
                this._gridCanvas.style.visibility = "visible";
            }
        }
    },

    /**
     * Center the Stage
     */
    centerStage: {
        value: function() {
            var designView = this.currentDocument.model.views.design;
            if(designView._template) {
                designView.document.body.scrollLeft = this._documentOffsetLeft - parseInt((this.canvas.width - designView._template.size.width)/2);
                designView.document.body.scrollTop = this._documentOffsetTop - parseInt((this.canvas.height - designView._template.size.height)/2);
            } else {
                designView.document.body.scrollLeft = this._documentOffsetLeft;
                designView.document.body.scrollTop = this._documentOffsetTop;
            }
            this.handleScroll();
        }
    },

    /**
     * Clears the drawing canvas
     */
    clearDrawingCanvas: {
        value: function() {
            this._drawingContext.clearRect(0, 0, this._drawingCanvas.width, this._drawingCanvas.height);
        }
    },

    clearCanvas: {
        value: function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    clearGridCanvas: {
        value: function() {
            this._gridContext.clearRect(0, 0, this._gridCanvas.width, this._gridCanvas.height);
        }
    },

    clearAllCanvas: {
        value: function() {
            this._drawingContext.clearRect(0, 0, this._drawingCanvas.width, this._drawingCanvas.height);
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this._gridContext.clearRect(0, 0, this._gridCanvas.width, this._gridCanvas.height);
            this.layout.clearCanvas();
        }
    },

    SelectTool: {
        value: function(cursor) {
            this._drawingCanvas.style.cursor = cursor;
            this.clearDrawingCanvas();
        }
    },

    /**
     * GetElement: Returns the element or selectable element under the X,Y coordinates passed as an obj with x,y
     *
     * @param position: mouse event
     * @param selectable (default == null) if true this will return the current container element
     * @return: Returns the element or container or null if the the X,Y hits the exclusion list and tool cannot operate on stage
     */
    getElement: {
        value: function(position, selectable) {
            var point, element,
                docView = this.currentDocument.model.views.design;

            point = webkitConvertPointFromPageToNode(this.canvas, new WebKitPoint(position.pageX - docView.iframe.contentWindow.pageXOffset + this.documentOffsetLeft, position.pageY - docView.iframe.contentWindow.pageYOffset + this.documentOffsetTop));
            element = this.currentDocument.model.views.design.getElementFromPoint(point.x - this.userContentLeft,point.y - this.userContentTop);

//            if(!element) debugger;
            // workaround Chrome 3d bug
            if(this.application.ninja.toolsData.selectedToolInstance._canSnap && this.currentDocument.inExclusion(element) !== -1) {
                point = webkitConvertPointFromPageToNode(this.canvas, new WebKitPoint(position.pageX, position.pageY));
                element = this.getElementUsingSnapping(point);
            }

            if(selectable) {

                if(this.currentDocument.inExclusion(element) !== -1) {
                    return this.currentDocument.model.domContainer;
                }

                var activeContainerId = this.currentDocument.model.domContainer.uuid;
                if(element.parentNode.uuid === activeContainerId) {
                    return element;
                } else {
                    var outerElement = element.parentNode;

                    while(outerElement.parentNode && outerElement.parentNode.uuid !== activeContainerId) {
                        // If element is higher up than current container then return
                        if(outerElement.id === "UserContent") return;
                            // else keep going up the chain
                            outerElement = outerElement.parentNode;
                        }

                    return outerElement;
                }

            } else {
                return element;
            }
        }
    },

    /**
     * getElementUsingSnapping: Returns the object at point using snap manager
     *
     * @param: point
     * @return: Returns the Object in the user document under the point
     */
    getElementUsingSnapping: {
        value: function(point) {
            this.stageDeps.snapManager.enableElementSnap( true );
            var hitRec = this.stageDeps.snapManager.snap(point.x, point.y, true);
            this.stageDeps.snapManager.enableElementSnap( this.stageDeps.snapManager.elementSnapEnabledAppLevel() );
            if (hitRec) {
                return hitRec.getElement();
            } else {
                return null;
            }
        }
    },


    draw: {
        value: function() {
            if(!this.currentDocument) return;

            this.clearCanvas();

            drawUtils.updatePlanes();

            if(this.currentDocument.model.domContainer !== this.currentDocument.model.documentRoot) {
                this.drawDomContainer(this.currentDocument.model.domContainer);
            }

            //TODO Set this variable in the needs draw so that it does not have to be calculated again for each draw for selection change
            if(this.application.ninja.selectedElements.length) {
                // drawUtils.drawSelectionBounds handles the single selection case as well,
                // so we don't have to special-case the single selection case.
                // TODO drawUtils.drawSelectionBounds expects an array of elements.
                // TODO If we use the routine to only draw selection bounds, then we may want to change it
                // TODO to work on _element instead of re-creating a new Array here.
                var selArray = new Array();

                for(var i = 0; this.application.ninja.selectedElements[i];i++) {
                    var curElement = this.application.ninja.selectedElements[i];

                    // Add element to array that is used to calculate 3d-bounding box of all elements
                    selArray.push( curElement );
                    // Draw bounding box around selected item.
                    this.drawElementBoundingBox(curElement);

                    // Draw the element normal
                    drawUtils.drawElementNormal(curElement);
                }


                if(this.showSelectionBounds && this.application.ninja.selectedElements.length > 1) {
                    drawUtils.drawSelectionBounds( selArray );
                }
            }

            NJevent("selectionDrawn");
        }

    },

    /**
     * draw3DSelectionRectangle -- Draws a 3D rectangle used for marquee selection
     *                               Uses the _canvasDrawingPrefs for line thickness and color
     *
     * @params: x, y, w, h
     */
    draw3DSelectionRectangle: {
        value:function(x0,y0, x1,y1, x2,y2, x3,y3) {
//            this.clearCanvas();
            this.clearDrawingCanvas();
            this._drawingContext.strokeStyle = this._canvasDrawingPrefs.color;
            this._drawingContext.lineWidth = this._canvasDrawingPrefs.thickness;

            //this._drawingContext.strokeRect(x,y,w,h);
            this._drawingContext.beginPath();
            this._drawingContext.moveTo( x0 + 0.5, y0 + 0.5 );
            this._drawingContext.lineTo( x1 + 0.5, y1 + 0.5 );
            this._drawingContext.lineTo( x2 + 0.5, y2 + 0.5 );
            this._drawingContext.lineTo( x3 + 0.5, y3 + 0.5 );
            this._drawingContext.lineTo( x0 + 0.5, y0 + 0.5 );

            this._drawingContext.closePath();
            this._drawingContext.stroke();

            this._drawingContext.font = "10px sans-serif";
            this._drawingContext.textAlign = "right";

            // GET USER CONTENT COORDINATES
            var userCoor = this.toUserContentCoordinates(x0, y0);

            var textWidth = this._drawingContext.measureText(userCoor[0]).width;
            this._drawingContext.fillText("X: " + Math.round(userCoor[0]), x0+textWidth+4, y0 - 5);
            this._drawingContext.fillText("Y: " + Math.round(userCoor[1]), x0-5, y0+10);

            // When in 'Shift Mode' there is no Mouse Position for that event
            var txtX, txtY = 0;
            var point = webkitConvertPointFromPageToNode(this.canvas, new WebKitPoint(event.pageX, event.pageY));
            (point.x) ? txtX = point.x : txtX = this.application.ninja.toolsData.selectedToolInstance.downPoint.x;
            (point.y) ? txtY = point.y : txtY = this.application.ninja.toolsData.selectedToolInstance.downPoint.y;


            var h = Math.round(Math.abs(y2-y0));
            var w = Math.round(Math.abs(x2-x0));
            this._drawingContext.fillText("H: " + h, txtX + 38, txtY - 4);
            this._drawingContext.fillText("W: " + w, txtX - 5, txtY + 12);
        }
    },

    /**
     * Draws selection highlight and reg. point for a given element
     */
    drawElementBoundingBox: {
        value: function(elt) {
            this.stageDeps.viewUtils.setViewportObj( elt );
            var bounds3D = this.stageDeps.viewUtils.getElementViewBounds3D( elt );

            // convert the local bounds to the world

//            for (var j=0;  j<4;  j++) {
//                bounds3D[j] = this.localToGlobal(bounds3D, j, elt);
//            }

            var zoomFactor = 1;
            if (this._viewport && this._viewport.style && this._viewport.style.zoom) {
                zoomFactor = Number(this._viewport.style.zoom);
            }

            var tmpMat = this.stageDeps.viewUtils.getLocalToGlobalMatrix( elt );
            for (var j=0;  j<4;  j++) {
                var localPt = bounds3D[j];
                var tmpPt = this.stageDeps.viewUtils.localToGlobal2(localPt, tmpMat);

                if(zoomFactor !== 1) {
                    tmpPt = vecUtils.vecScale(3, tmpPt, zoomFactor);

                    tmpPt[0] += this._scrollLeft*(zoomFactor - 1);
                    tmpPt[1] += this._scrollTop*(zoomFactor - 1);
                }
                bounds3D[j] = tmpPt;
            }

            // draw it
            this.context.strokeStyle = this._canvasSelectionPrefs.color;
            this.context.lineWidth = this._canvasSelectionPrefs.thickness;


            this.context.beginPath();

            this.context.moveTo( bounds3D[3][0] + 0.5 ,  bounds3D[3][1] - 0.5 );

            // This more granular approach lets us specify different gaps for the selection around the element
            this.context.lineTo( bounds3D[0][0] - 0.5 ,  bounds3D[0][1] - 0.5 );
            this.context.lineTo( bounds3D[1][0] - 0.5 ,  bounds3D[1][1] + 0.5 );
            this.context.lineTo( bounds3D[2][0] + 0.5  ,  bounds3D[2][1] + 0.5 );
            this.context.lineTo( bounds3D[3][0] + 0.5  ,  bounds3D[3][1] + 0.5 );

            this.context.closePath();
            this.context.stroke();
        }
    },


    drawDomContainer: {
        value: function(elt) {


            this.stageDeps.viewUtils.setViewportObj( elt );
            var bounds3D = this.stageDeps.viewUtils.getElementViewBounds3D( elt );

            // convert the local bounds to the world



            var zoomFactor = 1;
            if (this._viewport && this._viewport.style && this._viewport.style.zoom) {
                zoomFactor = Number(this._viewport.style.zoom);
            }

            var tmpMat = this.stageDeps.viewUtils.getLocalToGlobalMatrix( elt );
            for (var j=0;  j<4;  j++) {
                var localPt = bounds3D[j];
                var tmpPt = this.stageDeps.viewUtils.localToGlobal2(localPt, tmpMat);

                if(zoomFactor !== 1) {
                    tmpPt = vecUtils.vecScale(3, tmpPt, zoomFactor);

                    tmpPt[0] += this._scrollLeft*(zoomFactor - 1);
                    tmpPt[1] += this._scrollTop*(zoomFactor - 1);
                }
                bounds3D[j] = tmpPt;
            }

            // Draw 3 outlines
//            for(var i = 0; i < 3)

            this.context.save();
            // draw it
            this.context.strokeStyle = "#ff0000";
            this.context.lineWidth = 1;


            this.context.beginPath();

            this.context.moveTo( bounds3D[3][0] + 0.5 ,  bounds3D[3][1] - 0.5 );

            // This more granular approach lets us specify different gaps for the selection around the element
            this.context.lineTo( bounds3D[0][0] - 0.5 ,  bounds3D[0][1] - 0.5 );
            this.context.lineTo( bounds3D[1][0] - 0.5 ,  bounds3D[1][1] + 0.5 );
            this.context.lineTo( bounds3D[2][0] + 0.5  ,  bounds3D[2][1] + 0.5 );
            this.context.lineTo( bounds3D[3][0] + 0.5  ,  bounds3D[3][1] + 0.5 );

            this.context.closePath();
            this.context.stroke();

            this.context.restore();

/*

            this.context.save();
            // draw it
            this.context.strokeStyle = "rgba(0,11,61,0.8)";
            this.context.lineWidth = 1;


            this.context.beginPath();

            this.context.moveTo( bounds3D[3][0] + 1.5 ,  bounds3D[3][1] - 1.5 );

            // This more granular approach lets us specify different gaps for the selection around the element
            this.context.lineTo( bounds3D[0][0] - 1.5 ,  bounds3D[0][1] - 1.5 );
            this.context.lineTo( bounds3D[1][0] - 1.5 ,  bounds3D[1][1] + 1.5 );
            this.context.lineTo( bounds3D[2][0] + 1.5  ,  bounds3D[2][1] + 1.5 );
            this.context.lineTo( bounds3D[3][0] + 1.5  ,  bounds3D[3][1] + 1.5 );

            this.context.closePath();
            this.context.stroke();

            this.context.restore();


            this.context.save();
            // draw it
            this.context.strokeStyle = "rgba(255,0,0,0.3)";
            this.context.lineWidth = 1;


            this.context.beginPath();

            this.context.moveTo( bounds3D[3][0] + 2.5 ,  bounds3D[3][1] - 2.5 );

            // This more granular approach lets us specify different gaps for the selection around the element
            this.context.lineTo( bounds3D[0][0] - 2.5 ,  bounds3D[0][1] - 2.5 );
            this.context.lineTo( bounds3D[1][0] - 2.5 ,  bounds3D[1][1] + 2.5 );
            this.context.lineTo( bounds3D[2][0] + 2.5  ,  bounds3D[2][1] + 2.5 );
            this.context.lineTo( bounds3D[3][0] + 2.5  ,  bounds3D[3][1] + 2.5 );

            this.context.closePath();
            this.context.stroke();

            this.context.restore();
            */
        }
    },

    /**
     * draw3DProjectedAndUnprojectedRectangles -- Draws a 3D rectangle used for marquee selection.
     *                                              Draws a second rectangle to indicate the projected
     *                                              location of the created geometry
     *                                              Uses the _canvasDrawingPrefs for line thickness and color
     *
     * @params: x, y, w, h
     */
    draw3DProjectedAndUnprojectedRectangles: {
        value:function(unProjPts,  projPts) {
            this.clearDrawingCanvas();
            this._drawingContext.strokeStyle = this._canvasDrawingPrefs.color;
            this._drawingContext.lineWidth = this._canvasDrawingPrefs.thickness;

            this._drawingContext.beginPath();
            var x0 = unProjPts[0][0],       y0 = unProjPts[0][1],
                x1 = unProjPts[1][0],       y1 = unProjPts[1][1],
                x2 = unProjPts[2][0],       y2 = unProjPts[2][1],
                x3 = unProjPts[3][0],       y3 = unProjPts[3][1];
            this._drawingContext.moveTo( x0 + 0.5, y0 + 0.5 );
            this._drawingContext.lineTo( x1 + 0.5, y1 + 0.5 );
            this._drawingContext.lineTo( x2 + 0.5, y2 + 0.5 );
            this._drawingContext.lineTo( x3 + 0.5, y3 + 0.5 );
            this._drawingContext.lineTo( x0 + 0.5, y0 + 0.5 );

            this._drawingContext.closePath();
            this._drawingContext.stroke();

            this.stageDeps.snapManager.drawDashedLine( projPts[0], projPts[1], this._drawingContext );
            this.stageDeps.snapManager.drawDashedLine( projPts[1], projPts[2], this._drawingContext );
            this.stageDeps.snapManager.drawDashedLine( projPts[2], projPts[3], this._drawingContext );
            this.stageDeps.snapManager.drawDashedLine( projPts[3], projPts[0], this._drawingContext );

            this._drawingContext.font = "10px sans-serif";
            this._drawingContext.textAlign = "right";

            // GET USER CONTENT COORDINATES
            var userCoor = this.toUserContentCoordinates(x0, y0);

            var textWidth = this._drawingContext.measureText(userCoor[0]).width;
            this._drawingContext.fillText("X: " + Math.round(userCoor[0]), x0+textWidth+4, y0 - 5);
            this._drawingContext.fillText("Y: " + Math.round(userCoor[1]), x0-5, y0+10);

            // When in 'Shift Mode' there is no Mouse Position for that event
            var txtX, txtY = 0;
            var point = webkitConvertPointFromPageToNode(this.canvas, new WebKitPoint(event.pageX, event.pageY));
            (point.x) ? txtX = point.x : txtX = this.application.ninja.toolsData.selectedToolInstance.downPoint.x;
            (point.y) ? txtY = point.y : txtY = this.application.ninja.toolsData.selectedToolInstance.downPoint.y;

            var h = Math.round(Math.abs(y2-y0));
            var w = Math.round(Math.abs(x2-x0));
            this._drawingContext.fillText("H: " + h, txtX + 38, txtY - 4);
            this._drawingContext.fillText("W: " + w, txtX - 5, txtY + 12);
        }
    },

    /**
     * drawLine -- Draws a line in 3D space
     *                               Uses the _canvasDrawingPrefs for line thickness and color
     *
     * @params: x0, y0, x1, y1
     */
    drawLine: {
        value:function(x0, y0, x1, y1, strokeSize, strokeColor) {
            this.clearDrawingCanvas();
            var origStrokeStyle = this._drawingContext.strokeStyle;
            var origLineWidth = this._drawingContext.lineWidth;
            this._drawingContext.strokeStyle = strokeColor;
            this._drawingContext.lineWidth = strokeSize;

            this._drawingContext.beginPath();
            this._drawingContext.moveTo( x0 + 0.5, y0 + 0.5 );
            this._drawingContext.lineTo( x1 + 0.5, y1 + 0.5 );

            this._drawingContext.closePath();
            this._drawingContext.stroke();

            this._drawingContext.font = "10px sans-serif";
            this._drawingContext.textAlign = "right";

            // GET USER CONTENT COORDINATES
            var userCoor = this.toUserContentCoordinates(x0, y0);

            var textWidth = this._drawingContext.measureText(userCoor[0]).width;
            this._drawingContext.fillText("X: " + Math.round(userCoor[0]), x0+textWidth+4, y0 - 5);
            this._drawingContext.fillText("Y: " + Math.round(userCoor[1]), x0-5, y0+10);

            // When in 'Shift Mode' there is no Mouse Position for that event
            var txtX, txtY = 0;
            var point = webkitConvertPointFromPageToNode(this.canvas, new WebKitPoint(event.pageX, event.pageY));
            (point.x) ? txtX = point.x : txtX = this.application.ninja.toolsData.selectedToolInstance.downPoint.x;
            (point.y) ? txtY = point.y : txtY = this.application.ninja.toolsData.selectedToolInstance.downPoint.y;

            var h = Math.round(Math.abs(y1-y0));
            var w = Math.round(Math.abs(x1-x0));
            this._drawingContext.fillText("H: " + h, txtX + 38, txtY - 4);
            this._drawingContext.fillText("W: " + w, txtX - 5, txtY + 12);

            this._drawingContext.strokeStyle = origStrokeStyle;
            this._drawingContext.lineWidth = origLineWidth;
        }
    },

    toUserContentCoordinates: {
        value: function(x,y) {
            return [x - this._userContentLeft, y - this._userContentTop];
        }
    },

    toViewportCoordinates: {
        value: function(x,y) {
            return [x + this._userContentLeft, y + this._userContentTop];
        }
    },

    setStageAsViewport: {
        value: function() {
            this.stageDeps.viewUtils.setViewportObj(this.currentDocument.model.documentRoot);
        }
    },

    setZoom: {
        value: function(value) {
            if(!this._firstDraw)
            {
                var userContent = this.currentDocument.model.documentRoot;
                if (userContent)
                {
                    var w = this._canvas.width,
                        h = this._canvas.height;
                    var globalPt = [w/2, h/2, 0];

                    this.stageDeps.viewUtils.setStageZoom( globalPt,  value/100 );

                    //TODO - Maybe move to mediator.
                    var newVal = value/100.0;
                    if (newVal >= 1)
                        this.currentDocument.model.views.design.iframe.style.zoom = value/100;

                    this.updatedStage = true;

                    NJevent( "zoomChange");
                }
            }
        }
    },

    getPlaneForView:
    {
        value: function( side )
        {
            var plane = [0,0,1,0];
            switch(side)
            {
                case "top":
                    plane = [0,1,0,0];
                    plane[3] = this.currentDocument.model.documentRoot.offsetHeight / 2.0;
                   break;

                case "side":
                    plane = [1,0,0,0];
                    plane[3] = this.currentDocument.model.documentRoot.offsetWidth / 2.0;
                   break;

                case "front":
                    plane = [0,0,1,0];
                    break;

                default:
                    console.log( "unrecognized view in snapManager.getPlaneForView: " + side );
                    break;
            }

            return plane;
        }
    },

    setStageView: {
        value: function(side) {
            var mat,
                currentDoc = this.currentDocument.model.documentRoot,
                isDrawingGrid = this.application.ninja.appModel.show3dGrid;
            // Stage 3d Props.
            currentDoc.elementModel.props3D.ResetTranslationValues();
            currentDoc.elementModel.props3D.ResetRotationValues();


            switch(side){
                case "top":
                    mat = Matrix.RotationX(Math.PI * 270.0/180.0);
                    drawUtils.drawXY = drawUtils.drawYZ = false;
                    drawUtils.drawXZ = isDrawingGrid;
                    break;

                case "side":
                    mat = Matrix.RotationY(Math.PI * 270/180);
                    drawUtils.drawXY = drawUtils.drawXZ = false;
                    drawUtils.drawYZ = isDrawingGrid;
                    break;

                case "front":
                    mat = Matrix.I(4);
                    drawUtils.drawYZ = drawUtils.drawXZ = false;
                    drawUtils.drawXY = isDrawingGrid;
                    break;
            }
            workingPlane = this.getPlaneForView( side );

            this.stageDeps.viewUtils.setMatrixForElement(currentDoc, mat, false);

            drawUtils.setWorkingPlane(workingPlane);

            // Todo: Figure out where to put the DrawHandles
            //stageManagerModule.stageManager._toolsList.action("DrawHandles");

            this.stageDeps.snapManager.updateWorkingPlaneFromView();
        }
    },

    showRulers:{
        value:function(){
            this.application.ninja.rulerTop.style.display = "block";
            this.application.ninja.rulerLeft.style.display = "block";
        }
    },

    hideRulers:{
        value:function(){
            this.application.ninja.rulerTop.style.display = "none";
            this.application.ninja.rulerLeft.style.display = "none";
        }
    },

    collapseAllPanels:{
        value:function(){
            this.application.ninja.panelSplitter.collapse();
            this.application.ninja.timelineSplitter.collapse();
            this.application.ninja.toolsSplitter.collapse();
            this.application.ninja.optionsSplitter.collapse();
        }
    },
    restoreAllPanels:{
        value:function(onSwitchDocument){
            this.application.ninja.panelSplitter.restore(onSwitchDocument);
            this.application.ninja.timelineSplitter.restore(onSwitchDocument);
            this.application.ninja.toolsSplitter.restore(onSwitchDocument);
            this.application.ninja.optionsSplitter.restore(onSwitchDocument);
        }
    },

    initialize3DOnOpenDocument: {
        value: function(adjustScrollOffsets) {

            workingPlane = [0,0,1,0];

            this.viewUtils.setStageElement(this.currentDocument.model.documentRoot);
            this.viewUtils.setRootElement(this.currentDocument.model.documentRoot.parentNode);

            this.snapManager._isCacheInvalid = true;
            this.snapManager.currentStage = this.currentDocument.model.documentRoot;
            this.snapManager.setupDragPlaneFromPlane (workingPlane);

            this.drawUtils.initializeFromDocument(adjustScrollOffsets);
        }
    }

});
