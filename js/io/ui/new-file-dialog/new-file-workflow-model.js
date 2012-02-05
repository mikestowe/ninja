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
            writable:true,
            enumerable:false,
            value:{}
    }
});
