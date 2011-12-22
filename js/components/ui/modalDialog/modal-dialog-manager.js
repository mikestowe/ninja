/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Popup =	require("js/components/popup.reel").Popup;
var popupManagerModule = require("js/components/popup-manager.reel");
var modalDialogHeader = require("js/components/ui/modalDialog/modalDialogHeader");

exports.ModalDialogMananger = (require("montage/core/core").Montage).create(require("montage/ui/component").Component, {

    _container: {
    	enumerable: false,
    	value: null
    },

    _blockScreen: {
    	enumerable: false,
    	value: null
    },

    /**
     * Assign a container to be the block screen
     *
     * @param {Element} container
     */
    init: {
    	enumerable: true,
    	value: function (blockScreen, container) {
    		container.style.position = 'absolute';
    		container.style.top = 0;
    		container.style.left = 0;
    		container.style.width = '100%';
    		container.style.height = '100%';
            container.style.display = "none";
            this._container = container;

            blockScreen.style.position = 'absolute';
    		blockScreen.style.top = 0;
    		blockScreen.style.left = 0;
    		blockScreen.style.width = '100%';
    		blockScreen.style.height = '100%';
            blockScreen.style.backgroundColor = "#8c8c8c";
            blockScreen.style.opacity = "0.8";
            blockScreen.style.display = "none";
            this._blockScreen = blockScreen;
    	}
    },

    /**
     * Show a modal dialog at the center of the browser
     */
    showModalDialog:{
        writable:false,
        enumerable:true,
        value: function(title, popupBackgroundColor, contentDiv){
            //place block screen on top of everything
            this._blockScreen.style.zIndex = popupManagerModule.PopupMananger._getNextHighestZindex(document.body);
            this._blockScreen.style.display = "block";
            this._container.style.zIndex = parseInt(this._blockScreen.style.zIndex) +1;


            var modalContent = document.createElement("div");

            //hack (elements needs to be on DOM to be drawn)
            //add modal dialog header
            var headerEl = document.createElement('div');
            var header = modalDialogHeader.ModalDialogHeader.create();
            header.element = headerEl;
            if((typeof title === "undefined") || (title === null)){
                header.showTitle = false;
            }else{
                header.title = title;
            }
            this._container.appendChild(headerEl);
            header.needsDraw = true;

            //add dialog content
            
            modalContent.appendChild(contentDiv);

//            var that = this;
//            setTimeout(function(){that.closeModalDialog()}, 5000);//test

            var popupEl = document.createElement('div');
    		var pop = Popup.create();
    		//Setting container and content
    		pop.element = popupEl;
    		pop.content = modalContent;
    		pop.position = {x:"30%", y:"15%"};//pass in real calculated center position
            pop.zIndex = popupManagerModule.PopupMananger._getNextHighestZindex(this._container);
            this._container.appendChild(popupEl);
            popupEl.style.opacity = 1;
            pop.needsDraw = true;

            //overrride modal dialog background color
            if((typeof popupBackgroundColor !== "undefined") || (popupBackgroundColor !== null)){
                pop.element.style.backgroundColor = popupBackgroundColor;
            }
            //hack - place the rendered header in the right place now
            this._container.removeChild(headerEl);
            modalContent.insertBefore(headerEl, modalContent.firstChild);


            this._container.style.display = "block";

        }
    },

    closeModalDialog:{
        writable:false,
        enumerable:true,
        value: function(){
            //remove dialog
            while(this._container.hasChildNodes()){
                this._container.removeChild(this._container.lastChild);
            }
            this._container.style.display = "none";
            this._blockScreen.style.display ="none";
        }
    }
});