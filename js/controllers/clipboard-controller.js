/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

////////////////////////////////////////////////////////////////////////
//
var Montage = 		require("montage/core/core").Montage,
    Component = 	require("montage/ui/component").Component,
    NJUtils     = require("js/lib/NJUtils").NJUtils,
    World = require("js/lib/drawing/world").World;

var ClipboardController = exports.ClipboardController = Montage.create(Component, {
    hasTemplate: {
        value: false
    },

    deserializedFromTemplate: {
        value: function() {
            document.body.addEventListener("copy", this, false);
            document.body.addEventListener("cut", this, false);
            document.body.addEventListener("paste", this, false);

            //ninja menu events
            this.eventManager.addEventListener("executeCut", this, false);
            this.eventManager.addEventListener("executeCopy", this, false);
            this.eventManager.addEventListener("executePaste", this, false);

        }
    },

    clipboardOperationsAgent:{//appropriate agent instant required for execution of cut/copy/paste
        value: null
    },

    copiedObjects:{
        value: []
    },

    _copyFlag:{
        value:false
    },

    copyFlag:{
        get:function(){return this._copyFlag;},
        set:function(value){this._copyFlag = value;}
    },

    _newCopyFlag:{
        value:true
    },

    newCopyFlag:{
        get:function(){return this._newCopyFlag;},
        set:function(value){this._newCopyFlag = value;}
    },

    handleExecuteCopy:{
        value: function(){document.execCommand('copy',false,null);}
    },

    handleExecuteCut:{
        value: function(){document.execCommand('cut',false,null);}
    },

    handleExecutePaste:{
        value: function(){document.execCommand('paste',false,null);}
    },

    handleCopy:{
        value:function(clipboardEvent, test){
            if(this.application.ninja.documentController.activeDocument.currentView === "code") return;

            this.copy(clipboardEvent);

            clipboardEvent.preventDefault();
        }
    },

    handlePaste:{
        value:function(clipboardEvent){
            if(this.application.ninja.documentController.activeDocument.currentView === "code") return;//for design view only

            //TODO: return if stage is not focussed

            //identify all types of clipboard data

            var clipboardData = clipboardEvent.clipboardData,
                ninjaData = clipboardData.getData("ninja"),
                htmlData = clipboardData.getData("text/html"),
                textData = clipboardData.getData("text/plain"),
                imageData = clipboardData.getData("image/png"),//TODO: other img types, tiff, jpeg.....
                svgData = clipboardData.getData("image/svg");

            if(ninjaData){
                this.pasteFromNinja();
            }else if(imageData){
                this.pasteImage(imageData);
            }else{
                this.pasteItems(htmlData, textData);
            }


            clipboardEvent.preventDefault();
        }
    },

    /*
    parameters:
     */
    copy:{
        value: function(clipboardEvent){
            var j=0, htmlToClipboard = "", ninjaClipboardObj = {}, textToClipboard = "";
            this.copiedObjects.length = 0;

            if(clipboardEvent){
                for(j=0; j < this.application.ninja.selectedElements.length; j++){//copying from stage
                    this.copiedObjects.push(this.application.ninja.selectedElements[j]);

                    if(this.application.ninja.selectedElements[j].tagName === "CANVAS"){
                        if(!ninjaClipboardObj.canvas){
                            ninjaClipboardObj.canvas = true;
                        }
                    }else{
                        htmlToClipboard = htmlToClipboard + this.serialize(this.application.ninja.selectedElements[j]);
                        if(!ninjaClipboardObj.plainHtml){
                            ninjaClipboardObj.plainHtml = true;
                        }
                        textToClipboard = textToClipboard + this.getText(this.application.ninja.selectedElements[j]) + " ";
                    }

                }
                //set clipboard data
                clipboardEvent.clipboardData.setData('ninja', ''+ JSON.stringify(ninjaClipboardObj));
                clipboardEvent.clipboardData.setData('text/html', '<HTML><BODY>' + htmlToClipboard + '</BODY></HTML>');
                clipboardEvent.clipboardData.setData('text/plain', textToClipboard);
            }
            else{
                //TODO: custom copy/paste, ex: css, animation, materials
            }
        }
    },

    pasteFromNinja:{//todo: change to appropriate name
        value:function(){
                var i=0, j=0,
                pastedElements = [],//array of te pastes clones - for selection
                node = null,
                styles = null,
                copiedElement = null;

            //TODO: cleanse HTML

            //clear previous selections
            this.application.ninja.selectedElements.length = 0;
            NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": true} );


            for(j=0; j< this.copiedObjects.length; j++){
                copiedElement = this.copiedObjects[j];
                styles = null;

                if (copiedElement.tagName === "CANVAS"){
                    //clone copied canvas
                    var canvas = document.application.njUtils.make("canvas", copiedElement.className, this.application.ninja.currentDocument);
                    canvas.width = copiedElement.width;
                    canvas.height = copiedElement.height;
                    //end - clone copied canvas

                    if (!canvas.getAttribute( "data-RDGE-id" )) canvas.setAttribute( "data-RDGE-id", NJUtils.generateRandom() );
                    document.application.njUtils.createModelWithShape(canvas);

                    styles = canvas.elementModel.data || {};
                    styles.top = "" + (this.application.ninja.elementMediator.getProperty(copiedElement, "top", parseInt) - 50) + "px";
                    styles.left = "" + (this.application.ninja.elementMediator.getProperty(copiedElement, "left", parseInt) - 50) + "px";

                    this.application.ninja.elementMediator.addElements(canvas, styles, false);

                    var world, worldData = copiedElement.elementModel.shapeModel.GLWorld.exportJSON();
                    if(worldData)
                    {
                        var jObj;
                        var index = worldData.indexOf( ';' );
                        if ((worldData[0] === 'v') && (index < 24))
                        {
                            // JSON format.  separate the version info from the JSON info
                            var jStr = worldData.substr( index+1 );
                            jObj = JSON.parse( jStr );

                            world = new World(canvas, jObj.webGL);
                            canvas.elementModel.shapeModel.GLWorld = world;
                            canvas.elementModel.shapeModel.useWebGl = jObj.webGL;
                            world.importJSON(jObj);
                            this.application.ninja.currentDocument.buildShapeModel( canvas.elementModel, world );
                        }
                   }

                    NJevent("elementAdded", canvas);

                    pastedElements.push(canvas);
                }
                else {
                    node = copiedElement.cloneNode(true);

                    if(node.removeAttribute) {node.removeAttribute("style");}//remove the computed styles attribute which is placed only for pasting to external applications

                    styles = {};
                    styles.top = "" + (this.application.ninja.elementMediator.getProperty(copiedElement, "top", parseInt) - 50) + "px";
                    styles.left = "" + (this.application.ninja.elementMediator.getProperty(copiedElement, "left", parseInt) - 50) + "px";

                    this.pastePositioned(node, styles);
                    pastedElements.push(node);
                }

            }


            //this.application.ninja.selectionController.selectElements(pastedElements);//select pasted elements - not working!


            this.application.ninja.documentController.activeDocument.needsSave = true;
        }
    },

    //paste from external applicaitons
    pasteItems:{//todo: change to pasteNinja, pasteHTML, etc
        value: function(htmlData, textData){
            var i=0,
                pasteDataObject=null,
                clipboardHelper=this.createClipboardHelper(),
                pastedElements = null,
                node = null,
                styles = null,
                divWrapper = null,
                spanWrapper = null;

            if(htmlData){
                //TODO: cleanse HTML

                this.application.ninja.selectedElements.length = 0;
                NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": true} );

                clipboardHelper.innerHTML = htmlData;//todo:remove html and body tags

                while(clipboardHelper.hasChildNodes()){
                    if(clipboardHelper.lastChild.tagName === "META") {
                        clipboardHelper.removeChild(clipboardHelper.lastChild);//remove unnecesary meta tag
                    }
                    else if (clipboardHelper.lastChild.tagName === "CANVAS"){
                        //can't paste external canvas for lack of all metadata
                        clipboardHelper.removeChild(clipboardHelper.lastChild);
                    }
                    else if((clipboardHelper.lastChild.nodeType === 3) || (clipboardHelper.lastChild.tagName === "A")){//TextNode
                        node = clipboardHelper.removeChild(clipboardHelper.lastChild);

                        //todo : not working - USE styles controller to create the styles of the div and span
//                        var doc = this.application.ninja.currentDocument ? this.application.ninja.currentDocument._document : document;
//                        var aspan = doc.createElement("span");
//                        aspan.appendChild(node);
//                        var adiv = doc.createElement("div");
//                        adiv.appendChild(aspan);

                        divWrapper = document.application.njUtils.make("div", null, this.application.ninja.currentDocument);
                        document.application.njUtils.createModel(divWrapper);
                        spanWrapper = document.application.njUtils.make("span", null, this.application.ninja.currentDocument);
                        document.application.njUtils.createModel(spanWrapper);
                        spanWrapper.appendChild(node);
                        divWrapper.appendChild(spanWrapper);
                        styles = null;
                        //end - todo : not working

                        this.pastePositioned(divWrapper, styles);
                    }
                    else {
                        node = clipboardHelper.removeChild(clipboardHelper.lastChild);

                        //get class string while copying .... generate styles from class
                        styles = {"top":"100px", "left":"100px"};

                        this.pastePositioned(node, styles);
                    }

                }

                this.application.ninja.documentController.activeDocument.needsSave = true;
            }else if(textData){

                //USE styles controller to create the styles of the div and span
                clipboardHelper.innerHTML = "<div><span>"+ textData +"</span></div>";//add the copied html to generate the nodes
                node = clipboardHelper.removeChild(clipboardHelper.lastChild);
                styles = {"top":"100px", "left":"100px"};//get real stage center coordinates
                this.pastePositioned(node, styles);
            }

        }
    },

    handleCut:{
        value:function(clipboardEvent){
            var clipboardData = clipboardEvent.clipboardData,
                htmlData = clipboardData.getData("text/html"),
                textData = clipboardData.getData("text/plain");

            console.log("$$$ handleCut ", textData);


            clipboardEvent.preventDefault();
        }
    },

    createClipboardHelper:{
        value:function(){
            var doc = this.application.ninja.currentDocument ? this.application.ninja.currentDocument._document : document,
                clipboardHelper=doc.getElementById("clipboardHelper");
            if(!clipboardHelper){
                clipboardHelper = doc.createElement ("div");
                clipboardHelper.id = "clipboardHelper";
                clipboardHelper.style.display="none";
                clipboardHelper.style.position = "absolute";
                clipboardHelper.style.right = "-1000px";
                clipboardHelper.style.top = "-1000px";

                document.body.appendChild (clipboardHelper);
            }
            return clipboardHelper;
        }
    },


    serialize:{
        value: function(elem){
            var computedStyles = null, originalStyleAttr = null, computedStylesStr = "", i=0, stylePropertyName="", outerHtml = "";

            originalStyleAttr = elem.getAttribute("style");//preserve the current styles
            elem.removeAttribute("style");

            //build the computed style attribute
            computedStyles = elem.ownerDocument.defaultView.getComputedStyle(elem);

            //todo: consider cleaning up the position data [or making position:relative with 0,0] from the computed styles,
            // so that the object is pasted onto expernal applicaitons [like gmail] with no offset

            for (i = 0; i < computedStyles.length; i++) {
                stylePropertyName = computedStyles[i];
                computedStylesStr = computedStylesStr + stylePropertyName + ":" + computedStyles.getPropertyValue(stylePropertyName) + ";";
            }
            elem.setAttribute("style", computedStylesStr);

            outerHtml = elem.outerHTML;

            elem.setAttribute("style", originalStyleAttr);//reset style after copying to clipboard


            return outerHtml;
        }
    },

    copyMontageComponents:{
        value: function(){

        }
    },

    /*
    parameters:
     */
    paste:{
        value: function(){

        }
    },

    pasteHTML:{
        value: function(){

        }
    },

    pasteImage:{
        value:function(imageData){

        }
    },

    pasteMontageComponents:{
        value: function(){

        }
    },

    getText:{
        value: function(element){
            var nodeList = element.getElementsByTagName("*"), allText = "", i=0;

            for(i=0; i < nodeList.length; i++){
                if(nodeList[i].nodeType === 3){//text node
                    allText = allText + nodeList[i].innerText + " ";
                }
            }
        }
    },


    pastePositioned:{
        value: function(element, styles){// for now can wok for both in-place and centered paste
            NJUtils.createModel(element);
            this.application.ninja.elementMediator.addElements(element, styles);
        }
    },

    pasteInPlace:{
        value: function(element){
            NJUtils.createModel(element);
            this.application.ninja.elementMediator.addElements(element, null);//does not work now
        }
    }

});