/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
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

var LinearGradientMaterial = function LinearGradientMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    this._name = "Linear Gradient";
    this._shaderName = "linearGradient";

    this._color1 = [1, 0, 0, 1];
    this._color2 = [0, 1, 0, 1];
    this._color3 = [0, 0, 1, 1];
    this._color4 = [0, 1, 1, 1];
    this._colorStop1 = 0.0;
    this._colorStop2 = 0.3;
    this._colorStop3 = 0.6;
    this._colorStop4 = 1.0;
    //  this._colorCount    = 4;
    this._angle = 0.0; // the shader takes [cos(a), sin(a)]

    this._textureTransform = [1,0,0, 0,1,0, 0,0,1];

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this.getShaderDef       = function()            {  return linearGradientMaterialDef;    }

    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
    this._propNames = ["u_color1", "u_color2", "u_color3", "u_color4", "u_colorStop1", "u_colorStop2", "u_colorStop3", "u_colorStop4", "u_cos_sin_angle"];
    this._propLabels = ["Color 1", "Color 2", "Color 3", "Color 4", "Color Stop 1", "Color Stop 2", "Color Stop 3", "Color Stop 4", "Angle"];
    this._propTypes = ["color", "color", "color", "color", "float", "float", "float", "float", "vector2d"];
    this._propValues = [];

    this._propValues[this._propNames[0]] = this._color1.slice(0);
    this._propValues[this._propNames[1]] = this._color2.slice(0);
    this._propValues[this._propNames[2]] = this._color3.slice(0);
    this._propValues[this._propNames[3]] = this._color4.slice(0);

    this._propValues[this._propNames[4]] = this._colorStop1;
    this._propValues[this._propNames[5]] = this._colorStop2;
    this._propValues[this._propNames[6]] = this._colorStop3;
    this._propValues[this._propNames[7]] = this._colorStop4;

    this._propValues[this._propNames[8]] = [ Math.cos(this._angle), Math.sin(this._angle) ];

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    // duplcate method requirde

    this.init = function (world) {
        this.setWorld(world);

        // set up the shader
        this._shader = new RDGE.jshader();
        this._shader.def = linearGradientMaterialDef;
        this._shader.init();

        // set up the material node
        this._materialNode = RDGE.createMaterialNode(this.getShaderName() + "_" + world.generateUniqueNodeID());
        this._materialNode.setShader(this._shader);


        if (this._shader && this._shader['default'])
            this._shader['default'].u_texTransform.set( this._textureTransform );


        // send the current values to the shader
        this.setShaderValues();
        this.update( 0 );
    };

	this.resetToDefault = function()
	{
		this._propValues[this._propNames[0]] = this._color1.slice(0);
		this._propValues[this._propNames[1]] = this._color2.slice(0);
		this._propValues[this._propNames[2]] = this._color3.slice(0);
		this._propValues[this._propNames[3]] = this._color4.slice(0);

		this._propValues[this._propNames[4]] = this._colorStop1;
		this._propValues[this._propNames[5]] = this._colorStop2;
		this._propValues[this._propNames[6]] = this._colorStop3;
		this._propValues[this._propNames[7]] = this._colorStop4;

		this._propValues[this._propNames[8]] = [ Math.cos(this._angle), Math.sin(this._angle) ];

		var nProps = this._propNames.length;
		for (var i=0; i<nProps;  i++) {
			this.setProperty( this._propNames[i],  this._propValues[this._propNames[i]]  );
		}
	};

    // Only Linear Gradient and Radial Gradients support gradients;
    this.gradientType = "linear";

    this.getGradientData = function() {
        var angle = Math.round(this._angle*180/Math.PI),
            color,
            colorStr,
            css = "-webkit-gradient(linear, " + angle + "deg";

        // TODO - Angle is not supported in -webkit-gradient syntax, so just default to across:
        css = '-webkit-gradient(linear, left top, right top';

        // TODO - Also, Color Model requires from and to in the gradient string
        color = this.getProperty('u_color1');
        colorStr = Math.round(color[0] * 255) + ', ' + Math.round(color[1] * 255) + ', ' + Math.round(color[2] * 255) + ', ' + Math.round(color[3] * 100);
        css += ', from(rgba(' + colorStr + '))';

        for (var i=2; i < 4; i++) {
            color = this.getProperty('u_color'+i);
            colorStr = Math.round(color[0] * 255) + ', ' + Math.round(color[1] * 255) + ', ' + Math.round(color[2] * 255) + ', ' + Math.round(color[3] * 100);
            css += ', color-stop(' + this.getProperty('u_colorStop'+i) + ', rgba(' + colorStr + '))';
        }

        color = this.getProperty('u_color4');
        colorStr = Math.round(color[0] * 255) + ', ' + Math.round(color[1] * 255) + ', ' + Math.round(color[2] * 255) + ', ' + Math.round(color[3] * 100);
        css += ', to(rgba(' + colorStr + '))';

        css += ')';

        return css;
	};

    // Only Linear Gradient and Radial Gradient have gradient data.
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
var linearGradientMaterialDef =
{'shaders':
    {
            // shader file
            'defaultVShader':"assets/shaders/linearGradient.vert.glsl",
            'defaultFShader':"assets/shaders/linearGradient.frag.glsl",

            // this shader is inline
            'dirLightVShader': "\
                uniform mat4 u_mvMatrix;\
                uniform mat4 u_normalMatrix;\
                uniform mat4 u_projMatrix;\
                uniform mat4 u_worldMatrix;\
                attribute vec3  a_pos;\
                attribute vec3  a_nrm;\
                varying vec3 vNormal;\
                varying vec3 vPos;\
                void main() {\
                    vNormal.xyz = (u_normalMatrix*vec4(a_nrm, 0.0)).xyz;\
                    gl_Position = u_projMatrix * u_mvMatrix * vec4(a_pos,1.0);\
                    vPos = (u_worldMatrix * vec4(a_pos,1.0)).xyz;\
                }",
            'dirLightFShader': "\
                precision highp float;\
                uniform vec4 u_light1Diff;\
                uniform vec3 u_light1Pos;\
                uniform vec4 u_light2Diff;\
                uniform vec3 u_light2Pos;\
                varying vec3 vNormal;\
                varying vec3 vPos;\
                void main() {\
                    vec3 light1 = vec3(u_light1Pos.x - vPos.x, u_light1Pos.y - vPos.y, u_light1Pos.z - vPos.z);\
                    vec3 light2 = vec3(u_light2Pos.x - vPos.x, u_light2Pos.y - vPos.y, u_light2Pos.z - vPos.z);\
                    float t = 0.75;\
                    float range = t*t;\
                    float alpha1 = max(0.0, 1.0 - ( (light1.x*light1.x)/range + (light1.y*light1.y)/range + (light1.z*light1.z)/range));\
                    float alpha2 = max(0.0, 1.0 - ( (light2.x*light2.x)/range + (light2.y*light2.y)/range + (light2.z*light2.z)/range));\
                    gl_FragColor = vec4((u_light2Diff*alpha2 + u_light1Diff*alpha1).rgb, 1.0);\
                }"
        },
        'techniques':
        {
            'default':
            [
                {
                    'vshader' : 'defaultVShader',
                    'fshader' : 'defaultFShader',
                    // attributes
                    'attributes' :
                    {
                        'vert'  :   { 'type' : 'vec3' },
                        'normal' :  { 'type' : 'vec3' },
                        'texcoord'  :   { 'type' : 'vec2' }
                    },
                    // parameters
                    'params' :
                    {
                        'u_color1' :        { 'type' : 'vec4' },
                        'u_color2' :        { 'type' : 'vec4' },
                        'u_color3' :        { 'type' : 'vec4' },
                        'u_color4' :        { 'type' : 'vec4' },
                        'u_colorStop1':     { 'type' : 'float' },
                        'u_colorStop2':     { 'type' : 'float' },
                        'u_colorStop3':     { 'type' : 'float' },
                        'u_colorStop4':     { 'type' : 'float' },
                        'u_cos_sin_angle':  { 'type' : 'vec2' },
                        'u_texTransform':   { 'type' : 'mat3' }
                        //'u_colorCount':       {'type' : 'int' }

                    },

                    // render states
                    'states' :
                    {
                        'depthEnable' : true,
                        'offset':[1.0, 0.1]
                    }
                },
                {   // light pass
                    'vshader' : 'dirLightVShader',
                    'fshader' : 'dirLightFShader',
                    // attributes
                    'attributes' :
                    {
                        'a_pos' :   { 'type' : 'vec3' },
                        'a_nrm' :   { 'type' : 'vec3' }
                    },
                    // parameters
                    'params' :
                    {
                    },

                    // render states
                    'states' :
                    {
                        'depthEnable' : true,
                        "blendEnable" : true,
                        "srcBlend" : "SRC_ALPHA",
                        "dstBlend" : "DST_ALPHA"
                    }
                }
            ]
        }
};

LinearGradientMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.LinearGradientMaterial = LinearGradientMaterial;
}




