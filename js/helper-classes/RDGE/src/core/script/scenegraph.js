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

// default render proc
// render scene nodes
RDGE.DefaultRender = function () {
    // setup the default shader
    this.renderer = RDGE.globals.engine.getContext().renderer;
    //this.shaderProgram = this.renderer.defaultShader;
    this.jshaderProgram = new RDGE.jshader();
    this.jshaderProgram.def = this.renderer.defaultShaderDefintion;
    this.jshaderProgram.init();
};

RDGE.DefaultRender.prototype.process = function (context, trNode, parent) {
};

function renderObject(trNode, renderCtx, parent) {
    this.node = trNode ? trNode : RDGE.createTransformNode();
    this.context = renderCtx ? renderCtx : new RDGE.RenderContext();
    this.parent = parent ? parent : null;
};


// Scene graph contains set of tools for manipulating the graph
RDGE.SceneGraph = function (scene) {
    if (scene == undefined || scene == null)
        scene = {};

    this.scene = scene;

    if (this.scene.root != undefined)
        this.scene = this.scene.root;
    else
        this.scene = { 'children': [] };

    this.tick = 0;
    this.lastTick = -1;
    this.frustumCulling = true;

    // the main light for the scene - also casts shadows
    this.mainLight = new RDGE.shadowLight();

    this.bckTypes = RDGE.rdgeConstants.categoryEnumeration;

    this.renderList = new Array(this.bckTypes.MAX_CAT);
    this.renderList[this.bckTypes.BACKGROUND] = []; //BACKGROUND	
    this.renderList[this.bckTypes.OPAQUE] = []; //OPAQUE		
    this.renderList[this.bckTypes.TRANSPARENT] = []; //TRANSPARENT
    this.renderList[this.bckTypes.ADDITIVE] = []; //ADDITIVE
    this.renderList[this.bckTypes.TRANSLUCENT] = []; //TRANSLUCENT
    this.renderList[this.bckTypes.FOREGROUND] = []; //FOREGROUND

    // a list of shadow geometry
    this.shadowRenderList = [];

    // scene traversal functor for creating a culled list of shadow geometry
    this.shadowCuller = null;

    // define passes to render geometry and handle post-processing
    this.defaultPassDef =
	{
	    // a pass can have children that will receive their parents output as input

	    // this pass renders the depth map to an off-screen target - from the shadow lights view
	    // you can specify what your output should be
	    // @param name		- this tells jshader's of child passes (which receive the parents output as input)
	    //					  what the sampler2d uniform name will be for this output texture
	    // @param type		- the type of output could be tex2d or target
	    // @param width		- optional width of the render target
	    // @param height	- optional height of the render target
	    // @param mips		- optional flag indicating whether the render target will support mip-mapping

	    // the geometry pass
	    'name': "geoPass",
	    'geometrySet': "ALL"
	    //		'outputs':[{ 'name':"u_mainRT", 'type':"target", 'width':1024, 'height':1024, 'mips':false }],
	    //		'children':
	    //		[
	    //			// shadow pass
	    //			{
	    //				'outputs':[{ 'name':"u_shadowDepthMap", 'type':"target", 'width':1024, 'height':1024, 'mips':false }],
	    //				// custom parameter
	    //				'name':"shadowDepthMap",
	    //				'shader': RDGE.rdgeDepthMapShaderDef,
	    //				'technique':"shadowDepthMap",
	    //				'geometrySet':"SHADOW",
	    //				'children':
	    //				[
	    //					// create shadow rt
	    //					{
	    //						'outputs':[{ 'name':"u_shadowMap", 'type':"target", 'width':1024, 'height':1024, 'mips':false }],
	    //						'name':"shadowMap",
	    //						'shader': RDGE.rdgeShadowMapShader,
	    //						'clearColor' : [1.0,1.0,1.0,1.0],
	    //						'geometrySet':"SHADOW",
	    //					}
	    //				]
	    //			},
	    //			// glow pass
	    //			{
	    //				'outputs':[{ 'name':"sTexture", 'type':"target", 'width':1024, 'height':1024, 'mips':false }],
	    //				'name':"glowMap",
	    //				'shader': RDGE.rdgeGlowMapShader,
	    //				'clearColor' : [0.0,0.0,0.0,1.0],
	    //				'technique':"createGlowMap",
	    //				'geometrySet':"ALL",
	    //				'children':
	    //					[
	    //						{	// the blur pass at half resolution
	    //							'name':"blurQuarter",
	    //							'geometrySet':"SCREEN_QUAD",
	    //							'shader': RDGE.rdgeGaussianBlurShader,
	    //							'outputs':[{ 'name':"sTexture", 'type':"target", 'width':256, 'height':256, 'mips':false }],
	    //							'children':
	    //							[
	    //								{	// the blur pass at half resolution
	    //									'name':"blurThreeQuarter",
	    //									'geometrySet':"SCREEN_QUAD",
	    //									'shader': RDGE.rdgeGaussianBlurShader,
	    //									'outputs':[{ 'name':"sTexture", 'type':"target", 'width':128, 'height':128, 'mips':false }],
	    //									'children':
	    //									[
	    //										 {	// the blur pass at quarter resolution
	    //											'name':"blurFull",
	    //											'geometrySet':"SCREEN_QUAD",
	    //											'shader': RDGE.rdgeGaussianBlurShader,
	    //											'outputs':[{ 'name':"u_glowFinal", 'type':"target", 'width':1024, 'height':1024, 'mips':false }]
	    //										}
	    //									]
	    //								}
	    //							]
	    //						}
	    //					]
	    //			},
	    //			// depth map in view space
	    //			{
	    //				'name':"depth_map",
	    //				'shader': RDGE.rdgeDepthMapShaderDef,
	    //				'technique': "depthMap",
	    //				'outputs':[{ 'name':"u_depthMap", 'type':"target", 'width':1024, 'height':1024, 'mips':false }],
	    //				'geometrySet':"ALL",
	    //				'children' : 
	    //				[
	    //					// get the normals in view space
	    //					{
	    //						'name':"normals",
	    //						'shader': RDGE.rdgeViewSpaceNormalsShader,
	    //						'outputs':[{ 'name':"u_normalsRT", 'type':"target", 'width':1024, 'height':1024, 'mips':false }],
	    //						'geometrySet':"ALL",
	    //						'children' : 
	    //						[
	    //							// techniques requiring depth and normals in view space go here
	    //							
	    //							// SSAO map
	    //							{
	    //								'name':"SSAO",
	    //								'shader': RDGE.rdgeSSAOShader,
	    //								'outputs':[{ 'name':"u_ssaoRT", 'type':"target", 'width':1024, 'height':1024, 'mips':false }],
	    //								'textures':[{ 'type':"tex2d", 'data':"u_depthMap" }],
	    //								'geometrySet':"SCREEN_QUAD",
	    //								'preRender': function()
	    //								 {
	    //									 this.shader.ssao.u_cameraFTR.set(this.renderer.cameraManager().getActiveCamera().getFTR());
	    //								 }
	    //							}
	    //						]
	    //					}
	    //				]
	    //			},
	    //			
	    //			// final pass must always be last in the list
	    //			{
	    //				// this final pass has no output, its shader, however, will render its input (the previous pass's output)
	    //				// to the screen-quad geometry setup under the 'renderList' object
	    //				'name':"finalPass",
	    //				'geometrySet':"SCREEN_QUAD",
	    //		        'textures':[{ 'type':"tex2d", 'data':"u_glowFinal" }, { 'type':"tex2d", 'data':"u_ssaoRT" }, { 'type':"tex2d", 'data':"u_shadowMap" }],
	    //				'shader': RDGE.rdgeScreenQuadShaderDef,
	    //			}
	    //		]
	};

    // a graph of render passes to process in order to produce a final output
    this.renderGraph = new RDGE.jpassGraph(this.defaultPassDef);
    //this.renderGraph.shadowDepthMap.camera = this.mainLight;

    this.animstack = [];
    this.pushAnim = function (anim) {
        this.animstack.push(anim);
    };

    this.popAnim = function (anim) {
        this.animstack.pop();
    };

    this.playAnim = function (anim) {
        this.popAnim();
        this.pushAnim(anim);
    };

    this.stopAllAnims = function () {
        this.animstack = [];
    };

    this.jdefShaderProgram = new RDGE.jshader();
    this.jdefShaderProgram.def = RDGE.rdgeDefaultShaderDefintion;
    this.jdefShaderProgram.init();

    //this.defaultRenderProc = new RDGE.DefaultRender();

    mapping = new Array();
    mapping.process = function (trNode, parent) {
        mapping[trNode.name] = trNode;
    };
    this.Traverse(mapping);

    this.findNode = function (name) {
        return mapping[name];
    };

    /*
    *	scene traversal functor for finding a node by name
    */
    findNodeByName = function (nodeName) {
        this.result = null;
        this.process = function (node, parent) {
            if (node.name == nodeName) {
                this.result = node;
            }
            return true;
        }

        this.init = function () { this.result = null; }
    };

    /*
    *	scene traversal functor for creating a list of node with a given name
    */
    buildNodeList = function (nodeName) {
        this.result = [];
        this.process = function (node, parent) {
            if (node.name == nodeName) {
                this.result.push(node);
            }
            return true;
        }
        this.init = function () { this.result = []; }
    };

    /*
    *	scene traversal functor for creating a list of nodes based on a regular expression
    */
    buildNodeListRegex = function (re) {
        this.result = [];
        this.process = function (node, parent) {
            if (re.test(node.name)) {
                this.result.push(node);
            }
            return true;
        }
        this.init = function () { this.result = []; }
    };

    /*
    *	scene traversal functor for importing a previously exported json scene
    */
    importScene = function () {
        this.renderer = RDGE.globals.engine.getContext().renderer;

        this.process = function (node, parent) {
            node.parent = parent;

            if (node.nodeType === RDGE.rdgeConstants.nodeType.TRNODE) {
                node.transformNodeTemplate = undefined;
                RDGE.verifyTransformNode(node);

                if (node.materialNode) {
                    node.materialNode.materialNodeTemplate = undefined;
                    RDGE.verifyMaterialNode(node.materialNode);

                    if (node.materialNode.shaderProgram) {
                        var shader = new RDGE.jshader();
                        shader.def = JSON.parse(node.materialNode.shaderProgram);
                        shader.init();
                        node.materialNode.shaderProgram = shader;
                    }

                    var texList = node.materialNode.textureList;
                    for (var i = 0, len = texList.length; i < len; ++i) {
                        texList[i].handle = this.renderer.getTextureByName(texList[i].handle.lookUpName, texList[i].handle.texparams.wrap, texList[i].handle.texparams.mips);
                    }

                    var lights = node.materialNode.lightChannel;
                    for (var i = 0, len = lights.length; i < len; ++i) {
                        if (lights[i]) {
                            lights[i].lightNodeTemplate = undefined;
                            RDGE.verifyLightNode(lights[i]);
                        }
                    }
                }

                // load meshes into context
                for (var i = 0, len = node.meshes.length; i < len; ++i) {
                    var mesh = RDGE.globals.meshMan.getModelByName(node.meshes[i].mesh.name);
                    //					mesh.primitive.built = false;
                    this.renderer.createPrimitive(mesh.primitive);
                }
            }

            return true;
        };

        this.init = function () { this.result = []; }
    };

    /*
    *	helper comparison functions
    */
    __compareLessThan = function (a, b) {
        return a < b;
    };
    __compareGreaterThan = function (a, b) {
        return a > b;
    };

    /*
    *	scene traversal functor for creating a sorted list
    */
    insertIntoSortedList = function (list, item, comparator) {
        // insert at the end
        list.push(item);

        var len = list.length;

        // get the active camera
        var cam = RDGE.globals.engine.getContext().renderer.cameraManager().getActiveCamera();

        // camera z plane
        var look = [cam.world[8], cam.world[9], cam.world[10]];
        // to object vector
        var toObject = [cam.world[12] - item.node.world[12], cam.world[13] - item.node.world[13], cam.world[14] - item.node.world[14]];

        // get the distance from object to cameras' 'z' plane
        item.depth = RDGE.vec3.dot(look, toObject);

        // walk down the list of object moving the current item into place until the comparison fails		
        var i = len - 1;
        var temp = null;
        for (; i > 0; --i) {
            if (comparator(item.depth, list[i - 1].depth)) {
                temp = list[i - 1]
                list[i - 1] = list[i];
                list[i] = temp;
            }
            else {
                break;
            }
        }
    };

    /*
    *	Helper function to generate a culled list of geometry for shadow mapping from the mainLights point of view
    */
    shadowCullPass = function (cameraLight, sortCat, compareFunc) {
        this.result = [];
        this.activeCam = cameraLight;
        this.bucketType = sortCat;
        this.compare = compareFunc;

        this.process = function (node, parent) {
            // test visibility
            if (node.bbox_world && node.bbox_world.isValid()) {
                if (!node.bbox_world.isVisible(this.activeCam.frustum)) {
                    return false;
                }
            }

            if (node.materialNode && node.materialNode.sortCategory == this.bucketType) {
                insertIntoSortedList(this.result, { 'context': new RDGE.RenderContext(), 'node': node, 'parent': parent }, this.compare);
            }

            return true;
        }
        this.init = function () { this.result = []; }
    };

    /*
    *	Helper function to create a list sorted front to back as would be used by an opaque render list
    *	note: this is an insertion sort designed to create a new sorted list, not sort an existing list (optimization)
    */
    insertFrontToBack = function (list, item) {
        insertIntoSortedList(list, item, __compareLessThan);
    };

    /*
    *	Helper function to create a list sorted back to front as would be used by an transparent render list
    *	note: this is an insertion sort designed to create a new sorted list, not sort an existing list (optimization)
    */
    insertBackToFront = function (list, item) {
        insertIntoSortedList(list, item, __compareGreaterThan);
    };

    // sort map
    this.sortFunc = [];
    this.sortFunc[this.bckTypes.BACKGROUND] = function (list, item) { list.push(item); };
    this.sortFunc[this.bckTypes.OPAQUE] = insertFrontToBack;
    this.sortFunc[this.bckTypes.TRANSPARENT] = insertBackToFront;
    this.sortFunc[this.bckTypes.ADDITIVE] = insertBackToFront;
    this.sortFunc[this.bckTypes.TRANSLUCENT] = insertBackToFront;
    this.sortFunc[this.bckTypes.FOREGROUND] = function (list, item) { list.push(item); };
};

