/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage             = require("montage/core/core").Montage,
    Component           = require("montage/ui/component").Component,
    ElementController   = require("js/controllers/elements/element-controller").ElementController,
    ClassUUID           = require("js/components/core/class-uuid").ClassUuid,
    PIData              = require("js/data/pi/pi-data").PiData;

String.prototype.capitalizeFirstChar = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


exports.ComponentsPanel = Montage.create(Component, {

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
                            "text": "Select Input",
                            "dataFile" : "node_modules/components-data/select.json",
                            "component": "select"
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

            for(var cat in this.components.children) {

                this.componentsToLoad += this.components.children[cat].children.length;

                for(var i = 0, component; component = this.components.children[cat].children[i]; i++) {
                    var req = new XMLHttpRequest();
                    //req.identifier = "searchRequest";
                    req.open("GET", component.dataFile);
                    req.addEventListener("load", this, false);
                    req.addEventListener("error", this, false);
                    req.send();
                }

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
                    return "ht";
                default:
                    alert("Conversion not implemented for " + type);
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
            this.application.ninja.currentDocument.model.views.design.iframe.contentWindow.addComponent(element, {
                    identifier: this.CreateUniqueComponentName(component.name),
                    name: component.name,
                    path: component.module,
                    firstDraw: {cb: this.componentInstanceOnFirstDraw, ctx: this}
                },
                function(instance, element) {

                    //var pos = that.getStageCenter();

                    var styles = {
                        'position': 'absolute',
                        'left'      : that.dragPosition[0] + 'px',
                        'top'       : that.dragPosition[1] + 'px'
                    };

                    var defaultStyles = component.defaultStyles;
                    if(defaultStyles) {
                        for(var n in defaultStyles) {
                            styles[n] = defaultStyles[n];
                        }
                    }

                    //that.application.ninja.elementMediator.addElements(element, styles);
                    ElementController.addElement(element, styles);
                }
            );

        }
    },

    componentInstanceOnFirstDraw: {
        value: function(instance) {
            var addDelegate = this.application.ninja.elementMediator.addDelegate;
            this.application.ninja.elementMediator.addDelegate = null;
            this.application.ninja.elementMediator.addElements(instance.element);
            this.application.ninja.currentDocument.model.mObjects.push(instance);
            this.application.ninja.elementMediator.addDelegate = addDelegate;
        }
    },

    makeComponent: {
        value: function(name) {
            var el;

            switch(name) {
                case "anchor":
                    el = document.application.njUtils.make("a", null, this.application.ninja.currentDocument);
                    el.setAttribute("href", "http://www.motorola.com");
                    el.innerHTML = "link";
                    break;
                case "button":
                    el = document.application.njUtils.make(name, null, this.application.ninja.currentDocument);
                    el.setAttribute("type", "button");
                    el.innerHTML = "Button";
                    break;
                case "checkbox":
                    el = document.application.njUtils.make("input", null, this.application.ninja.currentDocument);
                    el.setAttribute("type", "checkbox");
                    break;
                case "imageComponent":
                    el = document.application.njUtils.make("image", null, this.application.ninja.currentDocument);
                    el.setAttribute("width", 200);
                    el.setAttribute("height", 200);
                    break;
                case "numberInput":
                    el = document.application.njUtils.make("input", null, this.application.ninja.currentDocument);
                    el.setAttribute("type", "number");
                    break;
                case "select":
                    el = document.application.njUtils.make("select", null, this.application.ninja.currentDocument);
                    break;
                case "radioButton":
                    el = document.application.njUtils.make("input", null, this.application.ninja.currentDocument);
                    el.setAttribute("type", "radio");
                    break;
                case "rangeInput":
                    el = document.application.njUtils.make("input", null, this.application.ninja.currentDocument);
                    el.setAttribute("type", "range");
                    break;
                case "textfield":
                    el = document.application.njUtils.make("input", null, this.application.ninja.currentDocument);
                    el.setAttribute("type", "text");
                    break;
                case "textarea":
                    el = document.application.njUtils.make("textarea", null, this.application.ninja.currentDocument);
                    break;
                case "toggleButton":
                    el = document.application.njUtils.make("button", null, this.application.ninja.currentDocument);
                    el.innerHTML = "Off";
                    break;
                case "map":
                    el = document.application.njUtils.make("div", null, this.application.ninja.currentDocument);
                    break;
                case "feedreader":
                    el = document.application.njUtils.make("div", null, this.application.ninja.currentDocument);
                    break;
                case "picasa-carousel":
                    el = document.application.njUtils.make("div", null, this.application.ninja.currentDocument);
                    break;
                case "youtube-channel":
                    el = document.application.njUtils.make("div", null, this.application.ninja.currentDocument);
                    break;

            }

            el.setAttribute("data-montage-id", ClassUUID.generate());

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

                top = (this.application.ninja.stage.canvas.height / 2); // ~~((parseFloat(this.application.ninja.elementMediator.getProperty(this.application.ninja.currentDocument.model.documentRoot, "height"))) / 2);
                left = (this.application.ninja.stage.canvas.width / 2); //~~((parseFloat(this.application.ninja.elementMediator.getProperty(this.application.ninja.currentDocument.model.documentRoot, "width"))) / 2);
                //this.centerStage = [top, left];
                return [left, top];
            //}

            //return this.centerStage;
        }
    },

    CreateUniqueComponentName: {
        value: function(name) {
            for(var i=1; i < 1000; i++) {
                if(!this.ComponentNameExists(name + i)) {
                    return name + i;
                }
            }
        }
    },

    ComponentNameExists: {
        value: function(name) {
            var filteredList = this.application.ninja.currentDocument.model.mObjects.filter(function(obj){
                if(name === obj.identifier) return true;
            });
            if (filteredList.length > 0) {
                return true;
            } else {
                return false;
            }
        }
    }
});