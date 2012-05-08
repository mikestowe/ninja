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
	initialize: {
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
        value: function (callback, template) {//TODO: Add support for templates
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
    insertHeadContent: {
    	value: function (e) {
    		//Removing event
    		this._observer.head.disconnect();
    		this._observer.head = null;
    		//Adding the loaded nodes from code fragment into actual document head
    		for(var i in this._headFragment.childNodes) {
    			//Minor hack to know node is actual HTML node
	        	if(this._headFragment.childNodes[i].outerHTML) {
        			this.document.head.appendChild(this._headFragment.childNodes[i]);
        		}
        	}
        	//Garbage collection
        	this._headFragment = null;
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//
    bodyContentLoaded: {
    	value: function (e) {
    		//Removing event, only needed on initial load
    		this._observer.body.disconnect();
    		this._observer.body = null;
    		//Removing loading container
    		this.document.body.removeChild(this.document.getElementsByTagName('ninjaloadinghack')[0]);
   			//Getting style and link tags in document
            var stags = this.document.getElementsByTagName('style'),
            	ltags = this.document.getElementsByTagName('link'), i,
            	scripttags = this.document.getElementsByTagName('script');
           	//Temporarily checking for disabled special case (we must enabled for Ninja to access styles)
           	this.ninjaDisableAttribute(stags);
           	this.ninjaDisableAttribute(ltags);
			//Looping through all link tags to reload into style tags
			if(ltags.length > 0) {
				for (i = 0; i < ltags.length; i++) {
					//
					if (ltags[i].href) {
						//TODO: Verify this works for tags in body as well (working in head)
						this.document.head.insertBefore(this.getStyleTagFromCssFile(ltags[i]), ltags[i]) || this.document.body.insertBefore(this.getStyleTagFromCssFile(ltags[i]), ltags[i]);
						//Disabling tag once it has been reloaded
						ltags[i].setAttribute('disabled', 'true');
					} else {
						//Error: TBD
						//TODO: Determine what link tags would not have href data and error
					}
				}
			}
            //Checking and initializing webGL
            if (scripttags.length > 0) {
            	this.initWebGl(scripttags);
            } //Else there is not data to parse
    		
    		
    		
    		//TODO: Load Montage Components (blocking)
    		//this.initMontage();
    		
    		
    		//Makign callback if specified
    		if (this._callback) this._callback();
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//
	ninjaDisableAttribute: {
		value: function (tags) {
			//Looping through tags
            for (var i = 0; i < tags.length; i++) {
            	if (tags[i].getAttribute('data-ninja-template') === null) {
            		if (tags[i].getAttribute('disabled')) {
           				tags[i].removeAttribute('disabled');
           				tags[i].setAttribute('data-ninja-disabled', 'true');
           			}
           		}
           	}
		}
	},
    ////////////////////////////////////////////////////////////////////
	//TODO: Move to url-parser helper class
    getStyleTagFromCssFile: {
        value: function (linktag) {
        	//
        	var tag, cssData,
	        	//TODO: Remove usage of hack reference of URL
        		docRootUrl = this.application.ninja.coreIoApi.rootUrl+escape((this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]).replace(/\/\//gi, '/'));
        	//Creating style tag to load CSS content into
			tag = this.document.createElement('style');
			tag.setAttribute('type', 'text/css');
        	//Checking for location of href to load (special case for cross-domain)
			if (linktag.href.indexOf(this.application.ninja.coreIoApi.rootUrl) !== -1) {
				//Loading data from file
				cssData = this.urlParser.loadLocalStyleSheet(linktag.href);
				//Setting properties of locally loaded styles
				tag.setAttribute('data-ninja-uri', cssData.fileUri);
				tag.setAttribute('data-ninja-file-url', cssData.cssUrl);
				tag.setAttribute('data-ninja-file-read-only', cssData.writable);
				tag.setAttribute('data-ninja-file-name', cssData.cssUrl.split('/')[cssData.cssUrl.split('/').length-1]);
			} else {
				//Cross-domain content
				cssData = this.urlParser.loadExternalStyleSheet(linktag.href);
				//Setting properties of externally loaded styles
				tag.setAttribute('data-ninja-external-url', linktag.href);
				tag.setAttribute('data-ninja-file-read-only', "true");
				tag.setAttribute('data-ninja-file-name', linktag.href.split('/')[linktag.href.split('/').length-1]);
			}
			//Copying attributes to maintain same properties as the <link>
			for (var n in linktag.attributes) {
				if (linktag.attributes[n].value && linktag.attributes[n].name !== 'disabled') {
					if (linktag.attributes[n].value.indexOf(docRootUrl) !== -1) {
						tag.setAttribute(linktag.attributes[n].name, linktag.attributes[n].value.split(docRootUrl)[1]);
					} else {
						tag.setAttribute(linktag.attributes[n].name, linktag.attributes[n].value);
					}
				}					
			}
			//Setting content from loaded data
			if (cssData.content) tag.innerHTML = cssData.content;
			//Returning <style> with loaded contents
			return tag;
        }
    },
    ////////////////////////////////////////////////////////////////////
	//Method to parse and initialize all webGL data read from file
    initWebGl: {
        value: function (scripttags) {
        	//
        	var n, webgldata;
        	//Setting the iFrame property for reference in helper class
        	this.model.webGlHelper.iframe = this.model.views.design.iframe;
        	//Checking for webGL Data
            for (var w in scripttags) {
            	//
            	webgldata = null;
            	//Checking for tags with webGL data
            	if (scripttags[w].getAttribute) {
            		if (scripttags[w].getAttribute('data-ninja-webgl') !== null) {
            			//TODO: Add logic to handle more than one data tag
            			webgldata = JSON.parse((scripttags[w].innerHTML.replace("(", "")).replace(")", ""));
            		}
            		//Checking for webGL data and building data array
            		if (webgldata && webgldata.data) {
            			for (n = 0; webgldata.data[n]; n++) {
            				webgldata.data[n] = unescape(webgldata.data[n]);
            			}
            			//TODO: Improve setter of webGL and reference
            			this.model.webGlHelper.glData = webgldata.data;
            		}
            	}
            }
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
	//Method to get element from point, used by Ninja
    getElementFromPoint: {
        value: function(x, y) {
            return this.iframe.contentWindow.getElement(x,y);
        }
    }
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////