/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var modalDialogManagerModule = require("js/components/ui/modalDialog/modal-dialog-manager");

var ModalDialogHeader = exports.ModalDialogHeader = Montage.create(Component, {

    _firstTime: {
        enumerable: false,
        value: true
    },

    showTitle:{
        enumerable: true,
        value: true
    },

    title:{
        enumerable : true,
        value: "Default Title"
    },

    showClose:{
        enumerable: true,
        value: true
    },

    willDraw: {
    	enumerable: false,
    	value: function() {

    	}
    },

    draw: {
    	enumerable: false,
        value: function() {
            var closeElement = this.cross;
            if(closeElement){
                if(!this.showClose){
                    closeElement.style.visibility = "hidden";
                }else{
                    closeElement.addEventListener("click", function(){
                        modalDialogManagerModule.ModalDialogMananger.closeModalDialog();
                    }, false);
                }
            }
            var titleElement = this.title;
            if(titleElement){
                if(this.showTitle){
                    titleElement.innerHTML = this.title;
                }else{
                    titleElement.style.visibility = "hidden";
                }
            }

            if(!this.showClose){
                closeElement.style.display = "none";
            }
            if(!this.showTitle){
                this.separator.style.display = "none";
            }

            this.element.parentNode.addEventListener("closeDialog", function(evt){
                modalDialogManagerModule.ModalDialogMananger.closeModalDialog();
            }, false);
        }
    },

    didDraw: {
    	enumerable: false,
    	value: function() {

    	}
    }
});