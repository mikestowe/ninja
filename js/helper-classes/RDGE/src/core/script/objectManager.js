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

// RDGE namespaces
var RDGE = RDGE || {};

/* generic handle-based object manager */
RDGE.objectManager = function() {
	this.guidCounter = 0;
	this.objects = [];
	this.numObjects = 0;
	this.freelist = [];
	
	this.reset = function() {
		this.objects = [];
		this.freelist = [];
		this.guidCounter = 0;
	}
	
	// validHandle
	this.validHandle = function(h) {
		return this.handleToIndex(h) != -1;
	}
	
	// handleToIndex
	this.handleToIndex = function(h) {
		var index = ( h >> 16 ) & 0xFFFF;
		if( this.objects[index] != null && h == this.objects[index].handle ) {
			return index;
		}
		return -1;
	}

	// handleToObject	
	this.handleToObject = function(h) {
		var index = this.handleToIndex( h ); 
		if( index != -1 ) {
			return this.objects[index];
		}
		return null;
	}
	
	// add object
	this.addObject = function(ob) {
		var index = this.objects.length;

		if( this.freelist.length > 0 ) {
			index = this.freelist.pop(); 
		}
		if( ++this.guidCounter >= 0xFFFF ) {
			// wrap the counter, zero is reserved for invalid handles.
			this.guidCounter = 1;
		}
		ob.handle = ( index << 16 | ++this.guidCounter );				
		this.objects[index] = ob;
		
		return ob.handle;
	}
	
	// remove object
	this.removeObject = function(h) {	
		var index = this.handleToIndex( h );	
		if( index != -1 ) {
			if( this.objects[index].onremove != undefined ) {
				this.objects[index].onremove();
			}
			this.objects[index] = null;
			this.freelist.push(index);
		}
	}
}
