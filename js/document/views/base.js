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
var Montage =   require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    UrlParser = require("js/document/helpers/url-parser").UrlParser;
////////////////////////////////////////////////////////////////////////
//
exports.BaseDocumentView = Montage.create(Component, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    urlParser: {
        value: UrlParser
    },
    ////////////////////////////////////////////////////////////////////
    //
    _iframe: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: This should be renamed to better illustrate it's a container (iframe for design, div for code view)
    iframe: {
        get: function() {return this._iframe;},
        set: function(value) {this._iframe= value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    show: {
        value: function (callback) {
            if (this.iframe) {
                this.iframe.style.display = 'block';
                this.iframe.style.opacity = 1;
                this.toggleWebGlAnimation(true);
            } else {
                console.log('Error: View has no iframe to show!');
            }
            //
            if (callback) callback();
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    hide: {
        value: function (callback) {
            if (this.iframe) {
                this.iframe.style.display = 'none';
                this.iframe.style.opacity = 0;
                this.pauseVideos();
                this.toggleWebGlAnimation(false);
            } else {
                console.log('Error: View has no iframe to hide!');
            }
            //
            if (callback) callback();
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
