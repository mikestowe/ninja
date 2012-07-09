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
    BaseDocumentModel = require("js/document/models/base").BaseDocumentModel;
////////////////////////////////////////////////////////////////////////
//
exports.TextDocumentModel = Montage.create(BaseDocumentModel, {
    ////////////////////////////////////////////////////////////////////
    //
    hasTemplate: {
        enumerable: false,
        value: false
    },
////////////////////////////////////////////////////////////////////
    //
    save: {
        enumerable: false,
        value: function (callback) {
            this.application.ninja.currentDocument.model.views.code.editor.save();//save to textarea

            var self = this;

            this.application.ninja.ioMediator.fileSave({
                mode: ""+ self.file.extension,
                file: self.file,
                content:self.views.code.textArea.value
            }, this.handleSaved.bind({callback: callback, model: this}));
        }
    },
////////////////////////////////////////////////////////////////////
    //
    handleSaved: {
            value: function (result) {
                //
                if (result.status === 204) {
                    this.model.needsSave = false;
                }
                //
                if (this.callback) this.callback(result);
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
                this.parentContainer.removeChild(this.views.code.textViewContainer);
                this.application.ninja.stage.restoreAllPanels();
                this.views.code = null;

                //
                return success;
            }
        }
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
