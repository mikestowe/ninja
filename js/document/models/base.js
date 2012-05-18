/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//	
exports.BaseDocumentModel = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
	//
	_file: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    file: {
        get: function() {return this._file;},
        set: function(value) {this._file = value;}
    },
	////////////////////////////////////////////////////////////////////
	//
    _isActive: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    isActive: {
        get: function() {return this._isActive;},
        set: function(value) {this._isActive = value;}
    },
	////////////////////////////////////////////////////////////////////
	//
    _needsSave: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    needsSave: {
        get: function() {return this._needsSave;},
        set: function(value) {this._needsSave = value;}
    },
    ////////////////////////////////////////////////////////////////////
	//
    _currentView: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    currentView: {
        get: function() {return this._currentView;},
        set: function(value) {this._currentView = value;}
    },
    ////////////////////////////////////////////////////////////////////
	//
    fileTemplate: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
    parentContainer: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	views: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
	//
	switchViewTo: {
        value: function (view) {
        	//
        }
    },
    ////////////////////////////////////////////////////////////////////
	//TODO: Add API to allow other browser support
	browserPreview: {
        value: function (browser) {
        	//Generating URL for document
        	var url = this.application.ninja.coreIoApi.rootUrl + this.file.uri.split(this.application.ninja.coreIoApi.cloudData.root)[1];
        	//TODO: Add logic to prompt user to save (all) before preview
        	this.saveAll(function (result) {
        		//Currently only supporting current browser (Chrome, obviously)
        		switch (this.browser) {
        			case 'chrome':
        				if (this.template && (this.template.type === 'banner' || this.template.type === 'animation')) {
        					window.open('/js/document/templates/preview/banner.html?width='+this.template.size.width+'&height='+this.template.size.height+'&url='+this.url);
        				} else {
        					window.open(this.url);
        				}
	        			break;
    	    		default:
        				if (this.template.type === 'banner' || this.template.type === 'animation') {
        					window.open('/js/document/templates/preview/banner.html?width='+this.template.size.width+'&height='+this.template.size.height+'&url='+this.url);
        				} else {
        					window.open(this.url);
        				}
        				break;
	        	}
        	}.bind({browser: browser, url: url, template: this.fileTemplate}));
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	getStyleSheets: {
		value: function () {
			//
			var styles = [];
    		//
    		for (var k in this.views.design.iframe.contentWindow.document.styleSheets) {
    			if (this.views.design.iframe.contentWindow.document.styleSheets[k].ownerNode && this.views.design.iframe.contentWindow.document.styleSheets[k].ownerNode.getAttribute) {
            		if (this.views.design.iframe.contentWindow.document.styleSheets[k].ownerNode.getAttribute('data-ninja-template') === null) {
            			styles.push(this.views.design.iframe.contentWindow.document.styleSheets[k]);
            		}
            	}
           	}
           	//
           	return styles;
		}
	},
    ////////////////////////////////////////////////////////////////////
	//
	save: {
        value: function (callback) {
        	//
        	if (this.needsSave) {
        		//Save
        	} else {
        		//Ignore command
        	}
        	//
        	if (this.currentView === this.views.design) {
            	//
        		this.application.ninja.ioMediator.fileSave({
        			mode: 'html',
        			file: this.file,
        			webgl: this.webGlHelper.glData,
        			styles: this.getStyleSheets(),
        			template: this.fileTemplate,
        			document: this.views.design.iframe.contentWindow.document,
        			head: this.views.design.iframe.contentWindow.document.head,
        			body: this.views.design.iframe.contentWindow.document.body,
        			mjsTemplateCreator: this.views.design.iframe.contentWindow.mjsTemplateCreator
        		}, callback.bind(this));
        	} else {
        		//TODO: Add logic to save code view data
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	saveAll: {
        value: function (callback) {
           	//
        	if (this.needsSave) {
        		//Save
        	} else {
        		//Ignore command
        	}
        	//
        	if (this.currentView === this.views.design) {
            	//
        		this.application.ninja.ioMediator.fileSave({
        			mode: 'html',
        			file: this.file,
        			webgl: this.webGlHelper.glData,
        			css: this.getStyleSheets(),
        			template: this.fileTemplate,
        			document: this.views.design.iframe.contentWindow.document,
        			head: this.views.design.iframe.contentWindow.document.head,
        			body: this.views.design.iframe.contentWindow.document.body,
        			mjsTemplateCreator: this.views.design.iframe.contentWindow.mjsTemplateCreator
        		}, callback.bind(this));
        	} else {
        		//TODO: Add logic to save code view data
        	}

        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	saveAs: {
        value: function () {
        	//
        	if (this.needsSave) {
        		//Save current file on memory
        	} else {
        		//Copy file from disk
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	close: {
        value: function (view, callback) {
        	//Outcome of close (pending on save logic)
        	var success;
        	//
        	if (this.needsSave) {
        		//Prompt user to save of lose data
        	} else {
        		//Close file
        		success = true;
        	}
        	//
        	if (this.views.design && (!view || view === 'design')) {
        		//
        		this.parentContainer.removeChild(this.views.design.iframe);
                this.views.design.pauseAndStopVideos();
        		this.views.design = null;
        	}
        	//
        	return success;
        }
    }
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////