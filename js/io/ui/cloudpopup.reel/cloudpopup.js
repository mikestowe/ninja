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
            if (this.application.localStorage.getItem("ioRootUrl")) {
                this.components.url.value = this.application.localStorage.getItem("ioRootUrl");
    		}
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
    	}
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
