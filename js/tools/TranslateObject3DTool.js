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

var Montage = require("montage/core/core").Montage,
    Translate3DToolBase = require("js/tools/Translate3DToolBase").Translate3DToolBase,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    snapManager = require("js/helper-classes/3D/snap-manager").SnapManager;

exports.TranslateObject3DTool = Montage.create(Translate3DToolBase, {
    _toolID: { value: "translateObject3DTool" },
    _canOperateOnStage: { value: true },

    _initializeToolHandles: {
        value: function() {
            this._inLocalMode = (this.options.selectedMode === "rotateLocally");
        }
    },

    initializeSnapping : {
        value : function(event)
        {
//            console.log( "initializeSnapping" );

            this._mouseDownHitRec = null;
            this._mouseUpHitRec   = null;

            snapManager.clearAvoidList();
            snapManager.clearDragPlane();

            // the translate tool does snap align to the bounds of the object only.
            // turn off snap align to the cursor.  This needs to be re-enabled in the mouse up method
            snapManager.enableSnapAlign( false );

            // snap to element and snap to grid are conditionally enabled based
            // on the snap results of the mouse down.  enable everything for the first snap
            this._snapToElements = snapManager.elementSnapEnabledAppLevel();
            this._snapToGrid = snapManager.gridSnapEnabledAppLevel();

            this._dragPlane = null;
            this._clickedOnStage = false;
            var do3DSnap = true;

            if(this._handleMode === null)
            {
                snapManager.enableElementSnap   ( true  );
                snapManager.enableGridSnap      ( true  );
            }
            else
            {
                this._delta = null;
                //if(this._handleMode === 2)
                {
                    this._dragPlane = viewUtils.getNormalToUnprojectedElementPlane(this._target, this._handleMode, this._inLocalMode);
                    //console.log( "dragPlane: " + this._dragPlane );
                    snapManager.setupDragPlaneFromPlane(this._dragPlane);
                    do3DSnap = false;

                    snapManager.enableElementSnap   ( false );
                    snapManager.enableGridSnap      ( false );
                }
            }

            if(this.application.ninja.selectedElements.length) {
                var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas, new WebKitPoint(event.pageX, event.pageY));

                // do the snap before setting up the avoid list to allow
                // a snap on the mouse down
                var hitRec = snapManager.snap(point.x, point.y, do3DSnap);

                if(this._handleMode === 2)
                {
                    // translate z doesn't snap to element so hitRec's element will always be different
                    // from what the browser says we clicked on. So, skip this check.
                }
                else
                {
                    // Check that hitRec's element matches element that browser says we clicked on
                    // TODO - This is still not working when using a handle that is on top of an
                    // element that is not currently selected
                    var elt = this.application.ninja.stage.getElement(event, true);
                    if(elt && (elt !== hitRec.getElement()))
                    {
                        var otherSnap = snapManager.findHitRecordForElement(elt);
                        if (otherSnap)  hitRec = otherSnap;
                    }
                    if(elt === this.application.ninja.currentDocument.model.domContainer)
                    {
                        this._clickedOnStage = true;
                    }
                }

                // we don't want to snap to selected objects during the drag
                this.application.ninja.selectedElements.forEach(function(element) {
                    snapManager.addToAvoidList(element);
                });

                if (hitRec)
                {
                    // disable snap attributes
                    if (hitRec.getType() == hitRec.SNAP_TYPE_ELEMENT)
                    {
                        this._snapToElements = false;
                        this._snapToGrid = false;
                    }
                    else if (hitRec.getType() == hitRec.SNAP_TYPE_ELEMENT_CENTER)
                    {
                        snapManager.enableSnapAlign( snapManager.snapAlignEnabledAppLevel() );
                    }

                    if(this._handleMode === 2)
                        this.clickedObject = this._target;

                    // parameterize the snap point on the target
                    this._snapParam = this.parameterizeSnap( hitRec );

                    if(!this._dragPlane)
                    {
                        if( this._inLocalMode && (this.application.ninja.selectedElements.length === 1) )
                        {
                            this._dragPlane = viewUtils.getUnprojectedElementPlane(this._clickedObject);
                            snapManager.setupDragPlaneFromPlane(this._dragPlane);
                        }
                        else
                        {
                            this._dragPlane = snapManager.setupDragPlanes( hitRec, true );
                        }

                    }

                    // only do quadrant snapping if the 4 corners of the element are in the drag plane

                    var sign = MathUtils.fpSign( vecUtils.vecDot(3,this._dragPlane,[0,0,1]) + this._dragPlane[3] - 1.0);
                     this._shouldUseQuadPt = (sign == 0);

                    var wpHitRec = hitRec.convertToWorkingPlane( this._dragPlane );
                    this._mouseDownHitRec = wpHitRec;
                    this._mouseUpHitRec = null;

                    var pt = hitRec.getScreenPoint();
                    this.downPoint.x = pt[0];
                    this.downPoint.y = pt[1];

                    // TODO - need to figure out snapManager dependency by drawUtils.
                    // For now, bypassing by calling snapManager.drawLastHit();
//                  drawUtils.refreshDisplay();
                    snapManager.drawLastHit();
                }
            }
            else
            {
                this.target = null;
            }
        }
    },

    _handleToolOptionsChange: {
        value: function(event) {
            this._inLocalMode = event.detail.mode;
            this.DrawHandles();
        }
    }

});
