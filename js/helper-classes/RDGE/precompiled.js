/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/*
 *	A list of shared parameters that all shaders can support (the engine always try to bind these uniforms)
 *	These parameters are compiled into all jshaders and can be set from any jshader
 *	with a call to jshader.global.u_matDiffuse.set([1,0,0,1]) if the jshader depends on that parameter.
 *	To set directly call rdgeGlobalParameters.'param'.set(x), for example rdgeGlobalParameters.u_lightPos.set([1,1,1])
 *	The values can be added to a jshaders params list - this will creating local jshader memory that binds to the parameter
 *	this parameter can be used to set the value for that shader but will not override the global setting
 *	The values set here are the default global values.
 *	note: the rdge_lights substructure can be ignored, the final parameter list contains only the uniform objects
 */

