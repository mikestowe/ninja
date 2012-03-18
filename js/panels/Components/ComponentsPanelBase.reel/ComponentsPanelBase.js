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
                    "text": "Widgets",
                    "children": [
                        {
                            "text": "Feed Reader",
                            "dataFile" : "node_modules/components-data/feed-reader.json",
                            "component": "feedreader"
                        },
                        {
                            "text": "Map",
                            "dataFile" : "node_modules/components-data/map.json",
                            "component": "map"
                        },
                        {
                            "text": "Picasa Carousel",
                            "dataFile" : "node_modules/components-data/picasa-carousel.json",
                            "component": "picasa-carousel"
                        },
                        {
                            "text": "Search Bar",
                            "dataFile" : "node_modules/components-data/searchfield.json",
                            "component": "searchfield"
                        },
                        {
                            "text": "Youtube Channel",
                            "dataFile" : "node_modules/components-data/youtube-channel.json",
                            "component": "youtube-channel"
                        }
                    ]
                },
                {
                    "text": "Montage Components",
                    "children": [
                        {
                            "text": "Anchor",
                            "dataFile" : "node_modules/components-data/anchor.json",
                            "component": "anchor"
                        },
                        {
                            "text": "Button",
                            "dataFile" : "node_modules/components-data/button.json",
                            "component": "button"
                        },
                        {
                            "text": "Checkbox",
                            "dataFile" : "node_modules/components-data/checkbox.json",
                            "component": "checkbox"
                        },
                        {
                            "text": "Image Component",
                            "dataFile" : "node_modules/components-data/image.json",
                            "component": "imageComponent"
                        },
                        {
                            "text": "NumberInput",
                            "dataFile" : "node_modules/components-data/number-input.json",
                            "component": "numberInput"
                        },
                       {
                            "text": "Select Input",
                            "dataFile" : "node_modules/components-data/select.json",
                            "component": "select"
                        },
                        {
                            "text": "Radio Button",
                            "dataFile" : "node_modules/components-data/radio-button.json",
                            "component": "radioButton"
                        },
                        {
                            "text": "Range Input",
                            "dataFile" : "node_modules/components-data/range-input.json",
                            "component": "rangeInput"
                        },
                        {
                            "text": "TextArea",
                            "dataFile" : "node_modules/components-data/textarea.json",
                            "component": "textarea"
                        },
                        {
                            "text": "Textfield",
                            "dataFile" : "node_modules/components-data/textfield.json",
                            "component": "textfield"
                        },
                        {
                            "text": "Toogle Button",
                            "dataFile" : "node_modules/components-data/toggle-button.json",
                            "component": "toggleButton"
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

    dragComponent: {
        value: null
    },

    dragPosition: {
        value: null
    },

    centerStage: {
        value: null
    },


    /*********************************************************************
     * Components Tree and Model Creation
     *********************************************************************/

    didCreate: {
        value: function() {
            // Setup the drop delegate
            this.application.ninja.dragDropMediator.dropDelegate = this;
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
                row.items = props.possibleValues;

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
                case "select":
                    return "dropdown";
                case "number":
                    return "hottext";
                default:
                    alert("Conversion not implemented for ", type);
            }
        }
    },

    /*********************************************************************
     * Handle Tree / Drag-Drop events
     *********************************************************************/

    handleDblclick: {
        value: function(obj) {
            this.addComponentToStage(this.componentsData[obj.component]);
        }
    },

    handleDragStart: {
        value: function(obj, event) {
            this.dragComponent = obj;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', 'componentDrop');
        }
    },

    handleComponentDrop: {
        value: function(left, top) {
            this.addComponentToStage(this.componentsData[this.dragComponent.component], [left, top]);
        }
    },


    /**
     * Send a request to add a component to the user document and waits for a callback to continue
     */
    addComponentToStage: {
        value: function(component, position) {
            var that, element;

            // Check for position. If none then center on the stage
            if(position) {
                this.dragPosition = position;
            } else {
                this.dragPosition = this.getStageCenter();

            }
            that = this;
            element = this.makeComponent(component.component);

            this.application.ninja.currentDocument._window.addComponent(element, {name: component.name, path: component.module}, function(instance, element) {

                //var pos = that.getStageCenter();

                var styles = {
                    'position': 'absolute',
                    'left'      : that.dragPosition[0] + 'px',
                    'top'       : that.dragPosition[1] + 'px',
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
            var el;

            switch(name) {
                case "anchor":
                    el = NJUtils.makeNJElement("a", "Anchor", "component");
                    el.elementModel.pi = "AnchorPi";
                    el.setAttribute("href", "http://www.motorola.com");
                    el.innerHTML = "link";
                    break;
                case "button":
                    el = NJUtils.makeNJElement(name, "Button", "component");
                    el.elementModel.pi = "ButtonPi";
                    el.setAttribute("type", "button");
                    el.innerHTML = "Button";
                    break;
                case "checkbox":
                    el = NJUtils.makeNJElement("input", "Checkbox", "component");
                    el.elementModel.pi = "CheckboxPi";
                    el.setAttribute("type", "checkbox");
                    break;
                case "imageComponent":
                    el = NJUtils.makeNJElement("image", "Image", "component");
                    el.elementModel.pi = "ImagePi";
                    el.setAttribute("width", 200);
                    el.setAttribute("height", 200);
                    break;
                case "numberInput":
                    el = NJUtils.makeNJElement("input", "Number Input", "component");
                    el.elementModel.pi = "NumberInputPi";
                    el.setAttribute("type", "number");
                    break;
                case "select":
                    el = NJUtils.makeNJElement("select", "Select", "component");
                    el.elementModel.pi = "SelectInputPi";
                    break;
                case "radioButton":
                    el = NJUtils.makeNJElement("input", "Radio Button", "component");
                    el.elementModel.pi = "RadioButtonPi";
                    el.setAttribute("type", "radio");
                    break;
                case "rangeInput":
                    el = NJUtils.makeNJElement("input", "Range Input", "component");
                    el.elementModel.pi = "RangeInputPi";
                    el.setAttribute("type", "range");
                    break;
                case "textfield":
                case "searchfield":
                    el = NJUtils.makeNJElement("input", "Textfield", "component");
                    el.elementModel.pi = "TextfieldPi";
                    el.setAttribute("type", "text");
                    break;
                case "textarea":
                    el = NJUtils.makeNJElement("textarea", "TextArea", "component");
                    el.elementModel.pi = "TextAreaPi";
                    break;
                case "toggleButton":
                    el = NJUtils.makeNJElement("button", "Toggle Button", "component");
                    el.elementModel.pi = "ToggleButtonPi";
                    el.innerHTML = "Off";
                    break;
                case "map":
                    el = NJUtils.makeNJElement("div", "Map", "component");
                    el.elementModel.pi = "MapPi";
                    el.elementModel.isComponent = true;
                    break;
                case "feedreader":
                    el = NJUtils.makeNJElement("div", "Feed Reader", "component");
                    el.elementModel.pi = "FeedReaderPi";
                    el.elementModel.isComponent = true;
                    break;
                case "picasa-carousel":
                    el = NJUtils.makeNJElement("div", "Picasa Carousel", "component");
                    el.elementModel.pi = "PicasaCarouselPi";
                    el.elementModel.isComponent = true;
                    break;
                case "youtube-channel":
                    el = NJUtils.makeNJElement("div", "Youtube Channel", "component");
                    el.elementModel.pi = "YoutubeChannelPi";
                    el.elementModel.isComponent = true;
                    break;

            }

            return el;
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