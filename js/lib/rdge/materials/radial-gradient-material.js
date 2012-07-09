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

var MaterialParser = require("js/lib/rdge/materials/material-parser").MaterialParser;
var Material = require("js/lib/rdge/materials/material").Material;
var ShapePrimitive = require("js/lib/geom/shape-primitive").ShapePrimitive;

var RadialGradientMaterial = function RadialGradientMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "Radial Gradient";
    this._shaderName = "radialGradient";

    this._defaultColor1 = [1, 0, 0, 1];
    this._defaultColor2 = [0, 1, 0, 1];
    this._defaultColor3 = [0, 0, 1, 1];
    this._defaultColor4 = [0, 1, 1, 1];
    this._defaultColorStop1 = 0.0;
    this._defaultColorStop2 = 0.3;
    this._defaultColorStop3 = 0.6;
    this._defaultColorStop4 = 1.0;
    //  this._defaultColorCount = 4;

    this._textureTransform = [1,0,0, 0,1,0, 0,0,1];

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////


    this.isAnimated     = function ()   {  return false;                        };
    this.getShaderDef   = function()    {  return radialGradientMaterialDef;    };

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this._propNames = ["u_color1", "u_color2", "u_color3", "u_color4", "u_colorStop1", "u_colorStop2", "u_colorStop3", "u_colorStop4" ];
    this._propLabels = ["Color 1", "Color 2", "Color 3", "Color 4", "Color Stop 1", "Color Stop 2", "Color Stop 3", "Color Stop 4" ];
    this._propTypes = ["color", "color", "color", "color", "float", "float", "float", "float" ];
    this._propValues = [];

    this._propValues[this._propNames[0]] = this._defaultColor1.slice(0);
    this._propValues[this._propNames[1]] = this._defaultColor2.slice(0);
    this._propValues[this._propNames[2]] = this._defaultColor3.slice(0);
    this._propValues[this._propNames[3]] = this._defaultColor4.slice(0);

    this._propValues[this._propNames[4]] = this._defaultColorStop1;
    this._propValues[this._propNames[5]] = this._defaultColorStop2;
    this._propValues[this._propNames[6]] = this._defaultColorStop3;
    this._propValues[this._propNames[7]] = this._defaultColorStop4;
    ///////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
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
        this._shader['default'].u_texTransform.set( this._textureTransform );
        this.setShaderValues();
    };

	this.resetToDefault = function()
    {
		this._propValues[this._propNames[0]] = this._defaultColor1.slice(0);
		this._propValues[this._propNames[1]] = this._defaultColor2.slice(0);
		this._propValues[this._propNames[2]] = this._defaultColor3.slice(0);
		this._propValues[this._propNames[3]] = this._defaultColor4.slice(0);

		this._propValues[this._propNames[4]] = this._defaultColorStop1;
		this._propValues[this._propNames[5]] = this._defaultColorStop2;
		this._propValues[this._propNames[6]] = this._defaultColorStop3;
		this._propValues[this._propNames[7]] = this._defaultColorStop4;
	
		var nProps = this._propNames.length;
		for (var i=0; i<nProps;  i++) {
			this.setProperty( this._propNames[i],  this._propValues[this._propNames[i]]  );
        }
	};

	this.fitToBounds = function( bounds )
	{
        if (bounds)
        {
            var dx = Math.abs( bounds[3] - bounds[0] ),
                dy = Math.abs( bounds[4] - bounds[1] );
            if (dy == 0)  dy = 1.0;
            if (dx == 0)  dx = 1.0;
            var xScale = 2.0, yScale = 2.0;
            if (dx > dy)
                yScale *= dy/dx;
            else
                xScale *= dx/dy;

            // build the matrix - the translation to the origin, the scale,
            // and the translation back to the center (hard coded at (0.5, 0.5) for now).
            // the matrix is build directly instead of with matrix multiplications
            // for efficiency, not to mention that the multiplication function does
            // not exist for mat3's.
            // the matrix as laid out below looks transposed - order is columnwise.
            var xCtr = 0.5,  yCtr = 0.5;
            this._textureTransform = [
                                                     xScale,                0.0,  0.0,
                                                        0.0,             yScale,  0.0,
                                            xCtr*(1-xScale),  yCtr*(1 - yScale),  1.0
                                    ];

            if (this._shader && this._shader['default'])
                this._shader['default'].u_texTransform.set( this._textureTransform );

        }
    };

	this.fitToPrimitiveArray = function( primArray )
	{
		if (!primArray)  return;
		var nPrims = primArray.length;
		if (nPrims == 0)  return;
		var bounds = ShapePrimitive.getBounds( primArray[0] );
		for (var i=1;  i<nPrims;  i++)
		{
			var prim = primArray[i];
			var b2 = ShapePrimitive.getBounds( prim );

			// [xMin, yMin, zMin,  xMax, yMax, zMax]
			if (b2[0] < bounds[0])  bounds[0] = b2[0];
			if (b2[1] < bounds[1])  bounds[1] = b2[1];
			if (b2[2] < bounds[2])  bounds[2] = b2[2];

			if (b2[3] > bounds[3])  bounds[3] = b2[3];
			if (b2[4] > bounds[4])  bounds[4] = b2[4];
			if (b2[5] > bounds[5])  bounds[5] = b2[5];
		}

		this.fitToBounds( bounds );
	};

	this.fitToPrimitive = function( prim )
	{
		var bounds = ShapePrimitive.getBounds( prim );
		this.fitToBounds( bounds );
	};

    this.customExport = function( jObj )
    {
        jObj.u_texTransform = this._textureTransform.slice();
        return jObj;
	};

    // Only Linear Gradient and Radial Gradient have gradient data.
    this.gradientType = "radial";

    this.getGradientData = function() {
        var angle = Math.round(this._angle*180/Math.PI),
            color,
            colorStr,
            css = "-webkit-gradient(linear, " + angle + "deg";

        // TODO - Angle is not supported in -webkit-gradient syntax, so just default to across:
        css = '-webkit-radial-gradient(50% 50%, ellipse cover';

        // TODO - Also, Color Model requires from and to in the gradient string
        for (var i=1; i < 5; i++) {
            color = this.getProperty('u_color'+i);
            colorStr = Math.round(color[0] * 255) + ', ' + Math.round(color[1] * 255) + ', ' + Math.round(color[2] * 255) + ', ' + Math.round(color[3] * 100);
            css += ', rgba(' + colorStr + ') ' + Math.round(this.getProperty('u_colorStop'+i)*100) + '%';
    }

        css += ')';

        return css;
};

    this.setGradientData = function(colors) {
        var len = colors.length;
        // TODO - Current shaders only support 4 color stops
        if (len > 4) {
            len = 4;
        }

        for (var n = 0; n < len; n++) {
            var position = colors[n].position/100;
            var cs = colors[n].value;
            var stop = [cs.r/255, cs.g/255, cs.b/255, cs.a];

            this.setProperty("u_color" + (n + 1), stop.slice(0));
            this.setProperty("u_colorStop" + (n + 1), position);
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
                    'u_colorStop4': { 'type': 'float' },
                    'u_texTransform': { 'type' : 'mat3' }
                    //'u_colorCount':       {'type' : 'int' }
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