/*
*  functor must have 'process(node, parent)' function defined, it takes a scene transform node, and the parent
*/
RDGE.SceneGraph.prototype.Traverse = function (functor, isDepthFirst) {
    if (this.scene == null) {
        window.console.log("traversing a NULL scene!");
        return;
    }

    if (functor.init)
        functor.init();

    if (isDepthFirst) {
        this._TraverseDFHelper(functor, this.scene);
    }
    else {
        this._TraverseBFHelper(functor, this.scene);
    }
};

/*
* adds a transform node under the root of the scene
*/
RDGE.SceneGraph.prototype.addNode = function (trNode) {
    RDGE.verifyTransformNode(trNode);

    this.scene.children.push({ transformNode: trNode });
};

/*
* adds a transform node under the root of the scene
*/
RDGE.SceneGraph.prototype.insertUnder = function (targetNode, newNode) {
    RDGE.verifyTransformNode(targetNode);

    targetNode.insertAsChild(newNode);
};

/*
* adds a transform node under the root of the scene
*/
RDGE.SceneGraph.prototype.insertAbove = function (targetNode, newNode) {
    RDGE.verifyTransformNode(targetNode);

    targetNode.insertAsParent(newNode);
};

/*
* locates a node by name
* @return returns the node if found or null otherwise
*/
RDGE.SceneGraph.prototype.getNode = function (nodeName) {
    var functor = new findNodeByName(nodeName);
    this.Traverse(functor, true);

    return functor.result;
};

