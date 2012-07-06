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

/*
 * Style component:  Edits and manages a single style rule for a Layer in the Timeline.
 * Public Properties:
 *      editorProperty:  The CSS property for the style.
 *      editorValue:    The value for the editorProperty.
 *      whichView:  Which view to show, the hintable view (where a new property can be typed in)
 *                  or the propval view (where the property's value can be set with the tweener).
 *                  Valid values are "hintable" and "propval", defaults to "hintable".
 *
 */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var ElementsMediator =      require("js/mediators/element-mediator").ElementMediator


var LayerStyle = exports.LayerStyle = Montage.create(Component, {

    styleContainer: {
        value: null,
        serializable: true
    },

    styleHintable: {
        value: null,
        serializable: true
    },

    styleProperty: {
        value: null,
        serializable: true
    },

    valueEditorHottext: {
        value: null,
        serializable: true
    },

    dtextProperty: {
        value: null,
        serializable: true
    },

    /* === BEGIN: Models === */
    // isSelected: whether or not the style is selected
    _isSelected: {
        value: false
    },
    isSelected: {
        serializable: true,
        get: function() {
            return this._isSelected;
        },
        set: function(newVal) {

            if (newVal !== this._isSelected) {
                this._isSelected = newVal;
                this.needsDraw = true;
            }
        }
    },

    /* isActive:  Whether or not the user is actively clicking within the style; used to communicate state with
     * parent Layer.
     */
    _isActive: {
        value: false
    },
    isActive: {
        get: function() {
            return this._isActive;
        },
        set: function(newVal) {
            this._isActive = newVal;
        }
    },

   // Property for this editor
    _editorProperty: {
        value: ""
    },
    editorProperty: {
        serializable: true,
        get: function() {
            return this._editorProperty;
        },
        set: function(newVal) {
            this._editorProperty = newVal;
            this.needsDraw = true;
        }
    },

    // Value for the property for this editor.
    _editorValue: {
        value: ""
    },
    editorValue: {
        serializable: true,
        get: function() {
            return this._editorValue;
        },
        set: function(newVal) {
            this._editorValue = newVal;
            this.needsDraw = true;
        }
    },

    // The tweener used to change the value for this property.
    _ruleTweener: {
        value: false
    },
    ruleTweener: {
        serializable: true,
        get: function() {
            return this._ruleTweener;
        },
        set: function(newVal) {
            this._ruleTweener = newVal;
            this.needsDraw = true;
        }
    },

    // The hintable we use to change the Property
    _myHintable: {
        value: ""
    },
    myHintable: {
        get: function() {
            return this._myHintable;
        },
        set: function(newVal) {
            this._myHintable = newVal;
        },
        serializable: true
    },
    _myHintableValue : {
        value: null
    },
    myHintableValue: {
        get: function() {
            return this._myHintableValue;
        },
        set: function(newVal) {
            this._myHintableValue = newVal;
        }
    },

    // swapViews: Is a view swap happening?
    _swapViews : {
        value: true
    },

    // whichView: which view should we show: hintable or propval
    _whichView : {
        value: "hintable"
    },
    whichView: {
        serializable: true,
        get: function() {
            return this._whichView;
        },
        set: function(newVal) {
            if (this._whichView !== newVal) {
                if ((newVal !== "hintable") && (newVal !== "propval")) {
                    this.log("Error: Unknown view -"+newVal+"- requested for style.js.");
                    return;
                }
                this._whichView = newVal;
                this._swapViews = true;
                this.needsDraw = true;
            }
        }
    },

    // styleID: the id for this style;
    // Used to publish events
    _styleID : {
        value: null
    },
    styleID: {
        serializable: true,
        get: function() {
            return this._styleID;
        },
        set: function(newVal) {
            this._styleID = newVal;
            this.needsDraw = true;
        }
    },

    addedColorChips:
        { value: false },

    _colorelement: {
        writable:true
    },

    colorelement: {
        enumerable: true,
        get: function () {
            return this._colorelement;
        },
        set: function (value) {
            if (value !== this._colorelement) {
                this._colorelement = value;
            }
        }
    },

    _fill: {
        enumerable: false,
        value: { colorMode: 'rgb', color: { r: 255, g: 255, b: 255, a: 1, css: 'rgb(255,255,255)', mode: 'rgb', wasSetByCode: true, type: 'change' }, webGlColor: [1, 1, 1, 1] }
    },

    fill: {
        enumerable: true,
        get: function () {
            return this._fill;
        },
        set: function (value) {
            if (value !== this._fill) {
                this._fill = value;
            }
        }
    },

    handleMousedown: {
        value: function(event) {
            this.isActive = true;
        }
    },

    /* === END: Models === */

    /* === BEGIN : Draw cycle === */
    prepareForDraw: {
        value: function() {
            this.init();
        }
    },
    draw: {
        value: function() {

            if (this._swapViews === true) {
                // Show the right thing
                this._showView();
            }
            if (this.isSelected) {
                this.element.classList.add("style-selected");
            } else {
                this.element.classList.remove("style-selected");
            }


        }
    },
    didDraw: {
        value: function() {
            if (this._swapViews === true) {
                // View swap has been completed.
                this._swapViews === false;
            }
        }
    },
    /* === END: Draw cycle === */

    /* === BEGIN: controllers === */

    // handleStylePropertyDblClick: What happens when the user double-clicks on the style property
    handleStylePropertyDblclick: {
        value: function(event) {
            this.whichView = "hintable";
        }
    },

    // handleHintableStop: What happens when the hintable issues its stop event
    handleHintableStop: {
        value: function(event) {
            // this should be handled via binding, but somehow is not. Setting manually for now.
            this.editorProperty = this.myHintable.value;
            // Change views.
            this.whichView = "propval";
        }
    },

    // Init: Initialize the component with some useful selectors and other defaults.
    init : {
        value: function() {

            var arrHints = [],
                i = 0;

            // Get the array of hints from _myTweenables:
            for (i = 0; i < this._myTweenables.length; i++) {
                arrHints.push(this._myTweenables[i].property)
            }

            // Set useful information for the hintable
            this.myHintable.editingClass = "editable2";
            this.myHintable.hints = arrHints;

            // Bind a handler to the Hintable's change event
            this.myHintable.identifier = "hintable";
            this.myHintable.addEventListener("stop", this, false);

            // Add the click handler to the styleProperty: When the user double-clicks on it, we want to start the editor.
            this.styleProperty.identifier = "styleProperty";
            this.styleProperty.addEventListener("dblclick", this, false);

            // Get some selectors that we'll be using
            this.editorHottextContainer = this.element.querySelector(".editor-hottext");
            this.editorInputContainer = this.element.querySelector(".editor-input");
            this.editorColorContainer = this.element.querySelector(".editor-color");
            this.containerHintable = this.element.querySelector(".row-hintable");
            this.containerPropvals = this.element.querySelector(".container-propvals");
            this.valueEditorInput = this.element.querySelector(".editor-input input");

            // mousedown listener to handle
            this.element.addEventListener("mousedown", this, false);
        }
    },

    // showView: Show the appropriate view
    _showView : {
        value: function() {
            if (this.whichView === "hintable") {
                this.containerHintable.classList.remove("hidden");
                this.containerPropvals.classList.add("hidden");
                this.myHintable.start();
            } else {
                this.containerHintable.classList.add("hidden");
                this.containerPropvals.classList.remove("hidden");
                this._showTweener();
            }
        }
    },

    // showTweener: show the appropriate tweener
    _showTweener : {
        value: function() {
            // Which tweener should we show?
            // First, get the appropriate editor type from the data structure.
            var tweenable = {},
                i = 0;

            if (this.ruleTweener === true) {
               return;
            } else {
               this.ruleTweener = true;
            }

            tweenable.tweener = "input";

            for (i = 0; i < this._myTweenables.length; i++) {
                if (this._myTweenables[i].property === this.editorProperty) {
                    tweenable = this._myTweenables[i];
                }
            }

            if (tweenable.tweener === "hottext" ) {
                this.editorInputContainer.classList.add("hidden");
                this.editorColorContainer.classList.add("hidden");
                this.editorHottextContainer.classList.remove("hidden");
                this.valueEditorHottext.acceptableUnits = [tweenable.units];
                this.valueEditorHottext.units = tweenable.units;
                this.valueEditorHottext.minValue = tweenable.min;
                this.valueEditorHottext.maxValue = tweenable.max;
                this.valueEditorHottext.identifier="hottext";
                el = this.parentComponent.parentComponent.parentComponent.parentComponent.layerData.stageElement;
                this.editorValue = parseFloat(ElementsMediator.getProperty(el, this.editorProperty));
                this.valueEditorHottext.value = this.editorValue
                this.valueEditorHottext.addEventListener("change",this,false);
                this.valueEditorHottext.addEventListener("changing",this,false);
                this.valueEditorHottext.needsDraw = true;
            } else if (tweenable.tweener === "color" ) {
                this.editorInputContainer.classList.add("hidden");
                this.editorColorContainer.classList.remove("hidden");
                this.editorHottextContainer.classList.add("hidden");

                if(tweenable.colorType === "fill"){
                    this._isFill = true;
                }else{
                    if(tweenable.colorType === "stroke"){
                        this._isFill = false;
                        this._borderSide = tweenable.strokePosition
                    }
                }

                if (this.addedColorChips === false && this.application.ninja.colorController.colorPanelDrawn) {
                    // setup fill color
                    this._fillColorCtrl.props = { side: 'top', align: 'center', wheel: true, palette: true, gradient: false, image: false, nocolor: true, offset: -80 };
                    this.application.ninja.colorController.addButton("chip", this._fillColorCtrl);
                    this.colorelement = this._fillColorCtrl;
                    var currentValue = ElementsMediator.getColor(this.parentComponent.parentComponent.parentComponent.parentComponent.layerData.stageElement,this._isFill,this._borderSide)
                    this.application.ninja.timeline.selectedStyle = this.editorProperty;
                    this._fillColorCtrl.addEventListener("change", this.handleFillColorChange.bind(this), false);
                    if(currentValue){
                        this._fillColorCtrl.color(currentValue.colorMode, currentValue.color);
                        this.addedColorChips = true;
                    }
                }
                // TODO: set up color chip here.
            } else if (tweenable.tweener === "input"){
                this.editorInputContainer.classList.remove("hidden");
                this.editorColorContainer.classList.add("hidden");
                this.editorHottextContainer.classList.add("hidden");
                this.valueEditorInput.value = this.editorValue;
                this.valueEditorInput.addEventListener("blur",this,false);
            } else {
                this.log("Warning: unknown tweenable -"+tweenable.tweener+"- specified in style.js.")
            }
        }
    },

    /* === END: Controllers === */

    _myTweenables: {
        value: [
            {
                "property" : "background-color",
                "tweener" : "color",
                "units" : "",
                "min" : "",
                "max" : "",
                "default" :"#FFFFFF",
                "colorType" :"fill"
            },
            {
                "property" : "background-position-x",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "background-position-y",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "border-color",
                "tweener" : "color",
                "units" : "",
                "min" : "",
                "max" : "",
                "default" : "#FFFFFF",
                "colorType" : "stroke",
                "strokePosition" : false
            },
            {
                "property" : "border-width",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "border-bottom-color",
                "tweener" : "color",
                "units" : "",
                "default" : "#FFFFFF",
                "colorType" : "stroke",
                "strokePosition" : "bottom"

            },
            {
                "property" : "border-bottom-width",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "border-left-color",
                "tweener" : "color",
                "units" : "",
                "default" : "#FFFFFF",
                "colorType" : "stroke",
                "strokePosition" : "left"

            },
            {
                "property" : "border-left-width",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "border-top-color",
                "tweener" : "color",
                "units" : "",
                "default" : "#FFFFFF",
                "colorType" : "stroke",
                "strokePosition" : "top"

            },
            {
                "property" : "border-top-width",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "border-right-color",
                "tweener" : "color",
                "units" : "",
                "default" : "#FFFFFF",
                "colorType" : "stroke",
                "strokePosition" : "right"

            },
            {
                "property" : "border-right-width",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "border-radius",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "bottom",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "color",
                "tweener" : "color",
                "units" : "",
                "default" : "#FFFFFF"
            },
            {
                "property" : "margin",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "margin-left",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "margin-right",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "margin-top",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "margin-bottom",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "padding",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "padding-left",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "padding-right",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "padding-top",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "padding-bottom",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "max-height",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "max-width",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "min-height",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "min-width",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "opacity",
                "tweener" : "hottext",
                "units" : "",
                "min" : 0,
                "max" : 100,
                "default" : 100
            },
            {
                "property" : "text-indent",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "top",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "right",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "left",
                "tweener" : "hottext",
                "units" : "px",
                "min" : -9999,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "width",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            },
            {
                "property" : "height",
                "tweener" : "hottext",
                "units" : "px",
                "min" : 0,
                "max" : 9999,
                "default" : 0
            }
        ]

    },

    handleFillColorChange: {
        value: function (event) {
            if(this.application.ninja.timeline.selectedStyle === "color" ||this.application.ninja.timeline.selectedStyle === this.editorProperty){
                var fillColorObject={};
                fillColorObject.color=event._event.color;
                fillColorObject.mode=event._event.colorMode;
                ElementsMediator.setColor([this.parentComponent.parentComponent.parentComponent.parentComponent.layerData.stageElement], fillColorObject, this._isFill, "Change", "timeline",null,this._borderSide)
            }
        }
    },

    handleHottextChange:{
        value:function(event){
            if(this.application.ninja.timeline.selectedStyle === this.editorProperty){
                this.application.ninja.elementMediator.setProperty([this.parentComponent.parentComponent.parentComponent.parentComponent.layerData.stageElement], this.editorProperty, [this.editorValue + event.target._units]  , "Change", "timeline");
            }
        }
    },

    handleHottextChanging:{
        value:function(event){
            if(this.application.ninja.timeline.selectedStyle === this.editorProperty){
               this.application.ninja.elementMediator.setProperty([this.parentComponent.parentComponent.parentComponent.parentComponent.layerData.stageElement], this.editorProperty, [this.editorValue + event.target._units]  , "Changing", "timeline");
             }
        }
    },

    handleBlur:{
        value:function(event){
            if(this.application.ninja.timeline.selectedStyle === this.editorProperty){
                this.application.ninja.elementMediator.setProperty([this.parentComponent.parentComponent.parentComponent.parentComponent.layerData.stageElement], this.editorProperty, [event.target.value] , "Change", "timeline");
            }
        }
    },


    /* Begin: Logging routines */
    _boolDebug: {
        enumerable: false,
        value: false // set to true to enable debugging to console; false for turning off all debugging.
    },
    boolDebug: {
        get: function() {
            return this._boolDebug;
        },
        set: function(boolDebugSwitch) {
            this._boolDebug = boolDebugSwitch;
        }
    },
    log: {
        value: function(strMessage) {
            if (this.boolDebug) {
                console.log(this.getLineNumber() + ": " + strMessage);
            }
        }
    },
    getLineNumber: {
        value: function() {
            try {
               throw new Error('bazinga')
            }catch(e){
                return e.stack.split("at")[3].split(":")[2];
            }
        }
    }
    /* End: Logging routines */

});
