/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* 
 * shadow light - a modified camera used to describe a shadow casting light
 */
shadowLight = function() 
{
	// inherit from the base class
	this.inheritedFrom = camera;
	this.inheritedFrom();
	
	// matrices needed for shadow projection
	this.invViewMatrix=mat4.identity();
	this.mvpMatrix=mat4.identity();
	
	// texture matrix
	this.shadowMatrix=mat4.identity();           
	this.shadowMatrix=mat4.scale(this.shadowMatrix,[0.5,0.5,0.5]);
	this.shadowMatrix=mat4.translate(this.shadowMatrix,[0.5,0.5,0.5]);
	
	// cached references
	this.renderer = null;
	this.cameraManager = null;
	
	// shadow bias offset
	this.shadowBias = 0.0195;
	
	this.init = function ()
	{
		this.renderer = g_Engine.getContext().renderer;
		this.cameraManager = this.renderer.cameraManager();
	}
	
	/*
	 *	makes the light the current 'camera'
	 */
	this.activate = function()
	{
		this.cameraManager.pushCamera(this);
	}
	
	/*
	 *	restores the camera stack
	 */
	this.deactivate = function()
	{
		this.cameraManager.popCamera();	
	}
	
}
