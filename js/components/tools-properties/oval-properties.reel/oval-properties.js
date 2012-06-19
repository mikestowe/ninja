/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ToolProperties = require("js/components/tools-properties/tool-properties").ToolProperties;

exports.OvalProperties = Montage.create(ToolProperties, {
    base: {
        value: null,
        serializable: true
    },

    innerRadius: {
        value: null,
        serializable: true
    },
    
    _subPrepare: {
        value: function() {
            //this.divElement.addEventListener("click", this, false);
        }
    },

    handleClick: {
        value: function(event) {
           // this.selectedElement = event._event.target.id;
        }
    },

    // Public API
    fill: {
        get: function () { return this.base.fill; }
    },

    stroke: {
        get: function () { return this.base.stroke; }
    },

    use3D: {
        get: function() { return this.base._use3D; }
    },
    
    strokeSize: {
        get: function() { return this.base._strokeSize; }
    },
    
    strokeStyle : {
        get: function() {
//            return this.base._strokeStyle.options[this.base._strokeStyle.value].text;
            return "Solid";
        }
    },

    strokeStyleIndex : {
        get: function() {
//            return this.base._strokeStyle.options[this.base._strokeStyle.value].value;
            return 1;
        }
    },

    strokeMaterial: {
        get: function() { return this.base._strokeMaterial.value; }
    },

    fillMaterial: {
        get: function() { return this.base._fillMaterial.value; }
    }


});