/*
* locates a node by name
* @return returns a list of all node with the name requested
*/
RDGE.SceneGraph.prototype.getNodes = function (nodeName) {
    var functor = new buildNodeList(nodeName);
    this.Traverse(functor, true);

    return functor.result;
};

/*
* locates a node by name
* @return returns a list of all node with the name requested
*/
RDGE.SceneGraph.prototype.getNodesRegex = function (re) {
    if (typeof re == "string") {
        re = new RegExp(re);
    }

    var functor = new buildNodeListRegex(re);
    this.Traverse(functor, true);

    return functor.result;
};

/*
*  Depth first Traverse helper
*/
RDGE.SceneGraph.prototype._TraverseDFHelper = function (functor, node, parent) {
    if (node.children != 'undefined') {
        var queue = [];

        queue.push({ 'node': node, 'parent': null });

        while (queue.length > 0) {
            // pop the head and process it
            var trNode = queue.pop();
            var tr = trNode.node;
            var parent = trNode.parent;

            if (tr.transformNode !== undefined) {
                tr = tr.transformNode;
                if (functor.process(tr, parent) === false) {
                    continue;
                }
            }

            if (tr.children === undefined)
                continue;

            // push on kids
            for (var kid = 0; kid < tr.children.length; ++kid) {
                queue.push({ 'node': tr.children[kid], 'parent': tr });
            }
        }
    }
};

