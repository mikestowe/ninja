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

var TreeControl = require("js/components/tree.reel").Tree,
    ResizerControl = require("js/panels/Resizer").Resizer,
    nj = require("js/lib/NJUtils").NJUtils;

exports.ProjectPanelBase = (require("montage/core/core").Montage).create(require("montage/ui/component").Component, {
    hasTemplate: {
        value: true
    },
    _hasFocus: {
        numerable: false,
        value: false
    },

    /* The current project that we have in memory */
    _activeProject: {
        value: false
    },
    activeProject: {
        get: function() {
            return this._activeProject;
        },
        set: function(objNewProject) {
            this._activeProject = objNewProject;
        }
    },

    /* Is the panel initialized? Helps keep us from re-initializing things when a project switches */
    _isPanelInitialized: {
        value: false
    },
    isPanelInitialized: {
        get: function() {
            return this._isPanelInitialized;
        },
        set: function(boolValue) {
            this._isPanelInitialized = boolValue;
        }
    },

    /* Project models: is there an active project, did the user just swap the project, etc. */
    _swapProject: {
        value: false
    },
    swapProject: {
        get: function() {
            return this._swapProject;
        },
        set: function(boolValue) {
            this._swapProject = boolValue;
        }
    },
    _updateTree: {
        value: false
    },
    updateTree: {
        get: function() {
            return this._updateTree;
        },
        set: function(boolValue) {
            this._updateTree = boolValue;
        }
    },
    _updateAssets: {
        value: false
    },
    _updateAssets : {
        get: function() {
            return this._updateAssets;
        },
        set: function(boolValue) {
            this._updateAssets = boolValue;
        }
    },
    _hasActiveProject: {
        value: false
    },
    hasActiveProject: {
        get: function() {
            return this._hasActiveProject;
        },
        set: function(boolValue) {
            if (this.hasActiveProject !== boolValue) {
                this._hasActiveProject = boolValue;
                this.needsDraw = true;
                this.swapProject = true;
                this.loadPanelState();
            }
        }
    },
    setActiveProject: {
        value: function(myVal) {
            this.hasActiveProject = myVal;
        }
    },

    /* Focus monitor: needed to modify keyboard navigation through panels. */
    _hasFocus: {
        value: false
    },
    hasFocus: {
        get: function() {
            return this._hasFocus;
        },
        set: function(newVal) {
            if (this._hasFocus !== newVal) {
                this._hasFocus = newVal;
            }
        }
    },

    /* Active column models: Used to store the state of the columns as a resize is happening */
    _activeColumn: {
        enumerable: false,
        value: false
    },
    activeColumn: {
        get: function() {
            return this._activeColumn;
        },
        set: function(intActiveColumn) {
            this._activeColumn = intActiveColumn;
        }
    },
    _activeColumnWidths: {
        enumerable: false,
        value: [0,0,0]
    },
    activeColumnWidths: {
        get: function() {
            return this._activeColumnWidths;
        },
        set: function(activeColumnWidths) {
            for (var i = 0; i < activeColumnWidths.length; i++) {
                if (this._activeColumnWidths[i] !== activeColumnWidths[i]) {
                    this._activeColumnWidths[i] = activeColumnWidths[i];
                    this.activeColumn = i;
                    this.needsDraw = true;
                }
            }
        }
    },

    /* resizeColumn: Method to resize a column */
    resizeColumn: {
        value: function(strSelectorBase) {
            // Resize column with index this.activeColumn in view specified by strSelectorBase.
            var intAdjust = 0,
                intTotalWidth = 0,
                arrToChange = [],
                arrToChangeLength = 0,
                arrHeaders = document.querySelectorAll(strSelectorBase + " .pp-header");
                arrHeadersLength = arrHeaders.length;
                containerList = document.querySelectorAll(strSelectorBase + " .pp-scroll-linked");
                containerListLength = containerList.length,
                intNewWidth = 0,
                strNewWidth = "",
                boolProjectView = true,
                arrStoredWidths = this.panelState.projectColumnWidths;

            if (strSelectorBase.indexOf("assets") > -1) {
                boolProjectView = false;
                arrStoredWidths = this.panelState.assetColumnWidths;
            }


            if (this.activeColumn === 0) {
                strSelector = strSelectorBase + " .pp-col-files";
                intAdjust = 17;
            } else if (this.activeColumn === 1) {
                strSelector = strSelectorBase + " .pp-col-date";
                intAdjust = 6;
            } else if (this.activeColumn === 2) {
                strSelector = strSelectorBase + " .pp-col-size";
                intAdjust = 6;
            } else if (this.activeColumn === 3) {
                strSelector = strSelectorBase + " .pp-col-type";
                intAdjust = 10;
            } else {
                return;
            }
            if ((this.activeColumn === 3) && boolProjectView) {
                return;
            }

            // Adjust intAdjust: for the asset view it needs to be 0.
            if (strSelectorBase.indexOf("assets") >0) {
                intAdjust = 0;
            }

            // Get the total width of the headers and set the container to that width.
            for (i = 0; i < arrHeadersLength; i++) {
                intTotalWidth = intTotalWidth + parseInt(arrHeaders[i].offsetWidth);
            }
            if (intTotalWidth === 0) {
                for (i = 0; i < arrStoredWidths.length; i++) {
                    intTotalWidth = intTotalWidth + arrStoredWidths[i];
                }
            }

            for (i = 0; i < containerListLength; i++) {
                containerList[i].style.minWidth = (intTotalWidth+12) + "px";
            }
            intNewWidth = arrHeaders[this.activeColumn].offsetWidth;
            if (intNewWidth === 0) {
                intNewWidth = arrStoredWidths[this.activeColumn];
            }
            strNewWidth = (intNewWidth - intAdjust) + "px";

            // Get the array of column elements to change, and change them
            arrToChange = document.querySelectorAll(strSelector);
            arrToChangeLength = arrToChange.length;
            for (i = 0; i < arrToChangeLength; i++) {
                arrToChange[i].style.width = strNewWidth;
            }

            // Once resize has been completed, we need to update the panelState object:
            if (!boolProjectView) {
                this.panelState.assetColumnWidths[this.activeColumn] = intNewWidth;
            } else {
                this.panelState.projectColumnWidths[this.activeColumn] = intNewWidth;
            }
        }
    },

    /* checkForResize: Check if the columns in the active view are being resized */
    checkForResize: {
        value: function() {
            var arrHeaders = document.querySelectorAll("#pp-view-" + this.panelState.activeView + " .pp-header"),
                arrHeadersLength = arrHeaders.length,
                i=0,
                colWidth = 0,
                arrCols = this.panelState.projectColumnWidths;

            if (this.panelState.activeView === "assets") {
                arrCols = this.panelState.assetColumnWidths;
            }
            for (i = 0; i < arrHeadersLength; i++) {
                colWidth = parseInt(arrHeaders[i].offsetWidth);
                if (colWidth !== arrCols[i]) {
                    this.activeColumn = i;
                    i = arrHeadersLength;
                    this.needsDraw = true;
                }
            }
        }
    },

    /* Shift key status: is the shift key pressed (used for keyboard navigation and multiselect) */
    _isShiftKeyDown: {
        value: false
    },
    isShiftKeyDown: {
        get: function() {
            return this._isShiftKeyDown;
        },
        set: function(boolValue) {
            this._isShiftKeyDown = boolValue;
        }
    },

    /* Inline editor models: is the inline editor active, and a pointer to the current one */
    _activeInlineEditor: {
        value: false
    },
    activeInlineEditor: {
        get: function() {
            return this._activeInlineEditor;
        },
        set: function(myVal) {
            this._activeInlineEditor = myVal;
        }
    },
    _isInlineEditorActive: {
        value: false
    },
    isInlineEditorActive: {
        get: function() {
            return this._isInlineEditorActive;
        },
        set: function(newVal) {
            this._isInlineEditorActive = newVal;
        }
    },

    /* Active sort: If the user is actively sorting the columns in the asset view */
    _isSortActive: {
        value: false
    },
    isSortActive: {
        get: function() {
            return this._isSortActive;
        },
        set: function(boolValue) {
            this._isSortActive = boolValue;
            if (boolValue) {
                this.needsDraw = true;
            }
        }
    },

    /* Active filter: If the user is actively filtering the asset view */
    _isFilterActive: {
        value: false
    },
    isFilterActive: {
        get: function() {
            return this._isFilterActive;
        },
        set: function(boolValue) {
            this._isFilterActive = boolValue;
        }
    },

    /* filteredAssets: where the filtered assets live */
    _filteredAssets: {
        value: []
    },
    filteredAssets: {
        get: function() {
            return this._filteredAssets;
        },
        set: function(arrValues) {
            this._filteredAssets = arrValues;
        }
    },

    /* filterAssets: Method for filtering the assets */
    filterAssets: {
        value: function(strFilter) {
            var arrItems = document.querySelectorAll("#pp-container-assets .pp-col-files div"),
                arrItemsLength = arrItems.length,
                i = 0,
                arrFilteredAssets = [];
            for (i = 0; i < arrItemsLength; i++) {
                var currText = arrItems[i].querySelector(".inline-editable").firstChild.nodeValue;
                if (currText.indexOf(strFilter) > -1) {
                    arrFilteredAssets.push(i);
                }
            }
            return arrFilteredAssets;
        }
    },

    /* Asset Controllers: get first/last/previous/next visible asset, highlighting a row, and clearing a highlight */
    getFirstVisibleAsset: {
        value: function() {
            var arrAssets = document.querySelectorAll("#pp-container-assets .pp-col-files div"),
                arrAssetsLength = arrAssets.length,
                i =0,
                cssProp = "";
            for (i = 0; i < arrAssetsLength; i++) {
                cssProp = window.getComputedStyle(arrAssets[i],null).getPropertyValue("display");
                if (cssProp == "block") {
                    return arrAssets[i];
                }
            }
        }
    },
    getLastVisibleAsset: {
        value: function() {
            var arrAssets = document.querySelectorAll("#pp-container-assets .pp-col-files div"),
                arrAssetsLength = arrAssets.length,
                i = 0,
                cssProp = "";
            for (i = arrAssetsLength; i >0; i--) {
                if (arrAssets[i] != null) {
                    cssProp = window.getComputedStyle(arrAssets[i],null).getPropertyValue("display");
                }
                if (cssProp == "block") {
                    return arrAssets[i];
                }
            }
        }
    },
    getNextVisibleAsset: {
        value: function(currAsset) {
            var arrAssets = document.querySelectorAll("#pp-container-assets .pp-col-files div"),
                arrAssetsLength = arrAssets.length,
                i =0,
                cssProp = "",
                boolContinue = false;
            for (i = 0; i < arrAssetsLength; i++) {
                if (!boolContinue) {
                    if (arrAssets[i].isSameNode(currAsset)) {
                        boolContinue = true;
                    }
                } else {
                    cssProp = window.getComputedStyle(arrAssets[i],null).getPropertyValue("display");
                    if (cssProp == "block") {
                        return arrAssets[i];
                    }
                }
            }
            // If we've got this far, there isn't one, so return false.
            return false;
        }
    },
    getPreviousVisibleAsset: {
        value: function(currAsset) {
            var arrAssets = document.querySelectorAll("#pp-container-assets .pp-col-files div"),
                arrAssetsLength = arrAssets.length,
                i =0,
                cssProp = "",
                boolContinue = false;
            for (i = arrAssetsLength-1; i >-1 ; i--) {
                if (!boolContinue) {
                    if (arrAssets[i].isSameNode(currAsset)) {
                        boolContinue = true;
                    }
                } else {
                    cssProp = window.getComputedStyle(arrAssets[i],null).getPropertyValue("display");
                    if (cssProp == "block") {
                        return arrAssets[i];
                    }
                }
            }
            // If we've got this far, there isn't one, so return false.
            return false;
        }
    },
    hilightAssetRow: {
        value: function(ptrElement) {
            if (ptrElement.classList.contains("focused")) {
                return;
            }
            var arrFiles = document.querySelectorAll("#pp-view-assets .pp-col-files div"),
                arrFilesLength = arrFiles.length,
                arrSizes = document.querySelectorAll("#pp-view-assets .pp-col-size div"),
                arrSizesLength = arrSizes.length,
                arrDates = document.querySelectorAll("#pp-view-assets .pp-col-date div"),
                arrDatesLength = arrDates.length,
                arrTypes = document.querySelectorAll("#pp-view-assets .pp-col-type div"),
                arrTypesLength = arrTypes.length,
                inlineEditor = document.querySelector("#pp-view-assets input.inline-editor"),
                mySpan = ptrElement.querySelector("span"),
                currIndex,
                i = 0;
                ptrParent = nj.queryParentSelector(ptrElement, ".pp-asset-col");

            if ((inlineEditor !== null) && (ptrElement.classList.contains("nj-skinned"))) {
                // An inline edit is currently happening
                // (sometimes the click event listeners might get fired in that process)
                // So do nothing
                return;
            }

            if (ptrParent.classList.contains("pp-col-files")) {
                for (i = 0; i < arrFilesLength; i++) {
                    if(arrFiles[i].isSameNode(ptrElement)) {
                        currIndex = i;
                        i = arrFilesLength;
                    }
                }
            } else if (ptrParent.classList.contains("pp-col-size")) {
                // A size element was passed in
                for (i = 0; i < arrSizesLength; i++) {
                    if(arrSizes[i].isSameNode(ptrElement)) {
                        currIndex = i;
                        i = arrSizesLength;
                    }
                }
            } else if (ptrParent.classList.contains("pp-col-type")) {
                // A type element was passed in
                for (i = 0; i < arrTypesLength; i++) {
                    if(arrTypes[i].isSameNode(ptrElement)) {
                        currIndex = i;
                        i = arrTypesLength;
                    }
                }
            } else if (ptrParent.classList.contains("pp-col-date")) {
                // A date element was passed in
                for (i = 0; i < arrDatesLength; i++) {
                    if(arrDates[i].isSameNode(ptrElement)) {
                        currIndex = i;
                        i = arrDatesLength;
                    }
                }
            }

            this.clearAssetFocus();
            arrDates[currIndex].classList.add("focused");
            arrFiles[currIndex].classList.add("focused");
            arrSizes[currIndex].classList.add("focused");
            arrTypes[currIndex].classList.add("focused");

            // Turn the file name in into an inline editable element
            // To avoid getting caught in the current click event, we'll delay the
            // component initialization for a few milliseconds.
            var that = this;
            setTimeout(function() {
                that.activeInlineEditor = InlineEditor.create();
                that.activeInlineEditor.element = arrFiles[currIndex];

                that.activeInlineEditor.onChange = function() {
                    that.updateTree = true;
                    that.isSortActive = true;
                    that.needsDraw = true;
                }
                that.activeInlineEditor.init();
                that.isInlineEditorActive = true;

                // Bind the editor to the property in the data structure, so that when the change happens
                // it will propagate.
                Object.defineBinding(that.activeInlineEditor, "value", {
                    boundObject: that.activeProject,
                    boundObjectPropertyPath: mySpan.dataset.bindpath + ".name"
                })
            }, 200);
        }
    },
    clearAssetFocus: {
        value: function() {
            var arrCurrFocused = document.querySelectorAll("#pp-view-assets .focused"),
                arrCurrFocusedLength = arrCurrFocused.length,
                inlineEditor = document.querySelector("#pp-view-assets input.inline-editor"),
                i = 0;
            if (inlineEditor !== null ) {
                // an edit is happening, so we don't actually want to do anything.
                //return;
            }
            for (i = 0; i < arrCurrFocusedLength; i++) {
                arrCurrFocused[i].classList.remove("focused");
                if (this.isInlineEditorActive !== false) {
                    // TODO: A more bulletproof method for deleting this binding. This fails frequently and seemingly arbitrarily.
                    //Object.deleteBinding(this.activeInlineEditor, "value");
                    this.activeInlineEditor.destroy();
                    this.isInlineEditorActive = false;

                }
            }
        }
    },

    /* Begin: Draw Cycle */
    /* First time draw: True if this is the first time the component has been drawn */
    _firstTimeDraw: {
        value: true
    },
    firstTimeDraw: {
        get: function() {
            return this._firstTimeDraw;
        },
        set: function(value) {
            this._firstTimeDraw = value;
        }
    },

    willDraw: {
        enumerable: false,
        value: function() {

            //this.log(newErr, "Test message " + newErr)
            //this.log("willDraw: hasActiveProject: " + this.hasActiveProject + "\nthis.swapProject: " + this.swapProject + "\nthis.firstTimeDraw: " + this.firstTimeDraw);
            var projectTree,
                testDirectory,
                treeContainer,
                scroller = document.getElementById("pp-col-files"),
                panelContainer = document.getElementById("pp-container"),
                arrButtons = document.querySelectorAll("#pp-col-buttons .pp-button"),
                listContainer = document.querySelector("#pp-container-list .pp-scroll-linked"),
                assetContainer = document.querySelector("#pp-container-assets .pp-scroll-linked"),
                arrButtonsLength = arrButtons.length,
                arrHeaders = document.querySelectorAll("#pp-view-assets .pp-header"),
                arrHeadersLength = arrHeaders.length,
                arrAllHeaders = document.querySelectorAll("#pp-col-files .pp-header"),
                arrAllHeadersLength = arrAllHeaders.length,
                tempResizer,
                arrSortArrows = document.querySelectorAll("#pp-view-assets .pp-sort-arrow"),
                arrSortArrowsLength = arrSortArrows.length,
                arrLinkedScrollers = document.querySelectorAll(".pp-scroll-main"),
                arrLinkedScrollersLength = arrLinkedScrollers.length,
                i = 0,
                that = this;
            /*
            if (this.firstTimeDraw) {
                this.hasActiveProject="large";
            }
            */


            if (!this.hasActiveProject) {
                var myContainer = document.getElementById("pp-container");
                myContainer.classList.add("pp-disabled");
                document.getElementById("pp-search-files").disabled=true;
                return;
            } else {
                var myContainer = document.getElementById("pp-container");
                myContainer.classList.remove("pp-disabled");
                document.getElementById("pp-search-files").disabled=false;
            }


            if (this.firstTimeDraw) {



                // Make headers resizable.
                for (i = 0; i < arrAllHeadersLength; i++) {
                    tempResizer = ResizerControl.create();
                    tempResizer.element = arrAllHeaders[i].querySelector(".pp-resize-grip");
                    tempResizer.panel = arrAllHeaders[i];
                    tempResizer.isPanel = false;
                    tempResizer.isInversed = false;
                    this.eventManager.addEventListener("panelResizing", function() {
                        that.checkForResize();
                    });
                    this.eventManager.addEventListener("panelResizedEnd", function() {
                            that.checkForResize();
                            that.savePanelState();

                    })
                    /*
                    tempResizer.onResize = function() {
                        that.checkForResize();
                    }
                    tempResizer.onResizeEnd = function() {
                        setTimeout(function() {
                            that.checkForResize();
                            that.savePanelState();
                        }, 100)
                    }
                    */
                    tempResizer.needsDraw = true;
                }

                // Add event handlers to buttons
                for (i = 0; i < arrButtonsLength; i++) {
                    arrButtons[i].identifier="assetButton";
                    arrButtons[i].addEventListener("click", this, false);
                    arrButtons[i].addEventListener("keydown", this, false);
                    arrButtons[i].addEventListener("keyup", this, false);
                }

                // Add the click event listeners to the Asset View headers so they can be sorted
                for (i = 0; i < arrHeadersLength; i++) {
                    arrHeaders[i].identifier="assetHeader";
                    arrHeaders[i].addEventListener("click", this, false);
                }
                for (i = 0; i < arrSortArrowsLength; i++) {
                    arrSortArrows[i].identifier="assetHeader";
                    arrSortArrows[i].addEventListener("click", this, false);
                }

                // Add the event listener to the filter input so that when the user starts typing
                // we will start filtering the list
                var mySearch = document.getElementById("pp-search-files"),
                    mySearchContainer = document.getElementById("pp-search");
                mySearch.identifier = "filter";
                mySearch.addEventListener("keyup", this, false);
                mySearchContainer.identifier = "searchContainer";
                mySearchContainer.addEventListener("mousedown", this, false);
                mySearchContainer.addEventListener("keydown", this, false);
                mySearchContainer.addEventListener("keyup", this, false);

                // FYI when a search field is cleared using the built-in clearing method it fires a search event?
                mySearch.addEventListener("search", this, false);

                // Add keyboard event listeners for the asset container
                assetContainer.identifier = "assetContainer";
                assetContainer.addEventListener("keydown", this, false);
                assetContainer.addEventListener("mousedown", this, false);
                assetContainer.addEventListener("keyup", this, false);

                // Add scroller
                for (i = 0; i < arrLinkedScrollersLength; i++) {
                    arrLinkedScrollers[i].identifier = "linkedScroller";
                    arrLinkedScrollers[i].addEventListener("scroll", this, false);
                }

                // Add treeClickEvent handler
                document.addEventListener("treeClickEvent", function() {
                    var arrDirs = document.querySelectorAll("#pp-view-project li.directory.open"),
                        arrDirsLength = arrDirs.length,
                        i = 0,
                        arrUris = [];
                    for (i = 0; i < arrDirsLength; i++) {
                        arrUris.push(arrDirs[i].dataset.uri);
                    }
                    that.panelState.openFolders = arrUris;
                    that.savePanelState();
                });
            }


            if (this.swapProject) {
                var arrCurrIcons = document.querySelectorAll(".pp-button.active"),
                    arrCurrIconsLength = arrCurrIcons.length,
                    i = 0;

                // TODO: real project fetching.
                if (this.hasActiveProject === "large") {
                    testDirectory = this.getDirectoryData(false);
                } else {
                    testDirectory = this.getDirectoryData(true);
                }


                // Clear the buttons.
                for (i = 0; i < arrCurrIconsLength; i++) {
                    arrCurrIcons[i].classList.toggle("active");
                }
                document.getElementById("pp-container-assets").removeAttribute("class");

                // Set default view
                if (this.panelState.activeView === "project") {
                    document.querySelector("#pp-view-assets").style.display = "none";
                    document.querySelector("#pp-view-project").style.display = "block"
                } else {
                    document.querySelector("#pp-view-project").style.display = "none"
                    document.querySelector("#pp-view-assets").style.display = "block";
                }

                // Now build the asset view.  First, get the flattened directory array
                this.getFlatDirectory();

                // Set for active sort so that the view gets drawn
                this.isSortActive = true;

                // Set the tree update flag
                this.updateTree = true;
            }

            if (this.updateTree) {
                var myTree = document.getElementById("pp-container-tree");

                // TODO: Make this better.
                if (myTree !== null) {
                    var myGetme = document.getElementById("getme");
                    myGetme.removeChild(myTree);
                }

                // Insert the base element for the tree.
                treeContainer = document.createElement("ul");
                treeContainer.setAttribute("id", "tree");
                listContainer.appendChild(treeContainer);

                // Create the tree using the TreeControl
                projectTree = TreeControl.create();
                projectTree.element = treeContainer;
                projectTree.jsonData = this.activeProject;
                projectTree.needsDraw = true;
            }
        }
    },
    draw: {
        enumerable: false,
        value: function() {
            //this.log("draw: hasActiveProject: " + this.hasActiveProject + "\nthis.swapProject: " + this.swapProject + "\nthis.firstTimeDraw: " + this.firstTimeDraw);
            var arrToChange,
                arrToChangeLength,
                arrHeaders,
                arrHeadersLength,
                containerList,
                containerListLength,
                strSelector,
                intAdjust = 17,
                intTotalWidth = 0,
                errorMessage = document.querySelector("#pp-container-assets h3"),
                myAssetCol = document.querySelector("#pp-container-assets .pp-col-files"),
                filter = document.getElementById("pp-search-files"),
                filterValue = filter.value,
                i = 0,
                j=0,
                that = this;

            // Okay, so...what do we need to change?

            // Do we maybe need to resize the columns in a view?
            if (!this.firstTimeDraw) {
                if (this.activeColumn !== false) {
                    this.resizeColumn("#pp-view-" + this.panelState.activeView);
                    this.activeColumn = false;
                }
            }

            // Is there a sort event active?
            if (this.isSortActive) {
                // A sort is active, so we need to rebuild the asset view.
                var aFileCol = document.querySelector("#pp-view-assets .pp-col-files"),
                    aSizeCol = document.querySelector("#pp-view-assets .pp-col-size"),
                    aDateCol = document.querySelector("#pp-view-assets .pp-col-date"),
                    aTypeCol = document.querySelector("#pp-view-assets .pp-col-type"),
                    sortCol = document.querySelector("#pp-view-assets .pp-sort"),
                    sortDirection = sortCol.dataset.direction,
                    sortTarget = "",
                    myColNumber = parseInt(sortCol.dataset.column),
                    myFiles = this.arrFiles,
                    myFilesLength = myFiles.length,
                    i = 0,
                    newFile,
                    newFileContent,
                    newSize,
                    newSizeContent,
                    newDate,
                    newDateContent,
                    newType,
                    newTypeDiv,
                    newTypeDivContent,
                    newClass = "pp-type-other",
                    typeScript = "css,scss,sass,htm,html,xhtm,xhtml,js,jscript,php",
                    typeVideo = "mpeg,avi,qt,wmv",
                    typeAudio = "mp3,mp4,wav",
                    typeImage = "jpeg,jpg,png,gif,ps",
                    typeFlash = "fla,swf",
                    sortHandler = function(thisObject, thatObject) {
                        var returnMultiplier = 1,
                            thisThing, thatThing;

                        // Ascending or Descending sort?
                        if (sortDirection === "descending") {
                            returnMultiplier = -1;
                        }

                        // Targets of size and modifiedDate need to be compared as integers,
                        // otherwise we're doing string compares.
                        if ((sortTarget === "size") || (sortTarget === "modifiedDate")) {
                            thisThing = parseInt(thisObject[sortTarget]);
                            thatThing = parseInt(thatObject[sortTarget]);
                        } else if (sortTarget === "type"){
                            thisThing = thisObject.name.split(".").pop();
                            thatThing = thatObject.name.split(".").pop();
                        } else {
                            thisThing = thisObject[sortTarget];
                            thatThing = thatObject[sortTarget];
                        }

                        // Run the comparison.
                        if (thisThing > thatThing) {
                            return (1 * returnMultiplier);
                        } else if (thisThing < thatThing) {
                            return (-1 * returnMultiplier);
                        } else {
                            return 0;
                        }
                    },
                    makeFriendlySize = function(intSize) {
                        var strSize = false,
                            intRoundedSize = Math.round(intSize/1000);
                        strSize = intRoundedSize + " K";
                        return strSize;
                    },
                    makeFriendlyDate = function(intSeconds) {
                        // TODO: Localization.
                        var myDate = new Date(intSeconds),
                            strDate = "";
                        strDate = (myDate.getMonth() + 1) + "/"
                                  + myDate.getDate() + "/"
                                  + myDate.getFullYear() + " "
                                  + myDate.toLocaleTimeString();
                        return strDate;
                    };

                // Set the sort target
                if (myColNumber === 0) {
                    sortTarget = "name";
                } else if (myColNumber === 1) {
                    sortTarget = "modifiedDate";
                } else if (myColNumber === 2) {
                    sortTarget = "size";
                } else if (myColNumber === 3) {
                    sortTarget = "type";
                } else {
                    return;
                }

                // Sort the files object
                myFiles.sort(sortHandler);

                // Clear the columns and rebuild
                nj.empty(aFileCol);
                nj.empty(aSizeCol);
                nj.empty(aDateCol);
                nj.empty(aTypeCol);

                for (i = 0; i < myFilesLength; i ++) {
                    newSpan = document.createElement("span"),
                    newSpanContent = document.createTextNode(myFiles[i].name),
                    newFile = document.createElement("div"),
                    newSize = document.createElement("div"),
                    newSizeContent = document.createTextNode(makeFriendlySize(parseInt(myFiles[i].size))),
                    newDate = document.createElement("div"),
                    newDateContent = document.createTextNode(makeFriendlyDate(parseInt(myFiles[i].modifiedDate))),
                    newType = myFiles[i].name.split(".").pop().toLowerCase(),
                    newTypeDiv = document.createElement("div"),
                    newTypeDivContent = document.createTextNode(newType);

                    newClass = "pp-type-other";
                    if (typeScript.indexOf(newType) > -1) {
                        newClass = "pp-type-script";
                    } else if (typeVideo.indexOf(newType) > -1) {
                        newClass = "pp-type-video";
                    } else if (typeAudio.indexOf(newType) > -1) {
                        newClass="pp-type-audio";
                    } else if (typeImage.indexOf(newType) > -1) {
                        newClass = "pp-type-image";
                    } else if (typeFlash.indexOf(newType) > -1) {
                        newClass = "pp-type-flash";
                    }
                    newSpan.setAttribute("class", "inline-editable");
                    newSpan.setAttribute("data-bindpath", myFiles[i].bindPath);
                    newSpan.appendChild(newSpanContent);
                    newFile.setAttribute("class", newClass);
                    newFile.setAttribute("tabindex", 0);
                    newSize.setAttribute("class", newClass);
                    newDate.setAttribute("class", newClass);
                    newTypeDiv.setAttribute("class", newClass);
                    newFile.appendChild(newSpan);
                    newSize.appendChild(newSizeContent);
                    newDate.appendChild(newDateContent);
                    newTypeDiv.appendChild(newTypeDivContent);
                    aFileCol.appendChild(newFile);
                    aSizeCol.appendChild(newSize);
                    aDateCol.appendChild(newDate);
                    aTypeCol.appendChild(newTypeDiv);


                }

                this.isSortActive = false;

                // Is there a filter we need to apply?
                if (filterValue != "") {
                    this.filteredAssets = this.filterAssets(filterValue);
                    this.isFilterActive = true;
                }
            }

            // Is there a filter event active?
            if (this.isFilterActive) {
                var arrAllAssets = document.querySelectorAll("#pp-container-assets .pp-asset-col div"),
                    arrAllAssetsLength = arrAllAssets.length,
                    arrFiles = document.querySelectorAll("#pp-container-assets .pp-col-files div"),
                    arrSizes = document.querySelectorAll("#pp-container-assets .pp-col-size div"),
                    arrDates = document.querySelectorAll("#pp-container-assets .pp-col-date div"),
                    arrTypes = document.querySelectorAll("#pp-container-assets .pp-col-type div"),
                    i = 0,
                    filteredAssets = this.filteredAssets,
                    filteredAssetsLength = filteredAssets.length;

                // First, hide everything.
                for (i = 0; i < arrAllAssetsLength; i++) {
                    arrAllAssets[i].classList.add("pp-filter-hidden");
                }
                // Then, show only what is needed.

                for (i = 0; i < filteredAssetsLength; i++) {
                    var currentIndex = filteredAssets[i];
                    arrFiles[currentIndex].classList.remove("pp-filter-hidden");
                    arrSizes[currentIndex].classList.remove("pp-filter-hidden");
                    arrDates[currentIndex].classList.remove("pp-filter-hidden");
                    arrTypes[currentIndex].classList.remove("pp-filter-hidden");
                }

                this.isFilterActive = false;
            }


            // Finally, now that all sorting and filtering is done, are we even showing anything in the asset view?
            if (this.panelState.activeView === "assets") {
                if (myAssetCol.offsetHeight < 5) {
                    // We're not showing anything.
                    errorMessage.style.display = "block";
                } else {
                    errorMessage.style.display = "none";
                }
            }
        }
    },
    didDraw: {
        enumerable: false,
        value: function() {
            var arrHeaders = document.querySelectorAll("#pp-view-assets .pp-header"),
                arrHeadersLength = arrHeaders.length,
                arrHeaderContainers = document.querySelectorAll(".pp-header-container"),
                arrHeaderContainersLength = arrHeaderContainers.length,
                i = 0,
                arrOpenFolders = [],
                arrOpenFoldersLength = 0,
                strSelector,
                myFolder,
                that = this,
                treeClickEvent = document.createEvent("UIEvents");

            //this.log("didDraw: hasActiveProject: " + this.hasActiveProject + "\nthis.swapProject: " + this.swapProject + "\nthis.firstTimeDraw: " + this.firstTimeDraw);

            if (this.hasActiveProject) {
                for (i = 0; i < arrHeaderContainersLength; i++) {
                    //this.log("showing headers");
                    arrHeaderContainers[i].style.display = "block";
                }
            } else {
                for (i = 0; i < arrHeaderContainersLength; i++) {
                    //this.log("hiding headers and ending draw cycle.");
                    arrHeaderContainers[i].style.display = "none";
                }
                return;
            }
            if (!this.firstTimeDraw) {
                if (!this.swapProject && !this.updateTree) {
                    return;
                }
            }

            // On first draw or project swap we need to copy over the UI settings stored in panelState
            // First, load the panel state from storage, but only on first draw or swap.
            if (this.swapProject || this.firstDraw) {
                this.loadPanelState();
            }

            arrOpenFolders = this.panelState.openFolders;
            arrOpenFoldersLength = arrOpenFolders.length;

            // Set up the project view.
            // Expand the folders
            var arrDefaultFolders = document.querySelectorAll("#pp-view-project li.directory.open"),
                arrDefaultFoldersLength = arrDefaultFolders.length;
            for (i = 0; i < arrDefaultFoldersLength; i ++) {
                arrDefaultFolders[i].classList.remove("open");
                arrDefaultFolders[i].classList.add("closed");
            }

            if (arrOpenFolders[0] === "none") {
                var arrFoldersToOpen = document.querySelectorAll(".level1"),
                    arrFoldersToOpenLength = arrFoldersToOpen.length;
                    for (i = 0; i < arrFoldersToOpenLength; i++) {
                        arrFoldersToOpen[i].classList.remove("closed");
                        arrFoldersToOpen[i].classList.add("open");
                    }
            } else {
                for (i = 0; i < arrOpenFoldersLength; i++) {
                    strSelector = "li[data-uri='" +arrOpenFolders[i]+ "'].directory";
                    myFolder = document.querySelector(strSelector);
                    myFolder.classList.remove("closed");
                    myFolder.classList.add("open");
                }
            }

            treeClickEvent.initEvent("treeClickEvent", false, false);
            document.dispatchEvent(treeClickEvent);


            // Set up the views if we are swapping projects.
            if (this.swapProject) {
                if (this.panelState.activeView === "assets") {
                    var i =0,
                        arrFilters = this.panelState.activeFilters,
                        arrFiltersLength = arrFilters.length,
                        myEvent = document.createEvent("MouseEvents"),
                        arrHeaders = document.querySelectorAll("#pp-view-assets .pp-header"),
                        arrHeadersLength = arrHeaders.length,
                        currSort;
                    for (i = 0; i < arrFiltersLength; i++) {
                        // We will make the switch by displatching a click event through the showall button.
                        myEvent.initMouseEvent("click", false, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        myTarget = document.querySelector(arrFilters[i]);
                        myTarget.dispatchEvent(myEvent);
                    }

                    // Next, set the sort information.
                    currSort = document.querySelector("#pp-view-assets .pp-sort");
                    currSort.classList.remove("pp-sort");
                    currSort.classList.remove("sort-ascending");
                    currSort.classList.remove("sort-descending");
                    arrHeaders(this.panelState.sortColumn).classList.add("pp-sort");
                    arrHeaders(this.panelState.sortColumn).classList.add("sort-" + this.panelState.sortDirection);
                    this.isSortActive = true
                } else {
                    var myEvent = document.createEvent("MouseEvents");
                    if (this.swapProject) {
                        //this.log('clicking project button')
                        myEvent.initMouseEvent("click", false, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        myTarget = document.querySelector("#pp-col-buttons .button-project");
                        myTarget.dispatchEvent(myEvent);
                    }
                }
            }

            // Resize columns to match headers in assets view.
            arrHeaders = document.querySelectorAll("#pp-view-assets .pp-header");
            arrHeadersLength = arrHeaders.length;
            for (i = 0; i < arrHeadersLength; i++) {
                arrHeaders[i].style.width = (this.panelState.assetColumnWidths[i] - 7) + "px";
            }

            for (i = 0; i < this.panelState.assetColumnWidths.length; i++) {
                this.activeColumn = i;
                this.resizeColumn("#pp-view-assets");
            }

            // Resize columns to match headers in project view.
            arrHeaders = document.querySelectorAll("#pp-view-project .pp-header");
            arrHeadersLength = arrHeaders.length;
            for (i = 0; i < arrHeadersLength; i++) {
                arrHeaders[i].style.width = (this.panelState.projectColumnWidths[i] -7) + "px";
            }

            setTimeout(function() {
                for (i = 0; i < that.panelState.projectColumnWidths.length; i++) {
                    that.activeColumn = i;
                    that.resizeColumn("#pp-view-project");
                }
                that.activeColumn = false;
            }, 300)


            // If this is a first time draw or a draw because of a project swap,
            // we need to set the state of the model and redraw.
            this.firstTimeDraw = false;
            this.swapProject = false;
            this.updateTree = false;
            this.needsDraw = true;


        }
    },
    /* End: Draw Cycle */

    /* Begin: Event handlers */
    handleLinkedScrollerScroll: {
        value: function(event) {
            var myParent = nj.queryParentSelector(event.target, ".pp-view"),
                myTarget = myParent.querySelector(".pp-header-container.pp-scroll-linked"),
                scrollOffset = event.target.scrollLeft;
            myTarget.style.left = (0 - scrollOffset) + "px";
        }
    },
    handleAssetContainerMousedown: {
        value: function(event) {
            var arrFiles = document.querySelectorAll("#pp-view-assets .pp-col-files div"),
                arrFilesLength = arrFiles.length,
                arrSizes = document.querySelectorAll("#pp-view-assets .pp-col-size div"),
                arrSizesLength = arrSizes.length,
                arrDates = document.querySelectorAll("#pp-view-assets .pp-col-date div"),
                arrDatesLength = arrDates.length,
                arrTypes = document.querySelectorAll("#pp-view-assets .pp-col-type div"),
                arrTypesLength = arrTypes.length,
                currIndex,
                i = 0,
                ptrElement = event.target,
                ptrParent = nj.queryParentSelector(ptrElement, ".pp-asset-col");


            // Shift focus
            this.hasFocus = "assets";

            if (ptrParent.classList.contains("pp-col-files")) {
                // highlight the entire row based on the file element that has focus.
                if (event.target.classList.contains("inline-editable")){
                    this.hilightAssetRow(event.target.parentNode);
                } else {
                    this.hilightAssetRow(event.target);
                }
                return;
            } else if (ptrParent.classList.contains("pp-col-size")) {
                // A size element was passed in
                for (i = 0; i < arrSizesLength; i++) {
                    if(arrSizes[i].isSameNode(ptrElement)) {
                        currIndex = i;
                        i = arrSizesLength;
                    }
                }
            } else if (ptrParent.classList.contains("pp-col-type")) {
                // A type element was passed in
                for (i = 0; i < arrTypesLength; i++) {
                    if(arrTypes[i].isSameNode(ptrElement)) {
                        currIndex = i;
                        i = arrTypesLength;
                    }
                }
            } else if (ptrParent.classList.contains("pp-col-date")) {
                // A date element was passed in
                for (i = 0; i < arrDatesLength; i++) {
                    if(arrDates[i].isSameNode(ptrElement)) {
                        currIndex = i;
                        i = arrDatesLength;
                    }
                }
            }

            // Focus the element in arrFiles and then call the hilightAssetRow method,
            // which will highlight the entire row based on the file element that has focus.
            arrFiles[currIndex].focus();
            this.hilightAssetRow(document.activeElement);
        }
    },
    handleAssetContainerKeydown: {
        value: function(event) {
            var nextElement,
                currentFocusElement = event.currentTarget.querySelector(":focus");
            // Down Arrow
            if (event.keyCode === 40) {
                // Prevent scroll.
                event.preventDefault();
                if (!this.activeInlineEditor.isActive) {
                    nextElement = this.getNextVisibleAsset(currentFocusElement);
                    if (nextElement) {
                        nextElement.focus();
                        this.hilightAssetRow(nextElement);
                    } else {
                        return;
                    }
                }
            }

            // Up Arrow
            if (event.keyCode === 38) {
                // Prevent scroll.
                event.preventDefault();
                if (!this.activeInlineEditor.isActive) {
                    nextElement = this.getPreviousVisibleAsset(currentFocusElement);
                    if (nextElement) {
                        nextElement.focus();
                        this.hilightAssetRow(nextElement);
                    } else {
                        return;
                    }
                }
            }

            // Left Arrow
            if (event.keyCode === 37) {
                if (!this.activeInlineEditor.isActive) {
                    // Prevent scroll.
                    event.preventDefault();
                    nextElement = document.querySelector("#projectPanel .button-project");
                    this.clearAssetFocus();
                    nextElement.focus();
                }
            }

            // Right Arrow
            if (event.keyCode === 39) {
                if (!this.activeInlineEditor.isActive) {
                    // Prevent scroll.
                    event.preventDefault();
                }
            }

            // Return Key
            if (event.keyCode === 13) {
                event.preventDefault();
            }

            // Tab Key
            if (event.keyCode === 9) {
                if (!this.activeInlineEditor.isActive) {
                    if (!this.isShiftKeyDown) {
                        nextElement = this.getNextVisibleAsset(currentFocusElement);
                        // Are we about to tab off the asset panel and into the search field? If so, nextElement will be false.
                        if (!nextElement) {
                            // We are leaving.
                            this.clearAssetFocus();
                            // Shift focus
                            this.hasFocus = "search";
                        } else {
                            // We are staying.
                            this.hilightAssetRow(nextElement);
                            this.hasFocus = "assets";
                        }
                    } else {
                        nextElement = this.getPreviousVisibleAsset(currentFocusElement);
                        // Are we about to tab off the asset panel and into the buttons? If so, nextElement will be false.
                        if (!nextElement) {
                            // We are leaving.
                            this.clearAssetFocus();
                            this.hasFocus = "buttons";
                        } else {
                            // We are staying.
                            this.hilightAssetRow(nextElement);
                            this.hasFocus = "assets";
                        }
                    }
                } else {
                    event.preventDefault();
                }
            }

            // Shift key has been pressed.
            if (event.keyCode === 16) {
                this.isShiftKeyDown = true;
            }

        }
    },
    handleAssetContainerKeyup : {
        value: function(event) {
            if (event.keyCode === 16) {
                this.isShiftKeyDown = false;
            }
        }
    },
    /* handleFilterKeyup handles keyup events in the search box. */
    handleFilterKeyup: {
        value: function(event) {
            if (!this.hasActiveProject) {
                return;
            }
            var myEvent, myTarget, strFilter;

            // Activate the filtering mechanism
            this.isFilterActive = true;

            // If we are not showing the Assets view already, we need to.
            if (document.querySelector("#pp-view-project").style.display === "block") {
                // We will make the switch by displatching a click event through the showall button.
                myEvent = document.createEvent("MouseEvents");
                myEvent.initMouseEvent("click", false, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                myTarget = document.querySelector("#pp-col-buttons .button-showall");
                myTarget.dispatchEvent(myEvent);
            }

            // Next, we need to filter using the delegate.
            strFilter = event.target.value;
            this.filteredAssets = this.filterAssets(strFilter);
            this.needsDraw = true;
        }
    },
    handleFilterSearch: {
        value: function(event) {
            // The filter has been cleared by the user clicking on the clear icon in the input field.
            // Sometimes fired manually.
            if (event.target.value !== "") {
                // This event also fires when return is pressed in the search box
                // If that's the case, we don't want to do anything.
                return;
            }
            this.filteredAssets = this.filterAssets("");
            this.isFilterActive = true;
            this.needsDraw = true;
        }
    },
    handleSearchContainerKeydown: {
        value: function(event) {
            // Tab key
            if (event.keyCode === 9) {
                // Tabbing through the ui.  Focus between search widget and asset container happens on the input field.
                if ((this.isShiftKeyDown) && (event.target.classList.contains("nj-skinned"))) {
                    // We are leaving
                    this.hasFocus = "assets";
                    var nextButton = this.getLastVisibleAsset();
                    this.hilightAssetRow(nextButton);
                } else if ((event.target.classList.contains("nj-skinned")) && (!this.isShiftKeyDown)){
                    this.hasFocus = "search";
                }
            }


            // Shift key has been pressed.
            if (event.keyCode === 16) {
                this.isShiftKeyDown = true;
            }

        }
    },
    handleSearchContainerKeyup: {
        value: function(event) {
            if (event.keyCode === 16) {
                this.isShiftKeyDown = false;
            }
        }
    },
    handleSearchContainerMousedown: {
        value: function(event) {

        }
    },
    handleAssetHeaderClick: {
        value: function(event) {
            var myTarget = event.currentTarget,
                myColNumber = parseInt(myTarget.dataset.column),
                arrHeaders = document.querySelectorAll("#pp-view-assets .pp-header"),
                arrHeadersLength = arrHeaders.length,
                i = 0,
                sortTarget = "",
                currentSortDirection = myTarget.dataset.direction,
                newSortDirection = "",
                prevColNumber = 0,
                sortHandler = function(thisObject, thatObject) {
                    var returnMultiplier = 1;
                    if (sortDirection === "descending") {
                        returnMultiplier = -1;
                    }
                    if (thisObject[sortTarget] > thatObject[sortTarget]) {
                        return (1 * returnMultiplier);
                    } else if (thisObject[sortTarget] < thatObject[sortTarget]) {
                        return (-1 * returnMultiplier);
                    } else {
                        return 0;
                    }
                };
            // Set the sort target
            if (myColNumber === 0) {
                sortTarget = "name";
            } else if (myColNumber === 1) {
                sortTarget = "modifiedDate";
            } else if (myColNumber === 2) {
                sortTarget = "size";
            } else if (myColNumber === 3) {
                sortTarget = "type";
            } else {
                return;
            }

            // Get the previous active sort
            for (i = 0; i < arrHeadersLength; i++) {
                if (arrHeaders[i].classList.contains("pp-sort")) {
                    prevColNumber = i;
                }
            }

            // Click on same column as was previously active, or different column?
            if (prevColNumber === myColNumber) {
                // Same column, so we need to change sort direction and redraw.
                if (currentSortDirection === "ascending") {
                    newSortDirection = "descending";
                } else {
                    newSortDirection = "ascending";
                }
                myTarget.classList.remove("sort-" + currentSortDirection);
                myTarget.classList.add("sort-" + newSortDirection);
                myTarget.dataset.direction = newSortDirection;
                this.panelState.sortDirection = newSortDirection;
            } else {
                // Different column, so need to move classes.
                arrHeaders[prevColNumber].classList.remove("pp-sort");
                arrHeaders[prevColNumber].classList.remove("sort-ascending");
                arrHeaders[prevColNumber].classList.remove("sort-descending");
                myTarget.classList.add("pp-sort");
                myTarget.classList.add("sort-" + currentSortDirection);
                this.panelState.sortDirection = currentSortDirection;
            }
            this.panelState.sortColumn = myColNumber;
            this.isSortActive = true;
            this.savePanelState();
        }
    },
    handleAssetButtonKeydown: {
        value: function(event) {
            var myTarget = event.currentTarget,
                myColumn = document.getElementById("pp-col-buttons"),
                fileColumn = document.getElementById("pp-col-files"),
                assetView = document.getElementById("pp-view-assets"),
                projectView = document.getElementById("pp-view-project"),
                arrCurrIcons = myColumn.querySelectorAll(".pp-button.active"),
                arrCurrIconsLength = arrCurrIcons.length,
                nextButton = "",
                recursionBreak = 0,
                getNextElement = function(targetDiv) {
                    // Convenience function to walk the nextSiblings and return the first
                    // that is a real DOM element, as opposed to a fake sibling representing the
                    // space between tags.
                    var tempDiv;
                    tempDiv = targetDiv.nextSibling;
                    if (typeof(tempDiv.tagName) !== "undefined") {
                        return tempDiv;
                    } else {
                        if (recursionBreak < 10) {
                            recursionBreak = recursionBreak + 1;
                            return getNextElement(tempDiv);
                        } else {
                            return false;
                        }
                    }
                },
                getPreviousElement = function(targetDiv) {
                    // Convenience function to walk the previousSiblings and return the first
                    // that is a real DOM element, as opposed to a fake sibling representing the
                    // space between tags.
                    var tempDiv;
                    tempDiv = targetDiv.previousSibling;
                    if (typeof(tempDiv.tagName) !== "undefined") {
                        return tempDiv;
                    } else {
                        if (recursionBreak < 10) {
                            recursionBreak = recursionBreak + 1;
                            return getPreviousElement(tempDiv);
                        } else {
                            return false;
                        }
                    }
                };

            // Return key
            if (event.keyCode === 13) {
                this.handleAssetButtonClick(event);
                myTarget.focus();
            }

            // Down Arrow
            if (event.keyCode === 40) {
                // Prevent scroll.
                event.preventDefault();
                if (myTarget.classList.contains("button-showall")) {
                    nextButton = myColumn.querySelector(".button-project");
                } else {
                    recursionBreak = 0;
                    nextButton = getNextElement(myTarget);
                }
                if (nextButton.classList.contains("nj-divider")) {
                    recursionBreak = 0;
                    nextButton = getNextElement(nextButton);
                }
                nextButton.focus();
            }

            // Up Arrow
            if (event.keyCode === 38) {
                // Prevent scroll.
                event.preventDefault();
                if (myTarget.classList.contains("button-project")) {
                    nextButton = myColumn.querySelector(".button-showall");
                } else {
                    recursionBreak = 0;
                    nextButton = getPreviousElement(myTarget);
                }
                if (nextButton.classList.contains("nj-divider")) {
                    nextButton = getPreviousElement(nextButton);
                }
                nextButton.focus();
            }

            // Left Arrow
            if (event.keyCode === 37) {
                // Prevent scroll.
                event.preventDefault();
            }

            // Right Arrow
            if (event.keyCode === 39) {
                // Prevent scroll.
                event.preventDefault();

                if (projectView.style.display === "block") {
                    nextButton = fileColumn.querySelector(".pp-span-all");
                } else {
                    nextButton = this.getFirstVisibleAsset();
                    this.hilightAssetRow(nextButton);
                }
                nextButton.focus();
            }

            // Tab key
            if (event.keyCode === 9) {
                // Tabbing through the buttons.  Focus between button column and asset container happens on the show all button.
                if ((myTarget.classList.contains("button-showall")) && (this.isShiftKeyDown)) {
                    this.hasFocus = "buttons";
                } else if ((myTarget.classList.contains("button-showall")) && (!this.isShiftKeyDown)){
                    this.hasFocus = "assets";
                    nextButton = this.getFirstVisibleAsset();
                    this.hilightAssetRow(nextButton);
                }
            }


            // Shift key has been pressed.
            if (event.keyCode === 16) {
                this.isShiftKeyDown = true;
            }

        }
    },
    handleAssetButtonKeyup : {
        value: function(event) {
            if (event.keyCode === 16) {
                this.isShiftKeyDown = false;
            }
        }
    },
    handleAssetButtonClick: {
        value: function(event) {

            if (!this.hasActiveProject) {
                return;
            }

            var myTarget = event.currentTarget,
                myColumn = document.getElementById("pp-col-buttons"),
                fileColumn = document.getElementById("pp-col-files"),
                viewProject = document.getElementById("pp-view-project"),
                viewAssets = document.getElementById("pp-view-assets"),
                containerAssets = document.getElementById("pp-container-assets"),
                arrCurrIcons = myColumn.querySelectorAll(".pp-button.active"),
                arrCurrIconsLength = arrCurrIcons.length,
                searchInput = document.getElementById("pp-search-files");
                i = 0,
                arrButtons = [];

            // Shift focus
            this.hasFocus = "buttons";

            // If we are in Asset View and there is currently a filter active,
            // we need to clear it.
            if (viewAssets.style.display === "block") {
                if ((searchInput.value != "") && (!this.isFilterActive)) {
                    searchInput.value = "";
                    var myEvent = {};
                    myEvent.target = {};
                    myEvent.target.value = "";
                    this.handleFilterSearch(myEvent);
                }
            }

            if ((myTarget.classList.contains("button-showall")) || (myTarget.classList.contains("button-project"))) {
                if (myTarget.classList.contains ("active")) {
                    // The user has clicked on an already-active icon, so do nothing.
                    return;
                }
                for (var i = 0; i < arrCurrIconsLength; i++) {
                    arrCurrIcons[i].classList.toggle("active");
                }
            } else {
                for (i = 0; i < arrCurrIconsLength; i++) {
                    if ((arrCurrIcons[i].classList.contains("button-showall")) || (arrCurrIcons[i].classList.contains("button-project"))) {
                        arrCurrIcons[i].classList.toggle("active");
                        if (containerAssets.classList.contains("pp-show-all")) {
                            containerAssets.classList.toggle("pp-show-all");
                        }
                    }
                }
                if ((myTarget.classList.contains("active")) && (arrCurrIconsLength === 1)) {
                    // We're clicking on the last active button in the asset view. We can't deactivate that one, so return.
                    return;
                }
            }

            myTarget.classList.toggle("active");
            //myTarget.blur();
            arrCurrIcons = myColumn.querySelectorAll(".pp-button.active");
            arrCurrIconsLength = arrCurrIcons.length;
            containerAssets.setAttribute("class", "pp-scroll-main");
            for (i = 0; i < arrCurrIconsLength; i++) {
                if (arrCurrIcons[i].classList.contains("button-component")) {
                    containerAssets.classList.add("pp-show-components");
                    arrButtons.push("#pp-col-buttons .button-component");
                }

                if (arrCurrIcons[i].classList.contains("button-script")) {
                    containerAssets.classList.add("pp-show-scripts");
                    arrButtons.push("#pp-col-buttons .button-script");
                }

                if (arrCurrIcons[i].classList.contains("button-video")) {
                    containerAssets.classList.add("pp-show-videos");
                    arrButtons.push("#pp-col-buttons .button-video");
                }

                if (arrCurrIcons[i].classList.contains("button-audio")) {
                    containerAssets.classList.add("pp-show-audio");
                    arrButtons.push("#pp-col-buttons .button-audio");
                }

                if (arrCurrIcons[i].classList.contains("button-image")) {
                    containerAssets.classList.add("pp-show-images");
                    arrButtons.push("#pp-col-buttons .button-image");
                }

                if (arrCurrIcons[i].classList.contains("button-tag")) {
                    containerAssets.classList.add("pp-show-tags");
                    arrButtons.push("#pp-col-buttons .button-tag");
                }

                if (arrCurrIcons[i].classList.contains("button-flash")) {
                    containerAssets.classList.add("pp-show-flash");
                    arrButtons.push("#pp-col-buttons .button-flash");
                }
            }
            if (myTarget.classList.contains("button-showall")) {
                containerAssets.classList.add("pp-show-all");
                arrButtons.push("#pp-col-buttons .button-showall");
            }
            this.panelState.activeFilters = arrButtons;

            if (myTarget.classList.contains("button-project")) {
                // show the Project View
                viewProject.style.display = "block";
                viewAssets.style.display = "none";
                this.panelState.activeView = "project";
            } else {
                // show the Asset View
                viewAssets.style.display = "block";
                viewProject.style.display = "none";
                this.needsDraw = true;
                this.panelState.activeView = "assets";
            }

            // Store the current state.
            this.savePanelState();

        }
    },
    /* End: Interaction event handlers */

    /* Begin: file handlers */
    /* arrFiles: The flattened files array representing all the files in the project */
    _arrFiles: {
        value: []
    },
    arrFiles: {
        get: function() {
            return this._arrFiles;
        },
        set: function(arrFiles) {
            this._arrFiles = arrFiles;
        }
    },
    /* Panel State: the stored values of the panel UI state. */
    _panelState: {
        value: false
    },
    panelState: {
        get: function() {
            return this._panelState;
        },
        set: function(value) {
            this._panelState = value;
        }
    },
    loadPanelState: {
        value: function() {
            var strState = localStorage.getItem("panelState"),
                objState,
                tempState,
                intState = 0;
            if (this.hasActiveProject === "small") {
                intState = 1;
            }

            if (strState === null) {
                objState = {
                    "activeView" : "project",
                    "sortColumn" : 0,
                    "sortDirection" : "descending",
                    "assetColumnWidths" : [167, 127, 57, 57],
                    "projectColumnWidths" : [167, 127, 57],
                    "activeFilters" : ["#pp-col-buttons .button-project"],
                    "openFolders" : ["none"]
                }
            } else {
                tempState = JSON.parse(strState);
                if (intState >= tempState.length) {
                    objState = {
                        "activeView" : "project",
                        "sortColumn" : 0,
                        "sortDirection" : "descending",
                        "assetColumnWidths" : [167, 127, 57, 57],
                        "projectColumnWidths" : [167, 127, 57],
                        "activeFilters" : ["#pp-col-buttons .button-project"],
                        "openFolders" : ["none"]
                    }
                } else {
                    objState = tempState[intState];
                    //this.log("objstate is " + JSON.stringify(objState) + "\n\n")
                }

            }

            // After we go through all of that, it's possible we might still have a null objState.
            if (objState === null) {
                objState = {
                    "activeView" : "project",
                    "sortColumn" : 0,
                    "sortDirection" : "descending",
                    "assetColumnWidths" : [167, 127, 57, 57],
                    "projectColumnWidths" : [167, 127, 57],
                    "activeFilters" : ["#pp-col-buttons .button-project"],
                    "openFolders" : ["none"]
                }
            }
            this.panelState = objState;
        }
    },
    savePanelState: {
        value: function() {
            this.log('called')
            var strState = localStorage.getItem("panelState"),
                arrStates,
                intState = 0;
            if (this.hasActiveProject === "small") {
                intState = 1;
            }
            if (strState === null) {
                arrStates = [];
            } else {
                arrStates = JSON.parse(strState);
            }
            this.log("setting arrStates[" + intState + "] = " + JSON.stringify(this.panelState) + "\n\n");
            arrStates[intState] = this.panelState;
            localStorage.setItem("panelState", JSON.stringify(arrStates));
        }
    },

    /* getFlatDirectory: Fill arrFiles from the data source */
    getFlatDirectory: {
        value: function() {
            var myFiles = [],
                directory = this.getDirectoryData(false),
                strPath = "",
                flattenJson = function(jsonObject, intCounter) {
                    if (intCounter !== false) {
                        // strPath = strPath + ""  + "children[" + intCounter+ "]";
                        strPath = strPath + "" + "children." + intCounter;
                    }

                    if (jsonObject.type === "file") {
                        //jsonObject.type = jsonObject.name.split(".").pop();
                        jsonObject.extension = jsonObject.name.split(".").pop();
                        if (intCounter !== false) {
                            jsonObject.bindPath = strPath;
                        }
                        myFiles.push(jsonObject);
                    } else {
                        if (jsonObject.children != null) {
                            var oldPath = strPath;
                            for (var i = 0; i < jsonObject.children.length; i++) {
                                if (strPath !== "") {
                                    strPath = strPath + ".";
                                }
                                flattenJson(jsonObject.children[i], i)
                                strPath = oldPath;
                            }
                        }
                    }
                };
            if (this.hasActiveProject === "small") {
                directory = this.getDirectoryData(true);
            }
            flattenJson(this.activeProject, false);
            this.arrFiles = myFiles;
        }
    },
    getDirectoryData: {
        value: function(isSmall) {
            var ptrSearch = document.getElementById("pp-search-files");
            ptrSearch.value = "";
            if (isSmall) {
                this.activeProject = this.getSmallDirectory;
            } else {
                this.activeProject = this.getDirectory;
            }

            /*
            var file = {uri: ShellApi.openShellDialog({type: 'file', action: 'new'})}, type;
            var check = ShellApi.fileExists(file);
            */

            return this.activeProject;
        }
    },

    getSmallDirectory: {
        value: {
"type":"directory",
"name":"My Small Project",
"uri":"C:/My Projects",
"children":[
    {
        "type":"file",
        "name":"My Test.html",
        "uri":"C:/My Projects/My Test.html",
        "size":"54",
        "creationDate":"1311732965939",
        "modifiedDate":"1311732965941"
    },
      {
         "type":"directory",
         "name":"new-directory",
         "uri":"C:/My Projects/new-directory",
         "size":"120",
         "creationDate":"1311819825829",
         "modifiedDate":"1311819825899",
         "children": [
            {
               "type":"file",
               "name":"test.mpeg",
               "uri":"C:/My Projects/Win/test.mp3g",
               "size":"213022",
               "creationDate":"1311901492048",
               "modifiedDate":"1310613500131"
            },
            {
               "type":"file",
               "name":"test2.mp3",
               "uri":"C:/My Projects/Win/test2.mp3",
               "size":"134035",
               "creationDate":"1311901492054",
               "modifiedDate":"1310613500112"
            }
         ]
      }]
        }
    },

    /* getDirectory: Get the directory information from the data source */
    getDirectory: {
        value: {
   "type":"directory",
   "name":"My Large Project",
   "uri":"C:/My Projects",
   "children":[
      {
         "type":"file",
         "name":"Test.html",
         "uri":"C:/My Projects/Test.html",
         "size":"54",
         "creationDate":"1311732965939",
         "modifiedDate":"1311732965941"
      },
      {
         "type":"file",
         "name":"New File.html",
         "uri":"C:/My Projects/New File.html",
         "size":"120",
         "creationDate":"1311819825829",
         "modifiedDate":"1311819825899"
      },
      {
         "type":"file",
         "name":"new.html",
         "uri":"C:/My Projects/new.html",
         "size":"120",
         "creationDate":"1311819641255",
         "modifiedDate":"1311819888049"
      }
   ]
}
  },
    /* End: file handlers */


    /* Begin: Logging routines */
    _boolDebug: {
        enumerable: false,
        value: false // set to true to enable debugging to console; false for turning off all debugging.
    },
    boolDebug: {
        get: function() {
            return this._boolDebug;
        },
        set: function(boolDebugSwitch) {
            this._boolDebug = boolDebugSwitch;
        }
    },
    log: {
        value: function(strMessage) {
            if (this.boolDebug) {
                console.log(this.getLineNumber() + ": " + strMessage);
            }
        }
    },
    getLineNumber: {
        value: function() {
            try {
               throw new Error('bazinga')
            }catch(e){
                return e.stack.split("at")[3].split(":")[2];
            }
        }
    }
    /* End: Logging routines */


});
