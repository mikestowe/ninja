/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.StylesViewMediator = Montage.create(Component, {
    stylesController : {
        get: function() {
            return this.application.ninja.stylesController;
        },
        set: function(){
            return;
        }
    },
    handleAddAction : {
        value: function(e) {
            var selector, newRule;

            ///// Add rule to the container

            ///// Get selection prefix
            if(this.ruleListContainer.displayedList.selection.length > 1) {
                selector = this.stylesController.generateClassName(null, true);
            } else {
                selector = this.stylesController.generateClassName(this.ruleListContainer.displayedList.selection[0].nodeName);
            }

            newRule = this.application.ninja.stylesController.addRule("."+selector, ' { }');

            this.ruleListContainer.displayedList.component.addRule(newRule);

        }
    }
});