/*
*  Depth first post process Traverse helper
*/
RDGE.SceneGraph.prototype._TraverseDFPostOrderHelper = function (functor, node, parent) {
    if (node.children != 'undefined') {
        var queue = [];

        queue.push({ 'node': node, 'parent': null });

        var top = queue.length;

        while (top > 0) {

            top = queue.length;

            var topNode = tr.children[top - 1];

            var len = topNode.children == undefined ? 0 : topNode.children.length;

            // push on children
            for (var child = 0; child < len; ++child) {
                queue.push({ 'node': tr.children[child], 'parent': tr });
            }

            // did we push anything on?
            if (len > 0)
                continue;

            // pop the head and process it
            var trNode = queue.pop();
            var tr = trNode.node;
            var parent = trNode.parent;

            if (tr.transformNode !== undefined) {
                tr = tr.transformNode;
                functor.process(tr, parent);
            }
        }
    }
};

/*
*  Depth first post process Traverse helper
*/
RDGE.SceneGraph.prototype.BuildBVHHelper = function (node) {
    if (node.children != 'undefined') {
        if (node.bbox_world)
            node.bbox_world.reset();
        else
            node.bbox_world = new RDGE.box();

        if (node.local == undefined) {
            node.local = RDGE.mat4.identity();
        }

        var queue = [];

        var idIndex = 0;
        node.id = "root";
        queue.push({ 'node': node, 'xfrm': RDGE.mat4.identity(), 'parent': null, 'visited': false });

        var top = queue.length;
        var topIndex = 0;

        while (top > 0) {
            // update the top
            top = queue.length;
            topIndex = top - 1;

            var curNode = queue[topIndex].node.transformNode == undefined ? queue[topIndex].node : queue[topIndex].node.transformNode;
            var parentXfrm = queue[topIndex].xfrm;
            var parent = queue[topIndex].parent;
            var visited = queue[topIndex].visited;
            if (curNode.id == undefined) curNode.id = "id" + idIndex;

            if (!visited) {
                // Copy the parent's world mat and setup bounding box
                if (curNode.local !== undefined) {

                    if (curNode.bbox_world)
                        curNode.bbox_world.reset();
                    else
                        curNode.bbox_world = new RDGE.box();

                    var bbox = this.GetBBoxForNode(curNode);

                    // transform child node by parent
                    curNode.world = RDGE.mat4.mul(curNode.local, parentXfrm);

                    if (bbox) {
                        // update bounding box position			
                        curNode.bbox_world = bbox.transform(curNode.world);
                    }

                    // make sure the nodes have a bounding volume so they dont impede the propagation
                    if (!bbox || !bbox.isValid()) {
                        var dummybb = new RDGE.box();
                        dummybb.set(0, 0);
                        curNode.bbox_world = dummybb;
                    }

                }

                // child count
                var len = curNode.children == undefined ? 0 : curNode.children.length;

                // push on children
                for (var child = 0; child < len; ++child) {
                    queue.push({ 'node': curNode.children[child], 'xfrm': curNode.world, 'parent': curNode, 'visited': false });
                }

                idIndex++;

                // did we push anything on if so then this is not a leaf and we dont pop?
                if (len > 0)
                    continue;
            }

            // propagate the bounding volume up the hierarchy
            if (parent && parent.bbox_world && parent.bbox_world.isValid()
				&& curNode.bbox_world && curNode.bbox_world.isValid()) {
                parent.bbox_world.addBox(curNode.bbox_world);
            }

            // remove top node
            queue.pop();

            // update the top
            top = queue.length;

            if (top > 0) {
                // if the previous node in the stack/queue was the parent of this node, then mark the parent as visited
                var prevNode = queue[top - 1].node.transformNode == undefined ? queue[top - 1].node : queue[top - 1].node.transformNode;

                if (prevNode.id == parent.id)
                    queue[top - 1].visited = true;
            }
        }
    }
};


