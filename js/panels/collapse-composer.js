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
var Composer = require("montage/ui/composer/composer").Composer;

exports.CollapseComposer = Montage.create(Composer, {

    collapsed : {
        value: false
    },

    _expandedHeight : {
        value: null
    },

    _doCollapse : {
        value: false,
        distinct: true
    },

    _doExpand : {
        value: false,
        distinct: true
    },

    _step : {
        value: 0,
        distinct: true
    },

    load: {
        value: function() {
            //this.element.addEventListener("mousedown", this, true);
            this.element.addEventListener("click", this, false);
        }
    },

    unload: {
        value: function() {
            //this.element.removeEventListener("mousedown", this, true);
            this.element.removeEventListener("click", this, true);
        }
    },

    handleClick : {
        value: function(e) {
            e.preventDefault();
            this.toggleCollapse();
        }
    },

    toggleCollapse : {
        value: function() {
            if(this.collapsed) {
                this.initExpand();
            } else {
                this.initCollapse();
            }

            this.collapsed = !this.collapsed;
        }
    },

    initCollapse : {
        value: function() {
            //this.component.element.style.display = 'none';
            console.log("init collapse");
            this._expandedHeight = window.getComputedStyle(this.component.element).height;
            this.needsFrame = this._doCollapse = true;
        }
    },

    initExpand : {
        value: function() {
            //this.component.element.style.display = '';
            console.log("init collapse");

            this.needsFrame = this._doExpand = true;
        }
    },

    frame : {
        value: function() {
            if(this._doCollapse) {
                if (this._step === 0) {
                    this.component.element.style.height = this._expandedHeight;
                    this._step = 1;
                    this.needsFrame = true;
                } else if (this._step === 1) {
                    this.component.element.style.webkitTransition = 'height 0.14s cubic-bezier(.44,.19,0,.99)';
                    this._step = 2;
                    this.needsFrame = true;
                } else {
                    this.component.element.style.height = '0px';
                    this.collapsed = true;
                    this._doCollapse = false;
                    this._step = 0;
                }
            } else if(this._doExpand) {
                this.component.element.style.height = this._expandedHeight;
                this.collapsed = false;
                this._doExpand = false;
            }
        }
    },

    handleWebkitTransitionEnd : {
        value: function(e) {
            e.stopPropagation();

            ///// Remove Transition
//            this._removeTransition = true;
            this.collapser.removeEventListener('webkitTransitionEnd', this, false);

            //// If it's an expand transition, restore height to auto
            if(!this.collapsed) {
                this._switchToAuto = true;
            }

            this.needsDraw = true;

        }
    },

    deserializedFromTemplate: {
        value: function() {
            if (this.component) {
                this.component.addComposer(this);
            }
        }
    }

});
