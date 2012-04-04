/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = 	require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    vecUtils = 	require("js/helper-classes/3D/vec-utils").VecUtils;

exports.Stage = Montage.create(Component, {

    // TODO - Need to figure out how to remove this dependency
    // Needed by some tools that depend on selectionDrawn event to set up some logic
    drawNow: { value : false },

    // TO REVIEW
    zoomFactor: {value : 1 },

    _canvasSelectionPrefs:  { value: { "thickness" : 1.0, "color" : "#46a1ff" } },
    _canvasDrawingPrefs:    { value: { "thickness" : 1.0, "color" : "#000" } },
    drawingContextPreferences: { get: function() { return this._canvasDrawingPrefs; } },

    _iframeContainer: { value: null },

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
    _canvas: { value: null },   // selection bounds, 3d normals and the overall 3d selection box use this canvas
    canvas: { get: function() { return this._canvas; } },

    _context: { value: null },
    context: { get: function() { return this._context; } },

    _layoutCanvas: { value: null },
    layoutCanvas: { get: function() { return this._layoutCanvas; } },

    _drawingCanvas: { value: null },
    drawingCanvas: { get: function() { return this._drawingCanvas; } },

    _drawingContext: { value: null },
    drawingContext: { get: function() { return this._drawingContext; } },

    _clickPoint: { value: { x: { value: null }, y: { value: null } } },

    // We will set this to false while moving objects to improve performance
    showSelectionBounds: { value: true },

    _documentRoot:          { value: null },
    _viewport:              { value: null },
    _documentOffsetLeft:    { value: 0 },
    _documentOffsetTop:     { value: 0 },
    _scrollLeft:            { value: 0 },
    _scrollTop:             { value: 0 },
    _userContentLeft:       { value: 0 },
    _userContentTop:        { value: 0 },
    _userContentBorder:     { value: 0 },

    documentRoot: {
        get: function () { return this._documentRoot; },
        set: function(value) { this._documentRoot = value; }
    },

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

    willDraw: {
        value: function() {
            if(this.resizeCanvases) {
                // TODO GET THE SCROLL SIZE FROM THE CSS -- 11 px
                this._canvas.width = this._layoutCanvas.width = this._drawingCanvas.width = this.element.offsetWidth - 11 ;
                this._canvas.height = this._layoutCanvas.height = this._drawingCanvas.height = this.element.offsetHeight - 11;// - 26 - 26;

                // Hack for now until a full component
                this.layout.draw();
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

            this._scrollLeft = this._iframeContainer.scrollLeft;
            this._scrollTop = this._iframeContainer.scrollTop;
            this._userContentLeft = this._documentOffsetLeft - this._scrollLeft + this._userContentBorder;
            this._userContentTop = this._documentOffsetTop - this._scrollTop + this._userContentBorder;

            // TODO: Fix the mouse wheel scroll
            // this._canvas.addEventListener("mousewheel", this, false);

            // Setup event listeners
            this._drawingCanvas.addEventListener("mousedown", this, false);
            this._drawingCanvas.addEventListener("mouseup", this, false);
            this._drawingCanvas.addEventListener("dblclick", this, false);
            this._drawingCanvas.addEventListener("mousewheel", this, false);

            // Hide the canvas
            this.hideCanvas(true);

            this.eventManager.addEventListener( "appMouseUp", this, false);


            this.eventManager.addEventListener( "openDocument", this, false);
            this.eventManager.addEventListener( "enableStageMove", this, false);
            this.eventManager.addEventListener( "disableStageMove", this, false);

            this.eventManager.addEventListener( "selectionChange", this, false);
            this.eventManager.addEventListener( "elementChanging", this, false);
            this.eventManager.addEventListener( "elementChange", this, false);

        }
    },

    // Event details will contain the active document prior to opening a new one
    handleOpenDocument: {
        value: function(evt) {
            
            var prevActiveDocument = evt.detail;
            // Hide current document is one is open
            if(prevActiveDocument) {
                prevActiveDocument.container.style["display"] = "none";
                if(prevActiveDocument.documentType === "htm" || prevActiveDocument.documentType === "html") this.hideCanvas(true);
            }

            this.hideCanvas(false);

            // Recalculate the canvas sizes because of splitter resizing
            this._canvas.width = this._layoutCanvas.width = this._drawingCanvas.width = this.element.offsetWidth - 11 ;
            this._canvas.height = this._layoutCanvas.height = this._drawingCanvas.height = this.element.offsetHeight - 11;

            this._documentRoot = this.application.ninja.currentDocument.documentRoot;
            this._viewport = this.application.ninja.currentDocument.documentRoot.parentNode;

            this.documentOffsetLeft = this._viewport.offsetLeft;
            this.documentOffsetTop = this._viewport.offsetTop;

            // Center the stage
            this.centerStage();

            this._scrollLeft = this._iframeContainer.scrollLeft;
            this._scrollTop = this._iframeContainer.scrollTop;
            this.application.ninja.currentDocument.savedLeftScroll = this._iframeContainer.scrollLeft;
            this.application.ninja.currentDocument.savedTopScroll = this._iframeContainer.scrollTop;

            this.userContentBorder = parseInt(this._documentRoot.elementModel.controller.getProperty(this._documentRoot, "border"));

            this._userContentLeft = this._documentOffsetLeft - this._scrollLeft + this._userContentBorder;
            this._userContentTop = this._documentOffsetTop - this._scrollTop + this._userContentBorder;

            this.application.ninja.currentDocument.iframe.style.opacity = 1.0;

            this._iframeContainer.addEventListener("scroll", this, false);

            // TODO - We will need to modify this once we support switching between multiple documents
            this.application.ninja.toolsData.selectedToolInstance._configure(true);

            this.addEventListener("change@appModel.show3dGrid", this, false);

            this.layout.handleOpenDocument();
        }
    },

    /**
    * Event handler for the change @ 3DGrid
    */
    handleEvent: {
        value: function(e) {
            if(e.type === "change@appModel.show3dGrid") {

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
        }
    },

    enableMouseInOut: {
        value: function() {
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
            // If the mouse up comes from dismissing the context menu return
            if(this.contextMenu) {
                this.contextMenu = false;
                return;
            }

            //this.disableMouseInOut();

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
                this._iframeContainer.scrollTop -= 20;
            } else {
                this._iframeContainer.scrollTop += 20;
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
                if(this.application.ninja.toolsData.selectedToolInstance.isDrawing) {
                    this.application.ninja.toolsData.selectedToolInstance.HandleLeftButtonUp(event);
                }
                this.disableMouseInOut();
                this.outFlag = false;
            }
        }
    },

    handleSelectionChange: {
        value: function(event) {
            // TODO - this is a hack for now because some tools depend on selectionDrawn event for some logic
            if(this.drawNow)
            {
                this.draw();
                this.drawNow = false;
            }
            else
            {
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
            this._scrollLeft = this._iframeContainer.scrollLeft;
            this._scrollTop = this._iframeContainer.scrollTop;

            this.userContentLeft = this._documentOffsetLeft - this._scrollLeft + this._userContentBorder;
            this.userContentTop = this._documentOffsetTop - this._scrollTop + this._userContentBorder;

            // Need to clear the snap cache and set up the drag plane
            //snapManager.setupDragPlaneFromPlane( workingPlane );
            this.stageDeps.snapManager._isCacheInvalid = true;

            this.needsDraw = true;
            this.layout.draw();
            //this._toolsList.action("DrawHandles");

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
            } else {
                this._canvas.style.visibility = "visible";
                this._layoutCanvas.style.visibility = "visible";
                this._drawingCanvas.style.visibility = "visible";

            }
        }
    },

    /**
     * Center the Stage
     */
    centerStage: {
        value: function() {
            this._iframeContainer.scrollLeft = this._documentOffsetLeft - (this._iframeContainer.offsetWidth - this._documentRoot.parentNode.offsetWidth)/2;
            this._iframeContainer.scrollTop = this._documentOffsetTop - (this._iframeContainer.offsetHeight - this._documentRoot.parentNode.offsetHeight)/2;

            this._scrollLeft = this._iframeContainer.scrollLeft;
            this._scrollTop = this._iframeContainer.scrollTop;
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

    SelectTool: {
        value: function(cursor) {
            this._drawingCanvas.style.cursor = cursor;
            this.clearDrawingCanvas();
        }
    },

    /**
     * GetSelectableElement: Returns a selectable object (direct child of current container) at clicked point
     *
     * @param: X,Y
     * @return: Returns the current container if the the X,Y hits an element in the exclusion list
     */
    GetSelectableElement: {
        value: function(pos) {
            var item = this.GetElement(pos);
            if(this.application.ninja.currentDocument.inExclusion(item) !== -1) {
                return this.application.ninja.currentSelectedContainer;
            }
            var activeContainerId = this.application.ninja.currentSelectedContainer.uuid;
            if(item.parentNode.uuid === activeContainerId) {
                return item;
            } else {
                var outerElement = item.parentNode;

                while(outerElement.parentNode && outerElement.parentNode.uuid !== activeContainerId) {
                    // If element is higher up than current container then return
                    if(outerElement.id === "UserContent") return;
                    // else keep going up the chain
                    outerElement = outerElement.parentNode;
                }

                return outerElement;
            }
        }
    },

    /**
     * GetElement: Returns the object under the X,Y coordinates passed as an obj with x,y
     *
     * @param: X,Y
     * @return: Returns the Object or null if the the X,Y hits the exclusion list and tool cannot operate on stage
     */
    GetElement: {
        value: function(pos) {
            var point = webkitConvertPointFromPageToNode(this.canvas, new WebKitPoint(pos.pageX, pos.pageY)),
                elt = this.application.ninja.currentDocument.GetElementFromPoint(point.x + this.scrollLeft,point.y + this.scrollTop);

            // workaround Chrome 3d bug
            if(this.application.ninja.toolsData.selectedToolInstance._canSnap && this.application.ninja.currentDocument.inExclusion(elt) !== -1) {
                return this._getElementUsingSnapping(point);
            } else {
                return elt;
            }
        }
    },

    /**
     * _getElementUsingSnapping: Returns the object at point using snap manager
     *
     * @param: point
     * @return: Returns the Object in the user document under the point
     */
    _getElementUsingSnapping: {
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
            this.clearCanvas();

            drawUtils.updatePlanes();

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
            if (this._viewport.style && this._viewport.style.zoom) {
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

    /**
     * draw3DProjectedAndUnprojectedRectangles -- Draws a 3D rectangle used for marquee selection.
     *												Draws a second rectangle to indicate the projected
     *												location of the created geometry
     *												Uses the _canvasDrawingPrefs for line thickness and color
     *
     * @params: x, y, w, h
     */
    draw3DProjectedAndUnprojectedRectangles: {
        value:function(unProjPts,  projPts) {
            this.clearDrawingCanvas();
            this._drawingContext.strokeStyle = this._canvasDrawingPrefs.color;
            this._drawingContext.lineWidth = this._canvasDrawingPrefs.thickness;

			this._drawingContext.beginPath();
			var	x0 = unProjPts[0][0],		y0 = unProjPts[0][1],
				x1 = unProjPts[1][0],		y1 = unProjPts[1][1],
				x2 = unProjPts[2][0],		y2 = unProjPts[2][1],
				x3 = unProjPts[3][0],		y3 = unProjPts[3][1];
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

    setZoom: {
        value: function(value) {
            if(!this._firstDraw)
            {
                var userContent = this.application.ninja.currentDocument.documentRoot;
                if (userContent)
                {
                    var w = this._canvas.width,
                        h = this._canvas.height;
					var globalPt = [w/2, h/2, 0];

                    this.stageDeps.viewUtils.setStageZoom( globalPt,  value/100 );

                    //TODO - Maybe move to mediator.
					var newVal = value/100.0;
					if (newVal >= 1)
						this.application.ninja.currentDocument.iframe.style.zoom = value/100;

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
 					plane[3] = this.application.ninja.currentDocument.documentRoot.offsetHeight / 2.0;
                   break;

                case "side":
					plane = [1,0,0,0];
 					plane[3] = this.application.ninja.currentDocument.documentRoot.offsetWidth / 2.0;
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
                currentDoc = this.application.ninja.currentDocument.documentRoot,
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

    saveScroll:{
       value: function(){
           this.application.ninja.documentController.activeDocument.savedLeftScroll = this._iframeContainer.scrollLeft;
           this.application.ninja.documentController.activeDocument.savedTopScroll = this._iframeContainer.scrollTop;
       }
   },
   restoreScroll:{
       value: function(){
           this._iframeContainer.scrollLeft = this.application.ninja.documentController.activeDocument.savedLeftScroll;
           this._scrollLeft = this.application.ninja.documentController.activeDocument.savedLeftScroll;
           this._iframeContainer.scrollTop = this.application.ninja.documentController.activeDocument.savedTopScroll;
           this._scrollTop = this.application.ninja.documentController.activeDocument.savedTopScroll;
       }
   }
});