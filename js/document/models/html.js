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
var Montage =               require("montage/core/core").Montage,
    BaseDocumentModel =     require("js/document/models/base").BaseDocumentModel,
    webGlDocumentHelper =   require("js/document/helpers/webgl-helper").webGlDocumentHelper;
////////////////////////////////////////////////////////////////////////
//
exports.HtmlDocumentModel = Montage.create(BaseDocumentModel, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //Called by the document immidiately after the model is created
    init: {
        value:function() {
            //Creating instance of the webGL helper for this model
            this.webGlHelper = webGlDocumentHelper.create();
            //
            this.libs = {montage: false, canvas: false, montageId: null, canvasId: null};
        }
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw3DGrid: {
        value: false
    },
    ////////////////////////////////////////////////////////////////////
    //
    scrollLeft: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    scrollTop: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    userContentLeft: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    userContentTop: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Convert to bindings
    documentRoot: {
        get: function() {return this.views.design._documentRoot;},
        set: function(value) {this.views.design._documentRoot = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //TODO: Convert to bindings
    baseHref: {
        get: function() {return this.views.design._baseHref;},
        set: function(value) {this.views.design._baseHref = value;}
    },
    ////////////////////////////////////////////////////////////////////
    //
    webGlHelper: {
        value: null
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////

});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
