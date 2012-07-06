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

var Montage = require("montage").Montage,
    TreeNode = require("js/components/treeview/tree-node").TreeNode;

var Branch = exports.Branch = Montage.create(TreeNode, {
    label: {
        value: null
//        serializable: true
    },

    branchList: {
        value: null
//        serializable: true
    },

    arrayController: {
        value: null
//        serializable: true
    },

    repetition:{
        value: null
//        serializable: true
    },

    leafComponent: {
        value: null
//        serializable: true
    },

    branchComponent: {
        value: null
//        serializable: true
    },

    collapser: {
        value: null
//        serializable: true
    },

    prepareForDraw : {
        value: function() {
            this.collapser.removeAttribute('id');
            this.label._element.addEventListener('click', this, false);
            
            if(this.hideLabel) {
                this.label.element.style.display = "none";
            }

            this.treeView.contentController.addBranchController(this.arrayController);
        }
    },
    handleWebkitTransitionEnd : {
        value: function(e) {
            e.stopPropagation(); 
            
            ///// Remove Transition
            this._removeTransition = true;
            this.collapser.removeEventListener('webkitTransitionEnd', this, false);
            
            //// If it's an expand transition, restore height to auto
            if(this.isExpanded) {
                this._switchToAuto = true;
            }
            
            this.needsDraw = true;

        }
    },
    templateDidLoad: {
        value: function() {
            this.arrayController.delegate = this.treeView.contentController;
        }
    },
    willDraw : {
        value: function() {
            if(this._doCollapse && this._step === 0) {
                this.branchHeight = window.getComputedStyle(this.collapser).height;
            }
        }
    },
    draw:{
        value: function () {

            if (this.sourceObject[this.labelKey]) {
                this._labelText = this.sourceObject[this.labelKey];
            }
            
            if(this._doCollapse) {
                if (this._step === 0) {                    
                    this.collapser.style.height = this.branchHeight;
                    this.collapser.style.position = "relative";
                    this.collapser.style.overflow = 'hidden';
                    this.collapser.childNodes[1].style.bottom = '0px';
                    this.collapser.childNodes[1].style.position = 'absolute';
                    this._step = 1;
                    this.needsDraw = true;
                } else if (this._step === 1) {
                    this.collapser.classList.add(this.collapseClass);
                    this._step = 2;
                    this.needsDraw = true;
                } else {
                    this.collapser.style.height = '0px';
                    this._doCollapse = false;
                    this._step = 0;
                }
            } else if(this._doExpand) {
                this.collapser.style.height = this.branchHeight;
                
                this._doExpand = false;
            }
            if(this._switchToAuto) {
                this.collapser.childNodes[1].style.position = 'static';
                this.collapser.style.height = 'auto';                    
                this._switchToAuto = false;
            }
            
            if(this._removeTransition) {
                this.collapser.classList.remove(this.collapseClass);
                this._removeTransition = false;
            }

        }
    },
    _step : {
        value : 0
    },
    handleClick : {
        value: function(e) {
            this.toggleExpand();
        }
    },
    expand : {
        value: function() {
            this.collapser.addEventListener('webkitTransitionEnd', this, false);
            this.needsDraw = this._doExpand = true;
        }
    },
    collapse : {
        value: function() {
            this.needsDraw = this._doCollapse = true;            
        }
    },
    branchHeight: {
        value: null,
        enumberable: false
    },
    collapseClass : {
        value: 'nj-collapser',
        enumberable: false
    }


});
