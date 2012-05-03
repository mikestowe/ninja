/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    DrawingTool = require("js/tools/drawing-tool").DrawingTool,
    NJUtils = require("js/lib/NJUtils").NJUtils;

var DrawingToolBase = require("js/tools/drawing-tool-base").DrawingToolBase;

exports.TagTool = Montage.create(DrawingTool, {
    drawingFeedback: { value: { mode: "Draw3D", type: "rectangle" } },

    _editSymbol: { value: null },

    editSymbol:{
        get: function() { return this._editSymbol; },
        set: function(item) {
            if(item) {
//                stageManagerModule.stageManager.drawElementBoundingBox(item, true);
            } else {
//                stageManagerModule.stageManager.drawSelectionRec(true);
            }
            
            this._editSymbol = item;
        }
    },

    HandleLeftButtonDown: {
        value: function(event) {
            this.startDraw(event);
        }
    },

    HandleMouseMove: {
        value: function(event) {
            if(this._escape) {
                this._escape = false;
                this.isDrawing = true;
            }

            if(this.isDrawing) {
                this._hasDraw = true;   // Flag for position of element
                this.doDraw(event);
            } else {
                this.doSnap(event);
            }

            this.drawLastSnap();        // Required cleanup for both Draw/Feedbacks
        }
    },


    HandleLeftButtonUp: {
        value: function(event) {
            if(this._escape) {
                this._escape = false;
                return;
            }
            
            var drawData, selectedItem;

            if(this._hasDraw) {
                drawData =  this.getDrawingData();

                if(drawData) {
                    this.insertElement(drawData);
                }

                this._hasDraw = false;
                this.endDraw(event);
            } else {
                if(this.editSymbol) {
                    this.insertElement();
                } else {
                    //selectedItem = this.doSelection(event);
                    this.doSelection(event);
                }

                this._isDrawing = false;
            }
        }
    },

    HandleDoubleClick: {
        value: function(event) {
            /*
            if(selectionManagerModule.selectionManager.isDocument) {
                this.editSymbol = documentManagerModule.DocumentManager.activeDocument.documentRoot;
            } else {
                this.editSymbol = selectionManagerModule.selectionManager._selectedItems[0];
            }
            */
        }
    },

    /* This will overwrite the existing function in drawing tool. Do not uncomment
    HandleKeyPress: {
        value: function(event) {
            if(event.metaKey) {
                // TODO fix this
                if(selectionManagerModule.selectionManager.isDocument) {
                    this.editSymbol = documentManagerModule.DocumentManager.activeDocument.documentRoot;
                } else {
                    this.editSymbol = selectionManagerModule.selectionManager._selectedItems[0];
                }

            }
        }
    },


    HandleKeyUp: {
        value: function(event) {
            if(event.keyCode === 93 || event.keyCode === 91) {          // Command Keycode
                this.editSymbol = null;
            }
        }
    },
    */

    Configure: {
        value: function(wasSelected) {
            if(wasSelected) {
                NJevent("enableStageMove");
                this.application.ninja.stage.stageDeps.snapManager.setupDragPlaneFromPlane( workingPlane );
            } else {
                NJevent("disableStageMove");
            }
        }
    },
    
    insertElement: {
        value: function(data) {
            var element;

            // TODO Refactor into 1 function
            if(data) {
                // Get Tag & CSS -- ~~ shortcut for ABS
                element = this.makeElement(~~data.width, ~~data.height, data.planeMat, data.midPt, this.makeTag());

                // Insert Element
                this.application.ninja.elementMediator.addElements(element.el, element.data);
            } else {
                element = this.makeStaticElement(this.makeTag());
                this._insertStatic(this.editSymbol, element.el, element.style);
            }

        }
    },

    makeTag: {
        value: function() {
            var selectedTag, newTag;

            selectedTag = this.options.selectedElement;

			if (!NJUtils) NJUtils = require("js/lib/NJUtils").NJUtils;

            if(selectedTag === "divTool") {
                newTag = NJUtils.makeNJElement("div", "div", "block");
            } else if(selectedTag === "imageTool") {
                newTag = NJUtils.makeNJElement("image", "image", "image");
            } else if(selectedTag === "videoTool") {
                newTag = NJUtils.makeNJElement("video", "video", "video", {
                        innerHTML: "Your browser does not support the VIDEO element."
                });
            } else if(selectedTag === "canvasTool") {
                newTag = NJUtils.makeNJElement("canvas", "canvas", "canvas");
            } else if(selectedTag === "customTool") {
                newTag = NJUtils.makeNJElement(this.options.customName.value, this.options.customName.value, "block");
            }
            /* SWF Tag tool - Not used for now. Will revisit this at a later time.
            else if(selectedTag === "flashTool") {
                // Generate the swfobject script tag if not found in the user document
//                documentControllerModule.DocumentController.SetSWFObjectScript();

                newTag = NJUtils.makeNJElement("object", "Object", "block", {
                        classId: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
                });

                var param = NJUtils.makeNJElement("param", "Object", "block", {
                            name: "movie",
                            value: ""
                });

                var param2 = NJUtils.makeNJElement("param", "Object","block", {
                            name: "wmode",
                            value: "transparent"
                });

                var param3 = NJUtils.makeNJElement("param", "Object","block", {
                            name: "play",
                            value: "false"
                });


                newTag.appendChild(param);
                newTag.appendChild(param2);
                newTag.appendChild(param3);
                // TODO Alternative Content

            }
            */
            else {
                console.log("Invalid Tool is selected.");
            }

            try {
//                newTag.className = this.options.classField.value;
                // TODO: Fix this one

            }

            catch(err) {
                console.log("Could not set Tag ID/Class " + err.description);
            }

            return newTag;
        }
    },

    makeElement: {
        value: function(w, h, planeMat, midPt, tag, isShape) {
            var left = Math.round(midPt[0] - 0.5 * w);
            var top = Math.round(midPt[1] - 0.5 * h);

            var styles = {
                'position': 'absolute',
                'top' : top + 'px',
                'left' : left + 'px'
            };

            if(!MathUtils.isIdentityMatrix(planeMat)) {
                styles['-webkit-transform-style'] = 'preserve-3d';
                styles['-webkit-transform'] = DrawingToolBase.getElementMatrix(planeMat, midPt);
            } else if(isShape) {
                styles['-webkit-transform-style'] = 'preserve-3d';
            }

            // TODO - for canvas, set both as style and attribute.
            // Otherwise, we need to create a separate controller for canvas elements
            if(tag.tagName === "CANVAS") {
                tag.width = w;
                tag.height = h;
            } else {
                styles['width'] = w + 'px';
                styles['height'] = h + 'px';
            }

            return {el: tag, data:styles};
        }
    },

    makeStaticElement: {
        value: function(tag) {
            var styles = {
                "-webkit-transform-style": "preserve-3d",
                "-webkit-transform": "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)"
            };
            tag.innerHTML = "content";

            return {el: tag, data:styles};
        }
    },

    _insertStatic: {
        value: function(parent, tag, style) {
        }
    }
});

