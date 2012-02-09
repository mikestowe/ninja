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
                            "text": "Textfield",
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

    centerStage: {
        value: null
    },

    didCreate: {
        value: function() {
            // Loop through the component and load the JSON data for them
            this._loadComponents();
        }
    },

    // Load all the data files for each component
    // TODO: Implement the error case
    _loadComponents: {
        value: function() {

            this.componentsToLoad = this.components.children[0].children.length;

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
            var componentData, component, piID, piObj, section;

            componentData = JSON.parse(evt.target.responseText);

            component = componentData.name;

            // Build the PI data and create a new object for Ninja PI
            piID = component + "Pi";
            piObj = [];
            section = {};
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

            PIData[piID] = [];
            PIData[piID].push(section);

            // Setup the component hash object to store references to each component data
            this.componentsData[componentData.component] = componentData;

            this.componentsLoaded++;

            if(this.componentsLoaded === this.componentsToLoad) {
                // console.log("all loaded");
                // Here we need to stop some sort of loading animation
            }

        }
    },

    // PI conversion method. This will convert the property type into a Ninja component
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
            //console.log(selection);
            //console.log(this.componentsData[selection.component]);
            this.addComponentToStage(this.componentsData[selection.component]);
        }
    },

    // This method will be used once we handle drag and drop
    handleExecuteAddComponent: {
        value: function(evt) {
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

                var pos = that.getStageCenter();

                var styles = {
                    'position': 'absolute',
                    'left'      : pos[0] + 'px',
                    'top'       : pos[1] + 'px',
                    '-webkit-transform-style' : 'preserve-3d',
                    '-webkit-transform' : 'perspective(1400) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
                };

                that.application.ninja.currentDocument.setComponentInstance(instance, element);

                NJevent("elementAdding", {"el": element, "data":styles});
            });
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
                    el = NJUtils.makeNJElement("input", "Text Field", "component");
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
    },

    /**
     *
     */
    getStageCenter: {
        value: function() {
            //if(!this.centerStage) {
                var top, left;

                top = ~~((parseFloat(this.application.ninja.elementMediator.getProperty(this.application.ninja.currentDocument.documentRoot, "height"))) / 2);
                left = ~~((parseFloat(this.application.ninja.elementMediator.getProperty(this.application.ninja.currentDocument.documentRoot, "width"))) / 2);
                //this.centerStage = [top, left];
                return [left, top];
            //}

            //return this.centerStage;
        }
    }
});