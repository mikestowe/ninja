/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	BaseDocumentView = 	require("js/document/views/base").BaseDocumentView;
////////////////////////////////////////////////////////////////////////
//	
exports.DesignDocumentView = Montage.create(BaseDocumentView, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
	//
    _callback: {
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	_document: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	_headFragment: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	_observer: {
        value: {head: null, body: null}
    },
    ////////////////////////////////////////////////////////////////////
	//
	content: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    document: {
        get: function() {return this._document;},
        set: function(value) {this._document = value;}
    },
    ////////////////////////////////////////////////////////////////////
	//
	initiliaze: {
        value: function (parent) {
        	//Creating iFrame for view
        	this.iframe = document.createElement("iframe");
        	//Setting default styles
        	this.iframe.style.border = "none";
            this.iframe.style.background = "#FFF";
            this.iframe.style.height = "100%";
            this.iframe.style.width = "100%";
            //Returning reference to iFrame created
            return parent.appendChild(this.iframe);
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	render: {
        value: function (callback) {
        	//Storing callback for dispatch ready
        	this._callback = callback;
        	//Adding listener to know when template is loaded to then load user content
        	this.iframe.addEventListener("load", this.onTemplateLoad.bind(this), false);
        	//TODO: Add source parameter and root (optional)
        	this.iframe.src = "js/document/templates/montage-web/index.html";
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    onTemplateLoad: {
        value: function (e) {
        	//Removing event
        	this.iframe.removeEventListener("load", this.onTemplateLoad.bind(this), false);
        	//TODO: Improve usage of this reference
        	this.document = this.iframe.contentWindow.document;
        	//Looping through template styles and marking them with ninja data attribute for I/O clean up
        	for (var k in this.document.styleSheets) {
            	if (this.document.styleSheets[k].ownerNode && this.document.styleSheets[k].ownerNode.setAttribute) {
            		this.document.styleSheets[k].ownerNode.setAttribute('data-ninja-template', 'true');
            	}
            }
            
        	//Creating temp code fragement to load head
        	this._headFragment = this.document.createElement('head');
        	//Adding event listener to know when head is ready, event only dispatched once when using innerHTML
        	this._observer.head = new WebKitMutationObserver(this.insertHeadContent.bind(this));
        	this._observer.head.observe(this._headFragment, {childList: true});
        	//Inserting <head> HTML and parsing URLs via mediator method
        	this._headFragment.innerHTML = (this.content.head.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator));
        	//Adding event listener to know when the body is ready and make callback (using HTML5 new DOM Mutation Events)
        	this._observer.body = new WebKitMutationObserver(this.bodyContentLoaded.bind(this));
        	this._observer.body.observe(this.document.body, {childList: true});
        	//Inserting <body> HTML and parsing URLs via mediator method
        	this.document.body.innerHTML += '<ninjaloadinghack></ninjaloadinghack>'+(this.content.body.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator));
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    bodyContentLoaded: {
    	value: function (e) {
    		//Removing event, only needed on initial load
    		this._observer.body.disconnect();
    		//Removing loading container
    		this.document.body.removeChild(this.document.getElementsByTagName('ninjaloadinghack')[0]);
    		
    		
    		
    		
    		
    		
    		
    		
   			//Temporarily checking for disabled special case
            var stags = this.document.getElementsByTagName('style'),
            	ltags = this.document.getElementsByTagName('link');
           	//
            for (var m = 0; m < ltags.length; m++) {
            	if (ltags[m].getAttribute('data-ninja-template') === null) {
            		if (ltags[m].getAttribute('disabled')) {
           				ltags[m].removeAttribute('disabled');
           				ltags[m].setAttribute('data-ninja-disabled', 'true');
           			}
           		}
           	}
            //
           	for (var n = 0; n < stags.length; n++) {
           		if (stags[n].getAttribute('data-ninja-template') === null) {
           			if (stags[n].getAttribute('disabled')) {
           				stags[n].removeAttribute('disabled');
           				stags[n].setAttribute('data-ninja-disabled', 'true');
            		}
            	}
            }
			//
			if(this.document.styleSheets.length > 0) {
				for (var i = 0; i < this.document.styleSheets.length; i++) {
					//
				}
			}
    		
    		
    		
    		
    		
    		
    		
    		
    		//Makign callback if specified
    		if (this._callback) this._callback();
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//
    insertHeadContent: {
    	value: function (e) {
    		//Removing event
    		this._observer.head.disconnect();
    		//Adding the loaded nodes from code fragment into actual document head
    		for(var i in this._headFragment.childNodes) {
    			//Minor hack to know node is actual HTML node
	        	if(this._headFragment.childNodes[i].outerHTML) {
        			this.document.head.appendChild(this._headFragment.childNodes[i]);
        		}
        	}
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//
    initCss: {
        value: function () {
        	//
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    initWebGl: {
        value: function () {
        	//
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    initMontage: {
        value: function () {
        	//
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    getElementFromPoint: {
        value: function(x, y) {
            return this.iframe.contentWindow.getElement(x,y);
        }
    },
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////