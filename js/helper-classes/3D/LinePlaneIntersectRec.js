/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

///////////////////////////////////////////////////////////////////////
// Class Utils
//      This class represents an intersection between a StageLine
//      and an ElementsPlane.
///////////////////////////////////////////////////////////////////////
var LinePlaneIntersectRec = exports.LinePlaneIntersectRec = Object.create(Object.prototype, {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////

    // references to the StageLine and ElementPlanes instances
    _stageLine: { value: null, writable: true },
    _elementPlanes: { value: null, writable: true },

    // the intersection information
    _t: { value: null, writable: true },
    _deltaVis: { value: null, writable: true },

    // doubly linked list to allow easy sorted insertions
    _next: { value: null, writable: true },
    _prev: { value: null, writable: true },

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////

    getStageLine: { value: function()        {  return this._stageLine;      } },
    setStageLine: { value: function(sl)      {  this._stageLine = sl;        } },

    getElementPlanes: { value: function()        {  return this._elementPlanes;  } },
    setElementPlanes: { value: function(p)       {  this._elementPlanes = p;     } },

	getT: { value: function()		{  return this._t;				} },
	setT: { value: function(t)		{  this._t = t;					} },

	setDeltaVis: { value: function(d)       {  this._deltaVis = d;          } },
	getDeltaVis: { value: function()        {  return this._deltaVis;       } },

	setNext: { value: function(n)		{  this._next = n;				} },
	getNext: { value: function()		{  return this._next;			} },

	getPrev: { value: function()		{  return this._prev;			} },
	setPrev: { value: function(p)		{  this._prev = p;				} }

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

});


