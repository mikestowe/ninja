/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage             = require("montage/core/core").Montage,
    Properties3D        = require("js/models/properties-3d").Properties3D,
    ShapeModel          = require("js/models/shape-model").ShapeModel,
    ControllerFactory   = require("js/controllers/elements/controller-factory").ControllerFactory,
    PiData              = require("js/data/pi/pi-data").PiData;

var modelGenerator = exports.modelGenerator = function() {
    var info = getInfoForElement(this);

    Object.defineProperty(this, "_model", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: Montage.create(elmo, {
            type:           { value: info.type},
            selection:      { value: info.selection},
            controller:     { value: info.controller},
            pi:             { value: info.pi},
            props3D:        { value: info.props3d},
            shapeModel:     { value: info.shapeModel},
            isShape:        { value: info.isShape}
        })
    });

    if(this._model.selection !== "body") {
        this._model.props3D.init(this, false);
    }

    return this._model;
};

var getInfoForElement = function(el) {
    var elementName, controller, pi, shapeModel = null, isShape = false, isComponent = false;

    elementName = el.nodeName.toLowerCase();
    controller = elementNameToController(elementName);
    pi = elementNameToPi(elementName);

    // Element is a shape
    if(el.getAttribute("data-RDGE-id")) {
        controller = "shape";
        shapeModel = Montage.create(ShapeModel);
        isShape = true;
    }

    if(el.nodeName.toLowerCase() === "ninja-content") {
        elementName = "body";
        controller = elementNameToController(elementName);
        pi = elementNameToPi(elementName);
    }

    // TODO: Add this in case there is no controller for the component
    /*
    if(el.getAttribute("data-montage-id")) {
        elementName = null;
        this.isComponent = true;
    }
    */

    // Element is a component
    if(el.controller) {
        var componentInfo = Montage.getInfoForObject(el.controller);
        var componentName = componentInfo.objectName;//.toLowerCase();

        controller = "component";
        elementName = componentName;
        pi = elementNameToPi(componentName.replace(/\s+/g, ''));
        isComponent = true;
    }

    return {
        type: el.nodeName,
        selection: elementName,
        controller: ControllerFactory.getController(controller),
        pi: pi,
        props3d: Montage.create(Properties3D),
        shapeModel: shapeModel,
        isShape: isShape,
        isComponent: isComponent
    }
};

var elementNameToController = function(name) {
    if(name === "div" || name === "custom") {
        return "block";
    } else if(name === "img") {
        return "image";
    } else if(name === "embed") {
        return "image";
    } else {
        return name;
    }
};

var elementNameToPi = function(name) {
    if(!name) return null;

    var piString = name + "Pi";

    if(!PiData.hasOwnProperty(piString)) {
        piString = "blockPi";
    }

    return piString;
};

var elmo = exports.ElementModel = Montage.create(Montage, {
    key:            { value: "_model_"},

    type:           { value: null },                // Tag type that was created
    selection:      { value: null },                // Selection string
    controller:     { value: null },                // Controller Class
    pi:             { value: null },

    id:             { value: "" },
    classList:      { value: null },
    defaultRule:    { value: null },

    top:            { value: null },
    left:           { value: null },
    width:          { value: null },
    height:         { value: null },
    props3D:        { value: null },

    isShape:        { value: false },
    shapeModel:     { value: null },
    isIn2DSnapCache : { value: false },

    isComponent:    { value: false },

    fill:           { value: null },
    stroke:         { value: null },

    initialize: {
        value: function(el, isShape, selection, isComponent) {
            var elementName, controller;

            elementName = el.nodeName.toLowerCase();

            this.type = el.nodeName;
            this.selection = selection ? selection : elementName;

            if(isComponent) {
                controller = "component";
                this.pi = this.elementNameToPi(selection.replace(/\s+/g, ''));
                this.isComponent = true;
            } else {
                controller = this.elementNameToController(elementName);
                this.pi = this.elementNameToPi(elementName);
            }

            this.props3D = Montage.create(Properties3D);

            if(isShape) {
                this.controller = ControllerFactory.getController("shape");
                this.shapeModel = Montage.create(ShapeModel);
                this.isShape = true;
            } else {
                this.controller = ControllerFactory.getController(controller);
            }

            return this;

        }
    },

    elementNameToController: {
        value: function(name) {
            if(name === "div" || name === "custom") {
                return "block";
            } else if(name === "img") {
                return "image";
            } else if(name === "embed") {
                return "image";
            } else {
                return name;
            }
        }
    },

    elementNameToPi: {
        value: function(name) {
            var piString = name + "Pi";

            if(!PiData.hasOwnProperty(piString)) {
                piString = "blockPi";
            }

            return piString;
        }
    },

    getProperty: {
        value: function(property) {
            var key = this.key + property;

            if(!this.hasOwnProperty(key)) {
                this.defineModelProperty(key, null);
            }

            return this[key];
        }
    },

    setProperty: {
        value: function(property, value) {
            var key = this.key + property;

            if(!this.hasOwnProperty(key)) {
                this.defineModelProperty(key, value);
            } else {
                this[key] = value;
            }
        }
    },

    defineModelProperty: {
        value: function(property, value) {
            Montage.defineProperty(this, property, {
                enumarable: true,
                value:value
            });
        }
    }

});
