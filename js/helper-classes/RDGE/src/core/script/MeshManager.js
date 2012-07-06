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

// RDGE namespaces
var RDGE = RDGE || {};

RDGE.Model = function (name, mesh) {
    this.name = name;
    this.mesh = mesh;
    this.camera = null;
};

/*
 *	Maintains a list of meshes to allow instancing of data
 */
RDGE.MeshManager = function () {
    this.contentUrl					= "assets_web/mesh/";
    this.modelMap					= {};
    this.readyList					= [];		// meshes that have data ready
    this.meshesLoading				= true;		// indicates that no meshes have loaded or that they are still loading
    this.postMeshLoadCallbackList	= [];
    this.tempSphere					= null;
    this.requestCounter				= 0;
};

/*
 * Pass the scene meshNode stump, loads temp object while real mesh is downloading
 */
RDGE.MeshManager.prototype.loadMesh = function (meshStump, tempMesh) {
    // if it exists already, return the mesh requested
    if ( this.modelMap[meshStump.name] !== undefined )
        return this.modelMap[meshStump.name];

    meshStump.ready = false;
    meshStump.addr = this.contentUrl + meshStump.name + "_mesh.json";
    meshStump.ctxID = RDGE.globals.engine.getContext().renderer.id;

	// sets a temp mesh up in place of the final mesh to load
    if (!tempMesh) {
        if (this.tempSphere == null) {
            this.tempSphere = RDGE.renderUtils.makeSphere(RDGE.globals.engine.getContext().renderer.ctx, 25, 5, 5);
        }

        tempMesh = this.tempSphere;
    }

	// add the temp mesh to the map of loaded meshes
    this.modelMap[meshStump.name] = tempMesh;
    
    // update the request counter - we now have one more mesh to load
    this.requestCounter++;

    RDGE.requestMesh(meshStump);

    return null;
};

/*
 * Deletes the passed mesh from the manager as well as all renderers
 */
RDGE.MeshManager.prototype.deleteMesh = function (name) {
	var model = this.modelMap[name];
	
    if (model) {
        RDGE.globals.engine.ctxMan.forEach(function (context) {
			context.renderer.deletePrimitive(model.primitive);
		});

		delete this.modelMap[name];
	}
};

RDGE.MeshManager.prototype.getModelByName = function (name) {
    return this.modelMap[name];
};

RDGE.MeshManager.prototype.getModelNames = function () {
    var names = [];
    for (var index in this.modelMap) {
        names.push(this.modelList[index].name);
    }

    return names;
};


RDGE.MeshManager.prototype.processMeshData = function () {
    var renderer = RDGE.globals.engine.getContext().renderer;
	
    // loop through meshes and load ready data
    for (var index in this.readyList) {
        // if item is ready load it
        if (this.readyList[index] && this.readyList[index].ready && renderer.id === this.readyList[index].ctxID) {
        

            // pop the item
            var model = this.readyList[index];
            this.readyList.splice(index, 1);
            
            var primset = new RDGE.rdgePrimitiveDefinition();
            
            primset.vertexDefinition = 
            {
				// this shows two ways to map this data to an attribute
                "vert": { 'type': RDGE.rdgeConstants.VS_ELEMENT_POS, 'bufferIndex': 0, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_pos": { 'type': RDGE.rdgeConstants.VS_ELEMENT_POS, 'bufferIndex': 0, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "normal": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT3, 'bufferIndex': 1, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_norm": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT3, 'bufferIndex': 1, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_normal": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT3, 'bufferIndex': 1, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "texcoord": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 2, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_texcoord": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 2, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_texcoords": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 2, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC },
                "a_uv": { 'type': RDGE.rdgeConstants.VS_ELEMENT_FLOAT2, 'bufferIndex': 2, 'bufferUsage': RDGE.rdgeConstants.BUFFER_STATIC }
            };
            
            primset.bufferStreams = 
            [
				model.root.data.coords,
				model.root.data.normals,
				model.root.data.uvs
            ];
            
            primset.streamUsage = 
            [
				RDGE.rdgeConstants.BUFFER_STATIC,
				RDGE.rdgeConstants.BUFFER_STATIC,
				RDGE.rdgeConstants.BUFFER_STATIC
            ];
            
            primset.indexUsage = RDGE.rdgeConstants.BUFFER_STREAM;
            
            primset.indexBuffer = model.root.data.indices;

			renderer.createPrimitive( primset );
			
			model.root.primitive = primset;

            // generate a bounding box for this mesh
            model.root.bbox = new RDGE.box();

            var numCoords = model.root.data.coords.length; var idx = 0;
            while (idx < numCoords - 2) {
              var thisCoord = [model.root.data.coords[idx+0], model.root.data.coords[idx+1], model.root.data.coords[idx+2]];
              model.root.bbox.addVec3(thisCoord);
              idx += 3;
            }

            this.modelMap[model.root.attribs.name] = model.root;
            
            // now that the model is load reduce the request count
            this.requestCounter--;
            
            this.onLoaded(model.root.attribs.name);
            //break;
        }

    }
};

RDGE.MeshManager.prototype.isReady = function () {
	return this.readyList.length == 0; 
};

RDGE.MeshManager.prototype.addOnLoadedCallback = function (callback) {
    this.postMeshLoadCallbackList.push(callback)
};

RDGE.MeshManager.prototype.onLoaded = function (meshName) {
    for (var index = 0 in this.postMeshLoadCallbackList) {
        // call the functions
        this.postMeshLoadCallbackList[index].onMeshLoaded(meshName);
    }
};

RDGE.MeshManager.prototype.exportJSON = function () {
    for (var m in this.modelMap) {
		this.modelMap[m].primitive.built = false;
	}
	
	return JSON.stringify(this.modelMap);
};

RDGE.MeshManager.prototype.importJSON = function (jsonMeshExport) {
    try {
		var tempModelMap = JSON.parse(jsonMeshExport);
		
        for (var m in tempModelMap) {
            if (!this.modelMap[m]) {
				this.modelMap[m] = tempModelMap[m];
			}
		}
		window.console.log("meshes imported");
    } catch (e) {
		window.console.error("error importing meshes: " + e.description );		
	}
};

/*
 *	global function for the mesh manager to make mesh file requests
 */ 
RDGE.requestMesh = function (mesh) {
    var request = new XMLHttpRequest();
    request.mesh = mesh;
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status == 200 || window.location.href.indexOf("http") == -1) {
                var mesh = eval("(" + request.responseText + ")"); //retrieve result as an JavaScript object
                mesh.ready = true;
                mesh.ctxID = request.mesh.ctxID;
                RDGE.globals.meshMan.readyList.push(mesh);
            }
            else {
                alert("An error has occured making the request");
            }
        }
    }

    request.open("GET", mesh.addr, true);
    request.send(null);
};
