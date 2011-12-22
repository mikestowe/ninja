/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
     iconsListModule = require("js/components/ui/icon-list-basic/iconsList.reel"),
    treeModule = require("js/components/ui/tree-basic/tree.reel"),
    newFileLocationSelectionModule = require("js/io/workflow/newFileDialog/new-file-workflow-controller");
    newFileWorkflowControllerModule = require("js/io/workflow/newFileDialog/new-file-location.reel");

var NewFileOptionsNavigator = exports.NewFileOptionsNavigator = Montage.create(Component, {

    newFileModel: {
        writable: true,
        enumerable:false,
        value:null
    },
    selectedProjectType:{
        writable: true,
        enumerable:false,
        value:null
    },
    selectedTemplates:{
        writable: true,
        enumerable:false,
        value:[]
    },
    willDraw: {
    	enumerable: false,
    	value: function() {}
    },
    draw: {
    	enumerable: false,
    	value: function() {}
    },
    didDraw: {
    	enumerable: false,
    	value: function() {
            var that = this;

            this.templateList = null;

            //draw left nav project type tree
            var tree = treeModule.Tree.create();
            tree.showIcons = false;
            tree.directoryBold = true;
            tree.treeViewDataObject = this.newFileModel.prepareContents("projectTypes");
            tree.element = this.projectTypeTree;
            tree.needsDraw = true;

            var newFileLocation = newFileWorkflowControllerModule.NewFileLocation.create();
            newFileLocation.element = this.locationSelection;
            newFileLocation.needsDraw = true;

            this.addIdentifiers();

            this.element.addEventListener("drawTree", function(evt){that.handleNewFileNavDrawTree(evt);}, false);
            this.element.addEventListener("selectedItem", function(evt){that.handleNewFileNavSelectedItem(evt);}, false);//for single selection only
            this.cancelButton.addEventListener("click", this, false);
        }

    },

    /**
     * Event Listners
     */

    addIdentifiers:{
        value: function(){
            this.element.identifier = "newFileNav";
            this.okButton.identifier = "okButton";
            this.cancelButton.identifier = "cancelButton";
        }
    },

    handleNewFileNavDrawTree:{
            value: function(evt){
                    //toggle open or close for directory
                    if((evt.uriType === "directory") && (!!evt.subTreeContainer)){
                        var tree = treeModule.Tree.create();
                        tree.showIcons = false;
                        tree.treeViewDataObject = this.newFileModel.prepareContents(evt.uri);
                        tree.element = evt.subTreeContainer;
                        tree.needsDraw = true;
                    }
                }
        },

    handleNewFileNavSelectedItem:{
        value: function(evt){
                var selectionType =  this.newFileModel.projectTypeData[evt.uri].type;
                if(evt.target.classList.contains("atreeItemContent") && (selectionType === "file")){//populate templates for project type selection
                    //save project type selection
                    this.selectedProjectType = evt.uri;

                    //render templates
                    var templates = this.newFileModel.prepareContents(evt.uri);
                    if(this.templatesContainer.querySelectorAll(".list").length > 0){
                        this.templateList.iconsViewDataObject = templates;
                    }else{
                        this.templateList = iconsListModule.IconsList.create();
                        this.templateList.iconsViewDataObject = templates;
                        this.templateList.element = this.templateIcons;
                        this.templateList.needsDraw = true;
                    }
                }

                if(evt.target.classList.contains("icon")){
                    //save template selection
                    this.selectedTemplates.push[evt.uri];//todo: check for duplicates

                }

//                if(!evt.target.classList.contains("selected")){
//                    evt.target.classList.add("selected");
//                }

                //enable ok
            }
    },

    handleCancelButtonClick :{
        value:function(evt){
                //clean up memory
                //this.cleanup();

                if(this.popup){
                    this.popup.hide();
                }

            }
    },




    dummyProjectTypes:{
        writable:false,
        enumerable:false,
        value:[{
                   "type":"directory",
                   "name":"Blank Document",
                   "uri":"newFile"
            },
            {
                   "type":"directory",
                   "name":"New Project",
                   "uri":"newProject"
            },
            {
                   "type":"directory",
                   "name":"From Template",
                   "uri":"fromTemplate"
            }]
    }

});