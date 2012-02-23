/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


/*
 *	Creates a unique node id
 */
 nodeIdGen = {};
 
 nodeIdGen.counter = 0;
 
 nodeIdGen.getId = function()
 {
	return  "gen_" + nodeIdGen.counter++;
 }

/*
 *	Constructs a new transform node
 */
function createTransformNode(nodeName)
{
	node = { 'name': nodeName };
	
	node.transformNodeTemplate = new transformNodeTemplate(node);
	
	return node;
}

/*
 *	Constructs a new material node
 */
function createMaterialNode(nodeName)
{
	node = { 'name': nodeName };
	
	node.materialNodeTemplate = new materialNodeTemplate(node);
	
	return node;
}

/*
 *	Constructs a new mesh node
 */
function createMeshNode(nodeName, primitive)
{
	meshNode = { 'mesh':{}, 'meshNodeTemplate':{} };
	
	var renderer = g_Engine.getContext().renderer;
		
	if(!primitive.built)
    {
        renderer.createPrimitive(primitive);
    }

    var model = g_meshMan.getModelByName(nodeName);
    if(!model)
    {
        meshNode.mesh.meshNodeTemplate = new meshNodeTemplate(meshNode.mesh, primitive, nodeName);

        g_meshMan.modelMap[nodeName] = meshNode.mesh;
        return meshNode; // --early out--
    }
    else if(!renderer.buffers[model.primitive.buffersID])
	{
		renderer.createPrimitive(model.primitive);
	}
	
    meshNode.mesh.meshNodeTemplate = new meshNodeTemplate(meshNode.mesh, model.primitive, nodeName);
	
	
	return meshNode;
}

/*
 *	Construct a light node
 */
function createLightNode(nodeName)
{
    node = { 'name': nodeName };
	node.lightNodeTemplate = new lightNodeTemplate(node);
	
	return node;
}

/*
 *	creates a specialized mesh node representing a screen aligned quad with identity transform
 */
function createScreenQuadNode()
{
	var trNode = createTransformNode();
	trNode.attachMeshNode("screenQuad", createScreenAlignedQuad());
	return trNode; 
}

function verifyTransformNode( node )
{
    if(node.transformNodeTemplate == undefined)
    {
        node.transformNodeTemplate = new transformNodeTemplate(node);
    }
}

function verifyMaterialNode( node )
{
    if(node.materialNodeTemplate == undefined)
    {
        node.materialNodeTemplate = new materialNodeTemplate(node);
    }
}

function verifyLightNode( node )
{
    if(node.lightNodeTemplate == undefined)
    {
        node.lightNodeTemplate = new lightNodeTemplate(node);
    }
}


/*
 *	Takes an object and attachs transform node
 *	functions and fields if they are not defined
 */
