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

/* ComputedStyleSubPanel.js */
var Montage   = require("montage").Montage,
    Component = require("montage/ui/component").Component;


/*

EDITABLE - Methods
- startEdit
- stopEdit
- value
-
- _suggest
- _suggestNext
- _suggestPrev
- _clearSuggest
- _accept
- _revert
- _setCaret

*/


exports.Editable = Montage.create(Component, {
    hasTemplate: { value: false },

    _element : { value : null },
    element : {
        get : function() {
            return this._element;
        },
        set : function(el) {
            this._element = el;
            this._element.addEventListener('keydown', this, false);
            this._element.addEventListener('keyup', this, false);
            this._element.addEventListener('input', this, false);
            this._element.addEventListener('paste', this, false);


            if(this.startOnEvent) {
                this._element.addEventListener(this.startOnEvent, this, false);
            }

        }
    },
    _readOnly : {
        value: false
    },
    readOnly : {
        get : function() { return this._readOnly; },
        set : function(makeReadOnly) {
            var action = makeReadOnly ? 'add' : 'remove';

            this._element.classList[action](this.readOnlyClass);

            if(this.isEditable) {
                this.stop();
            }
            this._readOnly = makeReadOnly;
        }
    },
    _isEditable : {
        value : false
    },
    isEditable : {
        get : function() {
            return this._isEditable;
        },
        set: function(makeEditable) {
            if(this._readOnly && makeEditable) { return false; }
            this._isEditable = makeEditable;
        }
    },
    _isDirty : {
        value: false
    },
    isDirty : {
        get : function() {
            return this._isDirty;
        },
        set : function(setDirty) {
            if(setDirty) {
                this._isDirty = true;
                this._sendEvent('dirty');
            } else {
                this._isDirty = false;
            }
        }
    },

    _value : { value: null },
    value : {
        get : function() { return this._value; },
        set : function(value) {
            if(value === this._value) { return; }

            var node = this._getFirstTextNode();
            node.textContent = value;

            this._value = value;
        }
    },
    _getFirstTextNode : {
        value : function(el) {
            ///// optional el argument specified container element
            var e = el || this._element,
                nodes = e.childNodes, node;

            if(nodes.length) {
                for(var i=0; i<nodes.length; i++) {
                    if(nodes[i].nodeType === 3) {
                        ///// found the first text node
                        node = nodes[i];
                        break;
                    }
                }
            }

            ///// Text node not found
            if(!node) {
                node = document.createTextNode('');
                e.appendChild(node);
            }


            return node;
        }
    },

    ///// Pre Edit Value
    ///// Value stored when editing starts
    ///// Useful for reverting to previous value

    _preEditValue : {
        value : null
    },
    start : {
        value: function() {
            if(!this._readOnly) {
                this._isEditable = this._element.contentEditable = true;
                this._element.classList.add(this.editingClass);

                ///// Save the preEditValue
                this._preEditValue = this.value;

                // Initialize enteredValue with current value
                this.enteredValue = this.value;

                if(this.selectOnStart) {
                    this.selectAll();
                }

                if(this.stopOnBlur) {
                    //console.log('adding mousedown event listener');
                    ///// Simulate blur on editable node by listening to the doc
                    document.addEventListener('mousedown', this, false);
                }

                this._sendEvent('start');
            }

        }
    },
    stop : {
        value: function(eventData) {
            this._isEditable = this._element.contentEditable = false;
            this._element.classList.remove(this.editingClass);

            ///// if value is different than pre-edit val, call onchange method
            if(this._preEditValue !== this.value) {
                this._sendEvent('change');
            }

            this._sendEvent('stop', eventData);
            document.removeEventListener('mousedown', this, false);
        }
    },
    selectAll : {
        value : function() {
            var range = document.createRange(),
                sel   = window.getSelection();

            sel.removeAllRanges();
            range.selectNodeContents(this._element);
            sel.addRange(range);
        }
    },
    setCursor : {
        value : function(position) {
            var index = position,
                range, node, sel;

            ///// argument can be "end" or an index
            if(typeof position === 'string' && position === 'end') {
                index = this.value.length;
            }

            sel = window.getSelection();
            sel.removeAllRanges();
            //debugger;
            node = this._getFirstTextNode();
            range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index);
            sel.addRange(range);
        }
    },
    blur : {
        value : function(eventData) {
            if(this._hint) {
                this.accept();
            }
            this.stop(eventData);
            this._sendEvent('blur');
        }
    },

    /* -------------------- User Event Handling -------------------- */

    handleKeydown : {
        value : function(e) {
            var k = e.keyCode;
        }
    },

    handleKeyup : {
        value : function(e) {
            // Record change in value
            this.enteredValue = this._element.firstChild.data;
        }
    },
    ///// Text input has changed values
    handleInput : {
        value : function(e) {
            this.value = this._getFirstTextNode().textContent;

            if(!this.isDirty) {
                 this.isDirty = true;
             }

            this._sendEvent('input');
        }
    },
    handleMousedown : {
        value : function(e) {
            //console.log('handle mouse down');
            ///// Listen for simulated blur event
            if(this.stopOnBlur && e._event.target !== this._element) {
                this.blur({
                    "originalEventType": "mousedown",
                    "originalEvent": e
                });
            }
        }
    },
    handlePaste : {
        value: function(e) {
            e.preventDefault();
            document.execCommand('insertHTML', null, e._event.clipboardData.getData("Text"));
            this.value = this._element.textContent;

            this._sendEvent('paste', e);
        }
    },
    handleEvent : {
        value : function(e) {
            //console.log("event type : " + e._event.type);
            ///// If configured, start on specified event
            if(e._event.type === this.startOnEvent) {
                this.start();
            }
        }
    },
    _sendEvent : {
        value : function(type, data) {
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(type, true, true, data);
            this.dispatchEvent(evt);
        }
    },

    /* -------------------- CONFIG -------------------- */

    editingClass : {
        value : 'editable'
    },
    readOnlyClass : {
        value : 'readOnly'
    },
    selectOnStart : {
        value : true
    },
    startOnEvent : {
        value : 'dblclick'
    },
    stopOnBlur : {
        value : true
    },
    keyActions : {
        value : {
            stop   : [27,9,13],
            revert : [27],
            backsp : [8]
        },
        distinct: true
    }

});
