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
        	this.iframe.addEventListener("load", this.onTemplateLoad.bind(this), true);
        	//TODO: Add source parameter and root (optional)
        	this.iframe.src = "js/document/templates/montage-web/index.html";
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    onTemplateLoad: {
        value: function (e) {
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
        	this._headFragment.addEventListener('DOMSubtreeModified', this.insertHeadContent.bind(this), false);
        	//Inserting <head> HTML and parsing URLs via mediator method
        	this._headFragment.innerHTML = (this.content.head.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator));   	
        	//Adding event listener to know when the body is ready and make callback
        	this.document.body.addEventListener('DOMSubtreeModified', this.bodyContentLoaded.bind(this), false);
        	//Inserting <body> HTML and parsing URLs via mediator method
        	this.document.body.innerHTML += (this.content.body.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator));
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    bodyContentLoaded: {
    	value: function (e) {
    		//Removing event, only needed on initial load
    		this.document.body.removeEventListener('DOMSubtreeModified', this.bodyContentLoaded.bind(this), false);
    		//Makign callback if specified
    		if (this._callback) this._callback();
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//
    insertHeadContent: {
    	value: function (e) {
    		//Removing event
    		this._headFragment.removeEventListener('DOMSubtreeModified', this.insertHeadContent, false);
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