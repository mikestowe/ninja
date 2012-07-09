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
    drawUtils = require("js/helper-classes/3D/draw-utils").DrawUtils,
    vecUtils = require("js/helper-classes/3D/vec-utils").VecUtils,
    viewUtils = require("js/helper-classes/3D/view-utils").ViewUtils,
    snapManager = require("js/helper-classes/3D/snap-manager").SnapManager,
    Keyboard = require("js/mediators/keyboard-mediator").Keyboard;
    toolBase = require("js/tools/ToolBase").toolBase;

exports.PanTool = Montage.create(toolBase,
{
	_localPt :{value: [0,0] , writable:true},
	_worldPt :{value: [0,0] , writable:true},
	_globalPt :{value: [0,0] , writable:true},
	_globalToUCWorld :{value: [] , writable:true},
	_lastGPt :{value: [0,0], writable:true},
	_lastY :{value: 0, writable:true},

	_maxHorizontalScroll: {value: 0, writable:true},
	_maxVerticalScroll: {value: 0, writable:true},

    Configure: {
        value: function ( doActivate )
		{
			if (doActivate)
			{
				NJevent("enableStageMove");
				this.eventManager.addEventListener( "toolDoubleClick", this, false);
				this.application.ninja.stage.canvas.addEventListener("mousewheel", this, false);
				this.activate();
			}
			else
			{
				NJevent("disableStageMove");
                this.eventManager.removeEventListener( "toolDoubleClick", this, false);
				this.application.ninja.stage.canvas.removeEventListener("mousewheel", this, false);
				this.deactivate();
			}
        }
    },

    HandleLeftButtonDown: {
        value : function ( event ) {
            // Determine the maximum horizontal and vertical scroll values
            this._maxHorizontalScroll = this.application.ninja.currentDocument.model.views.design.document.body.scrollWidth - this.application.ninja.stage._canvas.width - 11;
            this._maxVerticalScroll = this.application.ninja.currentDocument.model.views.design.document.body.scrollHeight - this.application.ninja.stage._canvas.height - 11;
            if((this._maxHorizontalScroll > 0) || (this._maxVerticalScroll > 0) || this._altKeyDown)
            {
                this._isDrawing = true;
                this.isDrawing = true;
                this.mouseDown( event );
            }
//            else
//            {
//                console.log("nothing to scroll");
//            }
       }
    },

    HandleMouseMove:
	{
        value : function (event)
		{
			this.mouseMove( event );
		}
	},

    HandleLeftButtonUp:
	{
        value : function ( event )
		{
            //if(this._isDrawing)
			{
				// do one final mouse move to update the scrollbars
				this.mouseUp( event );
               
			    this.application.ninja.stage.clearDrawingCanvas();
                this._hasDraw = false;
                this._isDrawing = false;
                this.isDrawing = false;
            }
        }
    },

    HandleKeyPress: {
        value: function(event) {
            if(event.altKey)
			{
                this._altKeyDown = true;
            }
			else if (event.shiftKey)
			{
				if (!this._shiftKeyDown)
				{
						this._shiftKeyDown = true;
						this._shiftPt = this._lastGPt.slice();
				}
			}
        }
    },

    HandleKeyUp: {
        value: function(event) {
            if(event.keyCode === Keyboard.ALT)
			{
                this._altKeyDown = false;
            }
			else if (event.keyCode === Keyboard.SHIFT)
			{
				this._shiftKeyDown = false;
			}
        }
    },

    handleToolDoubleClick:
	{
        value: function ()
		{
			var uc = this.application.ninja.currentDocument.model.documentRoot;
			var ucMat = viewUtils.getMatrixFromElement(uc);

			var noTrans = ucMat.slice();
			noTrans[12] = 0;  noTrans[13] = 0;  noTrans[14] = 0;
			var ucMatInv = glmat4.inverse( ucMat, [] );
			var deltaMat = glmat4.multiply( noTrans, ucMatInv, [] );

            this.application.ninja.stage.centerStage();

			this.applyDeltaMat( deltaMat );
        }
    },

    handleMousewheel :
	{
        value:function(event)
		{
			var zoom = this.application.ninja.documentBar.zoomFactor/100.0;
			if (!zoom)  zoom = 1.0;

			var delta = 0;
			if (event.wheelDelta)
				delta = 10*event.wheelDelta/120;
			//console.log( "delta: " + delta );

            this.application.ninja.currentDocument.model.views.design.document.body.scrollLeft += delta;

			delta *= zoom;
           
			var uc = this.application.ninja.currentDocument.model.documentRoot;
			var ucMat = viewUtils.getMatrixFromElement(uc);
			var offset = viewUtils.getElementOffset( uc );
			//console.log( "uc offset: " + offset[0] );

			var localToGlobalMat = viewUtils.getLocalToGlobalMatrix( uc );
			var globalToLocalMat = glmat4.inverse( localToGlobalMat, []);

			var w = uc.offsetWidth,
				h = uc.offsetHeight;
			if(uc.width)
				w = uc.width;
			if(uc.height)
				h = uc.height;
			var localPt = [ w/2,  h/2, 0];
			var globalPt = MathUtils.transformAndDivideHomogeneousPoint( localPt,  localToGlobalMat );
			this.doMouseDown( { x:globalPt[0],  y:globalPt[1] } );

			globalPt[0] += delta;
			this._isDrawing = true;
			this.doMouseMove( { x:globalPt[0],  y:globalPt[1] } );
			this._isDrawing = false;
        }
    },


	/////////////////////////////////////////////////////////////////////
	// Simple tool API
	activate:
	{
		value: function()
		{
			//console.log( "PanTool.activate" );
		}
	},

	deactivate:
	{
		value: function()
		{
			//console.log( "PanTool.deactivate" );
		}
	},

	mouseDown:
	{
		value: function( event )
		{
			//console.log( "PanTool.mouseDown" );
			if (!this.application.ninja.currentDocument)  return;

            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                        new WebKitPoint(event.pageX, event.pageY));
			this.doMouseDown( point );
		}
	},
			

	doMouseDown:
	{
		value: function( point )
		{
			//var tmpPt, tmpPt2, tmpPt3, tmpPt4, tmpMat, tmpMat2;	// DEBUG. (see use of these points below)
			var hitRec = snapManager.snap( point.x, point.y, true );
			if (hitRec)
			{
				//console.log( "hit: " + hitRec.getElement().id );
				var globalPt = [point.x, point.y];
				var elt = hitRec.getElement();
				if (elt)
				{
					// get the userContent object (stage) and its matrix
					var userContent = this.application.ninja.currentDocument.model.documentRoot;
					var ucMat = viewUtils.getMatrixFromElement(userContent);

					var localToGlobalMat = viewUtils.getLocalToGlobalMatrix( elt );
					var globalToLocalMat = glmat4.inverse( localToGlobalMat, []);

					if (elt != userContent)
						this._localPt = hitRec.calculateElementPreTransformScreenPoint();
					else
					{
						var localPt = hitRec.calculateElementWorldPoint();
						viewUtils.pushViewportObj( userContent );
						var cop = viewUtils.getCenterOfProjection();
						this._localPt = [cop[0] + localPt[0],  cop[1] + localPt[1],  localPt[2]];
						viewUtils.popViewportObj();
					}
                    this._localPt[0] = Math.round(this._localPt[0]);
                    this._localPt[1] = Math.round(this._localPt[1]);
					this._globalPt = MathUtils.transformAndDivideHomogeneousPoint( this._localPt,  localToGlobalMat );
					var tmpLocal   = MathUtils.transformAndDivideHomogeneousPoint( this._globalPt, globalToLocalMat );

					this._lastGPt = this._globalPt.slice();
					this._shiftPt = this._lastGPt.slice();
					this._lastY = this._lastGPt[1];

					// set up the matrices we will be needing
					var eltToStageWorldMat = glmat4.multiply( ucMat, viewUtils.getObjToStageWorldMatrix(elt, true), []);
					this._worldPt = MathUtils.transformAndDivideHomogeneousPoint( this._localPt,  eltToStageWorldMat );
//					console.log( "screenPt: " + globalPt );
//					console.log( "_worldPt: " + this._worldPt );
//					console.log( "_localPt: " + this._localPt );
//					console.log( "_globalPt: " + this._globalPt );
//					console.log( "hit localPt: " + hitRec.calculateElementPreTransformScreenPoint() );

					// get a matrix from user content world space to the screen
					viewUtils.pushViewportObj( userContent );
					var cop = viewUtils.getCenterOfProjection();
					var pDist = viewUtils.getPerspectiveDistFromElement(userContent);
					var projMat = glmat4.scale(Matrix.I(4), [pDist,pDist,pDist], []);
					projMat[11] = -1;
					projMat[15] = 1400;
					var v2s = Matrix.Translation([cop[0], cop[1], 0]);
					var ucWorldToGlobal = glmat4.multiply( v2s, projMat, [] );
					var offset = viewUtils.getElementOffset( userContent );
					var offMat = Matrix.Translation([offset[0], offset[1], 0]);
					glmat4.multiply( offMat, ucWorldToGlobal, ucWorldToGlobal );
					this._globalToUCWorld = glmat4.inverse(ucWorldToGlobal, []);
					viewUtils.popViewportObj();

					/*
					tmpPt = MathUtils.transformAndDivideHomogeneousPoint( this._globalPt, this._globalToUCWorld );	// DEBUG - tmpPt should equal this._worldPt
					tmpPt2 = MathUtils.transformAndDivideHomogeneousPoint( this._worldPt, ucWorldToGlobal );	// DEBUG - tmpPt2 should equal globalPt
					tmpPt3 = viewUtils.localToGlobal( this._localPt,  elt );
					tmpPt4 = MathUtils.transformAndDivideHomogeneousPoint( tmpPt3, this._globalToUCWorld );
					tmpMat = glmat4.multiply(ucWorldToGlobal,  eltToStageWorldMat, []);
					tmpMat2 = viewUtils.getLocalToGlobalMatrix( elt );
					*/
				}
			}
		}
	},

	mouseMove:
	{
		value: function( event )
		{
            var point = webkitConvertPointFromPageToNode(this.application.ninja.stage.canvas,
                                                        new WebKitPoint(event.pageX, event.pageY));
			this.doMouseMove( point );

		}
	},

	doMouseMove:
	{
		value: function( point )
		{
			if (this._isDrawing)
			{
				// get the global screen point
				var gPt = [point.x, point.y, this._globalPt[2]],
                    dx,
                    dy;
				if (this._altKeyDown)
				{
					dy = 5*(point.y - this._lastY);
					this._globalPt[2] += dy;
					gPt = [this._lastGPt[0], this._lastGPt[1], this._globalPt[2]];
				}
				else if (this._shiftKeyDown)
				{
					dx = Math.abs( this._shiftPt[0] - gPt[0] );
					dy = Math.abs( this._shiftPt[1] - gPt[1] );

					if (dx >= dy)
						gPt[1] = this._shiftPt[1];
					else
						gPt[0] = this._shiftPt[0];
				}

				// update the scrollbars
				var deltaGPt = vecUtils.vecSubtract(2, gPt, this._lastGPt);
				this._lastGPt = gPt.slice();
				this._lastY = point.y;
                var limitX = false;
                var limitY = false;

				var oldLeft = this.application.ninja.currentDocument.model.views.design.document.body.scrollLeft,
					oldTop  = this.application.ninja.currentDocument.model.views.design.document.body.scrollTop,
                    newLeft = oldLeft - deltaGPt[0],
                    newTop = oldTop - deltaGPt[1];
                if((newLeft < 0) || (newLeft > this._maxHorizontalScroll))
                {
                    limitX = true;
                }
                if((newTop < 0) || (newTop > this._maxVerticalScroll))
                {
                    limitY = true;
                }
                this.application.ninja.currentDocument.model.views.design.document.body.scrollLeft -= deltaGPt[0];
                this.application.ninja.currentDocument.model.views.design.document.body.scrollTop  -= deltaGPt[1];
				deltaGPt[0] = oldLeft - this.application.ninja.currentDocument.model.views.design.document.body.scrollLeft;
				deltaGPt[1] = oldTop  - this.application.ninja.currentDocument.model.views.design.document.body.scrollTop;

				gPt[0] -= deltaGPt[0];
				gPt[1] -= deltaGPt[1];

				this.updateGlobalToUCWorldMatrix();

				var wPt = MathUtils.transformAndDivideHomogeneousPoint( gPt, this._globalToUCWorld );
				var delta = vecUtils.vecSubtract( 3, wPt, this._worldPt );
				
				if (!this._altKeyDown)
					delta[2] = 0;

				// limit the change
				var ucMat = viewUtils.getMatrixFromElement(this.application.ninja.currentDocument.model.documentRoot);
				var tooMuch = false;
				if ((ucMat[12] >  12000) && (delta[0] > 0))  tooMuch = true;
				if ((ucMat[12] < -12000) && (delta[0] < 0))  tooMuch = true;
				if ((ucMat[13] >  12000) && (delta[1] > 0))  tooMuch = true;
				if ((ucMat[13] < -12000) && (delta[1] < 0))  tooMuch = true;
				if ((ucMat[14] >  12000) && (delta[2] > 0))  tooMuch = true;
				if ((ucMat[14] < -12000) && (delta[2] < 0))  tooMuch = true;
				if (tooMuch)
				{
					this._isDrawing = false;
					delta = [0,0,0];
				}
				else
					this._worldPt = wPt;

                if(limitX) delta[0] = 0;
                if(limitY) delta[1] = 0;
				// update everything
				var transMat = Matrix.Translation( delta );
				this.applyDeltaMat( transMat );
			}
		}
	},

	mouseUp:
	{
		value: function( event )
		{
			//console.log( "PanTool.mouseUp" );
			this.application.ninja.stage.updatedStage = true;
		}
	},

	applyDeltaMat:
	{
		value: function( transMat )
		{
			// update the user content matrix
			var uc = this.application.ninja.currentDocument.model.documentRoot;
			var ucMat = viewUtils.getMatrixFromElement(uc);
			var newUCMat = glmat4.multiply( transMat, ucMat, [] );
			viewUtils.setMatrixForElement( uc, newUCMat );

			// redraw everything
			this.application.ninja.stage.updatedStage = true;
		}
	},

	updateGlobalToUCWorldMatrix:
	{
		value: function()
		{
			// get the userContent object
			var userContent = this.application.ninja.currentDocument.model.documentRoot;

			// get a matrix from user content world space to the screen
			viewUtils.pushViewportObj( userContent );
			var cop = viewUtils.getCenterOfProjection();
			var pDist = viewUtils.getPerspectiveDistFromElement(userContent);
			var projMat = glmat4.scale(Matrix.I(4), [pDist,pDist,pDist], []);
			projMat[11] = -1;
			projMat[15] = 1400;
			var v2s = Matrix.Translation([cop[0], cop[1], 0]);
			var ucWorldToGlobal = glmat4.multiply( v2s, projMat, [] );
			var offset = viewUtils.getElementOffset( userContent );
			var offMat = Matrix.Translation([offset[0], offset[1], 0]);
			glmat4.multiply( offMat, ucWorldToGlobal, ucWorldToGlobal );
			this._globalToUCWorld = glmat4.inverse(ucWorldToGlobal, []);
			viewUtils.popViewportObj();
		}
	}
}
);



