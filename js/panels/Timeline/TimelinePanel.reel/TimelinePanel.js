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
            this.updateLayers();
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
    updateLayers : {
    	value: function() {
		this.application.ninja.currentDocument.tlArrLayers = this.arrLayers;
		// this.application.ninja.currentDocument.tlArrTracks = this.arrTracks;
		console.log('inside of updateLayers ');
		console.log(this.application.ninja.currentDocument.tlArrTracks);

    	}
    },
    boolUpdateLayers : {
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
            }
        }
    },

    currentLayerSelected:{
        value: null
    },

    currentTrackSelected:{
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

    _arrTracks:{
        serializable:true,
        value:[]
    },

    arrTracks:{
        serializable:true,
        get:function () {
            return this._arrTracks;
        },
        set:function (newVal) {
            this._arrTracks = newVal;
            this.updateLayers();
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

    handleOnOpenDocument:{
        value:function(){
        	this.boolUpdateLayers = false;
        	this.clearTimelinePanel();
        	this.boolUpdateLayers = true;
            this.eventManager.addEventListener("deleteLayerClick", this, false);
            this.eventManager.addEventListener("newLayer", this, false);
            this.eventManager.addEventListener("deleteLayer", this, false);
            this.eventManager.addEventListener("layerBinding", this, false);
            this.eventManager.addEventListener("elementAdded", this, false);
            this.eventManager.addEventListener("elementDeleted", this, false);
            this.eventManager.addEventListener("deleteSelection", this, false);
            this.eventManager.addEventListener("selectionChange", this, true);
            this.hashInstance = this.createLayerHashTable();
            this.hashTrackInstance = this.createTrackHashTable();
            this.hashLayerNumber = this.createLayerNumberHash();
            this.hashElementMapToLayer = this.createElementMapToLayer();
            this.initTimelineView();


        }
    },
    
    handleCloseDocument: {
    	value: function(event) {
    		this.clearTimelinePanel();
			this.arrTracks = [];
			this.arrLayers = [];
    	}
    },
    
    handleSwitchDocument : {
    	value: function(event) {
    		// Handle document change.
    		this.handleOnOpenDocument();
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
			
		}
	},
    initTimelineView:{
        value:function () {
            var myIndex;
			this.drawTimeMarkers();
			this._hashKey = "123";
            
            
            // Document switching
			// Check to see if we have saved timeline information in the currentDocument.
			if (typeof(this.application.ninja.currentDocument.isTimelineInitialized) === "undefined") {
				// No, we have no information stored.  Create it.
				console.log('newfile!')
				this.application.ninja.currentDocument.isTimelineInitialized = true;
				this.application.ninja.currentDocument.tlArrLayers = [];
				this.application.ninja.currentDocument.tlArrTracks = [];
				_firstLayerDraw = false;
	            if(!this.application.ninja.documentController.creatingNewFile){
	                if(this.application.ninja.currentDocument.documentRoot.children[0]){
	                    myIndex=0;
	                    while(this.application.ninja.currentDocument.documentRoot.children[myIndex])
	                    {
	                        this._openDoc=true;
	                        NJevent('newLayer',{key:this._hashKey,ele:this.application.ninja.currentDocument.documentRoot.children[myIndex]})
	                        myIndex++;
	                    }
	                }
	                else{
	                    NJevent('newLayer', this._hashKey);
	                    this.selectLayer(0);
	                }
	            }else{
	                NJevent('newLayer', this._hashKey);
	                this.selectLayer(0);
	
	            }
	            _firstLayerDraw = true;
				this.application.ninja.currentDocument.tlArrTracks = this.arrTracks;
			} else {
				// we do have information stored.  Use it.
				console.log('oldfile!')
				console.log("tlArrLayers: " , this.application.ninja.currentDocument.tlArrLayers);
				console.log("tlArrTracks: " , this.application.ninja.currentDocument.tlArrTracks);
				this.arrLayers = this.application.ninja.currentDocument.tlArrLayers;
				this.arrTracks = this.application.ninja.currentDocument.tlArrTracks;
			}
			
    		// Redraw all the things
    		this.layerRepetition.needsDraw = true;
    		this.trackRepetition.needsDraw = true;
    		this.needsDraw = true;


        }
    },
    
    clearTimelinePanel : {
    	value: function() {
    		// Remove events
    		this.eventManager.removeEventListener("deleteLayerClick", this, false);
            this.eventManager.removeEventListener("newLayer", this, false);
            this.eventManager.removeEventListener("deleteLayer", this, false);
            this.eventManager.removeEventListener("layerBinding", this, false);
            this.eventManager.removeEventListener("elementAdded", this, false);
            this.eventManager.removeEventListener("elementDeleted", this, false);
            this.eventManager.removeEventListener("deleteSelection", this, false);
            this.eventManager.removeEventListener("selectionChange", this, true);
            
            // Remove every event listener for every tween in TimelineTrack
            this.deselectTweens();

    		// Reset visual appearance
            this.application.ninja.timeline.playhead.style.left = "-2px";
            this.application.ninja.timeline.playheadmarker.style.left = "0px";
            this.application.ninja.timeline.updateTimeText(0.00);
            this.timebar.style.width = "0px";
            
            // Clear variables--including repetitions.
            this.hashInstance = null;
            this.hashTrackInstance = null;
            this.hashLayerNumber = null;
            this.hashElementMapToLayer = null;
			if (!this.boolUpdateLayers) {

			}

    		this.currentLayerNumber = 0;
    		this.currentLayerSelected = false;
    		this.currentTrackSelected = false;
    		this.selectedKeyframes = [];
    		this.selectedTweens = [];
    		this._captureSelection = false;
    		this._openDoc = false;
    		this.end_hottext.value = 25;
    		this.updateTrackContainerWidth();
    		
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

    captureSelectionChange:{
        value:function(){
            var key , switchSelectedLayer,layerIndex;
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
            this._deleteKeyDown = false;
            if (this.application.ninja.currentSelectedContainer.id === "UserContent") {
                this._hashKey = "123";
            }
            this.removeLayer();
        }
    },

    handleLayerBinding:{
        value:function (event) {
            var i = 0;

            if (this._firstTimeLoaded) {
                this._firstTimeLoaded = false;
            } else {
                this.arrLayers.length = 0;
                this.arrTracks.length = 0;

                if (event.detail.element.id === "UserContent") {
                    this._hashKey = "123";
                } else {
                    this._hashKey = event.detail.element.uuid;
                }
                if (this.returnedObject = this.hashInstance.getItem(this._hashKey)) {
                    this.returnedTrack = this.hashTrackInstance.getItem(this._hashKey);
                    this._hashFind = true;
                }
                this.currentLayerNumber = 0;
                NJevent('newLayer', event.detail);
                this.selectLayer(0);
            }
        }
    },

    timelineLeftPaneClick:{
        value:function (event) {
            var ptrParent = nj.queryParentSelector(event.target, ".container-layer");
            if (ptrParent !== false) {
                var myIndex = this.getActiveLayerIndex();
                this.selectLayer(myIndex);
            }
        }
    },

    handleNewLayer:{
        value:function (event) {
            var hashIndex = 0 , hashVariable = 0, layerResult, trackResult, layerObject, trackObject, dLayer, parentNode;

            if (this._hashFind) {
                while (layerResult = this.returnedObject[hashIndex]) {
                    trackResult = this.returnedTrack[hashIndex];
                    if (layerResult.deleted !== true) {
                        this.arrTracks.push(trackResult);
                        this.arrLayers.push(layerResult);

                    }
                    hashIndex++;
                }
                this._hashFind = false;
                return;
            }
            if (event.detail._undoStatus) {
                if (this.application.ninja.currentSelectedContainer.id === "UserContent" && event.detail._el.parentElementUUID === 123) {
                    dLayer = this.hashInstance.getItem(event.detail._el.parentElementUUID);
                    while (dLayer[hashVariable]) {
                        if (dLayer[hashVariable]._layerID === event.detail._el._layerID) {
                            dLayer[hashVariable].deleted = false;
                            this.arrTracks.splice(event.detail._layerPosition, 0, event.detail._track);
                            this.arrLayers.splice(event.detail._layerPosition, 0, event.detail._el);
                            this.selectLayer(event.detail._layerPosition);
                            break;

                        }
                        hashVariable++;
                    }

                }

                else if (event.detail._el.parentElementUUID !== this.application.ninja.currentSelectedContainer.uuid) {
                    dLayer = this.hashInstance.getItem(event.detail._el.parentElementUUID);
                    while (dLayer[hashVariable]) {
                        if (dLayer[hashVariable]._layerID === event.detail._el._layerID) {
                            dLayer[hashVariable].deleted = false;
                            parentNode = dLayer[hashVariable].parentElement;
                            break;
                        }
                        hashVariable++;
                    }
                    this.application.ninja.currentSelectedContainer = parentNode;
                } else {
                    dLayer = this.hashInstance.getItem(event.detail._el.parentElementUUID);
                    while (dLayer[hashVariable]) {
                        if (dLayer[hashVariable]._layerID === event.detail._el._layerID) {
                            dLayer[hashVariable].deleted = false;
                            this.arrTracks.splice(event.detail._layerPosition, 0, event.detail._track);
                            this.arrLayers.splice(event.detail._layerPosition, 0, event.detail._el);
                            this.selectLayer(event.detail._layerPosition);
                            break;

                        }
                        hashVariable++;
                    }
                }
            }


            else {
                var newLayerName = "",
                    thingToPush = {},
                    newTrack = {},
                    myIndex = 0;

                this.currentLayerNumber = this.hashLayerNumber.getItem(this._hashKey);
                if (this.currentLayerNumber === undefined) {
                    this.currentLayerNumber = 0;
                }

                this.currentLayerNumber = this.currentLayerNumber + 1;
                newLayerName = "Layer " + this.currentLayerNumber;
                thingToPush.layerName = newLayerName;
                thingToPush.layerID = this.currentLayerNumber;
                thingToPush.isMainCollapsed = true;
                thingToPush.isPositionCollapsed = true;
                thingToPush.isTransformCollapsed = true;
                thingToPush.isStyleCollapsed = true;
                thingToPush.arrLayerStyles = [];
                thingToPush.elementsList = [];
                thingToPush.deleted = false;
                thingToPush.isSelected = false;
                thingToPush.created=false;
                if (_firstLayerDraw) {

                    this.application.ninja.currentSelectedContainer.uuid=this._hashKey;
                    thingToPush.parentElementUUID = this._hashKey;
                    thingToPush.parentElement = this.application.ninja.currentSelectedContainer;
                }

                if(this._openDoc){
                    event.detail.ele.uuid =nj.generateRandom();
                    thingToPush.elementsList.push(event.detail.ele);
                }

                newTrack.trackID = this.currentLayerNumber;
                newTrack.isMainCollapsed = true;
                newTrack.isPositionCollapsed = true;
                newTrack.isTransformCollapsed = true;
                newTrack.isStyleCollapsed = true;
                newTrack.isTrackAnimated = false;
                newTrack.currentKeyframeRule = null;
                newTrack.trackPosition = 0;
                newTrack.arrStyleTracks = [];
                newTrack.tweens = [];

                if (_firstLayerDraw) {
                    if (this.application.ninja.currentSelectedContainer.id === "UserContent") {
                        this._hashKey = "123";
                        this.application.ninja.currentSelectedContainer.uuid=this._hashKey;
                        thingToPush.parentElementUUID = 123;
                    }
                }

                if (!!this.layerRepetition.selectedIndexes) {
                    myIndex = this.layerRepetition.selectedIndexes[0];
                    thingToPush.layerPosition = myIndex;
                    thingToPush.isSelected = true;
                    newTrack.trackPosition = myIndex;
                    this.arrTracks.splice(myIndex, 0, newTrack);
                    this.arrLayers.splice(myIndex, 0, thingToPush);
                    this._LayerUndoPosition = myIndex;
//                    this.selectLayer(myIndex);
                    this.hashLayerNumber.setItem(this._hashKey, thingToPush);
                    this.hashInstance.setItem(this._hashKey, thingToPush, myIndex);
                    this.hashTrackInstance.setItem(this._hashKey, newTrack, myIndex);
                } else {
                    this.arrTracks.splice(0, 0, newTrack);
                    this.arrLayers.splice(0, 0, thingToPush);
                    thingToPush.layerPosition = this.arrLayers.length - 1;
                    newTrack.trackPosition = this.arrTracks.length - 1;
                    this._LayerUndoPosition = this.arrLayers.length - 1;
                    this.hashLayerNumber.setItem(this._hashKey, thingToPush);
                    this.hashInstance.setItem(this._hashKey, thingToPush, thingToPush.layerPosition);
                    this.hashTrackInstance.setItem(this._hashKey, newTrack, newTrack.trackPosition);
//                    this.selectLayer(0);

                }

                if(this._openDoc){
                    var selectedIndex = this.getLayerIndexByID(thingToPush.layerID)
                    this.hashElementMapToLayer.setItem(event.detail.ele.uuid, event.detail.ele,this.arrLayers[selectedIndex]);
                    this._openDoc=false;
                }
                this._LayerUndoObject = thingToPush;
                this._LayerUndoIndex = thingToPush.layerID;
                this._LayerUndoStatus = true;
                this._TrackUndoObject = newTrack;



            }
        }
    },

    handleDeleteLayer:{
        value:function (event) {
            var dLayer, dTrack, parentNode, hashVariable = 0, k = 0, index = 0, j = 0;

            if (this.arrLayers.length > 0) {
                if (event.detail._undoStatus) {
                    if (this.application.ninja.currentSelectedContainer.id === "UserContent" && event.detail._el.parentElementUUID === 123) {
                        dLayer = this.hashInstance.getItem(event.detail._el.parentElementUUID);
                        while (dLayer[hashVariable]) {
                            if (dLayer[hashVariable].deleted === true) {

                            } else if (dLayer[hashVariable]._layerID === event.detail._el._layerID) {
                                while (this.arrLayers.length) {
                                    if (dLayer[hashVariable]._layerID === this.arrLayers[k]._layerID) {
                                        dLayer[hashVariable].deleted = true;
//                                        ElementMediator.deleteElements(dLayer[myIndex].element);
                                        this.arrLayers.splice(k, 1);
                                        this.arrTracks.splice(k, 1);
                                        if(k>0){
                                            this.selectLayer(k-1);
                                        }else{
                                            this.selectLayer(k)
                                        }
                                        break;
                                    }
                                    k++;
                                }
                            }
                            hashVariable++;
                        }

                    } else if (event.detail._el.parentElementUUID !== this.application.ninja.currentSelectedContainer.uuid) {
                        dLayer = this.hashInstance.getItem(event.detail._el.parentElementUUID);
                        while (dLayer[hashVariable]) {
                            if (dLayer[hashVariable]._layerID === event.detail._el._layerID) {
                                dLayer[hashVariable].deleted = true;
//                                ElementMediator.deleteElements(dLayer[myIndex].element);
                                parentNode = dLayer[hashVariable].parentElement;
                                break;
                            }
                            hashVariable++;
                        }
                        this.application.ninja.currentSelectedContainer = parentNode;
                    }
                    else {
                        dLayer = this.hashInstance.getItem(event.detail._el.parentElementUUID);
                        while (dLayer[hashVariable]) {
                            if (dLayer[hashVariable].deleted === true) {

                            } else if (dLayer[hashVariable]._layerID === event.detail._el._layerID) {
                                while (this.arrLayers.length) {
                                    if (dLayer[hashVariable]._layerID === this.arrLayers[k]._layerID) {
                                        dLayer[hashVariable].deleted = true;
//                                        ElementMediator.deleteElements(dLayer[myIndex].element);
                                        this.arrLayers.splice(k, 1);
                                        this.arrTracks.splice(k, 1);
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
                        this._TrackUndoObject = this.arrTracks[myIndex];

                        dLayer = this.hashInstance.getItem(this._hashKey);
                        dTrack = this.hashTrackInstance.getItem(this._hashKey);
                        dLayer[myIndex].deleted = true;

                        this.arrLayers.splice(myIndex, 1);
                        this.arrTracks.splice(myIndex, 1);
                        this._LayerUndoIndex = this._LayerUndoObject.layerID;
                        this._LayerUndoPosition = myIndex;

                        if(myIndex===0){
                            this.selectLayer(0);
                        }
                        else{
                            this.selectLayer(myIndex-1);
                        }
                        ElementMediator.deleteElements(dLayer[myIndex].elementsList);

                    } else {
                        dLayer = this.hashInstance.getItem(this._hashKey);
                        dTrack = this.hashTrackInstance.getItem(this._hashKey);
                        dLayer[this.arrLayers.length - 1].deleted = true;
                        ElementMediator.deleteElements(dLayer[this.arrLayers.length - 1].elementsList);
                        this._LayerUndoPosition = this.arrLayers.length - 1;
                        this._LayerUndoObject = this.arrLayers.pop();
                        this._LayerUndoIndex = this._LayerUndoObject.layerID;
                        this._TrackUndoObject = this.arrTracks.pop();
                    }
                }
            }
        }
    },

    handleElementAdded:{
        value:function (event) {
            event.detail.uuid=nj.generateRandom();
            this.hashElementMapToLayer.setItem(event.detail.uuid, event.detail,this.currentLayerSelected);
            this.currentLayerSelected.elementsList.push(event.detail);

        }
    },

    handleElementDeleted:{
        value:function (event) {
            var length;
            this.deleteElement = event.detail;
            length = this.currentLayerSelected.elementsList.length - 1;
            while (length >= 0) {
                if (this.currentLayerSelected.elementsList[length] === this.deleteElement) {
                    this.currentLayerSelected.elementsList.splice(length, 1);
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

    createTrackHashTable:{
        value:function (key, value) {
            var hashTrackObject;
            hashTrackObject = Object.create(Object.prototype, {
                counter:{
                    value:0,
                    writable:true
                },

                setItem:{
                    value:function (key, value, index) {
                        if (hashTrackObject[key] === undefined) {
                            hashTrackObject[key] = {};

                        }
                        if (hashTrackObject[key][index] !== undefined) {
                            this.counter = index;
                            while (hashTrackObject[key][this.counter]) {
                                this.counter++;
                            }
                            while (this.counter !== index) {
                                hashTrackObject[key][this.counter] = hashTrackObject[key][this.counter - 1];
                                this.counter = this.counter - 1;
                            }
                        }
                        hashTrackObject[key][index] = value;
                        this.counter = 0;
                    }
                },

                getItem:{
                    value:function (key) {
                        return hashTrackObject[key];
                    }
                }
            });
            return hashTrackObject;
        }
    },

    createLayerNumberHash:{
        value:function (key, value) {
            var hashLayerNumberObject;
            hashLayerNumberObject = Object.create(Object.prototype, {
                setItem:{
                    value:function (key, value) {
                        if (value !== undefined) {
                            hashLayerNumberObject[key] = value.layerID;
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
                          this.mappingArray[key].layerID = layer.layerID;

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
        value:function (layerIndex) {
            var i = 0,
                arrLayersLength = this.arrLayers.length;

            if(this.selectedKeyframes){
                this.deselectTweens();
            }

            for (i = 0; i < arrLayersLength; i++) {
                if (i === layerIndex) {
                    this.arrLayers[i].isSelected = true;
                } else {
                    this.arrLayers[i].isSelected = false;
                }
            }

            if (layerIndex !== false) {
                this.layerRepetition.selectedIndexes = [layerIndex];
                this.trackRepetition.selectedIndexes = [layerIndex];
                this.currentLayerSelected = this.arrLayers[layerIndex];
                this.currentTrackSelected = this.arrTracks[layerIndex];
                if(!this._openDoc){
                    if(this._captureSelection){
                        this.application.ninja.selectionController.selectElements(this.currentLayerSelected.elementsList)
                    }
                    this._captureSelection = true;
                }
            } else {
                this.layerRepetition.selectedIndexes = null;
                this.trackRepetition.selectedIndexes = null;
                this.currentLayerSelected = null;
                this.currentTrackSelected = null;
            }

        }
    },

    getLayerIndexByID:{
        value:function (layerID) {
            var i = 0,
                returnVal = false,
                arrLayersLength = this.arrLayers.length;

            for (i = 0; i < arrLayersLength; i++) {
                if (this.arrLayers[i].layerID === layerID) {
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
                if (this.arrLayers[i].layerName === layerName) {
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
                if (this.arrLayers[i].isActive === true) {
                    returnVal = i;
                    this.arrLayers[i].isActive = false;
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
            cmd._track = this._TrackUndoObject;
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
            cmd._track = this._TrackUndoObject;
            NJevent("sendToUndo", cmd);

        }
    },

    addLayerCommand:{
        value:function () {
            var command;
            command = Object.create(Object.prototype, {
                _el:{value:null, writable:true},
                _layerID:{value:null, writable:true},
                _layerPosition:{value:null, writable:true},
                _undoStatus:{value:false, writable:true},
                _track:{value:null, writable:true},
                description:{ value:"Add Layer"},
                receiver:{value:TimelinePanel},
                execute:{
                    value:function () {

                        NJevent('newLayer', this)


                    }
                },
                unexecute:{
                    value:function () {
                        NJevent('deleteLayer', this)

                    }
                }
            });
            return command;
        }
    },

    deleteLayerCommand:{
        value:function () {
            var command;
            command = Object.create(Object.prototype, {
                description:{ value:"Delete Layer"},
                receiver:{value:TimelinePanel},
                execute:{
                    value:function () {
                        NJevent('deleteLayer', this)
                    }
                },
                unexecute:{
                    value:function () {
                        NJevent('newLayer', this)
                    }
                }
            });
            return command;
        }
    }
    /* === END: Controllers === */
});

