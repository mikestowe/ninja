/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage     = require("montage/core/core").Montage,
    Component   = require("montage/ui/component").Component,
    NJUtils     = require("js/lib/NJUtils").NJUtils;

var treeControlModule   = require("js/components/tree.reel");
var PIData              = require("js/data/pi/pi-data").PiData;

String.prototype.capitalizeFirstChar = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


var ComponentsPanelBase = exports.ComponentsPanelBase = Montage.create(Component, {

    components: {
        value: {
            "text": "styles",
            "children": [
                {
                    "text": "Montage Components",
                    "children": [
                        {
                            "text": "Button",
                            "dataFile" : "node_modules/components-data/button.json",
                            "component": "button"
                        },
                        {
                            "text": "Text Field",
                            "dataFile" : "node_modules/components-data/textfield.json",
                            "component": "textfield"
                        }
                    ]
                }
            ]
        }
    },

    componentsData: {
        value: {}
    },

    componentsToLoad: {
        value: null
    },

    componentsLoaded: {
        value: 0
    },

    didCreate: {
        value: function() {
            // Loop through the component and load the JSON data for them
            this._loadComponents();

        }
    },

    _loadComponents: {
        value: function() {

            this.componentsToLoad = this.components.children[0].children.length;

            // Build the PI objects for each component
            for(var i = 0, component; component = this.components.children[0].children[i]; i++) {
                var req = new XMLHttpRequest();
                //req.identifier = "searchRequest";
                req.open("GET", component.dataFile);
                req.addEventListener("load", this, false);
                req.addEventListener("error", this, false);
                req.send();

            }


        }
    },

    handleLoad: {
        value: function(evt) {
            var componentData = JSON.parse(evt.target.responseText);

            //var component = response.component.capitalizeFirstChar();
            var component = componentData.name;

            var piIdentifier = component + "Pi";
            var piObj = [];
            var section = {};


            section.label = component + " Properties";
            section.Section = [];

            for(var j = 0, props; props = componentData.properties[j]; j++) {
                var row = {};
                row.type = this.getControlType(props.type);
                row.id = props.name;
                row.prop = props.name;
                row.defaultValue = props["default"];
                row.label = props.name;

                section.Section.push([row]);
            }

            PIData[piIdentifier] = [];
            PIData[piIdentifier].push(section);

            // Setup the componentsData
            this.componentsData[componentData.component] = componentData;

            this.componentsLoaded++;

            if(this.componentsLoaded === this.componentsToLoad) {
                console.log("all loaded");
            }

        }
    },

    getControlType: {
        value: function(type) {
            switch(type) {
                case "string":
                    return "textbox";
                case "boolean":
                    return "checkbox";
                default:
                    alert("Conversion not implemented for ", type);
            }
        }
    },

    applySelection: {
        value: function(selection) {
            console.log(selection);
            console.log(this.componentsData[selection.component]);
            this._stash.dropx = 200;
            this._stash.dropy = 200;
            this.addComponentToStage(this.componentsData[selection.component]);// evt.detail.dropX, evt.detail.dropY);

        }
    },

    _stash: {
        value: {}
    },

    handleExecuteAddComponent: {
        value: function(evt) {
            //var component = evt.detail.component;
            // Get the data from the event detail component
            var component = this._testButtonJson;
            this._stash.dropx = evt.detail.dropX;
            this._stash.dropy = evt.detail.dropY;
            this.addComponentToStage(component);// evt.detail.dropX, evt.detail.dropY);
        }
    },

    /**
     * Send a request to add a component to the user document and waits for a callback to continue
     */
    addComponentToStage: {
        value: function(component) {
            var that = this;
            var element = this.makeComponent(component.component);
            this.application.ninja.currentDocument._window.addComponent(element, {type: component.name, path: component.module, name: "Button"}, function(instance, element) {

                var styles = {
                    'position': 'absolute',
                    'top'       : that._stash.dropy + 'px',
                    'left'      : that._stash.dropx + 'px',
                    '-webkit-transform-style' : 'preserve-3d',
                    '-webkit-transform' : 'perspective(1400) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
                };


                that.application.ninja.currentDocument.setComponentInstance(instance, element);

                NJevent("elementAdding", {"el": element, "data":styles});
            });
        }
    },

    callback: {
        value: function(instance, element) {
            console.log(instance);

            var styles = {
                'position': 'absolute',
                'top'       : this._stash.dropx + 'px',
                'left'      : this._stash.dropy + 'px',
                '-webkit-transform-style' : 'preserve-3d',
                '-webkit-transform' : 'perspective(1400) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
            };

            this.application.ninja.currentDocument.setComponentInstance(instance, element);

            NJevent("elementAdding", {"el": element, "data":styles});

        }
    },

    makeComponent: {
        value: function(name) {
            switch(name) {
                case "button":
                    var el;
                    el = NJUtils.makeNJElement(name, "Button", "component");
                    el.elementModel.pi = "ButtonPi";
                    el.setAttribute("type", "button");
                    return el;
                case "textfield": {
                    var el;
                    el = NJUtils.makeNJElement(name, "Text Field", "component");
                    el.elementModel.pi = "TextfieldPi";
                    el.setAttribute("type", "text");
                    return el;
                }
            }

        }
    },

    ___addComponentToStage:{
        value:function(component, dropX, dropY){
//            var compW = 100,
//                compH = 100,
//
            var componentEl, componentInstance;

            if(componentType == "Button"){
                componentEl = NJUtils.makeNJElement("button", componentType, "component");//, {"type": "button"});
                componentEl.setAttribute("type", "button");

                componentInstance = this.application.ninja.currentDocument._window.addComponent(componentEl, {type: componentType, path: "montage/ui/button.reel", name: "Button"}, this.callback);

            }else if(componentType == "Checkbox"){
                compW = 53;
                compH = 53;
//                elementType = "input";
            }else if(componentType == "DynamicText"){
                compW = 100;
                compH = 20;
            }else if(componentType == "FlowController"){
                compW = 800;
                compH = 320;
            }else if(componentType == "HotText"){
                compW = 50;
                compH = 18;
//                elementType = "input";
            }else if(componentType == "HotTextUnit"){
                compW = 45;
                compH = 18;
            }else if(componentType == "ImageContainer"){
                compW = 285;
                compH = 232;
            }else if(componentType == "Progress"){
                compW = 300;
                compH = 9;
            }else if(componentType == "Scrollview"){
                compW = 200;
                compH = 200;
            }else if(componentType == "Slider"){
                compW = 200;
                compH = 55;
            }else if(componentType == "TextArea"){
                compW = 312;
                compH = 112;
                elementType = "textarea";
            }else if(componentType == "Textfield"){
                compW = 312;
                compH = 34;
                elementType = "input";
            }else if(componentType == "Toggle"){
                compW = 60;
                compH = 22;
                elementType = "span";
            }else if(componentType == "ToggleButton"){
                compW = 118;
                compH = 52;
            }else{
                compW = 100;
                compH = 25;
            }


            /*
            componentContainer = NJUtils.makeNJElement("div", componentType, "component");
            componentContainer.elementModel.isComponent = true;
            */
            var styles = {
                'position': 'absolute',
                'top'       : dropY + 'px',
                'left'      : dropX + 'px',
//                'width'     : compW + 'px',
//                'height'    : compH + 'px',
                '-webkit-transform-style' : 'preserve-3d',
                '-webkit-transform' : 'perspective(1400) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
            };


            //componentElement = NJUtils.makeNJElement(elementType, "ComponentDiv", "block");

            //componentContainer.appendChild(componentElement);

            this.application.ninja.currentDocument.setComponentInstance(componentInstance, componentEl);

            NJevent("elementAdding", {"el": componentEl, "data":styles});
            /*
            var componentRef = this.application.ninja.currentDocument._window.addComponent(componentElement, componentType);

            */



        }
    }
});