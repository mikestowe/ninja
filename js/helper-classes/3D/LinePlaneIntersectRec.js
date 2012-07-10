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

    getT: { value: function()       {  return this._t;              } },
    setT: { value: function(t)      {  this._t = t;                 } },

    setDeltaVis: { value: function(d)       {  this._deltaVis = d;          } },
    getDeltaVis: { value: function()        {  return this._deltaVis;       } },

    setNext: { value: function(n)       {  this._next = n;              } },
    getNext: { value: function()        {  return this._next;           } },

    getPrev: { value: function()        {  return this._prev;           } },
    setPrev: { value: function(p)       {  this._prev = p;              } }

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////

});


