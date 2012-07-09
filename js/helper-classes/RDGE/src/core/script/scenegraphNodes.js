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

/*
 *  Creates a unique node id
 */
RDGE.nodeIdGen = {};

RDGE.nodeIdGen.counter = 0;

RDGE.nodeIdGen.getId = function () {
    return "gen_" + RDGE.nodeIdGen.counter++;
};

/*
 *  Constructs a new transform node
 */
RDGE.createTransformNode = function (nodeName) {
    node = { 'name': nodeName };

    node.transformNodeTemplate = new RDGE.transformNodeTemplate(node);

    return node;
};

/*
 *  Constructs a new material node
 */
RDGE.createMaterialNode = function (nodeName) {
    node = { 'name': nodeName };

    node.materialNodeTemplate = new RDGE.materialNodeTemplate(node);

    return node;
};

/*
 *  Constructs a new mesh node
 */
RDGE.createMeshNode = function (nodeName, primitive) {
    meshNode = { 'mesh':{}, 'meshNodeTemplate':{} };

    var renderer = RDGE.globals.engine.getContext().renderer;

    if (!primitive.built) {
        renderer.createPrimitive(primitive);
    }

    var model = RDGE.globals.meshMan.getModelByName(nodeName);
    if (!model) {
        meshNode.mesh.meshNodeTemplate = new RDGE.meshNodeTemplate(meshNode.mesh, primitive, nodeName);

        RDGE.globals.meshMan.modelMap[nodeName] = meshNode.mesh;
        return meshNode; // --early out--
    }
    else if (!renderer.buffers[model.primitive.buffersID]) {
        renderer.createPrimitive(model.primitive);
    }

    meshNode.mesh.meshNodeTemplate = new RDGE.meshNodeTemplate(meshNode.mesh, model.primitive, nodeName);

    return meshNode;
};

/*
 *  Construct a light node
 */
RDGE.createLightNode = function (nodeName) {
    node = { 'name': nodeName };
    node.lightNodeTemplate = new RDGE.lightNodeTemplate(node);

    return node;
};

/*
 *  creates a specialized mesh node representing a screen aligned quad with identity transform
 */
RDGE.createScreenQuadNode = function () {
    var trNode = RDGE.createTransformNode();
    trNode.attachMeshNode("screenQuad", RDGE.renderUtils.createScreenAlignedQuad());
    return trNode;
};

RDGE.verifyTransformNode = function (node) {
    if (node.transformNodeTemplate == undefined) {
        node.transformNodeTemplate = new RDGE.transformNodeTemplate(node);
}
};

RDGE.verifyMaterialNode = function (node) {
    if (node.materialNodeTemplate == undefined) {
        node.materialNodeTemplate = new RDGE.materialNodeTemplate(node);
}
};

RDGE.verifyLightNode = function (node) {
    if (node.lightNodeTemplate == undefined) {
        node.lightNodeTemplate = new RDGE.lightNodeTemplate(node);
    }
};

/*
*   Takes an object and attaches transform node
 *  functions and fields if they are not defined
 */
