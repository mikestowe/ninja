/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage         = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component,
    PiData          = require("js/data/pi/pi-data").PiData,
    CustomSection   = require("js/panels/properties.reel/sections/custom.reel").CustomSection;

var ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.Properties = Montage.create(Component, {

    _currentDocument: {
        value : null
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

//            if(!value) {
                this.clear();
//            }

            /*
            else if(this._currentDocument.currentView === "design") {
                // Display the default document root PI
                //this.displayElementProperties(this._currentDocument.model.documentRoot);
//                this.displaySelection(this._currentDocument.model.selection);
            }
            */
        }
    },

    elementName: {
        value: null,
        serializable: true
    },

    elementId: {
        value: null,
        serializable: true
    },

    elementClass: {
        value: null,
        serializable: true
    },

    positionSize: {
        value: null,
        serializable: true
    },

    threeD: {
        value: null,
        serializable: true
    },

    customSections: {
        value: []
    },

    _customPi: {
        value: null
    },

    customPi: {
        get: function() {
            return this._customPi;
        },
        set: function(value) {
            if(this._customPi !== value) {
                this._customPi = value;
            }
        }
    },

    prepareForDraw: {
        value : function() {
            this.eventManager.addEventListener("elementChange", this, false);
            this.eventManager.addEventListener("selectionChange", this, false);

            // This will be a toggle option
            if(this.application.ninja.appData.PILiveUpdate) {
                this.eventManager.addEventListener( "elementChanging", this, false);
            }

            this.elementId.element.addEventListener("blur", this, false);
            this.elementId.element.addEventListener("focus", this, false);
            this.elementId.element.addEventListener("keyup", this, false);

            this.elementClass.element.addEventListener("blur", this, false);
            this.elementClass.element.addEventListener("focus", this, false);
            this.elementClass.element.addEventListener("keyup", this, false);
        }
    },

    /**
     * Blur and Key up to handle change in the Element ID field.
     */
    handleBlur: {
        value: function(event) {

            if(event.target === this.elementId.element) {

                // Remove all white spaces from the id
                this.elementId.value = this.elementId.value.replace(/\s/g, '');

                // Check if that id is in use
                if(this.application.ninja.currentDocument.model.views.design.document.getElementById(this.elementId.value) !== null) {
                    // TODO: Replace with Ninja Alert
                    alert("The following ID: " + this.elementId.value + " is already in use");
                }

                if(this.application.ninja.selectedElements.length) {
//                    ElementsMediator.setAttribute(this.application.ninja.selectedElements[0], "id", this.elementId.value, "Change", "pi");
                    ElementsMediator.setAttribute(this.application.ninja.selectedElements[0], "id", this.elementId.value, this.application.ninja.selectedElements[0].id, "pi");
                } else {
                    ElementsMediator.setAttribute(this.application.ninja.currentDocument.model.documentRoot, "id", this.elementId.value, "Change", "pi", this.application.ninja.currentDocument.model.documentRoot.elementModel.id);
                }
            } else if(event.target === this.elementClass.element) {
                if(this.application.ninja.selectedElements.length) {
                    ElementsMediator.setAttribute(this.application.ninja.selectedElements[0], "class", this.elementClass.value, this.application.ninja.selectedElements[0].className, "pi");
                } else {
                    ElementsMediator.setAttribute(this.application.ninja.currentDocument.model.documentRoot, "class", this.elementClass.value, "Change", "pi", this.application.ninja.currentDocument.model.documentRoot.elementModel.elementClass);
                }
            }
            NJevent("updatedID",this.application.ninja.selectedElements[0]);
        }
    },

    handleKeyup: {
        value: function(event) {
            if(event.keyCode === 13) {
                event.target.blur();
            }
        }
    },

    handleElementChanging: {
        value: function(event) {
//            this.positionSize.leftPosition = parseFloat(ElementsMediator.getProperty(this.application.ninja.selectedElements[0], "left"));
//            this.positionSize.topPosition = parseFloat(ElementsMediator.getProperty(this.application.ninja.selectedElements[0], "top"));
        }
    },

    handleElementChange: {
        value: function(event) {
            var l, t, h, w, lvu, tvu, hvu, wvu;
//            console.log("Element Change PI ", event.detail.source); // If the event comes from the pi don't need to update
            if(event.detail.source && event.detail.source !== "pi") {
                var el = this.application.ninja.currentDocument.model.documentRoot;
                if(this.application.ninja.selectedElements.length) {
                    el = this.application.ninja.selectedElements[0];
                }

                // TODO - This should only update the properties that were changed.
                l = ElementsMediator.getProperty(el, "left");
                t = ElementsMediator.getProperty(el, "top");
                lvu = document.application.njUtils.getValueAndUnits(l);
                tvu = document.application.njUtils.getValueAndUnits(t);
                this.positionSize.leftUnits = lvu[1];
                this.positionSize.leftPosition = lvu[0];
                this.positionSize.topUnits = tvu[1];
                this.positionSize.topPosition = tvu[0];

                h = ElementsMediator.getProperty(el, "height");
                w = ElementsMediator.getProperty(el, "width");
                hvu = document.application.njUtils.getValueAndUnits(h);
                wvu = document.application.njUtils.getValueAndUnits(w);

                this.positionSize.heightUnits = hvu[1] || "px"; // canvas (and shapes) don't have units.
                this.positionSize.heightSize = hvu[0];
                this.positionSize.widthUnits = wvu[1] || "px";
                this.positionSize.widthSize = wvu[0];

                if(this.threeD.inGlobalMode) {
                    this.threeD.x3D = ElementsMediator.get3DProperty(el, "x3D");
                    this.threeD.y3D = ElementsMediator.get3DProperty(el, "y3D");
                    this.threeD.z3D = ElementsMediator.get3DProperty(el, "z3D");
                    this.threeD.xAngle = ElementsMediator.get3DProperty(el, "xAngle");
                    this.threeD.yAngle = ElementsMediator.get3DProperty(el, "yAngle");
                    this.threeD.zAngle = ElementsMediator.get3DProperty(el, "zAngle");
                }
            }
        }
    },

    handleSelectionChange: {
        value: function(event) {
            if(event.detail.isDocument) {
                this.displayElementProperties(this.application.ninja.currentDocument.model.documentRoot);
            } else {
                if(this.application.ninja.selectedElements.length === 1) {
                    this.displayElementProperties(this.application.ninja.selectedElements[0]);
                } else {
                    this.displayGroupProperties(this.application.ninja.selectedElements);
                }

            }
        }
    },

    displaySelection: {
        value: function(selection) {
            if(selection.length === 0) {
                this.displayElementProperties(this._currentDocument.model.documentRoot);
            } else {
                if(selection.length === 1) {
                    this.displayElementProperties(this.application.ninja.selectedElements[0]);
                } else {
                    this.displayGroupProperties(this.application.ninja.selectedElements);
                }
            }
        }
    },

    clear: {
        value: function() {
            this.elementName.value = "";
            this.elementId.value = "";
            this.elementClass.value = "";
            this.customPi = null;
            this.customSections = [];
        }
    },

    displayElementProperties: {
        value: function (el) {
            var customPI, currentValue, isRoot = this.application.ninja.selectionController.isDocument,
                l, t, h, w, lvu, tvu, hvu, wvu;

            this.elementName.value = el.elementModel.selection;
            this.elementId.value = el.getAttribute("id") || "";
            this.elementClass.value = el.getAttribute("class");

            this.positionSize.disablePosition = isRoot;
            this.threeD.disableTranslation = isRoot;
            this.threeD.flatten = ElementsMediator.getProperty(el, "-webkit-transform-style") !== "preserve-3d";

            l = ElementsMediator.getProperty(el, "left");
            t = ElementsMediator.getProperty(el, "top");
            lvu = document.application.njUtils.getValueAndUnits(l);
            tvu = document.application.njUtils.getValueAndUnits(t);
            this.positionSize.leftUnits = lvu[1];
            this.positionSize.leftPosition = lvu[0];
            this.positionSize.topUnits = tvu[1];
            this.positionSize.topPosition = tvu[0];

            h = ElementsMediator.getProperty(el, "height");
            w = ElementsMediator.getProperty(el, "width");
            hvu = document.application.njUtils.getValueAndUnits(h);
            wvu = document.application.njUtils.getValueAndUnits(w);

            this.positionSize.heightUnits = hvu[1] || "px"; // canvas (and shapes) don't have units.
            this.positionSize.heightSize = hvu[0];
            this.positionSize.widthUnits = wvu[1] || "px";
            this.positionSize.widthSize = wvu[0];

            if(this.threeD.inGlobalMode)
            {
                this.threeD.x3D = ElementsMediator.get3DProperty(el, "x3D");
                this.threeD.y3D = ElementsMediator.get3DProperty(el, "y3D");
                this.threeD.z3D = ElementsMediator.get3DProperty(el, "z3D");
                this.threeD.xAngle = ElementsMediator.get3DProperty(el, "xAngle");
                this.threeD.yAngle = ElementsMediator.get3DProperty(el, "yAngle");
                this.threeD.zAngle = ElementsMediator.get3DProperty(el, "zAngle");
            }

            // Custom Section
            if(this.customPi !== el.elementModel.pi) {
                // We need to unregister color chips from the previous selection from the Color Model
                var len = this.customSections.length;
                for(var n = 0, controls; n < len; n++) {
                    controls = this.customSections[n].content.controls;
                    if(controls["colorSelect"]) {
                        controls["colorSelect"].destroy();
                    } else if(controls["background-color"]) {
                        controls["background-color"].destroy();
                    }
                }

                this.customPi = el.elementModel.pi;
                this.displayCustomProperties(el, el.elementModel.pi);

                // Root element color chip
                if(isRoot) {
                    //
                    var rootBackgroundColor, backgroundChip = this.customSections[0].content.controls["background"];
                    //
                    if (ElementsMediator.getProperty(el, "background-image")) {
                        rootBackgroundColor = ElementsMediator.getProperty(el, "background-image");
                        if (!rootBackgroundColor.mode) rootBackgroundColor = null;
                    } else if (ElementsMediator.getProperty(el, "background-color")){
                        rootBackgroundColor = ElementsMediator.getProperty(el, "background-color");
                        if (!rootBackgroundColor.mode) rootBackgroundColor = null;
                    } else if (ElementsMediator.getProperty(el, "background")){
                        rootBackgroundColor = ElementsMediator.getProperty(el, "background");
                        if (!rootBackgroundColor.mode) rootBackgroundColor = null;
                    }
                    //
                    if(rootBackgroundColor) {
                        backgroundChip.color = rootBackgroundColor;
                    } else {
                        backgroundChip.color = null;
                    }
                }
            }



            var previousInput = this.application.ninja.colorController.colorModel.input;
            customPI = PiData[this.customPi];
            // Get all the custom section for the custom PI
            for(var i = 0, customSec; customSec = customPI[i]; i++) {

                // Now set the Fields for the custom PI
                for(var j = 0, fields; fields = customSec.Section[j]; j++) {
                    for(var k = 0, control; control = fields[k]; k++) {

                        if(control.type !== "color") {
                            currentValue = ElementsMediator.getProperty(el, control.prop, control.valueMutator);
                            if(control.type === "hottext") {
                                if(currentValue == null) {
                                    currentValue = control.defaultValue;
                                }
                                if(typeof(currentValue) === "string") {
                                    currentValue = document.application.njUtils.getValueAndUnits(currentValue);
                                    this.customSections[i].content.controls[control.id + "Units"] = currentValue[1] || "px";
                                    this.customSections[i].content.controls[control.id] = currentValue[0];
                                } else {
                                    this.customSections[i].content.controls[control.id] = currentValue;
                                }
                            } else {
                                if(currentValue === null) {
                                    currentValue = control.defaultValue;
                                }
                                this.customSections[i].content.controls[control.id] = currentValue;
                            }
                        } else {
                            if(control.prop === "border") {
                                // TODO - For now, always return the top border if multiple border sides
                                currentValue = ElementsMediator.getColor(el, false, "top");
                                this.application.ninja.colorController.colorModel.input = "stroke";
                            } else if(control.prop === "background") {
                                currentValue = ElementsMediator.getColor(el, true);
                                this.application.ninja.colorController.colorModel.input = "fill";
                            }

                            if(currentValue) {
                                if(currentValue.color) {
                                    currentValue.color.wasSetByCode = true;
                                    currentValue.color.type = "change";
                                }

                                if(currentValue.mode === "gradient") {
                                    this.application.ninja.colorController.colorModel["gradient"] = {value: currentValue.color, wasSetByCode: true, type: 'change'};
                                } else {
                                    if (currentValue.color.a !== undefined) {
                                        this.application.ninja.colorController.colorModel.alpha = {value: currentValue.color.a, wasSetByCode: true, type: 'change'};
                                    }

                                    if(currentValue.color.mode) {
                                        this.application.ninja.colorController.colorModel[currentValue.color.mode] = currentValue.color;
                                    } else {
                                        this.application.ninja.colorController.colorModel["rgb"] = currentValue.color;
                                    }
                                }
                            } else {
                                this.application.ninja.colorController.colorModel.alpha = {value: 1, wasSetByCode: true, type: 'change'};
                                this.application.ninja.colorController.colorModel.applyNoColor(true);
                            }
                        }
                    }
                }
                if (previousInput === 'chip') return;
                this.application.ninja.colorController.colorModel.input =  previousInput;
                var color = this.application.ninja.colorController.colorModel.colorHistory[previousInput][this.application.ninja.colorController.colorModel.colorHistory[previousInput].length-1];
                color.c.wasSetByCode = true;
                color.c.type = 'change';
                switch (color.m) {
                    case 'rgb':
                        this.application.ninja.colorController.colorModel.alpha = {value: color.a, wasSetByCode: true, type: 'change'};
                        this.application.ninja.colorController.colorModel.rgb = color.c;
                        break;
                    case 'hsl':
                        this.application.ninja.colorController.colorModel.alpha = {value: color.a, wasSetByCode: true, type: 'change'};
                        this.application.ninja.colorController.colorModel.hsl = color.c;
                        break;
                    case 'hex':
                        //TODO: Check if anything needed here
                        break;
                    case 'gradient':
                        this.application.ninja.colorController.colorModel.gradient = color.c;
                        break;
                    case 'hsv':
                        this.application.ninja.colorController.colorModel.alpha = {value: color.a, wasSetByCode: true, type: 'change'};
                        this.application.ninja.colorController.colorModel.hsv = color.c;
                        break;
                    default:
                        this.application.ninja.colorController.colorModel.applyNoColor(true);
                        break;
                }
            }
        }
    },

    displayGroupProperties: {
        value: function (els) {
            this.elementName.value = "Multiple Elements";
            this.elementId.value = "";
            this.elementClass.value = "";
        }
    },

    displayCustomProperties: {
        value: function() {
            var customPI;

            this.customSections = [];

            customPI = PiData[this.customPi];

            if(customPI) {
                //Get all the custom sections for the custom PI
                for(var i = 0, customSec; customSec = customPI[i]; i++) {
                    var customUI = CustomSection.create();
                    customUI.fields = customSec.Section;
                    this.customSections.push({
                        name: customSec.label,
                        content: customUI
                    });
                }
            }

            for(var j = 0, customSections; customSections = this.customSections[j]; j++) {
                customSections.content.addEventListener("propertyChange", this, false);
                customSections.content.addEventListener("propertyChanging", this, false);
            }

        }
    },

    handlePropertyChange: {
        value: function(e) {
            if(e.wasSetByCode) return;

            var newValue;

            e.units ? newValue = e.value + e.units : newValue = e.value;

            ElementsMediator.setProperty(this.application.ninja.selectedElements, e.prop, [newValue], "Change", "pi");

        }
    },

    handlePropertyChanging: {
        value: function(e) {
            if(e.wasSetByCode) return;

            var newValue;

            e.units ? newValue = e.value + e.units : newValue = e.value;

            ElementsMediator.setProperty(this.application.ninja.selectedElements, e.prop, [newValue], "Changing", "pi");
        }
    }

});
