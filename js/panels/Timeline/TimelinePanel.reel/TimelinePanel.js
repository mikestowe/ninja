/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var TimelineController = require("js/panels/Timeline/TimelineController").TimelineController;

var TimelinePanel = exports.TimelinePanel = Montage.create(Component, {

    tmpImg: { value: null},

    templateDidLoad: {
        value: function() {
            /*
            this.tmpImg = document.createElement("img");
            this.tmpImg.width = 1879;
            this.tmpImg.height = 440;
            this.tmpImg.src = "images/timeline/timeline.png";
            */
        }
    },

    prepareForDraw: {
        value: function() {
            this.element.style.background = "url('images/timeline/timeline.png')";
            this.element.style.width = "100%";
            this.element.style.height = "400px";
            this.element.style.backgroundPosition = "-5px -40px";
        }
    },

    init : {
        value : function()
        {
            this.buildTimelineView();

        }
    },

    breadCrumbContainer:{
        value:null,
        writable:true,
        enumerable:true
    },

    controlsContainer:{
        value:null,
        writable:true,
        enumerable:true
    },

    timelineGutter:{
        value:null,
        writable:true,
        enumerable:true
    },

    userLayerContainer:{
        value:null,
        writable:true,
        enumerable:true
    },

    currentLayerNumber:{
        value:1,
        writable:true,
        enumerable:true
    },

    newLayerButton:{
        value:null,
        writable:true,
        enumerable:true
    },

    deleteLayerButton:{
        value:null,
        writable:true,
        enumerable:true
    },

    newFolderButton:{
        value:null,
        writable:true,
        enumerable:true
    },

    buildTimelineView : {
        value:function(){
            var timeline = document.getElementById("timelinePanel");

            var mainTimelineContainer = document.createElement("div");
            mainTimelineContainer.style.backgroundColor = "#000000";
            mainTimelineContainer.style.width = "100%";
            mainTimelineContainer.style.height = "100%";
            mainTimelineContainer.style.overflow = "visible";

            timeline.appendChild(mainTimelineContainer);

            this.breadCrumbContainer = document.createElement("div");
            this.breadCrumbContainer.style.width = "100%";
            this.breadCrumbContainer.style.height = "20px";
            this.breadCrumbContainer.style.backgroundColor = "#111111";

            var timeControllerContainer = document.createElement("div");
            timeControllerContainer.style.width = "auto";
            timeControllerContainer.style.height = "20px";
            timeControllerContainer.style.backgroundColor = "#000000";

            this.controlsContainer = document.createElement("div");
            this.controlsContainer.style.width = "200px";
            this.controlsContainer.style.height = "20px";
            this.controlsContainer.style.backgroundColor = "#440000";
            this.controlsContainer.style.float = "left";
            this.controlsContainer.innerText = "Timeline Controller";

            var timeContainer = document.createElement("div");
            timeContainer.style.width = "inherit";
            timeContainer.style.height = "20px";
            timeContainer.style.backgroundColor = "#880000";
            timeContainer.style.float = "left";
            timeContainer.innerText = "Time markers";

            timeControllerContainer.appendChild(this.controlsContainer);
            timeControllerContainer.appendChild(timeContainer);

            var masterLayerContainer = document.createElement("div");
            masterLayerContainer.style.width = "100%";
            masterLayerContainer.style.height = "20px";
            masterLayerContainer.style.backgroundColor = "#111111";
            masterLayerContainer.style.border = "solid";
            masterLayerContainer.style.borderWidth = "thin";
            masterLayerContainer.style.borderColor = "#333333";
            masterLayerContainer.innerText = "MASTER Layer";

            this.userLayerContainer = document.createElement("div");
            this.userLayerContainer.style.width = "100%";
            this.userLayerContainer.style.height = "33px";
            this.userLayerContainer.style.backgroundColor = "#111111";

            this.timelineGutter = document.createElement("div");
            this.timelineGutter.style.position = "fixed";
            //this.timelineGutter.style.width = "inherit";
            this.timelineGutter.style.height = "20px";
            //this.timelineGutter.style.bottom = 0;
            this.timelineGutter.style.backgroundColor = "#000000";
            this.timelineGutter.style.zIndex = "100";

            var newLayerButton = document.createElement("button");
            newLayerButton.style.backgroundImage = "url(../MainApp/images/timeline/plus.png)";
            newLayerButton.style.backgroundRepeat = "no-repeat";
            newLayerButton.style.height = "18px";
            newLayerButton.style.width = "18px";
            //newLayerButton.textContent = "New Layer";
            newLayerButton.addEventListener("click", this.newLayerClickHandler.bind(this), false);

            //var newFolderButton = document.createElement("button");
            //newFolderButton.textContent = "New Folder";

            var newTrashButton = document.createElement("button");
            newTrashButton.style.backgroundImage = "url(../MainApp/images/timeline/trash.png)";
            newTrashButton.style.backgroundRepeat = "no-repeat";
            newTrashButton.style.height = "18px";
            newTrashButton.style.width = "18px";
            newTrashButton.addEventListener("click", this.deleteLayerClickHandler.bind(this), false);

            this.timelineGutter.appendChild(newLayerButton);
            //this.timelineGutter.appendChild(newFolderButton);
            this.timelineGutter.appendChild(newTrashButton);

            mainTimelineContainer.appendChild(this.breadCrumbContainer);
            mainTimelineContainer.appendChild(timeControllerContainer);
            mainTimelineContainer.appendChild(masterLayerContainer);
            mainTimelineContainer.appendChild(this.userLayerContainer);
            mainTimelineContainer.appendChild(this.timelineGutter);
            
            this.initBreadCrumb();

            this.layerArray = new Array();
        }
    },

    newLayerClickHandler:{
        value:function(){
            this.newLayer();
        }
    },

    deleteLayerClickHandler:{
        value:function(){
            this.deleteLayer();
        }
    },

    layerArray:{
        value:null,
        writable:true,
        enumerable:true
    },

    selectedLayer:{
        value:null,
        writable:true,
        enumerable:true
    },

    newLayer:{
        value:function(){
            var newLayerDiv = document.createElement("div");
            newLayerDiv.style.width = "inherit";
            newLayerDiv.style.height = "20px";
            newLayerDiv.style.backgroundColor = "#222222";
            newLayerDiv.style.border = "solid";
            newLayerDiv.style.borderWidth = "thin";
            newLayerDiv.style.borderColor = "#444444";

            newLayerDiv.innerText = "Layer " + this.currentLayerNumber;
            this.currentLayerNumber++;

            newLayerDiv.addEventListener("click", this.selectLayer.bind(this), false);

            this.userLayerContainer.appendChild(newLayerDiv);

            this.layerArray.push(newLayerDiv);
            console.log(this.layerArray);
        }
    },

    selectLayer:{
        value:function(ev){
            for(var i in this.layerArray){
                this.layerArray[i].style.backgroundColor = "#222222";
            }
            ev.target.style.backgroundColor = "#444444";
            this.selectedLayer = ev.target;
        }
    },

    deleteLayer:{
        value:function(){
            if(this.selectedLayer){
                this.userLayerContainer.removeChild(this.selectedLayer);
            }
            for(var i in this.layerArray){
                if(this.layerArray[i] == this.selectedLayer){
                    this.layerArray.splice(i,1);
                }
            }
        }
    },

    newFolder:{

    },

    deleteFolder:{

    },

    initBreadCrumb : {
        value:function(){
            var mainBodyButton = document.createElement("button");
            mainBodyButton.textContent = "Body";
            this.breadCrumbContainer.appendChild(mainBodyButton);
        }
    },
    initControlsContainer:{
        value:function(){
            // create timeline control buttons for play,stop,etc
        }
    },
    drawTimeMarkers:{
        value:function(){
            
        }
    },
    calculateTimeMarkerSpacing:{
        value:function(){
            
        }
    },
    initMasterLayer:{
        value:function(){

        }
    },
    initUserLayers:{
        value:function(){
            
        }
    }
});