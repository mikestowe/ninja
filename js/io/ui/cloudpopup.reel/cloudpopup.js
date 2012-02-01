/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 			require("montage/core/core").Montage,
	Component = 		require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//
exports.CloudPopup = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
	//
	hasTemplate: {
        value: true
    },
    ////////////////////////////////////////////////////////////////////
    //
    components: {
    	enumerable: false,
    	value: {test_btn: null, ok_btn: null, cancel_btn: null, status: null, url: null}
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
    	enumerable: false,
    	value: function () {
    		//
    		this.components.test_btn = this.element.getElementsByClassName('btn_test')[0];
    		this.components.ok_btn = this.element.getElementsByClassName('btn_ok')[0];
    		this.components.cancel_btn = this.element.getElementsByClassName('btn_cancel')[0];
    		this.components.status = this.element.getElementsByClassName('status')[0];
    		this.components.url = this.element.getElementsByClassName('cloud_url')[0];
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    willDraw: {
    	enumerable: false,
    	value: function() {
    		//
    		
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
    	enumerable: false,
    	value: function() {
    		//
    		this.testConnection();
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    didDraw: {
    	enumerable: false,
    	value: function() {
    		//
    		this.components.test_btn.addEventListener('click', this.testConnection.bind(this), false);
    		//
    		this.components.ok_btn.addEventListener('click', this.closeDialog.bind(this), false);
    		this.components.cancel_btn.addEventListener('click', this.closeDialog.bind(this), false);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //this.application.ninja.coreIoApi.hideCloudDialog
    testConnection: {
    	enumerable: false,
    	value: function() {
    		//
    		this.application.ninja.coreIoApi.rootUrl = this.components.url.value;
    		//
   			if (this.application.ninja.coreIoApi.cloudAvailable()) {
    			this.components.status.style.color = '#77FF00';
    			this.components.status.innerHTML = 'Connected';
    		} else {
    			this.components.status.style.color = '#FF3A3A';
    			this.components.status.innerHTML = 'Disconnected';
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    closeDialog: {
    	enumerable: false,
    	value: function() {
    		//
    		this.application.ninja.coreIoApi.hideCloudDialog();
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////