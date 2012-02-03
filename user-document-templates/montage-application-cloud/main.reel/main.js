/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

//var Button = ("montage/ui/button.reel").Button;

exports.Main = Montage.create(Component, {

    hasTemplate: {
        value: false
    },

    /**
     * Adding window hooks to callback into this object from Ninja.
     */
    templateDidLoad: {
        value: function(){
            window.addComponent = this.addComponentToUserDocument;
//            window.addBinding = this.addBindingToUserDocument;

            // Dispatch event when this template has loaded.
            var newEvent = document.createEvent( "CustomEvent" );
            newEvent.initCustomEvent( "userTemplateDidLoad", false, true );

            document.body.dispatchEvent( newEvent );

        }
    },

    addComponentToUserDocument:{
        value:function(containerElement, componentType, callback){
            var component = null;
            switch(componentType.type){
                case "Button":

                    var button = require.async(componentType.path)
                    .then(function (button) {
                        var buttonObj = button["Button"];
                        var btIns = buttonObj.create();

                        btIns.element = containerElement;
                        btIns.deserializedFromTemplate();

                        btIns.needsDraw = true;
                        btIns.label = "Button";
                        callback(btIns, containerElement);
                    })
                    .end();

                    break;
                case "Checkbox":
                    component = Checkbox.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "Condition":
                    component = Condition.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "DynamicText":
                    component = DynamicText.create();
                    component.element = containerElement;
                    component.value = "Label";
                    component.needsDraw = true;
                    break;
                case "HotText":
                    component = HotText.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "HotTextUnit":
                    component = HotTextUnit.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "FlowController":
                    component = FlowController.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "ImageContainer":
                    component = ImageContainer.create();
                    component.element = containerElement;
                    component.element.style.width = "285px";
                    component.element.style.height = "235px";
                    component.src = "placeholder.jpg";
                    component.needsDraw = true;
                    break;
                case "Progress":
                    component = Progress.create();
                    component.element = containerElement;
                    component.loading = true;
                    component.needsDraw = true;
                    break;
                case "Repetition":
                    component = Repetition.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "Scrollview":
                    component = Scrollview.create();
                    component.element = containerElement;
                    component.element.style.width = "200px";
                    component.element.style.height = "200px";
                    var dummyContent = document.createElement("div");
                    dummyContent.innerHTML = "<img src='image3.jpg'/>";
                    component.element.appendChild(dummyContent);
                    component.needsDraw = true;
                    break;
                case "Slider":
                    component = Slider.create();
                    component.element = containerElement;
//                    component.value = 0;
//                    component._minValue = 0;
//                    component._maxValue = 100;
                    component.needsDraw = true;
                    break;
                case "Slot":
                    component = Slot.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "Substitution":
                    component = Substitution.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "TextArea":
                    component = TextArea.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "Textfield":
                    component = Textfield.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "Toggle":
                    component = Toggle.create();
                    component.element = containerElement;
                    component.needsDraw = true;
                    break;
                case "ToggleButton":
                    component = ToggleButton.create();
                    component.element = containerElement;
                    component.element.classList.add("text");
                    component.needsDraw = true;
                    break;
                default:
                    console.log("Unrecognized component type");
            }
            //console.log(component);
            return component;
        }
    }

});