/*
*  Breadth first Traverse helper
*/
RDGE.SceneGraph.prototype._TraverseBFHelper = function (functor, node) {

    if (node.children != 'undefined') {
        var queue = [];

        queue.push({ 'node': node, 'parent': null });

        while (queue.length > 0) {
            // pop the head and process it
            var trNode = queue.shift();
            var tr = trNode.node;
            var parent = trNode.parent;

            if (tr.transformNode !== undefined) {
                tr = tr.transformNode;
                functor.process(tr, parent);
            }

            if (tr.children === undefined)
                continue;

            // push on kids
            for (var kid = 0; kid < tr.children.length; ++kid) {
                queue.push({ 'node': tr.children[kid], 'parent': tr });
            }
        }
    }
};

/*
*  Update the scene
*/
RDGE.SceneGraph.prototype.update = function (dt) {
    var renderer = RDGE.globals.engine.getContext().renderer;
    RDGE.globals.engine.getContext().debug.mat4CallCount = 0;

    // animation update...
    var i = this.animstack.length - 1;
    while (i >= 0) {
        this.animstack[i].step(dt);
        --i;
    }

    this.BuildBVHHelper(this.scene);

    RDGE.g_particleSystemManager.update(dt);

    var activeCam = renderer.cameraManager().getActiveCamera();
    if (activeCam !== undefined && activeCam != null && activeCam.controller != null && activeCam.controller.world !== undefined) {
        activeCam.setWorld(activeCam.controller.world);
    }
    this.tick++;
};

