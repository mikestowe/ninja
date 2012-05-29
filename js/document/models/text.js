/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
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
                this.application.ninja.stage.showCodeViewBar(false);
                this.application.ninja.stage.restoreAllPanels();
                this.views.code = null;

            	//
            	return success;
            }
        }
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////