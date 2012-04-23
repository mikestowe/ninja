/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
                snapManager.enableElementSnap	( true	);
				snapManager.enableGridSnap		( true	);
            }
            else
            {
                this._delta = null;
                // special case for z-translation
                if(this._handleMode === 2)
                {
                    this._dragPlane = viewUtils.getNormalToUnprojectedElementPlane(this._target);
                    snapManager.setupDragPlaneFromPlane(this._dragPlane);
                    do3DSnap = false;

                    snapManager.enableElementSnap	( false	);
                    snapManager.enableGridSnap		( false );
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
                    var elt = this.application.ninja.stage.GetSelectableElement(event);
                    if(elt && (elt !== hitRec.getElement()))
                    {
                        hitRec = snapManager.findHitRecordForElement(elt);
                    }
                    if(elt === this.application.ninja.currentSelectedContainer)
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
//					drawUtils.refreshDisplay();
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