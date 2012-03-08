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
        value:[]
    },

    arrLayers:{
        get:function () {
            return this._arrLayers;
        },
        set:function (newVal) {
            this._arrLayers = newVal;
            this._cacheArrays();
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

    currentLayerSelected:{
        value: null
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
        set: function(value) {
            if(this._breadCrumbContainer !== value) {
                this._breadCrumbContainer = value;
                this.LayerBinding(this.application.ninja.currentSelectedContainer);
            }
        },
        get: function() {
            return this._breadCrumbContainer;
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
            this.eventManager.addEventListener("onOpenDocument", this, false);
            this.eventManager.addEventListener("closeDocument", this, false);
            this.eventManager.addEventListener("switchDocument", this, false);
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
	
	initTimeline : {
		value: function() {
			// Set up basic Timeline functions: event listeners, etc.  Things that only need to be run once.
			this.layout_tracks = this.element.querySelector(".layout-tracks");
            this.layout_markers = this.element.querySelector(".layout_markers");

            this.newlayer_button.identifier = "addLayer";
            this.newlayer_button.addEventListener("click", this, false);
            this.deletelayer_button.identifier = "deleteLayer";
            this.deletelayer_button.addEventListener("click", this, false);
            this.timeline_leftpane.addEventListener("click", this.timelineLeftPaneClick.bind(this), false);
            this.layout_tracks.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.user_layers.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.end_hottext.addEventListener("changing", this.updateTrackContainerWidth.bind(this), false);
            this.playhead.addEventListener("mousedown", this.startPlayheadTracking.bind(this), false);
            this.playhead.addEventListener("mouseup", this.stopPlayheadTracking.bind(this), false);
            this.time_markers.addEventListener("click", this.updatePlayhead.bind(this), false);
		}
	},
	
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
                this.application.ninja.currentDocument.tlLayerHashTable=[];
                this.hashKey = this.application.ninja.currentSelectedContainer.uuid;

				// Loop through the DOM of the document to find layers and animations.
				// Fire off events as they are found.
	            if(!this.application.ninja.documentController.creatingNewFile){
	                if(this.application.ninja.currentDocument.documentRoot.children[0]){
	                    myIndex=0;
	                    while(this.application.ninja.currentDocument.documentRoot.children[myIndex])
	                    {
	                        this._openDoc=true;
                            this.restoreLayer(this.application.ninja.currentDocument.documentRoot.children[myIndex]);
	                        myIndex++;
						}
	                }
	                else{
                        this.restoreLayer(1);
	                    this.selectLayer(0);
	                }
	            }else{
                    this.createNewLayer(1);
	                this.selectLayer(0);
	
	            }
	            // After recreating the tracks and layers, store the result in the currentDocument.
				this.application.ninja.currentDocument.tlArrLayers = this.arrLayers;
                this.application.ninja.currentDocument.tllayerNumber = this.currentLayerNumber;
                this.application.ninja.currentDocument.tlLayerHashTable = this.hashInstance;
                this.application.ninja.currentDocument.tlElementHashTable = this.hashElementMapToLayer;
                this.application.ninja.currentDocument.hashKey=this.hashKey;
			} else {
				// we do have information stored.  Use it.
				this._boolCacheArrays = false;
				this.arrLayers = this.application.ninja.currentDocument.tlArrLayers;
                this.currentLayerNumber = this.application.ninja.currentDocument.tllayerNumber;
                this.hashInstance = this.application.ninja.currentDocument.tlLayerHashTable;
                this.hashElementMapToLayer = this.application.ninja.currentDocument.tlElementHashTable;
                this.hashKey = this.application.ninja.currentDocument.hashKey;
                this.selectLayer(0);
				this._boolCacheArrays = true;
			}
        }
    },
    
    clearTimelinePanel : {
    	value: function() {
    		// Remove events
			this._bindDocumentEvents(true);
            
            // Remove every event listener for every selected tween in the timeline
            this.deselectTweens();

    		// Reset visual appearance
            this.application.ninja.timeline.playhead.style.left = "-2px";
            this.application.ninja.timeline.playheadmarker.style.left = "0px";
            this.application.ninja.timeline.updateTimeText(0.00);
            this.timebar.style.width = "0px";
            
            // Clear variables--including repetitions.
            this.hashInstance = null;
            this.hashElementMapToLayer = null;
			this.arrLayers = [];

    		this.currentLayerNumber = 0;
    		this.currentLayerSelected = false;
    		this.selectedKeyframes = [];
    		this.selectedTweens = [];
    		this._captureSelection = false;
    		this._openDoc = false;
            this._firstTimeLoaded=true;
    		this.end_hottext.value = 25;
    		this.updateTrackContainerWidth();
    	}
    },

	handleOnOpenDocument:{
		value:function(){
			this._boolCacheArrays = false;
        	this.clearTimelinePanel();
        	this._boolCacheArrays = true;
        	this._bindDocumentEvents();
        	
            this.hashInstance = this.createLayerHashTable();
            this.hashElementMapToLayer = this.createElementMapToLayer();
            this.initTimelineForDocument();
        }
    },
    
    handleCloseDocument: {
    	value: function(event) {
    		this.clearTimelinePanel();
    	}
    },
    
    handleSwitchDocument : {
    	value: function(event) {
    		// Handle document change.
    		this.handleOnOpenDocument();
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
                key = this.application.ninja.selectedElements[0].uuid;
                switchSelectedLayer = this.hashElementMapToLayer.getItem(key);
                if(switchSelectedLayer!==undefined){
                    layerIndex = this.getLayerIndexByID(switchSelectedLayer.layerID);
                    this._captureSelection=false;
                    this.selectLayer(layerIndex);
                    this._captureSelection=true;
                }
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
                    while (dLayer[hashVariable]) {
                        if (dLayer[hashVariable].layerData._layerID === object._el._layerID) {
                            dLayer[hashVariable].layerData.deleted = false;
                            parentNode = dLayer[hashVariable].parentElement;
                            break;
                        }
                        hashVariable++;
                    }
                    this.application.ninja.currentSelectedContainer = parentNode;
                    this.LayerBinding(parentNode);
                } else {
                    dLayer = this.hashInstance.getItem(object._el.parentElementUUID);
                    while (dLayer[hashVariable].layerData) {
                        if (dLayer[hashVariable].layerData._layerID === object._el._layerID) {
                            dLayer[hashVariable].layerData.deleted = false;

                            this.arrLayers.splice(object._layerPosition, 0, object._el);
                            this.selectLayer(object._layerPosition);
                            break;

                        }
                        hashVariable++;
                    }
                }
            }else{

            var newLayerName = "",
                thingToPush = {},
                myIndex = 0;
            thingToPush.layerData = {};


            this.currentLayerNumber = this.currentLayerNumber + 1;
            newLayerName = "Layer " + this.currentLayerNumber;
            thingToPush.layerData.layerName = newLayerName;
            thingToPush.layerData.layerID = this.currentLayerNumber;
            thingToPush.layerData.isMainCollapsed = true;
            thingToPush.layerData.isPositionCollapsed = true;
            thingToPush.layerData.isTransformCollapsed = true;
            thingToPush.layerData.isStyleCollapsed = true;
            thingToPush.layerData.arrLayerStyles = [];
            thingToPush.layerData.elementsList = [];
            thingToPush.layerData.deleted = false;
            thingToPush.layerData.isSelected = false;

            thingToPush.layerData.isActive = false;

            thingToPush.layerData.created=false;
            thingToPush.layerData.isTrackAnimated = false;
            thingToPush.layerData.currentKeyframeRule = null;
            thingToPush.layerData.trackPosition = 0;
            thingToPush.layerData.arrStyleTracks = [];
            thingToPush.layerData.tweens = [];

            thingToPush.parentElementUUID = this.hashKey;
            thingToPush.parentElement = this.application.ninja.currentSelectedContainer;

            if (!!this.layerRepetition.selectedIndexes) {
                myIndex = this.layerRepetition.selectedIndexes[0];
                thingToPush.layerData.layerPosition = myIndex;
                thingToPush.layerData.isSelected = true;
                thingToPush.layerData.trackPosition = myIndex;
                this.arrLayers.splice(myIndex, 0, thingToPush);
                this._LayerUndoPosition = myIndex;
                this.selectLayer(myIndex);
                //this.hashLayerNumber.setItem(this.hashKey, thingToPush.layerData);
                this.hashInstance.setItem(this.hashKey, thingToPush.layerData, myIndex);


            } else {
                this.arrLayers.splice(0, 0, thingToPush);
                thingToPush.layerData.layerPosition = this.arrLayers.length - 1;
                this._LayerUndoPosition = this.arrLayers.length - 1;
                //this.hashLayerNumber.setItem(this.hashKey, thingToPush.layerData);
                this.hashInstance.setItem(this.hashKey, thingToPush.layerData, thingToPush.layerData.layerPosition);
                this.selectLayer(0);

            }

            this._LayerUndoObject = thingToPush;
            this._LayerUndoIndex = thingToPush.layerData.layerID;
            this._LayerUndoStatus = true;
            }

        }
    },

    restoreLayer:{
        value:function (ele) {
            var hashIndex = 0 ,layerResult;
            if (this._hashFind) {
                while (layerResult = this.returnedObject[hashIndex]) {
                    if (layerResult.layerData.deleted !== true) {
                        this.arrLayers.push(layerResult);

                    }
                    hashIndex++;
                }
                this._hashFind = false;
            }else {
                var newLayerName = "",
                    thingToPush = {},
                    newTrack = {},
                    myIndex = 0;
                thingToPush.layerData = {};

                this.currentLayerNumber = this.currentLayerNumber + 1;
                newLayerName = "Layer " + this.currentLayerNumber;
                thingToPush.layerData.layerName = newLayerName;
                thingToPush.layerData.layerID = this.currentLayerNumber;
                thingToPush.layerData.bypassAnimation = false;
                thingToPush.layerData.isMainCollapsed = true;
                thingToPush.layerData.isPositionCollapsed = true;
                thingToPush.layerData.isTransformCollapsed = true;
                thingToPush.layerData.isStyleCollapsed = true;
                thingToPush.layerData.arrLayerStyles = [];
                thingToPush.layerData.elementsList = [];
                thingToPush.layerData.deleted = false;
                thingToPush.layerData.isSelected = false;

                thingToPush.layerData.isActive = false;
                
                thingToPush.layerData.created=false;
                thingToPush.layerData.isTrackAnimated = false;
                thingToPush.layerData.currentKeyframeRule = null;
                thingToPush.layerData.trackPosition = 0;
                thingToPush.layerData.arrStyleTracks = [];
                thingToPush.layerData.tweens = [];

                thingToPush.parentElementUUID = this.hashKey;
                thingToPush.parentElement = this.application.ninja.currentSelectedContainer;

                if(this._openDoc){
                    ele.uuid =nj.generateRandom();
                    thingToPush.layerData.elementsList.push(ele);
                }

                if (!!this.layerRepetition.selectedIndexes) {
                    myIndex = this.layerRepetition.selectedIndexes[0];
                    thingToPush.layerData.layerPosition = myIndex;
                    thingToPush.layerData.isSelected = true;
                    thingToPush.layerData.trackPosition = myIndex;
                    this.arrLayers.splice(myIndex, 0, thingToPush);
                    this._LayerUndoPosition = myIndex;
                    this.selectLayer(myIndex);
                    //this.hashLayerNumber.setItem(this.hashKey, thingToPush.layerData);
                    this.hashInstance.setItem(this.hashKey, thingToPush.layerData, myIndex);

                } else {
                    this.arrLayers.splice(0, 0, thingToPush);
                    thingToPush.layerData.layerPosition = this.arrLayers.length - 1;
                    this._LayerUndoPosition = this.arrLayers.length - 1;
                    //this.hashLayerNumber.setItem(this.hashKey, thingToPush.layerData);
                    this.hashInstance.setItem(this.hashKey, thingToPush.layerData, thingToPush.layerData.layerPosition);
                    this.selectLayer(0);

                }

                if(this._openDoc){
                    var selectedIndex = this.getLayerIndexByID(thingToPush.layerData.layerID);
                    this.hashElementMapToLayer.setItem(ele.uuid,ele,this.arrLayers[selectedIndex]);
                    this._openDoc=false;
                }
                this._LayerUndoObject = thingToPush;
                this._LayerUndoIndex = thingToPush.layerData.layerID;
                this._LayerUndoStatus = true;

            }
        }
    },

    deleteLayer:{
        value:function (object) {
            var dLayer,parentNode, hashVariable = 0, k = 0, index = 0, j = 0;
            if (this.arrLayers.length > 0) {
                if (object._undoStatus) {
                   if (object._el.parentElementUUID !== this.application.ninja.currentSelectedContainer.uuid) {
                        dLayer = this.hashInstance.getItem(object._el.parentElementUUID);
                        while (dLayer[hashVariable].layerData) {
                            if (dLayer[hashVariable].layerData._layerID === object._el._layerID) {
                                dLayer[hashVariable].layerData.deleted = true;
                                parentNode = dLayer[hashVariable].parentElement;
                                break;
                            }
                            hashVariable++;
                        }
                        this.application.ninja.currentSelectedContainer = parentNode;
                        this.LayerBinding(parentNode);
                    }
                    else {
                        dLayer = this.hashInstance.getItem(object._el.parentElementUUID);
                        while (dLayer[hashVariable].layerData) {
                            if (dLayer[hashVariable].layerData.deleted === true) {

                            } else if (dLayer[hashVariable].layerData._layerID === object._el._layerID) {
                                while (this.arrLayers.length) {
                                    if (dLayer[hashVariable].layerData._layerID === this.arrLayers[k].layerData._layerID) {
                                        dLayer[hashVariable].layerData.deleted = true;
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
                            hashVariable++;
                        }
                    }
                }
                else {
                    if (!!this.layerRepetition.selectedIndexes) {

                        var myIndex = this.layerRepetition.selectedIndexes[0];
                        this._LayerUndoObject = this.arrLayers[myIndex];

                        dLayer = this.hashInstance.getItem(this.hashKey);
                        dLayer[myIndex].layerData.deleted = true;

                        this.arrLayers.splice(myIndex, 1);
                        this._LayerUndoIndex = this._LayerUndoObject.layerData.layerID;
                        this._LayerUndoPosition = myIndex;

                        if(myIndex===0){
                            this.selectLayer(0);
                        }
                        else{
                            this.selectLayer(myIndex-1);
                        }
                        ElementMediator.deleteElements(dLayer[myIndex].layerData.elementsList);

                    } else {
                        dLayer = this.hashInstance.getItem(this.hashKey);
                        dLayer[this.arrLayers.length - 1].layerData.deleted = true;
                        ElementMediator.deleteElements(dLayer[this.arrLayers.length - 1].layerData.elementsList);
                        this._LayerUndoPosition = this.arrLayers.length - 1;
                        this._LayerUndoObject = this.arrLayers.pop();
                        this._LayerUndoIndex = this._LayerUndoObject.layerData.layerID;

                    }
                }
            }
        }
    },

    handleElementAdded:{
        value:function (event) {
            event.detail.uuid=nj.generateRandom();
            if(this.currentLayerSelected.layerData.elementsList[0]!==undefined){
                if(this.currentLayerSelected.layerData.isTrackAnimated){
                    // need to prevent element adding to dom, not just clear the drawing canvas
                    //this.application.ninja.stage.clearDrawingCanvas();
                    console.log("cannot add elements to a layer with animated element");
                }else{
                    this.hashElementMapToLayer.setItem(event.detail.uuid, event.detail,this.currentLayerSelected);
                    this.currentLayerSelected.layerData.elementsList.push(event.detail);
                }
            }else{
                this.hashElementMapToLayer.setItem(event.detail.uuid, event.detail,this.currentLayerSelected);
                this.currentLayerSelected.layerData.elementsList.push(event.detail);
            }
        }
    },

    handleElementDeleted:{
        value:function (event) {
            var length;
            this.deleteElement = event.detail;
            length = this.currentLayerSelected.layerData.elementsList.length - 1;
            while (length >= 0) {
                if (this.currentLayerSelected.layerData.elementsList[length] === this.deleteElement) {
                    this.currentLayerSelected.layerData.elementsList.splice(length, 1);
                    break;
                }
                length--;
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

                            this.counter = index;
                            while (hashLayerObject[key][this.counter]) {
                                this.counter++;
                            }

                            while (this.counter !== index) {
                                hashLayerObject[key][this.counter] = hashLayerObject[key][this.counter - 1];
                                this.counter = this.counter - 1;
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
            if (layerIndex !== false) {
                this.layerRepetition.selectedIndexes = [layerIndex];
                this.trackRepetition.selectedIndexes = [layerIndex];
                this.currentLayerSelected = this.arrLayers[layerIndex];
                if(userSelection){
                    if(this._captureSelection){
                        if(this.currentLayerSelected.layerData.elementsList.length >= 1){
                            this.application.ninja.selectionController.selectElements(this.currentLayerSelected.layerData.elementsList);
                        }else{
                            this.application.ninja.selectionController.executeSelectElement();
                        }
                    }
                    this._captureSelection = true;
                }
            } else {
                this.layerRepetition.selectedIndexes = null;
                this.trackRepetition.selectedIndexes = null;
                this.currentLayerSelected = null;
            }
        }
    },

    getLayerIndexByID:{
        value:function (layerID) {
            var i = 0,
                returnVal = false,
                arrLayersLength = this.arrLayers.length;

            for (i = 0; i < arrLayersLength; i++) {
                if (this.arrLayers[i].layerData.layerID === layerID) {
                    returnVal = i;
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
        value:function () {
            var cmd = this.addLayerCommand();
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

