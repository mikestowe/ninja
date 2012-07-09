/* <copyright>
Copyright (c) 2012, Motorola Mobility, Inc
All Rights Reserved.
BSD License.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  - Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  - Neither the name of Motorola Mobility nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage =       require("montage/core/core").Montage,
    Component =     require("montage/ui/component").Component,
    NinjaPrompt =   require("js/components/prompt.reel").NinjaPrompt;
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
    domContainer: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    selection: {
        get: function() {return this._selection;},
        set: function(value) {this._selection = value;}
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
    libs: {
        value: null
    },

    _mObjects: {
            value: []
        },

        mObjects: {
            get: function() {
                return this._mObjects;
            },
            set: function(value) {
                this._mObjects = value;
            }
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
                var save = this.application.ninja.ioMediator.fileSave({
                    mode: 'html',
                    libs: this.libs,
                    file: this.file,
                    webgl: this.webGlHelper.glData,
                    styles: this.getStyleSheets(),
                    template: this.fileTemplate,
                    document: this.views.design.iframe.contentWindow.document,
                    head: this.views.design.iframe.contentWindow.document.head,
                    body: this.views.design.iframe.contentWindow.document.body,
                    mjsTemplateCreator: this.views.design.iframe.contentWindow.mjsTemplateCreator
                }, this.handleSaved.bind({callback: callback, model: this}), libCopyCallback);
                //TODO: Improve detection during save routine
                if (save) {
                    if (save.montageId) {
                        this.libs.montageId = save.montageId;
                        this.libs.montage = true;
                    }
                    if (save.canvasId) {
                        this.libs.canvasId = save.canvasId;
                        this.libs.canvas = true;
                    }
                }
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
                var save = this.application.ninja.ioMediator.fileSave({
                    mode: 'html',
                    libs: this.libs,
                    file: this.file,
                    webgl: this.webGlHelper.glData,
                    css: this.getStyleSheets(),
                    template: this.fileTemplate,
                    document: this.views.design.iframe.contentWindow.document,
                    head: this.views.design.iframe.contentWindow.document.head,
                    body: this.views.design.iframe.contentWindow.document.body,
                    mjsTemplateCreator: this.views.design.iframe.contentWindow.mjsTemplateCreator
                }, this.handleSaved.bind({callback: callback, model: this}), libCopyCallback);
                //TODO: Improve detection during save routine
                if (save) {
                    if (save.montageId) {
                        this.libs.montageId = save.montageId;
                        this.libs.montage = true;
                    }
                    if (save.canvasId) {
                        this.libs.canvasId = save.canvasId;
                        this.libs.canvas = true;
                    }
                }
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
    //
    handleSavePrompt: {
        value: function (continueToClose, callback) {
            //TODO: Perhaps add logic to save the file is the user wants
            if (continueToClose) {
                if (callback) callback();
            } else {
                //User canceled
                //this.saveAll(null, callback);
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Implement better logic to include different views on single document
    close: {
        value: function (view, callback) {
            //Checking if files needs to be saved to avoid losing data
            if (this.needsSave) {
                //Creating prompt to ask user to save the file
                var prompt = NinjaPrompt.create();
                prompt.initialize('confirm', {message: 'Do you want to save the changes you made in the document '+this.file.name+'?\n\nYour changes will be lost if you do not save them.'}, function (result){this.handleSavePrompt(result, callback);}.bind(this));
                //Showing the prompt, it will make callback with user input
                prompt.show();
            } else {
                //TODO: Add support for other views
                if (!view || view === 'design') {
                    this.closeView('design');
                }
                //Making callback
                if (callback) callback();
            }

        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    closeView: {
        value: function (view) {
            //Checking for view mode to close
            switch (view.toLowerCase()) {
                case 'design':
                    //TODO: Make into clean method in the design view
                    this.views.design.pauseAndStopVideos();
                    this.parentContainer.removeChild(this.views.design.iframe);
                    this.views.design = null;
                    break;
                default:
                    //TODO: Error?
                    break;
            }
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
