/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/*
* Simple socket connection discovery and management
*/

g_connectionManager = null;

function CreateSocket(url, listenList, connectedList, messageHandler, socketID, openHandler, closeHandler)
{
	var ws = new WebSocket(url);

	ws.listenIndex = socketID;

	ws.onmessage = messageHandler;

	ws.connectedList = connectedList;
	ws.listenList = listenList;

	// make up a flag
	ws.rdge_isConnected = false;
	ws.rdge_tryDisconnect = false;
	
	if (openHandler)
	{
	    ws.addEventListener("open", openHandler);
	}
	if (closeHandler)
	{
	    ws.addEventListener("close", closeHandler);
	    ws.addEventListener("error", closeHandler);
	}	
	
	ws.onopen = function(evt)
	{
		var websocket = evt.srcElement;
		document.getElementById("socketConnection").innerHTML += "connected: " + websocket.URL +"</br>";
		
		websocket.rdge_isConnected = true;
		
		websocket.connectedList.push(ws);
		
		// save the connected array index of this item
		ws.connectedIndex = websocket.connectedList.length - 1;
	}

	ws.onerror = function(event) 
	{
		window.console.log("error: " + event);
	}

	ws.onclose = function(evt) 
	{
		var websocket = evt.srcElement;
		
		websocket.rdge_isConnected = false;
		
		// send disconnect message
		websocket.send("type=srv\nmsg=2\n");
		
		// remove from connected sockets
		websocket.connectedList[websocket.connectedIndex, 1];
		
		// re-open port for listening
		//websocket.listenList[websocket.listenIndex] = new WebSocket(websocket.URL.toString());
		
		//document.getElementById("socketConnection").innerHTML += "disconnected: " + websocket.URL +"</br>";
	}
	
	return ws;
}

// The DCHP range on Whitney 10.0.0.1 - 10.0.0.254

/*
* manages a connection
* @param base: base url minus the last octet (ie "ws://192.168.1.")
* @param startAddr: the last octect of the beginning address range (ie 10.0.0.x where x is the value passed in for startAddr)
* @param endAddr: the last octect of the end address range (ie 10.0.0.x where x is the value passed in for endAddr)
* @param messageHandlerFunc: handle to onMessage function
*/
function ConnectionPool(base, startAddr, endAddr, messageHandlerFunc)
{
	this.start = startAddr;
	this.end = endAddr;
	this.port = 38951;
	this.messageHandler = messageHandlerFunc;
	
	this.listenSockets		= [];
	this.connectedSockets	= [];
	
	this.openHandler = null;
	this.closeHandler = null;
	
	this.interval = null;

	this.Init = function(openHandler, closeHandler) 
	{
		// emtpy out lists
		this.listenSockets		= [];
		this.connectedSockets	= [];
		
		this.openHandler = openHandler;
		this.closeHandler = closeHandler;
	
		var len = this.end - this.start;
		for (var i = 0; i < len; ++i) 
		{
			var url = base + (this.start + i) + ":" + this.port + "/resourcePath";
			var ws = CreateSocket(url, this.listenSockets, this.connectedSockets, this.messageHandler, i, this.openHandler, this.closeHandler);
			
			this.listenSockets.push(ws);
		}
		
		this.interval = setInterval(ConnPoll, 200);
	}
	
	this.Shutdown = function()
	{
		if(this.interval != null)
		{
			clearInterval(this.interval);
			this.interval = null;
		}
		var len = this.connectedSockets.length;
		for (var i = 0; i < len; ++i) 
		{
			// send disconnect message
			this.connectedSockets[i].send("type=srv\nmsg=2\n");;
		}
	}
	
	this.Close = function(socket)
	{
		socket.rdge_tryDisconnect = true;
	}
	
	this.Poll = function()
	{
		var len =this. end - this.start;
		for (var i = 0; i < len; ++i) 
		{
			// re init the sockets to simulate broadcast
			if(this.listenSockets[i].readyState == 3/*CLOSING*/ || this.listenSockets[i].readyState == 2/*CLOSING*/ || this.listenSockets[i].rdge_tryDisconnect == true)
			{
				if(this.listenSockets[i].rdge_tryDisconnect)
				{
					document.getElementById("socketConnection").innerHTML += "graceful discon: " + this.listenSockets[i].URL +"</br>";
				}
				
				this.listenSockets[i].rdge_tryDisconnect = false;
				
				var url = base + (this.start + i) + ":" + this.port + "/resourcePath";
				this.listenSockets[i].close();
				this.listenSockets[i] = CreateSocket(url, this.listenSockets, this.connectedSockets, this.messageHandler, i, this.openHandler, this.closeHandler);
			}
		}
		
	}
	
}

