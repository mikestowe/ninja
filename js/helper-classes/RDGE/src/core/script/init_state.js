/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// init the view

var loadTag = document.getElementById("loading");

function LoadState(userRunState, context)
{
    this.name					= "LoadState";
	this.userRunState			= userRunState != undefined ? userRunState : new RDGEState;
	this.hasUserState			= userRunState != undefined ? true : false;
	this.renderer				= context.renderer;
	this.loadingDone			= false;
	this.stateManager			= context.ctxStateManager;
	this.sceneLoadQueue			= [];
	this.textureLoadQueue		= [];
}

LoadState.prototype.loadScene = function(addr, sceneName)
{
	var request = new sceneRequestDef(addr, sceneName);
	request.doSceneRequest = true;
	this.sceneLoadQueue.push( request );
}

LoadState.prototype.loadTexture = function(textureObject)
{
	if(this.stateManager.currentState().name != "LoadState")
	{
		this.stateManager.PushState( this.stateManager.RDGEInitState, "noInit" );
	}
	
	this.textureLoadQueue.push(textureObject);
}

LoadState.prototype.Init = function() 
{
	if(this.sceneName)
	{
		this.loadScene("assets_web/mesh/" + this.sceneName + ".json", this.sceneName);
	}

	if (this.hasUserState && this.userRunState && this.userRunState.onLoadState)
		this.userRunState.onLoadState();
}

LoadState.prototype.ReInit = function() 
{
	if (this.hasUserState && this.userRunState && this.userRunState.onLoadState)
		this.userRunState.onLoadState();
}

LoadState.prototype.Resize = function() 
{
	if(g_Engine.lastWindowWidth == window.innerWidth && g_Engine.lastWindowHeight == window.innerHeight)
	{
		this.userRunState.resize();
		g_Engine.lastWindowWidth = window.innerWidth;
		g_Engine.lastWindowHeight = window.innerHeight;
	}
}

LoadState.prototype.Update = function(dt) 
{
	// for the current scene go through processing steps
	var sceneLoadTop = this.sceneLoadQueue.length - 1;
	var texLoadTop	= this.textureLoadQueue.length - 1;
	
	if(sceneLoadTop > -1)
	{
		var curSceneReq = this.sceneLoadQueue[sceneLoadTop];
		
		// check for completed mesh requests and load the data
		g_meshMan.processMeshData();

		if(curSceneReq.doSceneRequest)
		{
			curSceneReq.requestScene();
		}
		else if(curSceneReq.requestComplete) 
		{
			if(curSceneReq.sceneBeginProcessing) 
			{
				// Load meshes attached to the scene
				curSceneReq.scene = new SceneGraph(curSceneReq.rawData);
				curSceneReq.scene.enableShadows( true );
				g_Engine.AddScene(curSceneReq.name, curSceneReq.scene);

				// setup the scene and save a map of mesh names
				// that will be check off as the meshes load
				curSceneReq.scene.Traverse(curSceneReq.sceneProcessor, false);
				
				// processing is complete
				curSceneReq.sceneBeginProcessing = false;
			}
			// if we are here than the scene is processed but meshes are still loading/processing asynchronously
			else if(curSceneReq.processingComplete())
			{
				// pop the head node
				var sceneReq = this.sceneLoadQueue.shift();
				this.userRunState.onComplete(sceneReq.name, sceneReq.scene);	
			}
		}
		
	}
	
	// load any waiting textures
	while(this.textureLoadQueue.length > 0)
	{
		this.renderer.commitTexture( this.textureLoadQueue.shift() );
	}
	
	// if there is nothing left to load move back to the run state
	if( 0 == this.sceneLoadQueue.length && 0 == this.textureLoadQueue.length )
	{
		// loaded... remove the state
		var stateMan = g_Engine.getContext().ctxStateManager;
		stateMan.PopState();
		
		// Remove loading text
		if(loadTag)
		{
			loadTag.innerHTML="done";
		}
	}
	
	if(g_Engine.getContext().getScene() && g_Engine.getContext().getScene() != "not-ready" && this.stateManager.RDGERunState.initialized)
		this.userRunState.update(dt);	

}

LoadState.prototype.Draw = function() 
{
	this.renderer._clear();
	
	if(g_Engine.getContext().getScene() && g_Engine.getContext().getScene() != "not-ready" && this.stateManager.RDGERunState.initialized)	
		this.userRunState.draw();	
	
}

LoadState.prototype.Shutdown = function() 
{

}

LoadState.prototype.LeaveState = function() 
{
	if(this.userRunState.onComplete != undefined)
	{
		this.userRunState.onComplete();	
	}
}

LoadState.prototype.MakeSceneRequest = function(addr, name) {

	this.hasScene = true;
	this.lastSceneName = name;
    var request = new XMLHttpRequest();
    request.initState = this;
    g_Engine.getContext().sceneGraphMap[name] = "not-ready";
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200 || window.location.href.indexOf("http") == -1) 
            {
                this.initState.scene = eval("(" + request.responseText + ")"); //retrieve result as an JavaScript object
                this.initState.loadingDone = true;
            }
            else 
            {
                alert("An error has occured making the request");
            }
        }
    }

    request.open("GET", addr, true);
    request.send(null);
}

