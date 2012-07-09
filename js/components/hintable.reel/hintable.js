/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
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
    Component = require("montage/ui/component").Component,
    Editable  = require("js/components/editable.reel").Editable;


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


exports.Hintable = Montage.create(Editable, {
    inheritsFrom : { value : Editable },
    _matchIndex  : { value : 0 },
    matches      : { value : [] },

    _hint : { value : null },
    hint : {
        get : function() {
            return this._hint;
        },
        set : function(hint) {
            hint = hint || '';

            ///// Set the hint element's text
            this._getFirstTextNode(this.hintElement).textContent = hint;
            ///// if hintElement was removed from the DOM, the object still
            ///// exists, so it needs to be re-appended
            if(this.hintElement.parentNode === null) {
                this._element.appendChild(this.hintElement);
            }

            this._hint = hint;
        }
    },

    _hintElement : { value : null },
    hintElement : {
        get : function() {
            if(!this._hintElement) {
                /// Remove the phantom "<BR>" element that is generated when
                /// content editable element is empty
                this._children(this._element, function(item) {
                    return item.nodeName === 'BR';
                }).forEach(function(item) {
                    this._element.removeChild(item);
                }, this);

                this._hintElement = document.createElement('span');
                this._hintElement.classList.add(this.hintClass);

                this._element.appendChild(this._hintElement);
            }

            return this._hintElement;
        },
        set : function(el) {
            this._hintElement = el;
        }
    },

    _getHintDifference : {
        value : function() {
            if(!this.matches[this._matchIndex]) {
                debugger;
            }
            return this.matches[this._matchIndex].substr(this.value.length);
        }
    },

    hintNext : {
        value : function(e) {
            if(e) { e.preventDefault(); }
                //console.log('next1');

            if(this._matchIndex < this.matches.length - 1) {
                //console.log('next');
                ++this._matchIndex;
                this.hint = this._getHintDifference();
            }
        }
    },
    hintPrev : {
        value : function(e) {
            if(e) { e.preventDefault(); }
                //console.log('prev1');
            if(this._matchIndex !== 0) {
                //console.log('prev');
                --this._matchIndex;
                this.hint = this._getHintDifference();
            }
        }
    },

    accept : {
        value: function(e, preserveCaretPosition) {
            if(e) {
                e.preventDefault();
            }
            var fullText = this._hint;
            this.hint = null;
            this.value += fullText;

            if(!preserveCaretPosition) {
                this.setCursor('end');
            }

            this._sendEvent('accept');
        }
    },
    revert : {
        value : function(e, forceRevert) {
            this.hint = null;

            if(this.isEditable || forceRevert) {
                /// revert to old value
                this.value = (this._preEditValue);
                this._sendEvent('revert');
                //console.log('reverting');

            }
        }
    },

    handleKeydown : {
        value : function handleKeydown(e) {
            var k = e.keyCode,
                isCaretAtEnd, selection, text;

            this._super(arguments);

            /// Remove the phantom "<BR>" element that is generated when
            /// content editable element is empty
            this._children(this._element, function(item) {
                return item.nodeName === 'BR';
            }).forEach(function(item) {
                this._element.removeChild(item);
            }, this);

            if(k === 39) {
                selection = window.getSelection();
                text = selection.baseNode.textContent;
                isCaretAtEnd = (selection.anchorOffset === text.length);
            }

            if(this.hint && isCaretAtEnd) {
                ///// Advance the cursor
                this.hint = this.hint.substr(0, 1);
                this.accept(e);
                this.handleInput();
            }

            this._execKeyAction(e);
        }
    },
    ///// Text input has changed values
    handleInput : {
        value : function handleInput(e) {
            this._super(arguments);

            var val = this.value,
                 matches, hint;
            //console.log('val = "' + val + '"');
            //// Handle auto-suggest if configured
            if(this.hints && this.hints.length) {

                if(val.length > 0) { // content is not empty

                    this._matchIndex = 0;
                    this.matches = this.hints.filter(function(h) {
                        if(!h) { return false; }
                        return h.indexOf(val) === 0;
                    }).sort();

                    ///// If there are no matches, or the new value doesn't match all the
                    ///// previous matches, then get new list of matches
                    if(!this.matches.length || !this._matchesAll(val)) {
                    }

                    if(this.matches.length) { // match(es) found
                        if(this.matches[this._matchIndex] !== val) {
                            // Suggest the matched hint, subtracting the typed-in string
                            // Only if the hint is not was the user has typed already
                            this.hint = this._getHintDifference();
                        } else {
                            this.hint = null;
                        }
                    } else { // no matches found
                        this.hint = null;
                    }
                } else { // no suggestion for empty string
                    this.hint = null;
                }

            }
        }
    },
    handleBackspace : {
        value : function(e) {
            this.matches.length = 0;
        }
    },
    _matchesAll : {
        value : function(value) {
            return this.matches.every(function(match) {
                return match.indexOf(value) === 0;
            }, this);
        }
    },
    _execKeyAction : {
        value : function(e) {
            var key = e.keyCode,
                keys = this.keyActions;

            if(this.hint) {
                if( keys.hint.revert.indexOf(key) !== -1 ) { this.revert(e); }
                if( keys.hint.accept.indexOf(key) !== -1 ) { this.accept(e); }
                if( keys.hint.stop.indexOf(key) !== -1 )   { this.stop(e); }
                if( keys.hint.next.indexOf(key) !== -1 )   { this.hintNext(e); }
                if( keys.hint.prev.indexOf(key) !== -1 )   { this.hintPrev(e); }
                if( keys.hint.backsp.indexOf(key) !== -1 )   { this.handleBackspace(e); }
            } else {
                if(keys.noHint.revert.indexOf(key) !== -1) { this.revert(e); }
                if(keys.noHint.stop.indexOf(key) !== -1)   { this.stop(e); }
                //if( keys.hint.next.indexOf(key) !== -1 )   { this.handleDown(e); }
                //if( keys.hint.prev.indexOf(key) !== -1 )   { this.handleUp(e); }
                //if( keys.hint.backsp.indexOf(key) !== -1 )   { this.backspace(e); }
            }
        }
    },

    /* --------------- Utils --------------- */

    _children : {
        value : function(el, filter) {
            var f = filter || function(item) {
                return item.nodeType === 1;
            };
            return this._toArray(el.childNodes).filter(f);
        }
    },
    _toArray : {
        value : function(arrayLikeObj) {
            return Array.prototype.slice.call(arrayLikeObj);
        }
    },
    _super : {
        value : function(args) {
            this.inheritsFrom[arguments.callee.caller.name].apply(this, args);
        }
    },

    /* --------- CONFIG ---------- */
    hints : {
        value : ['Testing a hint.', 'Testing another hint.', 'Testing the last hint.'],
        distinct: true
    },
    hintClass : {
        value : "hintable-hint"
    },
    keyActions : {
        value : {
            hint : {
                accept : [9,13,186], // accept hint
                stop   : [27,186],   // stop editing
                next   : [40],       // cycle to next hint
                prev   : [38],       // cycle to prev hint
                revert : [27],       // revert value
                backsp : [8]         // backspace hit
            },
            noHint : {
                stop   : [27,9,13,186],
                next   : [40],
                prev   : [38],
                revert : [27],
                backsp : [8]
            }
        },
        distinct: true
    }

});
