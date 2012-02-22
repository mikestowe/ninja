/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */



///////////////////////////////////////////////////////////////////////
// Class ShapeRuntime
//      Manages runtime shape display
///////////////////////////////////////////////////////////////////////
function CanvasLoader( root,  valueArray, loadForAuthoring )
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
					if (loadForAuthoring)
					{
						if (!canvas.elementModel)
						{
							NJUtils.makeElementModel(canvas, "Canvas", "shape", true);
						}
								
						if (canvas.elementModel)
						{
							if (canvas.elementModel.shapeModel.GLWorld)
								canvas.elementModel.shapeModel.GLWorld.clearTree();

							var world = new GLWorld( canvas );
							canvas.elementModel.shapeModel.GLWorld = world;
							world.import( importStr );
						}
					}
					else
					{
						var rt = new GLRuntime( canvas, importStr );
					}
				}
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
				this.findCanvasWithID( id, child );
			}
		}
	}
}

