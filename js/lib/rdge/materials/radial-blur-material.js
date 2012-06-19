/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Material = require("js/lib/rdge/materials/material").Material;

var RadialBlurMaterial = function RadialBlurMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "Radial Blur";
    this._shaderName = "radialBlur";

    this._defaultTexMap = 'assets/images/cubelight.png';
    this._defaultColor = [1, 0, 0, 1];

    this._time = 0.0;
    this._dTime = 0.01;

    // array textures indexed by shader uniform name
    this._glTextures = [];

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.getName		= function ()	{ return this._name;				};
    this.getShaderName	= function ()	{ return this._shaderName;			};
	this.getShaderDef	= function()	{  return radialBlurMaterialDef;	};
    this.isAnimated		= function ()	{ return true;						};

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this._propNames  = ["u_tex0",		"u_speed"];
    this._propLabels = ["Texture map",	"Speed" ];
    this._propTypes  = ["file",			"float" ];
    this._propValues = [];

    this._propValues[this._propNames[0]] = this._defaultTexMap.slice(0);
    this._propValues[this._propNames[1]] = 1.0;
    ///////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    this.init = function (world) {
        // save the world
        if (world) this.setWorld(world);

        // set up the shader
        this._shader = new RDGE.jshader();
        this._shader.def = radialBlurMaterialDef;
        this._shader.init();

        // set up the material node
        this._materialNode = RDGE.createMaterialNode("radialBlurMaterial" + "_" + world.generateUniqueNodeID());
        this._materialNode.setShader(this._shader);

        this._time = 0;
        if (this._shader && this._shader['default'])
            this._shader['default'].u_time.set([this._time]);

        // set the shader values in the shader
        this.setShaderValues();
        this.setResolution([world.getViewportWidth(), world.getViewportHeight()]);
        this.update(0);
    };


    this.update = function () {
        var material = this._materialNode;
        if (material) {
            var technique = material.shaderProgram['default'];
            var renderer = RDGE.globals.engine.getContext().renderer;
            if (renderer && technique) {
                if (this._shader && this._shader['default']) {
                    this._shader['default'].u_time.set([this._time]);
                }
                this._time += this._dTime;
            }
        }
    };

    this.setResolution = function (res) {
        var material = this._materialNode;
        if (material) {
            var technique = material.shaderProgram['default'];
            var renderer = RDGE.globals.engine.getContext().renderer;
            if (renderer && technique) {
                technique.u_resolution.set(res);
            }
        }
    };
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var radialBlurMaterialDef =
{ 'shaders':
	{
	    'defaultVShader': "assets/shaders/Basic.vert.glsl",
	    'defaultFShader': "assets/shaders/radialBlur.frag.glsl"
	},
    'techniques':
	{
	    'default':
		[
			{
			    'vshader': 'defaultVShader',
			    'fshader': 'defaultFShader',
			    // attributes
			    'attributes':
				{
				    'vert': { 'type': 'vec3' },
				    'normal': { 'type': 'vec3' },
				    'texcoord': { 'type': 'vec2' }
				},
			    // parameters
			    'params':
				{
				    'u_tex0': { 'type': 'tex2d' },
				    'u_time': { 'type': 'float' },
				    'u_speed': { 'type': 'float' },
				    'u_resolution': { 'type': 'vec2' },
				},

			    // render states
			    'states':
				{
				    'depthEnable': true,
				    'offset': [1.0, 0.1]
				}
			}
		]
	}
};


var RaidersMaterial = function RaidersMaterial() {
    // initialize the inherited members
    this.inheritedFrom = RadialBlurMaterial;
    this.inheritedFrom();

    this._name = "Raiders";
    this._shaderName = "raiders";

    this._texMap = 'assets/images/raiders.png';
    this._propValues[this._propNames[0]] = this._texMap.slice(0);


    // duplicate method required
    this.dup = function (world) {
        // allocate a new uber material
        var newMat = new RaidersMaterial();

        // copy over the current values;
        var propNames = [], propValues = [], propTypes = [], propLabels = [];
        this.getAllProperties(propNames, propValues, propTypes, propLabels);
        var n = propNames.length;
        for (var i = 0; i < n; i++)
            newMat.setProperty(propNames[i], propValues[i]);

        return newMat;
    };
}

RaidersMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.RaidersMaterial = RaidersMaterial;
}


RadialBlurMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.RadialBlurMaterial = RadialBlurMaterial;
}

