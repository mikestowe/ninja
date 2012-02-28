/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Breadcrumb = Montage.create(Component, {

    _container:{
        value:null
    },

    container: {
        set: function(value) {
            if(this._container !== value) {
                this._container = value;
                this.createContainerElements();
            }
        },
        get: function() {
            return this._container;
        }
    },

    containerElements: {
        value: []
    },


    deserializedFromTemplate : {
        value: function() {
            this.eventManager.addEventListener( "breadCrumbTrail", this, false);
        }
    },

    createContainerElements: {
        value: function() {
            var parentNode;

            this.containerElements.length = 0

            if(this.container.id === "UserContent") {
                this.containerElements.push({selected:false, element:this.container});
            } else {
                parentNode = this.container;

                while(parentNode.id!=="UserContent") {
                    this.containerElements.unshift({selected:false,element:parentNode});
                    parentNode = parentNode.parentNode;
                }

                this.containerElements.unshift({selected:false,element:parentNode});
            }

            NJevent('layerBinding',{selected:false ,element:this.container})
        }
    },

    handleBreadCrumbTrail: {
        value: function(event) {
            var newLength,revaluatedLength,tmpvalue;
            var i=0;

            if(event.detail.setFlag ){
                this.application.ninja.currentSelectedContainer = event.detail.element;
                return;
            }

            newLength = this.containerElements.length;

            while(i < newLength ){
                if(this.containerElements[i].selected){
                    tmpvalue = i;
                    break;
                }
                i++;
            }

            for(i = newLength -1 ; i >= 1 ; i--) {
                if(tmpvalue !== i) {
                    this.containerElements.pop();
                } else {
                    break;
                }
            }

            revaluatedLength = this.containerElements.length;
            this.application.ninja.currentSelectedContainer = this.containerElements[revaluatedLength-1].element;

        }
    }
});

