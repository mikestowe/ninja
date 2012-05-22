/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 	require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component,
    TextDocumentModel = require("js/document/models/text").TextDocumentModel,
    CodeDocumentView = require("js/document/views/code").CodeDocumentView;
////////////////////////////////////////////////////////////////////////
//	
exports.TextDocument = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
		enumerable: false,
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
        enumerable: false,
        value : function(file, context, callback, view){
            var codeDocumentView = CodeDocumentView.create(), container = null;

            //Creating instance of Text Document Model
            this.model = Montage.create(TextDocumentModel,{
                file: {value: file},
                parentContainer: {value: document.getElementById("codeViewContainer")},
                views: {value: {'code': codeDocumentView, 'design': null}}
            });

            codeDocumentView.initialize(this.model.parentContainer);

            codeDocumentView.textArea.value = file.content;
            codeDocumentView.initializeTextView(file, this);

            if (view === 'code') {
                //TODO: Remove reference and use as part of model
                this.currentView = 'code';
                //Setting current view object to design
                this.model.currentView = this.model.views.code;
            }


            callback.call(context, this);
        }
    },
////////////////////////////////////////////////////////////////////
    //
    closeDocument: {
    		value: function (context, callback) {
    			var closed = this.model.close(null);

                callback.call(context, this);
    		}
    	}
////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////