// scene traversal functor to setup the scene
function SetupScene()
{
	this.renderer			= g_Engine.getContext().renderer;
	this.meshLoadingMap		= [];
	this.onMeshLoaded		= function( meshName ) 
	{ 
		// if the mesh was loading (and is defined) mark it as no longer loading
		if(this.meshLoadingMap[meshName])
			this.meshLoadingMap[meshName].stillLoading = false;
	}
	
	// set a call back handler to notify us when a mesh is loaded
	g_meshMan.addOnLoadedCallback( this );
}

SetupScene.prototype.process = function(trNode, parent) 
{
	verifyTransformNode(trNode);

	// create and assign parent node
	trNode.parent = parent;

	if(trNode.local !== undefined)
	{
		trNode.local = mat4.transpose( trNode.local );
	}
  
	if (((trNode.materialNode || {}).meshNode || {}) != 'undefined') 
	{
		if ( trNode.materialNode !== undefined )
		{

			var lookup = g_meshMan.loadMesh(trNode.materialNode.meshNode.mesh);
			
			//~~~~ Hack - the mesh node should be placed in an array of meshes under the transform when exported
			trNode.meshes.push(trNode.materialNode.meshNode);

			// if the mesh is not loaded add it to our map
			if ( lookup == null)
			{
				// mark this mesh as loading
				this.meshLoadingMap[trNode.materialNode.meshNode.mesh.name] = { 'stillLoading':true, 'remotelyLoading':false };
			}
			else
			{
				// just because its in the mesh manager doesn't mean its ready, but
				// if the primitive exists than it is ready to go
				if(lookup.primitive)
				{
					// create the buffer for this renderer
					this.renderer.createPrimitive(lookup.primitive);
				}
				// first see if this scene is the scene already loading this mesh
				else if(!this.meshLoadingMap[trNode.materialNode.meshNode.mesh.name])
				{
					// mark this mesh as loading
					this.meshLoadingMap[trNode.materialNode.meshNode.mesh.name] = { 'stillLoading':true, 'remotelyLoading':true };
				}
					
			}
			
			//add set texture helper function
			verifyMaterialNode(trNode.materialNode);

			var mapLookUp = [];
			mapLookUp["TEX_DIF"]  = {'slot':0, 'uni':"colMap"};   // type to texture slot look up
			mapLookUp["TEX_SPEC"] = {'slot':1, 'uni':"envMap"};
			mapLookUp["TEX_NORM"] = {'slot':2, 'uni':"normalMap"};
			mapLookUp["TEX_GLOW"] = {'slot':3, 'uni':"glowMap"};
      
			// get handle and setup slot bindings
			var texList = trNode.materialNode.textureList;
			var extractedList = [];
			for( var i = 0; i < texList.length ; ++i )
			{
				var handle = this.renderer.getTextureByName(texList[i].name);
				extractedList[i] = {'name':mapLookUp[texList[i].type].uni, 'handle':handle,  'unit':mapLookUp[texList[i].type].slot, 'type':UNIFORMTYPE.TEXTURE2D};
			}
			
			trNode.materialNode.textureList = extractedList;
		}
	}
  
	if((trNode.lightNode || {}) != 'undefined') 
	{
		if(trNode.lightNode !== undefined)
		{
			trNode.lightNode.parent = trNode;
			g_Engine.lightManager.setMapping(trNode.lightNode, trNode.lightNode.links);
		}
	}
}


sceneRequestDef = function(addr, sceneName)
{
	this.name					= sceneName;
	this.addr					= addr;
	this.sceneBeginProcessing	= false;
	this.requestComplete		= false;
	this.sceneProcessor 		= new SetupScene();
	this.doSceneRequest			= false;
	this.rawData;
	this.scene;
	
	/*
	 *	@return - returns true when all meshes for the request are done
	 */
	this.processingComplete = function()
	{
		for(var m in this.sceneProcessor.meshLoadingMap)
		{
			// if a mesh is still loading than loading is not complete
			if(this.sceneProcessor.meshLoadingMap[m].stillLoading == false)
			{
				
				if(this.sceneProcessor.meshLoadingMap[m].remotelyLoading == true)
				{
					// In this case we need to generate the buffers on our render device
					var mesh = g_meshMan.getModelByName(m);
					this.sceneProcessor.renderer.createPrimitive(mesh.primitive);
				}
			}
			else
			{
				return false;				
			}
		}
		
		// loading done
		return true;
	}
	
	this.requestScene = function()
	{
		this.doSceneRequest = false;
		
		var request = new XMLHttpRequest();
		request.handler = this;
		
		// set this scene as not-ready just in case anyone is looking for it
		g_Engine.getContext().sceneGraphMap[name] = "not-ready";
		
		// on request complete - set the flags of this request to trigger the next step in loading
		request.onreadystatechange = function() 
		{
			if (request.readyState == 4) {
				if (request.status == 200 || window.location.href.indexOf("http") == -1) 
				{
					this.handler.rawData = eval("(" + request.responseText + ")"); //retrieve result as an JavaScript object
					this.handler.requestComplete = true;
					this.handler.sceneBeginProcessing = true;
				}
				else 
				{
					alert("An error has occured making the request");
				}
			}
		}
		
		request.open("GET", addr, true);
		request.send(null);
	}
}