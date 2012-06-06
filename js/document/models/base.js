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
        value: true
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
    _selection: {
        value: []
    },
    ////////////////////////////////////////////////////////////////////
    //
    selection: {
        get: function() {
            return this._selection;
        },
        set: function(value) {
            this._selection = value;
        }
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
        value: function (browser, screen, context) {
        	//Making call to show feedback screen
        	if (screen) screen.show(context);
        	//Generating URL for document
        	var url = this.application.ninja.coreIoApi.rootUrl + this.file.uri.split(this.application.ninja.coreIoApi.cloudData.root)[1];
        	//TODO: Add logic to prompt user to save (all) before preview
        	this.saveAll(null,function (success) {
        		//Making call to show feedback screen
        		if (screen) screen.hide(context);
        		//TODO: Add error handling logic
        		if (!success) {
	        		console.log('Error!');
	        		return;
        		}
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
        				if (this.template && (this.template.type === 'banner' || this.template.type === 'animation')) {
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
	//Gets all stylesheets in document
	getStyleSheets: {
		value: function () {
			//Array to store styles (style and link tags)
			var styles = [];
    		//Looping through document sytles
    		for (var k in this.views.design.iframe.contentWindow.document.styleSheets) {
    			//Check for styles to has proper propeties
    			if (this.views.design.iframe.contentWindow.document.styleSheets[k].ownerNode && this.views.design.iframe.contentWindow.document.styleSheets[k].ownerNode.getAttribute) {
    				//Check for ninja-template styles, if so, exclude
            		if (this.views.design.iframe.contentWindow.document.styleSheets[k].ownerNode.getAttribute('data-ninja-template') === null) {
            			styles.push(this.views.design.iframe.contentWindow.document.styleSheets[k]);
            		}
            	}
           	}
           	//Returning filtered results
           	return styles;
		}
	},
    ////////////////////////////////////////////////////////////////////
	//
	save: {
        value: function (callback, libCopyCallback) {
        	//TODO: Implement on demand logic
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
        		}, this.handleSaved.bind({callback: callback, model: this}), libCopyCallback);
        	} else {
        		//TODO: Add logic to save code view data
        	}
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	saveAll: {
        value: function (callback, libCopyCallback) {
           	//TODO: Implement on demand logic
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
        		}, this.handleSaved.bind({callback: callback, model: this}), libCopyCallback);
        	} else {
        		//TODO: Add logic to save code view data
        	}

        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	saveAs: {
        value: function (callback) {
        	//TODO: Implement on demand logic
        	if (this.needsSave) {
        		//Save current file on memory
        	} else {
        		//Copy file from disk
        	}
        	//TODO: Add functionality
        }
    },
    ////////////////////////////////////////////////////////////////////
	//
	handleSaved: {
		value: function (result) {
			//Checking for success code in save
			if (result.status === 204) {
				//Clearing flag with successful save
				this.model.needsSave = false;
			}
			//Making callback call if specifed with results of operation
			if (this.callback) this.callback(result);
		}
	},
    ////////////////////////////////////////////////////////////////////
	//TODO: Implement better logic to include different views on single document
	close: {
        value: function (view, callback) {
        	//Outcome of close (pending on save logic)
        	var success;
        	//
        	if (this.needsSave) {
        		//TODO: Prompt user to save or lose data
        	} else {
        		//Close file
        		success = true;
        	}
        	//Checking for view mode to close
        	if (this.views.design && (!view || view === 'design')) {
        		//TODO: Create a destroy method, this is messy
        		this.views.design.pauseAndStopVideos();
        		this.parentContainer.removeChild(this.views.design.iframe);
        		this.views.design = null;
        	}
        	//Returning result of operation
        	return success;
        }
    }
	////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////