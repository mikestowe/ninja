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
var Montage =   require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//
exports.UrlParser = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    parseStyleUrls: {
        value: function (css, href, local) {
            //
            if (local) {
                var fileCouldDirUrl = href.split(href.split('/')[href.split('/').length-1])[0];
            } else {
                //TODO: Add logic for external URLs
            }
            //TODO: Clean up functions
            css = css.replace(/url\(()(.+?)\1\)/g, parseToNinjaUrl.bind(this));
            //
            function parseToNinjaUrl (prop) {
                //
                return prop.replace(/[^()\\""\\'']+/g, prefixWithNinjaUrl.bind(this));
            }
            //
            function prefixWithNinjaUrl (url) {
                //
                if (url !== 'url' && !url.match(/(\b(?:(?:https?|ftp|file|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gi)) {
                    url = fileCouldDirUrl+url;
                }
                //
                return url;
            }
            //
            return css;
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    loadLocalStyleSheet: {
        value: function (href) {
            //Getting file URI (not URL since we must load through I/O API)
            var css = {}, file;
            css.cssUrl =  href.split(this.application.ninja.coreIoApi.rootUrl)[1];
            css.fileUri = this.application.ninja.coreIoApi.cloudData.root + unescape(css.cssUrl);
            //Loading data from CSS file
            file = this.application.ninja.coreIoApi.readFile({uri: css.fileUri});
            //Checking for file to be writable on disk
            css.writable = JSON.parse(this.application.ninja.coreIoApi.isFileWritable({uri: css.fileUri}).content).readOnly;
            //Returning loaded file
            if (file && file.content) {
                //Getting file contents
                css.content = this.parseStyleUrls(file.content, href, true);
                //Returning CSS object
                return css;
            } else {
                return false;
            }
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    loadExternalStyleSheet: {
        value: function (href) {
            //Loading external file
            var file = this.application.ninja.coreIoApi.readExternalFile({url: href, binary: false});
            //Returning file
            return file;
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
