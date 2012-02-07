/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.TransitionsLibrary = Montage.create(Component, {
    hasTemplate: {
        value: true
    },
    contentPanel : {
        value: "presets" // get from local storage
    },
    templateDidLoad : {
        value: function() {
            console.log('deserialized');
        }
    },
    treeList : {
        value : null
    },
    data2: {
        value: {
            "meta": "Blah",
            "status": "OK",
            "text" : "Root",
            "data" : {
                "date": "1.1.01",
                "text": "Transitions",
                "children": [{
                    "date": "3.3.01",
                    "text": "Kid 1"
                },
                    {
                        "date": "3.3.01",
                        "text": "Kid 2",
                        "children": [{
                            "date": "3.4.01",
                            "text": "Grand Kid 1",
                            "children": [{
                                "date": "4.4.01",
                                "text": "Great Grand Kid 1"
                            }]
                        }]

                    },{
                        "date": "5.5.01",
                        "text": "Kid 3"
                    }]
            }
        }
    },
    didDraw: {
        value : function() {
            console.log('Presets Panel prepare for draw.');
//            this.treeList.items.push({
//                label : "Box Style",
//                type : 'leaf'
//            });
        }
    }


});
