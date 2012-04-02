/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var MaterialParser = require("js/lib/rdge/materials/material-parser").MaterialParser;
var Material = require("js/lib/rdge/materials/material").Material;
///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
var FlatMaterial = function FlatMaterial() {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "FlatMaterial";
	this._shaderName = "flat";

	this._color = [1,0,0,1];

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getColor				= function()	{  return this._color;		};
	this.getShaderName			= function()	{  return this._shaderName;	};

	this.isAnimated				= function()	{  return false;			};
	this.hasVertexDeformation	= function()	{  return true;				};
	this._hasVertexDeformation = true;
	this._vertexDeformationTolerance = 0.2;

    //////////////////////////////////s/////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function()	{  return new FlatMaterial();	} ;

	this.init = function()
	{
		// set up the shader
	    this._shader = new RDGE.jshader();
		this._shader.def = flatShaderDef;
		this._shader.init();

        // set the defaults
		this._shader.colorMe.color.set( this.getColor() );

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("flatMaterial");
		this._materialNode.setShader(this._shader);
	};


    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["color"];
	this._propLabels		= ["Color"];
	this._propTypes			= ["color"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._color;

    this.setProperty = function( prop, value ) {
		// make sure we have legitimate input
		if (this.validateProperty( prop, value )) {
            this._propValues[prop] = value;
            if (this._shader && this._shader.colorMe) {
                this._shader.colorMe[prop].set(value);
            }
		}
	};
    ///////////////////////////////////////////////////////////////////////

	this.export = function() {
		// this function should be overridden by subclasses
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr += "name: " + this.getName() + "\n";
		
		if (this._shader)
			exportStr += "color: " + String(this._shader.colorMe.color) + "\n";
		else
			exportStr += "color: " + this.getColor() + "\n";
		exportStr += "endMaterial\n";

		return exportStr;
	};

    this.import = function( importStr ) {
        var pu = new MaterialParser( importStr );
        var material = pu.nextValue( "material: " );
        if (material != this.getShaderName())  throw new Error( "ill-formed material" );
        this.setName(  pu.nextValue( "name: ") );

        var rtnStr;
        try
        {
            var color  = eval( "[" + pu.nextValue( "color: " ) + "]" );

            this.setProperty( "color",  color);

            var endKey = "endMaterial\n";
            var index = importStr.indexOf( endKey );
            index += endKey.length;
            rtnStr = importStr.substr( index );
        }
        catch (e)
        {
            throw new Error( "could not import material: " + importStr );
        }

        return rtnStr;
    };

	this.update = function( time )
	{
	};

};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
flatShaderDef  = 
{
    'shaders':  { // shader files
		'defaultVShader':"assets/shaders/Basic.vert.glsl",
		'defaultFShader':"assets/shaders/Basic.frag.glsl"
        },
    'techniques': { // rendering control
        'colorMe':[ // simple color pass
            {
                'vshader' : 'defaultVShader',
                'fshader' : 'defaultFShader',
           
                // attributes
                'attributes' :
                 {
						'vert'	:	{ 'type' : 'vec3' },
						'normal' :	{ 'type' : 'vec3' },
						'texcoord'	:	{ 'type' : 'vec2' }
                 },
                // attributes
                'params' :
                 {
                    'color' :   { 'type' : 'vec4' }
                 }
            }
        ]
     }
};

FlatMaterial.prototype = new Material();

if (typeof exports === "object") {
    exports.FlatMaterial = FlatMaterial;
}
