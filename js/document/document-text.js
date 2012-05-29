/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component,
    TextDocumentModel = require("js/document/models/text").TextDocumentModel,
    CodeDocumentView = 	require("js/document/views/code").CodeDocumentView;
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