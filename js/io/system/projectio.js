/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var FileIo = require("js/io/system/fileio").FileIo;
////////////////////////////////////////////////////////////////////////
//Exporting as Project I/O
exports.ProjectIo = (require("montage/core/core").Montage).create(Object.prototype, {
	////////////////////////////////////////////////////////////////////
    //
    create: {
    	enumerable: false,
    	value: function () {
    	}
    },
	////////////////////////////////////////////////////////////////////
    //
    open: {
    	enumerable: false,
    	value: function(e) {
    		//TODO: Add functionality
    		console.log('ProjectIO: open');
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    save: {
    	enumerable: false,
    	value: function(type, id, components) {
    		//
    		var rObj;
    		//
    		switch (type) {
    			case 'montageapp':
    				//
    				var css = FileIo.save('css', id);
    				var html = FileIo.save('html', id, components);
    				//
    				rObj = {html: html, css: css};
    				break;
    			default:
    				break;
    		}
    		//
    		return rObj;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    saveAs: {
    	enumerable: false,
    	value: function(e) {
    		//TODO: Add functionality
    		console.log('ProjectIO: saveAs');
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////