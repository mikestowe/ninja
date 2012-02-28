/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.Panel = Montage.create(Component, {


    reelDidLoad: {
       value: function() {
       }
    },

    collapsedHeight: {
        value:26
    },

    _isFirstDraw: {
        value:false
    },

    _panelBase: {
       value: null
    },

    panelBase: {
       get: function()
        {
            return this._panelBase;
        },
        set: function(value)
        {
            this._panelBase = value;
            this.needsDraw = true;
        }
    },

    _panelContent: {
        value: null
    },

    panelContent: {
        get: function()
        {
            return this._panelContent;
        },
        set: function(value)
        {
            if (this._panelContent === value) {
                return;
            }
            this._panelContent = value;
            this.needsDraw = true;
        }
    },

    collapseToggle: {
        value: function() {
            if (this.panelBase.forcedCollapse) {
                this.panelBase.forcedCollapse = false;
                this.panelBase.collapsed = false;
                this.needsDraw = true;

            } else {
                this.panelBase.collapsed = !this.panelBase.collapsed;
                this.needsDraw = true;
            }
            NJevent("panelCollapsed", this);
        }
},

    closePanel: {
        value: function() {
            NJevent("panelClose", this);
        }
    },

    handleMouseover: {
        value: function() {
            this.element.draggable = true;
        }
    },

    handleMouseout: {
        value: function() {
            this.element.draggable = false;
        }
    },

    _resizer: {
        value: null
    },

    resizer: {
        get: function() {
            return this._resizer;
        },
        set: function(val) {
            this._resizer = val;
        }
    },


    resized: {
        value: function() {
            this.panelBase.contentHeight = parseInt(this.element.style.height);
            this.needsDraw = true;
        }
    },

    //TODO: Find out why without This following function drop event wont fire ???
    handleEvent: {
        value:function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();

        }
    },

    captureDragover: {
        value:function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.element.style.backgroundColor = "#917B56";
        }
    },

    captureDragleave: {
        value: function() {
            this.element.style.backgroundColor = "";
        }
    },

    handleDrop: {
        value:function(e) {
            e.stopPropagation(); // Stops some browsers from redirecting.
            e.preventDefault();
            this.element.style.backgroundColor = "";
            NJevent("panelOrderChanged", this);
        }
    },

    handleDragstart: {
        value:function(e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.element.innerHTML);
            NJevent("panelSelected", this);
        }
    },

    handleDragEnter: {
        value: function(e) {
            this.element.classList.add("over");
        }
    },

    handleDragend: {
        value:function() {

        }
    },


    prepareForDraw: {
        value:function() {
            if (!this._isFirstDraw) {
                this._isFirstDraw = true;

                // Initialize Panel
                // Drag Drop Functions
                this.element.addEventListener("drop", this, false);
                this.element.addEventListener("dragover", this, true);
                this.element.addEventListener("dragleave", this, true);
                this.element.addEventListener("dragenter", this, false);
                this.element.addEventListener("dragstart", this, false);
                
                // Handle Functionality
                this.element.getElementsByClassName("panelTitle")[0].addEventListener("mouseover", this, false);
                this.element.getElementsByClassName("panelTitle")[0].addEventListener("mouseout", this, false);
                // Arrow Collapse Button Initiate
                this.element.getElementsByClassName("arrowIcon")[0].addEventListener("click", this.collapseToggle.bind(this), false);
                // Close Button
                this.element.getElementsByClassName("closeBtn")[0].addEventListener("click", this.closePanel.bind(this), false);
                //Resized Event
                if(typeof this.resizer.value == "number") this.panelBase.contentHeight = this.resizer.value;
                this.resizer.element.addEventListener("mouseup",this.resized.bind(this),false);

                this.panelContent.content = this.panelBase.content;
            }
        }
    },

    draw: {
        value: function() {
            //If the panel is set not to be visible. We dont bother doing anything else to it. till the next draw cycle that its set visible true
            // Actually thinking about it now. this might not work.
            if (!this.panelBase.visible) this.element.style.display = "none";
            else this.element.style.display = null;

            //Draw if collapsed or not
            if(this.panelBase.collapsed || this.panelBase.forcedCollapse) {
                this.element.classList.add("collapsed");
                this.element.style.height = this.panelBase.collapsedHeight + "px";
            }
            else {
                this.element.classList.remove("collapsed");
                this.element.style.height = this.panelBase.contentHeight + "px";
            }

            var pContentDiv = this.element.getElementsByClassName("panelObjects")[0];

            //Figure out Heights (min, max, and current)
            if (this.panelBase.isStatic || this.panelBase.isLocked) {
                this.element.style.minHeight = this.panelBase.contentHeight + "px";
                this.element.style.maxHeight = this.panelBase.contentHeight + "px";
                this.resizer.element.style.cursor = "default";
            } else {
                this.element.style.minHeight = this.panelBase.minHeight + "px";
                this.element.style.maxHeight = "";
                this.resizer.element.style.cursor = null;
            }

            if (this.panelBase.scrollable) pContentDiv.style.overflow = "auto";
            else pContentDiv.style.overflow = "hidden";
            this.element.getElementsByClassName("panelTitle")[0].innerHTML = this.panelBase.panelName;
            //pContentDiv.appendChild(this.panelBase.content);
            //this.panelContent.content = this.panelBase.content;

        }
    }
});