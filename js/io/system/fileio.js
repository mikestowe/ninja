/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

//Required modules 
var Serializer = 				require("montage/core/serializer").Serializer;
//Exporting as File I/O
exports.FileIo = (require("montage/core/core").Montage).create(Object.prototype, {
	/*
create: {
		enumerable: true,
		value: function (type) {
			//
		}
	},
*/
	////////////////////////////////////////////////////////////////////
    //
    open: {
    	enumerable: true,
    	value: function(doc, type, uri, server) {
    		//
    		var file = {}, head, body, h, b;
    		file.uri = uri;
    		file.server = server;
    		//
    		if (doc.content) {
    			if (type === 'html' || type === 'htm') {
    				//
    				h = doc.content.split('</head>');
    				h = h[0].split('<head>');
    				head = h[1];
    				//
    				b = doc.content.split('</body>');
    				b = b[0].split('<body>');
    				body = b[1];
    				//
    				file.type = 'html';
    				file.head = head;
    				file.body = body;
    			} else {
    				//TODO: Add other file type routines
    				file.type = type;
    				file.content = doc.content;
    			}		
    		} else {
   				//TODO: File is empty
   				if (type === 'html' || type === 'htm') {
   					head = '';
   					body = '';
   					//
   					file.type = 'html';
    				file.head = head;
    				file.body = body;
   				} else {
   					//TODO: Add other file type routines
    				file.type = type;
    				file.content = doc.content;
   				}
   			}
   			//TODO: Load contents into App
            //documentManagerModule.DocumentManager.openDocument(file);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    save: {
    	enumerable: true,
    	value: function(type, id, components) {
    		
    		/*
    		
    		GETS HTML IN LOADED DOCUMENT
    		document.getElementById('userDocument').contentDocument.documentElement.outerHTML
    		
    		GETS HTML IN <HEAD> AND <BODY> OR ANYTHING INSIDE <HTML>
    		document.getElementById('userDocument').contentDocument.documentElement.innerHTML
    		
    		THE ABOVE METHOD SEEMS TO BE BETTER JUST IN CASE PEOPLE REMOVE THE BODY TAG SINCE NOT REQUIRED IN HTML5
    		
    		GETS HTML IN <BODY> ONLY
    		document.getElementById('userDocument').contentDocument.body.innerHTML
    		
    		HACK TO GET THE STYLES OF THE ELEMENTS ADDED WHILE DRAWING
    		document.getElementById('userDocument').contentDocument.styleSheets[document.getElementById('userDocument').contentDocument.styleSheets.length-1]
    		
    		CSS SEEMS TO BE RESERVED WHEN APPENDED, MEANING 0 IN THE ARRAY IS ACTUALLY THE LAST DEFINED STYLE IN THE CSS
    		
    		//GETS CSS RULES APPLIED TO ALL OBJECTS CREATED BY THE APP
    		document.getElementById('userDocument').contentDocument.styleSheets[document.getElementById('userDocument').contentDocument.styleSheets.length-1].cssRules
    		
    		document.getElementById('userDocument').contentDocument.getElementById('userHead').innerHTML
    		document.getElementById('userDocument').contentDocument.getElementById('UserContent').innerHTML
    		this.getCssFromRules(document.getElementById('userDocument').contentDocument.styleSheets[document.getElementById('userDocument').contentDocument.styleSheets.length-1].cssRules)
    		
    		*/
    		
    		//
    		var contents, counter = 0;
    		//Checking for document type to go through saving routine
    		switch (type.toLowerCase()) {
    			case 'html':
    				//Checking for components in components panel
    				if (components) {
    					var comps = '', comp, html, mbind, hackParams = '', compSerializer = Serializer.create();
    					//TODO: Check if this is needed since compSerializer was localized
						compSerializer._serializedObjects = [];
						//
    					html = document.getElementById(id).contentDocument.getElementById('UserContent').innerHTML;
    					//
    					for(var i in components){
    						//
    						comp = compSerializer.serializeObject(components[i]);
    						//TODO: Remove this HACK
    						if (components[i]._montage_metadata.__proto__.objectName == 'PhotoEditor') {
    							if (components[i].pathToJSON) {
    								hackParams = '"pathToJSON": "'+components[i].pathToJSON+'",\n';
    							}
    						} else {
    							
    						}
    						var split = comp.split('"element":U("m-obj://undefined/'+components[i]._element.uuid);
    						comp = split[0]+hackParams+'\t"element":E("#'+components[i]._element.id+split[1];
    						if (document.getElementById(id).contentDocument.getElementById(components[i]._originalElementId).innerHTML.length > 2) {
    							split = html.split(document.getElementById(id).contentDocument.getElementById(components[i]._originalElementId).innerHTML);
    							html = split[0]+split[1];
    						}
    						//
    						if (counter > 0) {
    							comps += ',\n'+comp;
    						} else {
    							comps += comp;
    						}
    						counter++;
    	       			}
            	
            			for(var i in components){
            				//
            				if (components[i]._bindingDescriptors){
            					var split = comps.split('U("m-obj://undefined/'+components[i]._bindingDescriptors.uuid+'", {\n    })');
    							comps = split[0]+'\n'+
    									'{\n'+
                                    	'"'+components[i].binding.sourceProperty+'": {\n'+
                                        '"boundObject": U("m-obj://'+components[i].binding.target._montage_metadata.__proto__.objectName+'/'+components[i].binding.target.uuid+'?mId='+components[i].binding.target._montage_metadata.__proto__.moduleId+'"),\n'+
                                        '"boundObjectPropertyPath": "'+components[i].binding.targetProperty+'"\n'+
                                    	'}\n'+
                                		'}\n'+
    									split[1];
    						}
            			}
    					var montage = 	'<script type="text/m-objects">\n\t\t\t{\n'+
    									'\t\t\t"$rootObject": U("m-obj://Application/application-uuid?mId=montage/application", {\n'+
            							'\t\t\t\t"components": [\n'+
           								comps+
            							'\n\t\t\t\t]\n\t\t\t})\n\t\t\t}\n\t\t</script>';
								    	
    					contents = '<html>\n\t<head>'+document.getElementById(id).contentDocument.getElementById('userHead').innerHTML+'\n\t\t'+montage+'\n\t</head>\n\t<body>\n'+html+'\n\t</body>\n</html>';
    				} else {
    					//No m-js components in file, so saving plain document HTML
    					contents = '<html>\n\t<head>'+document.getElementById(id).contentDocument.getElementById('userHead').innerHTML+'\n\t</head>\n\t<body>\n'+document.getElementById(id).contentDocument.getElementById('UserContent').innerHTML+'\n\t</body>\n</html>';
    				}
    				break;
    			case 'css':
    				contents = this.getCssFromRules(document.getElementById(id).contentDocument.styleSheets[document.getElementById(id).contentDocument.styleSheets.length-1].cssRules);
    				break;
    			case 'js':
    				break;
    			case 'text':
    				break;
    			default:
    				break;
    		}
    		
    		
    		return contents;
    		
    		
    		
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    saveAs: {
    	enumerable: true,
    	value: function(e) {
    		//TODO: Add functionality
    		console.log('FileIO: saveFileAs');
    	}
    },
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //Method to return a string from CSS rules (to be saved to a file)
    getCssFromRules: {
    	enumerable: false,
    	value: function (list) {
    		//Variable to store CSS definitions
    		var i, str, css = '';
    		//Looping through list
    		if (list && list.length > 0) {
    			//Adding each list item to string and also adding breaks
    			for (i = 0; list[i]; i++) {
    				str = list[i].cssText+' ';
    				str = str.replace( new RegExp( "{", "gi" ), "{\n\t" );
    				str = str.replace( new RegExp( "}", "gi" ), "}\n" );
    				str = str.replace( new RegExp( ";", "gi" ), ";\n\t" );
    				css += '\n'+str;
    			}
    		}
    		//Returning the CSS string
    		return css;
    	}
    }
    
    
    

    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////