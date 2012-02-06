var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var Layer = require("js/panels/Timeline/Layer.reel").Layer;
var TimelineTrack = require("js/panels/Timeline/TimelineTrack.reel").TimelineTrack;
// var Track = require("js/panels/Timeline/Track.reel").Track;

var TimelinePanel = exports.TimelinePanel = Montage.create(Component, {

	hasTemplate: {
		value: true
	},
	
	/* === BEGIN: Models === */
	
	// Layer models: arrays for the data and repetition,  current layer number, 
	_arrLayers : {
		value: []
	},
	arrLayers: {
		get: function() {
			return this._arrLayers;
		},
		set: function(newVal) {
			this._arrLayers = newVal;
		}
	},
	
	_layerRepetition: {
		value: null
	},
	layerRepetition: {
		get: function() {
			return this._layerRepetition;
		},
		set: function(newVal) {
			this._layerRepetition = newVal;
		}
	},
	
    currentLayerNumber:{ 
    	value:0
    },

    millisecondsOffset:{
        value:5000
    },

    // Track model
    _arrTracks: {
    	serializable: true,
    	value: []
    },
    arrTracks: {
    	serializable: true,
    	get: function() {
    		return this._arrTracks;
    	},
    	set: function(newVal) {
    		this._arrTracks = newVal;
    	}
    },
    _trackRepetition: {
    	serializable: true,
    	value: null
    },
    trackRepetition : {
    	serializable: true,
    	get: function() {
    		return this._trackRepetition;
    	},
    	set: function(newVal) {
    		this._trackRepetition = newVal;
    	}
    },

    _selectedKeyframes:{
        value:[]
    },

    selectedKeyframes:{
        serializable: true,
        get: function() {
            return this._selectedKeyframes;
        },
        set: function(value){
            this._selectedKeyframes = value;
        }
    },


	/* === END: Models === */
	
	/* === BEGIN: Draw cycle === */

    prepareForDraw: {
        value: function() {

            this.eventManager.addEventListener("deleteLayerClick", this, false);
            this.eventManager.addEventListener("newLayer", this, false);
            this.eventManager.addEventListener("deleteLayer", this, false);

            this.initTimelineView();
        }
    },
    _isLayer: {
    	value: false
    },

    willDraw: {
    	value: function() {
    		if (this._isLayer) {
                
    			this.insertLayer();
    			this._isLayer = false;
    		}
    	}
    },


    
    /* === END: Draw cycle === */

	/* === BEGIN: Controllers === */
	
	// Initialize the timeline
    initTimelineView : {
        value:function(){
        	
        	// Get some selectors for future use
        	this.layout_tracks = this.layer_tracks.querySelector(".layout-tracks");
        	this.layout_markers = this.element.querySelector(".layout_markers");

			// Add event handlers on the buttons.
			this.newlayer_button.identifier = "addLayer";
			this.newlayer_button.addEventListener("click", this, false);
			this.deletelayer_button.identifier = "deleteLayer";
			this.deletelayer_button.addEventListener("click", this, false);

			// Simultaneous scrolling of the layer and tracks
            this.layout_tracks.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.user_layers.addEventListener("scroll", this.updateLayerScroll.bind(this), false);

            // Calculate and draw time markers
            this.drawTimeMarkers();

            // Default to one layer for new doc
//            this.newLayer();
            NJevent('newLayer',1);
            // TODO - add condition for existing doc and parse DOM for top level elements
        }
    },

    deselectKeyframes:{
        value: function(){
            for(var i in this.selectedKeyframes){
                this.selectedKeyframes[i].deselect();
            }
            this.selectedKeyframes = null;
            this.selectedKeyframes = new Array();
        }
    },

    updateLayerScroll:{
        value:function(){
        	// Link tracks and layers together for vertical scrolling
            this.user_layers.scrollTop = this.layout_tracks.scrollTop;
            
            // Link tracks and markers together for horizontal scrolling
            this.layout_markers.scrollLeft = this.layout_tracks.scrollLeft;
            
            // Link tracks and master track together for horizontal scrolling?
            this.master_track.scrollLeft = this.layout_tracks.scrollLeft;
        }
    },

    handleAddLayerClick:{
        value:function(event){
        	event.stopPropagation();
            //this.newLayer();
            this._isLayer = true;
            this.needsDraw = true;

        }
    },

    handleDeleteLayerClick:{
        value:function(event){
        	event.stopPropagation();
//            this.deleteLayer();
            this.removeLayer()
        }
    },

    handleNewLayer:{
        value:function(event){
			// Add a new layer.  It should be added above the currently selected layer, 
			// Or at the end, if no layer is selected.
			var newLayerName = "",
				//thingToPush = Layer.create(),
				thingToPush = {},
				// newTrack = TimelineTrack.create(),
				newTrack = {},
				myIndex = 0;


            if(event.detail._undoStatus){

                this.arrLayers.splice(event.detail._layerPosition,0,event.detail._el)
                this.arrTracks.splice(event.detail._layerPosition,0,event.detail._track)

            }
            else{
			// Build the thingToPush object

                this.currentLayerNumber = this.currentLayerNumber +1;
                newLayerName = "Layer " + this.currentLayerNumber;
                thingToPush.layerName = newLayerName;
                thingToPush.layerID = this.currentLayerNumber;
                thingToPush.isMainCollapsed = true;
                thingToPush.isPositionCollapsed = true;
                thingToPush.isTransformCollapsed = true;
                thingToPush.isStyleCollapsed = false;
                thingToPush.arrLayerStyles = [];
                
                newTrack.trackID = this.currentLayerNumber;
                newTrack.isMainCollapsed = true;
                newTrack.isPositionCollapsed = true;
                newTrack.isTransformCollapsed = true;
                newTrack.isStyleCollapsed = false;
                newTrack.tweens = [];

                // If a layer is selcted, splice the new layer on top
                // Otherwise, just push the new layer in at the bottom.

                if (!!this.layerRepetition.selectedIndexes) {
                    myIndex = this.layerRepetition.selectedIndexes[0];
                    this.arrLayers.splice(myIndex, 0, thingToPush);
                    this.layerRepetition.selectedIndexes = [myIndex];
                    this._LayerUndoPosition = myIndex;
                    this.arrTracks.splice(myIndex, 0, newTrack);

                } else {
                    this.arrLayers.push(thingToPush);
                    this.arrTracks.push(newTrack);
                    this._LayerUndoPosition = this.arrLayers.length-1;



                }

                this._LayerUndoObject = thingToPush;
                this._LayerUndoIndex = thingToPush.layerID ;
                this._LayerUndoStatus = true;

                this._TrackUndoObject = newTrack;
                

            }


        }
    },

    handleDeleteLayer:{
        value:function(event){

			if (this.arrLayers.length > 0) {

                if(event.detail._undoStatus){

                        this.arrLayers.splice(event.detail._layerPosition,1)
                        this.arrTracks.splice(event.detail._layerPosition,1)

                }else{

				        if (!!this.layerRepetition.selectedIndexes) {

					            var myIndex = this.layerRepetition.selectedIndexes[0];
                                this._LayerUndoObject=this.arrLayers[myIndex]
                                this._TrackUndoObject=this.arrTracks[myIndex]
					            this.arrLayers.splice(myIndex, 1);
                                this.arrTracks.splice(myIndex, 1);
                                this._LayerUndoIndex = this._LayerUndoObject.layerID;
                                this._LayerUndoPosition = myIndex;
					
				    }   else {
                                this._LayerUndoPosition = this.arrLayers.length-1
                                this._LayerUndoObject = this.arrLayers.pop();
                                this._LayerUndoIndex = this._LayerUndoObject.layerID;
                                this._TrackUndoObject = this.arrTracks.pop();

					//alert('TODO: what should happen when no layer is selected and the user clicks the delete button?')
				    }

                    this._LayerUndoStatus = true;
             }

				// TODO: actually remove the selected style from the layer. (Maybe by publishing an event?)
			}
        }
    },

    drawTimeMarkers:{
        value:function(){
            var i;
            var totalMarkers = Math.floor(this.time_markers.offsetWidth / 80);
            for(i=0;i<totalMarkers;i++){
                var timeMark = document.createElement("div");
                var markValue = this.calculateTimeMarkerValue(i);
                timeMark.className = "timemark";
                timeMark.innerHTML = markValue;
                this.time_markers.appendChild(timeMark);
            }
        }
    },

    calculateTimeMarkerValue:{
        value:function(currentMarker){
            var timeToReturn;
            var currentMilliseconds = currentMarker * this.millisecondsOffset;

            var sec = (Math.floor((currentMilliseconds/1000)))%60;
            var min = (Math.floor((currentMilliseconds/1000)/60))%60;

            var milliSec = String(Math.round(currentMilliseconds/10));
            var returnMillisec = milliSec.slice(milliSec.length-2, milliSec.length);

            var returnSec;
            var returnMin;
            if(sec < 10){
                returnSec = "0" + sec;
            } else {
                returnSec = sec;
            }
            if(min < 10){
                returnMin = "0" + min;
            } else {
                returnMin = min;
            }
            if(currentMarker == 0) {
                returnMillisec = "00";
            }

            timeToReturn = returnMin + ":" + returnSec + ":" + returnMillisec;

            return timeToReturn;
        }
    },


    insertLayer: {
        value: function() {

                var cmd = this.addLayerCommand();
                cmd.execute();
                cmd._el=this._LayerUndoObject;
                cmd._layerID = this._LayerUndoIndex;
                cmd._layerPosition = this._LayerUndoPosition
                cmd._undoStatus = this._LayerUndoStatus;
                cmd._track = this._TrackUndoObject;

                NJevent("sendToUndo", cmd);



        }
    },

    removeLayer: {
        value: function() {

                var cmd = this.deleteLayerCommand();
                cmd.execute();
                cmd._el=this._LayerUndoObject;
                cmd._layerID = this._LayerUndoIndex;
                cmd._layerPosition = this._LayerUndoPosition
                cmd._undoStatus = this._LayerUndoStatus;
                cmd._track = this._TrackUndoObject;

                NJevent("sendToUndo", cmd);


        }
    },

    addLayerCommand: {
            value : function(){
            var command;

                command = Object.create(Object.prototype, {

                _el:{value:null,writable:true},
                _layerID:{value:null,writable:true},
                _layerPosition:{value:null,writable:true},
                _undoStatus:{value:false,writable:true},
                _track:{value:null,writable:true},


                    description: { value: "Add Layer"},
                    receiver : {value: TimelinePanel},

                    execute: {
                        value: function() {

                            NJevent('newLayer',this)

                        }
                    },

                    unexecute: {
                        value: function() {


                            NJevent('deleteLayer',this)

                        }
                    }
                });

                return command;
            }
        },


    deleteLayerCommand: {
               value : function(){
               var command;


                   command = Object.create(Object.prototype, {


                       description: { value: "Delete Layer"},
                       receiver : {value: TimelinePanel},

                       execute: {
                           value: function() {
                               NJevent('deleteLayer',this)
                           }
                       },

                       unexecute: {
                           value: function() {
                               NJevent('newLayer',this)

                           }
                       }
                   });

                   return command;
               }
           }
    /* === END: Controllers === */
});