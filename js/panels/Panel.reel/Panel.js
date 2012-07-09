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

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.Panel = Montage.create(Component, {

    name: {
        value: "Panel"
    },

	groups: {
        value: []
    },

    panelContent: {
        value: null,
        serializable: true
    },

    _collapsed: {
        value: false
    },

    _height: {
        value: 200
    },

    minHeight: {
        value: 200
    },

    maxHeight: {
        value: null
    },

    flexible: {
        value: true
    },

    _locked: {
        value: false
    },

    isResizing: {
        value: false
    },

    _resizedHeight: {
        value: 0
    },

    resizer: {
        value: null,
        serializable: true
    },

    modulePath: {
        value: null
    },

    moduleName: {
        value: null
    },

    disabled: {
        value:false
    },

    collapsed: {
        get: function() {
            return this._collapsed;
        },
        set: function(val) {
            if (this._collapsed !== val) {
                this._collapsed = val;
                this.needsDraw = true;
            }
        }
    },

    height: {
        get: function() {
            if (this._height < this.minHeight) {
                this._height = this.minHeight;
            }
            return this._height;
        },
        set: function(val) {
            if(this._height !== val) {
                this._height = val;
                this.needsDraw = true;
            }
        }
    },

    locked: {
        get: function() {
            return this._locked;
        },
        set: function(val) {
            if (this.flexible) {
                this._locked = val;
                this.needsDraw = true;
            }
        }
    },

    _currentDocument: {
        value : null,
        enumerable : false
    },

    currentDocument : {
        get : function() {
            return this._currentDocument;
        },
        set : function(value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;

            if(typeof this.panelContent.content._element.controller._currentDocument !== "undefined") {
                this.panelContent.content._element.controller.currentDocument = this._currentDocument;
            }

            if(!value) {
                this.disabled = true;
            } else {
                this.disabled = this._currentDocument.currentView !== "design";
            }

        }
    },

    handleBtnCollapseAction: {
        value: function() {
            this.collapsed = !this.collapsed;
            this.needsDraw = true;
        }
    },

    handleBtnCloseAction: {
        value: function() {
            this.panelContent.content = null;
        }
    },

    prepareForDraw: {
        value: function() {
            if(this.name === "Color") {
                this.application.ninja.colorController.colorView = this.application.ninja.colorController.colorPanelBase.create();
            }

            if(this.groups) {
                this.groups.forEach(function(className) {
                    this.element.classList.add(className);
                }.bind(this));
            }

            if(this.modulePath && this.moduleName) {
                // Load the slot content
                var that = this;
                require.async(this.modulePath)
                    .then(function(panelContent) {
                        var componentRequire = panelContent[that.moduleName];
                        var componentInstance = componentRequire.create();

                        componentInstance.ownerComponent = that.ownerComponent;
                        that.panelContent.content = componentInstance;
                    })
                    .end();
            }
        }
    },

    handleResizeStart: {
        value:function(e) {
            this.isResizing = true;
            this.needsDraw = true;
        }
    },

    handleResizeMove: {
        value:function(e) {
            this._resizedHeight = e._event.dY;
            this.needsDraw = true;
        }
    },

    handleResizeEnd: {
        value: function(e) {
            this.height += this._resizedHeight;
            this._resizedHeight = 0;
            this.isResizing = false;
            this.needsDraw = true;
        }
    },

    draw: {
        value: function() {
            if(this.isResizing) {
                this.element.style.webkitBoxFlex = "0.1";
            } else if (this.locked) {
                this.element.style.webkitBoxFlex = "0";
            } else {
                this.element.style.webkitBoxFlex = null;
            }

            if (this.collapsed) {
                this.element.classList.add("collapsed");
            } else if (!this.flexible) {
                this.resizer.enabled = false;
                this.element.classList.remove("collapsed");
                this.element.style.minHeight = this.height + "px";
                this.element.style.maxHeight = this.height + "px";
                this.element.style.height = this.height + "px";
                this.panelContent.element.style.overflowY = "hidden";
            } else {
                this.panelContent.element.style.overflowY = "auto";
                this.resizer.enabled = true;
                this.element.classList.remove("collapsed");
                this.element.style.minHeight = this.minHeight + "px";
                this.element.style.height = (this.height + this._resizedHeight) + "px";
                if (this.maxHeight !== null) {
                    this.element.style.maxHeight = this.maxHeight  + "px";
                } else {
                    this.element.style.maxHeight = null;
                }
            }
        }
    },

    didDraw: {
        value: function() {
            if(this.flexible && !this.isResizing) {
                this.height = this.element.offsetHeight;
            }

            if (this.isResizing) {
                var actionEvent = document.createEvent("CustomEvent");
                actionEvent.initCustomEvent("panelResizing", true, true, null);
                actionEvent.type = "panelResizing";
                this.dispatchEvent(actionEvent);
            }
        }
    }
});
