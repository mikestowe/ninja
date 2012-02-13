/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    baseDocumentModule = require("js/io/document/base-document"),
    NJUtils = require("js/lib/NJUtils").NJUtils;

var HTMLDocument = exports.HTMLDocument = Montage.create(baseDocumentModule.BaseDocument, {
    // PRIVATE MEMBERS
    _selectionExclude: { value: null, enumerable: false },
    _htmlTemplateUrl: { value: "user-document-templates/montage-application-cloud/index.html", enumerable: false},
    _iframe: { value: null, enumerable: false },
    _server: { value: null, enumerable: false },
    _templateDocument: { value: null, enumerable: false },
    _selectionModel: { value: [], enumerable: false },
    _undoModel: { value: { "queue" : [], "position" : 0 }, enumerable: false},

    _document: { value: null, enumerable: false },
    _documentRoot: { value: null, enumerable: false },
    _stageBG: { value: null, enumerable: false },
    _window: { value: null, enumerable: false },
    _styles: { value: null, enumerable: false },
    _stylesheets: { value: null, enumerable: false },
    _stageStyleSheetId : { value: 'nj-stage-stylesheet', enumerable: false },
    _userDocument: { value: null, enumerable: false },
    _htmlSource: {value: "<html></html>", enumerable: false},
    _glData: {value: null, enumerable: false },

    _elementCounter: { value: 1, enumerable: false },
    _snapping : { value: true, enumerable: false },
    _layoutMode: { value: "all", enumerable: false },
    _draw3DGrid: { value: false, writable: true },
    _swfObject: { value: false, enumerable: false },

    _zoomFactor: { value: 100, enumerable: false },

    // PUBLIC MEMBERS
    cssLoadInterval: { value: null, enumerable: false },

    _savedLeftScroll: {value:null},
    _savedTopScroll: {value:null},

    _codeViewDocument:{
        writable: true,
        enumerable: true,
        value:null
    },

    /*
     * PUBLIC API
     */

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

    _userComponentSet: {
        value: {},
        writable: true,
        enumerable:true
    },

//    userComponentSet:{
//        enumerable: true,
//        get: function() {
//            return this._userComponentSet;
//        },
//        set: function(value) {
//            this._userComponentSet = value;
//            this._drawUserComponentsOnOpen();
//        }
//    },
//
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
			var elt = this.iframe;
			var elt = this.iframe.contentWindow.document.getElementById("UserContent");
			this._glData = null;
			if (elt)
			{
				this._glData = new Array();
				this.collectGLData( elt,  this._glData );
			}
				
			return this._glData
		},

        set: function(value)
		{
			var nWorlds = value.length;
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
						var canvas = this.iframe.contentWindow.document.getElementById( id );
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

								var world = new GLWorld( canvas );
								canvas.elementModel.shapeModel.GLWorld = world;
								world.import( importStr );
							}
						}
					}
				}
			}
		}
    },

    zoomFactor: {
        get: function() { return this._zoomFactor; },
        set: function(value) { this._zoomFactor = value; }
    },

    //****************************************//
    // PUBLIC METHODS
    
    
    ////////////////////////////////////////////////////////////////////
	//
	initialize: {
		value: function(file, uuid, iframe, callback) {
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



    AppendElement: {
        value: function(element, parent) {
            this.dirtyFlag = true;
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
// Private
    _loadDocument: {
        value: function(uri) {
            // Load the document into the Iframe
            this.iframe.src = uri;
            this.iframe.addEventListener("load", this, true);
        }
    },
*/
	
	
	
	////////////////////////////////////////////////////////////////////
	//
    handleEvent: {
        value: function(event){
        	//TODO: Clean up, using for prototyping save
        	this._templateDocument = {};
        	this._templateDocument.head = this.iframe.contentWindow.document.getElementById("userHead");;
        	this._templateDocument.body = this.iframe.contentWindow.document.getElementById("UserContent");;
        	//
        	this.documentRoot = this.iframe.contentWindow.document.getElementById("UserContent");
            this.stageBG = this.iframe.contentWindow.document.getElementById("stageBG");
            this.stageBG.onclick = null;
            this._document = this.iframe.contentWindow.document;
            this._window = this.iframe.contentWindow;
            //
            if(!this.documentRoot.Ninja) this.documentRoot.Ninja = {};
            //
            
            this.documentRoot.innerHTML = this._userDocument.content.body;
            this.iframe.contentWindow.document.getElementById("userHead").innerHTML = this._userDocument.content.head;
            
          
            //TODO: Look at code below and clean up
            	
            	
            

                this.cssLoadInterval = setInterval(function() {
                    if(this._document.styleSheets.length > 1) {
                        clearInterval(this.cssLoadInterval);
                        this._styles = this._document.styleSheets[this._document.styleSheets.length - 1];
                        this._stylesheets = this._document.styleSheets; // Entire stlyesheets array

                        this.callback(this);
                    }
                }.bind(this), 50);
                
                // TODO - Not sure where this goes
                this._userComponentSet = {};

            
                this._styles = this._document.styleSheets[this._document.styleSheets.length - 1];
                this._stylesheets = this._document.styleSheets; // Entire stlyesheets array

                /* TODO Finish this implementation once we start caching Core Elements */
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

                // Temporary create properties for each rule we need to save the index of the rule.
                var len = this.documentRoot.elementModel.defaultRule.cssRules.length;
                for(var j = 0; j < len; j++) {
//                    console.log(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText);
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

                    }
                }

                this.callback(this);
            
        }
    },

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

    /**
     * public method
     *
     */
	////////////////////////////////////////////////////////////////////
	//
	save: {
		enumerable: false,
    	value: function () {
    		//TODO: Add code view logic and also styles for HTML
    		if (this.currentView === 'design') {
    			return {mode: 'html', document: this._userDocument, style: this._styles, head: this._templateDocument.head.innerHTML, body: this._templateDocument.body.innerHTML};
    		} else if(this.currentView === "code"){
    			//TODO: Would this get call when we are in code of HTML?
    		}
    	}
	}
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
	
	
    /*
save:{
        value:function(){
            try{
                if(this.currentView === "design"){
                    //generate html and save
                }else if((this.currentView === "code") && (this.codeViewDocument !== null)){
                    this.codeViewDocument.editor.save();
                    //persist to filesystem
                }
                this.dirtyFlag=false;
            }catch(e){
                console.log("Error while saving "+this.uri);
                console.log(e.stack);
            }
        }
    }
*/

});