/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var MaterialParser = require("js/lib/rdge/materials/material-parser").MaterialParser;
///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
function TwistVertMaterial() {
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();

    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "TwistVertMaterial";
    this._shaderName = "twistVert";

    this._color = [1, 0, 0, 1];

    this._tex0 = 'assets/images/rocky-normal.jpg';
    this._tex1 = 'assets/images/metal.png';

    this._angle = 0.0;
    this._deltaTime = 0.01;

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.getColor = function () { return this._color; };
    this.getShaderName = function () { return this._shaderName; };

    this.isAnimated = function () { return true; };
    this.hasVertexDeformation = function () { return this._hasVertexDeformation; };
    this._hasVertexDeformation = true;
    this._vertexDeformationTolerance = 0.02; // should be a property

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    // duplcate method requirde
    this.dup = function () { return new TwistVertMaterial(); };

    this.init = function (world) {
        this.setWorld(world);

        // set up the shader
        this._shader = new RDGE.jshader();
        this._shader.def = twistVertShaderDef;
        this._shader.init();

        // set the defaults
        this._shader.twistMe.color.set(this.getColor());

        // set up the material node
        this._materialNode = RDGE.createMaterialNode("twistVertMaterial" + "_" + world.generateUniqueNodeID());
        this._materialNode.setShader(this._shader);

        // initialize the twist vert properties
        this.updateShaderValues();
    };


    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this._propNames = ["color", "u_limit1", "u_limit2", "u_center", "u_twistAmount", "u_tex0", "u_tex1"];
    this._propLabels = ["Color", "Minimum Parameter Value", "Center Paramater Value", "Center", "Twist Amount", "Front facing texture map", "Back facing texture map"];
    this._propTypes = ["color", "float", "float", "float", "float", "file", "file"];
    this._propValues = [];

    // initialize the property values
    this._propValues[this._propNames[0]] = this._color.slice();
    this._propValues[this._propNames[1]] = 0.25;
    this._propValues[this._propNames[2]] = 0.75;
    this._propValues[this._propNames[3]] = 0.0;
    this._propValues[this._propNames[4]] = 2.0 * Math.PI;
    this._propValues[this._propNames[5]] = this._tex0.slice();
    this._propValues[this._propNames[6]] = this._tex1.slice();

    this.setProperty = function (prop, value) {
        // make sure we have legitimate input
        if (this.validateProperty(prop, value)) {
            switch (prop) {
                case "color":
                case "u_tex1":
                case "u_tex0": this._propValues[prop] = value.slice(); break;
                default: this._propValues[prop] = value; break;
            }

            this.updateShaderValues();
        }
    };
    ///////////////////////////////////////////////////////////////////////

    this.exportJSON = function () {
        var jObj =
		{
		    'material': this.getShaderName(),
		    'name': this.getName(),
		    'color': this._propValues["color"]
		};

        return jObj;
    };

    this.importJSON = function (jObj) {
        if (this.getShaderName() != jObj.material) throw new Error("ill-formed material");
        this.setName(jObj.name);

        try {
            var color = jObj.color;
            this.setProperty("color", color);
        }
        catch (e) {
            throw new Error("could not import material: " + importStr);
        }
    };

    this.export = function () {
        // this function should be overridden by subclasses
        var exportStr = "material: " + this.getShaderName() + "\n";
        exportStr += "name: " + this.getName() + "\n";

        if (this._shader)
            exportStr += "color: " + String(this._shader.twistMe.color) + "\n";
        else
            exportStr += "color: " + this.getColor() + "\n";
        exportStr += "endMaterial\n";

        return exportStr;
    };

    this.import = function (importStr) {
        var pu = new MaterialParser(importStr);
        var material = pu.nextValue("material: ");
        if (material != this.getShaderName()) throw new Error("ill-formed material");
        this.setName(pu.nextValue("name: "));

        var rtnStr;
        try {
            var color = eval("[" + pu.nextValue("color: ") + "]");

            this.setProperty("color", color);

            var endKey = "endMaterial\n";
            var index = importStr.indexOf(endKey);
            index += endKey.length;
            rtnStr = importStr.substr(index);
        }
        catch (e) {
            throw new Error("could not import material: " + importStr);
        }

        return rtnStr;
    };

    this.update = function (time) {
        if (this._shader && this._shader.twistMe) {
            var angle = this._angle;
            angle += this._deltaTime;
            if (angle > this._propValues["u_twistAmount"]) {
                angle = this._propValues["u_twistAmount"];
                this._deltaTime = -this._deltaTime;
            }
            else if (angle < 0.0) {
                angle = 0;
                this._deltaTime = -this._deltaTime;
            }
            this._angle = angle;
            this._shader.twistMe["u_twistAmount"].set([angle]);
        }
    };

    this.updateShaderValues = function () {
        if (this._shader && this._shader.twistMe) {
            var nProps = this._propNames.length;
            for (var i = 0; i < nProps; i++) {
                var propName = this._propNames[i];
                var propValue = this._propValues[propName];
                switch (propName) {
                    case "u_tex0":
                    case "u_tex1":
                    case "color": this._shader.twistMe[propName].set(propValue); break;
                    default: this._shader.twistMe[propName].set([propValue]); break;
                }
            }
        }
    };

    this.updateTextures = function () {
        var material = this._materialNode;
        if (material) {
            var technique = material.shaderProgram['default'];
            var renderer = RDGE.globals.engine.getContext().renderer;
            if (renderer && technique) {
                var texMapName = this._propValues[this._propNames[5]];
                var wrap = 'REPEAT', mips = true;
                var tex = this.loadTexture(texMapName, wrap, mips);
                if (tex) technique.u_tex0.set(tex);

                texMapName = this._propValues[this._propNames[6]];
                tex = this.loadTexture(texMapName, wrap, mips);
                if (tex) technique.u_tex1.set(tex);
            }
        }
    };
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader

// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
twistVertShaderDef =
{
    'shaders': { // shader files
        'defaultVShader': "assets/shaders/TwistVert.vert.glsl",
        'defaultFShader': "assets/shaders/TwistVert.frag.glsl"
    },
    'techniques': { // rendering control
        'twistMe': [ // simple color pass
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
				     'color': { 'type': 'vec4' },

				     'u_limit1': { 'type': 'float' },
				     'u_limit2': { 'type': 'float' },
				     'u_limit3': { 'type': 'float' },
				     'u_minVal': { 'type': 'float' },
				     'u_maxVal': { 'type': 'float' },
				     'u_center': { 'type': 'float' },
				     'u_twistAmount': { 'type': 'float' }
				 }
            }
		]
    }
};

