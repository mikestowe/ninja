/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    TextDocument =	require("js/document/text-document").TextDocument,
    NJUtils = 		require("js/lib/NJUtils").NJUtils;
////////////////////////////////////////////////////////////////////////
//
exports.HTMLDocument = Montage.create(TextDocument, {
    
    _selectionExclude: { value: null, enumerable: false },
    _htmlTemplateUrl: { value: "js/document/templates/montage-html/index.html", enumerable: false},
    _iframe: { value: null, enumerable: false },
    _server: { value: null, enumerable: false },
    _templateDocument: { value: null, enumerable: false },
    _selectionModel: { value: [], enumerable: false },
    _undoModel: { value: { "queue" : [], "position" : 0 }, enumerable: false},

    _document: { value: null, enumerable: false },
    _documentRoot: { value: null, enumerable: false },
    _liveNodeList: { value: null, enumarable: false },
    _stageBG: { value: null, enumerable: false },
    _window: { value: null, enumerable: false },
    _styles: { value: null, enumerable: false },
    _stylesheets: { value: null, enumerable: false },
    _stageStyleSheetId : { value: 'nj-stage-stylesheet', enumerable: false },
    _userDocument: { value: null, enumerable: false },
    _htmlSource: {value: "<html></html>", enumerable: false},
    _glData: {value: null, enumerable: false },
    _userComponents: { value: {}, enumarable: false},

    _elementCounter: { value: 1, enumerable: false },
    _snapping : { value: true, enumerable: false },
    _layoutMode: { value: "all", enumerable: false },
    _draw3DGrid: { value: false, writable: true },
    _swfObject: { value: false, enumerable: false },

    _zoomFactor: { value: 100, enumerable: false },

    cssLoadInterval: { value: null, enumerable: false },

    _savedLeftScroll: {value:null},
    _savedTopScroll: {value:null},

    _codeViewDocument:{
        writable: true,
        enumerable: true,
        value:null
    },



    // GETTERS / SETTERS

    codeViewDocument:{
        get: function() { return this._codeViewDocument; },
        set: function(value) { this._codeViewDocument = value}
    },

    savedLeftScroll:{
        get: function() { return this._savedLeftScroll; },
        set: function(value) { this._savedLeftScroll = value}
    },

    savedTopScroll:{
        get: function() { return this._savedTopScroll; },
        set: function(value) { this._savedTopScroll = value}
    },

    selectionExclude: {
        get: function() { return this._selectionExclude; },
        set: function(value) { this._selectionExclude = value; }
    },

    iframe: {
        get: function() { return this._iframe; },
        set: function(value) { this._iframe = value; }
    },

    server: {
        get: function() { return this._server; },
        set: function(value) { this._server = value; }
    },

    selectionModel: {
        get: function() { return this._selectionModel; },
        set: function(value) { this._selectionModel = value; }
    },

    undoModel: {
        get: function() { return this._undoModel; },
        set: function(value) { this._undoModel.queue = value.queue; this._undoModel.position = value.position; }
    },

    documentRoot: {
        get: function() { return this._documentRoot; },
        set: function(value) { this._documentRoot = value; }
    },

    stageBG: {
        get: function() { return this._stageBG; },
        set: function(value) { this._stageBG = value; }
    },

    elementCounter: {
        set: function(value) { this._elementCounter = value; },
        get: function() { return this._elementCounter; }
    },

    snapping: {
        get: function() { return this._snapping; },
        set: function(value) {
            if(this._snapping !== value) {
                this._snapping = value;
            }
        }
    },

    // TODO SEND THE EVENT --> Redraw the desired layout
    layoutMode: {
        get: function() { return this._layoutMode; },
        set: function(mode) { this._layoutMode = mode; }
    },

    draw3DGrid: {
        get: function() { return this._draw3DGrid; },
        set: function(value) {
            if(this._draw3DGrid !== value) {
                this._draw3DGrid = value;
            }
        }
    },

    userComponents: {
        get: function() {
            return this._userComponents;
        }
    },
//    _drawUserComponentsOnOpen:{
//        value:function(){
//            for(var i in this._userComponentSet){
//                console.log(this._userComponentSet[i].control)
//                this._userComponentSet[i].control.needsDraw = true;
//            }
//        }
//    },
    
    glData: {
        get: function()
		{
			var elt = this.iframe.contentWindow.document.getElementById("UserContent");
			this._glData = null;
			if (elt)
			{
				var cdm = new CanvasDataManager();
				this._glData = [];
				cdm.collectGLData( elt,  this._glData );
			}
				
			return this._glData
		},

        set: function(value)
		{
			var elt = this.iframe.contentWindow.document.getElementById("UserContent");
			if (elt)
			{
				console.log( "load canvas data: " + value );
				var cdm = new CanvasDataManager();
				cdm.loadGLData(elt,  value);
			}
		}
    },

    zoomFactor: {
        get: function() { return this._zoomFactor; },
        set: function(value) { this._zoomFactor = value; }
    },

    /**
     * Add a reference to a component instance to the userComponents hash using the
     * element UUID
     */
    setComponentInstance: {
        value: function(instance, el) {
            this.userComponents[el.uuid] = instance;
        }
    },

    /**
     * Returns the component instance obj from the element
     */
    getComponentFromElement: {
        value: function(el) {
            if(el) {
                if(el.uuid) return this.userComponents[el.uuid];
            } else {
                return null;
            }
        }
    },
    
    
    
    ////////////////////////////////////////////////////////////////////
	//
    initialize: {
		value: function(file, uuid, iframe, callback) {
			this.application.ninja.documentController._hackRootFlag = false;
			//
			this._userDocument = file;
			//
			this.init(file.name, file.uri, file.extension, iframe, uuid, callback);
			//
            this.iframe = iframe;
            this.selectionExclude = ["HTML", "BODY", "Viewport", "UserContent", "stageBG"];
            this.currentView = "design";
			//
			this.iframe.src = this._htmlTemplateUrl;
            this.iframe.addEventListener("load", this, true);
        }
    },
    ////////////////////////////////////////////////////////////////////


	collectGLData: {
		value: function( elt,  dataArray )
		{
			if (elt.elementModel && elt.elementModel.shapeModel && elt.elementModel.shapeModel.GLWorld)
			{
				var data = elt.elementModel.shapeModel.GLWorld.export();
				dataArray.push( data );
			}

			if (elt.children)
			{
				var nKids = elt.children.length;
				for (var i=0;  i<nKids;  i++)
				{
					var child = elt.children[i];
					this.collectGLData( child, dataArray );
				}
			}
		}
	},


    // OLD

    inExclusion: {
        value: function(element) {
            if(this._selectionExclude.indexOf(element.id) === -1) {
                if(this._selectionExclude.indexOf(element.nodeName) === -1) {
                    return -1;
                }
            } else if (this._selectionExclude.indexOf(element.id) === -1) {
                return -1;
            } else {
                return 1;
            }
        }
    },

    /**
     * Return the specified inline attribute from the element.
     */
    GetElementAttribute: {
        value: function(element, attribute) {

            var value;

            if(attribute === "src") {
                return element[attribute].replace(window.location.href, '');
            }

            value = element[attribute];

            if(value !== undefined) return value;
//            if(value || value === false) return [value, "inline"];

            // 3.
            //value = this._document.defaultView.getComputedStyle(element,null).getPropertyValue(attribute);
            //if(value) return value;

            return null;
        }
    },

    GetElementStyle: {
        value: function(element, style) {
//            return this._queryStylesheets(element, style);
        }
    },

    SetStyle: {
        value: function(type, selector, style, value) {
            try {
                for(var j=0; j<this._stylesheets.length;j++){
                    for(var i=0; i<this._stylesheets[j].cssRules.length;i++) {
                        if(this._stylesheets[j].cssRules[i].selectorText === type + selector) {
                            this._stylesheets[j].cssRules[i].style[style] = value;

                            return true;
                        }
                    }
                }
            } catch(err) {
                console.log("Cannot change the style of selector: " + selector + " " + err);
            }
        }
    },

    GetElementFromPoint: {
        value: function(x, y) {
            return this._window.getElement(x,y);
        }
    },
    
    
    
    
    
    
    
    
	/* 		
            DOM Mutation Events:
          		
            DOMActivate, DOMFocusIn, DOMFocusOut, DOMAttrModified,
           	DOMCharacterDataModified, DOMNodeInserted, DOMNodeInsertedIntoDocument,
       		DOMNodeRemoved, DOMNodeRemovedFromDocument, DOMSubtreeModified, DOMContentLoaded
            		
  	*/
  	
  	
  	
  	/*
//TODO: Remove and clean up event listener (DOMSubtreeModified)
  	_hackCount: {
  		value: 0
  	},
*/
  	
  	
	////////////////////////////////////////////////////////////////////
	//
    handleEvent: {
        value: function(event){
        	//TODO: Clean up, using for prototyping save
        	this._templateDocument = {};
        	this._templateDocument.html = this.iframe.contentWindow.document;
        	this._templateDocument.head = this.iframe.contentWindow.document.getElementById("userHead");
        	this._templateDocument.body = this.documentRoot = this.iframe.contentWindow.document.getElementById("UserContent");
        	//TODO: Remove, also for prototyping
        	this.application.ninja.documentController._hackRootFlag = true;
        	//
            this.stageBG = this.iframe.contentWindow.document.getElementById("stageBG");
            this.stageBG.onclick = null;
            this._document = this.iframe.contentWindow.document;
            this._window = this.iframe.contentWindow;
            //
            for (var k in this._document.styleSheets) {
            	if (this._document.styleSheets[k].ownerNode && this._document.styleSheets[k].ownerNode.setAttribute) {
            		this._document.styleSheets[k].ownerNode.setAttribute('ninjatemplate', 'true');
            	}
            }
            //
            if(!this.documentRoot.Ninja) this.documentRoot.Ninja = {};
            //Inserting user's document into template
            this._templateDocument.head.innerHTML = this._userDocument.content.head;
            this._templateDocument.body.innerHTML = this._userDocument.content.body;
            
            //Adding a handler for the main user document reel to finish loading
            this._document.body.addEventListener("userTemplateDidLoad",  this.userTemplateDidLoad.bind(this), false);

            // Live node list of the current loaded document
            this._liveNodeList = this.documentRoot.getElementsByTagName('*');

            // TODO Move this to the appropriate location
            var len = this._liveNodeList.length;

            for(var i = 0; i < len; i++) {
                NJUtils.makeModelFromElement(this._liveNodeList[i]);
            }

            /* this.iframe.contentWindow.document.addEventListener('DOMSubtreeModified', function (e) { */ //TODO: Remove events upon loading once

            //TODO: When re-written, the best way to initialize the document is to listen for the DOM tree being modified
            setTimeout(function () {
            	
            	
            	
            	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            	if(this._document.styleSheets.length > 1) {
					//Checking all styleSheets in document
					for (var i in this._document.styleSheets) {
						//If rules are null, assuming cross-origin issue
						if(this._document.styleSheets[i].rules === null) {
							//TODO: Revisit URLs and URI creation logic, very hack right now
							var fileUri, cssUrl, cssData, tag, query;
							if (this._document.styleSheets[i].href.indexOf('js/document/templates/montage-html') !== -1) {
								//Getting the url of the CSS file
								cssUrl = this._document.styleSheets[i].href.split('js/document/templates/montage-html')[1];
								//Creating the URI of the file (this is wrong should not be splitting cssUrl)
								fileUri = this.application.ninja.coreIoApi.cloudData.root+this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]+cssUrl.split('/')[1];
								//Loading the data from the file
								cssData = this.application.ninja.coreIoApi.readFile({uri: fileUri});
								//Creating tag with file content
								tag = this.iframe.contentWindow.document.createElement('style');
								tag.setAttribute('type', 'text/css');
								tag.setAttribute('ninjauri', fileUri);
								tag.setAttribute('ninjafileurl', cssUrl);
								tag.setAttribute('ninjafilename', cssUrl.split('/')[cssUrl.split('/').length-1]);
								tag.innerHTML = cssData.content;
								//Looping through DOM to insert style tag at location of link element
								query = this._templateDocument.html.querySelectorAll(['link']);
								for (var j in query) {
									if (query[j].href === this._document.styleSheets[i].href) {
										//Disabling style sheet to reload via inserting in style tag
										query[j].setAttribute('disabled', 'true');
										//Inserting tag
										this._templateDocument.head.insertBefore(tag, query[j]);
									}
								}
							}
                    	}
					}
					////////////////////////////////////////////////////////////////////////////
					////////////////////////////////////////////////////////////////////////////
					
					//TODO: Check if this is needed
					this._stylesheets = this._document.styleSheets;
					
					////////////////////////////////////////////////////////////////////////////
					////////////////////////////////////////////////////////////////////////////
					
					//TODO Finish this implementation once we start caching Core Elements
					// Assign a model to the UserContent and add the ViewPort reference to it.
					NJUtils.makeElementModel(this.documentRoot, "Stage", "stage");
					//this.documentRoot.elementModel.viewPort = this.iframe.contentWindow.document.getElementById("Viewport");
					NJUtils.makeElementModel(this.stageBG, "Stage", "stage");
					NJUtils.makeElementModel(this.iframe.contentWindow.document.getElementById("Viewport"), "Stage", "stage");
					 
					for(i = 0; i < this._stylesheets.length; i++) {
						if(this._stylesheets[i].ownerNode.id === this._stageStyleSheetId) {
							this.documentRoot.elementModel.defaultRule = this._stylesheets[i];
							break;
						}
					}
					 
					//Temporary create properties for each rule we need to save the index of the rule
					var len = this.documentRoot.elementModel.defaultRule.cssRules.length;
					for(var j = 0; j < len; j++) {
						//console.log(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText);
						if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === "*") {
						
							this.documentRoot.elementModel.transitionStopRule = this.documentRoot.elementModel.defaultRule.cssRules[j];
						
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === "body") {
							
							this.documentRoot.elementModel.body = this.documentRoot.elementModel.defaultRule.cssRules[j];
						
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === "#Viewport") {
						
							this.documentRoot.elementModel.viewPort = this.documentRoot.elementModel.defaultRule.cssRules[j];
							
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === ".stageDimension") {
						
							this.documentRoot.elementModel.stageDimension = this.documentRoot.elementModel.defaultRule.cssRules[j];
							
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === ".stageView") {
							
							this.documentRoot.elementModel.stageView = this.documentRoot.elementModel.defaultRule.cssRules[j];
							
						} else if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === "#stageBG") {
							
							this.documentRoot.elementModel.stageBackground = this.documentRoot.elementModel.defaultRule.cssRules[j];
						}
					}
					
					this.callback(this);
					
				}
				////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			
			
			
			
			
			}.bind(this), 1000);
			
			
            
            
     	}
    },

    ////////////////////////////////////////////////////////////////////

    // Handler for user content main reel. Gets called once the main reel of the template
    // gets deserialized.
    // Setting up the currentSelectedContainer to the document body.
    userTemplateDidLoad: {
        value: function(){
            this.application.ninja.currentSelectedContainer = this.documentRoot;
        }
    },
    
    
    ////////////////////////////////////////////////////////////////////
    _setSWFObjectScript: {
        value: function() {
            if(!this._swfObject) {
                /*
                var swfObj = document.createElement("script");
                swfObj.type = "text/javascript";
                swfObj.src = "../../user-document-templates/external-libs/swf-object/swfobject.js";
                swfObj.id = "swfObject";
                var head= this._document.getElementsByTagName('head')[0];
                head.appendChild(swfObj);
                this._swfObject = true;
                */
            }
        }
    },
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////
	//
    livePreview: {
    	enumerable: false,
    	value: function () {
    		//TODO: Add logic to handle save before preview
    		this.saveAll();
    		//Launching 'blank' tab for testing movie
    		chrome.tabs.create({url: this.application.ninja.coreIoApi.rootUrl+this.application.ninja.documentController._activeDocument.uri.split(this.application.ninja.coreIoApi.cloudData.root)[1]});		
    	}
    },
	////////////////////////////////////////////////////////////////////
	//
	save: {
		enumerable: false,
    	value: function () {
    		//TODO: Add code view logic and also styles for HTML
    		if (this.currentView === 'design') {
    			var styles = [];
    			for (var k in this._document.styleSheets) {
    				if (this._document.styleSheets[k].ownerNode && this._document.styleSheets[k].ownerNode.getAttribute) {
            			if (this._document.styleSheets[k].ownerNode.getAttribute('ninjatemplate') === null) {
            				styles.push(this._document.styleSheets[k]);
            			}
            		}
            	}
    			return {mode: 'html', document: this._userDocument, webgl: this.glData, styles: styles, head: this._templateDocument.head.innerHTML, body: this._templateDocument.body.innerHTML};
    		} else if (this.currentView === "code"){
    			//TODO: Would this get call when we are in code of HTML?
    		} else {
    			//Error
    		}
    	}
	},
	////////////////////////////////////////////////////////////////////
	//
	saveAll: {
		enumerable: false,
    	value: function () {
    		//TODO: Add code view logic and also styles for HTML
    		if (this.currentView === 'design') {
    			var css = [];
    			for (var k in this._document.styleSheets) {
    				if (this._document.styleSheets[k].ownerNode && this._document.styleSheets[k].ownerNode.getAttribute) {
            			if (this._document.styleSheets[k].ownerNode.getAttribute('ninjatemplate') === null) {
            				css.push(this._document.styleSheets[k]);
            			}
            		}
            	}
    			return {mode: 'html', document: this._userDocument, webgl: this.glData, css: css, head: this._templateDocument.head.innerHTML, body: this._templateDocument.body.innerHTML};
    		} else if (this.currentView === "code"){
    			//TODO: Would this get call when we are in code of HTML?
    		} else {
    			//Error
    		}
    	}
	}
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});