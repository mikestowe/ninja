var Montage         = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;


exports.BindingPanel = Montage.create(Component, {

    bindings : { value: null },
    editView : { value: null },
    editingClass : { value: 'editing-binding' },
    _editing: { value: null },
    editing: {
        get: function() {
            return this._editing;
        },
        set: function(value) {
            if(value === this._editing) { return; }
            this._editing = value;
            this.needsDraw = true;
        }
    },
    _translateDistance : {
        value: null
    },

    displayEditView : {
        value: function(bindingArgs) {
            this.editing = true;
        }
    },

    /* -------------------------
        Draw Cycle
     ------------------------- */

    templateDidLoad : {
        value: function() {
            Object.defineBinding(this, 'bindings', {
                boundObject: this.application.ninja.objectsController,
                boundObjectPropertyPath: "currentObjectBindings",
                oneway: true
            });
        }
    },

    willDraw: {
        value: function() {
            if(this.editing) {
                this._translateDistance = this.element.offsetWidth;
            }
        }
    },

    draw : {
        value: function() {
            var transStr = '-webkit-transform';

            if(this.editing) {
                this.editView.element.style.setProperty(transStr, 'translate3d(-'+ this._translateDistance + 'px,0,0)');
            } else {
                this.editView.element.style.removeProperty(transStr);
            }
        }
    }
});