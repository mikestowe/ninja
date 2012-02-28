/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
    _undoQueue: { value: [], writable:true },

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
    _redoQueue: { value: [], enumerable: false, writable:true },

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
            this.eventManager.addEventListener( "openDocument", this, false);
            this.eventManager.addEventListener( "sendToUndo", this, false);
            this.eventManager.addEventListener( "executeUndo", this, false);
            this.eventManager.addEventListener( "executeRedo", this, false);
        }
    },

    handleOpenDocument: {
        value: function(undoQueue, redoQueue) {
//            this._undoQueue = undoQueue;
//            this._redoQueue = redoQueue;
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
            this.undoQueue.splice(0, this.undoQueue.length);
            this.redoQueue.splice(0, this.redoQueue.length);
        }
    }
});