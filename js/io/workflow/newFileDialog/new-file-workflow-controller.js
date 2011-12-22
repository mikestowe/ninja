/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Popup = require("montage/ui/popup/popup.reel").Popup,
    newFileOptionsNavigatorModule = require("js/io/workflow/newFileDialog/new-file-options-navigator.reel"),
    newFileWorkflowModelModule = require("js/io/workflow/newFileDialog/new-file-workflow-model");

//singleton
exports.NewFileWorkflowController = Montage.create(require("montage/ui/component").Component, {
    /**
     * Register a listener for showPicker event
     */
    deserializedFromTemplate:{
        writable:false,
        enumerable:true,
        value:function(){
            var that = this;
            this.eventManager.addEventListener("executeNewFile", function(evt){
                that.showNewFileDialog();
            }, false);
        }
    },

    showNewFileDialog:{
        writable:false,
        enumerable:true,
        value:function(){
            var aModel = null;
            //render modal dialog
            var newFileNavContent = document.createElement("div");
            newFileNavContent.id = "newFileDialog";
            newFileNavContent.style.width = "650px";
            newFileNavContent.style.height = "350px";
            newFileNavContent.style.color = "#fff";

            //elements needs to be on DOM to be drawn
            document.getElementById('modalContainer').appendChild(newFileNavContent);

            var newFileOptionsNav = newFileOptionsNavigatorModule.NewFileOptionsNavigator.create();
            newFileOptionsNav.newFileModel = newFileWorkflowModelModule.NewFileWorkflowModel;
            newFileOptionsNav.element = newFileNavContent;

            //hack - remove after rendering and add in modal dialog
            document.getElementById('modalContainer').removeChild(newFileNavContent);

            var popup = Popup.create();
            popup.content = newFileOptionsNav;
            popup.modal = true;
            popup.show();

            newFileOptionsNav.popup = popup;//handle to be used for hiding the popup

        }
    }
});