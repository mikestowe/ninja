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


    /* === END: Models === */
   
    /* === BEGIN: Draw cycle === */

    prepareForDraw: {
        value: function() {

            this.eventManager.addEventListener("deleteLayerClick", this, false);
            this.eventManager.addEventListener("newLayer", this, false);
            this.eventManager.addEventListener("deleteLayer", this, false);
            this.eventManager.addEventListener( "layerBinding", this, false);
            this.eventManager.addEventListener("elementAdded", this, false);
            this.eventManager.addEventListener("elementDeleted", this, false);
            this.eventManager.addEventListener("deleteSelection", this, false);
            this.hashInstance=this.createLayerHashTable();
            this.hashTrackInstance=this.createTrackHashTable();
            this.initTimelineView();
        }
    },
    _isLayer: {
        value: false
    },

    _isLayerAdded:{
        value:false
    },

    addButtonClicked:{
        value:true
    },

    willDraw: {
        value: function() {
            if (this._isLayer) {
                this.addButtonClicked=false;
                this._isElementAdded=true;
                NJevent('newLayer',this)
                this._isLayer = false;
                this.addButtonClicked=true;
            }
        }
    },

    /* === END: Draw cycle === */

    /* === BEGIN: Controllers === */
   
    // Initialize the timeline
    initTimelineView : {
        value:function(){

            // Add event handlers on the buttons.
            this.newlayer_button.identifier = "addLayer";
            this.newlayer_button.addEventListener("click", this, false);
            this.deletelayer_button.identifier = "deleteLayer";
            this.deletelayer_button.addEventListener("click", this, false);

            // Simultaneous scrolling of the layer and tracks
            this.layer_tracks.addEventListener("scroll", this.updateLayerScroll.bind(this), false);
            this.user_layers.addEventListener("scroll", this.updateLayerScroll.bind(this), false);

            // Calculate and draw time markers
            this.drawTimeMarkers();

            // Default to one layer for new doc
//            this.newLayer();
            NJevent('newLayer');
            // TODO - add condition for existing doc and parse DOM for top level elements
        }
    },

    updateLayerScroll:{
        value:function(){
            this.user_layers.scrollTop = this.layer_tracks.scrollTop;
            this.master_track.scrollLeft = this.layer_tracks.scrollLeft;
        }
    },

    handleAddLayerClick:{
        value:function(event){
            event.stopPropagation();
            this._isLayer = true;
            this.needsDraw = true;

        }
    },

    handleDeleteLayerClick:{
        value:function(event){
            event.stopPropagation();
            this._deleteKeyDown=false;
            NJevent('deleteLayer')
        }
    },

    handleLayerBinding:{
        value:function(event){
             var i=0;
             this.currentParentNode=this.application.ninja.currentSelectedContainer.parentNode;
             this.removeLayerFromParentUUid = this.application.ninja.currentSelectedContainer.parentNode.uuid;
             this.currentElement= event.detail.element;

             while(this.arrLayers.pop()){
             }
             while(this.arrTracks.pop()){
             }


             this._hashKey = event.detail.element.uuid;
             if(this.returnedObject = this.hashInstance.getItem(this._hashKey)){
                this.returnedTrack = this.hashTrackInstance.getItem(this._hashKey);
                this._hashFind = true;
                NJevent('newLayer');

            }

        }
    },

     handleNewLayer:{
        value:function(event){
            // Add a new layer.  It should be added above the currently selected layer,
            // Or at the end, if no layer is selected.
             var hashIndex =0 ,hashVariable=0,layerResult,trackResult,layerObject,trackObject,dLayer,parentNode;

             if(this._hashFind){
                while(layerResult = this.returnedObject[hashIndex]){
                    trackResult=this.returnedTrack[hashIndex];
                    if(layerResult.deleted!==true){
                        this.arrLayers.push(layerResult);
                        this.arrTracks.push(trackResult);
                    }
                    hashIndex++;
                }
             this._hashFind=false;
             return;
             }

             if(this._isElementAdded){
                if(this.addButtonClicked){
                    layerObject = this.hashInstance.getItem(this.application.ninja.currentSelectedContainer.uuid);
                    trackObject = this.hashTrackInstance.getItem(this.application.ninja.currentSelectedContainer.uuid);
                    if(layerObject!==undefined){
                            while(layerObject[hashVariable]){
                                if(event.detail.parentElement!==this.application.ninja.currentSelectedContainer){
                                    dLayer=this.hashInstance.getItem(event.detail.parentNode.uuid);
                                        while(dLayer[hashVariable]){
                                            if(dLayer[hashVariable].element===event.detail){
                                                dLayer[hashVariable].deleted=true;
                                                parentNode=dLayer[hashVariable].parentElement;
                                                break;
                                            }
                                            hashVariable++;
                                        }
                                        this._setBreadCrumb=true;
                                        NJevent('breadCrumbTrail',{"element":parentNode,"setFlag":this._setBreadCrumb});

                                }
                                else if(layerObject[hashVariable].element===event.detail){
                                    this.arrLayers.splice(layerObject[hashVariable].layerPosition,0,layerObject[hashVariable]);
                                    this.arrTracks.splice(trackObject[hashVariable].trackPosition,0,trackObject[hashVariable]);
                                    this._isLayerAdded=true;
                                    break;
                                }
                                hashVariable++;
                                this._isLayerAdded=false;
                            }
                    }
                }

                if(this._isLayerAdded===false){
                      var newLayerName = "",
                        //thingToPush = Layer.create(),
                        thingToPush = {},
                        // newTrack = TimelineTrack.create(),
                        newTrack = {},
                        myIndex = 0;

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
                        thingToPush.element=this.layerElement;
                        thingToPush.deleted=false;
                        thingToPush.parentElement=this.application.ninja.currentSelectedContainer;
                        this.layerElement.dataset.parentUUID=this.application.ninja.currentSelectedContainer.uuid;

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
                            this.hashInstance.setItem(this._hashKey,thingToPush,myIndex);
                            this.hashTrackInstance.setItem(this._hashKey,newTrack,myIndex);
                            thingToPush.layerPosition=myIndex;
                            newTrack.trackPosition=myIndex;
                            this.arrLayers.splice(myIndex, 0, thingToPush);
                            this.arrTracks.splice(myIndex, 0, newTrack);
                            this.layerRepetition.selectedIndexes = [myIndex];
                        } else {
                            this.arrLayers.push(thingToPush);
                            this.arrTracks.push(newTrack);
                            thingToPush.layerPosition=this.arrLayers.length-1;
                            newTrack.trackPosition=this.arrTracks.length-1;
                            this.hashInstance.setItem(this._hashKey,thingToPush,thingToPush.layerPosition);
                            this.hashTrackInstance.setItem(this._hashKey,newTrack,newTrack.trackPosition);

                          }


                }
             }
        }
     },

     handleDeleteLayer:{
        value:function(event){
             var dLayer,dTrack,parentNode,hashVariable=0,k=0,index=0,j=0;

                if (this.arrLayers.length > 0) {
                     if(this._undoElementDeleted){
                        if(event.detail.dataset.parentUUID!==this.application.ninja.currentSelectedContainer.uuid){
                            dLayer=this.hashInstance.getItem(event.detail.dataset.parentUUID);
                            while(dLayer[hashVariable]){
                                if(dLayer[hashVariable].element===event.detail){
                                    dLayer[hashVariable].deleted=true;
                                    parentNode=dLayer[hashVariable].parentElement;
                                    break;
                                }
                                hashVariable++;
                            }
                            this._setBreadCrumb=true;
                            NJevent('breadCrumbTrail',{"element":parentNode,"setFlag":this._setBreadCrumb});
                        }else{
                            dLayer=this.hashInstance.getItem(event.detail.dataset.parentUUID)
                            while(dLayer[hashVariable]){
                                  if(dLayer[hashVariable].deleted===true){

                                  }else if(dLayer[hashVariable].element.uuid === event.detail.uuid){
                                            while(this.arrLayers.length){
                                               if(dLayer[hashVariable].layerID===this.arrLayers[k].layerID){
                                                     dLayer[hashVariable].deleted=true;
                                                     this.arrLayers.splice(k,1);
                                                     this.arrTracks.splice(k,1);
                                                     break;
                                               }
                                               k++;
                                            }
                                        }
                                  hashVariable++;
                            }
                        }
                     }
                    else{
                            if (!!this.layerRepetition.selectedIndexes) {
                                    var myIndex = this.layerRepetition.selectedIndexes[0];
                                    dLayer = this.hashInstance.getItem(this._hashKey);
                                    dTrack = this.hashTrackInstance.getItem(this._hashKey);
                                    dLayer[myIndex].deleted=true;

                                    this.arrLayers.splice(myIndex, 1);
                                    this.arrTracks.splice(myIndex, 1);

                        }   else if(this._deleteKeyDown) {
                                  dLayer = this.hashInstance.getItem(this._hashKey);
                                  dTrack = this.hashTrackInstance.getItem(this._hashKey);

                                      if(this.deleteElement === this.application.ninja.currentSelectedContainer){
                                          while(dLayer[hashVariable]){
                                                dLayer[hashVariable].deleted=true;
                                                hashVariable++;
                                          }

                                          this.dObject=this.hashInstance.getItem(this.removeLayerFromParentUUid);
                                          hashVariable=0;
                                          while(this.dObject[hashVariable]){
                                             if(this.application.ninja.currentSelectedContainer===this.dObject[hashVariable].element){
                                                      this.dObject[hashVariable].deleted=true;
                                                      this._setBreadCrumb=true;
                                                      NJevent('breadCrumbTrail',{"element":this.currentParentNode,"setFlag":this._setBreadCrumb});
                                                      this._setBreadCrumb=false;
                                                      break;
                                             }
                                             hashVariable++;
                                          }
                                          this._deleteKeyDown=false;
                                  } else if(this.deleteElement!== this.application.ninja.currentSelectedContainer){

                                          while(dLayer[hashVariable]){
                                              if(dLayer[hashVariable].deleted===true){

                                              }else if(dLayer[hashVariable].element.uuid === this.deleteElement.uuid){
                                                   while(this.arrLayers.length){
                                                       if(dLayer[hashVariable].layerID===this.arrLayers[k].layerID){
                                                             dLayer[hashVariable].deleted=true;
                                                             this.arrLayers.splice(k,1);
                                                             this.arrTracks.splice(k,1);
                                                             break;
                                                       }
                                                       k++;
                                                   }
                                              }
                                              hashVariable++;
                                         }
                                  }
                            }
                              else{
                                        dLayer = this.hashInstance.getItem(this._hashKey);
                                        dTrack = this.hashTrackInstance.getItem(this._hashKey);
                                        dLayer[this.arrLayers.length-1].deleted=true;
                                        this.arrLayers.pop();
                                        this.arrTracks.pop();
                                  }
                    }

               }else  if (this.arrLayers.length <=  0) {
                            if(this._undoElementDeleted){
                                if(event.detail.dataset.parentUUID!==this.application.ninja.currentSelectedContainer.uuid){
                                        dLayer=this.hashInstance.getItem(event.detail.dataset.parentUUID);
                                        while(dLayer[hashVariable]){
                                            if(dLayer[hashVariable].element===event.detail){
                                                dLayer[hashVariable].deleted=true;
                                                parentNode=dLayer[hashVariable].parentElement;
                                                break;
                                            }
                                            hashVariable++;
                                        }
                                        this._setBreadCrumb=true;
                                        NJevent('breadCrumbTrail',{"element":parentNode,"setFlag":this._setBreadCrumb});
                                }
                            }else
                                if(this._deleteKeyDown) {
                                          this.dObject=this.hashInstance.getItem(this.removeLayerFromParentUUid);
                                          hashVariable=0;
                                          while(this.dObject[hashVariable]){
                                             if(this.application.ninja.currentSelectedContainer===this.dObject[hashVariable].element){
                                                      this.dObject[hashVariable].deleted=true;
                                                      this._setBreadCrumb=true;
                                                      NJevent('breadCrumbTrail',{"element":this.currentParentNode,"setFlag":this._setBreadCrumb});
                                                      this._setBreadCrumb=false;
                                                      break;
                                             }
                                             hashVariable++;
                                          }
                                }
                }
                // TODO: actually remove the selected style from the layer. (Maybe by publishing an event?)

        }
    },

    handleElementAdded: {
        value: function(event) {
           this.layerElement=event.detail;
           this._isElementAdded=true;
           NJevent('newLayer',event.detail);
           this._isElementAdded=false;
        }
    },

    handleDeleteSelection:{
        value:function(event){
            this._deleteKeyDown=true;
            this.deleteElement = event.detail[0];
            NJevent('deleteLayer',event.detail);
        }
    },

    handleElementDeleted: {
        value: function(event) {
            this._undoElementDeleted=true;
            this.deleteElement = event.detail[0];
            NJevent('deleteLayer',event.detail);
            this._undoElementDeleted=false;
        }
    },
    drawTimeMarkers:{
        value:function(){
            var i;
            var totalMarkers = Math.floor(this.track_container.offsetWidth / 80);
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

    createLayerHashTable: {
        value : function(key,value){
            var hashLayerObject;

                   hashLayerObject = Object.create(Object.prototype, {
                        counter:{
                                  value:0,
                                  writable:true
                                },

                       setItem: {
                           value: function(key,value,index) {

                                   if(hashLayerObject[key]===undefined){
                                       hashLayerObject[key]={};
                                   }
                                   if(hashLayerObject[key][index]!== undefined){

                                        this.counter=index;
                                        while(hashLayerObject[key][this.counter]){
                                            this.counter++;
                                        }

                                        while(this.counter!==index){
                                            hashLayerObject[key][this.counter]=hashLayerObject[key][this.counter-1];
                                            this.counter=this.counter-1;
                                        }
                                   }
                                   hashLayerObject[key][index] = value;
                                   this.counter=0;
                           }
                       },

                       getItem: {
                           value: function(key) {
                               return hashLayerObject[key];
                           }
                       }
                   });

                   return hashLayerObject;

        }
    },

    createTrackHashTable: {
        value : function(key,value){
                var hashTrackObject;

                       hashTrackObject = Object.create(Object.prototype, {
                            counter:{
                                      value:0,
                                      writable:true
                                    },

                           setItem: {
                               value: function(key,value,index) {
                                       if(hashTrackObject[key]===undefined){
                                           hashTrackObject[key]={};
                                       }

                                       if(hashTrackObject[key][index]!== undefined){

                                           this.counter=index;
                                           while(hashTrackObject[key][this.counter]){
                                                 this.counter++;
                                           }

                                           while(this.counter!==index){
                                                hashTrackObject[key][this.counter]=hashTrackObject[key][this.counter-1];
                                                this.counter=this.counter-1;
                                           }
                                       }
                                       hashTrackObject[key][index] = value;
                                       this.counter=0;
                               }
                           },

                           getItem: {
                               value: function(key) {
                                   return hashTrackObject[key];
                               }
                           }
                       });

                       return hashTrackObject;

        }
    }

    /* === END: Controllers === */

});
