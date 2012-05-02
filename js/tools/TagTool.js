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

            if(this._hasDraw) {
                var drawData =  this.getDrawingData();

                if(drawData) {
                    this.insertElement(drawData);
                }

                this._hasDraw = false;
                this.endDraw(event);
            } else {
                this.doSelection(event);
            }

            this._isDrawing = false;
        }
    },

    // TODO: Fix Classname
    // TODO: Add position support
    insertElement: {
        value: function(drawData) {
            var element, styles;

            // Create the element
            if(this.options.selectedElement === "custom") {
                element = document.application.njUtils.make(this.options.customName.value, null, this.application.ninja.currentDocument);
            } else {
                element = document.application.njUtils.make(this.options.selectedElement, null, this.application.ninja.currentDocument);
            }

            // Create the model
            document.application.njUtils.createModel(element);


            // Create the styles
            styles = this.makeStylesFromDraw(drawData);
            if(element.nodeName === "CANVAS") {
                element.width = parseInt(styles.width);
                element.height = parseInt(styles.height);
                delete styles['width'];
                delete styles['height'];
            }

            // Add the element and styles
            this.application.ninja.elementMediator.addElements(element, styles);
        }
    },

    makeStylesFromDraw: {
        value: function(drawData) {
            var styles = {};

            styles['position'] = "absolute";
            styles['left'] = (Math.round(drawData.midPt[0] - 0.5 * ~~drawData.width)) - this.application.ninja.currentSelectedContainer.offsetLeft + 'px';
            styles['top'] = (Math.round(drawData.midPt[1] - 0.5 * ~~drawData.height)) - this.application.ninja.currentSelectedContainer.offsetTop + 'px';
            styles['width'] = ~~drawData.width + 'px';
            styles['height'] = ~~drawData.height + 'px';

            if(!MathUtils.isIdentityMatrix(drawData.planeMat)) {
                styles['-webkit-transform-style'] = 'preserve-3d';
                styles['-webkit-transform'] = DrawingToolBase.getElementMatrix(drawData.planeMat, drawData.midPt);
            }

            return styles;
        }
    },

    makeTag: {
        value: function() {
            var selectedTag, newTag;

            selectedTag = this.options.selectedElement;

            if(selectedTag === "div") {
                newTag = NJUtils.makeNJElement("div", "div", "block");
            } else if(selectedTag === "image") {
                newTag = NJUtils.makeNJElement("image", "image", "image");
            } else if(selectedTag === "video") {
                newTag = NJUtils.makeNJElement("video", "video", "video", {
                        innerHTML: "Your browser does not support the VIDEO element."
                });
            } else if(selectedTag === "canvas") {
                newTag = NJUtils.makeNJElement("canvas", "canvas", "canvas");
            } else if(selectedTag === "custom") {
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
            var left = (Math.round(midPt[0] - 0.5 * w)) - this.application.ninja.currentSelectedContainer.offsetLeft + 'px';
            var top = (Math.round(midPt[1] - 0.5 * h)) - this.application.ninja.currentSelectedContainer.offsetTop + 'px';

            var styles = {
                'position': 'absolute',
                'top' : top,
                'left' : left
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
    }
});