RDGE.transformNodeTemplate = function (trNode) {
    // Lots of checking for things that might exist and adding them when they don't

    /* ------------------------------------------- */
    if (!trNode.children) {
        trNode.children = [];
    }

    if (!trNode.local) {
        trNode.local = RDGE.mat4.identity();
    }

    if (!trNode.world) {
        trNode.world = RDGE.mat4.identity();
    }

    if (!trNode.id) {
        trNode.id = RDGE.nodeIdGen.getId();
    }

    if (!trNode.name) {
        trNode.name = "xfrmNode" + trNode.id;
    }

    if (!trNode.parent) {
        trNode.parent = null;
    }

    if (!trNode.meshes) {
        trNode.meshes = [];
    }

    if (!trNode.nodeType) {
        trNode.nodeType = RDGE.rdgeConstants.nodeType.TRNODE;
    }

    /* ------------------------------------------- */

    // Adding functions to the node none of these exist from export process
    /*
     *  Attaches a material to a node
     */
    trNode.attachMaterial = function (matNode) {
        RDGE.verifyMaterialNode(matNode);

        this.materialNode = matNode;
    };

    /*
     *  @param node - the node to attach, can optionally be a node name paired with a primitive that will be built into a meshNode
     *  @param primitive - an optional parameter that must be supplied if the node is a name and not an object
     */
    trNode.attachMeshNode = function (node, primitive) {
        if (typeof node == "string") {
            node = RDGE.createMeshNode(node, primitive)
        }
        if (trNode.materialNode == undefined) {
            trNode.materialNode = RDGE.createMaterialNode(trNode.name + "|defMaterial");
        }

        trNode.meshes.push( {'mesh':{'name':node.mesh.attribs.name, 'id':node.mesh.attribs.id}});
    };

    /*
     *  Inserts a node as a child of this node
     */
    trNode.insertAsChild = function (transNode) {
        if(this == transNode)
            return;

        RDGE.verifyTransformNode(transNode);

        transNode.parent = this;
        this.children.push({transformNode:transNode});
    };

    /*
     *  Inserts a node as the parent of this node
     */
    trNode.insertAsParent = function (transNode) {
        if(this == transNode)
            return;

        RDGE.verifyTransformNode(transNode);

        if (this.parent) {
            // remove this node from current parents list
            var len = this.parent.children.length;
            for (var i = 0; i < len; ++i) {
                if (this.parent.children[i].transformNode != undefined) {
                    tr = this.parent.children[i].transformNode;
                    if (tr.id == this.id) {
                        // removes 1 item starting from i
                        this.parent.children.splice(i,1);
                        break;
                    }
                }

            }

            // set the new parents parent
            transNode.parent = this.parent;

            // push passed in node into parents list
            this.parent.children.push({transformNode:transNode});

            // set the passed in node as the current parent
            this.parent = transNode;
        }

        // add this node to the passed in nodes child list
        transNode.children.push({transformNode:this});
    };
};


