/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
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
var Montage =           require("montage/core/core").Montage,
    BaseDocumentView =  require("js/document/views/base").BaseDocumentView,
    ElementModel =      require("js/models/element-model");
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
    _viewCallback: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _template: {
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
    //
    _liveNodeList: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _webGlHelper: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    _baseHref: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    baseHref: {
        get: function() {return this._baseHref;},
        set: function(value) {this._baseHref = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    _document: {
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
    _documentRoot: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    documentRoot: {
        get: function() {return this._documentRoot;},
        set: function(value) {this._documentRoot = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    getLiveNodeList: {
        value: function(useFilter) {
            if(useFilter) {
                var filteredNodes = [],
                    childNodes = Array.prototype.slice.call(this._liveNodeList, 0);

                childNodes.forEach(function(item) {
                    if( (item.nodeType === 1) && (item.nodeName !== "STYLE") && (item.nodeName !== "SCRIPT")) {
                        filteredNodes.push(item);
                    }
                });
                return filteredNodes;
            } else {
                return Array.prototype.slice.call(this._liveNodeList, 0);
            }
        }
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
        value: function (callback, template, viewCallback) {
            //TODO: Remove, this is a temp patch for webRequest API gate
            this.application.ninja.documentController.redirectRequests = false;
            //Storing callback for dispatch ready
            this._callback = callback;
            this._template = template;
            this._viewCallback = viewCallback;
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
            //TODO: Remove, this is a temp patch for webRequest API gate
            this.application.ninja.documentController.redirectRequests = true;
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
                    this.baseHref = basetag[basetag.length-1].getAttribute('href');
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
                    this._bodyFragment.innerHTML = '<ninjaloadinghack></ninjaloadinghack>'+(this.content.body.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.tmplt.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator.tmplt))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.tmplt.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator.tmplt));
                }
            } else {
                //Creating temp code fragement to load head
                this._headFragment = this.document.createElement('head');
                //Adding event listener to know when head is ready, event only dispatched once when using innerHTML
                this._observer.head = new WebKitMutationObserver(this.insertHeadContent.bind(this));
                this._observer.head.observe(this._headFragment, {childList: true});
                //Inserting <head> HTML and parsing URLs via mediator method
                this._headFragment.innerHTML = (this.content.head.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.tmplt.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator.tmplt))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.tmplt.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator.tmplt));
                //Adding event listener to know when the body is ready and make callback (using HTML5 new DOM Mutation Events)
                this._observer.body = new WebKitMutationObserver(this.bodyContentLoaded.bind(this));
                this._observer.body.observe(this.document.body, {childList: true});
                //Inserting <body> HTML and parsing URLs via mediator method
                this.document.body.innerHTML += '<ninjaloadinghack></ninjaloadinghack>'+(this.content.body.replace(/\b(href|src)\s*=\s*"([^"]*)"/g, this.application.ninja.ioMediator.tmplt.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator.tmplt))).replace(/url\(([^"]*)(.+?)\1\)/g, this.application.ninja.ioMediator.tmplt.getNinjaPropUrlRedirect.bind(this.application.ninja.ioMediator.tmplt));
                //Copying attributes to maintain same properties as the <body>
                for (var n in this.content.document.body.attributes) {
                    if (this.content.document.body.attributes[n].value) {
                        this.document.body.setAttribute(this.content.document.body.attributes[n].name, this.content.document.body.attributes[n].value);
                    }
                }
                //Copying attributes to maintain same properties as the <head>
                for (var m in this.content.document.head.attributes) {
                    if (this.content.document.head.attributes[m].value) {
                        this.document.head.setAttribute(this.content.document.head.attributes[m].name, this.content.document.head.attributes[m].value);
                    }
                }
                //Copying attributes to maintain same properties as the <html>
                var htmlTagMem = this.content.document.getElementsByTagName('html')[0], htmlTagDoc = this.document.getElementsByTagName('html')[0];
                for (var m in htmlTagMem.attributes) {
                    if (htmlTagMem.attributes[m].value) {
                        htmlTagDoc.setAttribute(htmlTagMem.attributes[m].name, htmlTagMem.attributes[m].value);
                    }
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    insertBannerContent: {
        value: function (e) {
            //Getting first element in DOM (assumes it's root)
            //TODO: Ensure wrapper logic is proper
            var wrapper =   this._bodyFragment.getElementsByTagName('*')[1],
                banner =    this._bodyFragment.getElementsByTagName('*')[2],
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
            var htags = this.document.getElementsByTagName('html'),
                bannerWrapper,
                userStyles,
                stags = this.document.getElementsByTagName('style'),
                ltags = this.document.getElementsByTagName('link'), i, orgNodes,
                scripttags = this.document.getElementsByTagName('script'),
                videotags = this.document.getElementsByTagName('video');
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
            //Checking for video tags
            if (videotags.length > 0) {
                //Looping through all video tags
                for (i = 0; i < videotags.length; i++) {
                    //Stopping all videos from playing on open
                    videotags[i].addEventListener('canplay', function(e) {
                        //TODO: Figure out why the video must be seeked to the end before pausing
                        var time = Math.ceil(this.duration);
                        //Trying to display the last frame (doing minus 2 seconds if long video)
                        if (time > 2) this.currentTime = time - 2;
                        else if (time > 1) this.currentTime = time - 1;
                        else this.currentTime = time || 0;
                        //Pauing video
                        this.pause();
                    }, false);
                }
            }
            // Assign the modelGenerator reference from the template to our own modelGenerator
            this.document.modelGenerator = ElementModel.modelGenerator;
            //Checking for script tags then parsing check for montage and webgl
            if (scripttags.length > 0) {
                //Checking and initializing webGL
                this.initWebGl(scripttags);
                //Checking and initializing Montage
                this.initMontage(scripttags);
            } else {
                //Else there is not data to parse
                if(this._viewCallback) {
                    this._viewCallback.viewCallback.call(this._viewCallback.context);
                }
            }
            //TODO: Verify appropiate location for this operation
            if (this._template && this._template.type === 'banner') {
                this.documentRoot = this.document.body.getElementsByTagName('ninja-content')[0];
                bannerWrapper = this.documentRoot.parentNode;
            } else {
                this.documentRoot = this.document.body;
            }
            //Storing node list for reference (might need to store in the model)
            this._liveNodeList = this.documentRoot.getElementsByTagName('*');
            //Getting list of original nodes
            orgNodes = this.document.getElementsByTagName('*');
            //TODO: Figure out if this is ideal for identifying nodes created by Ninja
            for (var n in orgNodes) {
                if (orgNodes[n].getAttribute) orgNodes[n].setAttribute('data-ninja-node', 'true');
            }

            // Save initial HTML and Body/ninja-content style attributes so we don't override them on save
            if(htags.length) {
                if(userStyles = htags[0].getAttribute('style')) {
                    htags[0].setAttribute('data-ninja-style', userStyles);
                }
            }
            if(this.documentRoot) {
                if(userStyles = this.documentRoot.getAttribute('style')) {
                    this.documentRoot.setAttribute('data-ninja-style', userStyles);
                }
            }
            if(bannerWrapper) {
                if(userStyles = bannerWrapper.getAttribute('style')) {
                    bannerWrapper.setAttribute('data-ninja-style', userStyles);
                }
            }
            //Making callback if specified
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
            var n, webgldata, fileRead;
            //Checking for webGL Data
            for (var w in scripttags) {
                //
                webgldata = null;
                //Checking for tags with webGL data
                if (scripttags[w].getAttribute) {
                    if (scripttags[w].getAttribute('data-ninja-canvas') !== null) {
                        //TODO: Add logic to handle more than one data tag
                        webgldata = JSON.parse((scripttags[w].innerHTML.replace("(", "")).replace(")", ""));
                    } else if (scripttags[w].getAttribute('data-ninja-canvas-json') !== null) {
                        //TODO: Add check for hardcoded URL
                        fileRead = this.application.ninja.ioMediator.fio.readFile({uri: this.application.ninja.documentController.documentHackReference.root+scripttags[w].getAttribute('data-ninja-canvas-json')});
                        //
                        if (fileRead.status === 204) {
                            webgldata = JSON.parse((fileRead.file.content.replace("(", "")).replace(")", ""));
                        } else {
                            //Error
                        }
                    }
                    //Checking for webGL data and building data array
                    if (webgldata && webgldata.data) {
                        for (n = 0; webgldata.data[n]; n++) {
                            webgldata.data[n] = unescape(webgldata.data[n]);
                        }
                        //TODO: Improve setter of webGL and reference
                        this._webGlHelper.glData = webgldata.data;
                    }
                }
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    initMontage: {
        value: function (scripttags) {
            var self = this;

            this.iframe.contentWindow.document.body.addEventListener('mjsTemplateReady', function () {
                //Initializing template with user's seriliazation
                var template = this.iframe.contentWindow.mjsTemplate.create();

                template.initWithDocument(this.iframe.contentWindow.document);
                template.instantiateWithOwnerAndDocument(null, this.iframe.contentWindow.document, function (){
                    //TODO: Verify this is properly done, seems like a hack

                    var objArray = [];
                    for (var c in template._deserializer._objects) {
                        //Forcing draw on components
                        template._deserializer._objects[c].needsDraw = true;
                        objArray.push(template._deserializer._objects[c]);
                    }

                    // Now call the view callback
                    if(self._viewCallback) {
                        self._viewCallback.viewCallback.call(self._viewCallback.context, objArray);
                    }

                });
            }.bind(this), false);
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
            if(this.document) {
            var i, videos = this.document.getElementsByTagName("video");
            for(i = 0; i < videos.length; i++){
                if(!videos[i].paused) videos[i].pause();
            }
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
    },
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    toggleWebGlAnimation: {
        value: function(show) {
            if(this.document) {
                var glCanvases = this.document.querySelectorAll('[data-RDGE-id]'),
                    glShapeModel;
                if(glCanvases) {
                    for(var i = 0, len = glCanvases.length; i<len; i++) {
                        glShapeModel = glCanvases[i].elementModel.shapeModel;
                        if(show) {
                            glShapeModel.GLWorld.restartRenderLoop();
                        } else {
                            glShapeModel.GLWorld.stop();
                        }
                    }

                }
            }
        }
    }
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
