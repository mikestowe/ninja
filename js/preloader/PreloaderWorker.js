/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

//PreloaderWorker makes the file downloading asynchronous. Preloader will continue to do script execution synchronously. PreloaderWorker allows script execution to start soon after the first download.
//Note: File importing is probably not CPU intensive enough to run on a separate thread. But worth a test.
//      Multi-threading will be more useful for math-intensive webGL or canvas calculations.

self.onmessage = function(e){
    var msgJson;
    if(e && e.data){
        msgJson = e.data;
    }
    //workerLog("worker received this: "+JSON.stringify(msgJson));
    if(msgJson){
        switch(msgJson.command){
            case "start":
                //workerLog('WORKER STARTED');
                
                downloadFiles(msgJson.jsFiles, msgJson.cssFiles, msgJson.baseUrl);
                break;
            case 'stop':
              workerLog('WORKER STOPPED');
              self.close(); // Terminates the worker.
              break;
            default:
              workerLog('Unknown command');
        }
    }
};

 self.onerror = function(e){
     workerLog("worker error: "+ e.message+" @file "+e.filename+" @line# "+e.lineno);
     self.close(); // Terminates the worker.
 }

 var fileCounter  = 0;
 var fileArrayLength = 0;

 var xhrDownload = function(fileUrl, fileType, i){
       var that = self,
            req = new XMLHttpRequest();

       if(fileType === "js"){
            //workerLog("Worker will download: fileUrl="+fileUrl+" :: fileType="+fileType+" :: fileIndex="+i);
            req.overrideMimeType && req.overrideMimeType("application/javascript");
       }else if(fileType === "css"){
            //workerLog("Worker will download: fileUrl="+fileUrl+" :: fileType="+fileType+" :: fileIndex="+i);
            req.overrideMimeType && req.overrideMimeType("text/css");
       }
       req.onreadystatechange = function() {
             if (req.readyState === 4) {
                        if ((req.status === 200 || (req.status === 0 && req.responseText))) {
                            fileCounter++;
                            //workerLog("Status:"+req.status+" : fileUrl="+fileUrl+" :: fileIndex="+i);
                            that.postMessage({command:"newFile", url:fileUrl, fileType:fileType, fileIndex:i, fileContent:req.responseText});

                            //trying to clear some memory after last file is processed
                            req.responseText = null;
                            req = null;

                            if(fileCounter === fileArrayLength){
                                //workerLog("done downloading...shutting down this worker");
                                that.close();
                            }

                        } else {
                            workerLog("Status:"+req.status+" :: Unable to load "+fileUrl);
                        }
            }
       }
       req.open("GET", fileUrl, true);
       req.send();
}

var downloadFiles = function(jsFiles, cssFiles, baseUrl){
    var fileType, fileUrl;
    fileArrayLength = jsFiles.concat(cssFiles).length;
    for(var i=0;i<jsFiles.length;i++){
        fileUrl = baseUrl + jsFiles[i].url;
        fileType = jsFiles[i].type;
        xhrDownload(fileUrl, fileType, i);
    }
    for(var j=0;j<cssFiles.length;j++){
        fileUrl = baseUrl + cssFiles[j].url;
        fileType = cssFiles[j].type;
        xhrDownload(fileUrl, fileType, j);
    }
}

 var workerLog = function(msg){
     self.postMessage({command:"log", logMsg:msg});
 }