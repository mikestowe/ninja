/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;
var nj = require("js/lib/NJUtils.js").NJUtils;

exports.Tree = Montage.create(Component, {

    _treeDepth: {
    	value: 1
    },
    treeDepth: {
    	get: function() {
    		return this._treeDepth;
    	},
    	set: function(value) {
    		this._treeDepth = value;
    	}
    },
    _depthHash: {
    	value: ""
    },
    depthHash: {
    	get: function() {
    		return this._depthHash;
    	},
    	set: function(strValue) {
    		this._depthHash = strValue;
    	}
    },
    _firstLevel: {
    	value: true
    },
    firstLevel: {
    	get: function() {
    		return this._firstLevel;
    	},
    	set: function(value) {
    		this._firstLevel = value;
    	}
    },

    _hasFocus: {
        enumerable: false,
        value: false
    },

    _selectedNode: {
        enumerable: false,
        value: null
    },

    _selectedNodes: {
        enumerable: false,
        value: null
    },

    _dataProvider: {
        enumerable: false,
        value: null
    },

    dataProvider: {
        enumerable: true,
        get: function() {
            return this._dataProvider;
        },
        set: function(dp) {
            this._dataProvider = dp.documentElement;
            this.needsDraw = true;
        }
    },

    _jsonData: {
        enumerable: false,
        value: null
    },

    jsonData: {
        enumerable: true,
        get: function() {
            return this._jsonData;
        },
        set: function(jsonObject) {
            this._jsonData = jsonObject;
            this.needsDraw = true;
        }
    },

    _traverseJson: {
    	value: function(jsonObject, parentElement, intCounter) {
	    	var newLi = document.createElement("li"),
				fileSpan = document.createElement("span"),
				spaceSpan = document.createElement("span"),
				nameSpan = document.createElement("span"),
				sizeSpan = document.createElement("span"),
				dateSpan = document.createElement("span"),
				clearSpan = document.createElement("span"),
				containerSpan = document.createElement("span"),
				textName = document.createTextNode(jsonObject.name),
				textSize = "",
				textDate = "",
				textSpace = document.createTextNode("\u00A0"),
				indent = this.treeDepth * 18,
				strIndent =  indent + "px",
				extension = jsonObject.name.split(".").pop(),
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
				}
				
    		// File or directory?
    		if (jsonObject.type === "file") {
    			// Build file item:
    			// Create li, give it attributes and event listeners
    			// and then append it to the DOM
    			// Markup is a little complex in order to handle indention and columns.

    			
    			textSize = document.createTextNode(makeFriendlySize(jsonObject.size));
    			fileSpan.setAttribute("class", "pp-col-files");
    			sizeSpan.setAttribute("class", "pp-col-size");
    			sizeSpan.appendChild(textSize);
    			spaceSpan.setAttribute("class", "span-space");
    			spaceSpan.appendChild(textSpace);
    			spaceSpan.style.width = strIndent;
    			clearSpan.setAttribute("class", "clear");
    			fileSpan.appendChild(spaceSpan);
    			fileSpan.appendChild(textName);
    			
    			dateSpan.setAttribute("class", "pp-col-date");
    			textDate = document.createTextNode(makeFriendlyDate(parseInt(jsonObject.modifiedDate)));
    			dateSpan.appendChild(textDate);
    			
    			// Append elements in order
    			containerSpan.appendChild(fileSpan);
    			containerSpan.appendChild(dateSpan);
    			containerSpan.appendChild(sizeSpan);
    			
    			containerSpan.appendChild(clearSpan);
    			containerSpan.setAttribute("tabindex", 0);
    			containerSpan.setAttribute("class", "pp-span-all");
    			newLi.appendChild(containerSpan);
    			
    			// Loop through the JSON properties and set them as data attributes on the element
    			for (var property in jsonObject) {
					var newAttribute = "data-" + property;
					newLi.setAttribute(newAttribute, jsonObject[property]);
    			}
    			
    			// Set depth hash data
	    		newLi.setAttribute("data-depthhash", this.depthHash + "" + intCounter);
    			
    			// We also need to set the class of the element
    			newLi.setAttribute("class", jsonObject.type);
    			
    			
    			// Get the file extension 
    			newLi.classList.add(extension.toLowerCase());
    			
    		    // Add event listeners. Use the nifty identifier feature.
    		    newLi.identifier="jsontree";
    			newLi.addEventListener("click", this, false);
    			newLi.addEventListener("keydown", this, false);
    			
    			// Add element to the DOM.
    			parentElement.appendChild(newLi);
    			
    		} else {
    			// If it's not a file, it's a directory, so build directory item:
    			// Create li for directory entry, give it properties
    			// If it has children, create a UL for it and recurse.
    			// Markup is a little complex in order to handle indention and columns.

    			fileSpan.setAttribute("class", "pp-col-files");
    			if (this.firstLevel) {
    				fileSpan.setAttribute("title", jsonObject.uri);
    				fileSpan.classList.add("bold");
    				this.firstLevel = false;
    			}
    			sizeSpan.setAttribute("class", "pp-col-size");
    			dateSpan.setAttribute("class", "pp-col-date");
    			spaceSpan.setAttribute("class", "span-space");
    			spaceSpan.appendChild(textSpace);
    			spaceSpan.style.width = strIndent;
    			clearSpan.setAttribute("class", "clear");
    			fileSpan.appendChild(spaceSpan);
    			fileSpan.appendChild(textName);
    			
    			containerSpan.appendChild(fileSpan);
    			containerSpan.appendChild(dateSpan);
    			containerSpan.appendChild(sizeSpan);
    			containerSpan.appendChild(clearSpan);
    			containerSpan.setAttribute("tabindex", 0);
    			containerSpan.setAttribute("class", "pp-span-all");
    			
    			newLi.appendChild(containerSpan);
    			
    			// Loop through the JSON properties and set them as data attributes on the element
    			for (var property in jsonObject) {
    				if (property !== "children") {
						var newAttribute = "data-" + property;
						newLi.setAttribute(newAttribute, jsonObject[property]);
    				}
    			}
    			
    			
    			// Set element classes
    		    newLi.setAttribute("class", jsonObject.type);
    			if (this.treeDepth < 3) {
    				newLi.classList.add("level1");
    			}
    			
    			// Set depth hash data
	    		newLi.setAttribute("data-depthhash", this.depthHash + "" + intCounter);
    		    
    		    // Add event listeners. Use nifty identifier feature.
    		    newLi.identifier="jsontree";
    			newLi.addEventListener("click", this, false);
    			newLi.addEventListener("keydown", this, false);
    			
				// Append element to the DOM.
    			parentElement.appendChild(newLi);
    			
    			// Does the directory have children?
    			if (jsonObject.children != null) {
    				// Yes it does. Create a new UL and recurse.
	    			var newUl = document.createElement("ul"),
	    				jsonObjectLength = jsonObject.children.length,
	    				oldDepthHash = this.depthHash;
	    			
	    			// Only show the first two levels of the list open, otherwise show them as closed.
	    			if (this.treeDepth < 3) {
	    				newLi.classList.add("open");
	    			} else {
	    				newLi.classList.add("closed");
	    			}

					// Extend depthHash:
	    			this.depthHash = this.depthHash + "" + intCounter + ",";
	    			
	    			newLi.appendChild(newUl);
    				for (var i = 0; i < jsonObjectLength; i++) {
    					this.treeDepth = this.treeDepth + 1;
    					this._traverseJson(jsonObject.children[i], newUl, i);
    					this.treeDepth = this.treeDepth -1;
    				}
    				
    				// we're done recursing, so restore depthHash to what it was before we recursed:
    				this.depthHash = oldDepthHash;
    			}
    		}
    	}
    },
    handleJsontreeClick: {
    	value: function(event) {
            event.stopImmediatePropagation();
            var target = event.currentTarget,
            	myType = target.dataset.type,
            	treeClickEvent;
    		// What type of item did we just click on?
    		if (myType === "directory") {
    			// We just clicked on a directory. Toggle it!
    			target.classList.toggle("open");
    			target.classList.toggle("closed");
    			// Dispatch an event that can be used by the Project Panel 
				treeClickEvent = document.createEvent("UIEvents");
				treeClickEvent.initEvent("treeClickEvent", false, false);
				document.dispatchEvent(treeClickEvent);
    		}
    	}

    },
    
    handleJsontreeKeydown: {
    	value: function(event) {
            var target = event.currentTarget,
            	myType = target.dataset.type, 
            	nextSpan = false,
            	mySeebl = false,
            	treeClickEvent = document.createEvent("UIEvents"),
            	getNextSibling = function(el) {
            		// Get the next sibling of a file element.
            		// Returns the sibling if it exists, or false if there is none.
            		
            		// first of all, if we're at the top of the tree we're already done.
            		var myParentUl = nj.queryParentSelector(el, "ul");
            		if (myParentUl.getAttribute("id") === "pp-container-tree") {
            			return false;
            		}
            		var myPar = nj.queryParentSelector(el, "li"),
            			mySeebl = myPar.nextSibling;
            		if (mySeebl === null) {
            			mySeebl = getNextSibling(myPar);
            		}
            		if (mySeebl === false) {
            			return false;
            		}
            		return mySeebl;
            	}, 
            	drillDown = function (ptrLi) {
            		// Drill down into a subtree
            		var returnSibling = false;
            		if ((ptrLi.classList.contains("directory")) && (ptrLi.classList.contains("open"))) {
            			returnSibling = drillDown(ptrLi.querySelector("li:last-child"));
            		} else {
            			returnSibling = ptrLi;
            		}
					return returnSibling;
            	},
				goUp = function (ptrLi, isRecursing) {
					// Get the previous item in a tree.
            		var testSibling = ptrLi.previousSibling,
            			newSibling = "",
						returnSibling = false;
					if (isRecursing) {
						testSibling = ptrLi;
					}
	            	if ((testSibling !== null) && (testSibling.querySelector)) {
	            		// exists. If it's a open directory, we need to drill down into it.
	            		if ((testSibling.classList.contains("directory"))&&(testSibling.classList.contains("open")) &&(!isRecursing)) {
	            			returnSibling = drillDown(testSibling);
	            		} else {
	            			// We can just use it;
	            			returnSibling = testSibling;
	            		}
	            	} else {
	            		// It doesn't exist, so we need to go up a level.
	            		newSibling = nj.queryParentSelector(ptrLi, "li");
	            		returnSibling = goUp(newSibling, true);
	            	}
	            	
	            	return returnSibling;
            	};
            	
    		// Stop propagation.
            event.stopImmediatePropagation();

            if (event.keyCode === 40) {
				// Down arrow pressed.
				// Prevent scroll.
            	event.preventDefault();

            	if (myType === "directory") {
            		// The keypress happened on a directory.
            		// Is it open or closed?
            		if (target.classList.contains("open")) {
            			// Go into the subdirectory
            			var myPar = nj.queryParentSelector(event.target, "li");
            			
            			nextLi = myPar.querySelector("ul li");
            			nextSpan = nextLi.querySelector("span");
            			// But the subdirectory might be empty...if so, get
            			// the next element
            			if (nextSpan === null) {
            				nextSpan = target.nextSibling.querySelector(".pp-span-all");
            			}
            		} else if (target.classList.contains("closed")) {
            			var myParentUl = nj.queryParentSelector(target, "ul");
            			if (myParentUl.getAttribute("id") !== "pp-container-list") {
            				// Closed directory, so get the next sibling element.
            				nextSpan = target.nextSibling.querySelector(".pp-span-all");
            			}
            		}
            	} else {
            		// The keypress happened on a file, so we need to get the next 
            		// element and focus it.
            		mySeebl = getNextSibling(event.target);
            		if (mySeebl) {
            			nextSpan = mySeebl.querySelector(".pp-span-all");
            		}
            	}

            	// If the next element isn't null or false, focus it
            	if ((nextSpan !== null) && (nextSpan !== false)) {
            		nextSpan.focus();
            	}
            }
            
            if (event.keyCode === 38) {
            	// Up arrow pressed.
            	// Prevent scroll.
            	event.preventDefault();
            	
            	var myLi = nj.queryParentSelector(event.target, "li"),
            	myUl = nj.queryParentSelector(myLi, "ul"),
            	nextSibling = "";
            	
            	// If we're not already at the top of the tree, we need to 
            	// goUp.
            	if (myUl.getAttribute("id") !== "pp-container-tree") {
            		nextSibling = goUp(myLi, false);
	            	nextSpan = nextSibling.querySelector(".pp-span-all");
	    
	            	// If the next element isn't null or false, focus it
	            	if ((nextSpan !== null) && (nextSpan !== false)) {
	            		nextSpan.focus();
	            	}
            	}
            }
            
            if (event.keyCode === 37) {
            	// Left arrow pressed.
            	// Prevent scroll.
            	event.preventDefault();
            	
            	var projectPanel = nj.queryParentSelector(event.target, "#projectPanel"),
            		firstButton = projectPanel.querySelector(".button-project");
            		firstButton.focus();
            }
            
            if (event.keyCode === 13) {
            	// return pressed.

	    		if (myType === "directory") {
	    			target.classList.toggle("open");
	    			target.classList.toggle("closed");
	    		}
				
    			// Dispatch an event that can be used by the Project Panel 
				treeClickEvent.initEvent("treeClickEvent", false, false);
				document.dispatchEvent(treeClickEvent);
            }
            
            if (event.keyCode === 39) {
            	// Right arrow key pressed
            	event.preventDefault();
            }
    	}
    },

    // TODO This should be more flexible - it should accept strings and objects as well.
    // Adds a node to root tree node
    addTreeNode: {
        value: function(treeNode) {
            if(this.dataProvider)
            {
                // TODO This should set the dataProvider instead so we draw on the next frame.
                this._element.appendChild(treeNode);
                this.needsDraw = true;
            }
            else
            {
                // TODO create a new dataProvider
            }
        }
    },

    // arg1 = new tree node's id
    // arg2 = label
    // should also allow users to specify an object that is the "data" for that tree
    addTreeNode2: {
        value: function(treeID, treeLabel) {
            var curNode = document.createElement("li");
            curNode.id = treeID;
            curNode.addEventListener("click", this, false);

            var leafIcon = document.createElement("img");
            leafIcon.src = "js/components/tree.reel/treeItem.png";
            leafIcon.width = 16;
            leafIcon.height = 16;
            leafIcon.addEventListener("click", this, false);

            var textNode = document.createElement("text");
            textNode.textContent = treeLabel;
            textNode.insertBefore(leafIcon, textNode.firstChild);
            curNode.appendChild(textNode);

            this.addTreeNode(curNode);
        }
    },


    // add a new tree node to an existing parent tree node 
    addTreeNode3: {
        value: function(treeNode, parentNode) {
            if(parentNode)
            {
                // TODO This should set the dataProvider instead so we draw on the next frame.
                // TODO If parentNode is an LI element, we need to convert it to an UL element
                parentNode.appendChild(treeNode);
                this.needsDraw = true;
            }
            else
            {
                
            }
        }
    },

    // TODO This should be more flexible - it should accept strings and objects as well.
    removeTreeNode: {
        value: function(treeNode) {
            var nodeToDelete = document.getElementById(treeNode.id);
            if(nodeToDelete)
            {
                this._element.removeChild(nodeToDelete);
                this.needsDraw = true;
            }
        }
    },

    draw: {
        value: function() {

        }
    },

    _createFolderNode: {
        value: function(folderID, folderLabel, isFolder, isExpanded)
        {
            var parNode = document.createElement("li");
            parNode.id = folderID;
            parNode.setAttribute("isFolder", isFolder);
            parNode.setAttribute("isExpanded", isExpanded);
            parNode.addEventListener("click", this, false);

            var folderIcon = document.createElement("img");
            folderIcon.src = "js/components/tree.reel/treeFolderOpen.png";
            folderIcon.width = 16;
            folderIcon.height = 16;
            
            var textNode = document.createElement("text");
            textNode.textContent = folderLabel;

            var disclosureIcon = document.createElement("img");
            disclosureIcon.src = "js/components/tree.reel/treeDisclosure.png";
            disclosureIcon.width = 16;
            disclosureIcon.height = 16;
            disclosureIcon.addEventListener("click", this, false);

            textNode.insertBefore(folderIcon, textNode.firstChild);
            textNode.insertBefore(disclosureIcon, textNode.firstChild);

            parNode.appendChild(textNode);

            var curNode = document.createElement("ul");
            curNode.id = folderID + "folderItems";
            parNode.appendChild(curNode);

            return parNode;
        }
    },

    _setNodeStyle: {
        value: function(dp, par) {
            var dpLen = dp.length;

            
            for(var i=0; i < dpLen; i++)
            {
                var treeNode = dp[i];
                if(treeNode.nodeType !== 1)
                {
                    continue;
                }

                var newNode;

                if(treeNode.childNodes.length === 0)
                {
                    if(treeNode.nodeName === "folder")
                    {
                        newNode = this._createFolderNode(treeNode.getAttribute("id"),
                                                treeNode.getAttribute("label"),
                                                "true",
                                                "true");
                        
                        par.appendChild(newNode);
                    }
                    else if(treeNode.nodeName === "leaf")
                    {
                        var leafIcon = document.createElement("img");
                        leafIcon.src = "js/components/tree.reel/treeItem.png";
                        leafIcon.width = 16;
                        leafIcon.height = 16;
                        leafIcon.addEventListener("click", this, false);

                        newNode = document.createElement("li");
                        newNode.id = treeNode.getAttribute("id");
                        newNode.addEventListener("click", this, false);
                        newNode.draggable = true;

                        // test code for component panel needed by our DragDropManager
                        newNode.ondragstart = function(event){
                            event.dataTransfer.setData ("text/plain", event.currentTarget.id + "-Component");
                        };

                        var textNode = document.createElement("text");
                        textNode.textContent = treeNode.getAttribute("label");
                        textNode.insertBefore(leafIcon, textNode.firstChild);
                        newNode.appendChild(textNode);

                        par.appendChild(newNode);
                    }
                    else
                    {
                        console.log("Did not handle tree node " + treeNode.nodeName);
                    }
                }
                else
                {
                    newNode = this._createFolderNode(treeNode.getAttribute("id"),
                                                treeNode.getAttribute("label"),
                                                "true",
                                                "true");

                    par.appendChild(newNode);

                    this._setNodeStyle(treeNode.childNodes, newNode.lastChild);

                }
            }
        }
    },

    prepareForDraw: {
        value: function() {
            if(this.dataProvider) {
                this._setNodeStyle(this.dataProvider.childNodes, this._element);
            } else if (this.jsonData) {
            	this._traverseJson(this.jsonData, this._element, 0);
            }
        }
    },

    handleClick: {
        value: function(event) {
//            this._acknowledgeIntent();
            event.stopImmediatePropagation();
            var target = event.currentTarget;

            switch(target.nodeName)
            {
                case "LI":
                {
                    console.log("clicked " + target.id);
                    target.classList.add("selected");
                    if( this._selectedNode && (this._selectedNode !== target) )
                    {
                        this._selectedNode.classList.remove("selected");
                    }
                    this._selectedNode = target;
                    var actionEvent = document.createEvent("CustomEvent");
                    actionEvent.initEvent("change", true, true);
                    actionEvent.type = "change";
                    actionEvent.treeNode = target;
                    actionEvent.mouseEvent = event;
                    this.dispatchEvent(actionEvent);
                    break;
                }
                case "IMG":
                {
                    var _parent = target.parentElement.parentElement;
                    if(_parent.getAttribute("isFolder"))
                    {
                        // toggle the items in the UL node
                        if(_parent.getAttribute("isExpanded") === "true")
                        {
                            _parent.setAttribute("isExpanded", "false");
                            _parent.classList.remove("expanded");
                            _parent.children[0].children[0].style.webkitTransform = "rotate(-90deg)";
                            _parent.children[0].children[1].src = "js/components/tree.reel/treeFolderClosed.png";
                            this.toggleFolderState(_parent.children[1], false);
                        }
                        else
                        {
                            _parent.setAttribute("isExpanded", "true");
                            _parent.classList.add("expanded");
                            _parent.children[0].children[0].style.webkitTransform = "rotate(0deg)";
                            _parent.children[0].children[1].src = "js/components/tree.reel/treeFolderOpen.png";
                            this.toggleFolderState(_parent.children[1], true);                            
                        }
                    }
                    break;
                }
            }

            // TODO - This is just for testing
            if(target.id === "addItem")
            {
                var curNode = document.createElement("li");
                var uniqueID = Math.floor(Math.random()*9999);
                curNode.id = "newItem_" + uniqueID;
                curNode.addEventListener("click", this, false);

                var leafIcon = document.createElement("img");
                leafIcon.src = "Tree.reel/treeItem.png";
                leafIcon.width = 16;
                leafIcon.height = 16;
                leafIcon.addEventListener("click", this, false);

                var textNode = document.createElement("text");
                textNode.textContent = "New Item " + uniqueID;
                textNode.insertBefore(leafIcon, textNode.firstChild);
                curNode.appendChild(textNode);
                this.addTreeNode(curNode);
            }
            else if(target.id === "addItem2")
            {
                this.addTreeNode2("TestItem2", "This is a test item");
            }
            else if(target.id === "addItem3")
            {
                var curNode = document.createElement("li");
                var uniqueID = Math.floor(Math.random()*9999);
                curNode.id = "newItem_" + uniqueID;
                curNode.addEventListener("click", this, false);

                var leafIcon = document.createElement("img");
                leafIcon.src = "js/components/tree.reel/treeItem.png";
                leafIcon.width = 16;
                leafIcon.height = 16;
                leafIcon.addEventListener("click", this, false);

                var textNode = document.createElement("text");
                textNode.textContent = "New Sub Item " + uniqueID;
                textNode.insertBefore(leafIcon, textNode.firstChild);
                curNode.appendChild(textNode);
                
                this.addTreeNode3(curNode, this._element.children[0].children[1]);
            }
            else if(target.id === "removeItem")
            {
                // Get last node
                var curNode = this._element.children[this._element.children.length-1];
                curNode.removeEventListener("click", this, false);
                this.removeTreeNode(curNode);
            }
        }
    },


    toggleFolderState : {
        value : function(folderNode, expand)
        {
            var i = 0;
            var len = folderNode.children.length;
            
            if(!expand)
            {
                for(i=0; i<len; i++)
                {
                    folderNode.children[i].style.display = "none";
                }
            }
            else
            {
                for(i=0; i<len; i++)
                {
                    if(folderNode.children[i].nodeName === "LI")
                    {
                        folderNode.children[i].style.display = "list-item";
                    }
                    else
                    {
                        // special case folders
                        folderNode.children[i].style.display = "block";
                    }
                }
            }
        }
    },

	init: {
		value: function() {
			this.needsDraw = true;
			this.prepareForDraw();
		}
		
	}

});
