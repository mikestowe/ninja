/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	        require("montage/core/core").Montage,
	Component =         require("montage/ui/component").Component;
    HtmlDocumentModel = require("js/document/models/html").HtmlDocumentModel;
////////////////////////////////////////////////////////////////////////
//	
exports.HtmlDocument = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
		enumerable: false,
        value: false
    },

    model: {
        value: null
    },

    loadDelegate: {
        value: null
    },

    delegateContext: {
        value: null
    },

    exclusionList: {
        value: ["HTML", "BODY"]
    },

    // Getters for the model.
    // TODO: Change how these properties are accessed through Ninja
    name: {
        get: function() {
            return this.model._name;
        },
        set: function(value) {
            this.model._name = value;
        }
    },

    isActive: {
        get: function() {
            return this.model._isActive;
        },
        set: function(value) {
            this.model._isActive = value;
        }
    },

    needsSave: {
        get: function() {
            return this.model._needsSave;
        },
        set: function(value) {
            this.model._needsSave = value;
        }
    },

    // View Properties
    // TODO: Move those into a view object - for now dump it here
    iframe: {
        value: null
    },

    uuid: {
        get: function() {
            return this._uuid;
        }
    },

    currentView: {
        value: "design"
    },
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
    init: {
        value:function(file, context, callback) {
            this.model = Montage.create(HtmlDocumentModel, {
                file: {
                    value: file
                }
            });

            this.name = file.name;

            // this.init(file.name, file.uri, file.extension, iframe, uuid, callback);


            this.iframe = this.createView();

            //this.selectionExclude = ["HTML", "BODY", "Viewport", "UserContent", "stageBG"];
            //this.currentView = "design";
            //

            this.delegateContext = context;
            this.loadDelegate = callback;
        }
    },

    // Create View
    // Move this into a base view object
    createView: {
        value: function() {
            var ifr = document.createElement("iframe");
            ifr.id = "document_" + this._uuid;


            ifr.style.border = "none";
            ifr.style.background = "#FFF";
            ifr.style.height = "100%";
            ifr.style.width = "100%";

            // TODO: Reable opacity to display only when done loading
//            ifr.style.opacity = 0;

            ifr.src = "js/document/templates/montage-web/index.html";
            ifr.addEventListener("load", this.handleWebTemplateLoad.bind(this), true);

            return document.getElementById("iframeContainer").appendChild(ifr);
        }
    },

    handleWebTemplateLoad: {
        value: function(event) {
            //TODO: Remove, also for prototyping
            this.application.ninja.documentController._hackRootFlag = true;


            //TODO: Clean up, using for prototyping save
//            this._templateDocument = {};
//            this._templateDocument.html = this.iframe.contentWindow.document;
//            this._templateDocument.body =

            this._window = this.iframe.contentWindow;
            this._document = this.iframe.contentWindow.document;
            this.documentRoot = this.iframe.contentWindow.document.body;

            for (var k in this._document.styleSheets) {
                if (this._document.styleSheets[k].ownerNode && this._document.styleSheets[k].ownerNode.setAttribute) {
                    this._document.styleSheets[k].ownerNode.setAttribute('data-ninja-template', 'true');
                }
            }

            // TODO: We don't need this anymore -> need to setup the main container still
            //Adding a handler for the main user document reel to finish loading
//            this.documentRoot.addEventListener("userTemplateDidLoad",  this.userTemplateDidLoad.bind(this), false);

            // Live node list of the current loaded document
            this._liveNodeList = this.documentRoot.getElementsByTagName('*');

            // TODO Move this to the appropriate location
            /*
            var len = this._liveNodeList.length;

            for(var i = 0; i < len; i++) {
                NJUtils.makeModelFromElement(this._liveNodeList[i]);
            }
            */

            setTimeout(function () {

                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                if(this._document.styleSheets.length) {
                    //Checking all styleSheets in document
                    for (var i in this._document.styleSheets) {
                        //If rules are null, assuming cross-origin issue
                        if(this._document.styleSheets[i].rules === null) {
                            //TODO: Revisit URLs and URI creation logic, very hack right now
                            var fileUri, cssUrl, cssData, query, prefixUrl, fileCouldDirUrl, docRootUrl;
                            //
                            docRootUrl = this.application.ninja.coreIoApi.rootUrl+escape((this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]).replace(/\/\//gi, '/'));
                            //TODO: Parse out relative URLs and map them to absolute
                            if (this._document.styleSheets[i].href.indexOf(this.application.ninja.coreIoApi.rootUrl) !== -1) {
                                //
                                cssUrl = this._document.styleSheets[i].href.split(this.application.ninja.coreIoApi.rootUrl)[1];
                                fileUri = this.application.ninja.coreIoApi.cloudData.root+cssUrl;
                                //TODO: Add error handling for reading file
                                cssData = this.application.ninja.coreIoApi.readFile({uri: fileUri});
                                //
                                var tag = this.iframe.contentWindow.document.createElement('style');
                                tag.setAttribute('type', 'text/css');
                                tag.setAttribute('data-ninja-uri', fileUri);
                                tag.setAttribute('data-ninja-file-url', cssUrl);
                                tag.setAttribute('data-ninja-file-read-only', JSON.parse(this.application.ninja.coreIoApi.isFileWritable({uri: fileUri}).content).readOnly);
                                tag.setAttribute('data-ninja-file-name', cssUrl.split('/')[cssUrl.split('/').length-1]);
                                //Copying attributes to maintain same properties as the <link>
                                for (var n in this._document.styleSheets[i].ownerNode.attributes) {
                                    if (this._document.styleSheets[i].ownerNode.attributes[n].value && this._document.styleSheets[i].ownerNode.attributes[n].name !== 'disabled' && this._document.styleSheets[i].ownerNode.attributes[n].name !== 'disabled') {
                                        if (this._document.styleSheets[i].ownerNode.attributes[n].value.indexOf(docRootUrl) !== -1) {
                                            tag.setAttribute(this._document.styleSheets[i].ownerNode.attributes[n].name, this._document.styleSheets[i].ownerNode.attributes[n].value.split(docRootUrl)[1]);
                                        } else {
                                            tag.setAttribute(this._document.styleSheets[i].ownerNode.attributes[n].name, this._document.styleSheets[i].ownerNode.attributes[n].value);
                                        }
                                    }
                                }
                                //
                                fileCouldDirUrl = this._document.styleSheets[i].href.split(this._document.styleSheets[i].href.split('/')[this._document.styleSheets[i].href.split('/').length-1])[0];

                                //TODO: Make public version of this.application.ninja.ioMediator.getNinjaPropUrlRedirect with dynamic ROOT
                                tag.innerHTML = cssData.content.replace(/url\(()(.+?)\1\)/g, detectUrl);

                                function detectUrl (prop) {
                                    return prop.replace(/[^()\\""\\'']+/g, prefixUrl);;
                                }

                                function prefixUrl (url) {
                                    if (url !== 'url') {
                                        if (!url.match(/(\b(?:(?:https?|ftp|file|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gi)) {
                                            url = fileCouldDirUrl+url;
                                        }
                                    }
                                    return url;
                                }

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
                                //None local stylesheet, probably on a CDN (locked)
                                var tag = this.iframe.contentWindow.document.createElement('style');
                                tag.setAttribute('type', 'text/css');
                                tag.setAttribute('data-ninja-external-url', this._document.styleSheets[i].href);
                                tag.setAttribute('data-ninja-file-read-only', "true");
                                tag.setAttribute('data-ninja-file-name', this._document.styleSheets[i].href.split('/')[this._document.styleSheets[i].href.split('/').length-1]);
                                //Copying attributes to maintain same properties as the <link>
                                for (var n in this._document.styleSheets[i].ownerNode.attributes) {
                                    if (this._document.styleSheets[i].ownerNode.attributes[n].value && this._document.styleSheets[i].ownerNode.attributes[n].name !== 'disabled' && this._document.styleSheets[i].ownerNode.attributes[n].name !== 'disabled') {
                                        if (this._document.styleSheets[i].ownerNode.attributes[n].value.indexOf(docRootUrl) !== -1) {
                                            tag.setAttribute(this._document.styleSheets[i].ownerNode.attributes[n].name, this._document.styleSheets[i].ownerNode.attributes[n].value.split(docRootUrl)[1]);
                                        } else {
                                            tag.setAttribute(this._document.styleSheets[i].ownerNode.attributes[n].name, this._document.styleSheets[i].ownerNode.attributes[n].value);
                                        }
                                    }
                                }
                                /*

                                //TODO: Figure out cross-domain XHR issue, might need cloud to handle
                                var xhr = new XMLHttpRequest();
                                xhr.open("GET", this._document.styleSheets[i].href, true);
                                xhr.send();
                                //
                                if (xhr.readyState === 4) {
                                    console.log(xhr);
                                }
                                //tag.innerHTML = xhr.responseText //xhr.response;
                                */
                                //Temp rule so it's registered in the array
                                tag.innerHTML = 'noRULEjustHACK{background: #000}';
                                //Disabling external style sheets
                                query = this._templateDocument.html.querySelectorAll(['link']);
                                for (var k in query) {
                                    if (query[k].href === this._document.styleSheets[i].href) {

                                        //TODO: Removed the temp insertion of the stylesheet
                                        //because it wasn't the proper way to do it
                                        //need to be handled via XHR with proxy in Cloud Sim

                                        //Disabling style sheet to reload via inserting in style tag
                                        //var tempCSS = query[k].cloneNode(true);
                                        //tempCSS.setAttribute('data-ninja-template', 'true');
                                        query[k].setAttribute('disabled', 'true');
                                        //this.iframe.contentWindow.document.head.appendChild(tempCSS);
                                        //Inserting tag
                                        this._templateDocument.head.insertBefore(tag, query[k]);
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
                    document.application.njUtils.makeElementModel(this.documentRoot, "Body", "body");
//                    this.documentRoot.elementModel.props3D.init(this.documentRoot, true);

                    for(i = 0; i < this._stylesheets.length; i++) {
                        if(this._stylesheets[i].ownerNode.id === "nj-stage-stylesheet") {
                            this.documentRoot.elementModel.defaultRule = this._stylesheets[i];
                            break;
                        }
                    }

                    //Temporary create properties for each rule we need to save the index of the rule
                    var len = this.documentRoot.elementModel.defaultRule.cssRules.length;
                    for(var j = 0; j < len; j++) {
                        if(this.documentRoot.elementModel.defaultRule.cssRules[j].selectorText === "*") {
                            this.documentRoot.elementModel.transitionStopRule = this.documentRoot.elementModel.defaultRule.cssRules[j];
                        }
                    }


                    this.loadDelegate.call(this.delegateContext, this);

                    //Setting webGL data
                    /*
                    if (this._templateDocument.webgl) {
                        this.glData = this._templateDocument.webgl;
                    }
                    */
                }
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





            }.bind(this), 1000);
        }
    },

    GetElementFromPoint: {
        value: function(x, y) {
            return this._window.getElement(x,y);
        }
    },

    inExclusion: {
        value: function(element) {
            if(this.exclusionList.indexOf(element.nodeName) === -1) {
                return -1;
            }

            return 1;

        }
    },

    // Handler for user content main reel. Gets called once the main reel of the template
    // gets deserialized.
    // Setting up the currentSelectedContainer to the document body.
    userTemplateDidLoad: {
        value: function(){
//            this.application.ninja.currentSelectedContainer = this.documentRoot;
        }
    }
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////