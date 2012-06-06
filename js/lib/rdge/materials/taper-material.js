/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Material = require("js/lib/rdge/materials/material").Material;
var Texture = require("js/lib/rdge/texture").Texture;

///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
var TaperMaterial = function TaperMaterial()
{
    // initialize the inherited members
	this.inheritedFrom = Material;
    this.inheritedFrom();

    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "TaperMaterial";
    this._shaderName = "taper";

    this._deltaTime = 0.0;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.getShaderName = function () { return this._shaderName; };

    this.isAnimated = function () { return true; };
    this.hasVertexDeformation = function () { return this._hasVertexDeformation; };
    this._hasVertexDeformation = true;
    this._vertexDeformationTolerance = 0.02; // should be a property

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    // duplcate method requirde

    this.init = function (world) {
        this.setWorld(world);

        // set up the shader
        this._shader = new RDGE.jshader();
        this._shader.def = taperShaderDef;
        this._shader.init();

        // set up the material node
        this._materialNode = RDGE.createMaterialNode("taperMaterial" + "_" + world.generateUniqueNodeID());
        this._materialNode.setShader(this._shader);

        // initialize the taper properties
        this.updateShaderValues();
    };


    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this._propNames = [ "u_limit1", "u_limit2", "u_limit3", "u_minVal", "u_maxVal", "u_center", "u_taperAmount",  "u_speed" ];
    this._propLabels = [ "Minimum Parameter Value", "Center Paramater Value", "Maximum Parameter Value", "Minimum Data Bounds", "Maximum Data Bounds", "Center", "Taper Amount", "Speed" ];
    this._propTypes = [ "float", "float", "float", "float", "float", "float", "float", "float" ];
    this._propValues = [];

    // initialize the property values
    this._propValues[this._propNames[0]] = 0.25;
    this._propValues[this._propNames[1]] = 0.50;
    this._propValues[this._propNames[2]] = 0.75;
    this._propValues[this._propNames[3]] = -1;
    this._propValues[this._propNames[4]] = 1;
    this._propValues[this._propNames[5]] = 0.0;
    this._propValues[this._propNames[6]] = 0.9;
    this._propValues[this._propNames[7]] = 1.0;

    this.setProperty = function (prop, value)
	{
        // make sure we have legitimate input
        if (this.validateProperty(prop, value))
               this._propValues[prop] = value;

        this.updateShaderValues();
    };

    this.exportJSON = function () {
        var jObj =
		{
		    'material': this.getShaderName(),
		    'name': this.getName()
		};

		var n = this._propNames.length;
		for (var i=0;  i<n;  i++)
		{
			var prop = this._propNames[i],
				val  = this._propValues[prop];

			jObj[prop] = val;
		}

        return jObj;
    };

    this.importJSON = function (jObj) {
        if (this.getShaderName() != jObj.material) throw new Error("ill-formed material");
        this.setName(jObj.name);

        try
		{
			for ( var prop in jObj)
			{
				if ((prop != 'material') && (prop != 'name'))
				{
					var value = jObj[prop];
					this.setProperty( prop, value );
				}
			}
        }
        catch (e) {
            throw new Error("could not import material: " + jObj);
        }
    };

    this.update = function (time) {
        var speed = this._propValues["u_speed"];
        this._deltaTime += 0.01 * speed;

        if (this._shader && this._shader.colorMe) {
            var t3 = this._propValues["u_limit3"] - this._deltaTime;
            if (t3 < 0) {
                this._deltaTime = this._propValues["u_limit1"] - 1.0;
                t3 = this._propValues["u_limit3"] - this._deltaTime;
            }

            var t1 = this._propValues["u_limit1"] - this._deltaTime,
				t2 = this._propValues["u_limit2"] - this._deltaTime;


            this._shader.colorMe["u_limit1"].set([t1]);
            this._shader.colorMe["u_limit2"].set([t2]);
            this._shader.colorMe["u_limit3"].set([t3]);
        }
    };

    this.updateShaderValues = function () {
        if (this._shader && this._shader.colorMe) {
            var nProps = this._propNames.length;
            for (var i = 0; i < nProps; i++) {
                var propName = this._propNames[i];
                var propValue = this._propValues[propName];

                if (this._shader.colorMe[propName])
					this._shader.colorMe[propName].set([propValue]);
            }
        }
    };
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
taperShaderDef = {
    'shaders': { // shader files
        'defaultVShader': "assets/shaders/Taper.vert.glsl",
        'defaultFShader': "assets/shaders/Taper.frag.glsl"
    },
    'techniques': { // rendering control
        'colorMe': [ // simple color pass
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
			// attributes
			'params':
				 {
				     'u_limit1': { 'type': 'float' },
				     'u_limit2': { 'type': 'float' },
				     'u_limit3': { 'type': 'float' },
				     'u_minVal': { 'type': 'float' },
				     'u_maxVal': { 'type': 'float' },
				     'u_center': { 'type': 'float' },
				     'u_taperAmount': { 'type': 'float' }
				 }
            }
		]
    }
};


if (typeof exports === "object") {
    exports.TaperMaterial = TaperMaterial;
}
