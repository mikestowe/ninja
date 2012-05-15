/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var nj = require("js/lib/NJUtils").NJUtils;

var TimelinePanel = exports.TimelinePanel = Montage.create(Component, {

    hasTemplate:{
        value:true
    },

    /* === BEGIN: Models === */
    _arrLayers:{
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
            this.cacheTimeline();
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
        value:null
    },

    layerRepetition:{
        get:function () {
            return this._layerRepetition;
        },
        set:function (newVal) {
            this._layerRepetition = newVal;
        }
    },
    
    _areTracksScrolling: {
    	value: false
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
                this.cacheTimeline();
            }
        }
    },

    _currentLayerSelected:{
        value: false
    },
    currentLayerSelected:{
        get:function () {
            return this._currentLayerSelected;
        },
        set:function (newVal) {
            this._currentLayerSelected = newVal;
            this.cacheTimeline();
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
                if (this.currentLayerSelected !== false) {
                	this.selectLayer(selectIndex, true);
                }
                if (this.currentLayersSelected !== false) {
                	this.selectLayers(this.currentLayersSelected);
                }
                if ((this.currentLayersSelected === false) && (this.currentLayerSelected === false)) {
                	this.selectLayers([]);
                }
                
            }
        }
    },

    _currentLayersSelected:{
        value:[]
    },
    currentLayersSelected:{
        get:function () {
            return this._currentLayersSelected;
        },
        set:function (newVal) {
            this._currentLayersSelected = newVal;
            this.cacheTimeline();
        }
    },
    
    _currentSelectedContainer: {
    	value: null
    },
    currentSelectedContainer: {
    	get: function() {
    		return this._currentSelectedContainer;
    	},
    	set: function(newVal) {
    		this._currentSelectedContainer = newVal;
    		this.handleDocumentChange();
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

    _masterDuration:{
        value:0
    },

    masterDuration:{
        serializable:true,
        get:function () {
            return this._masterDuration;
        },
        set:function (val) {
            this._masterDuration = val;
            var intDur = Math.round(val/12),
           		strWidth = intDur + "px";
            this.timebar.style.width = strWidth;
        }
    },

    _trackRepetition:{
        value:null
    },

    trackRepetition:{
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
                //this.LayerBinding();
            }
        }
    },

    _firstTimeLoaded:{
        value:true
    },

    _captureSelection:{
        value:false
    },

    _openDoc:{
        value:false
    },

    timeMarkerHolder:{
        value:null
    },
    
    // Drag and Drop properties
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
    _draggingType: {
    	value: false
    },
    draggingType: {
    	get: function() {
    		return this._draggingType;
    	},
    	set: function(newVal) {
    		this._draggingType = newVal;
    	}
    },

    layersDragged:{
           value:[],
           writable:true
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
                    this.layersDragged.push(dragLayer);
                    this._layerDroppedInPlace = this.arrLayers[dropLayerIndex];

    			this.arrLayers.splice(dragLayerIndex, 1);
    			this.arrLayers.splice(dropLayerIndex, 0, dragLayer);
    			this.cacheTimeline();
    			
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
    
    // Keyframe drag and drop properties
    _draggingTrackId: {
    	value: false
    },
    draggingTrackId: {
    	get: function() {
    		return this._draggingTrackId;
    	},
    	set: function(newVal) {
    		this._draggingTrackId = newVal;
    	}
    },
    
    
    useAbsolutePosition:{
        value:true
    },
    _currentDocumentUuid: {
    	value: false
    },
    _ignoreSelectionChanges: {
    	value: false
    },
    /* === END: Models === */
    /* === BEGIN: Draw cycle === */
    prepareForDraw:{
        value:function () {
            this.initTimeline();
        }
    },
    
    draw:{
    	value: function() {
    		
    		// Drag and Drop:
    		if (this.draggingType === "layer") {
	    		
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
	                this.application.ninja.elementMediator.reArrangeDOM(this.layersDragged , this._layerDroppedInPlace);
	                this.layersDragged =[];
	    		}
    		} else if (this.draggingType === "keyframe") {
	    		// Do we need to scroll the tracks?
	    		if (this._scrollTracks !== false) {
	    			this.layout_tracks.scrollLeft = this._scrollTracks;
	    			this._scrollTracks = false;
	    		}
    		}
    		
    		// Do we need to scroll the layers?
    		if (this._areTracksScrolling) {
    			this._areTracksScrolling = false;
	            this.user_layers.scrollTop = this.layout_tracks.scrollTop;
	            this.layout_markers.scrollLeft = this.layout_tracks.scrollLeft;
	         	this.playheadmarker.style.top = this.layout_tracks.scrollTop + "px";
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
            returnObj.layerData.layerTag = "";
            returnObj.layerData.isVisible = true;
            returnObj.layerData.docUUID = this.application.ninja.currentDocument._uuid;
            returnObj.layerData.isTrackAnimated = false;
            returnObj.parentElementUUID = null;
            returnObj.parentElement = null;
            
            return returnObj;
        }
    },
    
    // cache Timeline data in currentDocument.
    cacheTimeline: {
    	value: function() {
			// Store the timeline data in currentDocument...
			if (this._boolCacheArrays) {
				// ... but only if we're supposed to.
	    		this.application.ninja.currentDocument.tlArrLayers = this.arrLayers;
	    		this.application.ninja.currentDocument.tlCurrentSelectedContainer = this.application.ninja.currentSelectedContainer;
	    		this.application.ninja.currentDocument.tllayerNumber = this.currentLayerNumber;
	    		this.application.ninja.currentDocument.tlCurrentLayerSelected = this.currentLayerSelected;
	    		this.application.ninja.currentDocument.tlCurrentLayersSelected = this.currentLayersSelected;
			}
    	}
    },
    // Initialize Timeline cache in currentDocument.
    initTimelineCache: {
    	value: function() {
			// Initialize the currentDocument for a new set of timeline data.
			this.application.ninja.currentDocument.isTimelineInitialized = true;
			this.application.ninja.currentDocument.tlArrLayers = [];
    		this.application.ninja.currentDocument.tlCurrentSelectedContainer = this.application.ninja.currentSelectedContainer;
    		this.application.ninja.currentDocument.tllayerNumber = this.currentLayerNumber;
    		this.application.ninja.currentDocument.tlCurrentLayerSelected = false;
    		this.application.ninja.currentDocument.tlCurrentLayersSelected = false;
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
    			
    		/* Example new style 	
            newStyle.styleID = styleID;
			newStyle.whichView = "propval";		// Which view do we want to show, usually property/value view (see Style)
			newStyle.editorProperty = "top";	// the style property
			newStyle.editorValue = 0;			// The current value
			newStyle.ruleTweener = false; 
			newStyle.isSelected = false;
			
			returnArray.push(newStyle);
			*/
			
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
						
			return returnArray;
    		
    	}
    },

    // Bind all document-specific events (pass in true to unbind)
    _bindDocumentEvents : {
        value: function(boolUnbind) {
            var arrEvents = [ "newLayer",
                             "deleteLayer",
                             "elementAdded",
                             "elementsRemoved",
                             "elementReplaced",
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
            }
        }
    },

    // Initialize the timeline, runs only once when the timeline component is first loaded
    initTimeline:{
        value:function () {
        	
        	// Get some selectors
            this.layout_tracks = this.element.querySelector(".layout-tracks");
            this.layout_markers = this.element.querySelector(".layout_markers");
            
            
            // Bind the event handler for the document change events
            //this.eventManager.addEventListener("onOpenDocument", this.handleDocumentChange.bind(this), false);
            this.eventManager.addEventListener("closeDocument", this.handleDocumentChange.bind(this), false);
            //this.eventManager.addEventListener("switchDocument", this.handleDocumentChange.bind(this), false);
            //this.eventManager.addEventListener("breadCrumbBinding",this,false);
            
            // Bind drag and drop event handlers
            this.container_layers.addEventListener("dragstart", this.handleLayerDragStart.bind(this), false);
            this.container_layers.addEventListener("dragend", this.handleLayerDragEnd.bind(this), false);
            this.container_layers.addEventListener("dragover", this.handleLayerDragover.bind(this), false);
            this.container_layers.addEventListener("drop", this.handleLayerDrop.bind(this), false);
            this.container_tracks.addEventListener("dragover", this.handleKeyframeDragover.bind(this), false);
            this.container_tracks.addEventListener("drop", this.handleKeyframeDrop.bind(this), false);
            
            // Bind the handlers for the config menu
            this.checkable_animated.addEventListener("click", this.handleAnimatedClick.bind(this), false);
            this.checkable_relative.addEventListener("click", this.handleRelativeClick.bind(this), false);
            this.checkable_absolute.addEventListener("click", this.handleAbsoluteClick.bind(this), false);
            this.tl_configbutton.addEventListener("click", this.handleConfigButtonClick.bind(this), false);
            document.addEventListener("click", this.handleDocumentClick.bind(this), false);
            
            // Add some event handlers
            this.timeline_leftpane.addEventListener("mousedown", this.timelineLeftPaneMousedown.bind(this), false);
            this.timeline_leftpane.addEventListener("mouseup", this.timelineLeftPaneMouseup.bind(this), false);
            this.layout_tracks.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.user_layers.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.end_hottext.addEventListener("changing", this.updateTrackContainerWidth.bind(this), false);
            this.playhead.addEventListener("mousedown", this.startPlayheadTracking.bind(this), false);
            this.playhead.addEventListener("mouseup", this.stopPlayheadTracking.bind(this), false);
            this.time_markers.addEventListener("click", this.updatePlayhead.bind(this), false);
            
            // Bind some bindings
            Object.defineBinding(this, "currentSelectedContainer", {
                boundObject:this.application.ninja,
                boundObjectPropertyPath:"currentSelectedContainer",
                oneway:true
            });
            
			// Start the panel out in disabled mode by default
			// (Will be switched on later, if appropriate).
            this.enablePanel(false);

        }
    },

    // Initialize the timeline for a document.
    // Called when a document is opened (new or existing), or when documents are switched.
    initTimelineForDocument:{
        value:function () {


            var myIndex,
            	boolAlreadyInitialized = false;
            this.drawTimeMarkers();
            // Document switching
            // Check to see if we have saved timeline information in the currentDocument.
            //console.log("TimelinePanel.initTimelineForDocument");

            if ((typeof(this.application.ninja.currentDocument.isTimelineInitialized) === "undefined")) {
            	//console.log('TimelinePanel.initTimelineForDocument: new Document');
                // No, we have no information stored.
                // This could mean we are creating a new file, OR are opening an existing file.
                
                // First, initialize the caches.
				this.initTimelineCache();
                this.temparrLayers = [];

				// That's all we need to do for a brand new file. 
                // But what if we're opening an existing document?
                if (!this.application.ninja.documentController.creatingNewFile) {
                    // Opening an existing document. If it has DOM elements we need to restore their timeline info
                    if (this.application.ninja.currentDocument.documentRoot.children[0]) {
                        // Yes, it has DOM elements. Loop through them and create a new object for each.
                        for (myIndex = 0; this.application.ninja.currentDocument.documentRoot.children[myIndex]; myIndex++) {
                            this._openDoc = true;
                            this.restoreLayer(this.application.ninja.currentDocument.documentRoot.children[myIndex]);
                        }
                    }
                }
                
                // Draw the repetition.
                this.arrLayers = this.temparrLayers;
                this.currentLayerNumber = this.arrLayers.length;
                this._currentDocumentUuid = this.application.ninja.currentDocument.uuid;
                boolAlreadyInitialized = true;
                
			} else if (this.application.ninja.currentDocument.setLevel) {
            	//console.log('TimelinePanel.initTimelineForDocument: breadCrumbClick');
				// Information stored, but we're moving up or down in the breadcrumb.
				// Get the current selection and restore timeline info for its children.
				//debugger;
                var parentNode = this.application.ninja.currentSelectedContainer,
                	storedCurrentLayerNumber = this.application.ninja.currentDocument.tllayerNumber;
                this.temparrLayers = [];
                
                for (myIndex = 0; parentNode.children[myIndex]; myIndex++) {
                    this._openDoc = true;
                    this.restoreLayer(parentNode.children[myIndex]);

                }
                // Draw the repetition.
                this.arrLayers = this.temparrLayers;
                this.currentLayerNumber = storedCurrentLayerNumber;
                boolAlreadyInitialized = true;
                this.application.ninja.currentDocument.setLevel = false;


            } else {
            	//console.log('TimelinePanel.initTimelineForDocument: else fallback');
                // we do have information stored.  Use it.
                var i = 0, 
                	tlArrLayersLength = this.application.ninja.currentDocument.tlArrLayers.length;
                
                // We're reading from the cache, not writing to it.
            	this._boolCacheArrays = false;
                for (i = 0; i < tlArrLayersLength; i++) {
                    if (this.application.ninja.currentDocument.tlArrLayers[i].layerData.isSelected === true) {
                        this.application.ninja.currentDocument.tlArrLayers[i].layerData._isFirstDraw = true;
                    } else {
                    	this.application.ninja.currentDocument.tlArrLayers[i].layerData._isFirstDraw = false;
                    }
                }
                this.arrLayers = this.application.ninja.currentDocument.tlArrLayers;
                this.currentLayerNumber = this.application.ninja.currentDocument.tllayerNumber;
                this.currentLayerSelected = this.application.ninja.currentDocument.tlCurrentLayerSelected;
                this.currentLayersSelected = this.application.ninja.currentDocument.tlCurrentLayersSelected;
                this._currentDocumentUuid = this.application.ninja.currentDocument.uuid;


                //debugger;
                if (typeof(this.application.ninja.currentDocument.tlCurrentSelectedContainer) !== "undefined") {
//                	this.application.ninja.currentSelectedContainer=this.application.ninja.currentDocument.tlCurrentSelectedContainer;
                }
                
                // Are we only showing animated layers?
				if (this.application.ninja.currentDocument.boolShowOnlyAnimated) {
					// Fake a click.
					var evt = document.createEvent("MouseEvents");
					evt.initMouseEvent("click");
					this.checkable_animated.dispatchEvent(evt);
				}

				// Ok, done reading from the cache.
				this._boolCacheArrays = true;
				
				// Reset master duration
				this.resetMasterDuration();
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
			this.checkable_animated.classList.remove("checked");
            this.currentLayerNumber = 0;
            this.currentLayerSelected = false;
            this.currentLayersSelected = false;
            this.selectedKeyframes = [];
            this.selectedTweens = [];
            this._captureSelection = false;
            this._openDoc = false;
            this.end_hottext.value = 25;
            this.updateTrackContainerWidth();
            // Clear the repetitions
            if (this.arrLayers.length > 0) {
                this.arrLayers = [];
                this.arrLayers.length = 0;
            }
            this.resetMasterDuration();
        }
    },

    handleDocumentChange:{
        value:function () {
        	// console.log("TimelinePanel.handleDocumentChange");
        	
			if (this.application.ninja.currentDocument == null) {
				// On app initialization, the binding is triggered before
				// there is a currentDocument.  We don't do anything at that time.
				return;
			}
			
			// Is this the same document?
			if (this._currentDocumentUuid === this.application.ninja.currentDocument.uuid) {
				// Yes, same document, so we are changing levels.
				this.application.ninja.currentDocument.setLevel = true;
				this._ignoreSelectionChanges = true;
			}
			
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

    LayerBinding:{
        value:function (node) {
            var i = 0;

            if(this._firstTimeLoaded){
                this._firstTimeLoaded = false;
                return;
            }

           this.handleDocumentChange(node);
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
        	this._areTracksScrolling = true;
        	this.needsDraw = true;
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
            var layerIndex, 
            	i = 0,
            	j = 0,
            	arrLayersLength = this.arrLayers.length,
            	intNumSelected = this.application.ninja.selectedElements.length,
            	checkIndex = 0;
            
            //console.log("TimelinePanel.handleSelectionChange, intNumSelected is ", intNumSelected)
            
            if (intNumSelected === 0) {
            	if (this._ignoreSelectionChanges !== true) {
            		this.selectLayers([]);
            	} else {
            		this._ignoreSelectionChanges = false;
            	}
            	
            	this.currentLayerSelected = false;
            	this.currentLayersSelected = false;
            }

            if (intNumSelected === 1) {
            	this.currentLayersSelected = false;
                if (this.application.ninja.selectedElements[0]) {
                	checkIndex = this.application.ninja.selectedElements[0].uuid;
                    for (i = 0; i < arrLayersLength; i++) {
                    	var currIndex = this.arrLayers[i].layerData.elementsList[0].uuid,
                    		layerID = this.arrLayers[i].layerData.layerID,
                    		layerIndex = 0;
                        if (checkIndex === currIndex) {
                            layerIndex = this.getLayerIndexByID(layerID);
                            this._captureSelection = false;
                            this.selectLayer(layerIndex);
                            this._captureSelection = true;
                        }
                    }
                }
            }
            
            if (intNumSelected > 1) {
            	// Build an array of indexes of selected layers to give to the selectLayers method
            	var arrSelectedIndexes = [];
            	this.currentLayerSelected = false;
            	for (i = 0; i < intNumSelected; i++) {
            		var currentCheck = this.application.ninja.selectedElements[i].uuid;
            		//console.log("checking ", currentCheck);
            		for (j = 0; j < arrLayersLength; j++) {
            			//console.log(".......... ", this.arrLayers[j].layerData.elementsList[0].uuid)
            			if (currentCheck === this.arrLayers[j].layerData.elementsList[0].uuid) {
            				//console.log("...............Yes!")
            				arrSelectedIndexes.push(j);
            			}
            		}
            	}
            	this.selectLayers(arrSelectedIndexes);
            }
        }
    },



    selectLayers:{
        value:function (arrSelectedIndexes) {

            var i = 0,
            	arrLayersLength = this.arrLayers.length,
            	arrSelectedIndexesLength = arrSelectedIndexes.length,
            	userSelection = false;
            
            //console.log(arrSelectedIndexes);
            
			
            if (this.selectedKeyframes) {
                this.deselectTweens();
            }
            
            for (i = 0; i < arrLayersLength; i++) {
            	this.arrLayers[i].layerData.isSelected = false;
            	this.triggerLayerBinding(i);
            }

            if (this.currentLayersSelected !== false) {
            	this.currentLayersSelected = false;
            }
            if (arrSelectedIndexesLength > 0) {
            	this.currentLayersSelected = [];
            }
            
            
            for (i = 0; i < arrLayersLength; i++) {
            	if (arrSelectedIndexes.indexOf(i) > -1) {
            		this.arrLayers[i].layerData.isSelected = true;
            		this.arrLayers[i].isSelected = true;
            		this.triggerLayerBinding(i);
            		this.currentLayersSelected.push(i);
            	}
            }

            this.layerRepetition.selectedIndexes = arrSelectedIndexes;

			// TODO: Set up for user selection.
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
            
            // Finally, reset the master duration.
            this.resetMasterDuration();
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

    timelineLeftPaneMousedown:{
        value:function (event) {
            var ptrParent = nj.queryParentSelector(event.target, ".container-layer");
            if (ptrParent !== false) {
                var myIndex = this.getActiveLayerIndex();
                if (myIndex !== false) {
                	this.selectLayer(myIndex, true);
                }
                
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
            var newLayerName = "",
                thingToPush = this.createLayerTemplate(),
                myIndex = 0,
                i = 0,
                arrLayersLength = this.arrLayers.length;

			// Make up a layer name.
            this.currentLayerNumber = this.currentLayerNumber + 1;
//            newLayerName = "Layer " + this.currentLayerNumber;
            newLayerName="         ";

			// Possibly currentLayerNumber doesn't correctly reflect the
			// number of layers.  Check that.
            // Commented out to fix WebGL rendering bug
            /*for(k = 0; k < arrLayersLength; k++){
                if(this.arrLayers[k].layerData.layerName === newLayerName){
                     this.currentLayerNumber = this.currentLayerNumber + 1;
                     newLayerName = "Layer " + this.currentLayerNumber;
                     break;
                }
            }*/
            // We will no longer have multiple things selected, so wipe that info out
            // if it isn't already gone.
            this.currentLayersSelected = false;
            
            // thingToPush is the template we just got.  Now fill it in.
            thingToPush.layerData.layerName = newLayerName;
            thingToPush.layerData.layerTag = "<" + object.nodeName.toLowerCase() + ">";
            thingToPush.layerData.layerID = this.currentLayerNumber;
            thingToPush.parentElement = this.application.ninja.currentSelectedContainer;
            thingToPush.layerData.isSelected = true;
            thingToPush.layerData._isFirstDraw = true;
            thingToPush.layerData.created = true;
            
            if (this.checkable_animated.classList.contains("checked")) {
            	thingToPush.layerData.isVisible = false;
            }
			
            if (this.layerRepetition.selectedIndexes) {
                // There is a selected layer, so we need to splice the new layer on top of it.
                myIndex = this.layerRepetition.selectedIndexes[0];
                if (typeof(myIndex) === "undefined") {
                	// Edge case: sometimes there's nothing selected, so this will be "undefined"
                	// In that case, set it to 0, the first layer.
                	myIndex = 0;
                }
                for (var i = 0; i < this.layerRepetition.selectedIndexes.length; i++) {
                	if (myIndex > this.layerRepetition.selectedIndexes[i]) {
                		myIndex = this.layerRepetition.selectedIndexes[i];
                	}
                }
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
//            newLayerName = "Layer " + this.currentLayerNumber;

//            if(ele.dataset.storedLayerName){
//                newLayerName = ele.dataset.storedLayerName;
//            }
            if(ele.id){
                thingToPush.layerData.layerName = ele.id;
            }
            thingToPush.layerData.layerID = this.currentLayerNumber;
            thingToPush.layerData.layerTag = "<" + ele.nodeName.toLowerCase() + ">";
            thingToPush.parentElement = this.application.ninja.currentSelectedContainer;
            if (this.checkable_animated.classList.contains("checked")) {
            	thingToPush.layerData.isVisible = false;
            }
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

        }
    },

    deleteLayer:{
        value:function (arrElements) {
            // Only delete a selected layers.  If no layers are selected, do nothing.
            var i = 0,
            	arrLayers = document.querySelectorAll(".container-layers .container-layer"),
            	arrLayersLength = arrLayers.length;

            for (i = arrLayersLength -1; i >= 0; i--) {
            	if (arrLayers[i].classList.contains("selected")) {
            		this.arrLayers.splice(i, 1);
            	}
            }
            
            this.currentLayerSelected = false;
            this.currentLayersSelected = false;
            this.resetMasterDuration();
            	
            	
            /*
            var length = elements.length;

            while(length>0){
                if (this.layerRepetition.selectedIndexes.length > 0) {
                    // Delete the selected layer.
                    var myIndex = this.layerRepetition.selectedIndexes[0];
                    this.arrLayers.splice(myIndex, 1);
                    var selectIndex = this.arrLayers.length;
                    this.resetMasterDuration();
                    if(selectIndex>0){
                        this.selectLayer(selectIndex-1);
                    }
                    length--;
                }
            }
            */
        }
    },

    resetMasterDuration:{
        value:function(){
            var trackDuration = 0,
            	arrLayersLength = this.arrLayers.length, 
            	i = 0;

            if (arrLayersLength > 0) {
            	for (i = 0; i < arrLayersLength; i++) {
            		var currLength = this.arrLayers[i].layerData.trackDuration;
            		if (currLength > trackDuration) {
            			trackDuration = currLength;
            		}
            	}
            }
            this.masterDuration = trackDuration;
        }
    },

    handleElementAdded:{
        value:function() {
            this.createNewLayer(this.application.ninja.selectedElements[0]);

            if (typeof(this.currentLayerSelected) === "undefined") {
            	// Edge case: currentLayerSelected needs to be initialized.
            	this.currentLayerSelected = {};
            	this.currentLayerSelected.layerData = {};
            	this.currentLayerSelected.layerData.elementsList = [];
            }
            this.currentLayerSelected.layerData.elementsList.push(this.application.ninja.selectedElements[0]);
//            this.currentLayerSelected.layerData.elementsList[0].dataset.storedLayerName = this.currentLayerSelected.layerData.layerName;
        }
    },

    handleElementsRemoved:{
        value:function (event) {
            var deleteElements = event.detail;
            //console.log("TimelinePanel.handleElementsRemoved; event.detail is ", event.detail);
            this.deleteLayer(deleteElements);
        }
    },

    handleElementReplaced:{
        value:function(event){
            this.currentLayerSelected.layerData.elementsList.pop();
            this.currentLayerSelected.layerData.elementsList.push(event.detail.data.newChild);
            this.currentLayerSelected.layerData.animatedElement = event.detail.data.newChild;
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
            this.resetMasterDuration();
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
    handleConfigButtonClick: {
    	value: function(event) {
    		event.stopPropagation();
    		this.handleCheckableClick(event);
    		
    	}
    },
    handleDocumentClick: {
    	value: function(event) {
    		if (this.tl_configbutton.classList.contains("checked")) {
    			this.tl_configbutton.classList.remove("checked");
    		}
    	}
    },
    
    handleAnimatedClick: {
    	value: function(event) {
    		if (typeof(this.application.ninja.currentDocument) === "undefined") {
    			return;
    		}
    		if (this.application.ninja.currentDocument == null) {
    			return;
    		}
    		this.handleCheckableClick(event);
    		this.application.ninja.currentDocument.boolShowOnlyAnimated = event.currentTarget.classList.contains("checked");
    		var boolHide = false,
    			i = 0,
    			arrLayersLength = this.arrLayers.length;
    		if (event.currentTarget.classList.contains("checked")) {
    			// Hide layers with isAnimated = false;
    			boolHide = true;
    		}
    		
    		for (i = 0; i < arrLayersLength; i++) {
    			if (boolHide) {
    				// Hide layers with isAnimated = false
    				if (this.arrLayers[i].layerData.isTrackAnimated === false) {
    					this.arrLayers[i].layerData.isVisible = false;
    					this.triggerLayerBinding(i);
    				}
    			} else {
    				this.arrLayers[i].layerData.isVisible = true;
    				this.triggerLayerBinding(i);
    			}
    		}
    		
    	}
    },
    handleRelativeClick: {
    	value: function(event) {
    		if (!event.currentTarget.classList.contains("checked")) {
    			this.handleCheckableClick(event);
    		}
    		this.checkable_absolute.classList.remove("checked");
            this.useAbsolutePosition = false;
    	}
    },
    handleAbsoluteClick: {
    	value: function(event) {
    		if (!event.currentTarget.classList.contains("checked")) {
    			this.handleCheckableClick(event);
    		}
    		this.checkable_relative.classList.remove("checked");
            this.useAbsolutePosition = true;
    	}
    },
    handleCheckableClick: {
    	value: function(event) {
    		if (event.currentTarget.classList.contains("checked")) {
    			event.currentTarget.classList.remove("checked");
    		} else {
    			event.currentTarget.classList.add("checked");
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
    		
    		// If this isn't a layer event we don't do anything.
    		if (this.draggingType !== "layer") {
    			return;
    		}
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
    		
    		// If this isn't a layer event we don't do anything.
    		if (this.draggingType !== "layer") {
    			return;
    		}
    		this._deleteHelper = true;
    		this.needsDraw = true;
           
    	}
    },
    handleLayerDrop : {
    	value: function(event) {
    		
    		// If this isn't a layer event we don't do anything.
    		if (this.draggingType !== "layer") {
    			return;
    		}
            event.stopPropagation();
            event.preventDefault();
            this._deleteHelper = true; 
            this.needsDraw = true;
    	}
    },
    
    // Keyframe drag-and-drop
    handleKeyframeDragover: {
    	value: function(event) {
    		
    		// If this isn't a keyframe drag and drop event, we don't want to do anything.
    		if (this.draggingType !== "keyframe") {
    			return;
    		}
    		event.preventDefault();
    		var currPos = 0;

    		currPos = (event.x + this.layout_tracks.scrollLeft) - 277;
    		
    		// Prevent dragging beyond previous or next keyframe, if any
    		if (currPos < this.trackRepetition.childComponents[this.draggingTrackId]._keyframeMinPosition) {
    			currPos = this.trackRepetition.childComponents[this.draggingTrackId]._keyframeMinPosition;
    		}
    		if (currPos > this.trackRepetition.childComponents[this.draggingTrackId]._keyframeMaxPosition) {
    			currPos = this.trackRepetition.childComponents[this.draggingTrackId]._keyframeMaxPosition;
    		}

			// Automatic scrolling when dragged to edge of window
			if (currPos < (this.layout_tracks.scrollLeft + 10)) {
				this._scrollTracks = (this.layout_tracks.scrollLeft -10);
				this.needsDraw = true;
			}
			if (currPos > (this.layout_tracks.offsetWidth + this.layout_tracks.scrollLeft - 20)) {
				this._scrollTracks = (this.layout_tracks.scrollLeft +10);
				this.needsDraw = true;
			}

			// Set up values in appropriate track and set that track to draw.
    		this.trackRepetition.childComponents[this.draggingTrackId].dragAndDropHelperCoords = currPos + "px";
    		this.trackRepetition.childComponents[this.draggingTrackId].needsDraw = true;
    		return false;
    	}
    },
    handleKeyframeDrop: {
    	value: function(event) {
    		
    		// If this isn't a keyframe drop event, we don't want to do anything.
    		if (this.draggingType !== "keyframe") {
    			return;
    		}
			event.stopPropagation();
			
			var currPos = (event.x + this.layout_tracks.scrollLeft) - 277,
				currentMillisecPerPixel = Math.floor(this.millisecondsOffset / 80),
				currentMillisec = 0,
				i = 0,
				trackIndex = this.draggingTrackId, 
				tweenIndex = this.trackRepetition.childComponents[trackIndex].draggingIndex;
				
			// Make sure drop happens between previous and next keyframe, if any.
    		if (currPos < this.trackRepetition.childComponents[trackIndex]._keyframeMinPosition) {
    			currPos = this.trackRepetition.childComponents[trackIndex]._keyframeMinPosition + 3;
    		}
    		if (currPos > this.trackRepetition.childComponents[trackIndex]._keyframeMaxPosition) {
    			currPos = this.trackRepetition.childComponents[trackIndex]._keyframeMaxPosition + 3;
    		}
    		
    		// Calculate the millisecond values, set repetitions, and update the rule.
    		currentMillisec = currentMillisecPerPixel * currPos;

			this.trackRepetition.childComponents[trackIndex].tweens[tweenIndex].tweenData.spanWidth = 
				currPos - this.trackRepetition.childComponents[trackIndex].tweens[tweenIndex - 1].tweenData.keyFramePosition;
				
			this.trackRepetition.childComponents[trackIndex].tweens[tweenIndex].tweenData.keyFramePosition = currPos;
			this.trackRepetition.childComponents[trackIndex].tweens[tweenIndex].tweenData.keyFrameMillisec = currentMillisec;
			
			this.trackRepetition.childComponents[trackIndex].tweens[tweenIndex].tweenData.spanPosition = 
				currPos - this.trackRepetition.childComponents[trackIndex].tweens[tweenIndex].tweenData.spanWidth;
				
			this.trackRepetition.childComponents[trackIndex].tweenRepetition.childComponents[tweenIndex].setData();
			
			if (tweenIndex < this.trackRepetition.childComponents[trackIndex].tweens.length -1) {
				var spanWidth = this.trackRepetition.childComponents[trackIndex].tweens[tweenIndex +1].tweenData.keyFramePosition - currPos,
					spanPosition = currPos; 
				this.trackRepetition.childComponents[trackIndex].tweens[tweenIndex +1].tweenData.spanWidth = spanWidth;
				this.trackRepetition.childComponents[trackIndex].tweens[tweenIndex +1].tweenData.spanPosition = currPos;
				this.trackRepetition.childComponents[trackIndex].tweenRepetition.childComponents[tweenIndex+1].setData();
			}
			this.trackRepetition.childComponents[trackIndex].tweenRepetition.childComponents[tweenIndex].selectTween();
			this.trackRepetition.childComponents[trackIndex].updateKeyframeRule();
			
			// If this is the last keyframe, we'll need to update the track duration
			if (tweenIndex === (this.trackRepetition.childComponents[trackIndex].tweens.length-1)) {
				this.arrLayers[trackIndex].layerData.trackDuration = currentMillisec;
				this.resetMasterDuration();
			}
			return false;
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