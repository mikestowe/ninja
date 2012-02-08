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

    _firstTimeLoaded:{
        value:true,
        writable:true
    },

    _firstLayerDraw:{
        value:false,
        writable:true
    },

    willDraw: {
        value: function() {
            if (this._isLayer) {
                this.insertLayer();
                this._isLayer = false;;
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
            this._hashKey="123";
            _firstLayerDraw = false;
            NJevent('newLayer',this._hashKey);
            _firstLayerDraw = true;

            // TODO - add condition for existing doc and parse DOM for top level elements
        }
    },

    updateLayerScroll:{
        value:function(){
            this.user_layers.scrollTop = this.layer_tracks.scrollTop;
            this.master_track.scrollLeft = this.layer_tracks.scrollLeft;
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
            if(this.application.ninja.currentSelectedContainer.id==="UserContent"){
                this._hashKey="123";
            }
            this.removeLayer();
        }
    },

    handleLayerBinding:{
        value:function(event){
             var i=0;
             this.currentParentNode=this.application.ninja.currentSelectedContainer.parentNode;

             if(this._firstTimeLoaded){
                     this._firstTimeLoaded=false;
             }else{
                     while(this.arrLayers.pop()){
                     }
                     while(this.arrTracks.pop()){
                     }

                     if(event.detail.element.id==="UserContent"){
                         this._hashKey= "123";
                     }else{
                         this._hashKey = event.detail.element.uuid;
                     }

                     if(this.returnedObject = this.hashInstance.getItem(this._hashKey)){
                        this.returnedTrack = this.hashTrackInstance.getItem(this._hashKey);
                        this._hashFind = true;
                     }
                     NJevent('newLayer',event.detail);

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
             if(event.detail._undoStatus){
                        if(this.application.ninja.currentSelectedContainer.id==="UserContent" && event.detail._el.parentElementUUID===123 ){
                                dLayer=this.hashInstance.getItem(event.detail._el.parentElementUUID);
                                while(dLayer[hashVariable]){
                                     if(dLayer[hashVariable]._layerID === event.detail._el._layerID){
                                                         dLayer[hashVariable].deleted=false;
                                                         this.arrLayers.splice(event.detail._layerPosition,1,event.detail._el);
                                                         this.arrTracks.splice(event.detail._layerPosition,1,event.detail._track);
                                                         break;

                                                }
                                     hashVariable++;
                                }

                                }

                        else if(event.detail._el.parentElementUUID!==this.application.ninja.currentSelectedContainer.uuid){
                                dLayer=this.hashInstance.getItem(event.detail._el.parentElementUUID);
                                while(dLayer[hashVariable]){
                                    if(dLayer[hashVariable]._layerID===event.detail._el._layerID){
                                        dLayer[hashVariable].deleted=false;
                                        parentNode=dLayer[hashVariable].parentElement;
                                        break;
                                    }
                                    hashVariable++;
                                }
                                this._setBreadCrumb=true;
                                NJevent('breadCrumbTrail',{"element":parentNode,"setFlag":this._setBreadCrumb});
                          }else{
                                dLayer=this.hashInstance.getItem(event.detail._el.parentElementUUID);
                                while(dLayer[hashVariable]){
                                     if(dLayer[hashVariable]._layerID === event.detail._el._layerID){
                                         dLayer[hashVariable].deleted=false;
                                         this.arrLayers.splice(event.detail._layerPosition,1,event.detail._el);
                                         this.arrTracks.splice(event.detail._layerPosition,1,event.detail._track);
                                         break;

                                    }
                                    hashVariable++;
                                }
                            }
             }



            else{
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
                        thingToPush.element=[];
                        thingToPush.deleted=false;
                        if(_firstLayerDraw){
                        thingToPush.parentElementUUID=this.application.ninja.currentSelectedContainer.uuid;
                        thingToPush.parentElement=this.application.ninja.currentSelectedContainer;
                        }


                        newTrack.trackID = this.currentLayerNumber;
                        newTrack.isMainCollapsed = true;
                        newTrack.isPositionCollapsed = true;
                        newTrack.isTransformCollapsed = true;
                        newTrack.isStyleCollapsed = false;
                        newTrack.tweens = [];

                        if(_firstLayerDraw){
                            if(this.application.ninja.currentSelectedContainer.id==="UserContent"){
                            this._hashKey="123";
                            thingToPush.parentElementUUID = 123;
                            }
                        }

                        // If a layer is selcted, splice the new layer on top
                        // Otherwise, just push the new layer in at the bottom.

                        if (!!this.layerRepetition.selectedIndexes) {
                            myIndex = this.layerRepetition.selectedIndexes[0];
                            thingToPush.layerPosition=myIndex;
                            newTrack.trackPosition=myIndex;
                            this.arrLayers.splice(myIndex, 0, thingToPush);
                            this.arrTracks.splice(myIndex, 0, newTrack);
                            this._LayerUndoPosition = myIndex;
                            this.currentLayerSelected= this.arrLayers[myIndex];
                            this.layerRepetition.selectedIndexes = [myIndex];
                            this.hashInstance.setItem(this._hashKey,thingToPush,myIndex);
                            this.hashTrackInstance.setItem(this._hashKey,newTrack,myIndex);
                        } else {
                            this.arrLayers.push(thingToPush);
                            this.arrTracks.push(newTrack);
                            thingToPush.layerPosition=this.arrLayers.length-1;
                            newTrack.trackPosition=this.arrTracks.length-1;
                            this.currentLayerSelected= this.arrLayers[this.arrLayers.length-1];
                            this._LayerUndoPosition = this.arrLayers.length-1;
                            this.hashInstance.setItem(this._hashKey,thingToPush,thingToPush.layerPosition);
                            this.hashTrackInstance.setItem(this._hashKey,newTrack,newTrack.trackPosition);

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
             var dLayer,dTrack,parentNode,hashVariable=0,k=0,index=0,j=0;

                if (this.arrLayers.length > 0) {
                    if(event.detail._undoStatus){
                        if(this.application.ninja.currentSelectedContainer.id==="UserContent" && event.detail._el.parentElementUUID===123 ){
                                dLayer=this.hashInstance.getItem(event.detail._el.parentElementUUID);
                                while(dLayer[hashVariable]){
                                  if(dLayer[hashVariable].deleted===true){

                                  }else if(dLayer[hashVariable]._layerID === event.detail._el._layerID){
                                            while(this.arrLayers.length){
                                               if(dLayer[hashVariable]._layerID===this.arrLayers[k]._layerID){
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

                        }else if(event.detail._el.parentElementUUID!==this.application.ninja.currentSelectedContainer.uuid){
                                dLayer=this.hashInstance.getItem(event.detail._el.parentElementUUID);
                                while(dLayer[hashVariable]){
                                    if(dLayer[hashVariable]._layerID===event.detail._el._layerID){
                                        dLayer[hashVariable].deleted=true;
                                        parentNode=dLayer[hashVariable].parentElement;
                                        break;
                                    }
                                    hashVariable++;
                                }
                                this._setBreadCrumb=true;
                                NJevent('breadCrumbTrail',{"element":parentNode,"setFlag":this._setBreadCrumb});
                        }
                            else{
                            dLayer=this.hashInstance.getItem(event.detail._el.parentElementUUID);
                            while(dLayer[hashVariable]){
                              if(dLayer[hashVariable].deleted===true){

                              }else if(dLayer[hashVariable]._layerID === event.detail._el._layerID){
                                        while(this.arrLayers.length){
                                           if(dLayer[hashVariable]._layerID===this.arrLayers[k]._layerID){
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
                                    this._LayerUndoObject=this.arrLayers[myIndex];
                                    this._TrackUndoObject=this.arrTracks[myIndex];

                                    dLayer = this.hashInstance.getItem(this._hashKey);
                                    dTrack = this.hashTrackInstance.getItem(this._hashKey);
                                    dLayer[myIndex].deleted=true;

                                    this.arrLayers.splice(myIndex, 1);
                                    this.arrTracks.splice(myIndex, 1);
                                    this._LayerUndoIndex = this._LayerUndoObject.layerID;
                                    this._LayerUndoPosition = myIndex;
                            }else{
                                    dLayer = this.hashInstance.getItem(this._hashKey);
                                    dTrack = this.hashTrackInstance.getItem(this._hashKey);
                                    dLayer[this.arrLayers.length-1].deleted=true;
                                    this._LayerUndoPosition = this.arrLayers.length-1;
                                    this._LayerUndoObject = this.arrLayers.pop();
                                    this._LayerUndoIndex = this._LayerUndoObject.layerID;
                                    this._TrackUndoObject = this.arrTracks.pop();
                            }

//                           else if(this._deleteKeyDown) {
//                                  dLayer = this.hashInstance.getItem(this._hashKey);
//                                  dTrack = this.hashTrackInstance.getItem(this._hashKey);
//
//                                      if(this.deleteElement === this.application.ninja.currentSelectedContainer){
//                                          while(dLayer[hashVariable]){
//                                                dLayer[hashVariable].deleted=true;
//                                                hashVariable++;
//                                          }
//
//                                          this.dObject=this.hashInstance.getItem(this.removeLayerFromParentUUid);
//                                          hashVariable=0;
//                                          while(this.dObject[hashVariable]){
//                                             if(this.application.ninja.currentSelectedContainer===this.dObject[hashVariable].element){
//                                                      this.dObject[hashVariable].deleted=true;
//                                                      this._setBreadCrumb=true;
//                                                      NJevent('breadCrumbTrail',{"element":this.currentParentNode,"setFlag":this._setBreadCrumb});
//                                                      this._setBreadCrumb=false;
//                                                      break;
//                                             }
//                                             hashVariable++;
//                                          }
//                                          this._deleteKeyDown=false;
//                                  } else if(this.deleteElement!== this.application.ninja.currentSelectedContainer){
//
//                                          while(dLayer[hashVariable]){
//                                              if(dLayer[hashVariable].deleted===true){
//
//                                              }else if(dLayer[hashVariable].element.uuid === this.deleteElement.uuid){
//                                                   while(this.arrLayers.length){
//                                                       if(dLayer[hashVariable].layerID===this.arrLayers[k].layerID){
//                                                             dLayer[hashVariable].deleted=true;
//                                                             this.arrLayers.splice(k,1);
//                                                             this.arrTracks.splice(k,1);
//                                                             break;
//                                                       }
//                                                       k++;
//                                                   }
//                                              }
//                                              hashVariable++;
//                                         }
//                                  }
//                            }
//                              else{
//                                        dLayer = this.hashInstance.getItem(this._hashKey);
//                                        dTrack = this.hashTrackInstance.getItem(this._hashKey);
//                                        dLayer[this.arrLayers.length-1].deleted=true;
//                                        this.arrLayers.pop();
//                                        this.arrTracks.pop();
//                                  }
                    }

             }
        }
    },

    handleElementAdded: {
        value: function(event) {
           this.layerElement=event.detail;
           if(!!this.layerRepetition.selectedIndexes){
               this.currentLayerSelected = this.arrLayers[this.layerRepetition.selectedIndexes];
               this.currentLayerSelected.element.push(event.detail)
           }
           else{
               this.currentLayerSelected.element.push(event.detail);
           }
        }
    },



//    handleDeleteSelection:{
//        value:function(event){
//            var length;
//            this._deleteKeyDown=true;
//            this.deleteElement = event.detail[0];
//            length =this.currentLayerSelected.element.length-1;
//            while(length >= 0){
//                if(this.currentLayerSelected.element[length]===this.deleteElement){
//                    this.currentLayerSelected.element.splice(length,0);
//                }
//            }
//
//        }
//    },

    handleElementDeleted: {
        value: function(event) {
            var length;
             this.deleteElement = event.detail;

             if(!!this.layerRepetition.selectedIndexes){
                  this.currentLayerSelected = this.arrLayers[this.layerRepetition.selectedIndexes];
             }
             length =this.currentLayerSelected.element.length-1;
             while(length >= 0){
                if(this.currentLayerSelected.element[length]===this.deleteElement){
                    this.currentLayerSelected.element.splice(length,1);
                    break;
                }
             length--;
            }
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
//                               console.log(this.application.ninja.currentSelectedContainer)
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
//                                   console.log(hashLayerObject)
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
//                                       console.log(hashTrackObject)
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
