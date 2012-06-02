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
        value: {}
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
        value:function(clipboardEvent){
            if(this.application.ninja.currentDocument.currentView === "code") return;

            this.copy(clipboardEvent);

            clipboardEvent.preventDefault();
        }
    },

    handleCut:{
        value:function(clipboardEvent){
            if(this.application.ninja.currentDocument.currentView === "code") return;

            this.cut(clipboardEvent);

            clipboardEvent.preventDefault();
        }
    },

    handlePaste:{
        value:function(clipboardEvent){
            if(this.application.ninja.currentDocument.currentView === "code") return;//for design view only

            //TODO: return if stage is not focussed

            //identify all types of clipboard data

            var clipboardData = clipboardEvent.clipboardData,
                ninjaData = clipboardData.getData("ninja"),
                htmlData = clipboardData.getData("text/html"),
                textData = clipboardData.getData("text/plain"),
                imageData = clipboardData.getData("image/png"),//TODO: other img types, tiff, jpeg.....
                svgData = clipboardData.getData("image/svg");

            if(ninjaData){
                if(this.copiedObjects.copy){this.pasteFromCopy();}
                else{this.pasteFromCut();}
            }else if(imageData){
                this.pasteImage(imageData);
            }else{
                this.pasteFromExternalSource(htmlData, textData);
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
            this.copiedObjects = {};
            this.copiedObjects["copy"] = [];

            if(clipboardEvent){
                for(j=0; j < this.application.ninja.selectedElements.length; j++){//copying from stage
                    this.copiedObjects.copy.push(this.application.ninja.selectedElements[j]);

                    if(this.application.ninja.selectedElements[j].tagName === "CANVAS"){
                        if(!ninjaClipboardObj.canvas){
                            ninjaClipboardObj.canvas = true;
                        }
                    }else{
                        htmlToClipboard = htmlToClipboard + this.serializeHTMLElement(this.application.ninja.selectedElements[j]);
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

    pasteFromCopy:{//todo: change to appropriate name
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


            for(j=0; j< this.copiedObjects.copy.length; j++){
                copiedElement = this.copiedObjects.copy[j];
                styles = null;

                if (copiedElement.tagName === "CANVAS"){
                    //clone copied canvas
                    var canvas = this.cloneCanvas(copiedElement);
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

            this.application.ninja.selectionController.selectElements(pastedElements);

            this.application.ninja.currentDocument.model.needsSave = true;
        }
    },

    pasteFromCut:{
          value:function(){
              var i=0, j=0, clipboardHelper=this.createClipboardHelper(), node=null, styles=null;

              for(j=0; j< this.copiedObjects.cut.length; j++){
                  clipboardHelper.innerHTML = this.copiedObjects.cut[j].outerhtml;

                  if (clipboardHelper.lastChild.tagName === "CANVAS"){
                      //paste canvas


                  }
                  else if((clipboardHelper.lastChild.nodeType === 3) || (clipboardHelper.lastChild.tagName === "A")){//TextNode


                  }
                  else {
                      node = clipboardHelper.removeChild(clipboardHelper.lastChild);
                      this.pastePositioned(node, this.copiedObjects.cut[j].styles);
                  }
              }
          }
    },

    //paste from external applicaitons
    pasteFromExternalSource:{//todo: change to pasteNinja, pasteHTML, etc
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

                this.application.ninja.currentDocument.model.needsSave = true;
            }else if(textData){

                //USE styles controller to create the styles of the div and span
                clipboardHelper.innerHTML = "<div><span>"+ textData +"</span></div>";//add the copied html to generate the nodes
                node = clipboardHelper.removeChild(clipboardHelper.lastChild);
                styles = {"top":"100px", "left":"100px"};//get real stage center coordinates
                this.pastePositioned(node, styles);
            }

        }
    },

    cut:{
        value:function(clipboardEvent){
            var j=0, htmlToClipboard = "", ninjaClipboardObj = {}, textToClipboard = "", elObj = null;
            this.copiedObjects = {};
            this.copiedObjects["cut"] = [];

            if(clipboardEvent){
                for(j=0; j < this.application.ninja.selectedElements.length; j++){//copying from stage
                    elObj = {};
                    elObj["outerhtml"] = this.application.ninja.selectedElements[j].outerHTML;
                    elObj["styles"] = this.getDominantStyles(this.application.ninja.selectedElements[j]);

                    if(this.application.ninja.selectedElements[j].tagName === "CANVAS"){
                        if(!ninjaClipboardObj.canvas){
                            ninjaClipboardObj.canvas = true;
                        }
                        elObj["worldJson"] = this.application.ninja.selectedElements[j].elementModel.shapeModel.GLWorld.exportJSON();
                    }else{
                        htmlToClipboard = htmlToClipboard + this.serializeHTMLElement(this.application.ninja.selectedElements[j]);
                        if(!ninjaClipboardObj.plainHtml){
                            ninjaClipboardObj.plainHtml = true;
                        }
                        textToClipboard = textToClipboard + this.getText(this.application.ninja.selectedElements[j]) + " ";
                    }
                    this.copiedObjects.cut.push(elObj);
                }
                //set clipboard data
                clipboardEvent.clipboardData.setData('ninja', ''+ JSON.stringify(ninjaClipboardObj));
                clipboardEvent.clipboardData.setData('text/html', '<HTML><BODY>' + htmlToClipboard + '</BODY></HTML>');
                clipboardEvent.clipboardData.setData('text/plain', textToClipboard);

            }
            else{
                //TODO: custom copy/paste, ex: css, animation, materials
            }

            this.application.ninja.elementMediator.removeElements(this.application.ninja.selectedElements);

            clipboardEvent.preventDefault();
        }
    },

    createClipboardHelper:{
        value:function(){
            var doc = this.application.ninja.currentDocument ? this.application.ninja.currentDocument.model.views.design.document : document,
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


    serializeHTMLElement:{
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

    cloneCanvas:{
        value: function(sourceCanvas){
            var canvas = document.application.njUtils.make("canvas", sourceCanvas.className, this.application.ninja.currentDocument);
            canvas.width = sourceCanvas.width;
            canvas.height = sourceCanvas.height;
            //end - clone copied canvas

            if (!canvas.getAttribute( "data-RDGE-id" )) canvas.setAttribute( "data-RDGE-id", NJUtils.generateRandom() );
            document.application.njUtils.createModelWithShape(canvas);

            styles = canvas.elementModel.data || {};
            styles.top = "" + (this.application.ninja.elementMediator.getProperty(sourceCanvas, "top", parseInt) - 50) + "px";
            styles.left = "" + (this.application.ninja.elementMediator.getProperty(sourceCanvas, "left", parseInt) - 50) + "px";

            this.application.ninja.elementMediator.addElements(canvas, styles, false);

            var world, worldData = sourceCanvas.elementModel.shapeModel.GLWorld.exportJSON();
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
                    this.application.ninja.currentDocument.model.webGlHelper.buildShapeModel( canvas.elementModel, world );
                }
            }

            return canvas;
        }
    },

    serializeCanvas:{
        value:function(sourceCanvas){

        }
    },

    copyMontageComponents:{
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
    },

    getDominantStyles:{
        value: function(el){
            var styles = {};
            styles.top = "" + (this.application.ninja.elementMediator.getProperty(el, "top", parseInt) - 50) + "px";
            styles.left = "" + (this.application.ninja.elementMediator.getProperty(el, "left", parseInt) - 50) + "px";

            return null;
        }
    }

});