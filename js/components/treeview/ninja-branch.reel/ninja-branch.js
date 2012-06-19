/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
