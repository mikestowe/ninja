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

/**
@requires montage/core/core
@requires montage/ui/component
*/
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;
var ElementsMediator = require("js/mediators/element-mediator").ElementMediator;

exports.BindingHud = Montage.create(Component, {
    scrollUp: {
        value: null
    },
    scrollable: {
        value: false
    },
    scrollInterval: {
        value: null
    },
    scrollDown: {
        value: null
    },
    scrollSpace: {
        value: 8
    },
    currentScrollDirection: {
        value: null
    },
    _bindingArgs: {
        value: null
    },

    titleElement: {
        value: null
    },

    boundProperties: {
        value: []
    },

    optionsRepeater: {
        value: null
    },
    panelData : {
        value: null,
        serializable: true
    },
    _userElement: { value: null  },
    userElement: {
        get: function() {
            return this._userElement;
        },
        set: function(val) {
            if(!val) { return; }

            var controller = this.application.ninja.objectsController,
                bindingView = this.parentComponent.parentComponent,
                isOffStage, icon, iconOffsets;

            this._userElement = val;
            this.properties = this.getPropertyList(val.controller); //controller.getPropertiesFromObject(val, true);

            controller.getObjectBindings(this._userElement.controller).forEach(function(obj) {
                this.boundProperties.push(obj.sourceObjectPropertyPath);
            }, this);

            isOffStage = controller.isOffStageObject(val.controller);

            if(isOffStage) {
                icon = bindingView.getOffStageIcon(val);
                iconOffsets = this.getElementOffsetToParent(icon.element, bindingView.element);
                this.title = icon.name;
                this.x = iconOffsets.x;
                this.y = iconOffsets.y - 80;
            } else {
                this.title = this._userElement.controller.identifier;
                this.x = this._userElement.offsetLeft;
                this.y = this._userElement.offsetTop;
//                this.x = parseInt(ElementsMediator.getProperty(val, "left"));
//                this.y = parseInt(ElementsMediator.getProperty(val, "top"));
            }
            this.needsDraw = true;
        }
    },

    getPropertyList : {
        value: function(component) {
            var props = this.application.ninja.objectsController.getPropertiesFromObject(component, true),
                promotedProperties = [],
                objectName;

            ///// Mapper - property to property object
            function propertyMapper(property) {
                return {
                    property: property,
                    promoted: promotedProperties.indexOf(property) !== -1
                }
            }

            if(this.userElement.controller._montage_metadata) {
                objectName = this.userElement.controller._montage_metadata.objectName;

                if(this.panelData && this.panelData[objectName + 'Pi']) {

                    promotedProperties = this.panelData[objectName + 'Pi'][0].Section.map(function(item) {
                        return item[0].prop;
                    });

                    //// Remove promoted properties from current position in array
                    props = props.filter(function(prop) {
                        return promotedProperties.indexOf(prop) === -1;
                    });

                    //// Add them at the top

                    props = promotedProperties.concat(props);

                }
            }

            return props.map(propertyMapper);
        }
    },

    properties: { value: [] },

    _isResizing: {
        value: null
    },

    _resizedX : {
        value: 0
    },

    _resizedY: {
        value: 0
    },

    handleResizeStart: {
        value:function(e) {
            this.isResizing = true;
            this.x = parseInt(this.x);
            this.y = parseInt(this.y);
            this.needsDraw = true;
            this.parentComponent.parentComponent.needsDraw = true;
        }
    },

    handleResizeMove: {
        value:function(e) {
            this._resizedY = e._event.dY;
            this._resizedX = e._event.dX;
            this.needsDraw = true;
            this.parentComponent.parentComponent.needsDraw = true;
        }
    },

    handleResizeEnd: {
        value: function(e) {
            this.x += this._resizedX;
            this.y += this._resizedY;
            this._resizedX = 0;
            this._resizedY = 0;
            this.isResizing = false;
            this.needsDraw = true;
            this.parentComponent.parentComponent.needsDraw = true;
        }
    },

    getElementOffsetToParent : {
        value: function(element, parent) {
            var nodeToPage = webkitConvertPointFromNodeToPage(element, new WebKitPoint(0, 0)),
                parentToPage = webkitConvertPointFromNodeToPage(parent, new WebKitPoint(0, 0));

            return {
                x : nodeToPage.x - parentToPage.x,
                y : nodeToPage.y - parentToPage.y
            }
        }
    },

    _x: {
        value: 20
    },

    _y: {
        value: 100
    },

    x: {
        get: function() {
            return this._x;
        },
        set: function(val) {
            this._x = val;
            this.needsDraw = true;
        }
    },

    y: {
        get: function() {
            return this._y;
        },
        set: function(val) {
            this._y = val;
            this.needsDraw = true;
        }
    },

    _title: {
        value: "default"
    },

    title: {
        get: function() {
            return this._title;
        },
        set: function(val) {
            this._title = val;
        }
    },

    prepareForDraw: {
        value: function() {
//            var arrProperties = this.application.ninja.objectsController.getEnumerableProperties(this._bindingArgs.sourceObject, true);
//            arrProperties.forEach(function(obj) {
//                var objBound = false;
//                if(this._bindingArgs._boundObjectPropertyPath === obj) {
//                    objBound = true;
//                }
//                this.properties.push({"title":obj, "bound": objBound});
//            }.bind(this));
            //this.parentComponent.parentComponent.handleShowBinding(this.application.ninja.objectsController.getObjectBindings(this.userComponent));
            if(this.scrollSpace < this.properties.length) {
                this.scrollUp.addEventListener("mouseover", this);
                this.scrollDown.addEventListener("mouseover", this);
                this.scrollUp.addEventListener("mouseout", this);
                this.scrollDown.addEventListener("mouseout", this);
                this.optionsRepeater.element.style.maxHeight = (this.scrollSpace * 18) + "px"
                this.scrollUp.style.display = "block";
                this.scrollDown.style.display = "block";
            }
        }
    },

    isOverScroller: {
        value: function(e) {
            if(this.scrollSpace < this.properties.length) {
                var isOverScroller = false;
                var mousePoint = webkitConvertPointFromPageToNode(this.element, new WebKitPoint(e.pageX, e.pageY));

                var scrollUpStartX = 5;
                var scrollUpEndX = scrollUpStartX + this.titleElement.offsetWidth;
                var scrollUpStartY = this.titleElement.offsetHeight + 5;
                var scrollUpEndY = scrollUpStartY + this.scrollUp.offsetHeight;
                if(scrollUpStartX < mousePoint.x && (scrollUpEndX) > mousePoint.x) {
                    if(scrollUpStartY < mousePoint.y && (scrollUpEndY) > mousePoint.y) {
                        this.handleScroll("up");
                        isOverScroller = true;
                    }
                }

                var scrollDownStartX = 5;
                var scrollDownEndX = scrollDownStartX + this.titleElement.offsetWidth;
                var scrollDownStartY = scrollUpEndY + this.optionsRepeater.element.offsetHeight;
                var scrollDownEndY = scrollDownStartY + this.scrollDown.offsetHeight;

                if(scrollDownStartX < mousePoint.x && (scrollDownEndX) > mousePoint.x) {
                    if(scrollDownStartY < mousePoint.y && (scrollDownEndY) > mousePoint.y) {
                        this.handleScroll("down");
                        isOverScroller = true;
                    }
                }

                if(!isOverScroller) {
                    clearInterval(this.scrollInterval);
                    this.scrollInterval = null;
                }
            }
        }
    },

    handleScroll: {
        value: function(direction) {
            if (this.scrollInterval === null) {
                if(direction === "down") {
                    this.scrollInterval = setInterval(function() {
                        this.optionsRepeater.element.scrollTop += 3;
                    }.bind(this), 20);
                } else {
                    this.scrollInterval = setInterval(function() {
                        this.optionsRepeater.element.scrollTop -= 3;
                    }.bind(this), 20);
                }
            }
        }
    },

    handleMouseover: {
        value: function(e) {

            if(this.scrollSpace < this.properties.length) {
                if (this.scrollInterval === null) {
                    if (e._event.target.classList.contains("scrollAreaBottom")) {
                        this.currentScrollDirection = "down";
                    } else {
                        this.currentScrollDirection = "up";
                    }
                }
            }
            this.needsDraw = true;
        }
    },



    handleMouseout: {
        value: function() {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
            this.currentScrollDirection = null;
        }
    },

    draw: {
        value: function() {

            if(this.currentScrollDirection !== null) {
                this.scrollInterval = setInterval(function() {
                    if(this.currentScrollDirection === "down") {
                        this.optionsRepeater.element.scrollTop += 3;
                    } else {
                        this.optionsRepeater.element.scrollTop -= 3;
                    }
                }.bind(this), 20);
            } else {
                clearInterval(this.scrollInterval);
            }

            this.titleElement.innerHTML = this.title;
            this.element.style.top = (this.y + this._resizedY) + "px";
            this.element.style.left = (this.x + this._resizedX) + "px";
        }
    },
    didDraw: {
        value: function() {
//            if (this.currentScrollDirection !== null) {
//                this.needsDraw=true;
//            }
        }
    }
});
