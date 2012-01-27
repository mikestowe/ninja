/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var modalDialogModule = require("js/components/ui/modalDialog/modal-dialog-manager");
var newProjectChoicesModule = require("js/io/workflow/newProjectNavigator");

var newProjectManager = exports.NewProjectManager = Montage.create(Montage, {

    /**
     * will be used for any expensive init operation like loading a setting.xml
     */
    init:{
        writable:false,
        enumerable:true,
        value: function(){}
    },

    /***
     * for list mode every entry has an icon
     * this object should be build at runtime with the data returned from io api
     * this will be bound to the iconList Repetition
     */
    resource_data_listMode:{
        writable: true,
        enumerable:false,
        value:{
            "root":{
                "name":"Project Type",
                "uri":null,
                "fileType":null,//for file type filter
                "hasChilden":true,
                "children":["newProject", "newFile", "newTemplate"],
                "hasIcon": false,
                "iconUrl":null
            },
            "newProject":{
                "name":"New Project",
                "uri":null,
                "fileType":null,
                "hasChilden":true,
                "children":["animation", "bannerAd", "montageComponent", "androidApp"],
                "hasIcon": false,
                "iconUrl":null
            },
            "newFile":{
                "name":"New File",
                "uri":null,
                "fileType":null,
                "hasChilden":true,
                "children":["html", "javascript", "css"],
                "hasIcon": false,
                "iconUrl":null
            },
            "newTemplate":{
                "name":"New Template",
                "uri":null,
                "fileType":null,
                "hasChilden":true,
                "children":["xoomApp", "website", "iosApp"],
                "hasIcon": false,
                "iconUrl":null
            },
            "bannerAd":{
                "name":"Banner Ad",
                "uri":null,
                "fileType":null,
                "hasChilden":true,
                "children":["176x208", "176x220", "208x320", "230x240"],
                "hasIcon": false,
                "iconUrl":null
            },
            "176x208":{
                "name":"176x208",
                "uri":null,
                "fileType":null,
                "hasChilden":false,
                "hasIcon": false,
                "iconUrl":null
            },
            "176x220":{
                "name":"176x220",
                "uri":null,
                "fileType":null,
                "hasChilden":false,
                "hasIcon": false,
                "iconUrl":null
            },
            "208x320":{
                "name":"208x320",
                "uri":null,
                "fileType":null,
                "hasChilden":false,
                "hasIcon": false,
                "iconUrl":null
            }
        }

    },

    /***
     *
     * Load project type selection component and populate a new modal dialog instance
     */
    showNewProjectDialog:{
        writable:false,
        enumerable:true,
        value: function(){
            var newProjectContent = document.createElement("div");
            newProjectContent.id = "newProject";

            //temporary width/height setting
            newProjectContent.style.width = newProjectContent.style.height= "500px";// remove this hard code width/height
            newProjectContent.style.color = "#fff";

            //hack (elements needs to be on DOM to be drawn)
            document.getElementById('modalContainer').appendChild(newProjectContent);

            var newProjectChoices = newProjectChoicesModule.NewProjectNavigator.create();
            newProjectChoices.element = newProjectContent;
            newProjectChoices.needsDraw = true;

            //hack - remove after rendering and add in modal dialog
            document.getElementById('modalContainer').removeChild(newProjectContent);

            modalDialogModule.ModalDialogMananger.init(document.getElementById('blockScreen'), document.getElementById('modalContainer'));
            modalDialogModule.ModalDialogMananger.showModalDialog(null, "#2c2c2c", newProjectContent);//add content as input

        }
    }


});