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
    	serializable: true,
        value:[]
    },

    arrLayers:{
    	serializable: true,
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
    	serializable: true,
        value:null
    },

    layerRepetition:{
    	serializable: true,
        get:function () {
            return this._layerRepetition;
        },
        set:function (newVal) {
            this._layerRepetition = newVal;
        }
    },

    _cacheArrays : {
        value: function() {
            if (this._boolCacheArrays) {
                this.application.ninja.currentDocument.tlArrLayers = this.arrLayers;
            }
        }
    },
    
    // Set to false to skip array caching array sets in current document
    _boolCacheArrays : {
        value: true
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
        value:function(){
            if (this._boolCacheArrays) {
                this.application.ninja.currentDocument.tllayerNumber = this.currentLayerNumber;
            }
        }
    },

    // TODO - Remove hash tables
    _hashKey:{
            value:0
        },

    hashKey:{
        get:function () {
            return this._hashKey;
        },
        set:function (newVal) {
            if (newVal !== this._hashKey) {
                this._hashKey = newVal;
                this._setHashKey();
            }
        }
    },

    _setHashKey:{
        value:function(){
            if (this._boolCacheArrays) {
                this.application.ninja.currentDocument.hashKey = this.hashKey;
            }
        }
    },


    _currentLayerSelected:{
        value: null
    },
    currentLayerSelected : {
    	get: function() {
    		return this._currentLayerSelected;
    	},
    	set: function(newVal) {
    		this._currentLayerSelected = newVal;
    		this.application.ninja.currentDocument.tlCurrentLayerSelected = newVal;
    	}
    },

    _selectedLayerID:{
        value: false
    },
    selectedLayerID : {
    	get: function() {
    		return this._selectedLayerID;
    	},
    	set: function(newVal) {
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

    millisecondsOffset:{
        value:1000
    },

    _masterDuration:{
        serializable: true,
        value:0
    },

    masterDuration:{
        serializable:true,
        get:function(){
            return this._masterDuration;
        },
        set:function(val){
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

    breadCrumbContainer: {
        get: function() {
            return this._breadCrumbContainer;
        },
        set: function(value) {
            if(this._breadCrumbContainer !== value) {
                this._breadCrumbContainer = value;
                this.LayerBinding(this.application.ninja.currentSelectedContainer);
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
        value: null
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
        }
    },

    willDraw:{
        value:function () {
            if (this._isLayer) {
                this.insertLayer();
                this._isLayer = false;
            }
        }
    },
    /* === END: Draw cycle === */
    /* === BEGIN: Controllers === */
	// Create an empty layer template object with minimal defaults and return it for use
	createLayerTemplate : {
		value : function() {
			var returnObj = {};
			returnObj.layerData = {};
			returnObj.layerData.layerName = null;
            returnObj.layerData.layerID = null;
            returnObj.layerData.isMainCollapsed = true;
            returnObj.layerData.isPositionCollapsed = true;
            returnObj.layerData.isTransformCollapsed = true;
            returnObj.layerData.isStyleCollapsed = true;
            returnObj.layerData.arrLayerStyles = [];
            returnObj.layerData.elementsList = [];
            returnObj.layerData.deleted = false;
            returnObj.layerData.isSelected = false;
            returnObj.layerData.layerPosition = null;
            returnObj.layerData.created=false;
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
    // Bind all document-specific events (pass in true to unbind)
    _bindDocumentEvents : {
        value: function(boolUnbind) {
            var arrEvents = ["deleteLayerClick",
                             "newLayer",
                             "deleteLayer",
                             "elementAdded",
                             "elementDeleted",
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
                    boundObject: this.application.ninja,
                    boundObjectPropertyPath:"currentSelectedContainer",
                    oneway: true
                });
            }
        }
    },
    
    // Initialize the timeline, runs only once when the component is first loaded.
    // Sets up basic event listeners, gets some selectors, etc.
    initTimeline : {
        value: function() {
            this.layout_tracks = this.element.querySelector(".layout-tracks");
            this.layout_markers = this.element.querySelector(".layout_markers");

            //this.newlayer_button.identifier = "addLayer";
            //this.newlayer_button.addEventListener("click", this, false);
            //this.deletelayer_button.identifier = "deleteLayer";
            //this.deletelayer_button.addEventListener("click", this, false);

            this.timeline_leftpane.addEventListener("click", this.timelineLeftPaneClick.bind(this), false);
            this.layout_tracks.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.user_layers.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.end_hottext.addEventListener("changing", this.updateTrackContainerWidth.bind(this), false);
            this.playhead.addEventListener("mousedown", this.startPlayheadTracking.bind(this), false);
            this.playhead.addEventListener("mouseup", this.stopPlayheadTracking.bind(this), false);
            this.time_markers.addEventListener("click", this.updatePlayhead.bind(this), false);
            this.enablePanel(false);
        }
    },
    
    // Initialize the timeline for a document. Called when a document is opened (new or existing), or
    // when documents are switched.
    initTimelineForDocument:{
        value:function () {
            var myIndex;
            this.drawTimeMarkers();
            // Document switching
            // Check to see if we have saved timeline information in the currentDocument.
            if (typeof(this.application.ninja.currentDocument.isTimelineInitialized) === "undefined") {
                // No, we have no information stored.  Create it.
                this.application.ninja.currentDocument.isTimelineInitialized = true;
                this.application.ninja.currentDocument.tlArrLayers = [];
                this.application.ninja.currentDocument.tllayerNumber = 0;

                // TODO - Remove hash
                this.application.ninja.currentDocument.tlLayerHashTable=[];

                this.temparrLayers = [];

                // TODO - Remove hash
                this.hashKey = this.application.ninja.currentSelectedContainer.uuid;

                // Are we creating a new doc, or opening an existing one?
                if(!this.application.ninja.documentController.creatingNewFile) {
                	// Opening an existing document.
                	// Does it have any DOM elements?
                    if(this.application.ninja.currentDocument.documentRoot.children[0]) {
                    	// Yes, it has DOM elements. Loop through them and create a new
                    	// object for each.
                        for(myIndex=0;this.application.ninja.currentDocument.documentRoot.children[myIndex];myIndex++) {
                            this._openDoc=true;
                            this.restoreLayer(this.application.ninja.currentDocument.documentRoot.children[myIndex]);
                        }
                    } else {
                    	// No, it has no DOM elements. Build an empty layer object.
                        //this.restoreLayer(1);
                    }
                    
                    // Feed the new array of objects into the repetitions
                    // and select the first layer.
                    //this.temparrLayers[0].layerData.isSelected = true;
					//this.temparrLayers[0].layerData._isFirstDraw = true;
					
                    this.arrLayers=this.temparrLayers;

                } else {
                	// New document. Create default layer.
                    //this.createNewLayer(1);
                }
                
                // After recreating the tracks and layers, store the result in the currentDocument.
                this.application.ninja.currentDocument.tlArrLayers = this.arrLayers;
                this.application.ninja.currentDocument.tllayerNumber = this.currentLayerNumber;

                // TODO - Remove both hashes?
                this.application.ninja.currentDocument.tlLayerHashTable = this.hashInstance;
                this.application.ninja.currentDocument.tlElementHashTable = this.hashElementMapToLayer;
                this.application.ninja.currentDocument.hashKey=this.hashKey;

            } else {
                // we do have information stored.  Use it.
                this._boolCacheArrays = false;
        		//var myIndex = 0;
        		for (var i = 0; i < this.application.ninja.currentDocument.tlArrLayers.length; i++) {
        			if ( this.application.ninja.currentDocument.tlArrLayers[i].layerData.isSelected === true ) {
        				this.application.ninja.currentDocument.tlArrLayers[i].layerData._isFirstDraw = true;
        			}
        		}

        		
                this.arrLayers = this.application.ninja.currentDocument.tlArrLayers;
                this.currentLayerNumber = this.application.ninja.currentDocument.tllayerNumber;
                this.currentLayerSelected = this.application.ninja.currentDocument.tlCurrentLayerSelected;

                // TODO - remove hash
                this.hashInstance = this.application.ninja.currentDocument.tlLayerHashTable;
                this.hashElementMapToLayer = this.application.ninja.currentDocument.tlElementHashTable;
                this.hashKey = this.application.ninja.currentDocument.hashKey;

            }
        }
    },
    
    // Clear the currently-displayed document (and its events) from the timeline.
    clearTimelinePanel : {
        value: function() {
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
            
            // Clear variables.
            this.hashInstance = null;  // TODO - remove hash
            this.hashElementMapToLayer = null;  // TODO - remove hash
            this.currentLayerNumber = 0;
            this.currentLayerSelected = false;
            this.selectedKeyframes = [];
            this.selectedTweens = [];
            this._captureSelection = false;
            this._openDoc = false;
            this._firstTimeLoaded=true;
            this.end_hottext.value = 25;
            this.updateTrackContainerWidth();
            this.selectedLayerID = false;
            
            // Clear the repetitions
            if (this.arrLayers.length > 0) {
            	this.arrLayers = [];
            }
        }
    },

	handleDocumentChange:{
		value:function(event){
			// Clear the timeline but not the cache
			this._boolCacheArrays = false;
        	this.clearTimelinePanel();
        	this._boolCacheArrays = true;
        	
        	// Rebind the document events for the new document context
        	this._bindDocumentEvents();

            // TODO - remove hash
            this.hashInstance = this.createLayerHashTable();
            this.hashElementMapToLayer = this.createElementMapToLayer();
            
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
        value: function(){
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
        value:function(){
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
        value:function(){
            var key , switchSelectedLayer,layerIndex;
            this.deselectTweens();

            if(this.application.ninja.selectedElements[0]){

                for (var i = 0; i < this.arrLayers.length; i++) {
                    if (this.application.ninja.selectedElements[0].uuid === this.arrLayers[i].layerData.elementsList[0].uuid) {
                        layerIndex = this.getLayerIndexByID(this.arrLayers[i].layerData.layerID);
                        this._captureSelection = false;
                        this.selectLayer(layerIndex);
                        this._captureSelection = true;
                    }
                }

//                // TODO - element uuid should be stored directly in layer array (possibly as the layerID)
//                key = this.application.ninja.selectedElements[0].uuid;
//
//                switchSelectedLayer = this.hashElementMapToLayer.getItem(key);
//                if(switchSelectedLayer!==undefined){
//                    layerIndex = this.getLayerIndexByID(switchSelectedLayer.layerID);
//                    this._captureSelection=false;
//                    this.selectLayer(layerIndex);
//                    this._captureSelection=true;
//                }
            }
        }
    },

    updateTimeText:{
        value:function (millisec) {
            var timeText;
            var sec = (Math.floor((millisec / 1000))) % 60;
            var min = (Math.floor((millisec / 1000) / 60)) % 60;
            var milliSec = String(Math.round(millisec / 10));
            var returnMillisec = milliSec.slice(milliSec.length - 2, milliSec.length);
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
            if (millisec == 0) {
                returnMillisec = "00";
            }
            timeText = returnMin + ":" + returnSec + ":" + returnMillisec;
            this.timetext.innerHTML = timeText;
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

    handleAddLayerClick:{
        value:function (event) {
            this._isLayer = true;
            this.needsDraw = true;
            this.application.ninja.selectionController.executeSelectElement();
        }
    },

    handleDeleteLayerClick:{
        value:function (event) {
            if (this.arrLayers.length === 1) {
                // do not delete last layer
                return;
            }
            if (this.layerRepetition.selectedIndexes === null) {
                // nothing is selected, do not delete
                return;
            }
            this.removeLayer();
        }
    },

    LayerBinding:{
        value:function (node) {
        var i = 0;

            if(typeof(this.application.ninja.currentDocument.isTimelineInitialized) === "undefined"){
                if (this._firstTimeLoaded) {
                    this._firstTimeLoaded = false;
                } else {
                    this.arrLayers.length = 0;

                    // TODO - remove hash
                    this.hashKey = node.uuid;
                    if (this.returnedObject = this.hashInstance.getItem(this.hashKey)) {
                        this._hashFind = true;
                    }


                    this.currentLayerNumber = 0;
                    this.createNewLayer(1);
                    this.selectLayer(0);
                }
            }
        }
    },

    timelineLeftPaneClick:{
        value:function (event) {
            var ptrParent = nj.queryParentSelector(event.target, ".container-layer");
            if (ptrParent !== false) {
                var myIndex = this.getActiveLayerIndex();
                this.selectLayer(myIndex, true);
            }
        }
    },

    createNewLayer:{
        value:function(object){
            var hashVariable = 0;

            if (object._undoStatus) {
                if (object._el.parentElementUUID !== this.application.ninja.currentSelectedContainer.uuid) {
                    dLayer = this.hashInstance.getItem(object._el.parentElementUUID);
                    for(hashVariable=0;dLayer[hashVariable];hashVariable++) {
                        if (dLayer[hashVariable]._layerID === object._el._layerID) {
                            dLayer[hashVariable].deleted = false;
                            parentNode = dLayer[hashVariable].parentElement;
                            break;
                        }
                    }
                    this.application.ninja.currentSelectedContainer = parentNode;
                    this.LayerBinding(parentNode);
                } else {
                    dLayer = this.hashInstance.getItem(object._el.parentElementUUID);
                    for(hashVariable=0;dLayer[hashVariable];hashVariable++) {
                        if (dLayer[hashVariable]._layerID === object._el._layerID) {
                            dLayer[hashVariable].deleted = false;

                            this.arrLayers.splice(object._layerPosition, 0, object._el);
                            this.selectLayer(object._layerPosition);
                            break;

                        }
                    }
                }
            } else {

	            var newLayerName = "",
	                thingToPush = this.createLayerTemplate(),
	                myIndex = 0,
                    // unused var?
	                indexToSelect = 0;
	            this.currentLayerNumber = this.currentLayerNumber + 1;
	            newLayerName = "Layer " + this.currentLayerNumber;
	            thingToPush.layerData.layerName = newLayerName;
	            thingToPush.layerData.layerID = this.currentLayerNumber;
	            thingToPush.parentElementUUID = this.hashKey;
	            thingToPush.parentElement = this.application.ninja.currentSelectedContainer;
	            thingToPush.layerData.isSelected = true;
	        	thingToPush.layerData._isFirstDraw = true;
                thingToPush.layerData.created = true;
	        	
	        	for (var i = 0; i < this.arrLayers.length; i++) {
	        		this.arrLayers[i].layerData.isSelected = false;
	        		this.arrLayers[i].layerData._isFirstDraw = false;
	        	}
	
	            if (!!this.layerRepetition.selectedIndexes) {
	            	// There is a selected layer, so we need to splice the new
	            	// layer on top of it.
	                myIndex = this.layerRepetition.selectedIndexes[0];
	                thingToPush.layerData.layerPosition = myIndex;
	                thingToPush.layerData.trackPosition = myIndex;
	                this.arrLayers.splice(myIndex, 0, thingToPush);
	                this._LayerUndoPosition = myIndex;

	                //this.hashLayerNumber.setItem(this.hashKey, thingToPush.layerData);
	                this.hashInstance.setItem(this.hashKey, thingToPush.layerData, myIndex);
                    // unused var
					indexToSelect = myIndex;
	
	            } else {
	                thingToPush.layerData.layerPosition = this.arrLayers.length - 1;
	                this.arrLayers.push(thingToPush);
	                this._LayerUndoPosition = this.arrLayers.length - 1;

	                //this.hashLayerNumber.setItem(this.hashKey, thingToPush.layerData);
	                this.hashInstance.setItem(this.hashKey, thingToPush.layerData, thingToPush.layerData.layerPosition);
	                // unused var
                    indexToSelect = this.arrLayers.length -1;
	            }
	
	            this._LayerUndoObject = thingToPush;
	            this._LayerUndoIndex = thingToPush.layerData.layerID;
	            this._LayerUndoStatus = true;

                this.selectLayer(myIndex);
            }
        }
    },

    restoreLayer:{
        value:function (ele) {
            var hashIndex = 0 ,layerResult;
            if (this._hashFind) {
                for (layerResult = this.returnedObject[hashIndex];layerResult;hashIndex++) {
                    if (layerResult.layerData.deleted !== true) {
                        this.arrLayers.push(layerResult);

                    }
                }
                this._hashFind = false;
            }else {
                var newLayerName = "",
                    thingToPush = this.createLayerTemplate(),
                    newTrack = {},
                    myIndex = 0;

                this.currentLayerNumber = this.currentLayerNumber + 1;
                newLayerName = "Layer " + this.currentLayerNumber;
                thingToPush.layerData.layerName = newLayerName;
                thingToPush.layerData.layerID = this.currentLayerNumber;
                thingToPush.parentElementUUID = this.hashKey;
                thingToPush.parentElement = this.application.ninja.currentSelectedContainer;

                if(this._openDoc){
                    ele.uuid =nj.generateRandom();
                    thingToPush.layerData.elementsList.push(ele);
                }

                    this.temparrLayers.push(thingToPush);
                    thingToPush.layerData.trackPosition = this.temparrLayers.length - 1;
                    thingToPush.layerData.layerPosition = this.temparrLayers.length - 1;

                    this.hashInstance.setItem(this.hashKey, thingToPush.layerData, thingToPush.layerData.layerPosition);

                if(this._openDoc) {
                    var selectedIndex = this.getLayerIndexByID(thingToPush.layerData.layerID,this.temparrLayers);
                    this.hashElementMapToLayer.setItem(ele.uuid,ele,this.temparrLayers[selectedIndex]);
                    this._openDoc=false;
                }
            }
        }
    },

    deleteLayer:{
        value:function (object) {
            // unusused variables and duplicate declaration of var index
            var dLayer,parentNode, hashVariable = 0, k = 0, index = 0, j = 0,a=0;

            // should now be able to delete the last layer
            if (this.arrLayers.length > 0) {
                if (object._undoStatus) {
                   if (object._el.parentElementUUID !== this.application.ninja.currentSelectedContainer.uuid) {
                        dLayer = this.hashInstance.getItem(object._el.parentElementUUID);
                         for(hashVariable=0;dLayer[hashVariable];hashVariable++) {
                            if (dLayer[hashVariable]._layerID === object._el._layerID) {
                                dLayer[hashVariable].deleted = true;
                                parentNode = dLayer[hashVariable].parentElement;
                                break;
                            }
                        }
                        this.application.ninja.currentSelectedContainer = parentNode;
                        this.LayerBinding(parentNode);
                    }
                    else {
                        dLayer = this.hashInstance.getItem(object._el.parentElementUUID);
                       for(hashVariable=0;dLayer[hashVariable];hashVariable++) {
                            if (dLayer[hashVariable].deleted === true) {

                            } else if (dLayer[hashVariable]._layerID === object._el._layerID) {
                                while (this.arrLayers.length) {
                                    if (dLayer[hashVariable]._layerID === this.arrLayers[k].layerData._layerID) {
                                        dLayer[hashVariable].deleted = true;
                                        this.arrLayers.splice(k, 1);
                                        if(k>0){
                                            this.selectLayer(k-1);
                                        }else{
                                            this.selectLayer(k);
                                        }
                                        break;
                                    }
                                    k++;
                                }
                            }
                        }
                    }
                } else {
                	// Only delete a selected layer.  If no layer is selected, do nothing.
                    if (this.layerRepetition.selectedIndexes.length > 0) {
						// Delete the selected item.
                        var myIndex = this.layerRepetition.selectedIndexes[0];
                        this._LayerUndoObject = this.arrLayers[myIndex];

                        dLayer = this.hashInstance.getItem(this.hashKey);

                        for(hashVariable=0;dLayer[hashVariable];hashVariable++){
                            if(this.currentLayerSelected.layerData.layerID===dLayer[hashVariable].layerID){
                                var arrLayerLength=this.arrLayers.length;
                                for(var index=0;index<arrLayerLength;index++){
                                      if(this.arrLayers[index].layerData.layerID===dLayer[hashVariable].layerID){
                                          dLayer[hashVariable].deleted = true;
                                          ElementMediator.deleteElements(dLayer[hashVariable].elementsList);
                                          this.arrLayers.splice(index, 1);
                                          break;
                                      }
                                }

                        }
                    }
//                        this._LayerUndoIndex = this._LayerUndoObject.layerData.layerID;
//                        this._LayerUndoPosition = myIndex;
                    }
                }
            }
        }
    },

    handleElementAdded:{
        value:function (event) {
            this.insertLayer();
            //console.log("inserting layer");

            this.addElementToLayer(this.application.ninja.selectedElements[0]);
        }
    },

    addElementToLayer:{
        value:function (element) {


            //console.log("setting element to layer");
            //console.log(element);
            //console.log(this.currentLayerSelected.layerData);

            //element.uuid = nj.generateRandom();

            // this should be unneeded with one element per layer restriction
            if (this.currentLayerSelected.layerData.elementsList[0] !== undefined) {

                if (this.currentLayerSelected.layerData.isTrackAnimated) {
                    // need to prevent element adding to dom, not just clear the drawing canvas
                    // this should be unneeded with one element per layer restriction
                    console.log("cannot add elements to a layer with animated element");
                } else {
                    //this.hashElementMapToLayer.setItem(element.uuid, element, this.currentLayerSelected);

                    // should be simple assignment to var instead of array
                    this.currentLayerSelected.layerData.elementsList.push(element._element);
                    //this.currentLayerSelected.layerData.layerElement = event.detail;
                }
            } else {
                //this.hashElementMapToLayer.setItem(element.uuid, element, this.currentLayerSelected);
                this.currentLayerSelected.layerData.elementsList.push(element._element);
            }
        }
    },

    handleElementDeleted:{
        value:function (event) {

            // With one element per layer restriction
            // Deleting an element on stage should simply delete it's associated layer

            var length,lengthVal;
            this.deleteElement = event.detail;
            lengthVal = this.currentLayerSelected.layerData.elementsList.length - 1;
            for (length = lengthVal ;length >= 0 ;length--) {
                if (this.currentLayerSelected.layerData.elementsList[length] === this.deleteElement) {
                    this.currentLayerSelected.layerData.elementsList.splice(length, 1);
                    break;
                }
                //length--;
            }
        }
    },

    drawTimeMarkers:{
        value:function () {
            this.timeMarkerHolder = document.createElement("div");
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
            var timeToReturn;
            var currentMilliseconds = currentMarker * this.millisecondsOffset;
            var sec = (Math.floor((currentMilliseconds / 1000))) % 60;
            var min = (Math.floor((currentMilliseconds / 1000) / 60)) % 60;
            var milliSec = String(Math.round(currentMilliseconds / 10));
            var returnMillisec = milliSec.slice(milliSec.length - 2, milliSec.length);
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
            if (currentMarker == 0) {
                returnMillisec = "00";
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


                            for(this.counter = index ;hashLayerObject[key][this.counter];this.counter++) {
                            }

                            for(;this.counter !== index;this.counter--) {
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

    createLayerNumberHash:{
        value:function (key, value) {
            var hashLayerNumberObject;
            hashLayerNumberObject = Object.create(Object.prototype, {
                setItem:{
                    value:function (key, value) {
                        if (value !== undefined) {
                            hashLayerNumberObject[key] = value.layerData.layerID;
                        }
                    }
                },

                getItem:{
                    value:function (key) {
                        if (hashLayerNumberObject[key] === undefined) {
                            return;
                        }
                        return hashLayerNumberObject[key];
                    }
                }
            });
            return hashLayerNumberObject;
        }
    },
   
    createElementMapToLayer:{
        value:function(){
            var hashMappingObject;
            hashMappingObject = Object.create(Object.prototype, {
                mappingArray:{
                    value:{},
                    writable:true
                },
                setItem: {
                          value: function(key,value,layer) {
                          if(this.mappingArray[key]===undefined){
                              this.mappingArray[key]={};
                          }
                          this.mappingArray[key]["ele"] = value;
                          this.mappingArray[key].layerID = layer.layerData.layerID;
                          }
                      },

                getItem: {
                          value: function(key) {
                              return this.mappingArray[key];
                          }
                      }
               });
            return hashMappingObject;
        }
    },

    selectLayer:{
        value:function (layerIndex, userSelection) {

            var i = 0;
            var arrLayersLength = this.arrLayers.length;
			
            if(this.selectedKeyframes){
                this.deselectTweens();
            }
            
            for (i = 0; i < arrLayersLength; i++) {
                if (i === layerIndex) {
                    this.arrLayers[i].layerData.isSelected = true;
                } else {
                    this.arrLayers[i].layerData.isSelected = false;
                }
            }
            
            this.layerRepetition.selectedIndexes = [layerIndex];
            this.currentLayerSelected = this.arrLayers[layerIndex];

            if(userSelection){
                if(this._captureSelection){

                    if(this.currentLayerSelected.layerData.elementsList.length >= 1) {
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
        value:function (layerID,tempArr) {
            var i = 0,
                returnVal = false,
                arrLayersLength = this.arrLayers.length;

            if(tempArr){
                var tempArrLength=this.temparrLayers.length;

                for (i = 0; i < tempArrLength; i++) {
                                if (this.temparrLayers[i].layerData.layerID === layerID) {
                                    returnVal = i;
                                }
                            }

            }else{
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

    insertLayer:{
        value:function (element) {
            var cmd = this.addLayerCommand(element);
            cmd.execute();
            cmd._el = this._LayerUndoObject;
            cmd._layerID = this._LayerUndoIndex;
            cmd._layerPosition = this._LayerUndoPosition;
            cmd._undoStatus = this._LayerUndoStatus;
            NJevent("sendToUndo", cmd);
        }
    },

    removeLayer:{
        value:function () {
            var cmd = this.deleteLayerCommand();
            cmd.execute();
            cmd._el = this._LayerUndoObject;
            cmd._layerID = this._LayerUndoIndex;
            cmd._layerPosition = this._LayerUndoPosition;
            cmd._undoStatus = this._LayerUndoStatus;
            NJevent("sendToUndo", cmd);

        }
    },

    addLayerCommand:{
        value:function () {
            var command;
            var that=this;
            command = Object.create(Object.prototype, {
                _el:{value:null, writable:true},
                _layerID:{value:null, writable:true},
                _layerPosition:{value:null, writable:true},
                _undoStatus:{value:false, writable:true},
                description:{ value:"Add Layer"},
                receiver:{value:TimelinePanel},
                execute:{
                    value:function () {
                        that.createNewLayer(this);
                    }
                },
                unexecute:{
                    value:function () {
                        that.deleteLayer(this);
                    }
                }
            });
            return command;
        }
    },

    deleteLayerCommand:{
        value:function () {
            var command;
            var that=this;
            command = Object.create(Object.prototype, {
                description:{ value:"Delete Layer"},
                receiver:{value:TimelinePanel},
                execute:{
                    value:function () {
                        that.deleteLayer(this);
                    }
                },
                unexecute:{
                    value:function () {
                        that.createNewLayer(this);
                    }
                }
            });
            return command;
        }
    },
    enablePanel : {
    	value: function(boolEnable) {
    		if (boolEnable) {
    			this.timeline_disabler.style.display = "none";
    		} else {
    			this.timeline_disabler.style.display = "block";
    		}
    	}
    },
    /* === END: Controllers === */
   
       /* === BEGIN: Logging routines === */
    _boolDebug: {
        enumerable: false,
        value: false // set to true to enable debugging to console; false for turning off all debugging.
    },
    boolDebug: {
        get: function() {
            return this._boolDebug;
        },
        set: function(boolDebugSwitch) {
            this._boolDebug = boolDebugSwitch;
        }
    },
    log: {
        value: function(strMessage) {
            if (this.boolDebug) {
                console.log(this.getLineNumber() + ": " + strMessage);
            }
        }
    },
    getLineNumber: {
        value: function() {
            try {
               throw new Error('bazinga')
            }catch(e){
                return e.stack.split("at")[3].split(":")[2];
            }
        }
    }
    /* === END: Logging routines === */
});