// add material handlers to a material node
RDGE.materialNodeTemplate = function (matNode) {
    // enumerate constants

    // type definitions
    TEX_DIF  = 0;
    TEX_SPEC = 1;
    TEX_NORM = 2;
    TEX_GLOW = 3;

    if (!matNode.nodeType) {
        matNode.nodeType = RDGE.rdgeConstants.nodeType.MATNODE;
    }

    MATERIAL_MAX_LIGHTS = RDGE.rdgeConstants.MAX_MATERIAL_LIGHTS;

    if (!matNode.lightChannel) {
        matNode.lightChannel =
        [
            null,
            null,
            null,
            null
        ];
    }

    /*
     *  Material categories determine sorting
     */
    if (!matNode.sortCategory) {
        matNode.sortCategory = RDGE.rdgeConstants.categoryEnumeration.OPAQUE;
    }

    /*
     *  every node has an id either generated by export or generated here
     */
    if (!matNode.id) {
        matNode.id = RDGE.nodeIdGen.getId();
    }

    /*
     *  every node has an name either setin art pipeline or generated here
     */
    if (!matNode.name) {
        matNode.name = "matNode" + matNode.id;
    }

    /*
     *  Default list of textures if nothing is set
     */
    if (!matNode.textureList) {
        var renderer = RDGE.globals.engine.getContext().renderer;
        matNode.textureList =
        [
        //          {'name':"colMap",   'handle':renderer.getTextureByName("assets/images/white"),         'unit': TEX_DIF,    "type":RDGE.UNIFORMTYPE.TEXTURE2D},
        //          {'name':"envMap",   'handle':renderer.getTextureByName("assets/images/material_paint"),'unit': TEX_SPEC,   "type":RDGE.UNIFORMTYPE.TEXTURE2D},
        //          {'name':"normalMap",'handle':renderer.getTextureByName("assets/images/blue"),          'unit': TEX_NORM,   "type":RDGE.UNIFORMTYPE.TEXTURE2D},
        //          {'name':"glowMap",  'handle':renderer.getTextureByName("assets/images/black"),         'unit': TEX_GLOW,   "type":RDGE.UNIFORMTYPE.TEXTURE2D}
        ];
    }

    if (!matNode.uniforms) {
        matNode.uniforms = [];
    }

    matNode.setTexture = function (texType, texName) {
        var renderer = RDGE.globals.engine.getContext().renderer;
        this.textureList[texType].handle = renderer.getTextureByName("assets/images/" + texName);
        this.textureList[texType].handle = renderer.getTextureByName(RDGE.globals.engine._assetPath+"/images/" + texName);
        this.textureList[texType].unit = texType;
        this.textureList[texType].type = RDGE.UNIFORMTYPE.TEXTURE2D;

    };

    matNode.setDiffuseTexture = function (texName) {
        this.setTexture(TEX_DIF, texName);
    };

    matNode.setSpecTexture = function (texName) {
        this.setTexture(TEX_SPEC, texName);
    };

    matNode.setNormalTexture = function (texName) {
        this.setTexture(TEX_NORM, texName);
    };

    matNode.setGlowTexture = function (texName) {
        this.setTexture(TEX_GLOW, texName);
    };

    matNode.setUniform = function (name, arrValue) {
        var len = this.uniforms.length;
        for (var i = 0; i < len; ++i) {
            if (this.uniforms[i].name == name) {
                this.uniforms[i].value = arrValue;
                return;
            }
        }

        window.console.log("Could not find uniform: " + name);
    };

    matNode.setShader = function (jshaderObject) {
        this.shaderProgram = jshaderObject;
    };

    matNode.setSortCategory = function (materialCat) {
        matNode.sortCategory = materialCat;
    };

    /*
     * Sets a light channel reference to a lightNode
     * @param channelNumber a number indicating whick light to turn on (0 - 3), or an array of numbers if multiple lights being set
     * @param lightNode - a refernce to a light node object or an array lights
     */
    matNode.enableLightChannel = function (channelNumber, lightNode) {
        RDGE.verifyLightNode(lightNode);

        // set an array
        if (typeof channelNumber == "object") {
            var len = channelNumber.length;
            var maxLight = lightNode.length != undefined ? lightNode.length : 0;
            for (var i = 0; i < len; ++i) {

                matNode.lightChannel[channelNumber] = maxLight > 0 ? lightNode[ Math.min(i, maxLight - 1)] : lightNode;
            }
        }
        else // set an individual light
        {
            if(channelNumber < MATERIAL_MAX_LIGHTS)
                matNode.lightChannel[channelNumber] = lightNode;
        }
    };


    matNode.disableLightChannel = function (channelNumber) {
        if (typeof channelNumber != "object") {
            var len = channelNumber.length;

            for (var i = 0; i < len; ++i) {
                if (channelNumber[i] < MATERIAL_MAX_LIGHTS)
                    matNode.lightChannel[channelNumber[i]] = null;
            }
        }
        else {
            if(channelNumber < MATERIAL_MAX_LIGHTS)
                matNode.lightChannel[channelNumber] = null;
        }
    };

    matNode.disableAllLights = function () {
        for (var i = 0; i < MATERIAL_MAX_LIGHTS; ++i) {
            matNode.lightChannel[i] = null;
        }
    };

    matNode.toJSON = function () {
        var jsonObj = {'jsonExportName':"materialNode"};
        for (var member in this) {
            jsonObj[member] = this[member];

            if (member === "textureList") {
                var texList = jsonObj[member];
                for (var i = 0, len = texList.length; i < len; ++i) {
                    texList[i].handle.image = texList[i].handle.lookUpName;
                }
            }
            else if (member === "shaderProgram") {
                // test that the shader hasn't already been exported
                if (typeof jsonObj[member] != "string") {
                    jsonObj[member] = jsonObj[member].exportShader();
                }
            }
        }

        return jsonObj;
    };
};

