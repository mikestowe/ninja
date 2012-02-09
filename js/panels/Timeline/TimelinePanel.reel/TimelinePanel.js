var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var Layer = require("js/panels/Timeline/Layer.reel").Layer;
var TimelineTrack = require("js/panels/Timeline/TimelineTrack.reel").TimelineTrack;
var nj = require("js/lib/NJUtils").NJUtils;

var TimelinePanel = exports.TimelinePanel = Montage.create(Component, {

    hasTemplate:{
        value:true
    },

    /* === BEGIN: Models === */

    // Layer models: arrays for the data and repetition,  current layer number,
    _arrLayers:{
        value:[]
    },
    arrLayers:{
        get:function () {
            return this._arrLayers;
        },
        set:function (newVal) {
            this._arrLayers = newVal;
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

    millisecondsOffset:{
        value:1000
    },

    // Track model
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


    /* === END: Models === */

    /* === BEGIN: Draw cycle === */

    prepareForDraw:{
        value:function () {

            this.eventManager.addEventListener("deleteLayerClick", this, false);
            this.eventManager.addEventListener("newLayer", this, false);
            this.eventManager.addEventListener("deleteLayer", this, false);
            this.eventManager.addEventListener("layerBinding", this, false);
            this.eventManager.addEventListener("elementAdded", this, false);
            this.eventManager.addEventListener("elementDeleted", this, false);
            this.eventManager.addEventListener("deleteSelection", this, false);
            this.hashInstance = this.createLayerHashTable();
            this.hashTrackInstance = this.createTrackHashTable();
            this.hashLayerNumber = this.createLayerNumberHash();
            this.initTimelineView();
        }
    },

    _isLayer:{
        value:false
    },

    _firstTimeLoaded:{
        value:true,
        writable:true
    },

    _arrLayersNonEmpty:{
        value:true,
        writable:true
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

    initTimelineView:{
        value:function () {

            // Get some selectors to make life easier.
            this.layout_tracks = this.element.querySelector(".layout-tracks");
            this.layout_markers = this.element.querySelector(".layout_markers");

            // Add event handlers on the buttons.
            this.newlayer_button.identifier = "addLayer";
            this.newlayer_button.addEventListener("click", this, false);
            this.deletelayer_button.identifier = "deleteLayer";
            this.deletelayer_button.addEventListener("click", this, false);

            // New click listener to handle select/deselect events
            this.timeline_leftpane.addEventListener("click", this.timelineLeftPaneClick.bind(this), false);

            // Simultaneous scrolling of the layer and tracks
            this.layout_tracks.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.user_layers.addEventListener("scroll", this.updateLayerScroll.bind(this), false);

            // Calculate and draw time markers
            this.drawTimeMarkers();

            // Default to one layer for new doc
//            this.newLayer();
            this._hashKey = "123";
            _firstLayerDraw = false;
            NJevent('newLayer', this._hashKey);
            _firstLayerDraw = true;
            this.selectLayer(0);

            // TODO - add condition for existing doc and parse DOM for top level elements
        }
    },

    updateLayerScroll:{
        value:function () {
            this.user_layers.scrollTop = this.layout_tracks.scrollTop;
            this.layout_markers.scrollLeft = this.layout_tracks.scrollLeft;
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

    deselectKeyframes:{
        value:function () {
            for (var i = 0; i < this.selectedKeyframes.length; i++) {
                this.selectedKeyframes[i].deselect();
            }
            this.selectedKeyframes = null;
            this.selectedKeyframes = new Array();
        }
    },

    handleAddLayerClick:{
        value:function (event) {
            //event.stopPropagation();
            this._isLayer = true;
            this.needsDraw = true;
        }
    },

    handleDeleteLayerClick:{
        value:function (event) {
            //event.stopPropagation();
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
            this.currentParentNode = this.application.ninja.currentSelectedContainer.parentNode;

            if (this._firstTimeLoaded) {
                this._firstTimeLoaded = false;
            } else {
                while (this.arrLayers.pop()) {

                }
                while (this.arrTracks.pop()) {
                }

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
            // Check ALL THE CLICKS
            // Are they in a particular layer? If so, we need to select that layer and
            // deselect the others.
            var ptrParent = nj.queryParentSelector(event.target, ".container-layer");
            if (ptrParent !== false) {
                // Why yes, the click was within a layer.  But which one?
                var myIndex = this.getActiveLayerIndex();
                this.selectLayer(myIndex);
            }
        }
    },

    handleNewLayer:{
        value:function (event) {
            // Add a new layer.  It should be added above the currently selected layer,
            // Or at the end, if no layer is selected.
            var hashIndex = 0 , hashVariable = 0, layerResult, trackResult, layerObject, trackObject, dLayer, parentNode;

            this._arrLayersNonEmpty = true;
            if (this._hashFind) {
                while (layerResult = this.returnedObject[hashIndex]) {
                    trackResult = this.returnedTrack[hashIndex];
                    if (layerResult.deleted !== true) {
                        this.arrLayers.push(layerResult);
                        this.arrTracks.push(trackResult);
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
                            this.arrLayers.splice(event.detail._layerPosition, 1, event.detail._el);
                            this.arrTracks.splice(event.detail._layerPosition, 1, event.detail._track);
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
                    this._setBreadCrumb = true;
                    NJevent('breadCrumbTrail', {"element":parentNode, "setFlag":this._setBreadCrumb});
                } else {
                    dLayer = this.hashInstance.getItem(event.detail._el.parentElementUUID);
                    while (dLayer[hashVariable]) {
                        if (dLayer[hashVariable]._layerID === event.detail._el._layerID) {
                            dLayer[hashVariable].deleted = false;
                            this.arrLayers.splice(event.detail._layerPosition, 1, event.detail._el);
                            this.arrTracks.splice(event.detail._layerPosition, 1, event.detail._track);
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
                thingToPush.element = [];
                thingToPush.deleted = false;
                thingToPush.isSelected = false;
                if (_firstLayerDraw) {
                    thingToPush.parentElementUUID = this.application.ninja.currentSelectedContainer.uuid;
                    thingToPush.parentElement = this.application.ninja.currentSelectedContainer;
                }


                newTrack.trackID = this.currentLayerNumber;
                newTrack.isMainCollapsed = true;
                newTrack.isPositionCollapsed = true;
                newTrack.isTransformCollapsed = true;
                newTrack.isStyleCollapsed = false;
                newTrack.tweens = [];

                if (_firstLayerDraw) {
                    if (this.application.ninja.currentSelectedContainer.id === "UserContent") {
                        this._hashKey = "123";
                        thingToPush.parentElementUUID = 123;
                    }
                }

                // If a layer is selcted, splice the new layer on top
                // Otherwise, just push the new layer in at the bottom.

                if (!!this.layerRepetition.selectedIndexes) {
                    myIndex = this.layerRepetition.selectedIndexes[0];
                    thingToPush.layerPosition = myIndex;
                    thingToPush.isSelected = true;
                    newTrack.trackPosition = myIndex;
                    this.arrLayers.splice(myIndex, 0, thingToPush);
                    this.arrTracks.splice(myIndex, 0, newTrack);
                    this._LayerUndoPosition = myIndex;
                    this.selectLayer(myIndex);
                    this.hashLayerNumber.setItem(this._hashKey, thingToPush);
                    this.hashInstance.setItem(this._hashKey, thingToPush, myIndex);
                    this.hashTrackInstance.setItem(this._hashKey, newTrack, myIndex);
                } else {
                    this.arrLayers.splice(0, 0, thingToPush);
                    this.arrTracks.splice(0, 0, newTrack);
                    thingToPush.layerPosition = this.arrLayers.length - 1;
                    newTrack.trackPosition = this.arrTracks.length - 1;
                    this._LayerUndoPosition = this.arrLayers.length - 1;
                    this.hashLayerNumber.setItem(this._hashKey, thingToPush);
                    this.hashInstance.setItem(this._hashKey, thingToPush, thingToPush.layerPosition);
                    this.hashTrackInstance.setItem(this._hashKey, newTrack, newTrack.trackPosition);
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
                if (this.arrLayers.length === 1) {
                    this._arrLayersNonEmpty = false;
                    alert("cannot delete further");
                    return;
                }
                if (event.detail._undoStatus) {
                    if (this.application.ninja.currentSelectedContainer.id === "UserContent" && event.detail._el.parentElementUUID === 123) {
                        dLayer = this.hashInstance.getItem(event.detail._el.parentElementUUID);
                        while (dLayer[hashVariable]) {
                            if (dLayer[hashVariable].deleted === true) {

                            } else if (dLayer[hashVariable]._layerID === event.detail._el._layerID) {
                                while (this.arrLayers.length) {
                                    if (dLayer[hashVariable]._layerID === this.arrLayers[k]._layerID) {
                                        dLayer[hashVariable].deleted = true;
                                        this.arrLayers.splice(k, 1);
                                        this.arrTracks.splice(k, 1);
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
                                parentNode = dLayer[hashVariable].parentElement;
                                break;
                            }
                            hashVariable++;
                        }
                        this._setBreadCrumb = true;
                        NJevent('breadCrumbTrail', {"element":parentNode, "setFlag":this._setBreadCrumb});
                    }
                    else {
                        dLayer = this.hashInstance.getItem(event.detail._el.parentElementUUID);
                        while (dLayer[hashVariable]) {
                            if (dLayer[hashVariable].deleted === true) {

                            } else if (dLayer[hashVariable]._layerID === event.detail._el._layerID) {
                                while (this.arrLayers.length) {
                                    if (dLayer[hashVariable]._layerID === this.arrLayers[k]._layerID) {
                                        dLayer[hashVariable].deleted = true;
                                        this.arrLayers.splice(k, 1);
                                        this.arrTracks.splice(k, 1);
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
                    } else {
                        dLayer = this.hashInstance.getItem(this._hashKey);
                        dTrack = this.hashTrackInstance.getItem(this._hashKey);
                        dLayer[this.arrLayers.length - 1].deleted = true;
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
            this.currentLayerSelected.element.push(event.detail);
            //console.log(this.currentLayerSelected.layerPosition);
            //console.log(this.arrTracks);
        }
    },

    handleElementDeleted:{
        value:function (event) {
            var length;
            this.deleteElement = event.detail;
            length = this.currentLayerSelected.element.length - 1;
            while (length >= 0) {
                if (this.currentLayerSelected.element[length] === this.deleteElement) {
                    this.currentLayerSelected.element.splice(length, 1);
                    break;
                }
                length--;
            }
        }
    },

    drawTimeMarkers:{
        value:function () {
            var i;
            var totalMarkers = Math.floor(this.time_markers.offsetWidth / 80);
            for (i = 0; i < totalMarkers; i++) {
                var timeMark = document.createElement("div");
                var markValue = this.calculateTimeMarkerValue(i);
                timeMark.className = "timemark";
                timeMark.innerHTML = markValue;
                this.time_markers.appendChild(timeMark);
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
//                               console.log(this.application.ninja.currentSelectedContainer)
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
//                                   console.log(hashLayerObject)
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
//                                       console.log(hashTrackObject)
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

    selectLayer:{
        value:function (layerIndex) {
            // Select a layer based on its index.
            // use layerIndex = false to deselect all layers.
            var i = 0,
                arrLayersLength = this.arrLayers.length;

            // First, update this.arrLayers[].isSelected
            for (i = 0; i < arrLayersLength; i++) {
                if (i === layerIndex) {
                    this.arrLayers[i].isSelected = true;
                } else {
                    this.arrLayers[i].isSelected = false;
                }
            }

            // Next, update this.layerRepetition.selectedIndexes and this.currentLayerSelected.
            if (layerIndex !== false) {
                this.layerRepetition.selectedIndexes = [layerIndex];
                this.currentLayerSelected = this.arrLayers[layerIndex]
            } else {
                this.layerRepetition.selectedIndexes = null;
                this.currentLayerSelected = null;
            }
        }
    },

    getLayerIndexByID:{
        value:function (layerID) {
            // Get the index in this.arrLayers that matches a particular layerID.
            // Returns false if no match.
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
            // Get the index in this.arrLayers that matches a particular layerName
            // Returns false if no match
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
            // Searches through the layers and looks for one that has
            // set its isActive flag to true.
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

            if (this._arrLayersNonEmpty) {
                NJevent("sendToUndo", cmd);
            }


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
