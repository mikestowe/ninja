/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.DocumentBar = Montage.create(Component, {

    _currentDocument: {
        enumerable: false,
        value: null
    },

    currentDocument: {
        enumerable: false,
        get: function() {
            return this._currentDocument;
        },
        set: function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            this.disabled = !this._currentDocument;

            if(this._currentDocument && this._currentDocument.currentView === "design") {
                this.visible = true;
            } else if(this._currentDocument && this._currentDocument.currentView === "code") {
                this.visible = false;
            }
        }
    },

    _visible: {
        value: false
    },

    visible: {
        get: function() {
            return this._visible;
        },
        set: function(value) {
            if(this._visible !== value) {
                this._visible = value;
                this.needsDraw = true;
            }
        }
    },

    designView: {
        value: null
    },

    codeView: {
        value: null
    },

    zoomControl: {
        value: null,
        serializable: true
    },

    _type: {
        value: null
    },

    type: {
        enumerable: false,
        get: function() { return this._type; },
        set: function(value) {
            if (this._type === value) {
                return;
            }

            this._type = value;
            this.needsDraw = true;

        }
    },

    _currentView: {
        value: null
    },

    currentView: {
        get: function() { return this._currentView},
        set: function(value) {
            if (this._currentView === value) {
                return;
            }

            this._currentView = value;
            this.needsDraw = true;
        }
    },

    _zoomFactor: {
        value: 100
    },

	zoomFactor: {
		get: function()	{ return this._zoomFactor; },

		set: function(value)
		{
			if(value !== this._zoomFactor)
			{
				this._zoomFactor = value;
				if (!this._firstDraw)
				{
					this.application.ninja.stage.setZoom(value);
				}
			}
		}
	},

    draw: {
        value: function() {
            /*
            if(this.type === "htm" || this.type === "html") {
                this.designView.classList.add("active");
                this.codeView.classList.add("active");

                if(this.currentView === "design") {
                    this.designView.classList.add("selected");
                    if(this.codeView.classList.contains("selected")) this.codeView.classList.toggle("selected");
                } else {
                    this.codeView.classList.add("selected");
                    if(this.designView.classList.contains("selected")) this.designView.classList.toggle("selected");
                }
                
            } else if(this.type) {
                this.designView.classList.remove("active");
            }
            */
            if(this.visible) {
                this.element.style.display = "block";
            } else {
                this.element.style.display = "none";
            }

        }
    },

    prepareForDraw: {
        value: function() {
//            this.designView.addEventListener("click", this, false);
//            this.codeView.addEventListener("click", this, false);

        }
    },

    _disabled: {
        value: true
    },

    disabled: {
        get: function() {
            return this._disabled;
        },
        set: function(value) {
            if(value !== this._disabled) {
                this._disabled = value;
            }
        }
    },


    handleClick: {
        value: function(event) {
            if(event._event.target.id === this.currentView) return;

            this.currentView = event._event.target.id;
            this.application.ninja.documentController.stage.stageView.switchDesignDocViews(event._event.target.id);//switch between design view
        }
    }
});
