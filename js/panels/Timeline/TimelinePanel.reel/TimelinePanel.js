/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var Layer = require("js/panels/Timeline/Layer.reel").Layer;
var TimelineTrack = require("js/panels/Timeline/TimelineTrack.reel").TimelineTrack;
var nj = require("js/lib/NJUtils").NJUtils;
var ElementMediator = require("js/mediators/element-mediator").ElementMediator;

var TimelinePanel = exports.TimelinePanel = Montage.create(Component, {

    hasTemplate:{
        value:true
    },

    /* === BEGIN: Models === */
    _arrLayers:{
        serializable:true,
        value:[]
    },

    arrLayers:{
        serializable:true,
        get:function () {
            return this._arrLayers;
        },
        set:function (newVal) {
            this._arrLayers = newVal;
            this.needsDraw = true;
            this._cacheArrays();
        }
    },

    _temparrLayers:{
        value:[]
    },

    temparrLayers:{
        get:function () {
            return this._temparrLayers;
        },
        set:function (newVal) {
            this._temparrLayers = newVal;
        }
    },


    _layerRepetition:{
        serializable:true,
        value:null
    },

    layerRepetition:{
        serializable:true,
        get:function () {
            return this._layerRepetition;
        },
        set:function (newVal) {
            this._layerRepetition = newVal;
        }
    },

    _cacheArrays:{
        value:function () {
            if (this._boolCacheArrays) {
                this.application.ninja.currentDocument.tlArrLayers = this.arrLayers;
                this.application.ninja.currentDocument.tlCurrentSelectedContainer=this.application.ninja.currentSelectedContainer;
            }
        }
    },

    // Set to false to skip array caching array sets in current document
    _boolCacheArrays:{
        value:true
    },

    _currentLayerNumber:{
        value:0
    },

    currentLayerNumber:{
        get:function () {
            return this._currentLayerNumber;
        },
        set:function (newVal) {
            if (newVal !== this._currentLayerNumber) {
                this._currentLayerNumber = newVal;
                this._setCurrentLayerNumber();
            }
        }
    },

    _setCurrentLayerNumber:{
        value:function () {
            if (this._boolCacheArrays) {
                this.application.ninja.currentDocument.tllayerNumber = this.currentLayerNumber;
            }
        }
    },

    _currentLayerSelected:{
        value:null
    },
    currentLayerSelected:{
        get:function () {
            return this._currentLayerSelected;
        },
        set:function (newVal) {
            this._currentLayerSelected = newVal;
            this.application.ninja.currentDocument.tlCurrentLayerSelected = newVal;
        }
    },

    _selectedLayerID:{
        value:false
    },
    selectedLayerID:{
        get:function () {
            return this._selectedLayerID;
        },
        set:function (newVal) {
            if (newVal === false) {
                // We are clearing the timeline, so just set the value and return.
                this._selectedLayerID = newVal;
                return;
            }
            if (newVal !== this._selectedLayerID) {
                var selectIndex = this.getLayerIndexByID(newVal);
                this._selectedLayerID = newVal;
                this._captureSelection = true;
                this.selectLayer(selectIndex);
            }
        }
    },

    _millisecondsOffset:{
        value:1000
    },

    millisecondsOffset:{
        get:function () {
            return this._millisecondsOffset;
    },
        set:function (newVal) {
            if (newVal !== this._millisecondsOffset) {
                this._millisecondsOffset= newVal;
                this.drawTimeMarkers();
                NJevent('tlZoomSlider',this);
            }
        }
    },

    tweenarray:{
            value:[],
            writable:true
    },

    tempArray:{
        value:[],
        writable:true
    },

    _masterDuration:{
        serializable:true,
        value:0
    },

    masterDuration:{
        serializable:true,
        get:function () {
            return this._masterDuration;
        },
        set:function (val) {
            this._masterDuration = val;
            this.timebar.style.width = (this._masterDuration / 12) + "px";
        }
    },

    _trackRepetition:{
        serializable:true,
        value:null
    },

    trackRepetition:{
        serializable:true,
        get:function () {
            return this._trackRepetition;
        },
        set:function (newVal) {
            this._trackRepetition = newVal;
        }
    },

    _selectedKeyframes:{
        value:[]
    },

    selectedKeyframes:{
        serializable:true,
        get:function () {
            return this._selectedKeyframes;
        },
        set:function (newVal) {
            this._selectedKeyframes = newVal;
        }
    },

    _selectedTweens:{
        value:[]
    },

    selectedTweens:{
        serializable:true,
        get:function () {
            return this._selectedTweens;
        },
        set:function (newVal) {
            this._selectedTweens = newVal;
        }
    },

    _breadCrumbContainer:{
        value:null
    },

    breadCrumbContainer:{
        get:function () {
            return this._breadCrumbContainer;
        },
        set:function (value) {
            if (this._breadCrumbContainer !== value) {
                this._breadCrumbContainer = value;
                this.LayerBinding();
            }
        }
    },

    _isLayer:{
        value:false
    },

    _firstTimeLoaded:{
        value:true,
        writable:true
    },

    _captureSelection:{
        value:false,
        writable:true
    },

    _openDoc:{
        value:false,
        writable:true
    },

    timeMarkerHolder:{
        value:null
    },
    _dragAndDropHelper : {
    	value: false
    },
    _dragAndDropHelperCoords: {
    	value: false
    },
    _dragAndDropHelperOffset : {
    	value: false
    },
    _dragLayerID : {
    	value: null
    },
    dragLayerID : {
    	get: function() {
    		return this._dragLayerID;
    	},
    	set: function(newVal) {
    		if (newVal !== this._dragLayerID) {
    			this._dragLayerID = newVal;
    		}
    	}
    },
    _dropLayerID : {
    	value: null
    },
    dropLayerID : {
    	get: function() {
    		return this._dropLayerID;
    	},
    	set: function(newVal) {
    		if (newVal !== this._dropLayerID) {
    			this._dropLayerID = newVal;
    			
    			var dragLayerIndex = this.getLayerIndexByID(this.dragLayerID),
    				dropLayerIndex = this.getLayerIndexByID(this.dropLayerID),
    				dragLayer = this.arrLayers[dragLayerIndex];

    			this.arrLayers.splice(dragLayerIndex, 1);
    			this.arrLayers.splice(dropLayerIndex, 0, dragLayer);
    			this.application.ninja.currentDocument.tlArrLayers = this.arrLayers;
    			
    			// Clear for future DnD
    			this._dropLayerID = null;
    			this._dragLayerID = null;
    			
    			// Sometimes, just to be fun, the drop and dragend events don't fire.
    			// So just in case, set the draw routine to delete the helper.
    			this._deleteHelper = true;
    			this.needsDraw = true;
    		}
    	}
    },
    _appendHelper: {
    	value: false
    },
    _deleteHelper: {
    	value: false
    },
    _scrollTracks: {
    	value: false
    },
    /* === END: Models === */
    /* === BEGIN: Draw cycle === */
    prepareForDraw:{
        value:function () {
            this.initTimeline();
            // Bind the event handler for the document change events
            this.eventManager.addEventListener("onOpenDocument", this.handleDocumentChange.bind(this), false);
            this.eventManager.addEventListener("closeDocument", this.handleDocumentChange.bind(this), false);
            this.eventManager.addEventListener("switchDocument", this.handleDocumentChange.bind(this), false);
            
            // Bind drag and drop event handlers
            this.container_layers.addEventListener("dragstart", this.handleLayerDragStart.bind(this), false);
            this.container_layers.addEventListener("dragend", this.handleLayerDragEnd.bind(this), false);
            this.container_layers.addEventListener("dragover", this.handleLayerDragover.bind(this), false);
            this.container_layers.addEventListener("drop", this.handleLayerDrop.bind(this), false);
        }
    },

    willDraw:{
        value:function () {
            if (this._isLayer) {
                this._isLayer = false;
            }
        }
    },
    
    draw: {
    	value: function() {
    		
    		// Drag and Drop:
    		// Do we have a helper to append?
            if (this._appendHelper === true) {
            	this.container_layers.appendChild(this._dragAndDropHelper);
            	this._appendHelper = false;
            }
            // Do we need to move the helper?
    		if (this._dragAndDropHelperCoords !== false) {
    			if (this._dragAndDropHelper !== null) {
    				this._dragAndDropHelper.style.top = this._dragAndDropHelperCoords;
    			}
    			this._dragAndDropHelperCoords = false;
    		}
    		// Do we need to scroll the tracks?
    		if (this._scrollTracks !== false) {
    			this.layout_tracks.scrollTop = this._scrollTracks;
    			this._scrollTracks = false;
    		}
    		// Do we have a helper to delete?
    		if (this._deleteHelper === true) {
    			if (this._dragAndDropHelper === null) {
    				// Problem....maybe a helper didn't get appended, or maybe it didn't get stored.
    				// Try and recover the helper so we can delete it.
    				var myHelper = this.container_layers.querySelector(".timeline-dnd-helper");
    				if (myHelper != null) {
    					this._dragAndDropHelper = myHelper;
    				}
    			}
	            if (this._dragAndDropHelper !== null) {
	            	// We need to delete the helper.  Can we delete it from container_layers?
	            	if (this._dragAndDropHelper && this._dragAndDropHelper.parentNode === this.container_layers) {
	            		this.container_layers.removeChild(this._dragAndDropHelper);
	            		this._dragAndDropHelper = null;
	            		this._deleteHelper = false;
	            	}
	            } 
	            
    		}
    	}
    },
    /* === END: Draw cycle === */
    /* === BEGIN: Controllers === */
    // Create an empty layer template object with minimal defaults and return it for use
    createLayerTemplate:{
        value:function () {
            var returnObj = {};
            
            returnObj.layerData = {};
            returnObj.layerData.layerName = null;
            returnObj.layerData.layerID = null;
            returnObj.layerData.isMainCollapsed = true;
            returnObj.layerData.isPositionCollapsed = true;
            returnObj.layerData.isTransformCollapsed = true;
            returnObj.layerData.isStyleCollapsed = true;
            returnObj.layerData.arrLayerStyles = [];
            returnObj.layerData.arrLayerStyles = [];
            returnObj.layerData.elementsList = [];
            returnObj.layerData.deleted = false;
            returnObj.layerData.isSelected = false;
            returnObj.layerData.layerPosition = null;
            returnObj.layerData.created = false;
            returnObj.layerData.isTrackAnimated = false;
            returnObj.layerData.currentKeyframeRule = null;
            returnObj.layerData.trackPosition = 0;
            returnObj.layerData.arrStyleTracks = [];
            returnObj.layerData.tweens = [];
            returnObj.parentElementUUID = null;
            returnObj.parentElement = null;
            return returnObj;
        }
    },
    
    // Create an array of style objects for an element, for use
    // in creating a new layer
    createLayerStyles : {
    	value: function(ptrElement) {
    		// TODO: Create logic to loop through 
    		// CSS properties on element and build 
    		// array of layer styles for return.
    		// Right now this method just returns an array of one bogus style.
    		
    		var returnArray = [],
    			newStyle = {}, 
    			styleID = "1@0"; // format: layerID + "@" + style counter
    			
            newStyle.styleID = styleID;
			newStyle.whichView = "propval";
			newStyle.editorProperty = "top";
			newStyle.editorValue = 0;
			newStyle.ruleTweener = false;
			newStyle.isSelected = false;
			
			returnArray.push(newStyle);
			
			return returnArray;
    		
    	}
    },
    
    // Create an array of style track objects for an element, for use
    // in creating a new layer
    createStyleTracks : {
    	value: function(ptrElement) {
    		// TODO: Create logic to loop through 
    		// CSS properties on element and build 
    		// array of layer styles for return.
    		// Right now this method just returns an array of one bogus style.
    		
    		var returnArray = [];
			
			returnArray.push("1");
			
			return returnArray;
    		
    	}
    },

    // Bind all document-specific events (pass in true to unbind)
    _bindDocumentEvents : {
        value: function(boolUnbind) {
            var arrEvents = ["deleteLayerClick",
                             "newLayer",
                             "deleteLayer",
                             "elementAdded",
                             "elementsRemoved",
                             "selectionChange"],
                i,
                arrEventsLength = arrEvents.length;

            if (boolUnbind) {
                for (i = 0; i < arrEventsLength; i++) {
                    this.eventManager.removeEventListener(arrEvents[i], this, false);
                }
            } else {
                for (i = 0; i < arrEventsLength; i++) {
                    this.eventManager.addEventListener(arrEvents[i], this, false);
                }
                Object.defineBinding(this, "breadCrumbContainer", {
                    boundObject:this.application.ninja,
                    boundObjectPropertyPath:"currentSelectedContainer",
                    oneway:true
                });
            }
        }
    },

    // Initialize the timeline, runs only once when the timeline component is first loaded
    initTimeline:{
        value:function () {
            this.layout_tracks = this.element.querySelector(".layout-tracks");
            this.layout_markers = this.element.querySelector(".layout_markers");
            this.timeline_leftpane.addEventListener("mousedown", this.timelineLeftPaneMousedown.bind(this), false);
            this.timeline_leftpane.addEventListener("mouseup", this.timelineLeftPaneMouseup.bind(this), false);
            this.layout_tracks.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.user_layers.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.end_hottext.addEventListener("changing", this.updateTrackContainerWidth.bind(this), false);
            this.playhead.addEventListener("mousedown", this.startPlayheadTracking.bind(this), false);
            this.playhead.addEventListener("mouseup", this.stopPlayheadTracking.bind(this), false);
            this.time_markers.addEventListener("click", this.updatePlayhead.bind(this), false);
            this.enablePanel(false);
        }
    },

    // Initialize the timeline for a document.
    // Called when a document is opened (new or existing), or when documents are switched.
    initTimelineForDocument:{
        value:function () {
            var myIndex;
            this.drawTimeMarkers();
            // Document switching
            // Check to see if we have saved timeline information in the currentDocument.
            if (typeof(this.application.ninja.currentDocument.isTimelineInitialized) === "undefined" || this.application.ninja.breadCrumbClick) {
                // No, we have no information stored.  Create it.
                this.application.ninja.currentDocument.isTimelineInitialized = true;
                this.application.ninja.currentDocument.tlArrLayers = [];
                this.application.ninja.currentDocument.tllayerNumber = 0;
                this.application.ninja.currentDocument.tlCurrentSelectedContainer = null;
                this.temparrLayers = [];

                // Are we opening an existing doc?
                if (!this.application.ninja.documentController.creatingNewFile) {
                    // Opening an existing document. Does it have any DOM elements?
                    if(this.application.ninja.breadCrumbClick){
                        var parentNode = this.application.ninja.currentSelectedContainer;
                        for (myIndex = 0; parentNode.children[myIndex]; myIndex++) {
                            this._openDoc = true;
                            this.restoreLayer(parentNode.children[myIndex]);
                        }

                    }else if (this.application.ninja.currentDocument.documentRoot.children[0]) {
                        // Yes, it has DOM elements. Loop through them and create a new object for each.
                        for (myIndex = 0; this.application.ninja.currentDocument.documentRoot.children[myIndex]; myIndex++) {
                            this._openDoc = true;
                            this.restoreLayer(this.application.ninja.currentDocument.documentRoot.children[myIndex]);
                        }
                    }
                    // Feed the new array of objects into the repetitions.
                    this.arrLayers = this.temparrLayers;
                }else if(this.application.ninja.breadCrumbClick){
                    var parentNode = this.application.ninja.currentSelectedContainer;
                    for (myIndex = 0; parentNode.children[myIndex]; myIndex++) {
                        this._openDoc = true;
                        this.restoreLayer(parentNode.children[myIndex]);
                    }
                    this.arrLayers = this.temparrLayers;

                }

                // After recreating the tracks and layers, store the result in the currentDocument.
                this.application.ninja.currentDocument.tlArrLayers = this.arrLayers;
                this.application.ninja.currentDocument.tllayerNumber = this.currentLayerNumber;
                this.application.ninja.currentDocument.tlCurrentSelectedContainer=this.application.ninja.currentSelectedContainer;

            } else {
                // we do have information stored.  Use it.
                this._boolCacheArrays = false;
                for (var i = 0; i < this.application.ninja.currentDocument.tlArrLayers.length; i++) {
                    if (this.application.ninja.currentDocument.tlArrLayers[i].layerData.isSelected === true) {
                        this.application.ninja.currentDocument.tlArrLayers[i].layerData._isFirstDraw = true;
                    }
                }
                this.arrLayers = this.application.ninja.currentDocument.tlArrLayers;
                this.currentLayerNumber = this.application.ninja.currentDocument.tllayerNumber;
                this.currentLayerSelected = this.application.ninja.currentDocument.tlCurrentLayerSelected;
                this.application.ninja.currentSelectedContainer=this.application.ninja.currentDocument.tlCurrentSelectedContainer;

            }
        }
    },

    // Clear the currently-displayed document (and its events) from the timeline.
    clearTimelinePanel:{
        value:function () {
            // Remove events
            this._bindDocumentEvents(true);

            // Remove every event listener for every selected tween in the timeline
            this.deselectTweens();

            // Reset visual appearance
            // Todo: Maybe this should be stored per document, so we can persist between document switch?
            this.application.ninja.timeline.playhead.style.left = "-2px";
            this.application.ninja.timeline.playheadmarker.style.left = "0px";
            this.application.ninja.timeline.updateTimeText(0.00);
            this.timebar.style.width = "0px";

            this.currentLayerNumber = 0;
            this.currentLayerSelected = false;
            this.selectedKeyframes = [];
            this.selectedTweens = [];
            this._captureSelection = false;
            this._openDoc = false;
//            this._firstTimeLoaded = true;
            this.end_hottext.value = 25;
            this.updateTrackContainerWidth();
            this.masterDuration = 0;
            // Clear the repetitions
            if (this.arrLayers.length > 0) {
                this.arrLayers = [];
                this.arrLayers.length = 0;
            }
        }
    },

    handleDocumentChange:{
        value:function (event) {
            // Clear the timeline but not the cache
            this._boolCacheArrays = false;
            this.clearTimelinePanel();
            this._boolCacheArrays = true;

            // Rebind the document events for the new document context
            this._bindDocumentEvents();

            // Reinitialize the timeline...but only if there are open documents.
            if (this.application.ninja.documentController._documents.length > 0) {
                this.enablePanel(true);
                this.initTimelineForDocument();

            } else {
                this.enablePanel(false);
            }
        }
    },

    updateTrackContainerWidth:{
        value:function () {
            this.container_tracks.style.width = (this.end_hottext.value * 80) + "px";
            this.master_track.style.width = (this.end_hottext.value * 80) + "px";
            this.time_markers.style.width = (this.end_hottext.value * 80) + "px";
            if (this.timeMarkerHolder) {
                this.time_markers.removeChild(this.timeMarkerHolder);
            }
            this.drawTimeMarkers();
        }
    },

    updateLayerScroll:{
        value:function () {
            this.user_layers.scrollTop = this.layout_tracks.scrollTop;
            this.layout_markers.scrollLeft = this.layout_tracks.scrollLeft;
        }
    },

    startPlayheadTracking:{
        value:function () {
            this.time_markers.onmousemove = this.updatePlayhead.bind(this);
        }
    },

    stopPlayheadTracking:{
        value:function () {
            this.time_markers.onmousemove = null;
        }
    },

    updatePlayhead:{
        value:function (event) {
            var clickedPosition = event.target.offsetLeft + event.offsetX;
            this.playhead.style.left = (clickedPosition - 2) + "px";
            this.playheadmarker.style.left = clickedPosition + "px";
            var currentMillisecPerPixel = Math.floor(this.millisecondsOffset / 80);
            var currentMillisec = currentMillisecPerPixel * clickedPosition;
            this.updateTimeText(currentMillisec);
        }
    },

    handleSelectionChange:{
        value:function () {
            var layerIndex, i = 0, arrLayersLength = this.arrLayers.length;
            this.deselectTweens();
            if (this.application.ninja.selectedElements[0]) {
                for (i = 0; i < arrLayersLength; i++) {
                    if (this.application.ninja.selectedElements[0].uuid === this.arrLayers[i].layerData.elementsList[0].uuid) {
                        layerIndex = this.getLayerIndexByID(this.arrLayers[i].layerData.layerID);
                        this._captureSelection = false;
                        this.selectLayer(layerIndex);
                        this._captureSelection = true;
                    }
                }
            }
        }
    },

    deselectTweens:{
        value:function () {
            for (var i = 0; i < this.selectedTweens.length; i++) {
                this.selectedTweens[i].deselectTween();
            }
            this.selectedTweens = null;
            this.selectedTweens = new Array();
        }
    },

    LayerBinding:{
        value:function (node) {
            var i = 0;

            if (typeof(this.application.ninja.currentDocument.isTimelineInitialized) === "undefined" || (this.application.ninja.breadCrumbClick)) {
                if (this._firstTimeLoaded) {
                    this._firstTimeLoaded = false;
                } else {
                   this._boolCacheArrays = false;
                   this.clearTimelinePanel();
                   this._boolCacheArrays = true;
                   this._bindDocumentEvents();
                   this.initTimelineForDocument();
                   this.application.ninja.breadCrumbClick=false;
                }
            }else{
                this._firstTimeLoaded=false;
            }
        }
    },

    timelineLeftPaneMousedown:{
        value:function (event) {
            var ptrParent = nj.queryParentSelector(event.target, ".container-layer");
            if (ptrParent !== false) {
                var myIndex = this.getActiveLayerIndex();
                this.selectLayer(myIndex, true);
            }
            this._isMousedown = true;
        }
    },

    timelineLeftPaneMouseup:{
        value:function (event) {
			this._isMousedown = false;
        }
    },

    createNewLayer:{
        value:function (object) {
            var hashVariable = 0,
            	newLayerName = "",
                thingToPush = this.createLayerTemplate(),
                myIndex = 0,
                i = 0,
                arrLayersLength = this.arrLayers.length;

            this.currentLayerNumber = this.currentLayerNumber + 1;
            newLayerName = "Layer " + this.currentLayerNumber;
            thingToPush.layerData.layerName = newLayerName;
            thingToPush.layerData.layerID = this.currentLayerNumber;
            thingToPush.parentElement = this.application.ninja.currentSelectedContainer;
            thingToPush.layerData.isSelected = true;
            thingToPush.layerData._isFirstDraw = true;
            thingToPush.layerData.created = true;

            for (i = 0; i < this.arrLayersLength; i++) {
                this.arrLayers[i].layerData.isSelected = false;
                this.arrLayers[i].layerData._isFirstDraw = false;
            }

            if (this.layerRepetition.selectedIndexes) {
                // There is a selected layer, so we need to splice the new layer on top of it.
                myIndex = this.layerRepetition.selectedIndexes[0];
                thingToPush.layerData.layerPosition = myIndex;
                thingToPush.layerData.trackPosition = myIndex;
                this.arrLayers.splice(myIndex, 0, thingToPush);

            } else {
                thingToPush.layerData.layerPosition = myIndex;
                this.arrLayers.splice(myIndex, 0, thingToPush);

            }

            this.selectLayer(myIndex);

        }
    },

    restoreLayer:{
        value:function (ele) {

                var newLayerName, thingToPush = this.createLayerTemplate();

                this.currentLayerNumber = this.currentLayerNumber + 1;
                newLayerName = "Layer " + this.currentLayerNumber;

                if(ele.dataset.storedLayerName){
                    newLayerName = ele.dataset.storedLayerName;
                }
                thingToPush.layerData.layerName = newLayerName;
                thingToPush.layerData.layerID = this.currentLayerNumber;
                thingToPush.parentElementUUID = this.hashKey;
                thingToPush.parentElement = this.application.ninja.currentSelectedContainer;
                
                // Are there styles to add?
                thingToPush.layerData.arrLayerStyles = this.createLayerStyles();
                thingToPush.layerData.arrStyleTracks = this.createStyleTracks();

                if (this._openDoc) {
                    thingToPush.layerData.elementsList.push(ele);
                }

                this.temparrLayers.splice(0, 0, thingToPush);
                thingToPush.layerData.trackPosition = this.temparrLayers.length - 1;
                thingToPush.layerData.layerPosition = this.temparrLayers.length - 1;

                this._openDoc = false;

//            }
        }
    },

    deleteLayer:{
        value:function (object) {
            // Only delete a selected layer.  If no layer is selected, do nothing.
            if (this.layerRepetition.selectedIndexes.length > 0) {
                // Delete the selected layer.
                var myIndex = this.layerRepetition.selectedIndexes[0];
                this.arrLayers.splice(myIndex, 1);
                var selectIndex = this.arrLayers.length;
                this.selectLayer(selectIndex-1);
            }
        }
    },

    handleElementAdded:{
        value:function() {
            this.createNewLayer();
            this.currentLayerSelected.layerData.elementsList.push(this.application.ninja.selectedElements[0]);
            this.currentLayerSelected.layerData.elementsList[0].dataset.storedLayerName = this.currentLayerSelected.layerData.layerName;
        }
    },

    handleElementsRemoved:{
        value:function () {
            this.deleteLayer();
        }
    },

    drawTimeMarkers:{
        value:function () {
            this.timeMarkerHolder = document.createElement("div");

            if(this.time_markers.children[0]){
               this.time_markers.removeChild(this.time_markers.children[0]);
            }

            this.time_markers.appendChild(this.timeMarkerHolder);
            var i;
            var totalMarkers = Math.floor(this.time_markers.offsetWidth / 80);
            for (i = 0; i < totalMarkers; i++) {
                var timeMark = document.createElement("div");
                var markValue = this.calculateTimeMarkerValue(i);
                timeMark.className = "timemark";
                timeMark.innerHTML = markValue;
                this.timeMarkerHolder.appendChild(timeMark);
            }
        }
    },

    calculateTimeMarkerValue:{
        value:function (currentMarker) {
            var currentMilliseconds = currentMarker * this.millisecondsOffset;
            return this.convertMillisecondsToTime(currentMilliseconds);
        }
    },

    updateTimeText:{
        value:function (millisec) {
            this.timetext.innerHTML = this.convertMillisecondsToTime(millisec);
        }
    },

    convertMillisecondsToTime:{
        value:function(millisec){
            var timeToReturn;
            var sec = (Math.floor((millisec / 1000))) % 60;
            var min = (Math.floor((millisec / 1000) / 60)) % 60;
            var milliSeconds = String(Math.round(millisec / 10));
            var returnMillisec = milliSeconds.slice(milliSeconds.length - 2, milliSeconds.length);
            var returnSec;
            var returnMin;
            if (sec < 10) {
                returnSec = "0" + sec;
            } else {
                returnSec = sec;
            }
            if (min < 10) {
                returnMin = "0" + min;
            } else {
                returnMin = min;
            }
            if (returnMillisec == "0") {
                returnMillisec = "0" + returnMillisec;
            }
            timeToReturn = returnMin + ":" + returnSec + ":" + returnMillisec;
            return timeToReturn;
        }
    },

    createLayerHashTable:{
        value:function (key, value) {
            var hashLayerObject;
            hashLayerObject = Object.create(Object.prototype, {
                counter:{
                    value:0,
                    writable:true
                },

                setItem:{
                    value:function (key, value, index) {
                        if (hashLayerObject[key] === undefined) {
                            hashLayerObject[key] = {};
                        }
                        if (hashLayerObject[key][index] !== undefined) {


                            for (this.counter = index; hashLayerObject[key][this.counter]; this.counter++) {
                            }

                            for (; this.counter !== index; this.counter--) {
                                hashLayerObject[key][this.counter] = hashLayerObject[key][this.counter - 1];
                            }
                        }
                        hashLayerObject[key][index] = value;
                        this.counter = 0;
                    }
                },

                getItem:{
                    value:function (key) {
                        return hashLayerObject[key];
                    }
                }
            });
            return hashLayerObject;
        }
    },

    selectLayer:{
        value:function (layerIndex, userSelection) {

            var i = 0;
            var arrLayersLength = this.arrLayers.length;

            if (this.selectedKeyframes) {
                this.deselectTweens();
            }

            for (i = 0; i < arrLayersLength; i++) {
                if (i === layerIndex) {
                    this.arrLayers[i].layerData.isSelected = true;
                } else {
                    this.arrLayers[i].layerData.isSelected = false;
                }
                
                this.triggerLayerBinding(i);
            }

            this.layerRepetition.selectedIndexes = [layerIndex];
            this.currentLayerSelected = this.arrLayers[layerIndex];

            if (userSelection) {
                if (this._captureSelection) {

                    if (this.currentLayerSelected.layerData.elementsList.length >= 1) {
                        this.application.ninja.selectionController.selectElements(this.currentLayerSelected.layerData.elementsList);
                    } else {
                        this.application.ninja.selectionController.executeSelectElement();
                    }

                }
                this._captureSelection = true;
            }
        }
    },

    getLayerIndexByID:{
        value:function (layerID, tempArr) {
            var i = 0,
                returnVal = false,
                arrLayersLength = this.arrLayers.length;

            if (tempArr) {
                var tempArrLength = this.temparrLayers.length;

                for (i = 0; i < tempArrLength; i++) {
                    if (this.temparrLayers[i].layerData.layerID === layerID) {
                        returnVal = i;
                    }
                }

            } else {
                for (i = 0; i < arrLayersLength; i++) {
                    if (this.arrLayers[i].layerData.layerID === layerID) {
                        returnVal = i;
                    }
                }
            }
            return returnVal;
        }
    },

    getLayerIndexByName:{
        value:function (layerName) {
            var i = 0,
                returnVal = false,
                arrLayersLength = this.arrLayers.length;

            for (i = 0; i < arrLayersLength; i++) {
                if (this.arrLayers[i].layerData.layerName === layerName) {
                    returnVal = i;
                }
            }
            return returnVal;
        }
    },

    getActiveLayerIndex:{
        value:function () {
            var i = 0,
                returnVal = false,
                arrLayersLength = this.arrLayers.length;
            for (i = 0; i < arrLayersLength; i++) {
                if (this.arrLayers[i].layerData.isActive === true) {
                    returnVal = i;
                    this.arrLayers[i].layerData.isActive = false;
                }
            }
            return returnVal;
        }
    },

    enablePanel:{
        value:function (boolEnable) {
            if (boolEnable) {
                this.timeline_disabler.style.display = "none";
            } else {
                this.timeline_disabler.style.display = "block";
            }
        }
    },
    // Trigger the layer/track data binding
    triggerLayerBinding : {
    	value: function(intIndex) {
    		if (this.arrLayers[intIndex].layerData.triggerBinding === true) {
    			this.arrLayers[intIndex].layerData.triggerBinding = false;
    		} else {
    			this.arrLayers[intIndex].layerData.triggerBinding = true;
    		}
    	}
    },
    
    handleLayerDragStart : {
    	value: function(event) {
            var dragIcon = document.createElement("img");
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('Text', this.identifier);
            // dragIcon.src = "/images/transparent.png";
            dragIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAA1JREFUGFdj+P//PwMACPwC/ohfBuAAAAAASUVORK5CYII="
            dragIcon.width = 1;
            event.dataTransfer.setDragImage(dragIcon, 0, 0);
            
            // Clone the element we're dragging
            this._dragAndDropHelper = event.target.cloneNode(true);
            this._dragAndDropHelper.style.opacity = 0.8;
            this._dragAndDropHelper.style.position = "absolute";
            this._dragAndDropHelper.style.top = "0px";
            this._dragAndDropHelper.style.left = "0px";
            this._dragAndDropHelper.style.zIndex = 700;
            
            this._dragAndDropHelper.style.width = window.getComputedStyle(this.container_layers, null).getPropertyValue("width");
            this._dragAndDropHelper.classList.add("timeline-dnd-helper");
            
            // Get the offset 
    		var findYOffset = function(obj) {
				var curleft = curtop = 0;
				
				if (obj.offsetParent) {
					do {
							curleft += obj.offsetLeft;
							curtop += obj.offsetTop;
				
						} while (obj = obj.offsetParent);
				}
				return curtop;
    		}
    		this._dragAndDropHelperOffset = findYOffset(this.container_layers);
    		this._appendHelper = true;
    		this._deleteHelper = false;
    	}
    },
    handleLayerDragover: {
    	value: function(event) {
    		var currPos = 0,
    			myScrollTest = ((event.y - (this._dragAndDropHelperOffset - this.user_layers.scrollTop)) + 28) - this.user_layers.scrollTop;
    		if ((myScrollTest < 60) && (this.user_layers.scrollTop >0)) {
    			this._scrollTracks = (this.user_layers.scrollTop - 10)
    		}
    		if ((myScrollTest < 50) && (this.user_layers.scrollTop >0)) {
    			this._scrollTracks = (this.user_layers.scrollTop - 20)
    		}
    		if ((myScrollTest > (this.user_layers.clientHeight + 10))) {
    			this._scrollTracks = (this.user_layers.scrollTop + 10)
    		}
    		if ((myScrollTest > (this.user_layers.clientHeight + 20))) {
    			this._scrollTracks = (this.user_layers.scrollTop + 20)
    			
    		}
    		currPos = event.y - (this._dragAndDropHelperOffset - this.user_layers.scrollTop)- 28;
    		this._dragAndDropHelperCoords = currPos + "px";
    		this.needsDraw = true;
    	}
    },
    handleLayerDragEnd : {
    	value: function(event) {
    		this._deleteHelper = true;
    		this.needsDraw = true;
           
    	}
    },
    handleLayerDrop : {
    	value: function(event) {
            event.stopPropagation();
            event.preventDefault();
            this._deleteHelper = true; 
            this.needsDraw = true;
    	}
    },
    /* === END: Controllers === */

    /* === BEGIN: Logging routines === */
    _boolDebug:{
        enumerable:false,
        value:false // set to true to enable debugging to console; false for turning off all debugging.
    },
    boolDebug:{
        get:function () {
            return this._boolDebug;
        },
        set:function (boolDebugSwitch) {
            this._boolDebug = boolDebugSwitch;
        }
    },
    log:{
        value:function (strMessage) {
            if (this.boolDebug) {
                console.log(this.getLineNumber() + ": " + strMessage);
            }
        }
    },
    getLineNumber:{
        value:function () {
            try {
                throw new Error('bazinga')
            } catch (e) {
                return e.stack.split("at")[3].split(":")[2];
            }
        }
    }
    /* === END: Logging routines === */
});