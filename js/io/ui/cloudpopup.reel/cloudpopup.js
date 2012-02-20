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
	_os: {
        value: null
    },
    ////////////////////////////////////////////////////////////////////
    //
    callback:{
        writable:true,
        enumerable:true,
        value:null
    },
    //
    components: {
    	enumerable: false,
    	value: {test_btn: null, ok_btn: null, cancel_btn: null, download_btn: null, status: null, url: null}
    },
    ////////////////////////////////////////////////////////////////////
    //
    prepareForDraw: {
    	enumerable: false,
    	value: function () {
    		//
    		this.components.test_btn = this.element.getElementsByClassName('btn_test nj-skinned')[0];
    		this.components.ok_btn = this.element.getElementsByClassName('btn_ok nj-skinned')[0];
    		this.components.cancel_btn = this.element.getElementsByClassName('btn_cancel nj-skinned')[0];
    		this.components.status = this.element.getElementsByClassName('status')[0];
    		this.components.url = this.element.getElementsByClassName('cloud_url')[0];
    		this.components.download_btn = this.element.getElementsByClassName('btn_download nj-skinned')[0];
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    willDraw: {
    	enumerable: false,
    	value: function() {
    		//
    		if (navigator.appVersion.indexOf("Win")!=-1) {
    			this._os = 'windows';
    		} else if (navigator.appVersion.indexOf("Mac")!=-1) {
    			this._os = 'mac';
    		} else {
    			//Alternate message for no OS detected (probably Linux)
    			this.element.getElementsByTagName('section')[0].style.display = 'none';
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    draw: {
    	enumerable: false,
    	value: function() {
    		//
    		this.testConnection();
    		if (this.application.ninja.coreIoApi.cloudAvailable()) {
    			this.closeDialog();
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    didDraw: {
    	enumerable: false,
    	value: function() {
    		//
    		this.components.download_btn.addEventListener('click', this.downloadCloudApp.bind(this), false);
    		//
    		this.components.test_btn.addEventListener('click', this.testConnection.bind(this), false);
    		//
    		this.components.ok_btn.addEventListener('click', this.closeDialog.bind(this), false);
    		this.components.cancel_btn.addEventListener('click', this.cancelDialog.bind(this), false);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    downloadCloudApp: {
    	enumerable: false,
    	value: function() {
    		if(this._os === 'mac') {
    			location.href = '/ninja_localcloud_for_mac.zip';
    		} else if (this._os === 'windows') {
    			location.href = '/ninja_localcloud_for_windows.zip';
    		} else {
    			alert('Your operating system is not supported by the Ninja Local Cloud App.');
    		}
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    testConnection: {
    	enumerable: false,
    	value: function() {
    		//
    		this.application.ninja.coreIoApi.rootUrl = this.components.url.value;
    		//
   			if (this.application.ninja.coreIoApi.cloudAvailable()) {
    			this.components.status.style.color = '#77FF00';
    			this.components.status.innerHTML = 'Connected to '+this.application.ninja.coreIoApi.cloudData.name;
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
            this.application.ninja.coreIoApi._cloudDialogOpen=false;
            if(!!this.callback){
                this.callback();
            }
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    cancelDialog: {
    	enumerable: false,
    	value: function() {
    		//
    		this.application.ninja.coreIoApi.rootUrl = null;
    		this.application.ninja.coreIoApi.hideCloudDialog();
            this.application.ninja.coreIoApi._cloudDialogOpen=false;
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////