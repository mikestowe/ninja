/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Translate3DToolBase = require("js/tools/Translate3DToolBase").Translate3DToolBase,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    snapManager = require("js/helper-classes/3D/snap-manager").SnapManager;

exports.TranslateObject3DTool = Object.create(Translate3DToolBase, {
    _toolID: { value: "translateObject3DTool" },
    _canOperateOnStage: { value: true },

    initializeSnapping : {
        value : function(event)
        {
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
            var do3DSnap = true;
            
            if(this._handleMode === null)
            {
//                this.doSelection(event);

                snapManager.enableElementSnap	( true	);
				snapManager.enableGridSnap		( true	);
            }
            else
            {
                this._delta = 0;
                // special case for z-translation
                if( this._handleMode && (this._handleMode === 2) )
                {
                    this._dragPlane = viewUtils.getNormalToUnprojectedElementPlane(this._target);
                    snapManager.setupDragPlaneFromPlane(this._dragPlane);
                    do3DSnap = false;

                    snapManager.enableElementSnap	( false	);
                    snapManager.enableGridSnap		( false );
                }
            }

            if(this._targets)
            {
                var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                                new WebKitPoint(event.pageX, event.pageY));

				// do the snap before setting up the avoid list to allow
				// a snap on the mouse down
				var hitRec = snapManager.snap(point.x, point.y, do3DSnap);

                // TODO - Check that hitRec's element matches element that browser says we clicked on
                var elt = this.application.ninja.stage.GetElement(event);
                if(elt !== hitRec.getElement())
                {
                    hitRec = snapManager.findHitRecordForElement(elt);
                }

                // we don't want to snap to selected objects during the drag
                var len = this._targets.length;
                for(var i=0; i<len; i++)
                {
                    snapManager.addToAvoidList( this._targets[i].elt );
                }
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

					// parameterize the snap point on the target
					this._snapParam = this.parameterizeSnap( hitRec );

                    if(!this._dragPlane)
                    {
                        if( this._inLocalMode && (this._targets.length === 1) )
                        {
                            this._dragPlane = viewUtils.getUnprojectedElementPlane(this._clickedObject);
                            snapManager.setupDragPlaneFromPlane(this._dragPlane);
                        }
                        else
                        {
                            this._dragPlane = snapManager.setupDragPlanes( hitRec );
                        }

                    }

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