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
    TextDocumentModel = require("js/document/models/text").TextDocumentModel,
    CodeDocumentView =  require("js/document/views/code").CodeDocumentView;
////////////////////////////////////////////////////////////////////////
//
exports.TextDocument = Montage.create(Component, {
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
    init:{
        value: function(file, context, callback, view){
            //
            var codeDocumentView = CodeDocumentView.create(), container = null; //TODO: Why is this initilzied to null?
            //Creating instance of Text Document Model
            this.model = Montage.create(TextDocumentModel,{
                file: {value: file},
                parentContainer: {value: document.getElementById("codeViewContainer")}, //TODO: Remove reference to this element, should be dynamic
                views: {value: {'code': codeDocumentView, 'design': null}} //TODO: Add check if file might have design view, if so, then create it
            });
            //TODO: Add design view logic
            //Initilizing view(s)
            codeDocumentView.initialize(this.model.parentContainer);
            //Checking for view specified
            if (view === 'code') {
                //TODO: Remove reference and use as part of model
                this.currentView = 'code';
                //Setting current view object to design
                this.model.currentView = this.model.views.code;
                //Rendering view
                codeDocumentView.textArea.value = file.content;
                codeDocumentView.initializeTextView(file, this);
            } else {
                //Other view(s) logic goes here
            }
            //Checking if callback is needed
            if (callback) callback.call(context, this);
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
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
