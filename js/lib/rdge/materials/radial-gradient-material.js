/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var MaterialParser = require("js/lib/rdge/materials/material-parser").MaterialParser;
var Material = require("js/lib/rdge/materials/material").Material;

var RadialGradientMaterial = function RadialGradientMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "RadialGradientMaterial";
    this._shaderName = "radialGradient";

    this._color1 = [1, 0, 0, 1];
    this._color2 = [0, 1, 0, 1];
    this._color3 = [0, 0, 1, 1];
    this._color4 = [0, 1, 1, 1];
    this._colorStop1 = 0.0;
    this._colorStop2 = 0.3;
    this._colorStop3 = 0.6;
    this._colorStop4 = 1.0;
    //	this._colorCount	= 4;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.getName = function () {
        return this._name;
    };

    this.getShaderName = function () {
        return this._shaderName;
    };

    this.getColor1 = function () {
        return this._color1;
    };

    this.setColor1 = function (c) {
        this._color1 = c.slice();
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_color1.set(c);
        }
    };

    this.getColor2 = function () {
        return this._color2;
    };

    this.setColor2 = function (c) {
        this._color2 = c.slice();
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_color2.set(c);
        }

    };

    this.getColor3 = function () {
        return this._color3;
    };

    this.setColor3 = function (c) {
        this._color3 = c.slice();
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_color3.set(c);
        }
    };

    this.getColor4 = function () {
        return this._color4;
    };

    this.setColor4 = function (c) {
        this._color4 = c.slice();
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_color4.set(c);
        }
    };

    this.getColorStop1 = function () {
        return this._colorStop1;
    };

    this.setColorStop1 = function (s) {
        this._colorStop1 = s;
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_colorStop1.set([s]);
        }
    };

    this.getColorStop2 = function () {
        return this._colorStop2;
    };

    this.setColorStop2 = function (s) {
        this._colorStop2 = s;
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_colorStop2.set([s]);
        }
    };

    this.getColorStop3 = function () {
        return this._colorStop3;
    };

    this.setColorStop3 = function (s) {
        this._colorStop3 = s;
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_colorStop3.set([s]);
        }
    };

    this.getColorStop4 = function () {
        return this._colorStop4;
    };

    this.setColorStop4 = function (s) {
        this._colorStop4 = s;
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_colorStop4.set([s]);
        }
    };

    this.getColorCount = function () {
        return this._colorCount;
    };

    this.setColorCount = function (c) {
        this._colorCount = c;
        if (this._shader && this._shader['default']) {
            this._shader['default'].u_colorCount.set([c]);
        }
    };

    this.isAnimated = function () {
        return false;
    };


    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this._propNames = ["color1", "color2", "color3", "color4", "colorStop1", "colorStop2", "colorStop3", "colorStop4", "angle"];
    this._propLabels = ["Color 1", "Color 2", "Color 3", "Color 4", "Color Stop 1", "Color Stop 2", "Color Stop 3", "Color Stop 4", "Angle"];
    this._propTypes = ["color", "color", "color", "color", "float", "float", "float", "float", "float"];
    this._propValues = [];

    this._propValues[this._propNames[0]] = this._color1.slice(0);
    this._propValues[this._propNames[1]] = this._color2.slice(0);
    this._propValues[this._propNames[2]] = this._color3.slice(0);
    this._propValues[this._propNames[3]] = this._color4.slice(0);

    this._propValues[this._propNames[4]] = this._colorStop1;
    this._propValues[this._propNames[5]] = this._colorStop2;
    this._propValues[this._propNames[6]] = this._colorStop3;
    this._propValues[this._propNames[7]] = this._colorStop4;

    this.setProperty = function (prop, value) {
        if (prop === "color") prop = "color1";

        // make sure we have legitimate imput
        var ok = this.validateProperty(prop, value);
        if (!ok) {
            console.log("invalid property in Radial Gradient Material:" + prop + " : " + value);
        }

        switch (prop) {
            case "color1": this.setColor1(value); break;
            case "color2": this.setColor2(value); break;
            case "color3": this.setColor3(value); break;
            case "color4": this.setColor4(value); break;
            case "colorStop1": this.setColorStop1(value); break;
            case "colorStop2": this.setColorStop2(value); break;
            case "colorStop3": this.setColorStop3(value); break;
            case "colorStop4": this.setColorStop4(value); break;
            case "angle": this.setAngle(value); break;
        }

        //this.updateValuesInShader();
    };
    ///////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    // duplcate method requirde
    this.dup = function () {
        return new RadialGradientMaterial();
    };

    this.init = function (world) {
        this.setWorld(world);

        // set up the shader
        this._shader = new RDGE.jshader();
        this._shader.def = radialGradientMaterialDef;
        this._shader.init();

        // set up the material node
        this._materialNode = RDGE.createMaterialNode("radialGradientMaterial" + "_" + world.generateUniqueNodeID());
        this._materialNode.setShader(this._shader);

        // set the shader values in the shader
        this.updateValuesInShader();
    };

    this.updateValuesInShader = function () {
        if (this._shader && this._shader['default']) {
            //this._shader['default'].u_colorCount.set( [4] );

            var c;
            c = this.getColor1();
            this._shader['default'].u_color1.set(c);
            c = this.getColor2();
            this._shader['default'].u_color2.set(c);
            c = this.getColor3();
            this._shader['default'].u_color3.set(c);
            c = this.getColor4();
            this._shader['default'].u_color4.set(c);

            var s;
            s = this.getColorStop1();
            this._shader['default'].u_colorStop1.set([s]);
            s = this.getColorStop2();
            this._shader['default'].u_colorStop2.set([s]);
            s = this.getColorStop3();
            this._shader['default'].u_colorStop3.set([s]);
            s = this.getColorStop4();
            this._shader['default'].u_colorStop4.set([s]);
        }
    };

    this.exportJSON = function () {
        var jObj =
		{
		    'material': this.getShaderName(),
		    'name': this.getName(),

		    'color1': this.getColor1(),
		    'color2': this.getColor2(),
		    'color3': this.getColor3(),
		    'color4': this.getColor4(),
		    'colorStop1': this.getColorStop1(),
		    'colorStop2': this.getColorStop2(),
		    'colorStop3': this.getColorStop3(),
		    'colorStop4': this.getColorStop4()
		};

        return jObj;
    };

    this.importJSON = function (jObj) {
        if (this.getShaderName() != jObj.material) throw new Error("ill-formed material");
        this.setName(jObj.name);

        try {
            var color1 = jObj.color1,
				color2 = jObj.color2,
				color3 = jObj.color3,
				color4 = jObj.color4,
				colorStop1 = jObj.colorStop1,
				colorStop2 = jObj.colorStop2,
				colorStop3 = jObj.colorStop3,
				colorStop4 = jObj.colorStop4;

            this.setProperty("color1", color1);
            this.setProperty("color2", color2);
            this.setProperty("color3", color3);
            this.setProperty("color4", color4);
            this.setProperty("colorStop1", colorStop1);
            this.setProperty("colorStop2", colorStop2);
            this.setProperty("colorStop3", colorStop3);
            this.setProperty("colorStop4", colorStop4);
        }
        catch (e) {
            throw new Error("could not import material: " + importStr);
        }
    };
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var radialGradientMaterialDef =
{ 'shaders':
	{
	    'defaultVShader': "assets/shaders/radialGradient.vert.glsl",
	    'defaultFShader': "assets/shaders/radialGradient.frag.glsl"
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
				    'u_color1': { 'type': 'vec4' },
				    'u_color2': { 'type': 'vec4' },
				    'u_color3': { 'type': 'vec4' },
				    'u_color4': { 'type': 'vec4' },
				    'u_colorStop1': { 'type': 'float' },
				    'u_colorStop2': { 'type': 'float' },
				    'u_colorStop3': { 'type': 'float' },
				    'u_colorStop4': { 'type': 'float' }
				    //'u_colorCount':		{'type' : 'int' }
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

RadialGradientMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.RadialGradientMaterial = RadialGradientMaterial;
}