/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//Exporting as Popup
exports.Popup = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //
    _content: {
    	numerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    content: {
    	enumerable: true,
        get: function() {
            return this._content;
        },
        set: function(value) {
        	this._content = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _position: {
    	numerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //Position is set with X,Y Coordinates from Top and Left respetively
    position: {
    	enumerable: true,
        get: function() {
            return this._position;
        },
        set: function(value) {
        	this._position = value;
        	if (value.x) {
        		this.element.style.left = value.x;
        	}
        	if (value.y) {
        		this.element.style.top = value.y;
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _tooltip: {
    	numerable: false,
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    tooltip: {
    	enumerable: true,
        get: function() {
            return this._tooltip;
        },
        set: function(value) {
        	this._tooltip = value;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
    	enumerable: false,
    	value: function() {
    		this.element.style.pointerEvents = 'auto';
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    willDraw: {
    	enumerable: false,
    	value: function() {
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
    	enumerable: false,
    	value: function() {
    		//
    		if (!this._content) {
    			return;
    		}
       		if (!this._content.style.width) {
    			this._content.style.width = 'auto';
    		}
    		if (!this._content.style.float) {
    			this._content.style.float = 'left';
    		}
    		this.element.getElementsByClassName('content')[0].appendChild(this._content);
    		//
    		if (!this.tooltip) {
    			this.tooltip = {};
    			this.tooltip.side = 'none';
    			this.tooltip.align = 'none';
    		}
    		switch (this.tooltip.side.toLowerCase()) {
        		case 'top':
        			this.element.style.marginTop = (this.element.getElementsByClassName('tooltip')[0].clientHeight) + 'px';
        			break;
        		case 'bottom':
        			this.element.style.marginTop = -(this.element.clientHeight+(this.element.getElementsByClassName('tooltip')[0].clientHeight)) + 'px';
        			break;
        		case 'left':
        			this.element.style.marginLeft = (this.element.getElementsByClassName('tooltip')[0].clientWidth) + 'px';
        			break;
        		case 'right':
        			this.element.style.marginLeft = -(this.element.clientWidth + this.element.getElementsByClassName('tooltip')[0].clientWidth) + 'px';
        			break;
        		default:
        			//console.log("Error: Tooltip side value of "+this.tooltip.side.toLowerCase()+" property not allowed");
        			break;
        	}
        	//
        	switch (this.tooltip.align.toLowerCase()) {
        		case 'top':
        			this.element.style.marginTop = -Math.round((this.element.getElementsByClassName('tooltip')[0].clientHeight/2)+this.element.getElementsByClassName('tooltip')[0].offsetTop) + 'px';
        			break;
        		case 'bottom':
        			this.element.style.marginTop = -Math.round(this.element.clientHeight-((this.element.clientHeight - this.element.getElementsByClassName('tooltip')[0].offsetTop)-(this.element.getElementsByClassName('tooltip')[0].clientHeight/2))) + 'px';
        			break;
        		case 'left':
        				this.element.style.marginLeft = -Math.round(this.element.clientWidth-((this.element.clientWidth - this.element.getElementsByClassName('tooltip')[0].offsetLeft)-(this.element.getElementsByClassName('tooltip')[0].clientWidth/2))) + 'px';
        				break;
        		case 'right':
        			this.element.style.marginLeft = -(this.element.clientWidth - this.element.getElementsByClassName('tooltip')[0].clientWidth) + 'px';
        			break;
        		case 'center':
        			this.element.style.marginLeft = -Math.round(this.element.clientWidth/2-((this.element.clientWidth/2 - this.element.getElementsByClassName('tooltip')[0].offsetLeft)-(this.element.getElementsByClassName('tooltip')[0].clientWidth/2))) + 'px';
        			break;
       			case 'middle':
       				this.element.style.marginTop = -Math.round(this.element.clientHeight/2-((this.element.clientHeight/2 - this.element.getElementsByClassName('tooltip')[0].offsetTop)-(this.element.getElementsByClassName('tooltip')[0].clientHeight/2))) + 'px';
       				break;
        		default:
        			//console.log("Error: Tooltip align value of "+this.tooltip.align.toLowerCase()+" property not allowed");
        			break;
        	}
        	//
        	this.drawTooltip();
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    didDraw: {
    	enumerable: false,
    	value: function() {
        	//Removed own event, relying on firstDraw event of m-js
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    drawTooltip: {
    	enumerable: true,
    	value: function () {
    		//
    		var longD = '22px', shortD = '10px', shortP = '-10px', longP = '8px', tip = this.element.getElementsByClassName('tooltip')[0];
    		//
        	if (this.tooltip && this.tooltip.side) {
        		switch (this.tooltip.side.toLowerCase()) {
        			case 'top':
        				tip.style.top = shortP;
        				tip.style.height = shortD;
        				tip.style.width = longD;
        				break;
        			case 'bottom':
        				tip.style.bottom = shortP;
        				tip.style.height = shortD;
        				tip.style.width = longD;
        				tip.getElementsByTagName('span')[0].style.marginTop = '-6px';
        				break;
        			case 'left':
        				tip.style.left = shortP;
        				tip.style.width = shortD;
        				tip.style.height = longD;
        				//this.element.style.left = parseInt(this.element.style.left) + parseInt(tip.style.width) + 'px';
        				break;
        			case 'right':
        				tip.style.right = shortP;
        				tip.style.width = shortD;
        				tip.style.height = longD;
        				tip.getElementsByTagName('span')[0].style.marginLeft = '-6px';
        				break;
        			default:
        				tip.style.display = 'none';
        				//console.log("Error: Tooltip side value of "+this.tooltip.side.toLowerCase()+" property not allowed");
        				break;
        		}
        	} else {
        		tip.style.display = 'none';
        	}
        	//
        	if (this.tooltip && this.tooltip.align) {
        		switch (this.tooltip.align.toLowerCase()) {
        			case 'top':
        				tip.style.top = longP;
        				break;
        			case 'bottom':
        				tip.style.bottom = longP;
        				break;
        			case 'left':
        				tip.style.left = longP;
        				break;
        			case 'right':
        				tip.style.right = longP;
        				break;
        			case 'center':
        				tip.style.left = '50%';
        				tip.style.marginLeft = -Math.round(parseFloat(tip.style.width)/2)+'px';
        				break;
        			case 'middle':
        				tip.style.top = '50%';
        				tip.style.marginTop = -Math.round(parseFloat(tip.style.height)/2)+'px';
        				break;
        			default:
        				tip.style.display = 'none';
        				//console.log("Error: Tooltip align value of "+this.tooltip.align.toLowerCase()+" property not allowed");
        				break;
        		}
        	} else {
        		tip.style.display = 'none';
        	}
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////