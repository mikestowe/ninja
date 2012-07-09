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

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.content = Montage.create(Component, {
    hasTemplate: {
        value: true
    },
    contentPanel : {
        value: null
    },
    activeTabIndex: {
        value: null,
        serializable: true
    },
    templateDidLoad : {
        value: function() {
            var storedTabIndex = this.application.localStorage.getItem("presetsTabIndex");
            if(storedTabIndex) {
                this.activeTabIndex = storedTabIndex;
            }
        }
    },
    prepareForDraw : {
        value: function() {
            this.activeTab = this.tabs[this.activeTabIndex];
            this.tabBar.addEventListener('click', this, false);
        }
    },
    handleClick : {
        value: function(e) {
            var tabObject = this.tabs.filter(function(item) {
                return item.tab === e._event.target;
            });

            if(tabObject[0]) {
                this.activeTab = tabObject[0];
            }

        }
    },
    _activeTab : {
        value: null,
        enumerable: false
    },
    activeTab : {
        get: function() {
            return this._activeTab;
        },
        set: function(tabObject) {
            this.contentPanel = tabObject.key;
            this.application.localStorage.setItem("presetsTabIndex", this.tabs.indexOf(tabObject));
            this._tabToDeactivate = this._activeTab;
            this._activeTab = tabObject;

            this.needsDraw = this._needsTabSwitch = true;
        },
        serializable: true
    },
    tabBar: {
        value: null,
        serializable: true
    },
    tabs:{
        value: null,
        serializable: true
    },
    _tabToDeactivate : {
        value: null,
        enumarable: false
    },
    _needsTabSwitch : {
        value: null,
        enumerable: false
    },
    draw : {
        value: function() {
            if(this._needsTabSwitch) {
                if(this._tabToDeactivate) {
                    this._tabToDeactivate.tab.classList.remove('active-tab');
                }

                this._activeTab.tab.classList.add('active-tab');
            }
        }
    }
});
