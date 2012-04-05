/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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