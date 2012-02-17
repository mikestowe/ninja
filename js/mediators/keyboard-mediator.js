/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// The following class is responsible for listening for keydown events.

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

// Put the keyboard constants in the global scope.
var Keyboard = exports.Keyboard = {
    BACKSPACE:8,
    TAB:9,
    ENTER:13,
    SHIFT:16,
    ALT:18,
    DELETE:46,
    LEFT:37,
    UP:38,
    RIGHT:39,
    DOWN:40,
    ESCAPE: 27,
    SPACE: 32,

    A:65,
    B:66,
    C:67,
    D:68,
    E:69,
    F:70,
    G:71,
    H:72,
    I:73,
    J:74,
    K:75,
    L:76,
    M:77,
    N:78,
    O:79,
    P:80,
    Q:81,
    R:82,
    S:83,
    T:84,
    U:85,
    V:86,
    W:87,
    X:88,
    Y:89,
    Z:90,
    PLUS:187,
    MINUS:189
};

exports.KeyboardMediator = Montage.create(Component, {

    deserializedFromTemplate: {
        value: function() {
            this.eventManager.addEventListener("appLoaded", this, false);
        }
    },

    handleAppLoaded: {
        value: function() {
            document.addEventListener("keydown", this, false);
            document.addEventListener("keyup", this, false);

            this.addEventListener("change@appModel.livePreview", this.handleLivePreview, false);
        }
    },

    handleLivePreview: {
        value: function() {
            if(this.appModel.livePreview) {
                document.removeEventListener("keydown", this, false);
                document.removeEventListener("keyup", this, false);
            } else {
                document.addEventListener("keydown", this, false);
                document.addEventListener("keyup", this, false);
            }
        }
    },

    handleKeydown: {
        value: function(evt) {
            if(document.activeElement.nodeName !== "BODY") {
                // Don't do anything if an input or other control is focused
                return;
            }

            // Disable defaults for the Arrow Keys
            if((evt.keyCode == Keyboard.LEFT) || (evt.keyCode == Keyboard.RIGHT) || (evt.keyCode == Keyboard.UP) || (evt.keyCode == Keyboard.DOWN)) {
                evt.preventDefault();
            }

            // Check DELETE OR BACKSPACE
            if((evt.keyCode == Keyboard.BACKSPACE) || (evt.keyCode == Keyboard.DELETE)) {
                evt.stopImmediatePropagation();
                evt.preventDefault();
                NJevent("deleting");
                return;
            }

            // Check if cmd+z/ctrl+z for Undo (Windows/Mac)
            if ((evt.keyCode == Keyboard.Z) && (evt.ctrlKey || evt.metaKey) && !evt.shiftKey) {
                NJevent("executeUndo");
                //menuViewManagerModule.MenuViewManager.closeMenu("mainMenuBar");
                return;
            }

            // Check if cmd+shift+z for Redo (Mac)
            if ((evt.keyCode == Keyboard.Z) && evt.metaKey && evt.shiftKey) {
                NJevent("executeRedo");
                //menuViewManagerModule.MenuViewManager.closeMenu("mainMenuBar");
                return;
            }

            // Check if ctrl+y for Redo (Windows)
            if ((evt.keyCode == Keyboard.Y) && evt.ctrlKey) {
                NJevent("executeRedo");
                //menuViewManagerModule.MenuViewManager.closeMenu("mainMenuBar");
                return;
            }

            // Shortcut for Selection Tool is V
            if(evt.keyCode === Keyboard.V) {
                evt.preventDefault();
                this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[0]});
                return;
            }

            // Shortcut for Tag Tool is D
            if(evt.keyCode === Keyboard.D){
                evt.preventDefault();
                this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[4]});
                return;
            }

            // Shortcut for Rotate Tool is W
            if(evt.keyCode === Keyboard.W){
                evt.preventDefault();
                this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[2]});
                return;
            }

            // Shortcut for Translate Tool is G
            if(evt.keyCode === Keyboard.G){
                evt.preventDefault();
                this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[3]});
                return;
            }

            // Shortcut for Rectangle Tool is R
            // unless the user is pressing the command key.
            // If the user is pressing the command key, they want to refresh the browser.
            if((evt.keyCode === Keyboard.R) && !evt.metaKey) {
                evt.preventDefault();
                this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[7]});
                this.application.ninja.handleSelectSubTool({"detail": this.application.ninja.toolsData.defaultToolsData[7].subtools[1]});
                return;
            }

            // Shortcut for Oval Tool is O
            if(evt.keyCode === Keyboard.O) {
                evt.preventDefault();
                this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[7]});
                this.application.ninja.handleSelectSubTool({"detail": this.application.ninja.toolsData.defaultToolsData[7].subtools[0]});
                return;
            }

            // Shortcut for Line Tool is L
            if(evt.keyCode === Keyboard.L ) {
                evt.preventDefault();
                this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[7]});
                this.application.ninja.handleSelectSubTool({"detail": this.application.ninja.toolsData.defaultToolsData[7].subtools[2]});
                return;
            }

            if(evt.keyCode === Keyboard.H ) {
                evt.preventDefault();
                this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[15]});
                return;
            }

            if(evt.keyCode === Keyboard.Z ) {
                evt.preventDefault();
                this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[16]});
                return;
            }

            // Check if cmd+a/ctrl+a for Select All
            if((evt.keyCode == Keyboard.A) && (evt.ctrlKey || evt.metaKey)) {
                NJevent("selectAll");
                return;
            }

            if(evt.keyCode === Keyboard.ESCAPE){//ESC key
                //console.log("ESC key pressed");
                if(this.application.ninja.toolsData) this.application.ninja.toolsData.selectedToolInstance.HandleEscape(evt);
                //menuViewManagerModule.MenuViewManager.closeMenu("mainMenuBar");
            }
            
            // Check if cmd+a/ctrl+a for Select All
            if((evt.keyCode == Keyboard.ENTER) && (evt.ctrlKey || evt.metaKey)) {
                this.application.ninja.executeChromePreview();
                return;
            }

            if(this.application.ninja.toolsData) this.application.ninja.toolsData.selectedToolInstance.HandleKeyPress(evt);

        }
    },

    handleKeyup: {
        value: function(evt) {
            if(document.activeElement.nodeName !== "BODY") {
                // Don't do anything if an input or other control is focused
                return;
            }

            if(this.application.ninja.toolsData) this.application.ninja.toolsData.selectedToolInstance.HandleKeyUp(evt);
        }
    },
    
    _handleKeydown: {
        value: function(evt) {

            // Check if cmd-shift-+/ctrl-shift-+ for toggling snapping
            if(evt.shiftKey && (evt.ctrlKey || evt.metaKey) && (evt.keyCode === 187))
            {
                MainMenuModule.MenuActionManager.toggleSnapping("snap", !DocumentManagerModule.DocumentManager.activeDocument.snapping);
                evt.preventDefault();
                return;
            }

            if(evt.keyCode === Keyboard.PLUS && (evt.metaKey||evt.ctrlKey)) {
                evt.preventDefault();
                this._toolsList.action("zoomIn", evt);
                return;
            }

           if(evt.keyCode === Keyboard.MINUS && (evt.metaKey || evt.ctrlKey)) {
                evt.preventDefault();
                this._toolsList.action("zoomOut", evt);
                return;
            }

         }
    }
});
