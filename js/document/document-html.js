/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	        require("montage/core/core").Montage,
	Component =         require("montage/ui/component").Component,
    HtmlDocumentModel = require("js/document/models/html").HtmlDocumentModel,
    DesignDocumentView = require("js/document/views/design").DesignDocumentView;
////////////////////////////////////////////////////////////////////////
//	
exports.HtmlDocument = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
	//
    model: {
        value: null
    },
	////////////////////////////////////////////////////////////////////
	//
    loaded: {
        value: {callback: null, context: null}
    },
    ////////////////////////////////////////////////////////////////////
	//
    _observer: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    _document: {
        value: null //TODO: Figure out if this will be needed, probably not
    },
	////////////////////////////////////////////////////////////////////
	//
    exclusionList: {
        value: ["HTML", "BODY"] //TODO: Update to correct list
    },
	////////////////////////////////////////////////////////////////////
	//
    uuid: {
        get: function() {
            return this._uuid;
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    inExclusion: {
        value: function(element) {
            if(this.exclusionList.indexOf(element.nodeName) === -1) {
                return -1;
            }
            return 1;
        }
    },
	////////////////////////////////////////////////////////////////////
	//
    init: {
        value:function(file, context, callback, view) {
        	//Storing callback data for loaded dispatch
        	this.loaded.callback = callback;
        	this.loaded.context = context;
            //Creating instance of HTML Document Model
            this.model = Montage.create(HtmlDocumentModel,{
            	file: {value: file},
            	views: {value: {'design': DesignDocumentView.create(), 'code': null}} //TODO: Add code view logic
            });
            //Initiliazing views and hiding
           	if (this.model.views.design.initialize(document.getElementById("iframeContainer"))) {
           		//Hiding iFrame, just initiliazing
           		this.model.views.design.hide();
           	} else {
           		//ERROR: Design View not initilized
           	}
            //
            if (view === 'design') {
            	//Showing design iFrame
            	this.model.views.design.show();
            	this.model.views.design.iframe.style.opacity = 0;
            	this.model.views.design.content = this.model.file.content;
            	//TODO: Clean up
            	this.model.views.design.render(function () {
            		//TODO: Identify and remove usage of '_document'
            		this._document = this.model.views.design.document;
    				//TODO: Check for needed
            		this.documentRoot = this.model.views.design.document.body;
            		//TODO: Why is this needed?
            		this._liveNodeList = this.documentRoot.getElementsByTagName('*');
            		//Initiliazing document model
            		document.application.njUtils.makeElementModel(this.documentRoot, "Body", "body");
            		//Adding observer to know when template is ready
            		this._observer = new WebKitMutationObserver(this.handleTemplateReady.bind(this));
        			this._observer.observe(this.model.views.design.document.head, {childList: true});
            	}.bind(this));
            } else {
            	//TODO: Identify default view (probably code)
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
    handleTemplateReady: {
    	value: function (e) {
    		//Removing observer, only needed on initial load
    		this._observer.disconnect();
    		this._observer = null;
    		//Making callback after view is loaded
    	    this.loaded.callback.call(this.loaded.context, this);
    	    //Setting opacity to be viewable after load
		   	this.model.views.design.iframe.style.opacity = 1;





            this.application.ninja.appModel.show3dGrid = true;
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////