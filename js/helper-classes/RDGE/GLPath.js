/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

///////////////////////////////////////////////////////////////////////
// Class GLPath
//      GL representation of a path.
//      Derived from class GLGeomObj
//		The position and dimensions of the stroke, fill, and inner Radius should be in pixels
///////////////////////////////////////////////////////////////////////
function GLPath()
{

	// initialize the inherited members
	this.inheritedFrom = GLGeomObj;
	this.inheritedFrom();

	this.init = function( world,  dataArray,  typeArray, strokeWidth, strokeColor, strokeMaterial )
	{
		///////////////////////////////////////////////////////////////////////
		// Instance variables
		///////////////////////////////////////////////////////////////////////


		// stroke
		this._strokeWidth = 0.25;
		this._strokeColor = strokeColor;
		this._strokeMaterial = strokeMaterial;

		// data 
		this._dataArray = dataArray.slice(0);
		this._typeArray = typeArray.slice(0);

		this._world = world;
	}

    ///////////////////////////////////////////////////////////////////////
    // Property Accessors
    ///////////////////////////////////////////////////////////////////////
	this.getStrokeWidth		= function()		{  return this._strokeWidth;		}
	this.setStrokeWidth		= function(w)		{  this._strokeWidth = w;			}

	this.getStrokeMaterial	= function()		{  return this._strokeMaterial;		}
	this.setStrokeMaterial	= function(m)		{  this._strokeMaterial = m;		}

	this.getWorld			= function()		{  return this._world;				}
	this.setWorld			= function(w)		{  this._world = w;					}

	this.geomType	= function()				{  return this.GEOM_TYPE_PATH;	}

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
	// update the "color of the material
    this.getStrokeColor	= function()
	{
		return this._strokeColor;
	}
	
//	this.setStrokeColor	= function(c)
//	{
//		this._strokeColor = c;
//	}
    ///////////////////////////////////////////////////////////////////////

	this.buildBuffers = function()
    {
		// currently no GL representation
    }

    this.render = function()
    {
        // get the world
        var world = this.getWorld();
        if (!world)  throw( "null world in buildBuffers" );

         // get the context
		var ctx = world.get2DContext();
		if (!ctx)  return;

		// create the matrix
		var lineWidth = this._strokeWidth;

		// set up the stroke style
		ctx.beginPath();
		ctx.lineWidth	= lineWidth;
		ctx.strokeStyle = "#0000ff";
		if (this._strokeColor)
			ctx.strokeStyle = MathUtils.colorToHex( this._strokeColor );

		// declarations
		var pt, p0, p1, p2;
			
		// draw the stroke
		var index = 0;
		var dataIndex = 0;
		var n = this._typeArray.length;
		while (index < n)
		{
			var type = this._typeArray[index];
			index++;

			switch (type)
			{
				case 0:		// moveTo
					pt = this._dataArray[dataIndex];
					dataIndex++;
					ctx.moveTo( pt[0], pt[1] );
					break;

				case 1:		// line
					pt = this._dataArray[dataIndex];
					dataIndex++;
					ctx.lineTo( pt[0], pt[1] );
					break;

				case 2:		// quadratic Bezier
					p0 = this._dataArray[dataIndex];  dataIndex++;
					p1 = this._dataArray[dataIndex];  dataIndex++;
					ctx.quadraticCurveTo( p0[0], p0[1],   p1[0], p1[1] );
					break;

				case 3:		// cubic Bezier
					p0 = this._dataArray[dataIndex];  dataIndex++;
					p1 = this._dataArray[dataIndex];  dataIndex++;
					p2 = this._dataArray[dataIndex];  dataIndex++;
					ctx.bezierCurveTo( p0[0], p0[1],   p1[0], p1[1],  p2[0], p2[1] );
					break;

				default:
					console.log( "unsupported path type: " + type );
					break;
			}
		}

		// render the stroke
		ctx.stroke();
    }

	this.export = function()
	{
		var rtnStr = "type: " + this.geomType() + "\n";

		rtnStr += "strokeWidth: "	+ this._strokeWidth	+ "\n";

		rtnStr += "strokeMat: ";
		if (this._strokeMaterial)
			rtnStr += this._strokeMaterial.getName();
		else
			rtnStr += "flatMaterial";
		rtnStr += "\n";

		return rtnStr;
	}

	this.import = function( importStr )
	{
		this._strokeWidth		= this.getPropertyFromString( "strokeWidth: ",	importStr );
		var strokeMaterialName	= this.getPropertyFromString( "strokeMat: ",	importStr );

		var strokeMat = MaterialsLibrary.getMaterial( strokeMaterialName );
		if (!strokeMat)
		{
			console.log( "object material not found in library: " + strokeMaterialName );
			strokeMat = new FlatMaterial();
		}
		this._strokeMaterial = strokeMat;
	}

    this.collidesWithPoint = function( x, y )
    {
        return false;
    }

    this.containsPoint = function( pt,  dir )
    {
		return false;
    }

    this.getNearPoint = function( pt, dir )
    {
        var world = this.getWorld();
        if (!world)  throw( "null world in getNearPoint" );
		
		// get a point on the plane of the circle
		// the point is in NDC, as is the input parameters
		var mat = this.getMatrix();
		var plane = [0,0,1,0];
		plane = MathUtils.transformPlane( plane, mat );
		var projPt = MathUtils.vecIntersectPlane ( pt, dir, plane );

		// transform the projected point back to the XY plane
		//var invMat = mat.inverse();
		var invMat = glmat4.inverse( mat, [] );
		var planePt = MathUtils.transformPoint( projPt, invMat );

		// get the normalized device coordinates (NDC) for
		// the position and radii.
		var	vpw = world.getViewportWidth(),  vph = world.getViewportHeight();
		var	xNDC = 2*this._xOffset/vpw,  yNDC = 2*this._yOffset/vph;
		var projMat = world.makePerspectiveMatrix();
		var z = -world.getViewDistance();
		var planePtNDC = planePt.slice(0);
		planePtNDC[2] = z;
		planePtNDC = MathUtils.transformHomogeneousPoint( planePtNDC, projMat );
		planePtNDC = MathUtils.applyHomogeneousCoordinate( planePtNDC );

        // get the gl coordinates
		var aspect = world.getAspect();
		var zn = world.getZNear(),  zf = world.getZFar();
		var	t = zn * Math.tan(world.getFOV() * Math.PI / 360.0),
			b = -t,
			r = aspect*t,
			l = -r;

		// convert to GL coordinates
		var objPt = [0, 0, 0];
		objPt[0] = -z*(r-l)/(2.0*zn)*objPt[0];
		objPt[1] = -z*(t-b)/(2.0*zn)*objPt[1];

		// re-apply the transform
		objPt = MathUtils.transformPoint( objPt, mat );

		return objPt;
    }
 }


