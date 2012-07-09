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
    Component = require("montage/ui/component").Component,
    AboutBoxPopup = require("js/components/about-box.reel").AboutBox;

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
            AboutBoxPopup.show();
        }
    }
});
