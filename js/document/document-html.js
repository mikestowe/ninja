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
        value: ["HTML", "BODY", "NINJA-CONTENT"] //TODO: Update to correct list
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
        value:function(file, context, callback, view, template) {
        	//Storing callback data for loaded dispatch
        	this.loaded.callback = callback;
        	this.loaded.context = context;
            //Creating instance of HTML Document Model
            this.model = Montage.create(HtmlDocumentModel,{
            	file: {value: file},
            	fileTemplate: {value: template},
            	parentContainer: {value: document.getElementById("iframeContainer")}, //Saving reference to parent container of all views (should be changed to buckets approach
            	views: {value: {'design': DesignDocumentView.create(), 'code': null}} //TODO: Add code view logic
            });
            //Initiliazing views and hiding
           	if (this.model.views.design.initialize(this.model.parentContainer)) {
           		//Hiding iFrame, just initiliazing
           		this.model.views.design.hide();
           	} else {
           		//ERROR: Design View not initilized
           	}
            //
            if (view === 'design') {
            	//TODO: Remove reference and use as part of model
            	this.currentView = 'design';
            	//Setting current view object to design
            	this.model.currentView = this.model.views.design;
            	//Showing design iFrame
            	this.model.views.design.show();
            	this.model.views.design.iframe.style.opacity = 0;
            	this.model.views.design.content = this.model.file.content;
            	//TODO: Improve reference
            	this.model.views.design.model = this.model;
            	//
            	//TODO: Clean up
            	this.model.views.design.render(function () {
            		//TODO: Identify and remove usage of '_document'
            		this._document = this.model.views.design.document;
            		//TODO: Remove usage, seems as not needed
    				if (template && template.type === 'banner') {
    					this.documentRoot = this.model.views.design.document.body.getElementsByTagName('ninja-content')[0];
    				} else {
    					this.documentRoot = this.model.views.design.document.body;
    				}
            		//TODO: Why is this needed?
            		this._liveNodeList = this.documentRoot.getElementsByTagName('*');
            		//Initiliazing document model
            		document.application.njUtils.makeElementModel(this.documentRoot, "Body", "body");
            		//Adding observer to know when template is ready
            		this._observer = new WebKitMutationObserver(this.handleTemplateReady.bind(this));
        			this._observer.observe(this.model.views.design.document.head, {childList: true});
            	}.bind(this), template);
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
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//
	closeDocument: {
		value: function (context, callback) {
			//Closing document and getting outcome
			var closed = this.model.close(null);
			//Making callback if specified
			if (callback) callback.call(context, this);
		}
	},
    ////////////////////////////////////////////////////////////////////
	//
    serializeDocument: {
    	value: function () {
            // There are not needed for now since we cannot change them
            //this.gridHorizontalSpacing = this.application.ninja.stage.drawUtils.gridHorizontalSpacing;
            //this.gridVerticalSpacing = this.application.ninja.stage.drawUtils.gridVerticalSpacing;

            // Serialize the current scroll position
            //TODO: Move these properties to the design view class
            this.model.scrollLeft = this.application.ninja.stage._scrollLeft;
            this.model.scrollTop = this.application.ninja.stage._scrollTop;
            this.model.userContentLeft = this.application.ninja.stage._userContentLeft;
            this.model.userContentTop = this.application.ninja.stage._userContentTop;


            // Serialize the selection
            //TODO: Move this property to the design view class
            this.model.selection = this.application.ninja.selectedElements.slice(0);
            this.draw3DGrid = this.application.ninja.appModel.show3dGrid;

            // Serialize the undo
            // TODO: Save the montage undo queue

            // Pause the videos
            //TODO: Move these to be handled on the show/hide methods in the view
            this.model.views.design.pauseVideos();
    	}
    },
    ////////////////////////////////////////////////////////////////////
	//
    deserializeDocument: {
    	value: function () {
            // There are not needed for now since we cannot change them
            //this.application.ninja.stage.drawUtils.gridHorizontalSpacing = this.gridHorizontalSpacing;
            //this.application.ninja.stage.drawUtils.gridVerticalSpacing = this.gridVerticalSpacing;

            // Deserialize the current scroll position
             //TODO: Move these properties to the design view class
            this.application.ninja.stage._scrollLeft = this.model.scrollLeft;
            this.application.ninja.stage._scrollTop = this.model.scrollTop;
            this.application.ninja.stage._userContentLeft = this.model.userContentLeft;
            this.application.ninja.stage._userContentTop = this.model.userContentTop;
			
			//TODO: Move this property to the design view class
            this.application.ninja.selectedElements = this.model.selection.slice(0);

            this.application.ninja.appModel.show3dGrid = this.draw3DGrid;

            // Serialize the undo
            // TODO: Save the montage undo queue
			
			//TODO: Move this to the document controller
            this.model.isActive = true;
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////