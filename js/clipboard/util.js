/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//

var Montage = 		        require("montage/core/core").Montage,
    Component = 	require("montage/ui/component").Component;

var ClipboardUtil = exports.ClipboardUtil = Montage.create(Component, {

    deserializeHtmlString:{
        value:function(htmlString){
            var doc = (this.application.ninja.currentDocument.currentView === "design") ? this.application.ninja.currentDocument.model.views.design.document : document,
                clipboardHelper=doc.createElement("div"),
                nodeList = null;

            clipboardHelper.innerHTML = htmlString;
            nodeList = clipboardHelper.childNodes;
            clipboardHelper = null; //for garbage collection
            return nodeList;
        }
    }

});