/*
*  Render the scene
*/
RDGE.SceneGraph.prototype.render = function (renderProc, forceThisProc) {
    if (this.scene.children.length == 0)
        return;

    var renderer = RDGE.globals.engine.getContext().renderer;

    RDGE.rdgeGlobalParameters.u_shadowLightFarZ.set([this.mainLight.zFar()]);

    this.renderList = this._RenderDFHelper(renderer, renderProc, this.scene, forceThisProc);

    if (this.shadowsEnabled) {
        this.Traverse(this.shadowCuller, true);
        this.shadowRenderList = this.shadowCuller.result;
    }

    this.renderGraph.render(this);

    RDGE.g_particleSystemManager.render();
};

/*
*  Returns the bbox for the passed node, if present
*/
RDGE.SceneGraph.prototype.GetBBoxForNode = function (tr) {
    var bbox = null;

    if (tr.materialNode && tr.materialNode.meshNode) {
        var mesh = tr.materialNode.meshNode.mesh;
        var model = null;

        model = RDGE.globals.meshMan.getModelByName(mesh.name);

        if (model != null)
            bbox = model.bbox;
    }

    return bbox;
};

/*
*  Depth first Traverse Render helper
*/

RDGE.SceneGraph.prototype._RenderDFHelper = function (renderer, renderProc, node, forceThisProc) {
    renderList = [];
    renderList[this.bckTypes.BACKGROUND] = []; //BACKGROUND	
    renderList[this.bckTypes.OPAQUE] = []; //OPAQUE		
    renderList[this.bckTypes.TRANSPARENT] = []; //TRANSPARENT
    renderList[this.bckTypes.ADDITIVE] = []; //ADDITIVE
    renderList[this.bckTypes.TRANSLUCENT] = []; //TRANSLUCENT
    renderList[this.bckTypes.FOREGROUND] = []; //FOREGROUND

    if (node.children != 'undefined') {
        var queue_bf = [];

        //
        // Render Pass
        //
        // the context - default settings
        var _Ctx = RDGE.globals.engine.defaultContext;

        // last depth in tree
        var lastAppliedID = 0;

        var isRoot = true, isVisible = true, contextDirty = true;

        queue_bf.push({ 'node': node, 'curCtx': _Ctx });

        var activeCam = renderer.cameraManager().getActiveCamera();

        while (queue_bf.length > 0) {

            isVisible = true;

            // pop the head and process it
            var trNode = queue_bf.pop();
            var tr = trNode.node;


            // default context
            var curCtx = new RDGE.RenderContext();
            curCtx.Load(trNode.curCtx);

            // flatten out matrices gather render context from material and render
            if (tr.transformNode !== undefined) {

                tr = tr.transformNode; // if transform exist we need to use it as our current node to check for kids

                if (tr.hide !== undefined && tr.hide == true) {
                    continue;
                }

                // test visibility
                if (this.frustumCulling && tr.bbox_world && tr.bbox_world.isValid()) {
                    if (!tr.bbox_world.isVisible(activeCam.frustum)) {
                        continue;
                    }
                }

                curCtx.shaderProg = this.jdefShaderProgram;

                var renderBucket = RDGE.rdgeConstants.categoryEnumeration.OPAQUE;

                // get material if its available
                if (tr.materialNode) {
                    renderBucket = tr.materialNode.sortCategory;

                    // set shader to use
                    if (tr.materialNode.shaderProgram !== undefined) {
                        curCtx.shaderProg = tr.materialNode.shaderProgram; // use whats on the node if we are not beinged forced
                    }

                    if (tr.materialNode.textureList !== undefined) {
                        curCtx.textureList = tr.materialNode.textureList.slice();
                    }

                    if (tr.materialNode.uniforms.length > 0) {
                        curCtx.uniforms = tr.materialNode.uniforms.slice();
                    }

                    var len = tr.materialNode.lightChannel.length;
                    for (var i = 0; i < len; ++i) {
                        if (tr.materialNode.lightChannel[i])
                            curCtx.lights[i] = tr.materialNode.lightChannel[i];
                    }
                }

                // push onto deferred render list
                this.sortFunc[renderBucket](renderList[renderBucket], { 'context': curCtx, 'node': tr, 'parent': parent });
            }

            if (tr.children === undefined)
                continue;

            // push on kids
            var numKids = tr.children.length;
            for (var kid = 0; kid < numKids; ++kid) {
                queue_bf.push({ 'node': tr.children[kid], 'curCtx': curCtx });
            }

        }
    }

    return renderList;
};

