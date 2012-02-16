/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

input = {}
/*
 * input.eventHandlers 
 * Register one or more event handlers with the input system. An event handler can be 
 * any object defining one or more of the following event handling functions: 
 *			onKeyDown(ev)
 *			onKeyUp(ev)
 *			onMouseDown(ev)
 *			onMouseUp(ev)
 *			onMouseMove(ev)
 *			onMouseWheel(ev)
 *			...
 *
 */
input.eventHandlers = [];

/* 
 * input.onKeyDown
 * Top level onKeyDown event handler function. This function propogates events to all registered 
 * event handlers. The first handler to return true stops this propogation, thus "handling" the event.
 */ 
input.onKeyDown = function(ev) {
	var i = 0;
	var count = input.eventHandlers.length;  
	while( i < count ) {
		if( input.eventHandlers[i].onKeyDown != undefined && input.eventHandlers[i].onKeyDown(ev) ) {
			break;
		}
		i++;
	} 
}

/* 
 * input.onKeyUp
 * Top level onKeyUp event handler function. This function propogates events to all registered 
 * event handlers. The first handler to return true stops this propogation, thus "handling" the event.
 */ 
input.onKeyUp = function(ev) {
	var i = 0;
	var count = input.eventHandlers.length;  
	while( i < count ) {
		if( input.eventHandlers[i].onKeyUp != undefined && input.eventHandlers[i].onKeyUp(ev) ) {
			break;
		}
		i++;
	} 
}

/* 
 * input.onMouseDown
 * Top level onMouseDown event handler function. This function propogates events to all registered 
 * event handlers. The first handler to return true stops this propogation, thus "handling" the event.
 */ 
input.onMouseDown = function(ev) {
	var i = 0;
	var count = input.eventHandlers.length;  
	while( i < count ) {
		if( input.eventHandlers[i].onMouseDown != undefined && input.eventHandlers[i].onMouseDown(ev) ) {
			break;
		}
		i++;
	} 
}

/* 
 * input.onMouseUp
 * Top level onMouseUp event handler function. This function propogates events to all registered 
 * event handlers. The first handler to return true stops this propogation, thus "handling" the event.
 */ 
input.onMouseUp = function(ev) {
	var i = 0;
	var count = input.eventHandlers.length;  
	while( i < count ) {
		if( input.eventHandlers[i].onMouseUp != undefined && input.eventHandlers[i].onMouseUp(ev) ) {
			break;
		}
		i++;
	} 
}

/* 
 * input.onMouseMove
 * Top level onMouseMove event handler function. This function propogates events to all registered 
 * event handlers. The first handler to return true stops this propogation, thus "handling" the event.
 */ 
input.onMouseMove = function(ev) {
	var i = 0;
	var count = input.eventHandlers.length;  
	while( i < count ) {
		if( input.eventHandlers[i].onMouseMove != undefined && input.eventHandlers[i].onMouseMove(ev) ) {
			break;
		}
		i++;
	} 
}

/* 
 * input.onMouseWheel
 * Top level onMouseWheel event handler function. This function propogates events to all registered 
 * event handlers. The first handler to return true stops this propogation, thus "handling" the event.
 */ 
input.onMouseWheel = function(ev) {
	var i = 0;
	var count = input.eventHandlers.length;  
	while( i < count ) {
		if( input.eventHandlers[i].onMouseWheel != undefined && input.eventHandlers[i].onMouseWheel(ev) ) {
			break;
		}
		i++;
	}
}