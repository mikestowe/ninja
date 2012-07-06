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
