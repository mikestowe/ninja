/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


//a singleton

exports.NewFileWorkflowModel = Object.create(Object.prototype, {
    prepareContents: {
        value: function(id){
            var contents = [];
            if(!!this.projectTypeData[id].children && (this.projectTypeData[id].children.length > 0)){
                this.projectTypeData[id].children.forEach(function(elem){
                    if(!!this.projectTypeData[elem]){
                        contents.push(this.projectTypeData[elem]);
                    }
                }, this);
            }

            return contents;
        }
    },

    defaultProjectType:{
        writable: true,
        enumerable: true,
        value: null
    },

    callback : {
        enumerable: true,
        writable: true,
        value: null
    },

    callbackScope : {
        enumerable: true,
        writable: true,
        value: null
    },

    projectTypeData:{
            writable:false,
            enumerable:false,
            value:{//dummy data for testing
                "categories":{
                    "children":["newFile", "newProject", "fromTemplate"]
                },
                "newProject":{
                    "type":"directory",
                    "name":"New Project",
                    "uri":"newProject",
                    "children":["animation", "bannerAd", "montageComponent", "androidApp"]
                },
                "newFile":{
                    "name":"Blank Template",
                    "uri":"newFile",
                    "type":"directory",
                    "children":["htmlTemplate", "javascriptTemplate", "cssTemplate"]
                },
                "fromTemplate":{
                    "name":"From Template",
                    "uri":"fromTemplate",
                    "type":"directory",
                    "children":["xoomApp", "website", "iosApp"]
                },
                "bannerAd":{
                    "name":"Banner Ad",
                    "uri":"bannerAd",
                    "type":"file",
                    "children":["176x208", "176x220", "208x320", "230x240", "208x320", "230x240", "208x320", "230x240"]
                },
                "animation":{
                    "name":"Animation",
                    "uri":"animation",
                    "type":"file",
                    "children":["176x208", "176x220", "208x320", "230x240"]
                },
                "montageComponent":{
                    "name":"Montage Component",
                    "uri":"montageComponent",
                    "type":"file",
                    "children":["176x208", "176x208", "176x220", "208x320", "230x240","176x208", "176x220", "208x320", "230x240"]
                },
                "androidApp":{
                    "name":"Android App",
                    "uri":"androidApp",
                    "type":"file",
                    "children":["176x208", "176x220"]
                },
                "xoomApp":{
                    "name":"Xoom Application",
                    "uri":"xoomApp",
                    "type":"file",
                    "children":["176x208", "176x208", "176x220", "208x320", "176x220", "208x320", "230x240"]
                },
                "iosApp":{
                    "name":"iOS Application",
                    "uri":"iosApp",
                    "type":"file",
                    "children":["176x208"]
                },
                "176x208":{
                    "name":"176 x 208",
                    "uri":"176x208",
                    "type":"file"
                },
                "176x220":{
                    "name":"176 x 220",
                    "uri":"176x220",
                    "type":"file"
                },
                "208x320":{
                    "name":"208 x 320",
                    "uri":"208x320",
                    "type":"file"
                },
                "htmlTemplate":{
                    "name":"HTML",
                    "uri":"htmlTemplate",
                    "type":"file",
                    "children":["defaultTemplate", "xoomApp", "iosApp", "androidApp", "bannerAd"]
                },
                "cssTemplate":{
                    "name":"CSS",
                    "uri":"cssTemplate",
                    "type":"file",
                    "children":["defaultTemplate"]
                },
                "javascriptTemplate":{
                    "name":"JavaScript",
                    "uri":"javascriptTemplate",
                    "type":"file",
                    "children":["defaultTemplate"]
                },
                defaultTemplate:{
                    "name": "default",
                    "uri": "defaultTemplate",
                    "type":"file"
                }

            }
    }
});
