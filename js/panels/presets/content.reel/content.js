/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
        }
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
