/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    ElementController = require("js/controllers/elements/element-controller").ElementController;

exports.VideoController = Montage.create(ElementController, {
    getProperty: {
        value: function(el, prop) {
            switch(prop) {
                case "src":
                case "poster":
                case "autoplay":
                case "controls":
                case "loop":
                case "muted":
                    return el.getAttribute(prop);
                default:
                    return ElementController.getProperty(el, prop);
            }
        }
    },

    setProperty: {
        value: function(el, p, value) {
            switch(p) {
                case "src":
                	
                	//TODO: Move this to the location where the element is created
                	el.addEventListener('canplay', function(e) {
						//TODO: Figure out why the video must be seeked to the end before pausing
  						var time = Math.ceil(this.duration);
  						//Trying to display the last frame (doing minus 2 seconds if long video)
  						if (time > 2) this.currentTime = time - 2;
  						else if (time > 1) this.currentTime = time - 1;
  						else this.currentTime = time || 0;
  						//Pauing video
  						this.pause();
  					}, false);
  					
                    el.setAttribute(p, value);
                    break;
                case "poster":
                    el.setAttribute(p, value);
                    break;
                case "autoplay":
                    value ? el.setAttribute(p, "autoplay") : el.removeAttribute(p);
                    break;
                case "preload":
                    value ? el.setAttribute(p, "preload") : el.removeAttribute(p);
                    break;
                case "controls":
                    value ? el.setAttribute(p, "controls") : el.removeAttribute(p);
                    break;
                case "loop":
                    value ? el.setAttribute(p, "loop") : el.removeAttribute(p);
                    break;
                case "muted":
                    value ? el.setAttribute(p, "muted") : el.removeAttribute(p);
                    break;
                default:
                    ElementController.setProperty(el, p, value);
            }
        }
    }
});