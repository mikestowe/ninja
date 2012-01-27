/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.ShapeModel = Montage.create(Component, {

    shapeCount:             { value: 0 },

    GLWorld:                { value: null },
    GLGeomObj:              { value: null },

    strokeSize:             { value: null },
    stroke:                 { value: null },
    strokeMaterial:         { value: null },
    strokeMaterialIndex:    { value: null },
    strokeStyle:            { value: null },
    strokeStyleIndex:       { value: null },

    fill:                   { value: null },
    fillMaterial:           { value: null },
    fillMaterialIndex:      { value: null },

    // Line-specific
    slope:                  { value: null },

    // Oval-specific
    innerRadius:            { value: null },

    // Rectangle-specific
    tlRadius:               { value: null },
    trRadius:               { value: null },
    blRadius:               { value: null },
    brRadius:               { value: null }

});