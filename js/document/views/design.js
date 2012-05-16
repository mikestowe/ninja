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
    _template: {
    	value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	_document: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	_bodyFragment: {
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
	//TODO: Remove usage
	model: {
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
        value: function (callback, template) {
        	//TODO: Remove, this is a temp patch for webRequest API gate
        	this.application.ninja.documentController._hackRootFlag = false;
        	//Storing callback for dispatch ready
        	this._callback = callback;
        	this._template = template;
        	//Adding listener to know when template is loaded to then load user content
        	this.iframe.addEventListener("load", this.onTemplateLoad.bind(this), false);
        	//TODO: Add source parameter and root (optional)
			if (template && template.type === 'banner' && template.size) {
        		this.iframe.src = "js/document/templates/banner/index.html";
        	} else {
	        	this.iframe.src = "js/document/templates/html/index.html";
	        }
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    onTemplateLoad: {
        value: function (e) {
        	this.application.ninja.documentController._hackRootFlag = true;
        	//TODO: Add support to constructing URL with a base HREF
        	var basetag = this.content.document.getElementsByTagName('base');
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
            //Checking for a base URL
            if (basetag.length) {
            	if (basetag[basetag.length-1].getAttribute && basetag[basetag.length-1].getAttribute('href')) {
            		//Setting base HREF in model
        			this.model.baseHref = basetag[basetag.length-1].getAttribute('href');
        		}
        	}
        	//Checking to content to be template
        	if (this._template) {
        		if (this._template.type === 'banner') {
        			//Loading contents into a fragment
        			this._bodyFragment = this.document.createElement('body');
        			//Listening for content to be ready
        			this._observer.body = new WebKitMutationObserver(this.insertBannerContent.bind(this));
    	    		this._observer.body.observe(this._bodyFragment, {childList: true});
	        		//Inserting <body> HTML and parsing URLs via mediator method
        			this._bodyFragment.innerHTML = '<ninjaloadinghack></ninjaloadinghack>'+(this.content.body.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator));
    	    	}
        	} else {
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
    	    	//Copying attributes to maintain same properties as the <body>
				for (var n in this.content.document.body.attributes) {
					if (this.content.document.body.attributes[n].value) {
						this.document.body.setAttribute(this.content.document.body.attributes[n].name, this.content.document.body.attributes[n].value);
					}
				}
				//TODO: Add attribute copying for <HEAD> and <HTML>
			}
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    insertBannerContent: {
    	value: function (e) {
    		//Getting first element in DOM (assumes it's root)
    		//TODO: Ensure wrapper logic is proper
    		var wrapper =	this._bodyFragment.getElementsByTagName('*')[1],
    			banner =	this._bodyFragment.getElementsByTagName('*')[2],
    			ninjaBanner = this.document.body.getElementsByTagName('ninja-content')[0],
    			ninjaWrapper = this.document.body.getElementsByTagName('ninja-viewport')[0];
    		//Copying attributes to maintain same properties as the banner wrapper
			for (var n in wrapper.attributes) {
				if (wrapper.attributes[n].value) {
					ninjaWrapper.setAttribute(wrapper.attributes[n].name, wrapper.attributes[n].value);
				}
			}
			//Copying attributes to maintain same properties as the banner content
			for (var n in banner.attributes) {
				if (banner.attributes[n].value) {
					ninjaBanner.setAttribute(banner.attributes[n].name, banner.attributes[n].value);
				}
			}
			//Adjusting margin per size of document
			this.document.head.getElementsByTagName('style')[0].innerHTML += '\n ninja-viewport {overflow: visible !important;} ninja-content, ninja-viewport {width: ' + this._template.size.width + 'px; height: ' + this._template.size.height + 'px;}';
			//Setting content in template
    		ninjaBanner.innerHTML = banner.innerHTML;
        	//Garbage collection
        	this._bodyFragment = null;
        	//Calling standard method to finish opening document
        	this.bodyContentLoaded(null);
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
    		//Removing loading container (should be removed)
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
						//Inseting <style> right above of <link> to maintain hierarchy
						try {
							this.document.head.insertBefore(this.getStyleTagFromCssFile(ltags[i]), ltags[i])
						} catch (e) {
							this.document.body.insertBefore(this.getStyleTagFromCssFile(ltags[i]), ltags[i]);
						}
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
        	//initWithDocument(window.document) instantiateWithOwnerAndDocument(null, window.document)
        }
    },
    ////////////////////////////////////////////////////////////////////
	//Method to get element from point, used by Ninja
    getElementFromPoint: {
        value: function(x, y) {
            return this.iframe.contentWindow.getElement(x,y);
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    pauseVideos:{
        value:function(){
        	var i, videos = this.document.getElementsByTagName("video");
            for(i = 0; i < videos.length; i++){
                if(!videos[i].paused) videos[i].pause();
            }
        }
    },
	////////////////////////////////////////////////////////////////////
    //
    stopVideos:{
        value:function(){
        	var i, videos = this.document.getElementsByTagName("video");
            for(i = 0; i < videos.length; i++){
                videos[i].src = "";
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    pauseAndStopVideos:{
        value:function(){
        	var i, videos = this.document.getElementsByTagName("video");
            for(i = 0; i < videos.length; i++){
            	if(!videos[i].paused) videos[i].pause();
                videos[i].src = "";
            }
        }
    }
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////