/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.BreadcrumbButton = Montage.create(Component, {

    button: {
        value: null
    },

    data: {
        value: null
    },

    // Bound container for the button
    container: {
        value: null
    },

    prepareForDraw: {
        value: function() {
            this.element.addEventListener("mousedown", this, false);
        }
    },

    draw: {
        value: function() {

            // Temporary until we have the new template
            /*
            if(this.container.id === "UserContent") {
                this.button.innerHTML = "Body";
            } else {
                this.button.innerHTML = this.container.nodeName.toLowerCase();
            }
            */
            //

            if(this.data.element.id === "UserContent") {
                this.button.innerHTML = "Body";
            } else {
                this.button.innerHTML = this.data.element.nodeName;
            }

        }
    },

    handleMousedown: {
        value: function(event) {
             NJevent('breadCrumbTrail',this.data);
        }
    }

}); 