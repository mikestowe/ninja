/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = 			require("montage/core/core").Montage,
    Component = 		require("montage/ui/component").Component,
    snapManager = 		require("js/helper-classes/3D/snap-manager").SnapManager,
    viewUtils = 		require("js/helper-classes/3D/view-utils").ViewUtils,
    drawUtils = 		require("js/helper-classes/3D/draw-utils").DrawUtils,
    ElementPlanes = 	require("js/helper-classes/3D/element-planes").ElementPlanes,
    MathUtilsClass = 	require("js/helper-classes/3D/math-utils").MathUtilsClass,
    VecUtils = 			require("js/helper-classes/3D/vec-utils").VecUtils;

exports.StageDeps = Montage.create(Component, {
    viewUtils: {
        value: viewUtils
    },

    snapManager: {
        value: snapManager
    },

    drawUtils: {
        value: drawUtils
    },

    _userContentLeft: {
        value: null
    },

    userContentLeft: {
        get: function() { return this._userContentLeft; },
        set: function(value) {
            if(value != null) {
                viewUtils.setUserContentLeft(value);
            }
        }
    },

    _userContentTop: {
        value: null
    },

    userContentTop: {
        get: function() { return this._userContentTop; },
        set: function(value) {
            if(value != null) {
                viewUtils.setUserContentTop(value);
            }
        }
    },

    deserializedFromTemplate: {
        value: function() {

            this.eventManager.addEventListener("appLoaded", this, false);
            this.eventManager.addEventListener("openDocument", this, false);
            this.eventManager.addEventListener("switchDocument", this, false);

            // Initialize Deps
            // HACK
            // TODO Rework
            window.MathUtils   = MathUtilsClass;
            window.VecUtils   = VecUtils;

            snapManager.drawingCanvas = this.stage.drawingCanvas;

            // Setup the listeners for the draw-util and snapmanager when removing elements
            // TODO Revisit when supporting multiple documents
            drawUtils.initialize();
            snapManager.initialize();
        }
    },

    handleAppLoaded: {
        value: function() {

            Object.defineBinding(this, "userContentLeft", {
                boundObject: this.stage,
                boundObjectPropertyPath: "_userContentLeft",
                oneway: true
            });

            Object.defineBinding(this, "userContentTop", {
                boundObject: this.stage,
                boundObjectPropertyPath: "_userContentTop",
                oneway: true
            });

            // Setup the snap manager pointer to the app model
            snapManager.appModel = this.application.ninja.appModel;
            // bind the snap properties to the snap manager
            snapManager.bindSnap();

            drawUtils.viewUtils = viewUtils;
            drawUtils.snapManager = snapManager;
            drawUtils.ElementPlanes = ElementPlanes;
        }
    },

    handleOpenDocument: {
        value: function() {

            workingPlane = [0,0,1,0];

            snapManager.reload2DCache();
            snapManager.setupDragPlaneFromPlane (workingPlane);

            drawUtils.initializeFromDocument();
        }
    },

    handleSwitchDocument: {
        value: function(){
            workingPlane = [0,0,1,0];

            snapManager.setupDragPlaneFromPlane (workingPlane);
            snapManager.reload2DCache();


            drawUtils.initializeFromDocument();
        }
    }
});