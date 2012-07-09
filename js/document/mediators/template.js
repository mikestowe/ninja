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
var Montage =           require("montage/core/core").Montage,
    Component =         require("montage/ui/component").Component,
    TemplateCreator =   require("node_modules/tools/template/template-creator").TemplateCreator,
    ClassUuid =         require("js/components/core/class-uuid").ClassUuid;
////////////////////////////////////////////////////////////////////////
//
exports.TemplateDocumentMediator = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    getAppTemplatesUrlRegEx: {
        value: function () {
            var regex = new RegExp(chrome.extension.getURL(this.application.ninja.currentDocument.model.views.design.iframe.src.split(chrome.extension.getURL('/'))[1]).replace(/\//gi, '\\\/'), 'gi');
            return regex;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getDataDirectory: {
        value: function (path) {
            //TODO: Implement user overwrite
            return this._getUserDirectory(path+'data/');
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getNinjaDirectory: {
        value: function (path) {
            //TODO: Implement user overwrite
            return this._getUserDirectory(this.getDataDirectory(path)+'ninja/');
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getCanvasDirectory: {
        value: function (path) {
            //TODO: Implement user overwrite
            return this._getUserDirectory(this.getNinjaDirectory(path)+'canvas/');
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    _getUserDirectory: {
        value: function (path) {
            //Checking for data directory
            var check = this.application.ninja.coreIoApi.fileExists({uri: path}), directory;
            //Creating directory if doesn't exists
            switch (check.status) {
                case 204: //Exists
                    directory = path;
                    break;
                case 404: //Doesn't exists
                    directory = this.application.ninja.coreIoApi.createDirectory({uri: path});
                    //Checking for success
                    if (directory.status === 201) {
                        directory = path;
                    } else {
                        //Error
                        directory = null;
                    }
                    break;
                default: //Error
                    directory = null;
                    break;
            }
            //Returning the path to the directory on disk (null for any error)
            return directory;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    parseHtmlToNinjaTemplate: {
        value: function (html) {
            //Creating temp object to mimic HTML
            var doc = window.document.implementation.createHTMLDocument(), template, docHtmlTag,
                hackHtml = document.createElement('html'), hackTag;
            //Setting content to temp
            doc.getElementsByTagName('html')[0].innerHTML = html;
            //TODO: Improve this, very bad way of copying attributes (in a pinch to get it working)
            hackHtml.innerHTML = html.replace(/html/gi, 'ninjahtmlhack');
            hackTag = hackHtml.getElementsByTagName('ninjahtmlhack')[0];
            docHtmlTag = doc.getElementsByTagName('html')[0];
            //Looping through the attributes to copy them
            if (hackTag) {
                for (var m in hackTag.attributes) {
                    if (hackTag.attributes[m].value) {
                        docHtmlTag.setAttribute(hackTag.attributes[m].name.replace(/ninjahtmlhack/gi, 'html'), hackTag.attributes[m].value.replace(/ninjahtmlhack/gi, 'html'));
                    }
                }
            }
            //Garbage collection
            hackHtml = hackTag = null;
            //Creating return object
            return {head: doc.head.innerHTML, body: doc.body.innerHTML, document: doc};
        }
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Expand to allow more templates, clean up variables
    parseNinjaTemplateToHtml: {
        value: function (saveExternalData, template, ninjaWrapper, libCopyCallback) {
            //TODO: Improve reference for rootUrl
            var regexRootUrl,
                rootUrl = this.application.ninja.coreIoApi.rootUrl + escape((this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1])),
                mjsCreator = template.mjsTemplateCreator.create(),
                mJsSerialization,
                toremovetags = [],
                presentNodes,
                montageTemplate;
            //Creating instance of template creator
            montageTemplate = mjsCreator.initWithDocument(template.document);
            //Setting up expression for parsing URLs
            regexRootUrl = new RegExp(rootUrl.replace(/\//gi, '\\\/'), 'gi');
            //Injecting head and body into old document
            if (montageTemplate._ownerSerialization.length > 0) {
                template.file.content.document.head.innerHTML = montageTemplate._document.head.innerHTML.replace(regexRootUrl, '');
                template.file.content.document.body.innerHTML = montageTemplate._document.body.innerHTML.replace(regexRootUrl, '');
                //
                mJsSerialization = montageTemplate._ownerSerialization;
            } else {
                template.file.content.document.head.innerHTML = template.head.innerHTML.replace(regexRootUrl, '');
                template.file.content.document.body.innerHTML = template.body.innerHTML.replace(regexRootUrl, '');
            }
            //Removes all attributes from node
            function wipeAttributes (node) {
                for (var f in node.attributes) {
                    node.removeAttribute(node.attributes[f].name);
                }
            }
            //Copying attributes to maintain same properties as the <body>
            wipeAttributes(template.file.content.document.body);
            for (var n in template.body.attributes) {
                if (template.body.attributes[n].value) {
                    template.file.content.document.body.setAttribute(template.body.attributes[n].name, template.body.attributes[n].value);
                }
            }
            //
            if(template.template) {
                //
                // TODO - Need to handle banner and animation templates.
                //Copying attributes to maintain same properties as <ninja-content>
                var ninjaContentTagMem = template.document.getElementsByTagName('ninja-content')[0], ninjaContentTagDoc = template.file.content.document.getElementsByTagName('ninja-content')[0];
                if (ninjaContentTagMem && ninjaContentTagMem.getAttribute('data-ninja-style') !== null) {
                    ninjaContentTagDoc.setAttribute('style', ninjaContentTagMem.getAttribute('data-ninja-style'));
                    ninjaContentTagDoc.removeAttribute('data-ninja-style');
                } else if (ninjaContentTagMem && ninjaContentTagMem.getAttribute('data-ninja-style') === null) {
                    ninjaContentTagDoc.removeAttribute('style');
                    ninjaContentTagDoc.removeAttribute('data-ninja-style');
                }
                // TODO - clean up into single method
                ninjaContentTagMem = template.document.getElementsByTagName('ninja-viewport')[0], ninjaContentTagDoc = template.file.content.document.getElementsByTagName('ninja-viewport')[0];
                if (ninjaContentTagMem && ninjaContentTagMem.getAttribute('data-ninja-style') !== null) {
                    ninjaContentTagDoc.setAttribute('style', ninjaContentTagMem.getAttribute('data-ninja-style'));
                    ninjaContentTagDoc.removeAttribute('data-ninja-style');
                } else if (ninjaContentTagMem && ninjaContentTagMem.getAttribute('data-ninja-style') === null) {
                    ninjaContentTagDoc.removeAttribute('style');
                    ninjaContentTagDoc.removeAttribute('data-ninja-style');
                }
            } else {
                if (template.body && template.body.getAttribute('data-ninja-style') !== null) {
                    template.file.content.document.body.setAttribute('style', template.body.getAttribute('data-ninja-style'));
                    template.file.content.document.body.removeAttribute('data-ninja-style');
                } else if (template.body && template.body.getAttribute('data-ninja-style') === null) {
                    template.file.content.document.body.removeAttribute('style');
                    template.file.content.document.body.removeAttribute('data-ninja-style');
                }
            }

            wipeAttributes(template.file.content.document.head);
            //Copying attributes to maintain same properties as the <head>
            for (var m in template.document.head.attributes) {
                if (template.document.head.attributes[m].value) {
                    template.file.content.document.head.setAttribute(template.document.head.attributes[m].name, template.document.head.attributes[m].value);
                }
            }
            //Copying attributes to maintain same properties as the <html>
            var htmlTagMem = template.document.getElementsByTagName('html')[0], htmlTagDoc = template.file.content.document.getElementsByTagName('html')[0];
            wipeAttributes(htmlTagDoc);
            //
            for (var m in htmlTagMem.attributes) {
                if (htmlTagMem.attributes[m].value) {
                    if (htmlTagMem.attributes[m].value.replace(/montage-app-bootstrapping/gi, '').length>0) {
                        htmlTagDoc.setAttribute(htmlTagMem.attributes[m].name, htmlTagMem.attributes[m].value.replace(/ montage-app-bootstrapping/gi, ''));
                    }
                }
            }
            //
            if (htmlTagMem && htmlTagMem.getAttribute('data-ninja-style') !== null) {
                htmlTagDoc.setAttribute('style', htmlTagMem.getAttribute('data-ninja-style'));
                htmlTagDoc.removeAttribute('data-ninja-style');
            } else if (htmlTagMem && htmlTagMem.getAttribute('data-ninja-style') === null) {
                htmlTagDoc.removeAttribute('style');
                htmlTagDoc.removeAttribute('data-ninja-style');
            }
            //Getting list of current nodes (Ninja DOM)
            presentNodes = template.file.content.document.getElementsByTagName('*');
            //Looping through nodes to determine origin and removing if not inserted by Ninja
            for (var n in presentNodes) {
                //
                if (presentNodes[n].getAttribute && presentNodes[n].getAttribute('data-ninja-node') === null) {
                    toremovetags.push(presentNodes[n]);
                } else if (presentNodes[n].getAttribute && presentNodes[n].getAttribute('data-ninja-node') !== null) {
                    //Removing attribute
                    presentNodes[n].removeAttribute('data-ninja-node');
                }
            }
            //Getting all CSS (style or link) tags
            var styletags = template.file.content.document.getElementsByTagName('style'),
                linktags = template.file.content.document.getElementsByTagName('link'),
                njtemplatetags = template.file.content.document.querySelectorAll('[data-ninja-template]');

            //Adding to tags to be removed form template
            for (var f in njtemplatetags) {
                if (njtemplatetags[f].getAttribute) toremovetags.push(njtemplatetags[f]);
            }
            //Getting styles tags to be removed from document
            if (styletags.length) {
                for (var j = 0; j < styletags.length; j++) {
                    if (styletags[j].getAttribute) {
                        if (styletags[j].getAttribute('data-ninja-uri') !== null && !styletags[j].getAttribute('data-ninja-template')) {
                            toremovetags.push(styletags[j]);
                        } else if (styletags[j].getAttribute('data-ninja-external-url')) {
                            toremovetags.push(styletags[j]);
                        }
                    }
                }
            }
            //Removing styles tags from document
            for (var h = 0; toremovetags[h]; h++) {
                try {
                    //Checking head first
                    template.file.content.document.head.removeChild(toremovetags[h]);
                } catch (e) {

                }
                try {
                        //Checking body if not in head
                        template.file.content.document.body.removeChild(toremovetags[h]);
                    } catch (e) {
                        //Error, not found!
                    }
            }
            //Removing disabled tags from tags that were not originally disabled by user (Ninja enables all)
            for (var l in linktags) {
                if (linktags[l].getAttribute && linktags[l].getAttribute('disabled')) {//TODO: Use querySelectorAll
                    for (var p = 0; toremovetags[p]; p++) {
                        if (toremovetags[p].getAttribute('href') === linktags[l].getAttribute('href')) {
                            if (!toremovetags[p].getAttribute('data-ninja-disabled')) {
                                linktags[l].removeAttribute('disabled');
                            }
                        }
                    }
                }
            }













            //TODO: Make proper CSS method



            //Checking for type of save: styles = <style> only | css = <style> and <link> (all CSS)
            if (template.styles) {
                //Getting all style tags
                var styleCounter = 0,
                    docStyles = template.file.content.document.getElementsByTagName('style');
                //Looping through all style tags
                for (var i in template.styles) {
                    if (template.styles[i].ownerNode) {
                        if (template.styles[i].ownerNode.getAttribute) {
                            //Checking for node not to be loaded from file
                            if (template.styles[i].ownerNode.getAttribute('data-ninja-uri') === null && !template.styles[i].ownerNode.getAttribute('data-ninja-template') && !template.styles[i].ownerNode.getAttribute('data-ninja-external-url')) {
                                if (docStyles[styleCounter] && template.styles[i].ownerNode.getAttribute('data-ninja-node')) {
                                    //Inseting data from rules array into tag as string
                                    docStyles[styleCounter].innerHTML = this.getCssFromRules(template.styles[i].cssRules);
                                    //Syncing <style> tags count since it might be mixed with <link>
                                    styleCounter++;
                                }
                            }
                        }
                    }
                }
            } else if (template.css) {
                //Getting all style and link tags
                var styleCounter = 0,
                    docStyles = template.file.content.document.getElementsByTagName('style'),
                    docLinks = template.file.content.document.getElementsByTagName('link');
                //Removing Ninja Data Attributes
                for (var n in docLinks) {
                    if (docLinks[n].attributes) {
                        for (var m in docLinks[n].attributes) {
                            if (docLinks[n].attributes[m].name && docLinks[n].attributes[m].name.indexOf('data-ninja') !== -1) {
                                docLinks[n].removeAttribute(docLinks[n].attributes[m].name);
                            }
                        }
                    }
                }
                //
                for (var i in template.css) {
                    if (template.css[i].ownerNode) {
                        if (template.css[i].ownerNode.getAttribute) {
                            if (template.css[i].ownerNode.getAttribute('data-ninja-uri') === null && !template.css[i].ownerNode.getAttribute('data-ninja-template')) {//TODO: Use querySelectorAll
                                //Inseting data from rules array into <style> as string
                                if (docStyles[styleCounter] && !template.css[i].ownerNode.getAttribute('data-ninja-external-url') && template.css[i].ownerNode.getAttribute('data-ninja-node')) {
                                    docStyles[styleCounter].innerHTML = this.getCssFromRules(template.css[i].cssRules);
                                    styleCounter++;
                                }
                            } else if (!template.css[i].ownerNode.getAttribute('data-ninja-template')) {
                                //Checking for attributes to be added to tag upon saving
                                for (var k in docLinks) {
                                    if (docLinks[k].getAttribute) {
                                        if (docLinks[k].getAttribute('href') && ('/' + docLinks[k].getAttribute('href')) === template.css[i].ownerNode.getAttribute('data-ninja-file-url')) {
                                            for (var l in template.css[i].ownerNode.attributes) {
                                                if (template.css[i].ownerNode.attributes[l].value) {
                                                    if (template.css[i].ownerNode.attributes[l].name.indexOf('data-ninja') != -1) {
                                                        //Ninja attribute...
                                                    } else {
                                                        docLinks[k].setAttribute(template.css[i].ownerNode.attributes[l].name, template.css[i].ownerNode.attributes[l].value);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                ///////////////////////////////////////////////////////////////////////////////////////////
                                ///////////////////////////////////////////////////////////////////////////////////////////


                                var cleanedCss,
                                    dirtyCss = this.getCssFromRules(template.css[i].cssRules),
                                    fileUrl = template.css[i].ownerNode.getAttribute('data-ninja-file-url'),
                                    fileRootUrl = this.application.ninja.coreIoApi.rootUrl + fileUrl.split(fileUrl.split('/')[fileUrl.split('/').length - 1])[0],
                                    cleanedCss = dirtyCss.replace(/(\b(?:(?:https?|ftp|file|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gi, parseNinjaUrl.bind(this));

                                function parseNinjaUrl(url) {
                                    if (url.indexOf(this.application.ninja.coreIoApi.rootUrl) !== -1) {
                                        return this.getUrlfromNinjaUrl(url, fileRootUrl, fileUrl);
                                    } else {
                                        return url;
                                    }
                                }

                                ///////////////////////////////////////////////////////////////////////////////////////////
                                ///////////////////////////////////////////////////////////////////////////////////////////




                                //Saving data from rules array converted to string into <link> file
                                var save = this.application.ninja.ioMediator.fio.saveFile({ uri: template.css[i].ownerNode.getAttribute('data-ninja-uri'), contents: cleanedCss });
                                //TODO: Add error handling for saving files
                            }
                        }
                    }
                }
            }


















            //
            var webgltag, webgllibtag, webglrdgetag, mjstag, mjslibtag, matchingtags = [],
                scripts = template.file.content.document.getElementsByTagName('script'),
                libsobserver = {montage: false, canvas: false, montageCopied: null, canvasCopied: null, callback: libCopyCallback, dispatched: false};
            //TODO: Clean up, this is messy
            if (mJsSerialization) libsobserver.montage = true;
            if (template.webgl && template.webgl.length > 1) libsobserver.canvas = true;
            //
            for (var i in scripts) {
                if (scripts[i].getAttribute) {
                    if (scripts[i].getAttribute('data-ninja-canvas') !== null) {//TODO: Use querySelectorAll
                        matchingtags.push(scripts[i]);
                    }
                    if (scripts[i].getAttribute('data-ninja-canvas-lib') !== null) {
                        webgllibtag = scripts[i]; // TODO: Add logic to delete unneccesary tags
                    }
                    if (scripts[i].getAttribute('data-ninja-canvas-rdge') !== null) {
                        webglrdgetag = scripts[i]; // TODO: Add logic to delete unneccesary tags
                    }
                    if (scripts[i].getAttribute('type') === 'text/montage-serialization') {
                        mjstag = scripts[i]; // TODO: Add logic to delete unneccesary tags
                    }
                    if (scripts[i].getAttribute('data-mjs-lib') !== null) {
                        mjslibtag = scripts[i]; // TODO: Add logic to delete unneccesary tags
                    }
                }
            }




            //TODO: Make proper webGL/Canvas method


            //Checking for webGL elements in document
            if (template.webgl && template.webgl.length > 1) {//TODO: Should be length 0, hack for a temp fix
                var rdgeDirName, rdgeVersion, cvsDataDir = this.getCanvasDirectory(template.file.root), fileCvsDir, fileCvsDirAppend, cvsDirCounter = 1, fileOrgDataSrc;
                //
                if (cvsDataDir && !matchingtags.length && !webgllibtag) {

                    if (template.libs.canvasId) {
                        libsobserver.canvasId = template.libs.canvasId;
                    } else {
                        libsobserver.canvasId = ClassUuid.generate();
                    }

                    //Creating data directory, will include materials at a later time
                    fileCvsDir = cvsDataDir+template.file.name.split('.'+template.file.extension)[0]+'_'+libsobserver.canvasId;

                    if (!this._getUserDirectory(fileCvsDir)) {
                        //TODO: create proper logic not to overwrite files
                        console.log('error');
                    }

                    fileCvsDir += '/';
                } else if (webgllibtag && webgllibtag.getAttribute && webgllibtag.getAttribute('data-ninja-canvas-json') !== null) {
                    fileOrgDataSrc = template.file.root+webgllibtag.getAttribute('data-ninja-canvas-json');
                }
                //Copy webGL library if needed
                for (var i in this.application.ninja.coreIoApi.ninjaLibrary.libs) {
                    //Checking for RDGE library to be available
                    if (this.application.ninja.coreIoApi.ninjaLibrary.libs[i].name === 'RDGE') {
                        rdgeDirName = (this.application.ninja.coreIoApi.ninjaLibrary.libs[i].name + this.application.ninja.coreIoApi.ninjaLibrary.libs[i].version).toLowerCase();
                        rdgeVersion = this.application.ninja.coreIoApi.ninjaLibrary.libs[i].version;
                        this.application.ninja.coreIoApi.ninjaLibrary.copyLibToCloud(template.file.root, rdgeDirName, function(result) {libsobserver.canvasCopied = result; this.libCopied(libsobserver);}.bind(this));
                    } else {
                        //TODO: Error handle no available library to copy
                    }
                }
                //
                if (matchingtags.length) {
                    if (matchingtags.length === 1) {
                        webgltag = matchingtags[0];
                    } else {
                        //TODO: Add logic to handle multiple tags, perhaps combine to one
                        webgltag = matchingtags[matchingtags.length - 1]; //Saving all data to last one...
                    }
                }
                //TODO: Add check for file needed
                if (!webglrdgetag) {
                    webglrdgetag = template.file.content.document.createElement('script');
                    webglrdgetag.setAttribute('type', 'text/javascript');
                    webglrdgetag.setAttribute('src', rdgeDirName + '/rdge-compiled.js');
                    webglrdgetag.setAttribute('data-ninja-canvas-rdge', 'true');
                    if (ninjaWrapper) {
                        template.file.content.document.body.getElementsByTagName('ninja-content')[0].appendChild(webglrdgetag);
                    } else {
                        template.file.content.document.head.appendChild(webglrdgetag);
                    }
                }
                //
                if (!webgllibtag) {
                    webgllibtag = template.file.content.document.createElement('script');
                    webgllibtag.setAttribute('type', 'text/javascript');
                    webgllibtag.setAttribute('src', rdgeDirName + '/canvas-runtime.js');
                    webgllibtag.setAttribute('data-ninja-canvas-lib', 'true');
                    if (ninjaWrapper) {
                        template.file.content.document.body.getElementsByTagName('ninja-content')[0].appendChild(webgllibtag);
                    } else {
                        template.file.content.document.head.appendChild(webgllibtag);
                    }
                }
                //
                if (!webgltag && !fileCvsDir && !fileOrgDataSrc) {
                    webgltag = template.file.content.document.createElement('script');
                    webgltag.setAttribute('data-ninja-canvas', 'true');
                    if (ninjaWrapper) {
                        template.file.content.document.body.getElementsByTagName('ninja-content')[0].appendChild(webgltag);
                    } else {
                        template.file.content.document.head.appendChild(webgltag);
                    }
                }

                //TODO: Decide if this should be over-writter or only written on creation
                var rootElement = 'document.body'; //TODO: Set actual root element

                //TODO: This data should be saved to a JSON file eventually
                var json = '\n({\n\t"version": "' + rdgeVersion + '",\n\t"directory": "' + rdgeDirName + '/",\n\t"data": [';
                //Looping through data to create escaped array
                for (var j = 0; template.webgl[j]; j++) {
                    if (j === 0) {
                        json += '\n\t\t\t"' + escape(template.webgl[j]) + '"';
                    } else {
                        json += ',\n\t\t\t"' + escape(template.webgl[j]) + '"';
                    }
                }
                //Closing array (make-shift JSON string to validate data in <script> tag)
                json += '\n\t\t]\n})\n';
                //Setting string in tag
                if (fileCvsDir || fileOrgDataSrc) {
                    //
                    var cvsDataFilePath, cvsDataFileUrl, cvsDataFileCheck, cvsDataFileOperation;
                    //
                    if (fileOrgDataSrc) {
                        cvsDataFilePath = fileOrgDataSrc;
                    } else {
                        cvsDataFilePath = fileCvsDir+'data.json';
                    }
                    //
                    cvsDataFileUrl = this.getNinjaPropUrlRedirect(cvsDataFilePath.split(this.application.ninja.coreIoApi.cloudData.root+'/')[1]),
                    cvsDataFileCheck = this.application.ninja.coreIoApi.fileExists({uri: cvsDataFilePath}),
                    //Setting the local path to the JSON file
                    webgllibtag.setAttribute('data-ninja-canvas-json', this.application.ninja.coreIoApi.rootUrl+'/'+cvsDataFileUrl);
                    webgllibtag.setAttribute('data-ninja-canvas-libpath', rdgeDirName);
                    //
                    if (cvsDataFileCheck.status === 404 || cvsDataFileCheck.status === 204) {
                        //Saving file
                        cvsDataFileOperation = this.application.ninja.ioMediator.fio.saveFile({uri: cvsDataFilePath, contents: json});
                    } else {
                        //Error
                    }


                } else {
                    webgllibtag.setAttribute('data-ninja-canvas-libpath', rdgeDirName);
                    webgltag.innerHTML = json;
                }
            }














            //TODO: Make proper Montage method

            //Checking for Montage
            if (mJsSerialization) {
                //Copy Montage library if needed
                for (var i in this.application.ninja.coreIoApi.ninjaLibrary.libs) {
                    //Checking for Montage library to be available
                    if (this.application.ninja.coreIoApi.ninjaLibrary.libs[i].name === 'Montage') {
                        mjsDirName = (this.application.ninja.coreIoApi.ninjaLibrary.libs[i].name + this.application.ninja.coreIoApi.ninjaLibrary.libs[i].version).toLowerCase();
                        mjsVersion = this.application.ninja.coreIoApi.ninjaLibrary.libs[i].version;
                        this.application.ninja.coreIoApi.ninjaLibrary.copyLibToCloud(template.file.root, mjsDirName, function(result) {libsobserver.montageCopied = result; this.libCopied(libsobserver);}.bind(this));



                        //TODO: Fix to allow no overwrite and nested locations
                        var mjsCheck, mjsPath = template.file.root + 'package.json';
                        mjsCheck = this.application.ninja.coreIoApi.fileExists({uri: mjsPath});
                        //
                        if (!mjsCheck || mjsCheck.status !== 204) {
                            var packjson = this.application.ninja.coreIoApi.createFile({ uri: mjsPath, contents: '{"mappings": {\n\t\t"montage": "' + mjsDirName + '/montage/",\n\t\t"montage-google": "' + mjsDirName + '/montage-google/"\n\t}\n}' });
                        } else {
                            //Already exists
                        }



                    } else {
                        //TODO: Error handle no available library to copy
                    }
                }
                //
                if (!mjslibtag) {
                    mjslibtag = template.file.content.document.createElement('script');
                    mjslibtag.setAttribute('type', 'text/javascript');
                    mjslibtag.setAttribute('src', mjsDirName + '/montage/montage.js');
                    mjslibtag.setAttribute('data-package', '.');
                    mjslibtag.setAttribute('data-mjs-lib', 'true');
                    if (ninjaWrapper) {
                        template.file.content.document.body.getElementsByTagName('ninja-content')[0].appendChild(mjslibtag);
                    } else {
                        template.file.content.document.head.appendChild(mjslibtag);
                    }

                }
                //
                if (!mjstag) {
                    mjstag = template.file.content.document.createElement('script');
                    mjstag.setAttribute('type', 'text/montage-serialization');
                    if (ninjaWrapper) {
                        template.file.content.document.body.getElementsByTagName('ninja-content')[0].appendChild(mjstag);
                    } else {
                        template.file.content.document.head.appendChild(mjstag);
                    }

                }
                //
                mjstag.innerHTML = mJsSerialization;
                mjsCreator = null;
            }













            //Cleaning URLs from HTML
            var cleanHTML;
            if (ninjaWrapper) {
                cleanHTML = template.file.content.document.body.innerHTML.replace(/(\b(?:(?:https?|ftp|file|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gi, parseNinjaRootUrl.bind(this));
            } else {
                cleanHTML = template.file.content.document.documentElement.outerHTML.replace(/(\b(?:(?:https?|ftp|file|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gi, parseNinjaRootUrl.bind(this));
            }
            //TODO: Remove, this is a temp hack to maintain a doc type on HTML files
            cleanHTML = '<!DOCTYPE html>'+cleanHTML;
            //
            function parseNinjaRootUrl(url) {
                if (url.indexOf(this.application.ninja.coreIoApi.rootUrl) !== -1) {
                    return this.getUrlfromNinjaUrl(url, rootUrl, rootUrl.replace(new RegExp((this.application.ninja.coreIoApi.rootUrl).replace(/\//gi, '\\\/'), 'gi'), '') + 'file.ext');
                } else {
                    return url;
                }
            }
            //
            if (ninjaWrapper) {
                cleanHTML = cleanHTML.replace(/ninja-viewport/gi, 'div');
                cleanHTML = cleanHTML.replace(/ninja-content/gi, 'div');
            }
            //
            if (libsobserver.montage || libsobserver.canvas) {
                return {content: this.getPrettyHtml(cleanHTML.replace(this.getAppTemplatesUrlRegEx(), '')), libs: true, montageId: libsobserver.montageId, canvasId: libsobserver.canvasId};
            } else {
                return {content: this.getPrettyHtml(cleanHTML.replace(this.getAppTemplatesUrlRegEx(), '')), libs: false, montageId: libsobserver.montageId, canvasId: libsobserver.canvasId};
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    libCopied: {
        value: function (observer) {
            if (observer.montage && observer.canvas) {
                //
                if (observer.montageCopied && observer.canvasCopied) {
                    if (observer.callback && !observer.dispatched) observer.callback(true);
                    observer.dispatched = true;
                } else if (observer.montageCopied === false || observer.canvasCopied === false) {
                    if (observer.callback && !observer.dispatched) observer.callback(false);
                    observer.dispatched = true;
                }
            } else if (observer.montage) {
                //
                if (observer.montageCopied) {
                    if (observer.callback && !observer.dispatched) observer.callback(true);
                    observer.dispatched = true;
                } else {
                    if (observer.callback && !observer.dispatched) observer.callback(false);
                    observer.dispatched = true;
                }
            } else if (observer.canvas) {
                //
                if (observer.canvasCopied) {
                    if (observer.callback && !observer.dispatched) observer.callback(true);
                    observer.dispatched = true;
                } else {
                    if (observer.callback && !observer.dispatched) observer.callback(false);
                    observer.dispatched = true;
                }
            } else {
                //Error
                if (observer.callback && !observer.dispatched) observer.callback(false);
                observer.dispatched = true;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getUrlfromNinjaUrl: {
        enumerable: false,
        value: function (url, fileRootUrl, fileUrl) {
            //
            if (url.indexOf(fileRootUrl) !== -1) {
                url = url.replace(new RegExp(fileRootUrl.replace(/\//gi, '\\\/'), 'gi'), '');
            } else {
                //TODO: Clean up vars
                var assetsDirs = (url.replace(new RegExp((this.application.ninja.coreIoApi.rootUrl).replace(/\//gi, '\\\/'), 'gi'), '')).split('/');
                var fileDirs = (fileUrl.split(fileUrl.split('/')[fileUrl.split('/').length - 1])[0]).split('/');
                var counter = 0;
                var path = '';
                var newURL = '';
                //
                for (var p = 0; p < fileDirs.length - 1; p++) {
                    if (fileDirs[p] === assetsDirs[p]) {
                        counter++;
                    }
                }
                //
                for (var p = 0; p < (fileDirs.length - counter) - 1; p++) {
                    path += '../';
                }
                //
                for (var p = counter; p < assetsDirs.length; p++) {
                    newURL += '/' + assetsDirs[p];
                }
                //
                url = (path + newURL).replace(/\/\//gi, '/');
            }
            //
            return url;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getDocRootUrl: {
        value: function () {
            //TODO: Add support for model.baseHref (base tag)
            return this.application.ninja.coreIoApi.rootUrl + escape((this.application.ninja.documentController.documentHackReference.root.split(this.application.ninja.coreIoApi.cloudData.root)[1]).replace(/\/\//gi, '/'));
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getNinjaPropUrlRedirect: {
        enumerable: false,
        value: function (prop/* , root */) {
            //Checking for property value to not contain a full direct URL
            if (!prop.match(/(\b(?:(?:https?|ftp|file|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gi)) {
                //Checking for attributes and type of source
                if (prop.indexOf('href') !== -1 || prop.indexOf('src') !== -1) {
                    //From HTML attribute
                    //if (root) {
                    //prop = (root+prop).replace(/"([^"]*)"/gi, this.getNinjaUrlPrepend.bind(this));
                    //} else {
                    prop = prop.replace(/"([^"]*)"/gi, this.getNinjaUrlPrepend.bind(this));
                    //}
                } else if (prop.indexOf('url') !== -1) {
                    //From CSS property
                    //if (root) {
                    //prop = (root+prop).replace(/[^()\\""\\'']+/g, cssUrlToNinjaUrl.bind(this));
                    //} else {
                    prop = prop.replace(/[^()\\""\\'']+/g, cssUrlToNinjaUrl.bind(this));
                    //}
                    function cssUrlToNinjaUrl(s) {
                        if (s !== 'url') {
                            s = this.getDocRootUrl() + s;
                        }
                        return s;
                    }
                }
            }
            return prop;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    getNinjaUrlPrepend: {
        value: function (url) {
            if (url.indexOf('data:') !== -1) {
                return url;
            } else {
                return '"' + this.getDocRootUrl() + url.replace(/\"/gi, '') + '"';
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //Method to return a string from CSS rules (to be saved to a file)
    getCssFromRules: {
        value: function (list) {
            //Variable to store CSS definitions
            var i, str, css = '';
            //Looping through list
            if (list && list.length > 0) {
                //Adding each list item to string and also adding breaks
                for (i = 0; list[i]; i++) {
                    css += list[i].cssText;
                }
            }
            //Returning the CSS string
            return this.getPrettyCss(css.replace(this.getAppTemplatesUrlRegEx(), ''));
        }
    },
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    //Pretty methods (minified)
    /*
    is-beautify javascript code courtesy of Einar Lielmanis:
    Code from https://github.com/einars/js-beautify
    License https://github.com/einars/js-beautify/blob/master/license.txt
    Used with author's permission, as stated below

    Copyright (c) 2009 - 2011, Einar Lielmanis
    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.
    */
    //For HTML, including any JS or CSS (single string/file)
    getPrettyHtml: {
        value: function (a, b) { function h() { this.pos = 0; this.token = ""; this.current_mode = "CONTENT"; this.tags = { parent: "parent1", parentcount: 1, parent1: "" }; this.tag_type = ""; this.token_text = this.last_token = this.last_text = this.token_type = ""; this.Utils = { whitespace: "\n\r\t ".split(""), single_token: "br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed".split(","), extra_liners: "head,body,/html".split(","), in_array: function (a, b) { for (var c = 0; c < b.length; c++) { if (a === b[c]) { return true } } return false } }; this.get_content = function () { var a = ""; var b = []; var c = false; while (this.input.charAt(this.pos) !== "<") { if (this.pos >= this.input.length) { return b.length ? b.join("") : ["", "TK_EOF"] } a = this.input.charAt(this.pos); this.pos++; this.line_char_count++; if (this.Utils.in_array(a, this.Utils.whitespace)) { if (b.length) { c = true } this.line_char_count--; continue } else if (c) { if (this.line_char_count >= this.max_char) { b.push("\n"); for (var d = 0; d < this.indent_level; d++) { b.push(this.indent_string) } this.line_char_count = 0 } else { b.push(" "); this.line_char_count++ } c = false } b.push(a) } return b.length ? b.join("") : "" }; this.get_contents_to = function (a) { if (this.pos == this.input.length) { return ["", "TK_EOF"] } var b = ""; var c = ""; var d = new RegExp("</" + a + "\\s*>", "igm"); d.lastIndex = this.pos; var e = d.exec(this.input); var f = e ? e.index : this.input.length; if (this.pos < f) { c = this.input.substring(this.pos, f); this.pos = f } return c }; this.record_tag = function (a) { if (this.tags[a + "count"]) { this.tags[a + "count"]++; this.tags[a + this.tags[a + "count"]] = this.indent_level } else { this.tags[a + "count"] = 1; this.tags[a + this.tags[a + "count"]] = this.indent_level } this.tags[a + this.tags[a + "count"] + "parent"] = this.tags.parent; this.tags.parent = a + this.tags[a + "count"] }; this.retrieve_tag = function (a) { if (this.tags[a + "count"]) { var b = this.tags.parent; while (b) { if (a + this.tags[a + "count"] === b) { break } b = this.tags[b + "parent"] } if (b) { this.indent_level = this.tags[a + this.tags[a + "count"]]; this.tags.parent = this.tags[b + "parent"] } delete this.tags[a + this.tags[a + "count"] + "parent"]; delete this.tags[a + this.tags[a + "count"]]; if (this.tags[a + "count"] == 1) { delete this.tags[a + "count"] } else { this.tags[a + "count"]-- } } }; this.get_tag = function () { var a = ""; var b = []; var c = false; do { if (this.pos >= this.input.length) { return b.length ? b.join("") : ["", "TK_EOF"] } a = this.input.charAt(this.pos); this.pos++; this.line_char_count++; if (this.Utils.in_array(a, this.Utils.whitespace)) { c = true; this.line_char_count--; continue } if (a === "'" || a === '"') { if (!b[1] || b[1] !== "!") { a += this.get_unformatted(a); c = true } } if (a === "=") { c = false } if (b.length && b[b.length - 1] !== "=" && a !== ">" && c) { if (this.line_char_count >= this.max_char) { this.print_newline(false, b); this.line_char_count = 0 } else { b.push(" "); this.line_char_count++ } c = false } b.push(a) } while (a !== ">"); var d = b.join(""); var e; if (d.indexOf(" ") != -1) { e = d.indexOf(" ") } else { e = d.indexOf(">") } var f = d.substring(1, e).toLowerCase(); if (d.charAt(d.length - 2) === "/" || this.Utils.in_array(f, this.Utils.single_token)) { this.tag_type = "SINGLE" } else if (f === "script") { this.record_tag(f); this.tag_type = "SCRIPT" } else if (f === "style") { this.record_tag(f); this.tag_type = "STYLE" } else if (this.Utils.in_array(f, unformatted)) { var g = this.get_unformatted("</" + f + ">", d); b.push(g); this.tag_type = "SINGLE" } else if (f.charAt(0) === "!") { if (f.indexOf("[if") != -1) { if (d.indexOf("!IE") != -1) { var g = this.get_unformatted("-->", d); b.push(g) } this.tag_type = "START" } else if (f.indexOf("[endif") != -1) { this.tag_type = "END"; this.unindent() } else if (f.indexOf("[cdata[") != -1) { var g = this.get_unformatted("]]>", d); b.push(g); this.tag_type = "SINGLE" } else { var g = this.get_unformatted("-->", d); b.push(g); this.tag_type = "SINGLE" } } else { if (f.charAt(0) === "/") { this.retrieve_tag(f.substring(1)); this.tag_type = "END" } else { this.record_tag(f); this.tag_type = "START" } if (this.Utils.in_array(f, this.Utils.extra_liners)) { this.print_newline(true, this.output) } } return b.join("") }; this.get_unformatted = function (a, b) { if (b && b.indexOf(a) != -1) { return "" } var c = ""; var d = ""; var e = true; do { if (this.pos >= this.input.length) { return d } c = this.input.charAt(this.pos); this.pos++; if (this.Utils.in_array(c, this.Utils.whitespace)) { if (!e) { this.line_char_count--; continue } if (c === "\n" || c === "\r") { d += "\n"; this.line_char_count = 0; continue } } d += c; this.line_char_count++; e = true } while (d.indexOf(a) == -1); return d }; this.get_token = function () { var a; if (this.last_token === "TK_TAG_SCRIPT" || this.last_token === "TK_TAG_STYLE") { var b = this.last_token.substr(7); a = this.get_contents_to(b); if (typeof a !== "string") { return a } return [a, "TK_" + b] } if (this.current_mode === "CONTENT") { a = this.get_content(); if (typeof a !== "string") { return a } else { return [a, "TK_CONTENT"] } } if (this.current_mode === "TAG") { a = this.get_tag(); if (typeof a !== "string") { return a } else { var c = "TK_TAG_" + this.tag_type; return [a, c] } } }; this.get_full_indent = function (a) { a = this.indent_level + a || 0; if (a < 1) return ""; return Array(a + 1).join(this.indent_string) }; this.printer = function (a, b, c, d, e) { this.input = a || ""; this.output = []; this.indent_character = b; this.indent_string = ""; this.indent_size = c; this.brace_style = e; this.indent_level = 0; this.max_char = d; this.line_char_count = 0; for (var f = 0; f < this.indent_size; f++) { this.indent_string += this.indent_character } this.print_newline = function (a, b) { this.line_char_count = 0; if (!b || !b.length) { return } if (!a) { while (this.Utils.in_array(b[b.length - 1], this.Utils.whitespace)) { b.pop() } } b.push("\n"); for (var c = 0; c < this.indent_level; c++) { b.push(this.indent_string) } }; this.print_token = function (a) { this.output.push(a) }; this.indent = function () { this.indent_level++ }; this.unindent = function () { if (this.indent_level > 0) { this.indent_level-- } } }; return this } var c, d, e, f, g; b = b || {}; d = b.indent_size || 4; e = b.indent_char || " "; g = b.brace_style || "collapse"; f = b.max_char || "999999"; unformatted = b.unformatted || ["a"]; c = new h; c.printer(a, e, d, f, g); while (true) { var i = c.get_token(); c.token_text = i[0]; c.token_type = i[1]; if (c.token_type === "TK_EOF") { break } switch (c.token_type) { case "TK_TAG_START": c.print_newline(false, c.output); c.print_token(c.token_text); c.indent(); c.current_mode = "CONTENT"; break; case "TK_TAG_STYLE": case "TK_TAG_SCRIPT": c.print_newline(false, c.output); c.print_token(c.token_text); c.current_mode = "CONTENT"; break; case "TK_TAG_END": if (c.last_token === "TK_CONTENT" && c.last_text === "") { var j = c.token_text.match(/\w+/)[0]; var k = c.output[c.output.length - 1].match(/<\s*(\w+)/); if (k === null || k[1] !== j) c.print_newline(true, c.output) } c.print_token(c.token_text); c.current_mode = "CONTENT"; break; case "TK_TAG_SINGLE": c.print_newline(false, c.output); c.print_token(c.token_text); c.current_mode = "CONTENT"; break; case "TK_CONTENT": if (c.token_text !== "") { c.print_token(c.token_text) } c.current_mode = "TAG"; break; case "TK_STYLE": case "TK_SCRIPT": if (c.token_text !== "") { c.output.push("\n"); var l = c.token_text; if (c.token_type == "TK_SCRIPT") { var m = typeof js_beautify == "function" && js_beautify } else if (c.token_type == "TK_STYLE") { var m = typeof this.getPrettyCss == "function" && this.getPrettyCss } if (b.indent_scripts == "keep") { var n = 0 } else if (b.indent_scripts == "separate") { var n = -c.indent_level } else { var n = 1 } var o = c.get_full_indent(n); if (m) { l = m(l.replace(/^\s*/, o), b) } else { var p = l.match(/^\s*/)[0]; var q = p.match(/[^\n\r]*$/)[0].split(c.indent_string).length - 1; var r = c.get_full_indent(n - q); l = l.replace(/^\s*/, o).replace(/\r\n|\r|\n/g, "\n" + r).replace(/\s*$/, "") } if (l) { c.print_token(l); c.print_newline(true, c.output) } } c.current_mode = "TAG"; break } c.last_token = c.token_type; c.last_text = c.token_text } return c.output.join("") }
    },
    //For CSS (single string/file)
    getPrettyCss: {
        value: function (a, b) { function t() { r--; p = p.slice(0, -c) } function s() { r++; p += q } function o(a, b) { return u.slice(-a.length + (b || 0), b).join("").toLowerCase() == a } function n() { var b = g; i(); while (i()) { if (h == "*" && j() == "/") { g++; break } } return a.substring(b, g + 1) } function m() { var a = g; do { } while (e.test(i())); return g != a + 1 } function l() { var a = g; while (e.test(j())) g++; return g != a } function k(b) { var c = g; while (i()) { if (h == "\\") { i(); i() } else if (h == b) { break } else if (h == "\n") { break } } return a.substring(c, g + 1) } function j() { return a.charAt(g + 1) } function i() { return h = a.charAt(++g) } b = b || {}; var c = b.indent_size || 4; var d = b.indent_char || " "; if (typeof c == "string") c = parseInt(c); var e = /^\s+$/; var f = /[\w$\-_]/; var g = -1, h; var p = a.match(/^[\r\n]*[\t ]*/)[0]; var q = Array(c + 1).join(d); var r = 0; print = {}; print["{"] = function (a) { print.singleSpace(); u.push(a); print.newLine() }; print["}"] = function (a) { print.newLine(); u.push(a); print.newLine() }; print.newLine = function (a) { if (!a) while (e.test(u[u.length - 1])) u.pop(); if (u.length) u.push("\n"); if (p) u.push(p) }; print.singleSpace = function () { if (u.length && !e.test(u[u.length - 1])) u.push(" ") }; var u = []; if (p) u.push(p); while (true) { var v = m(); if (!h) break; if (h == "{") { s(); print["{"](h) } else if (h == "}") { t(); print["}"](h) } else if (h == '"' || h == "'") { u.push(k(h)) } else if (h == ";") { u.push(h, "\n", p) } else if (h == "/" && j() == "*") { print.newLine(); u.push(n(), "\n", p) } else if (h == "(") { u.push(h); l(); if (o("url", -1) && i()) { if (h != ")" && h != '"' && h != "'") u.push(k(")")); else g-- } } else if (h == ")") { u.push(h) } else if (h == ",") { l(); u.push(h); print.singleSpace() } else if (h == "]") { u.push(h) } else if (h == "[" || h == "=") { l(); u.push(h) } else { if (v) print.singleSpace(); u.push(h) } } var w = u.join("").replace(/[\n ]+$/, ""); return w }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