transformNodeTemplate = function(trNode)
{
    // Lots of checking for things that might exist and adding them when they don't
    
    /* ------------------------------------------- */
	if(!trNode.children)
	{
		trNode.children = [];
	}
	
	if(!trNode.local)
	{
		trNode.local = mat4.identity();
	}
	
	if(!trNode.world)
	{
		trNode.world = mat4.identity();
	}
	
	if(!trNode.id)
	{
		trNode.id = nodeIdGen.getId();
	}
	
	if(!trNode.name)
	{
		trNode.name = "xfrmNode" + trNode.id;
	}
	
	if(!trNode.parent)
	{
	    trNode.parent = null;
	}
		
	if(!trNode.meshes)
	{
		trNode.meshes = [];
	}
	
	if(!trNode.nodeType)
	{
		trNode.nodeType = rdgeConstants.nodeType.TRNODE;
	}
	
    /* ------------------------------------------- */
    
    // Adding functions to the node none of these exist from export process	
	/*
	 *	Attaches a material to a node
	 */
	trNode.attachMaterial = function(matNode)
	{
	    verifyMaterialNode(matNode);
	    
		this.materialNode = matNode;
	}
	
	/*
	 *	@param node - the node to attach, can optionally be a node name paired with a primitive that will be built into a meshNode
	 *	@param primitive - an optional parameter that must be supplied if the node is a name and not an object
	 */
	trNode.attachMeshNode = function( node, primitive )
	{
		if(typeof node == "string")
		{
		    node = createMeshNode(node, primitive)
	    }
	    if(trNode.materialNode == undefined)
		{
			trNode.materialNode = createMaterialNode(trNode.name + "|defMaterial");
		}
	    
		trNode.meshes.push( {'mesh':{'name':node.mesh.attribs.name, 'id':node.mesh.attribs.id}});
	}
	
	/*
	 *	Inserts a node as a child of this node
	 */
	trNode.insertAsChild = function(transNode)
	{
	    if(this == transNode)
	        return;
	        
	   verifyTransformNode(transNode);
	    
	    transNode.parent = this;
	    this.children.push({transformNode:transNode});
	}
	
	/*
	 *	Inserts a node as the parent of this node
	 */
	trNode.insertAsParent = function(transNode)
	{
	    if(this == transNode)
	        return;
	        
	    verifyTransformNode(transNode);
	    
	    if(this.parent)
	    {
	        // remove this node from current parents list
	        var len = this.parent.children.length;
	        for(var i = 0; i < len;  ++i)
	        {
	            if(this.parent.children[i].transformNode != undefined)
	            {
	                tr = this.parent.children[i].transformNode;
	                if(tr.id == this.id)
	                {
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
	}

}


// add material handlers to a material node
materialNodeTemplate = function(matNode)
{
	// enumerate constants

	// type definitions
	TEX_DIF  = 0;
	TEX_SPEC = 1;
	TEX_NORM = 2;
	TEX_GLOW = 3;
	
	if(!matNode.nodeType)
	{
		matNode.nodeType = rdgeConstants.nodeType.MATNODE;
	}
	
	MATERIAL_MAX_LIGHTS = rdgeConstants.MAX_MATERIAL_LIGHTS;
	
	if(!matNode.lightChannel)
	{
		matNode.lightChannel = 
		[
			null,
			null,
			null,
			null
		];
	}
	
	/*
	 *	Material categories determine sorting
	 */
	if(!matNode.sortCategory)
	{
		matNode.sortCategory = rdgeConstants.categoryEnumeration.OPAQUE;
	}
	
	/*
	 *	every node has an id either generated by export or generated here
	 */
	if(!matNode.id)
	{
		matNode.id = nodeIdGen.getId();
	}
	
	/*
	 *	every node has an name either setin art pipeline or generated here
	 */
	if(!matNode.name)
	{
		matNode.name = "matNode" + matNode.id;
	}
	
	/*
	 *	Default list of textures if nothing is set
	 */
	if(!matNode.textureList)
	{
		var renderer = g_Engine.getContext().renderer;
	    matNode.textureList = 
	    [
	        {'name':"colMap",	'handle':renderer.getTextureByName("assets/images/white"),         'unit': TEX_DIF,    "type":UNIFORMTYPE.TEXTURE2D},
		    {'name':"envMap",	'handle':renderer.getTextureByName("assets/images/material_paint"),'unit': TEX_SPEC,   "type":UNIFORMTYPE.TEXTURE2D},
		    {'name':"normalMap",'handle':renderer.getTextureByName("assets/images/blue"),          'unit': TEX_NORM,   "type":UNIFORMTYPE.TEXTURE2D},
		    {'name':"glowMap",	'handle':renderer.getTextureByName("assets/images/black"),         'unit': TEX_GLOW,   "type":UNIFORMTYPE.TEXTURE2D}
	    ];
	}
	
	if(!matNode.uniforms)
	{
	    matNode.uniforms = [];
	}
	
	matNode.setTexture = function(texType, texName)
	{
		var renderer = g_Engine.getContext().renderer;
		this.textureList[texType].handle = renderer.getTextureByName("assets/images/" + texName);
	    this.textureList[texType].unit = texType;
		this.textureList[texType].type = UNIFORMTYPE.TEXTURE2D;
		
	}

	matNode.setDiffuseTexture = function(texName)
	{
		this.setTexture(TEX_DIF, texName);
	}
	
	matNode.setSpecTexture = function(texName)
	{
		this.setTexture(TEX_SPEC, texName);
	}
	
	matNode.setNormalTexture = function(texName)
	{
		this.setTexture(TEX_NORM, texName);
	}
	
	matNode.setGlowTexture = function(texName)
	{
		this.setTexture(TEX_GLOW, texName);
	}
	
	matNode.setUniform = function(name, arrValue)
	{
		var len = this.uniforms.length;
		for(var i = 0; i < len; ++i)
		{
			if(this.uniforms[i].name == name)
			{
				this.uniforms[i].value = arrValue;
				return;
			}
		}
		
		window.console.log("Could not find uniform: " + name);
	}
	
	matNode.setShader = function( jshaderObject )
	{
		this.shaderProgram = jshaderObject;
	}
	
	matNode.setSortCategory = function( materialCat )
	{
		matNode.sortCategory = materialCat;
	}
	
	/*
	 * Sets a light channel reference to a lightNode
	 * @param channelNumber a number indicating whick light to turn on (0 - 3), or an array of numbers if multiple lights being set
	 * @param lightNode - a refernce to a light node object or an array lights
	 */
	matNode.enableLightChannel = function( channelNumber, lightNode )
	{
		verifyLightNode(lightNode);
		
		// set an array
		if(typeof channelNumber == "object")
		{
			var len = channelNumber.length;
			var maxLight = lightNode.length != undefined ? lightNode.length : 0;
			for(var i = 0; i < len; ++i)
			{
			
				matNode.lightChannel[channelNumber] = maxLight > 0 ? lightNode[ Math.min(i, maxLight - 1)] : lightNode;
			}
		}
		else // set an individual light
		{
			if(channelNumber < MATERIAL_MAX_LIGHTS)
				matNode.lightChannel[channelNumber] = lightNode;
		}
	}

	
	matNode.disableLightChannel = function( channelNumber )
	{
		if(typeof channelNumber != "object")
		{
			var len = channelNumber.length;
			
			for(var i = 0; i < len; ++i)
			{
				if(channelNumber[i] , MATERIAL_MAX_LIGHTS)
					matNode.lightChannel[channelNumber[i]] = null;
			}
		}
		else
		{
			if(channelNumber < MATERIAL_MAX_LIGHTS)
				matNode.lightChannel[channelNumber] = null;
		}
		
	}
	
	matNode.disableAllLights = function()
	{
		for(var i = 0; i < MATERIAL_MAX_LIGHTS; ++i)
		{
			matNode.lightChannel[i] = null;
		}
	}
	
		
	matNode.toJSON = function()
	{
		var jsonObj = {'jsonExportName':"materialNode"};
		for(var member in this)
		{
			jsonObj[member] = this[member];
			
			if(member === "textureList")
			{
				var texList = jsonObj[member];
				for(var i = 0, len = texList.length; i < len; ++i)
				{
					texList[i].handle.image = texList[i].handle.lookUpName; 
				}
			}
			else if(member === "shaderProgram")
			{
				// test that the shader hasn't already been exported
				if(typeof jsonObj[member] != "string")
				{
					jsonObj[member] = jsonObj[member].exportShader();
				}
			}
		}
		
		return jsonObj;
	}
}


meshNodeTemplate = function( meshNode, primitive, meshName )
{
    if(!primitive.built)
    {
        renderer.createPrimitive(primitive);
    }
    
    if(!meshNode.nodeType)
	{
		meshNode.nodeType = rdgeConstants.nodeType.MESHNODE;
	}
    
    if(!meshNode.attribs)
    {
        var newID = nodeIdGen.getId();
        
        meshNode.attribs = { 'id': newID,
        'indexCount': primitive.indexCount,
        'name': meshName,
        'vertCount': primitive.posCount};
        
        meshNode.name = meshName;
    }
    
    if(!meshNode.bbox)
    {
        meshNode.bbox = new box();
    }
    
    meshNode.data = null;
    
    meshNode.primitive = primitive;
    
    // setup bounding box
    var numPositions = primitive.posCount;
  
    if(numPositions > 0)
    {
        var positions = primitive.positions;
        
        var idx = 0;
        while (idx < numPositions - 2)
        {
          var thisPos = [positions[idx+0], positions[idx+1], positions[idx+2]];
          meshNode.bbox.addVec3(thisPos);
          idx += 3;
        }
    }
    else
    {
		window.console.error("mesh " + meshNode.attribs.name + ": bounding volume not created");
    }
}

lightNodeTemplate = function(lightNode)
{
	if(!lightNode.nodeType)
	{
		lightNode.nodeType = rdgeConstants.nodeType.LIGHTNODE;
	}
	
    if(!lightNode.id)
    {
        lightNode.id = nodeIdGen.getId();
    }
    
    if(!lightNode.name)
    {
        lightNode.name = "light_" + lightNode.id;
    }
    
    if(!lightNode.typeName)
    {
        lightNode.typeName = "dir_light";
    }
    
    if(!lightNode.castShadow)
    {
        lightNode.castShadow = false;
    }
    
    if(!lightNode.depthMapBias)
    {
        lightNode.depthMapBias = 0.0179;
    }
    
    if(!lightNode.depthMapSize)
    {
        lightNode.depthMapSize = 1024;
    }
    
    if(!lightNode.coneAngle)
    {
        lightNode.coneAngle = 0.707;
    }
    
    if(!lightNode.penumbraAngle)
    {
        lightNode.coneAngle = 0.0;
    }
    
    if(!lightNode.dropOff)
    {
        lightNode.coneAngle = 0.025;
    }
    
    if(!lightNode.color)
    {
        lightNode.color = [1,1,1,1];
    }
    
    if(!lightNode.dir)
    {
        lightNode.dir = [1,-1,1];
    }
    
    if(!lightNode.links)
    {
        lightNode.links = [];
    }
    
    if(!lightNode.position)
    {
        lightNode.position = [0,0,0];
    }
    
    if(!lightNode.lightDiffuse)
    {
        lightNode.lightDiffuse = [1,1,1,1];
    }
    
    if(!lightNode.lightAmbient)
    {
        lightNode.lightAmbient = [0.5,0.5,0.5,1.0];
    }
    
    if(!lightNode.lightSpecular)
    {
        lightNode.lightSpecular = [1,1,1,1];
    }
        
    lightNode.setPosition = function( pos )
    {
		for(var i = 0; i < 3; i++)
		{
			this.position[i] = pos[i];
		}
    }
    
    lightNode.setDiffuseColor = function( color )
    {
		for(var i = 0; i < 4; i++)
		{
			this.lightDiffuse[i] = color[i];
		}
    }
    
    lightNode.setAmbientColor = function( color )
    {
		for(var i = 0; i < 4; i++)
		{
			this.lightAmbient[i] = color[i];
		}
    }
    
    lightNode.setSpecularColor = function( color )
    {
		for(var i = 0; i < 4; i++)
		{
			this.lightSpecular[i] = color[i];
		}
    }
}