RDGE.meshNodeTemplate = function (meshNode, primitive, meshName) {
    if (!primitive.built) {
        renderer.createPrimitive(primitive);
    }

    if (!meshNode.nodeType) {
        meshNode.nodeType = RDGE.rdgeConstants.nodeType.MESHNODE;
    }

    if (!meshNode.attribs) {
        var newID = RDGE.nodeIdGen.getId();

        meshNode.attribs = { 'id': newID,
        'indexCount': primitive.indexCount,
        'name': meshName,
            'vertCount': primitive.posCount
        };

        meshNode.name = meshName;
    }

    if (!meshNode.bbox) {
        meshNode.bbox = new RDGE.box();
    }

    meshNode.data = null;

    meshNode.primitive = primitive;

    // setup bounding box
    var numPositions = primitive.posCount;

    if (numPositions > 0) {
        var positions = primitive.positions;

        var idx = 0;
        while (idx < numPositions - 2) {
          var thisPos = [positions[idx+0], positions[idx+1], positions[idx+2]];
          meshNode.bbox.addVec3(thisPos);
          idx += 3;
        }
    }
    else {
        window.console.error("mesh " + meshNode.attribs.name + ": bounding volume not created");
    }
}

RDGE.lightNodeTemplate = function (lightNode) {
    if (!lightNode.nodeType) {
        lightNode.nodeType = RDGE.rdgeConstants.nodeType.LIGHTNODE;
    }

    if (!lightNode.id) {
        lightNode.id = RDGE.nodeIdGen.getId();
    }

    if (!lightNode.name) {
        lightNode.name = "light_" + lightNode.id;
    }

    if (!lightNode.typeName) {
        lightNode.typeName = "dir_light";
    }

    if (!lightNode.castShadow) {
        lightNode.castShadow = false;
    }

    if (!lightNode.depthMapBias) {
        lightNode.depthMapBias = 0.0179;
    }

    if (!lightNode.depthMapSize) {
        lightNode.depthMapSize = 1024;
    }

    if (!lightNode.coneAngle) {
        lightNode.coneAngle = 0.707;
    }

    if (!lightNode.penumbraAngle) {
        lightNode.coneAngle = 0.0;
    }

    if (!lightNode.dropOff) {
        lightNode.coneAngle = 0.025;
    }

    if (!lightNode.color) {
        lightNode.color = [1,1,1,1];
    }

    if (!lightNode.dir) {
        lightNode.dir = [1,-1,1];
    }

    if (!lightNode.links) {
        lightNode.links = [];
    }

    if (!lightNode.position) {
        lightNode.position = [0,0,0];
    }

    if (!lightNode.lightDiffuse) {
        lightNode.lightDiffuse = [1,1,1,1];
    }

    if (!lightNode.lightAmbient) {
        lightNode.lightAmbient = [0.5,0.5,0.5,1.0];
    }

    if (!lightNode.lightSpecular) {
        lightNode.lightSpecular = [1,1,1,1];
    }

    lightNode.setPosition = function (pos) {
        for (var i = 0; i < 3; i++) {
            this.position[i] = pos[i];
        }
    }

    lightNode.setDiffuseColor = function (color) {
        for (var i = 0; i < 4; i++) {
            this.lightDiffuse[i] = color[i];
        }
    }

    lightNode.setAmbientColor = function (color) {
        for (var i = 0; i < 4; i++) {
            this.lightAmbient[i] = color[i];
        }
    }

    lightNode.setSpecularColor = function (color) {
        for (var i = 0; i < 4; i++) {
            this.lightSpecular[i] = color[i];
        }
    }
};
