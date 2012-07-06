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

var Montage = require("montage/core/core").Montage,
    Component   = require("montage/ui/component").Component;

exports.Command = Montage.create( Montage, {

    description: { value: "" },

    receiver: { value: "" },

    execute: { value: function() {} },

    unexecute: { value: function() {} }
});

exports.GroupCommand = Montage.create( Montage, {
    _commands: { value: [] },

    init: {
        value: function() {
            this._commands = [];
        }
    },

    addCommand: {
        value: function(c) {
            if(c) {
                this._commands.push(c);
            }
        }
    },

    description: { value: "" },

    execute: {
        value: function() {
            var items = [];
            for (var i = 0, len = this._commands.length; i < len; i++) {
                items.push(this._commands[i].execute());
            }
            return items;
        }
    },

    unexecute: {
        value: function() {
            var items = [];
            for (var i = 0, len = this._commands.length; i < len; i++) {
                items.push(this._commands[i].unexecute());
            }
            return items;
        }
    }
});

exports.UndoController = Montage.create( Component, {
    /**
     * The maximum number of undo items allowed in the undo history.
     */
    _MAX_UNDO_STATES: {
        value:1000,
        writable:false,
        enumerable:false
    },

    /**
     * Undo Queue
     */
    _undoQueue: { value: []},

    undoQueue: {
        get: function() {
            return this._undoQueue;
        },
        set: function(value){
            this._undoQueue = value;
        }
    },

    /**
     * Redo Queue
     */
    _redoQueue: { value: [], enumerable: false},

    redoQueue: {
        get: function() {
            return this._redoQueue;
        },
        set: function(value){
            this._redoQueue = value;
        }
    },

    canUndo: {
        dependencies: ["undoQueue.count()"],
        get: function() {
            return !!this.undoQueue.length;
        }
    },

    canRedo: {
        dependencies: ["redoQueue.count()"],
        get: function() {
            return !!this.redoQueue.length;
        }
    },


    deserializedFromTemplate: {
        value: function(){
            this.eventManager.addEventListener( "sendToUndo", this, false);
            this.eventManager.addEventListener( "executeUndo", this, false);
            this.eventManager.addEventListener( "executeRedo", this, false);
        }
    },

    handleSendToUndo: {
        value: function(event) {
            this.undoQueue.push(event.detail);
            this._clearRedo();
        }
    },

    handleExecuteUndo: {
        value: function() {
            this.undo();
        }
    },

    handleExecuteRedo: {
        value: function() {
            this.redo();
        }
    },

    undo: {
        value: function(levels) {
            try{
                var command, info;

                /* Add Levels support later
                for (var i=0; i < levels; i++) {
                    do the undo
                }
                */
                if(this.undoQueue.length !== 0) {
                    command = this.undoQueue.pop();
                    info = command.unexecute();
                    NJevent( "undo", info );
                    this.redoQueue.push(command);
                }

            } catch (err) {
                console.log("Cannot Undo -- ", err);
            }
        }
    },

    redo: {
        value: function(levels) {
            try{
                var command, info;

                /* Add Levels support later
                for (var i=0; i < levels; i++) {
                    do the redo
                }
                */
                if(this.redoQueue.length === 0) {
                    return;
                }

                command = this.redoQueue.pop();
                info = command.execute();
                NJevent( "redo", info );
                this.undoQueue.push(command);


            } catch (err) {
                console.log("Cannot Redo -- ", err);
            }
        }
    },
//
//    insertCommand: {
//        value: function(command) {
//            debugger;
//            this._undoQueue.push(command);
//            this._clearRedo();
//        }
//    },

    _clearRedo: {
        value: function() {
            this.redoQueue.splice(0, this.redoQueue.length);
            //this.redoQueue = [];
        }
    },

    clearHistory:{
        value: function(){
            this.undoQueue.length = 0;
            this.redoQueue.length = 0;
        }
    }
});
