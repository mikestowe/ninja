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

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    iconsListModule = require("js/components/ui/icon-list-basic/iconsList.reel"),
    treeModule = require("js/components/ui/tree-basic/tree.reel");

var PickerNavigator = exports.PickerNavigator = Montage.create(Component, {

    filterVal: {
        value: null,
        serializable: true
    },

    error: {
        value: null,
        serializable: true
    },

    addressBarUri: {
        value: null,
        serializable: true
    },

    forwardArrow: {
        value: null,
        serializable: true
    },

    backArrow: {
        value: null,
        serializable: true
    },

    leftNav: {
        value: null,
        serializable: true
    },

    iconViewContainer: {
        value: null,
        serializable: true
    },

    iconView: {
        value: null,
        serializable: true
    },

    treeView: {
        value: null,
        serializable: true
    },

    treeViewContainer: {
        value: null,
        serializable: true
    },

    okButton: {
        value: null,
        serializable: true
    },

    metadataSection: {
        value: null,
        serializable: true
    },

    filters: {
        value: null,
        serializable: true
    },

    refreshButton: {
        value: null,
        serializable: true
    },

    cancelButton: {
        value: null,
        serializable: true
    },

    resultsArea: {
        value: null,
        serializable: true
    },

    popup:{
        enumerable: false,
        writable: true,
        value: null
    },

    mainContentData:{
        enumerable:false,
        writable:true,
        value:null
    },

    _firstTime: {
        enumerable: false,
        value: true
    },

    firstTime:{
        get: function(){},
        set: function(){}
    },

    pickerCallback:{
        enumerable:false,
        writable:true,
        value:null
    },

    selectedItems:{//passed to pickerCallback on click of OK
        enumerable:false,
        writable:true,
        value:[]
    },

    /**
     * store a reference to the currently selected node... for single selection
     */
     currentSelectedNode:{
        enumerable:false,
        writable:true,
        value:null
    },

    currentURI:{
        enumerable:false,
        writable:true,
        value:null
    },

    iconsViewDrawnOnce:{
        enumerable:false,
        writable:true,
        value:false
    },

    /**
     * for tree view only
     * will store folder uri vs tree instance map
     */
    treeRefHash:{
        enumerable:false,
        writable:true,
        value:{

        }
    },

    selectedPickerView:{
        enumerable:false,
        writable:true,
        value:null
    },

    /**
     * Contains the different Views and their update handlers
     */
    pickerViews:{
        enumerable:false,
        writable:true,
        value: function(){
            var that = this;
            return {
                "iconView":that.updateIconView,
                "treeView":that.updateTreeView
            }
        }
    },
    
    pickerModel:{
        enumerable:false,
        writable:true,
        value:null
    },

    willDraw: {
    	enumerable: false,
    	value: function() {

    	}
    },
    draw: {
    	enumerable: false,
    	value: function() {
            this.filterVal.innerHTML = this.pickerModel.currentFilter;

            if(this.pickerModel.fatalError !== null){
                this.error.innerHTML = this.pickerModel.fatalError;
            }

    	}
    },
    didDraw: {
    	enumerable: false,
    	value: function() {

            var that = this;
            this.iconList = null;
            this.newContent = null;
            this.spanEl = null;

            this.addIdentifiers();

            var topLevelDirs = this.pickerModel.topLevelDirectories;
            var leftNav = this.leftNav;
            //draw left nav
            if(!!topLevelDirs
                && (typeof topLevelDirs === "object")
                && ('splice' in topLevelDirs)
                && ('join' in topLevelDirs)
                &&(topLevelDirs.length > 0)){

                topLevelDirs.forEach(function(dirObj){
                    var newDiv = document.createElement("div");
                    newDiv.className = "driversList";
                    newDiv.innerHTML = dirObj.name;
                    leftNav.appendChild(newDiv);
                    if(dirObj.uri === this.pickerModel.currentRoot){
                        newDiv.classList.add("highlighted");
                        //enable ok for logical drive selections, when in directory selection mode
                        if(this.pickerModel.inFileMode === false){
                            this.okButton.removeAttribute("disabled");
                            //put into selectedItems..currently single selection is supported
                            this.selectedItems = [dirObj.uri];
                        }
                    }

                    newDiv.addEventListener("click", function(evt){that.handleTopLevelDirectoryClicks(evt, dirObj);}, false);
                }, that);
            }else{
                console.error("need at least 1 valid top level directory");
            }

            //Draw icon view list
            //TODO: check the default view and draw the appropriate view
            if(this.mainContentData !== null){

                this.currentURI = this.pickerModel.currentRoot;

                //draw the IconsList if icons view container is on
                if(this.iconViewContainer.style.display === "block"){
                    this.iconList = iconsListModule.IconsList.create();
                    //console.log(this.mainContentData);
                    this.iconList.iconsViewDataObject = this.mainContentData;
                    this.iconList.element = this.iconViewContainer;
                    this.iconList.needsDraw = true;
                    this.iconsViewDrawnOnce = true;
                    this.selectedPickerView = "iconView";

                    if(!this.iconView.classList.contains("viewSelected")){
                        this.iconView.classList.add("viewSelected")
                    }
                    if(this.treeView.classList.contains("viewSelected")){
                        this.treeView.classList.remove("viewSelected");
                    }

                }else if(this.treeViewContainer.style.display === "block"){
                    //else draw the Tree if tree view container is on
                    this.renderTree(this.treeViewContainer, this.currentURI);
                    this.selectedPickerView = "treeView";

                    if(!this.treeView.classList.contains("viewSelected")){
                        this.treeView.classList.add("viewSelected")
                    }
                    if(this.iconView.classList.contains("viewSelected")){
                        this.iconView.classList.remove("viewSelected");
                    }
                }

                this.updateAddressBar(this.pickerModel.currentRoot);
                this.pickerModel.storeHistory(this.pickerModel.currentRoot);//populate history

                this.updateMetadata(this.currentURI);

                //for directory selection, selected url is the folder entered
                if(!this.pickerModel.inFileMode ){
                    this.okButton.removeAttribute("disabled");
                    //put into selectedItems..currently single selection is supported
                    this.selectedItems = [this.pickerModel.currentRoot];
                }
            }

            this.element.addEventListener("openFolder", function(evt){that.handlePickerNavOpenFolder(evt);}, false);//add icon double click event listener to reload iconList with new set of data
            this.element.addEventListener("selectedItem", function(evt){that.handlePickerNavSelectedItem(evt);}, false);//for single selection only
            this.element.addEventListener("selectFile", function(evt){that.handlePickerNavSelectedFile(evt);}, false);//for file selection
            this.element.addEventListener("showMetadata", function(evt){that.handlePickerNavShowMetadata(evt);}, false);//show metadata on hover of icon
            this.element.addEventListener("updateMetadata", function(evt){that.handlePickerNavUpdateMetadata(evt);}, false);//show metadata on click of icon
            //this.addressGo.addEventListener("click", this, false);
            this.addressBarUri.addEventListener("keydown", this, false);
            this.addressBarUri.addEventListener("keyup", this, false);
            this.refreshButton.addEventListener("click", this, false);//refresh - gets from file system directly
            this.backArrow.addEventListener("click", this, false);
            this.forwardArrow.addEventListener("click", this, false);

            //populate filters if in file selection mode
            if(this.pickerModel.inFileMode === true){
                var filtersDD = this.element.querySelector(".filters .dropdown");
                if(!!this.pickerModel.fileFilters
                    && (typeof this.pickerModel.fileFilters === "object")
                    && ('splice' in this.pickerModel.fileFilters)
                    && ('join' in this.pickerModel.fileFilters)){
                    this.pickerModel.fileFilters.forEach(function(aFilter){
                        var newDiv = document.createElement("div");
                        newDiv.innerHTML = aFilter;
                        filtersDD.appendChild(newDiv);
                        newDiv.addEventListener("click", function(evt){that.handleFilterClick(evt, aFilter, filtersDD)}, false);
                    }, this);
                }

                var renderedWidth = this.getComputedWidth(filtersDD);
                this.filters.style.width = "" + (parseInt((renderedWidth.substring(0, (renderedWidth.length - 2)))) + 20) + "px";
            }else{
                this.filters.style.display = "none";
            }
            /**
             * attach click event listeners to the addressbar dropdown arrows
             */
            var dropDownArrows = this.element.getElementsByClassName("dropdownArrow");
            for(var x=0; x<dropDownArrows.length;x++){
                dropDownArrows[x].addEventListener("click", function(evt){that.handleAddressDropdownArrowClick(evt);}, false);
            }

            this.iconView.addEventListener("click", this, false);
            this.treeView.addEventListener("click", this, false);
            this.element.addEventListener("drawTree", function(evt){that.handlePickerNavDrawTree(evt);}, false);
            this.element.addEventListener("refreshTreeSegment", function(evt){that.handlePickerNavRefreshTreeSegment(evt);}, false);
            this.resultsArea.addEventListener("click", function(evt){that.handleResultsAreaClick(evt);}, false);
            this.element.addEventListener("click", function(evt){that.handlePickerNavClick(evt);}, false);
            this.okButton.addEventListener("click", function(evt){that.handleOkButtonAction(evt);}, false);
            this.cancelButton.addEventListener("click", function(evt){that.handleCancelButtonAction(evt);}, false);

            this.element.addEventListener("keyup", function(evt){
                if(evt.keyCode == 27) {
                    if(that.application.ninja.filePickerController.pickerNavChoices !== null){
                        that.handleCancelButtonAction();
                    }
                }
            }, true);

            //ready to show picker now
            this.element.style.visibility = "visible";
            this.element.focus();
    	}
    },

    updateAddressBar:{
        writable: false,
        enumerable:true,
        value: function(folderUri){
            var addressBarEl = this.addressBarUri;
            if(addressBarEl){
                addressBarEl.value = folderUri;

                //update left drive selection
                
            }
        }
    },

    cleanupUri:{
        writable: false,
        enumerable:true,
        value: function(folderUri){
            folderUri = folderUri.replace(/^\s+|\s+$/g,"");  // strip any leading or trailing spaces
            //remove unnecessary / from end - for Win and Mac .... don't trim for the root
            if(((folderUri.charAt(folderUri.length - 1) === "/") || (folderUri.charAt(folderUri.length - 1) === "\\")) && (folderUri !== "/")){
                folderUri = folderUri.substring(0, (folderUri.length - 1));
                //console.log("*** new uri = "+ folderUri);
            }

            return folderUri;
        }
    },

    clearSelection:{
        writable: false,
        enumerable:true,
        value: function(folderUri){
            if((this.currentSelectedNode !== null) && (this.currentSelectedNode.classList.contains("selected"))){
                this.currentSelectedNode.classList.remove("selected");
            }
            this.currentSelectedNode = null;
            //disable OK
            if(!this.okButton.hasAttribute("disabled")){
                this.okButton.setAttribute("disabled", "true");
            }
        }
    },

    toggleDropdown:{
        writable: false,
        enumerable:true,
        value: function(dropdownArrowEl){
            var dropdownDiv = dropdownArrowEl.parentNode.getElementsByClassName("dropdown")[0];
            dropdownDiv.classList.toggle("hide");
        }
    },

    closeDropdowns:{
        writable:false,
        enumerable:true,
        value:function(clickedTarget){
            if(!clickedTarget.classList.contains("dropdownArrow")){//if not clicked on the drop down arrow itself
                var dropDowns = this.element.getElementsByClassName("dropdown");
                for(var x=0; x<dropDowns.length;x++){
                    if(!dropDowns[x].classList.contains("hide")){//if dropdown open
                        if(this.isOutside(dropDowns[x], clickedTarget)){
                            dropDowns[x].classList.add("hide");
                            //console.log("!!! closed DD: "+dropDowns[x].classList.toString());
                        }
                    }
                }
            }
        }
    },

    prepareAddressDropdownData:{
        writable:false,
        enumerable:true,
        value:function(uri){
            uri = this.cleanupUri(uri);
            var arr = [];
            var temp = new String(uri);
            while(temp.indexOf("/") != -1){

                if(""+temp === this.pickerModel.currentLogicalDrive){//stop at the logical drive
                    break;
                }

                temp = temp.substring(0, temp.lastIndexOf("/"));

                //populate dropdown irrespective of validity
//                if(!!this.application.ninja.filePickerController._directoryContentCache[temp]){//check if it is a valid location
//                    arr.push(temp);
//                }else{
//                    break;
//                }
                if(temp.length >0){
                    arr.push(temp);
                }else{//for unix root /
                    arr.push("/");
                }

            }
            //console.log(arr);
            return arr;
        }
    },

    renderTree:{
        writable:false,
        enumerable:true,
        value:function(element, uri){
            if(!!element){
                var tree = treeModule.Tree.create();
                tree.treeViewDataObject = this.application.ninja.filePickerController.prepareContentList(uri, this.pickerModel);
                //console.log("renderTree() for "+ uri);
                //console.log(tree.treeViewDataObject);
                tree.element = element;
                tree.needsDraw = true;
            }
        }
    },

    updateIconView:{
        writable:false,
        enumerable:true,
        value:function(uri, fromCache){
            var status = true;
            var iconViewContainer = this.element.querySelector(".iconViewContainer");
            if((typeof fromCache === 'undefined') || (fromCache === true)){
            this.newContent = this.application.ninja.filePickerController.prepareContentList(uri, this.pickerModel);
            }
            else{
                this.newContent = this.application.ninja.filePickerController.prepareContentList(uri, this.pickerModel, false);
            }
            if(!!this.newContent && this.newContent.length > 0){
                //clear selection
                this.clearSelection();
                this.spanEl = iconViewContainer.querySelector(".noResults");
                if(!!this.spanEl){
                    this.spanEl.style.display = "none";
                }
                this.iconList.iconsViewDataObject = this.newContent;
            }else{
                this.iconList.iconsViewDataObject = [];
                this.spanEl = iconViewContainer.querySelector(".noResults");
                if(!!this.spanEl){
                    this.spanEl.style.display = "block";
                }else{
                    this.spanEl = document.createElement("span");
                    this.spanEl.className = "noResults";
                    this.spanEl.innerHTML = "no results";
                    this.spanEl.style.display = "block";
                    iconViewContainer.appendChild(this.spanEl);
                }
                status = false; //for no match
            }
            this.updateMetadata(uri);

            return status;
        }
    },

    updateTreeView:{
        writable:false,
        enumerable:true,
        value:function(uri, fromCache){
            var status = true;
            //need to draw every time since an expanded tree won't update with just bound data update
            var treeViewContainer =  this.element.querySelector(".treeViewContainer");
            //first clean up treeViewContainer
            while(treeViewContainer.hasChilden){
                treeViewContainer.removeChild(treeViewContainer.lastChild);
            }
            //now draw the unexpanded tree with the current uri data

            if(!!treeViewContainer){
                var data = [];
                if((typeof fromCache === 'undefined') || (fromCache === true)){
                    data = this.application.ninja.filePickerController.prepareContentList(uri, this.pickerModel);
                }
                else{
                    data = this.application.ninja.filePickerController.prepareContentList(uri, this.pickerModel, false);
                }

                if(data.length > 0){

                    //clear selection
                    this.clearSelection();
                    this.spanEl = this.element.querySelector(".treeViewContainer").querySelector(".noResults");
                    if(!!this.spanEl){
                        this.spanEl.style.display = "none";
                    }

                    var tree = treeModule.Tree.create();
                    tree.treeViewDataObject = data;
                    tree.element = treeViewContainer;
                    tree.needsDraw = true;

                }else{

                    var treeUl = treeViewContainer.getElementsByTagName("ul")[0];
                    if(!!treeUl){
                        treeUl.style.display = "none";
                    }

                    this.spanEl = this.element.querySelector(".treeViewContainer").querySelector(".noResults");
                    if(!!this.spanEl){
                        this.spanEl.style.display = "block";
                    }else{
                        this.spanEl = document.createElement("span");
                        this.spanEl.className = "noResults";
                        this.spanEl.innerHTML = "no results";
                        this.spanEl.style.display = "block";
                        this.element.querySelector(".treeViewContainer").appendChild(this.spanEl);
                    }

                    status = false; //for no match
                }

                this.updateMetadata(uri);

                return status;
            }
        }
    },

    updateMetadata:{
        enumerable: false,
        writable:false,
        value:function(currentUri){
            var data = this.application.ninja.filePickerController._directoryContentCache[currentUri];
            var metadata = "";
            if(!!data){
                if(data.name !== ""){
                    metadata = "Name: "+data.name;
                }
                metadata = metadata + "<br />" + "Type: "+data.type;
                if(data.size){metadata = metadata + "<br />" + "Size: "+data.size+" bytes";}
                if(data.creationDate){metadata = metadata + "<br />" + "Creation date: "+ this.formatTimestamp(data.creationDate);}
                if(data.modifiedDate){metadata = metadata + "<br />" + "Modified date: "+ this.formatTimestamp(data.modifiedDate);}
            }
            this.element.getElementsByClassName("right-bottom")[0].innerHTML = metadata;
        }
    },

    isOutside:{
        enumerable:true,
        value:function(el, targetEl){
            var isOutside = true;
            if(el){
                var childElements = el.getElementsByTagName("*");//get a flat NodeList of all the child elements
                if(childElements != null){
                    for(var i=0; i< childElements.length; i++){
                        if(childElements[i] === targetEl){//targetEl matches with an element inside the menu
                            isOutside = false;
                            break;
                        }
                    }
                }
            }
            return isOutside;
        }
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
    },

    /**
     * Event Listners
     */

    addIdentifiers:{
        value: function(){
            this.element.identifier = "pickerNav";
            //this.addressGo.identifier = "addressGo";
            this.addressBarUri.identifier = "addressBarUri";
            this.refreshButton.identifier = "refreshButton";
            this.backArrow.identifier = "backArrow";
            this.forwardArrow.identifier = "forwardArrow";
            this.iconView.identifier = "iconView";
            this.treeView.identifier = "treeView";
            this.resultsArea.identifier = "resultsArea";
        }
    },

    handleTopLevelDirectoryClicks : {
        enumerable: true,
        writable: false,
        value : function(evt, dirObj){
                    this.currentURI = this.pickerModel.currentLogicalDrive = dirObj.uri;

                    var status = this.pickerViews()[this.selectedPickerView].call(this, dirObj.uri);//dynamically calls the update function of the current picker view

                    this.updateAddressBar(dirObj.uri);
                    this.pickerModel.currentRoot = dirObj.uri;

                    //populate history
                    this.pickerModel.storeHistory(dirObj.uri);
                    //disable forward button for explicit new urls
                    if(!this.forwardArrow.classList.contains("disable")){
                        this.forwardArrow.classList.add("disable");
                    }
                    //enable back button if required
                    if((this.pickerModel.currentHistoryPointer === 1) && this.backArrow.classList.contains("disable")){
                        this.backArrow.classList.remove("disable");
                    }

                    //dehighlight current selection and highlight new selection
                    var currentHighlighted = evt.target.parentNode.querySelector(".highlighted");
                    if(!!currentHighlighted){
                        currentHighlighted.classList.remove("highlighted");
                    }
                    if(!evt.target.classList.contains("highlighted")){
                        evt.target.classList.add("highlighted");
                    }

                    //enable ok for logical drive selections, when in directory selection mode
                    if(this.pickerModel.inFileMode === false){
                        this.okButton.removeAttribute("disabled");
                        //put into selectedItems..currently single selection is supported
                        this.selectedItems = [dirObj.uri];
                    }
                }
    },

    handlePickerNavOpenFolder: {
        value: function(evt){
                    this.currentURI = evt.folderUri;
                    var status = this.pickerViews()[this.selectedPickerView].call(this, evt.folderUri);//dynamically calls the update function of the current picker view

                    //update address-bar
                    this.updateAddressBar(evt.folderUri);

                    //populate history
                    this.pickerModel.storeHistory(evt.folderUri);

                    //disable forward button for explicit new urls
                    if(!this.forwardArrow.classList.contains("disable")){
                        this.forwardArrow.classList.add("disable");
                    }

                    //enable back button if required
                    if((this.pickerModel.currentHistoryPointer === 1) && this.backArrow.classList.contains("disable")){
                        this.backArrow.classList.remove("disable");
                    }

                    //for directory selection, selected url is the folder entered
                    if(!this.pickerModel.inFileMode ){
                        this.okButton.removeAttribute("disabled");
                        //put into selectedItems..currently single selection is supported
                        this.selectedItems = [evt.folderUri];
                    }

                }
    },


    handlePickerNavSelectedItem: {
        value:function(evt){
                    var uri = evt.uri;

                    //handle deselection of other icons for single selection
                    if((this.currentSelectedNode !== null) && (this.currentSelectedNode !== evt.target) && (this.currentSelectedNode.classList.contains("selected"))){
                        this.currentSelectedNode.classList.remove("selected");
                        this.currentSelectedNode = null;
                    }
                    //enable OK button if the selection is valid as per the picker mode
                    if((this.pickerModel.inFileMode && (this.application.ninja.filePickerController._directoryContentCache[uri].type === "file"))
                        || (!this.pickerModel.inFileMode && (this.application.ninja.filePickerController._directoryContentCache[uri].type === "directory"))){
                        this.okButton.removeAttribute("disabled");

                        //put into selectedItems..currently single selection is supported
                        this.selectedItems = [uri];

                        if(!evt.target.classList.contains("selected")){
                            evt.target.classList.add("selected");
                        }

                        this.currentSelectedNode = evt.target;

                    }else{


                        //test: highlight non-selectable icons too
                        if(!evt.target.classList.contains("selected")){
                            evt.target.classList.add("selected");
                        }
                        this.currentSelectedNode = evt.target;
                        //end- test


                        //disable OK
                        if(!this.okButton.hasAttribute("disabled")){
                            this.okButton.setAttribute("disabled", "true");
                        }
                    }
            }
    },

    handlePickerNavSelectedFile:{
        value: function(evt){
            var uri = evt.fileUri;

            //do selection if in file selection mode
            if(this.pickerModel.inFileMode && (this.application.ninja.filePickerController._directoryContentCache[uri].type === "file")){
                this.okButton.removeAttribute("disabled");
                //put into selectedItems..currently single selection is supported
                this.selectedItems = [uri];
                this.currentURI = uri.substring(0, uri.lastIndexOf("/"));
                this.handleOkButtonAction();
            }
        }
    },

    handlePickerNavShowMetadata: {
        value: function(evt){
                //update matadata only if nothing is already selected
                if(this.currentSelectedNode == null){
                    //console.log("handle showmetadata - true");
                    this.metadataSection.innerHTML = evt.metadata;
                }
        }
    },

    handlePickerNavUpdateMetadata:{
        value: function(evt){
                    this.metadataSection.innerHTML = evt.metadata;
                }
    },

    handleAddressGoClick :{
        value: function(evt){

                    if(this.addressBarUri.value !== ""){
                        var uri = this.addressBarUri.value;
                        uri = this.cleanupUri(uri);

                        this.currentURI = uri;
                        var status = this.pickerViews()[this.selectedPickerView].call(this, uri);//dynamically calls the update function of the current picker view

                        //populate history
                        this.pickerModel.storeHistory(uri);

                        //disable forward button for explicit new urls
                        if(!this.forwardArrow.classList.contains("disable")){
                            this.forwardArrow.classList.add("disable");
                        }

                        //enable back button if required
                        if((this.pickerModel.currentHistoryPointer === 1) && this.backArrow.classList.contains("disable")){
                            this.backArrow.classList.remove("disable");
                        }
                    }
                }
    },

    handleAddressBarUriKeydown:{
        value: function(evt){
                    if(evt.keyCode === 13 ){
                        var uri = this.addressBarUri.value;
                        uri = this.cleanupUri(uri);

                        this.currentURI = uri;

                        var status = this.pickerViews()[this.selectedPickerView].call(this, uri);//dynamically calls the update function of the current picker view

                        //populate history
                        this.pickerModel.storeHistory(uri);
                        //disable forward button for explicit new urls
                        if(!this.forwardArrow.classList.contains("disable")){
                            this.forwardArrow.classList.add("disable");
                        }
                        //enable back button if required
                        if((this.pickerModel.currentHistoryPointer === 1) && this.backArrow.classList.contains("disable")){
                            this.backArrow.classList.remove("disable");
                        }
                    }
              }
    },

    handleAddressBarUriKeyup:{
        value: function(evt){
            //disable ok if user enters an invalid uri
            if(!this.application.ninja.coreIoApi.isValidUri(this.addressBarUri.value)){
                //disable OK
                if(!this.okButton.hasAttribute("disabled")){
                    this.okButton.setAttribute("disabled", "true");
                }
            }else{
                this.okButton.removeAttribute("disabled");
                this.selectedItems = [this.addressBarUri.value];
            }
        }
    },

    handleRefreshButtonClick:{
        value:function(evt){
                var uri = this.addressBarUri.value;
                uri = this.cleanupUri(uri);

                var status = this.pickerViews()[this.selectedPickerView].call(this, uri, false);//dynamically calls the update function of the current picker view

            }
    },

    handleBackArrowClick :{
        value:function(evt){
                var uri = "";
                //console.log("*** backArrow: pointer ="+this.pickerModel.currentHistoryPointer);
                if(this.pickerModel.currentHistoryPointer >0){
                    uri = this.pickerModel._history[this.pickerModel.currentHistoryPointer -1];
                    //console.log("*** back uri= "+ uri);
                    //console.log(this.pickerModel._history);

                    this.currentURI = uri;
                    var status = this.pickerViews()[this.selectedPickerView].call(this, uri);//dynamically calls the update function of the current picker view

                    //update address-bar
                    this.updateAddressBar(uri);

                    this.pickerModel.currentHistoryPointer -= 1;

                    //disable back button if it is at the beginning
                    if((this.pickerModel.currentHistoryPointer === 0) && (!evt.target.classList.contains("disable"))){
                        evt.target.classList.add("disable");
                    }
                    //enable forward button if required
                    if((this.pickerModel.currentHistoryPointer < (this.pickerModel._history.length -1) && (this.forwardArrow.classList.contains("disable")))){
                        this.forwardArrow.classList.remove("disable");
                    }
                }
                //console.log("***new backArrow: pointer ="+this.pickerModel.currentHistoryPointer);
            }
    },

    handleForwardArrowClick: {
        value:function(evt){
                var uri = "";
                //console.log("*** forwardArrow: pointer ="+this.pickerModel.currentHistoryPointer);
                if(this.pickerModel.currentHistoryPointer < (this.pickerModel._history.length -1)){
                    uri = this.pickerModel._history[this.pickerModel.currentHistoryPointer + 1];
                    //console.log("*** forward uri= "+ uri);
                    //console.log(this.pickerModel._history);

                    this.currentURI = uri;
                    var status = this.pickerViews()[this.selectedPickerView].call(this, uri);//dynamically calls the update function of the current picker view

                    //update address-bar
                    this.updateAddressBar(uri);

                    this.pickerModel.currentHistoryPointer += 1;

                    //disable forward button if pointer is at the end
                    if((this.pickerModel.currentHistoryPointer === (this.pickerModel._history.length -1)) && (!evt.target.classList.contains("disable"))){
                        evt.target.classList.add("disable");
                    }

                    //enable back button if required
                    if((this.pickerModel.currentHistoryPointer > 0) && (this.backArrow.classList.contains("disable"))){
                        this.backArrow.classList.remove("disable");
                    }

                }
                //console.log("***new forwardArrow: pointer ="+this.pickerModel.currentHistoryPointer);
            }
    },

    handleOkButtonAction : {
        value: function(evt){
                    //console.log("$$$ File Picker : selected "+ this.selectedItems.toString());
                    var success = true;
                    if(!!this.pickerModel.callback && (this.selectedItems.length > 0)){//call the callback if it is available
                        try{
                            this.pickerModel.callback({"uri":this.selectedItems});
                        }catch(e){
                            success = false;
                            console.log("[Error] Failed to open "+ this.selectedItems.toString());
                            console.log(e.stack);
                        }
                    }else{//else send an event with the selected files
                        var pickerSelectionEvent = document.createEvent("Events");
                        pickerSelectionEvent.initEvent("pickerSelectionsDone", false, false);
                        pickerSelectionEvent.selectedItems = this.selectedItems;
                        this.eventManager.dispatchEvent(pickerSelectionEvent);
                    }

                    //store last opened/saved folder, and view after IO is successful
                    var dataStore = window.sessionStorage;
                    try {
                        if(this.pickerModel.pickerMode === "write"){
                            dataStore.setItem('lastSavedFolderURI', encodeURI(""+this.currentURI));
                        }
                        else if(this.pickerModel.inFileMode === true){
                            dataStore.setItem('lastOpenedFolderURI_fileSelection',encodeURI(""+this.currentURI));
                        }else if(this.pickerModel.inFileMode === false){
                            dataStore.setItem('lastOpenedFolderURI_folderSelection',encodeURI(""+this.currentURI));
                        }
                    }
                    catch(e){
                        if(e.code == 22){
                            dataStore.clear();
                        }
                    }

                    this.cleanup();//clear up any unnecessary memory

                    if(this.popup){
                        this.popup.hide();
                    }
                    //end - close dialog
              }
    },

    handleCancelButtonAction :{
        value:function(evt){
                //clean up memory
                this.cleanup();

                if(this.popup){
                    this.popup.hide();
                }

            }
    },

    handleFilterClick:{
        value: function(evt, aFilter, filtersDD){
                    this.pickerModel.currentFilter = aFilter;

                    this.pickerViews()[this.selectedPickerView].call(this, this.currentURI);//dynamically calls the update function of the current picker view

                    this.element.querySelector(".filters .filterVal").innerHTML = evt.target.innerHTML;
                    filtersDD.classList.toggle("hide");
                }
    },

    handleAddressDropdownArrowClick:{
        value: function(evt){
            var that = this;

            //populate dropdown dynamically for addressbar
            var addressbarDD = this.element.querySelector(".addressbar .dropdown");
            if((evt.target === this.element.querySelector(".addressbar .dropdownArrow")) && (addressbarDD.classList.contains("hide"))){//dropdown is closed

                //clear old dropdown contents
                while(addressbarDD.hasChildNodes()){
                    addressbarDD.removeChild(addressbarDD.lastChild);
                }

                var uriTrail = this.prepareAddressDropdownData(this.addressBarUri.value);
                if(uriTrail.length >0){
                    uriTrail.forEach(function(aUri){
                        var newDiv = document.createElement("div");
                        newDiv.innerHTML = aUri;
                        addressbarDD.appendChild(newDiv);
                        newDiv.addEventListener("click", function(evt){that.handleAddressTrailClick(evt, aUri, addressbarDD);}, false);
                    }, this);
                }
            }
            //open close dropdown
            this.toggleDropdown(evt.target);
        }
    },

    handleAddressTrailClick: {
        value: function(evt, aUri, addressbarDD){
                    this.currentURI = aUri;
                    var status = this.pickerViews()[this.selectedPickerView].call(this, aUri);//dynamically calls the update function of the current picker view

                    //populate history
                    this.pickerModel.storeHistory(aUri);
                    //disable forward button for explicit new urls
                    if(!this.forwardArrow.classList.contains("disable")){
                        this.forwardArrow.classList.add("disable");
                    }
                    //enable back button if required
                    if((this.pickerModel.currentHistoryPointer === 1) && this.backArrow.classList.contains("disable")){
                        this.backArrow.classList.remove("disable");
                    }
                    this.addressBarUri.value = evt.target.innerHTML;
                    addressbarDD.classList.toggle("hide");
                }
    },

    handleIconViewClick :{
        value:function(evt){

                this.selectedPickerView = "iconView";

                if(this.element.querySelector(".iconViewContainer").style.display === "none"){
                    //draw if icons list is not already drawn
                    if(this.iconsViewDrawnOnce === false){
                        this.iconList = iconsListModule.IconsList.create();
                        this.iconList.iconsViewDataObject = that.mainContentData;
                        this.iconList.element = that.iconViewContainer;
                        this.iconList.needsDraw = true;
                        this.iconsViewDrawnOnce = true;
                    }else{
                        this.pickerViews()[this.selectedPickerView].call(this, this.currentURI);
                    }
                    this.element.querySelector(".iconViewContainer").style.display = "block";
                }
                this.element.querySelector(".treeViewContainer").style.display = "none";

                //enable selection
                if(!evt.target.classList.contains("viewSelected")){
                    evt.target.classList.add("viewSelected")
                }
                if(this.treeView.classList.contains("viewSelected")){
                    this.treeView.classList.remove("viewSelected");
                }
            }
    },

    handleTreeViewClick : {
        value:function(evt){

                this.selectedPickerView = "treeView";

                if(this.element.querySelector(".treeViewContainer").style.display === "none"){

                    this.pickerViews()[this.selectedPickerView].call(this, this.currentURI);

                    this.element.querySelector(".treeViewContainer").style.display = "block";
                }
                this.element.querySelector(".iconViewContainer").style.display = "none";

                //enable selection
                if(!evt.target.classList.contains("viewSelected")){
                    evt.target.classList.add("viewSelected")
                }
                if(this.iconView.classList.contains("viewSelected")){
                    this.iconView.classList.remove("viewSelected");
                }

            }
    },

    handlePickerNavDrawTree:{
        value: function(evt){
                //toggle open or close for directory
                if(evt.uriType === "directory"){
                    this.renderTree(evt.subTreeContainer, evt.uri);
                }
            }
    },

    handlePickerNavRefreshTreeSegment:{
        value: function(evt){
//                if(this.application.ninja.filePickerController.checkIfStale(evt.uri)){
//                    //update tree segment if was stale
//                    evt.treeSegment.treeViewDataObject = this.application.ninja.filePickerController.prepareContentList(evt.uri, this.pickerModel, true, false);
//                }
            }
    },

    handleResultsAreaClick: {
        value:function(evt){
                //console.log("### clicked right-top");
                if((evt.target.querySelectorAll(".icon").length > 1)
                    || (evt.target.querySelectorAll(".atreeItem").length > 1)){//not clicked on an icon
                    //console.log("@@ clicked in empty area");
                    this.clearSelection();
                }
            }
    },

    handlePickerNavClick:{
        value: function(evt){
                //console.log("### clicked picker");
                this.closeDropdowns(evt.target);
            }
    },

    getComputedWidth:{
        value: function(element){
            var calculatedWidth = "0px";
            var orginalDisplay = element.style.display;
            var originalVisibility = element.style.visibility;
            element.style.display = "block";
            element.style.visibility = "hidden";
            calculatedWidth = window.getComputedStyle(element, null).getPropertyValue("width");
            element.style.display = orginalDisplay;
            element.style.visibility = originalVisibility;
            return calculatedWidth;
        }
    },

    cleanup:{
            writable:false,
            enumerable:true,
            value:function(){
                //clear memory - TODO:check for more memory leaks
                this.pickerModel = null;
                this.application.ninja.filePickerController._directoryContentCache = {};
                this.application.ninja.filePickerController.pickerNavChoices = null;
                //remove listeners
                this.element.removeEventListener("openFolder", this, false);//add icon double click event listener to reload iconList with new set of data
                this.element.removeEventListener("selectedItem", this, false);//for single selection only
                this.element.removeEventListener("showMetadata", this, false);//show metadata on hover of icon
                this.element.removeEventListener("updateMetadata", this, false);//show metadata on click of icon
                //this.addressGo.removeEventListener("click", this, false);
                this.addressBarUri.removeEventListener("keydown", this, false);
                this.refreshButton.removeEventListener("click", this, false);//refresh - gets from file system directly
                this.backArrow.removeEventListener("click", this, false);
                this.forwardArrow.removeEventListener("click", this, false);
                this.iconView.removeEventListener("click", this, false);
                this.treeView.removeEventListener("click", this, false);
                this.element.removeEventListener("drawTree", this, false);
                this.resultsArea.removeEventListener("click", this, false);
                this.element.removeEventListener("click", this, false);

            }
        }

});
