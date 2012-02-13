/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.MainMenuController = Montage.create(Component, {
    deserializedFromTemplate:{
        value:function () {
            this.eventManager.addEventListener("executeHelpFAQ", this, false);
            this.eventManager.addEventListener("executeHelpForums", this, false);
            this.eventManager.addEventListener("executeHelpTopics", this, false);
            this.eventManager.addEventListener("executeHelpAbout", this, false);
        }
    },

    // Basic help menu handling methods
    handleExecuteHelpFAQ:{
        value:function () {
            window.open('http://www.tetsubo.org/go/ninjafaq');
        }
    },
    handleExecuteHelpForums:{
        value:function () {
            window.open('http://www.tetsubo.org/go/ninjaforums');
        }
    },
    handleExecuteHelpTopics:{
        value:function () {
            window.open('http://www.tetsubo.org/go/ninjadocs');
        }
    },
    handleExecuteHelpAbout:{
        value:function () {
            // TODO
            console.log("Pull up the about popup");
        }
    }
});
