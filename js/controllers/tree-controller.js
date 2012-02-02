/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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

    rootKey : {
        value: null
    },

    branchKey : {
        value: 'children'
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

            ///// Declare function to initialize controller for each node
            ///// that is a branch

            function initController(array, depth) {
                var controller = Montage.create(ArrayController, {
                    content            : { value: array },
                    delegate           : { value: self },
                    isSelectionEnabled : { value: true }});

                if(depth === 0) {
                    self.rootController = controller;
                }

                self.branchControllers.push({
                    depth      : depth,
                    controller : controller

                });
            }

            ///// Recursive function that finds all branch nodes and initializes
            ///// an array controller

            function walk(node, init, depth) {
                var children = node[self.branchKey];

                if(children) {
                    //init(children, depth);

                    children.forEach(function(child) {
                        walk(child, init, ++depth);
                    });

                    node['treeNodeType'] = 'branch';
                } else {
                    node['treeNodeType'] = 'leaf';
                }
            }

            walk(this._root, initController, 0);

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

        },
        set: function(value) {

        }
    },

    lazyLoad : {
        value: false
    },

    branchControllers: {
        value: []
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

            //TODO for right now assume that any content change invalidates the selection completely; we'll need to address this of course
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
    },

    insertChildBefore : { value : function() {} },

    insertChildAfter : { value : function() {} }



});
