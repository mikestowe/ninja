/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

//var Button = ("montage/ui/button.reel").Button,
//    Checkbox = ("montage/ui/checkbox.reel").Checkbox,
//    Condition = ("montage/ui/condition.reel").Condition,
//    DynamicText = ("montage/ui/dynamic-text.reel").DynamicText,
//
//    FlowController = ("montage/ui/flow-controller.reel").FlowController,
//
//    HotText = ("montage/ui/hottext.reel").HotText,
//    HotTextUnit = ("montage/ui/hottextunit.reel").HotTextUnit,
//
//    ImageContainer = ("montage/ui/photo-editor.reel").PhotoEditor,
//    Progress = ("montage/ui/progress.reel").Progress,
//
//    Repetition = ("montage/ui/repetition.reel").Repetition,
//    Scrollview = ("montage/ui/scrollview.reel").Scrollview,
//    Slider  = ("montage/ui/slider.reel").Slider,
//    Slot = ("montage/ui/slot.reel").Slot,
//    Substitution = ("montage/ui/substitution.reel").Substitution,
//
//    TextArea = ("montage/ui/textarea.reel").TextArea,
//    Textfield = ("montage/ui/textfield.reel").Textfield,
//
//    Toggle = ("montage/ui/toggle.reel").Toggle,
//    ToggleButton = ("montage/ui/button.reel").ToggleButton;

exports.MyAppDelegate = Montage.create(Component, {
    templateDidLoad: {
		value: function(){
            window.addComponent = this.addComponentToUserDocument;
            window.addBinding = this.addBindingToUserDocument;

            var newEvent = document.createEvent( "CustomEvent" );
            newEvent.initCustomEvent( "userTemplateDidLoad", false, true );

            document.body.dispatchEvent( newEvent );

        }
    },

    addComponentToUserDocument:{
        value:function(containerElement, componentType){
            var component = null;
            switch(componentType){
                case "Button":
                    component = Button.create();
                    component.element = containerElement;
                    component.element.classList.add("text");
                    component.value = "Button";
                    component.needsDraw = true;
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
    },
    addBindingToUserDocument:{
        value:function(boundComponent, boundValue, targetComponent, targetValue){
            if(targetComponent[targetValue] != undefined && boundComponent[boundValue] != undefined){
                Object.defineBinding(boundComponent, boundValue, {
                    boundObject: targetComponent,
                    boundObjectPropertyPath: targetValue,
                    boundValueMutator: function(value) {
                        return(value);
                    }
                });
            } else {
                if(targetComponent[targetValue] == undefined){
                    console.log("Binding Fail - Component Property Not Found: " + targetValue);
                    alert("Binding Failed - Component Property Not Found: " + targetValue)
                } else if(boundComponent[boundValue] == undefined){
                    console.log("Binding Fail - Component Property Not Found: " + boundValue);
                    alert("Binding Failed - Component Property Not Found: " + boundValue);
                }
            }
        }
    }
});