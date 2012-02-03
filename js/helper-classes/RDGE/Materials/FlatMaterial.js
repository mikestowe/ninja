/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */


///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
function FlatMaterial()
{
    // initialize the inherited members
    this.inheritedFrom = GLMaterial;
    this.inheritedFrom();
   
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
	this._name = "FlatMaterial";
	this._shaderName = "flat";

	this._color = [1,0,0,1];

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getColor			= function()	{  return this._color;		}
	this.getShaderName		= function()	{  return this._shaderName;	}

	this.isAnimated			= function()	{  return false;				}

    //////////////////////////////////s/////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
	// duplcate method requirde
	this.dup = function()	{  return new FlatMaterial();	} 

	this.init = function()
	{
		// set up the shader
		this._shader = new jshader();
		this._shader.def = flatShaderDef;
		this._shader.init();

        // set the defaults
		this._shader.colorMe.color.set( this.getColor() );

		// set up the material node
		this._materialNode = createMaterialNode("flatMaterial");
		this._materialNode.setShader(this._shader);

		// initialize the taper properties
//		this._shader.colorMe.u_limit1.set( [0.25] );
//		this._shader.colorMe.u_limit2.set( [0.5] );
//		this._shader.colorMe.u_limit3.set( [0.75] );
//		this._shader.colorMe.u_taperAmount.set( [0.5] );
	}


    ///////////////////////////////////////////////////////////////////////
    // Material Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this._propNames			= ["color"];
	this._propLabels		= ["Color"];
	this._propTypes			= ["color"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._color;

    this.setProperty = function( prop, value )
	{
		// make sure we have legitimate imput
		if (this.validateProperty( prop, value ))
		{
			this._color = value.slice(0);
			this._shader.colorMe[prop].set(value);
		}
	}
    ///////////////////////////////////////////////////////////////////////

	this.export = function()
	{
		// this function should be overridden by subclasses
		var exportStr = "material: " + this.getShaderName() + "\n";
		exportStr = "name: " + this.getName() + "\n";
		
		if (this._shader)
			exportStr += "color: " + String(this._shader.colorMe.color) + "\n";
		else
			exportStr += "color: " + this.getColor() + "\n";
		exportStr += "endMaterial\n";

		return exportStr;
	}

	this.import = function( importStr )
	{
		var pu = new ParseUtils( importStr );
		var material = pu.nextValue( "material: " );
		if (material != this.getShaderName())  throw new Error( "ill-formed material" );
		this.setName(  pu.nextValue( "material: ") );
		var color = pu.nextValue( "color: " );

		var endKey = "endMaterial\n";
		var index = importStr.indexOf( endKey ) + endKey.len;
		var rtnStr = importStr.substr( index );
		return rtnStr;
	}

	this.update = function( time )
	{
	}
}

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
flatShaderDef  = 
{
    'shaders':  { // shader files
		//'defaultVShader':"assets/shaders/Taper.vert.glsl",
		'defaultVShader':"assets/shaders/Basic.vert.glsl",
		'defaultFShader':"assets/shaders/Basic.frag.glsl",
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
						'texcoord'	:	{ 'type' : 'vec2' },
                 },
                // attributes
                'params' :
                 {
                    'color' :   { 'type' : 'vec4' },

					//'u_limit1': { 'type': 'float' },
					//'u_limit2': { 'type': 'float' },
					//'u_limit3': { 'type': 'float' },
					//'u_taperAmount': { 'type': 'float' }
                 },
            },
        ]
     }
};