RDGE.SceneGraph.prototype.enableShadows = function (areEnabled) {
    if (areEnabled) {
        var renderer = RDGE.globals.engine.getContext().renderer;

        this.shadowCuller = new shadowCullPass(this.mainLight, RDGE.rdgeConstants.categoryEnumeration.OPAQUE, function (a, b) { return a < b; });

        this.mainLight.init();
        // lights position and point of view
        this.mainLight.setPerspective(45.0, renderer.vpWidth / renderer.vpHeight, 1.0, 200.0);
        this.mainLight.setLookAt([-60, 17, -15], [-5, -5, 15], RDGE.vec3.up());

        // setup light params
        RDGE.rdgeGlobalParameters.u_shadowLightWorld.set(this.mainLight.world);
        RDGE.rdgeGlobalParameters.u_vShadowLight.set(this.mainLight.view);
        var shadowMatrix = RDGE.mat4.identity();
        shadowMatrix = RDGE.mat4.scale(shadowMatrix, [0.5, 0.5, 0.5]);
        shadowMatrix = RDGE.mat4.translate(shadowMatrix, [0.5, 0.5, 0.5]);
        RDGE.rdgeGlobalParameters.u_shadowBiasMatrix.set(shadowMatrix);
        var BiasProjViewMat = RDGE.mat4.mul(this.mainLight.proj, shadowMatrix);
        BiasProjViewMat = RDGE.mat4.mul(this.mainLight.view, BiasProjViewMat);
        RDGE.rdgeGlobalParameters.u_shadowBPV.set(BiasProjViewMat);

        this.shadowsEnabled = true;
    }
    else {
        this.mainLight = null;
        this.shadowsEnabled = false;
    }
};


