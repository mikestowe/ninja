var Montage         = require("montage/core/core").Montage,
    Component       = require("montage/ui/component").Component;


exports.BindingPanel = Montage.create(Component, {

    bindings : { value: null },
    editView : { value: null },

    _dockEditView : { value: null },
    dockEditView : {
        get : function() { return this._dockEditView; },
        set : function(value) {
            if(value === this._dockEditView) { return; }

            this._dockEditView = value;

            this.needsDraw = true;
        }
    },

    _editing: { value: null },
    editing: {
        get: function() {
            return this._editing;
        },
        set: function(value) {
            if(value === this._editing) { return; }
            this._editing = value;

            if(!value) {
                this.dockEditView = false;
            }

            this.needsDraw = true;
        }
    },
    _translateDistance : {
        value: null
    },

    displayEditView : {
        value: function(bindingArgs) {
            this.editView.bindingArgs = bindingArgs;
            this.editing = true;
        }
    },

    /* -------------------------
       Event handlers
     ------------------------- */

    handleWebkitTransitionEnd : {
        value: function(e) {
            console.log("trans end");

            this.dockEditView = this.editing;
        }
    },

    /* -------------------------
     Toolbar Button Actions
     ------------------------- */

    handleAddAction : {
        value: function(e) {
            var newBindingArgs = {
                sourceObject : this.application.ninja.objectsController.currentObject
            };

            this.displayEditView(newBindingArgs);
        }
    },



    templateDidLoad : {
        value: function() {
            Object.defineBinding(this, 'bindings', {
                boundObject: this.application.ninja.objectsController,
                boundObjectPropertyPath: "currentObjectBindings",
                oneway: true
            });
        }
    },

    prepareForDraw : {
        value: function() {

        }
    },

    willDraw: {
        value: function() {
            this.editView.element.addEventListener('webkitTransitionEnd', this, false);

            if(this.editing) {
                this._translateDistance = this.element.offsetWidth;
            }
        }
    },

    draw : {
        value: function() {
            var transStr = '-webkit-transform',
                editViewEl = this.editView.element;

            if(this.dockEditView) {
                editViewEl.classList.add('edit-view-docked');
                editViewEl.style.removeProperty(transStr);
            } else {
                editViewEl.classList.remove('edit-view-docked');
                if(this.editing) {
                    editViewEl.style.setProperty(transStr, 'translate3d(-'+ this._translateDistance + 'px,0,0)');
                } else {
                    editViewEl.style.removeProperty(transStr);
                }
            }
            
        }
    }
});