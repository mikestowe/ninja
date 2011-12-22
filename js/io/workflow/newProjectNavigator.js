/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

var modalDialogManagerModule = require("js/components/ui/modalDialog/modal-dialog-manager");
var iconsListModule = require("js/components/ui/FilePicker/iconsList");

var NewProjectNavigator = exports.NewProjectNavigator = Montage.create(Component, {

    willDraw: {
    	enumerable: false,
    	value: function() {

    	}
    },
    draw: {
    	enumerable: false,
    	value: function() {

    	}
    },
    didDraw: {
    	enumerable: false,
    	value: function() {

            var that = this;

            //hack instead of repetition for now
//            if((this.choicesData !== null) && (this.choicesData.hasChilden === true)){
//                this.choicesData.root.children.forEach(function(el){
//
//                }, this);
//            }

            //Draw icon list
            var iconList = iconsListModule.IconsList.create();
            iconList.element = this.element.getElementsByClassName("right-top")[0];
            iconList.needsDraw = true;

            //test
//            setTimeout(function(){
//                iconList.iconsViewDataObject = [
//                    {
//                        "id":"tete",
//                        "name":"fsvsf",
//                        "uri":null,
//                        "fileType":null,
//                        "hasChilden":false,
//                        "hasIcon": false,
//                        "iconUrl":null
//                    },
//                    {
//                        "id":"ouou",
//                        "name":"wefwfw",
//                        "uri":null,
//                        "fileType":null,
//                        "hasChilden":false,
//                        "hasIcon": false,
//                        "iconUrl":null
//                    }];
//
//            },5000);


            

    	}
    }

});