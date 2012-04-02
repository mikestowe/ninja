/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* Base class for the 3D translate tools
Subclass TranslateObject3DTool will translate the object that was clicked.
*/
var Montage = require("montage/core/core").Montage,
    ModifierToolBase = require("js/tools/modifier-tool-base").ModifierToolBase,
    toolHandleModule = require("js/stage/tool-handle"),
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.Translate3DToolBase = Montage.create(ModifierToolBase,
{
	_inLocalMode: { value: true, enumerable: true },
	_clickedOnStage: { value: false },

	HandleDoubleClick : {
	   value : function()
	   {
	   }
	},

    modifyElements : {
		value : function(data, event)
        {
            // form the translation vector and post translate the matrix by it.
            var delta = vecUtils.vecSubtract( 3, data.pt1, data.pt0 );
            if(this._handleMode !== null)
            {
                switch(this._handleMode)
                {
                    case 0:
                        delta[1] = 0;
                        delta[2] = 0;
                        break;
                    case 1:
                        delta[0] = 0;
                        delta[2] = 0;
                        break;
                    case 2:
                        delta[0] = 0;
                        delta[1] = 0;
                        break;
                }
                if( (this.application.ninja.selectedElements.length > 1) && this._clickedOnStage )
                {
                    this._delta = ~~(delta[this._handleMode]);
                }
                else
                {
                    this._delta += ~~(delta[this._handleMode]);
                }

            }
            else
            {
                if(this._mode === 1)
                {
                    delta[2] = delta[1];
                    delta[0] = 0;
                    delta[1] = 0;
                }
                else
                {
                    delta[2] = 0;
                }
                this._delta = delta.slice(0);
            }

            var transMat = Matrix.Translation( delta );

            if(this._inLocalMode && (this._targets.length === 1) )
            {
                this._translateLocally(transMat);
            }
            else
            {
                this._translateGlobally(transMat);
            }
        }
	},


	Reset : {
		value : function()
		{
            var item,
                elt,
                mat,
                dist,
                newStyles = [],
                previousStyles = [],
                len = this._targets.length;
            for(var i = 0; i < len; i++)
            {
                // Reset to the identity matrix but retain the rotation values
                item = this._targets[i];
                mat = item.mat.slice(0);
                mat[12] = 0;
                mat[13] = 0;
                mat[14] = 0;

                dist = this._undoArray[i].dist;

                var previousStyleStr = {dist:dist, mat:item.mat};

                var newStyleStr = {dist:dist, mat:mat};

                previousStyles.push(previousStyleStr);
                newStyles.push(newStyleStr);
            }

            ElementsMediator.set3DProperties(this.application.ninja.selectedElements,
                                            newStyles,
                                            "Change",
                                            "translateTool",
                                            previousStyles
                                          );

			this.isDrawing = false;
            this.endDraw(event);

//			this.UpdateSelection(true);
			this.Configure(true);
		}
	},

	// We will only translate single elements locally
	_translateLocally: {
		value: function (transMat) {
			var mat = glmat4.multiply(this._startMat, transMat, []);
			viewUtils.setMatrixForElement( this._target, mat, true );
			if(this._mode !== 1)
			{
				this._startMat = mat;
			}
		}
	},

	_translateGlobally: {
		value: function (transMat) {
			var len = this._targets.length,
				i = 0,
				item,
				elt,
				curMat,
                matInv = glmat4.inverse(this._startMat, []),
                nMat = glmat4.multiply(transMat, this._startMat, [] ),
			    qMat = glmat4.multiply(matInv, nMat, []);

			var shouldUpdateStartMat = true;

			if(this._clickedOnStage)
			{
				shouldUpdateStartMat = false;
			}
			else if(this._mode !== 1)
			{
				this._startMat = nMat;
			}

			for(i = 0; i < len; i++)
			{
				item = this._targets[i];
				elt = item.elt;
				curMat = item.mat.slice(0);

//				glmat4.multiply(curMat, qMat, curMat);
//
//				viewUtils.setMatrixForElement( elt, curMat, true);
                curMat[12] += transMat[12];
                curMat[13] += transMat[13];
                curMat[14] += transMat[14];
                viewUtils.setMatrixForElement( elt, curMat, true);

				if(shouldUpdateStartMat)
				{
					this._targets[i].mat = curMat;
				}
			}
		}
	},

    _updateTargets: {
		value: function(addToUndoStack) {
            var newStyles = [],
                previousStyles = [],
			    len = this.application.ninja.selectedElements.length;
			this._targets = [];
			for(var i = 0; i < len; i++)
			{
				var elt = this.application.ninja.selectedElements[i]._element;

				var curMat = viewUtils.getMatrixFromElement(elt);
				var curMatInv = glmat4.inverse(curMat, []);

				this._targets.push({elt:elt, mat:curMat, matInv:curMatInv});
                if(addToUndoStack)
                {
                    var previousStyleStr = {dist:this._undoArray[i].dist, mat:MathUtils.scientificToDecimal(this._undoArray[i].mat.slice(0), 5)};

                    var newStyleStr = {dist:viewUtils.getPerspectiveDistFromElement(elt), mat:MathUtils.scientificToDecimal(curMat, 5)};

                    previousStyles.push(previousStyleStr);
                    newStyles.push(newStyleStr);
                }
			}
			if(addToUndoStack)
			{
                ElementsMediator.set3DProperties(this.application.ninja.selectedElements,
                                                newStyles,
                                                "Change",
                                                "translateTool",
                                                previousStyles
                                              );
                if(this._origin && this._delta)
                {
                    if(this._handleMode !== null)
                    {
                        this._origin[this._handleMode] += this._delta;
                    }
                    else
                    {
                        this._origin[0] += this._delta[0];
                        this._origin[1] += this._delta[1];
                    }
                }
                this._delta = null;
            }
            // Save previous value for undo/redo
            this._undoArray = [];
            for(i = 0, len = this._targets.length; i < len; i++)
            {
                var elt = this._targets[i].elt;
                var _mat = viewUtils.getMatrixFromElement(elt);
                var _dist = viewUtils.getPerspectiveDistFromElement(elt);
                this._undoArray.push({mat:_mat, dist:_dist});
            }

		}
	},

	HandleAltKeyDown: {
		value: function(event) {
			this._inLocalMode = !this._inLocalMode;
			this.DrawHandles();
		}
	},

	HandleAltKeyUp: {
		value: function(event) {
			this._inLocalMode = !this._inLocalMode;
			this.DrawHandles();
		}
	},

	handleScroll: {
		value: function(event) {
			this.captureSelectionDrawn(null);
		}
	},

	_updateHandlesOrigin: {
		value: function () {
			var ctr;

			var len = this.application.ninja.selectedElements.length;
			if(len > 0)
			{
				if(len === 1)
				{
					var item = this._target;
					viewUtils.pushViewportObj( item );
					ctr = viewUtils.getCenterOfProjection();
					viewUtils.popViewportObj();
					ctr[2] = 0;

//					var ctrOffset = item.elementModel.props3D.m_transformCtr;
//					if(ctrOffset)
//					{
//						ctr = vecUtils.vecAdd(3, ctr, ctrOffset);
//					}

					this._origin = viewUtils.localToGlobal(ctr, item);
				}
				else
				{
                    if(this._origin)
                    {
                        if(this._delta)
                        {
                            if(this._handleMode !== null)
                            {
//                                this._origin[this._handleMode] = this._delta;
                            }
                            else
                            {
                                this._origin[0] += this._delta[0];
                                this._origin[1] += this._delta[1];
                            }
                        }
                    }
                    else
                    {
                        this._origin = drawUtils._selectionCtr.slice(0);
                        this._origin[0] += this.application.ninja.stage.userContentLeft;
                        this._origin[1] += this.application.ninja.stage.userContentTop;
                    }
				}
			}
		}
	},

	DrawHandles: {
		value: function (delta) {
			this.application.ninja.stage.clearDrawingCanvas();

			if(!this._handles)
			{
				this._handles = [];

				// TODO - Using dummy cursors for now

				// translateX
				var rX = toolHandleModule.TranslateHandle.create();
				rX.init("url('images/cursors/Translate_X.png') 0 0, default", 'rgba(255,0,0,1)', "x");
				this._handles.push(rX);

				// translateY
				var rY = toolHandleModule.TranslateHandle.create();
				rY.init("url('images/cursors/Translate_Y.png') 0 0, default", 'rgba(0,255,0,1)', "y");
				this._handles.push(rY);

				// translateZ
				var rZ = toolHandleModule.TranslateHandle.create();
				rZ.init("url('images/cursors/Translate_Z.png') 0 0, default", 'rgba(0,0,255,1)', "z");
				this._handles.push(rZ);
			}

			var item = this._target;
			if(!item)
			{
				return;
			}

			// Draw tool handles

            this._updateHandlesOrigin();
			var base = this._origin.slice(0);

			var len = this.application.ninja.selectedElements.length;
			var lMode = this._inLocalMode;
			if(len === 1)
			{
				viewUtils.pushViewportObj( item );
			}
			else
			{
				lMode = false;
				viewUtils.pushViewportObj( this.application.ninja.currentDocument.documentRoot );
			}

			if(this._handleMode !== null)
			{
				switch(this._handleMode)
				{
					case 0:
						this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 0.2)';
						this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 0.2)';
						break;
					case 1:
						this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 0.2)';
						this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 0.2)';
						break;
					case 2:
						this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 0.2)';
						this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 0.2)';
						break;
				}
                if( delta && (len > 1) )
                {
                    base[this._handleMode] += ~~delta;
                }
			}
			this._handles[0].draw(base, item, lMode);
			this._handles[1].draw(base, item, lMode);
			this._handles[2].draw(base, item, lMode);

			if(delta && (this._handleMode !== null))
			{
				this._handles[this._handleMode].drawDelta(~~delta);
			}

			this._handles[0]._strokeStyle = 'rgba(255, 0, 0, 1)';
			this._handles[1]._strokeStyle = 'rgba(0, 255, 0, 1)';
			this._handles[2]._strokeStyle = 'rgba(0, 0, 255, 1)';

			viewUtils.popViewportObj();
		}
	}
	
});