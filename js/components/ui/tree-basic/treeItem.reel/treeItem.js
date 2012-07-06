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

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.TreeItem = Montage.create(Component, {

    _treeItemData:{
        enumerable : false,
        value:null
    },
    treeItemData:{
        get:function(){
            return this._treeItemData;
        },
        set:function(value){
            this._treeItemData = value;
            this.needsDraw = true;
        }
    },

    showIcon :{
        writable:true,
        enumerable:true,
        value:true
    },

    expandAfterDraw:{
        writable:true,
        enumerable:true,
        value:false
    },
    highlightedUri:{
        writable:true,
        enumerable:true,
        value:null
    },

    directoryBold :{
        writable:true,
        enumerable:true,
        value:false
    },

    metadata:{
           enumerable:true,
           writable:true,
           value:null
       },
    willDraw: {
    	enumerable: false,
    	value: function() {
            var that = this;
            this.itemName.innerHTML = this.treeItemData.name;

            if(this.showIcon === false){
                this.itemImg.style.display = "none";
            }else{
                if(this.treeItemData.type === "directory"){
                    this.itemImg.src = this.imgStore.img_root + this.imgStore.directory;
                }else{
                    var fileImg = "";
                    //get extension to map again right icon image
                    var extension = this.treeItemData.name.substring(this.treeItemData.name.lastIndexOf(".")).toLowerCase();
                    if(typeof this.imgStore[extension] !== "undefined"){
                        fileImg = this.imgStore.img_root + this.imgStore[extension];
                    }else{
                        fileImg = this.imgStore.img_root + this.imgStore.file_default;
                    }
                    this.itemImg.src = fileImg;
                }
            }

            if(this.treeItemData.type === "directory"){
                this.treeArrow.classList.remove("hidden");
                if(this.directoryBold === true){
                    this.itemName.classList.add("bold");
                }
            }
        }
    },
    draw: {
    	enumerable: false,
    	value: function() {

        }
    },
    didDraw: {
    	enumerable: false,
    	value: function() {
            var that = this;
            this.element.identifier = "treeItem";
            this.treeArrow.identifier = "treeArrow";

            this.element.setAttribute("data-uri", this.treeItemData.uri);
            this.element.setAttribute("data-type", this.treeItemData.type);

            //add arrow click handler for directory
            if(this.treeItemData.type === "directory"){
                this.treeArrow.addEventListener("click", this, false);
            }

            //icon or text click sends selection event
            var contentEls = this.element.querySelectorAll(".atreeItemContent");
            for(var i=0;i<contentEls.length;i++){
                contentEls[i].addEventListener("click", function(evt){that.handleTreeItemContentClick(evt);}, true);
                contentEls[i].addEventListener("dblclick", function(evt){that.handleTreeItemContentDblclick(evt);}, true);
            }

            this.element.addEventListener("mouseover", function(evt){that.handleTreeItemMouseover(evt);}, false);

            //prepare metadata string
            if(this.treeItemData.name !== ""){
                this.metadata = "Name: "+this.treeItemData.name;
            }
            this.metadata = this.metadata + "<br />" + "Type: "+this.treeItemData.type;
            if(this.treeItemData.size){this.metadata = this.metadata + "<br />" + "Size: "+this.treeItemData.size+ " bytes";}
            if(this.treeItemData.creationDate){this.metadata = this.metadata + "<br />" + "Creation date: "+ this.formatTimestamp(this.treeItemData.creationDate);}
            if(this.treeItemData.modifiedDate){this.metadata = this.metadata + "<br />" + "Modified date: "+ this.formatTimestamp(this.treeItemData.modifiedDate);}

            if((this.treeItemData.type === "directory") && (this.expandAfterDraw === true)){
                this.expand(this.treeArrow);
            }
            if(this.treeItemData.uri === this.highlightedUri){
                this.itemName.classList.add("selected");
            }
        }
    },

    toggleContent:{
        writable:false,
        enumerable:true,
        value:function(el){
            //if children already drawn then just hide/show
            if(this.element.getElementsByTagName("ul").length > 0){
                var theParent = this.element.getElementsByTagName("ul")[0].parentNode;
                if(theParent.classList.contains("hideTree")){//collapsed

//                    //check if content has changed and refresh if yes
//                    var refreshTreeSegmentEvent = document.createEvent("Events");
//                    refreshTreeSegmentEvent.initEvent("refreshTreeSegment", false, false);
//                    refreshTreeSegmentEvent.uri = this.treeItemData.uri;
//                    refreshTreeSegmentEvent.type = this.treeItemData.type;
//                    refreshTreeSegmentEvent.treeSegment = this.element.querySelector(".atree");
//                    this.element.dispatchEvent(refreshTreeSegmentEvent);

                    theParent.classList.remove("hideTree");//expand
                    el.innerHTML = "&#9660;";
                }else{//expanded
                    theParent.classList.add("hideTree");//collapse
                    el.innerHTML = "&#9654;";
                }
            }
            //else send event to draw the children
            else{
                var treeClickEvent = document.createEvent("Events");
                treeClickEvent.initEvent("drawTree", false, false);
                treeClickEvent.uri = this.treeItemData.uri;
                treeClickEvent.uriType = this.treeItemData.type;
                var divEl = document.createElement("div");
                this.element.appendChild(divEl);
                treeClickEvent.subTreeContainer = divEl;
                this.element.dispatchEvent(treeClickEvent);

                el.innerHTML = "&#9660;";
            }
        }
    },

    expand:{
        writable:false,
        enumerable:true,
        value:function(el){
            //if children already drawn then just hide/show
            if(this.element.getElementsByTagName("ul").length > 0){
                var theParent = this.element.getElementsByTagName("ul")[0].parentNode;
                if(theParent.classList.contains("hideTree")){//collapsed
                    theParent.classList.remove("hideTree");//expand
                    el.innerHTML = "&#9660;";
                }
            }
            //else send event to draw the children
            else{
                var treeClickEvent = document.createEvent("Events");
                treeClickEvent.initEvent("drawTree", false, false);
                treeClickEvent.uri = this.treeItemData.uri;
                treeClickEvent.uriType = this.treeItemData.type;
                var divEl = document.createElement("div");
                this.element.appendChild(divEl);
                treeClickEvent.subTreeContainer = divEl;
                this.element.dispatchEvent(treeClickEvent);

                el.innerHTML = "&#9660;";
            }
        }
    },


    /**
     * Event Listeners
     */

    handleTreeArrowClick : {
        value:  function(evt){
                    this.toggleContent(evt.target);

                    if(evt.bubbles){
                        evt.stopPropagation();
                    }
                }
    },

    handleTreeItemMouseover:{
        value:function(evt){
                    //console.log(that.element.querySelector(".name").innerHTML);
                    var showMetadataEvent = document.createEvent("Events");
                    showMetadataEvent.initEvent("showMetadata", false, false);
                    showMetadataEvent.metadata = this.metadata;
                    this.element.dispatchEvent(showMetadataEvent);

                    if(evt.bubbles){
                        evt.stopPropagation();
                    }

                }
    },

    handleTreeItemContentClick:{
        value: function(evt){
                    var selectedItemEvent = document.createEvent("Events");
                    selectedItemEvent.initEvent("selectedItem", false, false);
                    selectedItemEvent.uri = this.treeItemData.uri;
                    this.itemName.dispatchEvent(selectedItemEvent);

                    var showMetadataEvent = document.createEvent("Events");
                    showMetadataEvent.initEvent("updateMetadata", false, false);
                    showMetadataEvent.metadata = this.metadata;
                    this.element.dispatchEvent(showMetadataEvent);

                    if(evt.bubbles){
                        evt.stopPropagation();
                    }
                }
    },

    handleTreeItemContentDblclick:{
        value: function(evt){
                    if(this.treeItemData.type === "directory"){
                        var openFolderEvent = document.createEvent("Events");
                        openFolderEvent.initEvent("openFolder", false, false);
                        openFolderEvent.folderUri = this.treeItemData.uri;
                        this.element.dispatchEvent(openFolderEvent);
                    }else{
                        var openFolderEvent = document.createEvent("Events");
                        openFolderEvent.initEvent("selectFile", false, false);
                        openFolderEvent.fileUri = this.treeItemData.uri;
                        this.element.dispatchEvent(openFolderEvent);
                    }
                    if(evt.bubbles){
                            evt.stopPropagation();
                    }
                }
    },

    imgStore:{
        writable:false,
        enumerable: true,
        value:{
            "img_root":"images/picker/",
            ".js":"js_file.png",
            ".json":"json_file.png",
            ".css":"css_file.png",
            ".html":"html_file.png",
            ".xml":"xml_file.png",
            ".php":"php_file.png",
            ".pl":"pl_file.png",
            ".py":"py_file.png",
            ".rb":"rb_file.png",
            ".doc":"doc_file.png",
            ".txt":"txt_file.png",
            "file_default":"file.png",
            "directory":"folder.png"
        }
    },

    folderImg:{
        writable:false,
        enumerable:true,
        //value: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0F%00%00%00%0D%08%06%00%00%00v%1E4A%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%03diTXtXML%3Acom.adobe.xmp%00%00%00%00%00%3C%3Fxpacket%20begin%3D%22%EF%BB%BF%22%20id%3D%22W5M0MpCehiHzreSzNTczkc9d%22%3F%3E%20%3Cx%3Axmpmeta%20xmlns%3Ax%3D%22adobe%3Ans%3Ameta%2F%22%20x%3Axmptk%3D%22Adobe%20XMP%20Core%205.0-c060%2061.134777%2C%202010%2F02%2F12-17%3A32%3A00%20%20%20%20%20%20%20%20%22%3E%20%3Crdf%3ARDF%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%3E%20%3Crdf%3ADescription%20rdf%3Aabout%3D%22%22%20xmlns%3AxmpMM%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2Fmm%2F%22%20xmlns%3AstRef%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2FsType%2FResourceRef%23%22%20xmlns%3Axmp%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2F%22%20xmpMM%3AOriginalDocumentID%3D%22xmp.did%3A3DDD06742B8DE011952EC04AE9C71C6E%22%20xmpMM%3ADocumentID%3D%22xmp.did%3ACB1289EEB95B11E0A3E0F320D5639EA0%22%20xmpMM%3AInstanceID%3D%22xmp.iid%3ACB1289EDB95B11E0A3E0F320D5639EA0%22%20xmp%3ACreatorTool%3D%22Adobe%20Photoshop%20CS5%20Windows%22%3E%20%3CxmpMM%3ADerivedFrom%20stRef%3AinstanceID%3D%22xmp.iid%3ABB242C8D4AB9E011B013F72FE65B91B8%22%20stRef%3AdocumentID%3D%22xmp.did%3A3DDD06742B8DE011952EC04AE9C71C6E%22%2F%3E%20%3C%2Frdf%3ADescription%3E%20%3C%2Frdf%3ARDF%3E%20%3C%2Fx%3Axmpmeta%3E%20%3C%3Fxpacket%20end%3D%22r%22%3F%3E%0Di%17%A8%00%00%01%16IDATx%DA%9CQ%BB%8D%84%40%0C5%60%10%3D%20%D1%01!%11%E9%5D%13%2B!%9DD%0A%3DP%015%1C1%25lL%01%D4%40%0D%87%F8%CF%ED%1B%C9%C8%BB%DAK%CE%C1%F8%FF%FC%ECq%8C1%04I%92%E43%CB%B2%2F%C7q%AC%0F%DD%F7%FD%F70%0Cw%FAC%18O%9E%E7%A6m%5B%1B%08%C3%90%98%99%3C%CF%23%DF%F7oeY%DA8%86%08%F08%8E%16%DF6o%DBF%D34%5D%88A%10X%90%A2(h%DFw%3A%CF%D3%D6%1C%C7A%CB%B2P%D34%94%A6)%B9%F4O%A9%EB%9A%9C%AA%AA%EEq%1C%7F%00%5D%E8A%E0%8B-%1A%93%85%3E%F2%FCx%CE(%8Al%D2u%DD%2B)%85%02%02-%B6%F8%0C%03%7B%E0%40r%10)%80%60g%F1%A5Ij%18%13%E4%18%F2E%BAP7%CA%3AW3%D8%AE%EBj)%BF~%89%DE%5B%0Bb%18%06%DA%8Cf%D0F1%1A%F5%F4W0m%B3%3E%86F%16%00%7D%07%BD%164%B8%1A%9D%D4%8D%1A%EC%1Du%9E%E7%F9%A7%EB%BA'%BA%EFD%BEQ3%F8%15%60%00%93%E1%09(%04O%F3%95%00%00%00%00IEND%AEB%60%82"
        value:"images/picker/folder.png"
    },

    fileImg:{
        writable:false,
        enumerable:true,
        //value: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0C%00%00%00%0F%08%06%00%00%00%D0%E1.I%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%03diTXtXML%3Acom.adobe.xmp%00%00%00%00%00%3C%3Fxpacket%20begin%3D%22%EF%BB%BF%22%20id%3D%22W5M0MpCehiHzreSzNTczkc9d%22%3F%3E%20%3Cx%3Axmpmeta%20xmlns%3Ax%3D%22adobe%3Ans%3Ameta%2F%22%20x%3Axmptk%3D%22Adobe%20XMP%20Core%205.0-c060%2061.134777%2C%202010%2F02%2F12-17%3A32%3A00%20%20%20%20%20%20%20%20%22%3E%20%3Crdf%3ARDF%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%3E%20%3Crdf%3ADescription%20rdf%3Aabout%3D%22%22%20xmlns%3AxmpMM%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2Fmm%2F%22%20xmlns%3AstRef%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2FsType%2FResourceRef%23%22%20xmlns%3Axmp%3D%22http%3A%2F%2Fns.adobe.com%2Fxap%2F1.0%2F%22%20xmpMM%3AOriginalDocumentID%3D%22xmp.did%3A3DDD06742B8DE011952EC04AE9C71C6E%22%20xmpMM%3ADocumentID%3D%22xmp.did%3AFB8694A1B95B11E089FD9315AFFFFC35%22%20xmpMM%3AInstanceID%3D%22xmp.iid%3AFB8694A0B95B11E089FD9315AFFFFC35%22%20xmp%3ACreatorTool%3D%22Adobe%20Photoshop%20CS5%20Windows%22%3E%20%3CxmpMM%3ADerivedFrom%20stRef%3AinstanceID%3D%22xmp.iid%3ABB242C8D4AB9E011B013F72FE65B91B8%22%20stRef%3AdocumentID%3D%22xmp.did%3A3DDD06742B8DE011952EC04AE9C71C6E%22%2F%3E%20%3C%2Frdf%3ADescription%3E%20%3C%2Frdf%3ARDF%3E%20%3C%2Fx%3Axmpmeta%3E%20%3C%3Fxpacket%20end%3D%22r%22%3F%3E3%FD%7F%2B%00%00%018IDATx%DAt%91%BBJCA%10%40w%D7%DCB%23%DC%80%8A%82U%AA%60e%9DJH-%82%8D%85X)ha!X%24%A5%F8H%FE%20%8D_%60%E3%2F%A4%B2%13%D1%D2%CAB%10%95%D8%04%7C%E0%7DzFv%C3%25%EC%1D8%CC%EC0%EF%D5i%9An%18c.U%B9%F4%93%249'NeY%A6%0C%8EY%1C%CA%C3%85%D5%87Z%EB%9E%CB68%86%92%E9%E1%1Ab%B1%A9%BEK%D2%A9%24Tx%04%BE9%18%F3%15%F5%94%E7yC%DE%24%1C%A0%96%2BT%C8%7D%09%04%AA8%8E%D7%82%20%D8%C3%5E%C5%B5%05%EB%D2%A1l%D97%180%F2%2F%FA%0EF%10J%07e%5B%3E%60%EF%60%CEK%03X%84%25xa%BC%0E%5DB%EC%CFb%87%3At%A1f%DF%99M%FC%A6P%E8V%2B%26%3C%C3%09%2C%C0%94%0D%D6%F0%0EG%F0%BF%FCx%24d%05%AE%A0%3A%B1%CB%8F%1DO%B9%B3%3A%FB%166a%AE%10%2C%1D%3E%A0%0D%C7%93%235Y%EE%1E%3Dc%03%9D%7C1%85%2B%92%8E%FF%81%2B%0D%A2(%DAF%FBN%BCO%B13%F9%1B%E9%E0.%D0%92%DB%8B%D3'v%D7%AAtx%2C%2CgJ%3EQ%A2%A7%E1%E6O%80%01%00%20%DB%B8%A6Z%92%D9)%00%00%00%00IEND%AEB%60%82"
        value:"images/picker/file.png"
    },

    /**
     * convert timestamp to human readable form
     *
     * @param: timestamp - UTC milliseconds
     */
    formatTimestamp:{
        writable:false,
        enumerable: false,
    	value: function(timestamp) {
            var aDate = new Date();
            timestamp = timestamp - (aDate.getTimezoneOffset()*60*1000);//convert from GMT to local timestamp
            aDate = new Date(timestamp);
            return aDate.toLocaleString();
    	}
    }

});
