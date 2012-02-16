/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage         = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component,
    PiData          = require("js/data/pi/pi-data").PiData,
    CustomSection   = require("js/panels/properties/sections/custom.reel").CustomSection;

var ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.Content = Montage.create(Component, {

    elementName: {
        value: null
    },

    elementID: {
        value: null
    },

    elementClassName: {
        value: null
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

            this.eventManager.addEventListener("selectionChange", this, false);

            // This will be a toggle option
            if(this.application.ninja.appData.PILiveUpdate) {
                this.eventManager.addEventListener( "elementChanging", this, false);
            }

            this.eventManager.addEventListener("openDocument", this, false);
        }
    },

    // Document is opened - Display the current selection
    handleOpenDocument: {
        value: function() {

            this.eventManager.addEventListener( "elementChange", this, false);

            // For now always assume that the stage is selected by default
            if(this.application.ninja.selectedElements.length === 0) {
                this.displayStageProperties();
            }

            this.elementId.element.addEventListener("blur", this, false);
            this.elementId.element.addEventListener("keyup", this, false);
        }
    },

    /**
     * Blur and Key up to handle change in the Element ID field.
     */
    handleBlur: {
        value: function(event) {
            if(this.application.ninja.selectedElements.length) {
                ElementsMediator.setAttribute(this.application.ninja.selectedElements[0], "id", this.elementId.value, "Change", "pi");
            } else {
                ElementsMediator.setAttribute(this.application.ninja.currentDocument.documentRoot, "id", this.elementId.value, "Change", "pi", this.application.ninja.currentDocument.documentRoot.elementModel.id);
            }
        }
    },
    
    handleKeyup: {
        value: function(event) {
            if(event.keyCode === 13) {
                this.elementId.element.blur();
            }      
        }
    },

    handleElementChanging: {
        value: function(event) {
//            this.positionSize.leftPosition = parseFloat(ElementsMediator.getProperty(this.application.ninja.selectedElements[0]._element, "left"));
//            this.positionSize.topPosition = parseFloat(ElementsMediator.getProperty(this.application.ninja.selectedElements[0]._element, "top"));
        }
    },

    handleElementChange: {
        value: function(event) {
//            console.log("Element Change PI ", event.detail.source); // If the event comes from the pi don't need to update
            if(event.detail.source && event.detail.source !== "pi") {
                // TODO - This should only update the properties that were changed.
                var el = this.application.ninja.selectedElements[0]._element || this.application.ninja.selectedElements[0];
                this.positionSize.leftPosition = parseFloat(ElementsMediator.getProperty(el, "left"));
                this.positionSize.topPosition = parseFloat(ElementsMediator.getProperty(el, "top"));
                this.positionSize.heightSize = parseFloat(ElementsMediator.getProperty(el, "height"));
                this.positionSize.widthSize = parseFloat(ElementsMediator.getProperty(el, "width"));

                if(this.threeD.inGlobalMode)
                {
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
                this.displayStageProperties();
            } else {
                if(this.application.ninja.selectedElements.length === 1) {
                    this.displayElementProperties(this.application.ninja.selectedElements[0]._element);
                } else {
                    this.displayGroupProperties(this.application.ninja.selectedElements);
                }

            }
        }
    },

    displayStageProperties: {
        value: function() {
            var stage = this.application.ninja.currentDocument.documentRoot;
            //this is test code please remove
            this.elementName = "Stage";
            this.elementId.value = stage.elementModel.id;
            this.elementClassName = "";

            this.positionSize.disablePosition = true;
            this.threeD.disableTranslation = true;

            this.positionSize.heightSize = parseFloat(ElementsMediator.getProperty(stage, "height"));
            this.positionSize.widthSize = parseFloat(ElementsMediator.getProperty(stage, "width"));

            if(this.customPi !== stage.elementModel.pi) {
                this.customPi = stage.elementModel.pi;
                this.displayCustomProperties(stage, stage.elementModel.pi);
            }

            // For now hardcode the background since it is the only custom property
            // No need to loop through all the properties.
            var backgroundChip = this.customSections[0].content.controls["background"];
            backgroundChip.initialColor = ElementsMediator.getProperty(stage, "background");

            /*
            var customPI = PiData[this.customPi];
            // Get all the custom section for the custom PI
            for(var i = 0, customSec; customSec = customPI[i]; i++) {

                // Now set the Fields for the custom PI
                for(var j = 0, fields; fields = customSec.Section[j]; j++) {
                    for(var k = 0, control; control = fields[k]; k++) {

                        var colorChipEl = this.customSections[i].content.controls[control.id];
                        this.foo = colorChipEl;
                        colorChipEl.addEventListener("firstDraw", this, false);

                    }
                }
            }
            */
        }
    },

    handleFirstDraw: {
        value: function() {
            this.foo.chipBtn.color('rgb', {wasSetByCode: true, type: 'change', color: {r: 255, g: 0, b: 0}, css: 'rgb(255,0,0)'});
        }
    },

    displayElementProperties: {
        value: function (el) {
            var customPI,
                currentValue;

            this.elementName = el.elementModel.selection;
            this.elementId.value = el.getAttribute("id") || "";
            this.elementClassName = el.getAttribute("class");

            this.positionSize.disablePosition = false;
            this.threeD.disableTranslation = false;

            this.positionSize.leftPosition = parseFloat(ElementsMediator.getProperty(el, "left"));
            this.positionSize.topPosition = parseFloat(ElementsMediator.getProperty(el, "top"));
            this.positionSize.heightSize = parseFloat(ElementsMediator.getProperty(el, "height"));
            this.positionSize.widthSize = parseFloat(ElementsMediator.getProperty(el, "width"));


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
                this.customPi = el.elementModel.pi;
                this.displayCustomProperties(el, el.elementModel.pi);
            }

            customPI = PiData[this.customPi];
            // Get all the custom section for the custom PI
            for(var i = 0, customSec; customSec = customPI[i]; i++) {

                // Now set the Fields for the custom PI
                for(var j = 0, fields; fields = customSec.Section[j]; j++) {
                    for(var k = 0, control; control = fields[k]; k++) {

                        if(control.type !== "color") {
                            currentValue = ElementsMediator.getProperty(el, control.prop, control.valueMutator);
                            if(currentValue === null)
                            {
                                currentValue = control.defaultValue;
                            }
                            this.customSections[i].content.controls[control.id] = currentValue;
                        }
                        else
                        {
                            currentValue = ElementsMediator.getColor2(el, control.prop, control.valueMutator);
                            if(control.prop === "border")
                            {
                                this.application.ninja.colorController.colorModel.input = "stroke";
                            }
                            else if(control.prop === "background")
                            {
                                this.application.ninja.colorController.colorModel.input = "fill";
                            }

                            if(currentValue)
                            {
                                if(currentValue.mode === "gradient")
                                {
                                    this.application.ninja.colorController.colorModel["gradient"] =
                                                    {value: currentValue.color, wasSetByCode: true, type: 'change'};
                                }
                                else
                                {
                                    if (currentValue.color.a !== undefined)
                                    {
                                        this.application.ninja.colorController.colorModel.alpha =
                                                        {value: currentValue.color.a, wasSetByCode: true, type: 'change'};
                                    }
                                    this.application.ninja.colorController.colorModel[currentValue.color.mode] = currentValue.color;
                                }
                            }
                            else
                            {
                                this.application.ninja.colorController.colorModel.alpha = {value: 1, wasSetByCode: true, type: 'change'};
                                this.application.ninja.colorController.colorModel.applyNoColor();
                            }
                        }
                    }
                }
            }
        }
    },

    displayGroupProperties: {
        value: function (els) {
            this.elementName = "Multiple Elements";
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

//            ElementsMediator.setProperty(this.application.ninja.selectedElements, "border-style", [this.customSections[0].content.controls.borderStyle], "Changing", "pi");
            ElementsMediator.setProperty(this.application.ninja.selectedElements, e.prop, [e.value + "px"], "Changing", "pi");


        }
    }

});
