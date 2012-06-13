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

    stage: {
        value: null,
        serializable: true
    },

    viewUtils: {
        value: viewUtils
    },

    snapManager: {
        value: snapManager
    },

    drawUtils: {
        value: drawUtils
    },

    deserializedFromTemplate: {
        value: function() {

            this.eventManager.addEventListener("appLoaded", this, false);

            // Initialize Deps
            // HACK
            // TODO Rework
            window.MathUtils   = MathUtilsClass;
            window.VecUtils   = VecUtils;

            // Setup the listeners for the draw-util and snapmanager when removing elements
            // TODO Revisit when supporting multiple documents
            drawUtils.initialize();
            snapManager.initialize();
        }
    },

    handleAppLoaded: {
        value: function() {
            // Setup the snap manager pointer to the app model
            snapManager.appModel = this.application.ninja.appModel;
            // bind the snap properties to the snap manager
            snapManager.bindSnap();

            drawUtils.viewUtils = viewUtils;
            drawUtils.snapManager = snapManager;
            drawUtils.ElementPlanes = ElementPlanes;
        }
    }

});