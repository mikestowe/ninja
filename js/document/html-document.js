/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    TextDocument =	require("js/document/text-document").TextDocument,
    NJUtils = 		require("js/lib/NJUtils").NJUtils,
	CanvasDataManager =	require("js/lib/rdge/runtime/CanvasDataManager").CanvasDataManager,
	GLWorld =			require("js/lib/drawing/world").World;
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


    //drawUtils state
    _gridHorizontalSpacing: {value:0},
    _gridVerticalSpacing: {value:0},
    //end - drawUtils state


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

    gridHorizontalSpacing:{
        get: function() { return this._gridHorizontalSpacing; },
        set: function(value) { this._gridHorizontalSpacing = value}
    },

    gridVerticalSpacing:{
        get: function() { return this._gridVerticalSpacing; },
        set: function(value) { this._gridVerticalSpacing = value}
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
				
			return this._glData;
		},

        set: function(value)
		{
			var elt = this.documentRoot;
			if (elt)
			{
// FOR JOSE:   The following commented out lines are what the runtime
// version should execute.
//				var loadForRuntime = true;
//				if (loadForRuntime)
//				{
//					var cdm = new CanvasDataManager();
//					cdm.loadGLData(elt,  value,  NJUtils);
//				}
//				else
				{
					var nWorlds= value.length;
					for (var i=0;  i<nWorlds;  i++)
					{
						var importStr = value[i];
						var startIndex = importStr.indexOf( "id: " );
						if (startIndex >= 0)
						{
							var endIndex = importStr.indexOf( "\n", startIndex );
							if (endIndex > 0)
							{
								var id = importStr.substring( startIndex+4, endIndex );
								if (id)
								{
									var canvas = this.findCanvasWithID( id, elt );
									if (canvas)
									{
										if (!canvas.elementModel)
										{
											NJUtils.makeElementModel(canvas, "Canvas", "shape", true);
										}
								
										if (canvas.elementModel)
										{
											if (canvas.elementModel.shapeModel.GLWorld)
												canvas.elementModel.shapeModel.GLWorld.clearTree();

											var index = importStr.indexOf( "webGL: " );
											var useWebGL = (index >= 0)
											var world = new GLWorld( canvas, useWebGL );
											world.import( importStr );

											this.buildShapeModel( canvas.elementModel, world );
										}
									}
								}
							}
						}
					}
				}
			}
		}
    },

	buildShapeModel:
	{
		value: function( elementModel, world )
		{
            var shapeModel = elementModel.shapeModel;
			shapeModel.shapeCount	= 1;	// for now...
			shapeModel.useWebGl		= world._useWebGL;
			shapeModel.GLWorld		= world;
			var root = world.getGeomRoot();
			if (root)
			{
				shapeModel.GLGeomObj			= root;
				shapeModel.strokeSize			= root._strokeWidth;
				shapeModel.stroke				= root._strokeColor.slice();
				shapeModel.strokeMaterial		= root._strokeMaterial.dup();
				shapeModel.strokeStyle			= "solid";
				//shapeModel.strokeStyleIndex
				//shapeModel.border
				//shapeModel.background
				switch (root.geomType())
				{
					case root.GEOM_TYPE_RECTANGLE:
                        elementModel.selection = "Rectangle";
                        elementModel.pi = "RectanglePi";
                        shapeModel.fill					= root._fillColor.slice();
                        shapeModel.fillMaterial			= root._fillMaterial.dup();
						shapeModel.tlRadius = root._tlRadius;
						shapeModel.trRadius = root._trRadius;
						shapeModel.blRadius = root._blRadius;
						shapeModel.brRadius = root._brRadius;
						break;

					case root.GEOM_TYPE_CIRCLE:
                        elementModel.selection = "Oval";
                        elementModel.pi = "OvalPi";
                        shapeModel.fill					= root._fillColor.slice();
                        shapeModel.fillMaterial			= root._fillMaterial.dup();
						shapeModel.innerRadius = root._innerRadius;
						break;

					case root.GEOM_TYPE_LINE:
                        elementModel.selection = "Line";
                        elementModel.pi = "LinePi";
						shapeModel.slope = root._slope;
						break;

					default:
						console.log( "geometry type not supported for file I/O, " + root.geomType());
						break;
				}
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

    /**
     * search the DOM tree to find a canvas with the given id
     */
	findCanvasWithID:  {
		value: function( id,  elt )  {
			var cid = elt.getAttribute( "data-RDGE-id" );
			if (cid == id)  return elt;

			if (elt.children)
			{
				var nKids = elt.children.length;
				for (var i=0;  i<nKids;  i++)
				{
					var child = elt.children[i];
					var foundElt = this.findCanvasWithID( id, child );
					if (foundElt)  return foundElt;
				}
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
            		this._document.styleSheets[k].ownerNode.setAttribute('data-ninja-template', 'true');
            	}
            }
            //
            if(!this.documentRoot.Ninja) this.documentRoot.Ninja = {};
            //Inserting user's document into template
            this._templateDocument.head.innerHTML = this._userDocument.content.head;
            this._templateDocument.body.innerHTML = this._userDocument.content.body;
            //TODO: Use querySelectorAll
            var scripttags = this._templateDocument.html.getElementsByTagName('script'), webgldata;
            //
            for (var w in scripttags) {
            	if (scripttags[w].getAttribute) {
            		if (scripttags[w].getAttribute('data-ninja-webgl') !== null) {
            			//TODO: Add logic to handle more than one data tag
            			webgldata = JSON.parse((scripttags[w].innerHTML.replace("(", "")).replace(")", ""));
            		}
            	}
            }
            //
            if (webgldata) {
            	for (var n=0; webgldata.data[n]; n++) {
            		webgldata.data[n] = unescape(webgldata.data[n]);
            	}
            	this._templateDocument.webgl = webgldata.data;
            }
            
            
            
            
            //Temporarily checking for disabled special case
            var stags = this.iframe.contentWindow.document.getElementsByTagName('style'),
            	ltags = this.iframe.contentWindow.document.getElementsByTagName('link');
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
								tag.setAttribute('data-ninja-uri', fileUri);
								tag.setAttribute('data-ninja-file-url', cssUrl);
								tag.setAttribute('data-ninja-file-read-only', JSON.parse(this.application.ninja.coreIoApi.isFileWritable({uri: fileUri}).content).readOnly);
								tag.setAttribute('data-ninja-file-name', cssUrl.split('/')[cssUrl.split('/').length-1]);
								//Copying attributes to maintain same properties as the <link>
								for (var n in this._document.styleSheets[i].ownerNode.attributes) {
									if (this._document.styleSheets[i].ownerNode.attributes[n].value && this._document.styleSheets[i].ownerNode.attributes[n].name !== 'disabled') {
										tag.setAttribute(this._document.styleSheets[i].ownerNode.attributes[n].name, this._document.styleSheets[i].ownerNode.attributes[n].value);
									}
								}
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
							} else {
								console.log('ERROR: Cross-Domain-Stylesheet detected, unable to load in Ninja');
								/*
//None local stylesheet, probably on a CDN (locked)
								tag = this.iframe.contentWindow.document.createElement('style');
								tag.setAttribute('type', 'text/css');
								tag.setAttribute('data-ninja-external-url', this._document.styleSheets[i].href);
								tag.setAttribute('data-ninja-file-read-only', "true");
								tag.setAttribute('data-ninja-file-name', this._document.styleSheets[i].href.split('/')[this._document.styleSheets[i].href.split('/').length-1]);
								
								//TODO: Figure out cross-domain XHR issue, might need cloud to handle
								var xhr = new XMLHttpRequest();
                    			xhr.open("GET", this._document.styleSheets[i].href, true);
                    			xhr.send();
                    			//
                    			if (xhr.readyState === 4) {
                        			console.log(xhr);
                    			}
                    			//tag.innerHTML = xhr.responseText //xhr.response;
								
								//Currently no external styles will load if unable to load via XHR request
								
								//Disabling external style sheets
								query = this._templateDocument.html.querySelectorAll(['link']);
								for (var j in query) {
									if (query[j].href === this._document.styleSheets[i].href) {
										//Disabling style sheet to reload via inserting in style tag
										query[j].setAttribute('disabled', 'true');
										//Inserting tag
										this._templateDocument.head.insertBefore(tag, query[j]);
									}
								}
*/
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
					
					//Setting webGL data
					if (this._templateDocument.webgl) {
						this.glData = this._templateDocument.webgl;
					}
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
    		this.application.ninja.documentController.handleExecuteSaveAll(null);
    		//Launching 'blank' tab for testing movie
    		window.open(this.application.ninja.coreIoApi.rootUrl+this.application.ninja.documentController._activeDocument.uri.split(this.application.ninja.coreIoApi.cloudData.root)[1]);
    		//chrome.tabs.create({url: this.application.ninja.coreIoApi.rootUrl+this.application.ninja.documentController._activeDocument.uri.split(this.application.ninja.coreIoApi.cloudData.root)[1]});		
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
	},
	////////////////////////////////////////////////////////////////////
    saveAppState:{
        enumerable: false,
        value: function () {

            this.savedLeftScroll = this.application.ninja.stage._iframeContainer.scrollLeft;
            this.savedTopScroll = this.application.ninja.stage._iframeContainer.scrollTop;

            this.gridHorizontalSpacing = this.application.ninja.stage.drawUtils.gridHorizontalSpacing;
            this.gridVerticalSpacing = this.application.ninja.stage.drawUtils.gridVerticalSpacing;

            if(typeof this.application.ninja.selectedElements !== 'undefined'){
                this.selectionModel = this.application.ninja.selectedElements.slice(0);
            }

            this.draw3DGrid = this.application.ninja.appModel.show3dGrid;
        }
    },

    ////////////////////////////////////////////////////////////////////
    restoreAppState:{
        enumerable: false,
        value: function () {
            this.application.ninja.stage.drawUtils.gridHorizontalSpacing = this.gridHorizontalSpacing;
            this.application.ninja.stage.drawUtils.gridVerticalSpacing = this.gridVerticalSpacing;

            if((typeof this.selectionModel !== 'undefined') && (this.selectionModel !== null)){
                this.application.ninja.selectedElements = this.selectionModel.slice(0);
            }

            if((this.savedLeftScroll!== null) && (this.savedTopScroll !== null)){
                this.application.ninja.stage._iframeContainer.scrollLeft = this.savedLeftScroll;
                this.application.ninja.stage._scrollLeft = this.savedLeftScroll;
                this.application.ninja.stage._iframeContainer.scrollTop = this.savedTopScroll;
                this.application.ninja.stage._scrollLeft = this.savedTopScroll;
            }
            this.application.ninja.stage.handleScroll();

            this.application.ninja.appModel.show3dGrid = this.draw3DGrid;
        }
    }
	////////////////////////////////////////////////////////////////////
});