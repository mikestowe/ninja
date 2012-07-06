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
    F5:116,
    F6:117,
    PLUS:187,
    MINUS:189
};

exports.KeyboardMediator = Montage.create(Component, {

    appModel: {
        value: null,
        serializable: true
    },

    deserializedFromTemplate: {
        value: function() {
            this.eventManager.addEventListener("appLoaded", this, false);
        }
    },

    handleAppLoaded: {
        value: function() {
            document.addEventListener("keydown", this, false);
            document.addEventListener("keyup", this, false);

            this.addPropertyChangeListener("appModel.livePreview", this.handleLivePreview, false);
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

            //keyboard controls for html design view
            // TODO - New template mode doesn't set currentView yet.
            if((!!this.application.ninja.currentDocument) && (this.application.ninja.currentDocument.currentView === "design")) {

                // Don't do anything if an input or other control is focused
                if(document.activeElement.nodeName !== "BODY") {
                    return;
                }

                // Disable defaults for the Arrow Keys
                if((evt.keyCode == Keyboard.LEFT) || (evt.keyCode == Keyboard.RIGHT) || (evt.keyCode == Keyboard.UP) || (evt.keyCode == Keyboard.DOWN)) {
                    evt.preventDefault();
                }

                // DELETE or BACKSPACE event handler - Removes the current selected elements from the DOM
                if((evt.keyCode == Keyboard.BACKSPACE) || (evt.keyCode == Keyboard.DELETE)) {
                    evt.stopImmediatePropagation();
                    evt.preventDefault();
                    return this.application.ninja.elementMediator.removeElements(document.application.ninja.selectedElements);
                }


                // Shortcut for Selection Tool is V
                if((evt.keyCode === Keyboard.V) && !(evt.ctrlKey || evt.metaKey)) {
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.selectionToolIndex] });
                    return;
                }

                // Shortcut for Tag Tool is D
                if(evt.keyCode === Keyboard.D){
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.tagToolIndex] });
                    return;
                }

                // Shortcut for Rotate Tool is W
                if(evt.keyCode === Keyboard.W){
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.rotate3DToolIndex] });
                    return;
                }

                // Shortcut for Translate Tool is G
                if(evt.keyCode === Keyboard.G){
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.translate3DToolIndex] });
                    return;
                }

                // shortcut for Pen tool is P
                if (evt.keyCode === Keyboard.P){
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.penToolIndex] });
                    return;
                }

                // shortcut for Brush tool is B
                if (evt.keyCode === Keyboard.B){
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.brushToolIndex] });
                    return;
                }
                
                // Shortcut for Rectangle Tool is R
                // unless the user is pressing the command key.
                // If the user is pressing the command key, they want to refresh the browser.
                if((evt.keyCode === Keyboard.R) && !evt.metaKey) {
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.shapeToolIndex] });
                    this.application.ninja.handleSelectSubTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.shapeToolIndex].subtools[1] });
                    return;
                }

                // Shortcut for Oval Tool is O
                if(evt.keyCode === Keyboard.O) {
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.shapeToolIndex] });
                    this.application.ninja.handleSelectSubTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.shapeToolIndex].subtools[0] });
                    return;
                }

                // Shortcut for Line Tool is L
                if(evt.keyCode === Keyboard.L ) {
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.shapeToolIndex] });
                    this.application.ninja.handleSelectSubTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.shapeToolIndex].subtools[2] });
                    return;
                }

                // Paint Bucket Tool and Ink Bottle tools share keyboard shortcut K
                if(evt.keyCode === Keyboard.K ) {
                    evt.preventDefault();
                    if(this.application.ninja.toolsData.selectedTool.id === "FillTool") {
                        this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.inkBottleToolIndex] });
                    } else if(this.application.ninja.toolsData.selectedTool.id === "InkBottleTool") {
                        this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.fillToolIndex] });
                    } else {
                        this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.fillToolIndex] });
                    }
                   return;
                }

                // Rotate Stage Tool is M
                if(evt.keyCode === Keyboard.M ) {
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({ "detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.rotateStage3DToolIndex] });
                    return;
                }

                // Hand tool
                if(evt.keyCode === Keyboard.H ) {
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.panToolIndex]});
                    return;
                }

                // Zoom tool
                if((evt.keyCode === Keyboard.Z) && !(evt.ctrlKey || evt.metaKey) && !evt.shiftKey) {//ctrl or shift key not press with Z
                    evt.preventDefault();
                    this.application.ninja.handleSelectTool({"detail": this.application.ninja.toolsData.defaultToolsData[this.application.ninja.toolsData.zoomToolIndex]});
                    return;
                }

                // F6 keyboard shortcut to add a keyframe to the timeline
                if (evt.keyCode == Keyboard.F6) {
                    this.application.ninja.timeline.handleKeyframeShortcut("insert");
                    return;
                }
                if (evt.keyCode == Keyboard.F5) {
                    this.application.ninja.timeline.handleKeyframeShortcut("remove");
                    return;
                }

                // Check if cmd+a/ctrl+a for Select All
                if((evt.keyCode == Keyboard.A) && (evt.ctrlKey || evt.metaKey)) {
                    NJevent("selectAll");
                    return;
                }

                if(evt.keyCode === Keyboard.ESCAPE){//ESC key
                    if(this.application.ninja.toolsData) this.application.ninja.toolsData.selectedToolInstance.HandleEscape(evt);
                }


                if((evt.keyCode == Keyboard.ENTER) && (evt.ctrlKey || evt.metaKey)) {
                    this.application.ninja.executeChromePreview();
                    return;
                }

                if(this.application.ninja.toolsData) this.application.ninja.toolsData.selectedToolInstance.HandleKeyPress(evt);

            }

            // Check if cmd+z/ctrl+z for Undo (Windows/Mac)
            if ((evt.keyCode == Keyboard.Z) && (evt.ctrlKey || evt.metaKey) && !evt.shiftKey) {
                document.application.undoManager.undo();
                return;
            }

            // Check if cmd+shift+z for Redo (Mac)
            if ((evt.keyCode == Keyboard.Z) && evt.metaKey && evt.shiftKey) {
                document.application.undoManager.redo();
                return;
            }

             // Check if ctrl+y for Redo (Windows)
            if ((evt.keyCode == Keyboard.Y) && evt.ctrlKey) {
                document.application.undoManager.redo();
                return;
            }

            // Check if cmd+s/ctrl+s for Save (Windows/Mac)
            if ((evt.keyCode == Keyboard.S) && (evt.ctrlKey || evt.metaKey) && !evt.shiftKey) {
                NJevent("executeSave");
                evt.preventDefault();
            }
        }
    },

    handleKeyup: {
        value: function(evt) {
             //keyboard controls for html design view
            if((!!this.application.ninja.currentDocument) && (this.application.ninja.currentDocument.currentView === "design")) {
                if(document.activeElement.nodeName !== "BODY") {
                    // Don't do anything if an input or other control is focused
                    return;
                }

                if(this.application.ninja.toolsData) this.application.ninja.toolsData.selectedToolInstance.HandleKeyUp(evt);
            }
        }
    }
});
