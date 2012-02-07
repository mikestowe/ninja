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
        value: null
    },

    componentsToLoad: {
        value: null
    },

    componentsLoaded: {
        value: 0
    },

    data2: {
            value: {
                "text": "styles",
                "children": [{
                    "text": "Box Styles",
                    "children": [
                        {
                            "text": "Border-Radius",
                            "classNameBase" : "border-radius",
                            "styles" : {
                                "border-radius": "100px",
                                "border" : "1px solid #333"
                            }
                        },
                        {
                            "text": "Drop Shadow",
                            "classNameBase" : "drop-shadow",
                            "styles" : {
                                "box-shadow": "2px 2px 50px rgba(0,0,0,0.5)",
                                "border" : "1px solid #CCC"
                            }
                        },
                        {
                            "text": "Fancy Box",
                            "classNameBase" : "fancy-box",
                            "styles" : {
                                "box-shadow": "inset 0 0 0 1px #666, inset 0 0 0 2px rgba(225, 225, 225, 0.4), 0 0 20px -10px #333",
                                "border" : "1px solid #FFF",
                                "border-radius": "30px",
                                "background-color": "#7db9e8",
                                "background-image": "-webkit-linear-gradient(top, rgba(255,255,255,0.74) 0%,rgba(255,255,255,0) 100%)"
                            }
                        }]
                }, {
                    "text": "Text Styles",
                    "children": [
                        { "text": "Italic" },
                        { "text": "Text Shadow" },
                        { "text": "Text Color" } ]
                }, {
                    "text": "Color Styles",
                    "children": [
                        { "text": "Background Gradient" },
                        { "text": "Background Color" },
                        { "text": "Text Highlight" } ]
                }]
            }
        },

    _testButtonJson: {
        value: {
            "component": "button",

            "module": "montage/ui/button.reel",

            "name": "Button",

            "properties": [
                {
                    "name": "label",
                    "type": "string",
                    "default": "Button"
                },
                {
                    "name": "enabled",
                    "type": "boolean",
                    "default": "true"
                }
            ]
        }
    },

    didCreate: {
        value: function() {

            this._loadComponents();

        }
    },

    _loadComponents: {
        value: function() {
            this.components = [
                {name: "Button", data: "node_modules/components-data/button.json"},
                {name: "Textfield", data: "node_modules/components-data/textfield.json"}
            ];

            this.componentsToLoad = this.components.length;

            // Build the PI objects for each component
            for(var i = 0, component; component = this.components[i]; i++) {
                var req = new XMLHttpRequest();
                //req.identifier = "searchRequest";
                req.open("GET", component.data);
                req.addEventListener("load", this, false);
                req.addEventListener("error", this, false);
                req.send();

            }

        }
    },

    handleLoad: {
        value: function(evt) {
            var response = JSON.parse(evt.target.responseText);

            var component = response.component.capitalizeFirstChar();

            var piIdentifier = component + "Pi";
            var piObj = [];
            var section = {};


            section.label = component + " Properties";
            section.Section = [];

            for(var j = 0, props; props = response.properties[j]; j++) {
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

    prepareForDraw: {
    	enumerable: false,
    	value: function() {

            var treeHolderDiv = document.getElementById("comp_tree");
            var componentsTree = treeControlModule.Tree.create();
            componentsTree.element = treeHolderDiv;
            componentsTree.dataProvider = this._loadXMLDoc("js/panels/Components/Components.xml");
            componentsTree.needsDraw = true;

            this.eventManager.addEventListener( "executeAddComponent", this, false);

    	}
    },

    _loadXMLDoc: {
        value:function(dname) {
            if (window.XMLHttpRequest) {
                xhttp = new XMLHttpRequest();
            }
            xhttp.open("GET", dname, false);
            xhttp.send();
            return xhttp.responseXML;
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
            this.application.ninja.currentDocument._window.addComponent(element, {type: "Button", path: component.module, name: "Button"}, function(instance, element) {

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
            var el;
            el = NJUtils.makeNJElement(name, "Button", "component");
            el.elementModel.pi = "ButtonPi";
            el.setAttribute("type", "button");
            return el;
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