RDGE.SceneGraph.prototype.exportJSON = function () {
    objMap = [];

    function replacer(key, value) {
        if (key == 'bbox_world') {
            return null;
        }
        //		else if(key === 'image')
        //		{
        //			return "image";
        //		}
        else if (key === 'parent') {
            return "parent";
        }

        //		for(var i = 0, len = objMap.length; i < len; ++i)
        //		{
        //			if((value && typeof value === "object" && !value.jsonExportName && value === objMap[i]) || (value && value.baseURI !== undefined))
        //			{
        //				return 'replaced';
        //			}
        //		}
        //    
        //		if(value && value.baseURI === undefined && typeof value === "object" && !value.lookUpName)
        //			objMap.push(value);

        return value;
    }

    var val = { 'scene': null, 'meshes': null };
    val.scene = JSON.stringify(this.scene, replacer);

    val.meshes = RDGE.globals.meshMan.exportJSON();

    val = JSON.stringify(val);

    return val;
};

RDGE.SceneGraph.prototype.importJSON = function (jsonScene) {
    try {
        if (jsonScene) {
            var sceneImport = JSON.parse(jsonScene);

            if (sceneImport) {
                this.scene = JSON.parse(sceneImport.scene);

                if (sceneImport.meshes) {
                    RDGE.globals.meshMan.importJSON(sceneImport.meshes);
                }

                if (this.scene) {
                    // traverse the scene, re-creating missing components
                    var importer = new importScene();
                    this.Traverse(importer, true);

                    window.console.log("scene imported");
                }
            }
        }
    } catch (e) {
        window.console.error("error importing JSON scene: " + e.description);
    }
};
