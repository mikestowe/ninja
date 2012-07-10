/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    Uuid = require("montage/core/uuid").Uuid,
    ElementModel        = require("js/models/element-model").ElementModel,
    Properties3D    = require("js/models/properties-3d").Properties3D,
    ShapeModel    = require("js/models/shape-model").ShapeModel,
    ControllerFactory   = require("js/controllers/elements/controller-factory").ControllerFactory;

exports.NJUtils = Montage.create(Component, {

    /* =============== DOM Access ================ */

    ///// Quick "getElementById"
    $ : {
        value: function(id, doc) {
            doc = doc || document;
            return doc.getElementById(id);
        }
    },

    ///// Quick "getElementsByClassName" which also returns as an Array
    ///// Can return as NodeList by passing true as second argument
    $$ : {
        value: function(className, asNodeList, doc) {
            doc = doc || document;
            var list = doc.getElementsByClassName(className);
            return (asNodeList) ? list : this.toArray(list);
        }
    },

    ///// Get child nodes of element
    ///// Omit filter to only return element nodes
    ///// Pass in filter function to minimize collection, or
    ///// set to true to include all nodes
    children : {
        value : function(el, filter) {
            var f = filter || function(item) {
                return item.nodeType === 1;
            };
            return this.toArray(el.childNodes).filter(f);
        }
    },

     /* ============= DOM Manipulation ============= */

    ///// Creates and returns text node from string
    textNode : {
        value: function(text) {
            return document.createTextNode(text);
        }
    },

    ///// Quick "createElement" function "attr" can be classname or object
    ///// with attribute key/values
    ///// Support for data attributes
    ///// Support user/ninja document
    make: {
        value: function(tag, attr, doc) {
            var _doc, el;

            _doc = doc ? doc.model.views.design.document : document;
            el = _doc.createElement(tag);
            this.decor(el, attr);

            return el;
        }
    },

    decor: {
        value: function(el, attr) {
            if (typeof attr === 'object') {
                for (var a in attr) {
                    if (attr.hasOwnProperty(a)) {
                        if(a.indexOf("data-") > -1) {
                            el.setAttribute(a, attr[a]);
                        } else {
                            el[a] = attr[a];
                        }
                    }
                }
            } else if (typeof attr === 'string') {
                el.className = (el.className + ' ' + attr).trim();
            }
        }
    },

    // TODO: Find a better place for this method
    stylesFromDraw: {
        value: function(element, width, height, drawData, pos) {
            var styles = {};

            styles['position'] = pos ? pos: "absolute";
            styles['left'] = (Math.round(drawData.midPt[0] - 0.5 * width)) - this.application.ninja.currentDocument.model.domContainer.offsetLeft + 'px';
            styles['top'] = (Math.round(drawData.midPt[1] - 0.5 * height)) - this.application.ninja.currentDocument.model.domContainer.offsetTop + 'px';
            styles['width'] = width + 'px';
            styles['height'] = height + 'px';

            // TODO: Check why Canvas has different tranform styles from default.
            if(!MathUtils.isIdentityMatrix(drawData.planeMat)) {
                styles['-webkit-transform-style'] = 'preserve-3d';
                styles['-webkit-transform'] = this.getElementMatrix(drawData.planeMat, drawData.midPt);
            }

            if(element.nodeName === "CANVAS") {
                element.width = width;
                element.height = height;
                delete styles['width'];
                delete styles['height'];

                styles['-webkit-transform-style'] = 'preserve-3d';
            }

            return styles;
        }
    },

    // Get the matrix for the actual element being added to the user document.
    // TODO: Find a better place for this method
    getElementMatrix: {
        value: function(planeMat, midPt) {
            var divMat, flatMat, flatMatSafe;
            // we should not need to worry about divide by zero below since we snapped to the point
            divMat = planeMat.slice(0);
            divMat[12] = 0.0;
            divMat[13] = 0.0;
            //divMat[14] = 0.0;
            divMat[14] = midPt[2];

            // set the left and top of the element such that the center of the rectangle is at the mid point
            this.application.ninja.stage.setStageAsViewport();

            flatMat = divMat;
            flatMatSafe = MathUtils.scientificToDecimal(flatMat, 10);

            return "matrix3d(" + flatMatSafe + ")";
        }
    },

    ///// Removes all child nodes and returns node
    ///// Accepts a single node, or an array of dom nodes
    empty : {
        value: function(node) {
            var elements = [],
                self = this;
            if (node.constructor === Array) {
                node.forEach(function(el) { self.empty(el) });
            } else {
                this.toArray(node.childNodes).forEach(function(child) {
                    child.parentNode.removeChild(child);
                });
            }

            return node;
        }
    },

    queryParentSelector : {
        value: function(el, strSelector) {
            // queryParentSelector:
            // Given a DOM element el (required), walk up the DOM tree
            // and find the first parent that matches selector strSelector (required).
            // Returns: The element that matches, or false if there is no match
            // or if insufficient parameters are supplied.

            if ((typeof(el) === "undefined") || (typeof(strSelector) === "undefined")) {
                // Parameters are required, m'kay?
                return false;
            } else if ((typeof(el) !== "object") || (typeof(strSelector) !== "string" )) {
                // You also have to use the right parameters.
                return false;
            }

            // First, get an empty clone of the parent.
            var myParent = el.parentNode;
            var clone = myParent.cloneNode(false);
            if (clone === null) {
                return false;
            }

            // If we're at the top of the DOM, our clone will be an htmlDocument.
            // htmlDocument has no tagName.
            if (typeof(clone.tagName) !== "undefined") {
                // create a bogus div to use as a base for querySelector
                var temp = document.createElement("div");

                // Append the clone to the bogus div
                temp.appendChild(clone);

                // Now we can use querySelector!  Sweet.
                var selectorTest = temp.querySelector(strSelector);

                // What has querySelector returned?
                if (selectorTest === null) {
                    // No match, so recurse.
                    return this.queryParentSelector(myParent, strSelector);
                } else {
                    // Match! Return the element.
                    return myParent;
                }
            } else {
                // We're at the top of the DOM so we're done.
                return false;
            }
        }

    },

    // Returns the numerical value and unit string from a string.
    // Useful for element properties.
    // 100px will return the following array: [100, px]
    getValueAndUnits: {
        value: function(input) {
            var numberValue = parseFloat(input);

            // Ignore all whitespace, digits, negative sign and "." when looking for units label
            // The units must come after one or more digits
            var objRegExp = /(\-*\d+\.*\d*)(\s*)(\w*\%*)/;
            var unitsString = input.replace(objRegExp, "$3");
            if(unitsString) {
                var noSpaces = /(\s*)(\S*)(\s*)/;
                // strip out spaces and convert to lower case
                var match = (unitsString.replace(noSpaces, "$2")).toLowerCase();
            }

            return [numberValue, match];
        }
    },

    /* ================= Style methods ================= */

    ///// Get computed height of element
    height : {
        value: function(node, pseudo) {
            return node.ownerDocument.defaultView.getComputedStyle(node, pseudo).getPropertyValue('height');
        }
    },

    /* ================= Array methods ================= */

    ///// Return an array from an array-like object
    toArray : {
        value: function(arrayLikeObj) {
            return Array.prototype.slice.call(arrayLikeObj);
        }
    },

    /* ================= String methods ================= */

    ///// Return the last part of a path (e.g. filename)
    getFileNameFromPath : {
        value: function(path) {
            path = path.replace(/[/\\]$/g,"");
            path = path.replace(/\\/g,"/");
            return path.substr(path.lastIndexOf('/') + 1);
        }
    },
    /***
     * file name validation
     */
    isValidFileName:{
        value: function(fileName){
            var status = false;
            if(fileName !== ""){
                fileName = fileName.replace(/^\s+|\s+$/g,"");
                status = !(/[/\\]/g.test(fileName));
                if(status && navigator.userAgent.indexOf("Macintosh") != -1){//for Mac files beginning with . are hidden
                    status = !(/^\./g.test(fileName));
                }
            }
            return status;
        }
    },

    /* ================= misc methods ================= */

    // Generates an alpha-numeric random number
    // len: number of chars
    // default length is '8'
    generateRandom: {
        value: function(len) {
            var length;
            len ? length = len : length = 8;

            return Uuid.generate().substring(0,length);
        }
    }

});
