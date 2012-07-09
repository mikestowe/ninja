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

// RDGE namespaces
var RDGE = RDGE || {};

/*
* Simple socket connection discovery and management
*/

RDGE.CreateSocket = function (url, listenList, connectedList, messageHandler, socketID, openHandler, closeHandler) {
    var ws = new WebSocket(url);

    ws.listenIndex = socketID;

    ws.onmessage = messageHandler;

    ws.connectedList = connectedList;
    ws.listenList = listenList;

    // make up a flag
    ws.rdge_isConnected = false;
    ws.rdge_tryDisconnect = false;

    if (openHandler) {
        ws.addEventListener("open", openHandler);
    }
    if (closeHandler) {
        ws.addEventListener("close", closeHandler);
        ws.addEventListener("error", closeHandler);
    }

    ws.onopen = function (evt) {
        var websocket = evt.srcElement;
        document.getElementById("socketConnection").innerHTML += "connected: " + websocket.URL + "</br>";

        websocket.rdge_isConnected = true;

        websocket.connectedList.push(ws);

        // save the connected array index of this item
        ws.connectedIndex = websocket.connectedList.length - 1;
    };

    ws.onerror = function (event) {
        window.console.log("error: " + event);
    }

    ws.onclose = function (evt) {
        var websocket = evt.srcElement;

        websocket.rdge_isConnected = false;

        // send disconnect message
        websocket.send("type=srv\nmsg=2\n");

        // remove from connected sockets
        websocket.connectedList[websocket.connectedIndex, 1];

        // re-open port for listening
        //websocket.listenList[websocket.listenIndex] = new WebSocket(websocket.URL.toString());

        //document.getElementById("socketConnection").innerHTML += "disconnected: " + websocket.URL +"</br>";
    };

    return ws;
};

// The DCHP range on Whitney 10.0.0.1 - 10.0.0.254

// add the connection Pool's to this list for auto polling
RDGE.ConnPoll = function() {
    var len = RDGE.globals.poolList.length;
    for (var i = 0; i < len; ++i) {
        RDGE.globals.poolList[i].Poll();
    }
};

/*
* manages a connection
* @param base: base url minus the last octet (ie "ws://192.168.1.")
* @param startAddr: the last octect of the beginning address range (ie 10.0.0.x where x is the value passed in for startAddr)
* @param endAddr: the last octect of the end address range (ie 10.0.0.x where x is the value passed in for endAddr)
* @param messageHandlerFunc: handle to onMessage function
*/
RDGE.ConnectionPool = funciton(base, startAddr, endAddr, messageHandlerFunc)
{
    this.start = startAddr;
    this.end = endAddr;
    this.port = 38951;
    this.messageHandler = messageHandlerFunc;

    this.listenSockets      = [];
    this.connectedSockets   = [];

    this.openHandler = null;
    this.closeHandler = null;

    this.interval = null;

    this.Init = function (openHandler, closeHandler) {
        // empty out lists
        this.listenSockets = [];
        this.connectedSockets = [];

        this.openHandler = openHandler;
        this.closeHandler = closeHandler;

        var len = this.end - this.start;
        for (var i = 0; i < len; ++i) {
            var url = base + (this.start + i) + ":" + this.port + "/resourcePath";
            var ws = CreateSocket(url, this.listenSockets, this.connectedSockets, this.messageHandler, i, this.openHandler, this.closeHandler);

            this.listenSockets.push(ws);
        }

        this.interval = setInterval(ConnPoll, 200);
    };

    this.Shutdown = function () {
        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
        }
        var len = this.connectedSockets.length;
        for (var i = 0; i < len; ++i) {
            // send disconnect message
            this.connectedSockets[i].send("type=srv\nmsg=2\n"); ;
        }
    };

    this.Close = function (socket) {
        socket.rdge_tryDisconnect = true;
    };

    this.Poll = function () {
        var len = this.end - this.start;
        for (var i = 0; i < len; ++i) {
            // re init the sockets to simulate broadcast
            if (this.listenSockets[i].readyState == 3/*CLOSING*/ || this.listenSockets[i].readyState == 2/*CLOSING*/ || this.listenSockets[i].rdge_tryDisconnect == true) {
                if (this.listenSockets[i].rdge_tryDisconnect) {
                    document.getElementById("socketConnection").innerHTML += "graceful discon: " + this.listenSockets[i].URL + "</br>";
                }

                this.listenSockets[i].rdge_tryDisconnect = false;

                var url = base + (this.start + i) + ":" + this.port + "/resourcePath";
                this.listenSockets[i].close();
                this.listenSockets[i] = CreateSocket(url, this.listenSockets, this.connectedSockets, this.messageHandler, i, this.openHandler, this.closeHandler);
            }
        }
    };
};

