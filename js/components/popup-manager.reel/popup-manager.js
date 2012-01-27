/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component,
	Popup =				require("js/components/popup.reel").Popup;
////////////////////////////////////////////////////////////////////////
//Exporting as PopupMananger
exports.PopupMananger = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
    deserializedFromTemplate: {
    	value: function () {
    		//Setting styles to popup container
    		this.element.style.zIndex = this._getNextHighestZindex(document.body); // Highest z-index in body
    		this.element.style.position = 'absolute';
    		this.element.style.top = 0;
    		this.element.style.left = 0;
    		this.element.style.width = '100%';
    		this.element.style.height = '100%';
    		//Allowing mouse events to pass through this layer
    		this.element.style.pointerEvents = 'none';
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Adding the popup object
    addPopup: {
    	enumerable: true,
    	value: function (popup, depth, blackout) {
    		//
    		//TODO: Add blackout background
    		//Checking for manual or setting auto to next highest depth
    		if (depth) {
    			popup.style.zIndex = depth;
    		} else {
    			popup.style.zIndex = this._getNextHighestZindex(this.element);
    		}
    		//Adding pointer events (inherits none)
    		popup.style.pointerEvents = 'auto';
            this.element.appendChild(popup);
    		//TODO: Test further (perhaps defined in CSS)
    		popup.style.opacity = 0;
    		popup.style.webkitTransitionProperty = 'opacity';
     		popup.style.webkitTransitionDuration = '150ms';
     		//TODO: Fix animation hack
     		if (popup.style.webkitTransitionDuration) {
    			setTimeout(function () {popup.style.opacity = 1}.bind(this), parseInt(popup.style.webkitTransitionDuration));
    		} else {
    			popup.style.opacity = 1;
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Removing the popup object
    removePopup: {
    	enumerable: true,
    	value: function (popup) {
    		popup.style.opacity = 0;
    		//TODO: Fix animation hack
    		if (popup.style && popup.style.webkitTransitionDuration) {
    			setTimeout(function () {this.element.removeChild(popup)}.bind(this), parseInt(popup.style.webkitTransitionDuration));
    		} else {
    			this.element.removeChild(popup);
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Swapping first with second object
    swapPopup: {
    	enumerable: true,
    	value: function (first, second) {
    		var f = first.style.zIndex, s = second.style.zIndex;
    		//Setting after storing values
    		first.style.zIndex = s;
    		second.style.zIndex = f;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Setting Popup to highest z-index
    bringToFrontPopup: {
    	enumerable: true,
    	value: function (popup) {
    		popup.style.zIndex = this._getNextHighestZindex(this.element);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    createPopup: {
    	enumerable: true,
    	value: function (content, position, tooltip) {
    		//Creating container for Popup
    		var container = document.createElement('div');
    		var pop = Popup.create();
    		//Setting container and content
    		pop.element = container;
    		pop.content = content;
    		//Checking for optional parameters
    		if (position)
    			pop.position = position;
    		if (tooltip)
	    		pop.tooltip = tooltip;
	    	//Adding Popup to view
    		this.addPopup(container);
    		pop.needsDraw = true;
    		//Returns pop component
    		return pop;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //Accepts parent to scan for z-index and returns highest children
    _getNextHighestZindex: {
    	numerable: false,
    	value: function (parent) {
    		//Adapcted from: http://greengeckodesign.com/blog/2007/07/get-highest-z-index-in-javascript.html
			var high = 0, current = 0, children = [], i;
   			//
   			if (parent) {
   				children = parent.getElementsByTagName('*');
   			} else {
   				children = document.getElementsByTagName('*');
   			}
   			//
   			for (i=0; children[i]; i++) {
   				if (children[i].currentStyle) {
   					current = parseFloat(children[i].currentStyle['zIndex']);
   				} else if (window.getComputedStyle) {
   					current = parseFloat(document.defaultView.getComputedStyle(children[i],null).getPropertyValue('z-index'));
   				}
   				if(!isNaN(current) && current > high){
   					high = current;
   				}
   			}
   			//
   			return (high+10);
   		}
	},
    ////////////////////////////////////////////////////////////////////
    //Dispatching "Change" event
    _dispatchpopupEvent: {
    	enumerable: false,
        value: function() {
            var popupEvent = document.createEvent("CustomEvent");
            popupEvent.initEvent("change", true, true);
            popupEvent.type = "change";
            this.dispatchEvent(popupEvent);
        }
    }
    ////////////////////////////////////////////////////////////////////
});