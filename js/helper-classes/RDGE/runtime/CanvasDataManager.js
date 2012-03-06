/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */



///////////////////////////////////////////////////////////////////////
// Class ShapeRuntime
//      Manages runtime shape display
///////////////////////////////////////////////////////////////////////
function CanvasDataManager()
{
	this.loadGLData = function(root,  valueArray,  NinjaUtils)
	{
		var value = valueArray;
		var nWorlds = value.length;
		for (var i=0;  i<nWorlds;  i++)
		{
			var importStr = value[i];
			var startIndex = importStr.indexOf( "id: " );
			if (startIndex >= 0)
			{
				var endIndex = importStr.indexOf( "\n", startIndex );
				if (endIndex > 0)
				{
					var id = importStr.substring( startIndex+4, endIndex );
					var canvas = this.findCanvasWithID( id, root );
					if (canvas)
					{
						var rt = new GLRuntime( canvas, importStr );
					}
				}
			}
		}
	}

	this.collectGLData = function( elt,  dataArray )
	{
		if (elt.elementModel && elt.elementModel.shapeModel && elt.elementModel.shapeModel.GLWorld)
		{
			var data = elt.elementModel.shapeModel.GLWorld.export( true );
			dataArray.push( data );
		}

		if (elt.children)
		{
			var nKids = elt.children.length;
			for (var i=0;  i<nKids;  i++)
			{
				var child = elt.children[i];
				this.collectGLData( child, dataArray );
			}
		}
	}

	this.findCanvasWithID = function( id,  elt )
	{
		var cid = elt.getAttribute( "data-RDGE-id" );
		if (cid == id)  return elt;

		if (elt.children)
		{
			var nKids = elt.children.length;
			for (var i=0;  i<nKids;  i++)
			{
				var child = elt.children[i];
				var foundElt = this.findCanvasWithID( id, child );
				if (foundElt)  return foundElt;
			}
		}
	}
}

