/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

////////////////////////////////////////////////////////////////////////
//

var Montage =               require("montage/core/core").Montage,
    Component =     require("montage/ui/component").Component,
    ClipboardUtil = require("js/clipboard/util").ClipboardUtil,
    World =         require("js/lib/drawing/world").World;

var ElementsClipboardAgent = exports.ElementsClipboardAgent = Montage.create(Component, {

    //count how many times pasted
    //used to move multiple pastes of same copy
    pasteCounter:{
        value: 0
    },

    copiedObjects:{
        value: {}
    },

    copy:{
        value: function(clipboardEvent){
            var j=0, htmlToClipboard = "", ninjaClipboardObj = {}, textToClipboard = "";
            this.copiedObjects = {};
            this.pasteCounter = 0;
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
        }
    },

    cut:{
        value:function(clipboardEvent){
            var j=0, htmlToClipboard = "", ninjaClipboardObj = {}, textToClipboard = "", elObj = null;
            this.copiedObjects = {}; this.pasteCounter = 0;
            this.copiedObjects["cut"] = [];

            if(clipboardEvent){
                for(j=0; j < this.application.ninja.selectedElements.length; j++){//copying from stage
                    elObj = {};
                    elObj["outerhtml"] = this.application.ninja.selectedElements[j].outerHTML;

                    if(this.application.ninja.selectedElements[j].tagName === "CANVAS"){
                        elObj["styles"] = this.getDominantStyles(this.application.ninja.selectedElements[j], true);
                        if(!ninjaClipboardObj.canvas){
                            ninjaClipboardObj.canvas = true;
                        }
                        elObj["worldJson"] = this.application.ninja.selectedElements[j].elementModel.shapeModel ? this.application.ninja.selectedElements[j].elementModel.shapeModel.GLWorld.exportJSON(): null;
                        elObj["className"] = this.application.ninja.selectedElements[j].className;
                    }else{
                        elObj["styles"] = this.getDominantStyles(this.application.ninja.selectedElements[j], false);
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

            this.application.ninja.elementMediator.removeElements(this.application.ninja.selectedElements);

            clipboardEvent.preventDefault();
        }
    },

    pasteInternal:{
        value:function(){
            if(this.copiedObjects.copy){
                        try{
                            this.pasteFromCopy();
                        }catch(e){
                            console.log(""+e.stack);
                        }
            }
            else if(this.copiedObjects.cut){
                try{
                    this.pasteFromCut();
                }catch(e){
                    console.log(""+e.stack);
                }
            }

        }
    },

    pasteFromCopy:{
        value:function(){
                var i=0, j=0,
                pastedElements = [],//array of te pastes clones - for selection
                node = null,
                styles = null,
                copiedElement = null;

            this.pasteCounter++;

            //cleanse HTML

            for(j=0; j< this.copiedObjects.copy.length; j++){
                copiedElement = this.copiedObjects.copy[j];
                styles = null;

                if (copiedElement.tagName === "CANVAS"){
                    //clone copied canvas
                    var canvas = this.cloneCanvas(copiedElement);
                    pastedElements.push(canvas);
                }
                else {
                    node = copiedElement.cloneNode(true);

                    if(copiedElement.ownerDocument.defaultView.getComputedStyle(copiedElement).getPropertyValue("position") === "absolute"){
                        styles = {};
                        styles.top = this.application.ninja.elementMediator.getProperty(copiedElement, "top", parseInt);
                        styles.left = this.application.ninja.elementMediator.getProperty(copiedElement, "left", parseInt);
                        styles.position = "absolute";
                    }else{
                        styles = null;
                    }
                    this.pastePositioned(node, styles);
                    pastedElements.push(node);
                }

            }

            NJevent("elementAdded", pastedElements);

            this.application.ninja.currentDocument.model.needsSave = true;
        }
    },

    pasteFromCut:{
          value:function(){
              var i=0, j=0,
                  node = null, canvas = null,
                  styles=null,
                  pastedElements = [];//array of te pastes clones - for selection

              this.pasteCounter++;

              for(j=0; j< this.copiedObjects.cut.length; j++){
                  node = ClipboardUtil.deserializeHtmlString(this.copiedObjects.cut[j].outerhtml)[0];

                  if (node.tagName === "CANVAS"){
                      //paste canvas
                      canvas = this.generateNewCanvas(this.copiedObjects.cut[j].outerhtml, this.copiedObjects.cut[j].styles, this.copiedObjects.cut[j].className, this.copiedObjects.cut[j].worldJson);
                      pastedElements.push(canvas);
                      node = null;
                  }
                  else if((node.nodeType === 3) || (node.tagName === "A")){//TextNode

                      node = null;
                  }
                  else {
                      this.pastePositioned(node, this.copiedObjects.cut[j].styles, false/*fromCopy*/);
                      pastedElements.push(node);
                  }
              }

              NJevent("elementAdded", pastedElements);
              this.application.ninja.currentDocument.model.needsSave = true;
          }
    },


    serializeHTMLElement:{
        value: function(elem){
            var computedStyles = null, originalStyleAttr = null, computedStylesStr = "", i=0, stylePropertyName="", outerHtml = "";

            originalStyleAttr = elem.getAttribute("style");//preserve the current styles
            elem.removeAttribute("style");

            //build the computed style attribute
            computedStyles = elem.ownerDocument.defaultView.getComputedStyle(elem);

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
            var canvas, styles, world, worldData;

            canvas = document.application.njUtils.make("canvas", sourceCanvas.className, this.application.ninja.currentDocument);
            canvas.width = sourceCanvas.width;
            canvas.height = sourceCanvas.height;
            //end - clone copied canvas

            //genenerate data-RDGE-id only for shapes
            if (sourceCanvas.elementModel.shapeModel && !canvas.getAttribute( "data-RDGE-id" )) canvas.setAttribute( "data-RDGE-id", document.application.njUtils.generateRandom() );

            if(sourceCanvas.ownerDocument.defaultView.getComputedStyle(sourceCanvas).getPropertyValue("position") === "absolute"){
                styles = canvas.elementModel.data || {};
                styles.top = "" + (this.application.ninja.elementMediator.getProperty(sourceCanvas, "top", parseInt) + (25 * this.pasteCounter))+"px";
                styles.left = "" + (this.application.ninja.elementMediator.getProperty(sourceCanvas, "left", parseInt) + (25 * this.pasteCounter)) + "px";
            }else{
                styles = null;
            }

            var addDelegate = this.application.ninja.elementMediator.addDelegate;
            this.application.ninja.elementMediator.addDelegate = null;
            this.application.ninja.elementMediator.addElements(canvas, styles, false);
            this.application.ninja.elementMediator.addDelegate = addDelegate;

            worldData = sourceCanvas.elementModel.shapeModel ? sourceCanvas.elementModel.shapeModel.GLWorld.exportJSON(): null;
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

    generateNewCanvas: {
        value: function(outerhtml, styles, className, worldJson){
            var canvas, newCanvasStyles, world, worldData;

            canvas = document.application.njUtils.make("canvas", className, this.application.ninja.currentDocument);
            canvas.width = styles.width;
            canvas.height = styles.height;

            //genenerate data-RDGE-id only for shapes
            if (worldJson && !canvas.getAttribute( "data-RDGE-id" )) canvas.setAttribute( "data-RDGE-id", document.application.njUtils.generateRandom() );

            this.pastePositioned(canvas, styles, false/*from copy*/);

            worldData = worldJson;

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
        value: function(element, styles, fromCopy){// for now can wok for both in-place and centered paste
            var modObject = [], x,y, newX, newY, counter, self = this;

            if((typeof fromCopy === "undefined") || (fromCopy && fromCopy === true)){
                counter = this.pasteCounter;
            }else{
                counter = this.pasteCounter - 1;
            }

            x = styles ? ("" + styles.left + "px") : "100px";
            y = styles ? ("" + styles.top + "px") : "100px";
            newX = styles ? ("" + (styles.left + (25 * counter)) + "px") : "100px";
            newY = styles ? ("" + (styles.top + (25 * counter)) + "px") : "100px";

            var addDelegate = this.application.ninja.elementMediator.addDelegate;
            this.application.ninja.elementMediator.addDelegate = null;
            if(!styles || (styles && !styles.position)){
                this.application.ninja.elementMediator.addElements(element, null, false);
            }else if(styles && (styles.position === "absolute")){
                if((element.tagName === "IMG") || (element.getAttribute("type") === "image/svg+xml")){
                    element.onload = function(){
                        element.onload = null;
                        //refresh selection
                        self.application.ninja.stage.needsDraw = true;
                    }
                }

                this.application.ninja.elementMediator.addElements(element, {"top" : newY, "left" : newX}, false);//displace
            }
            this.application.ninja.elementMediator.addDelegate = addDelegate;
        }
    },

    getDominantStyles:{
        value: function(el, isCanvas){
            var styles = {};
            styles.top = this.application.ninja.elementMediator.getProperty(el, "top", parseInt);
            styles.left = this.application.ninja.elementMediator.getProperty(el, "left", parseInt);
            if(el.ownerDocument.defaultView.getComputedStyle(el).getPropertyValue("position") === "absolute"){
                styles.position = "absolute";
            }
            if(isCanvas){
                styles.width = (el.getAttribute("width") ? el.getAttribute("width") : null);
                styles.height = (el.getAttribute("height") ? el.getAttribute("height") : null);
            }
            return styles;
        }
    }


});
