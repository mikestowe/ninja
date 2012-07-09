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
/**
 @module montage/ui/controller/tree-controller
 @requires montage/core/core
 @requires montage/ui/controller/object-controller
 @requires montage/core/event/mutable-event
 */
var Montage = require("montage").Montage,
    ObjectController = require("montage/ui/controller/object-controller").ObjectController,
    ArrayController = require("montage/ui/controller/array-controller").ArrayController,
    MutableEvent = require("montage/core/event/mutable-event").MutableEvent;
/**
    TODO: Write description like the array controllers: The ArrayController helps with organizing a hierarchical
    collection of objects, and managing user selection within that collection.
    You can assign a TreeController instance as the <code>contentProvider</code> property for a TreeView object.
    @class module:montage/ui/controller/tree-controller.TreeController
    @classdesc
    @extends module:montage/ui/controller/object-controller.ObjectController
*/
var TreeController = exports.TreeController = Montage.create(ObjectController, /** @lends module:montage/ui/controller/tree-controller.TreeController# */ {

    _delegate : { value: null },
    delegate : {
        get: function() {
            return this._delegate;
        },
        set: function(value) {
            this._delegate = value;
        },
        serializable: true
    },

    rootKey : {
        value: null
    },

    branchKey : {
        value: null,
        serializable: true
    },

    labelKey: {
        value: null,
        serializable: true
    },

    _root : {
        value : null
    },
    root : {
        get: function() {
            return this._root;
        },
        set: function(value) {
            this._root = value;

            this.initArrayControllers();
        }
    },

    rootController: {
        value: null
    },

    initArrayControllers : {
        value: function() {
            var self = this;

            ///// Recursive function that finds all branch nodes and initializes
            ///// sets the tree node type to "branch" or "leaf"

            function walk(node, init, depth) {
                var branch = node[self.branchKey];

                if(branch) {
                    branch.forEach(function(node) {
                        walk(node, init, ++depth);
                    });

                    node['treeNodeType'] = 'branch';
                } else {
                    node['treeNodeType'] = 'leaf';
                }
            }

            walk(this._root, 0);

        }
    },

    /**
        @private
     */
    _selectedIndexes: {
        value: null,
        enumerable: false
    },

   /**
        Description TODO
        @type {Function}
        @default null
    */
   selectedIndexes: {
       get: function() {
           return this._selectedIndexes;
       },
       set: function(value) {
           this._selectedIndexes = value;
       }
   },

    branchControllers: {
        value: [],
        distinct: true
    },

    addBranchController : {
        value: function(controller) {
            if(this.delegate) {
                controller.delegate = this.delegate;
            }

            this.branchControllers.push(controller);
        }
    },

    /**
     @private
     */
    _content: {
        enumerable: false,
        value: null
    },
    /**
        The content managed by the TreeController.
        @type {Function}
        @default {String} null
    */
    content: {
        get: function() {
            return this._content;
        },
        set: function(value) {
            if (this._content === value) {
                return;
            }

            this._content = value;

            this.selectedObjects = null;

            if (this.rootKey) {
                if (value[this.rootKey]) {
                    this.root = value[this.rootKey];
                } else {
                    console.log('No root key found in content data');
                }
            } else {
                this.root = value;
            }

        }
    },

    addObjects : {
        value: function() {

            var objects = Array.prototype.slice.call(arguments),
                i,
                objectCount = objects.length,
                selectedContentIndexes, firstIndex;

            for (i = 0; i < objectCount; i++) {
                this.content.push(objects[i]);
            }

            if (this.selectObjectsOnAddition) {
                selectedContentIndexes = [];
                firstIndex = this.content.length-objectCount;
                for (i = 0; i < objectCount; i++) {
                    selectedContentIndexes[i] = firstIndex++;
                }
                this.selectedContentIndexes = selectedContentIndexes;
                this.selectedObjects = objects;
            }

            if (this.clearFilterFunctionOnAddition) {
                this.filterFunction = null;
            }

            if (this.automaticallyOrganizeObjects) {
                this.organizeObjects();
            }

        }
    }

});
