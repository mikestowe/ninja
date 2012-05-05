/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var Keyframe = exports.Keyframe = Montage.create(Component, {

    hasTemplate:{
        value: true
    },

    _position:{
        value:0
    },

    position:{
        serializable:true,
        get:function(){
            return this._position;
        },
        set:function(value){
            this._position = value;
            this.needsDraw = true;
        }
    },

    prepareForDraw:{
        value:function(){
            this.element.addEventListener("click", this, false);
            
			// Drag and drop event handlers
			this.element.addEventListener("mouseover", this.handleMouseover.bind(this), false);
			this.element.addEventListener("mouseout", this.handleMouseout.bind(this), false);
			this.element.addEventListener("dragstart", this.handleDragstart.bind(this), false);
			this.element.addEventListener("dragend", this.handleDragend.bind(this), false);
			

            
            
            
        }
    },

    draw:{
        value:function(){
            this.element.style.left = (this.position - 3) + "px";
        }
    },

    deselectKeyframe:{
        value:function(){
            this.element.classList.remove("keyframeSelected");
        }
    },

    selectKeyframe:{
        value:function(){
            this.element.classList.add("keyframeSelected");
            this.parentComponent.selectTween();
        }
    },

    handleClick:{
        value:function(ev){
            this.selectKeyframe();
        }
    },
    
	handleMouseover: {
		value: function(event) {
			this.element.draggable = true;
		}
	},
	handleMouseout: {
		value: function(event) {
			this.element.draggable = false;
		}
	},
	handleDragstart: {
		value: function(event) {
			//this.parentComponent.parentComponent.dragLayerID = this.layerID;
            event.dataTransfer.setData('Text', 'Keyframe');
            this.parentComponent.parentComponent.parentComponent.draggingIndex = this.parentComponent.tweenID;
		}
	},
	handleDragend: {
		value: function(event) {
			this.parentComponent.isDragging = false;
		}
	}
    
});
