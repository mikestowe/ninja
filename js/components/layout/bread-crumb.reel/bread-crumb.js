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
            this.eventManager.addEventListener( "appLoaded", this, false);
            this.eventManager.addEventListener( "openDocument", this, false);
            this.eventManager.addEventListener( "breadCrumbTrail", this, false);
        }
    },

    handleAppLoaded : {
        value: function() {

            Object.defineBinding(this, "container", {
                    boundObject: this.application.ninja,
                    boundObjectPropertyPath: "currentSelectedContainer",
                    oneway: false
            });
        }
    },

    createContainerElements: {
        value: function() {
            var parentNode;

            while(this.containerElements.pop()){
              // To empty the array to get the new parentNode of the new currentLevel
            }

            if(this.container.id === "UserContent") {
                this.containerElements.push({selected:false,element:this.container});
            } else {

                parentNode = this.container;

                while(parentNode.id !== "UserContent") {
                      this.containerElements.unshift ({selected:false,element:parentNode});
                      parentNode = parentNode.parentNode;
                  }

                this.containerElements.unshift({selected:false,element:parentNode});

            }

            NJevent('layerBinding',this.container);
        }
    },


    handleBreadCrumbTrail: {
        value: function(event) {
            var newLength, revaluatedLength, tmpvalue, i=0;

            newLength = this.containerElements.length;

            while(i < newLength ) {
                if(this.containerElements[i].selected){
                    tmpvalue = i ;
                    break;
                }

                i++;
            }

            for(i = newLength -1 ; i >= 1 ; i--) {
                if(tmpvalue!==i) {
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
