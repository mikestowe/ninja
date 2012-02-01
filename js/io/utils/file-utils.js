/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var FileUtils = exports.FileUtils = Object.create(Object.prototype, {

    /***
     * checks for valid uri pattern
     * also flags if Windows uri pattern and Unix uri patterns are mixed
     */
    isValidUri:{
        value: function(uri){
            var isWindowsUri=false, isUnixUri=false,status=false;
            if(uri !== ""){
                uri = uri.replace(/^\s+|\s+$/g,"");  // strip any leading or trailing spaces

                //for local machine folder uri
                isWindowsUri = /^([a-zA-Z]:)(\\[^<>:"/\\|?*]+)*\\?$/gi.test(uri);
                isUnixUri = /^(\/)?(\/(?![.])[^/]*)*\/?$/gi.test(uri);//folders beginning with . are hidden on Mac / Unix
                status = isWindowsUri || isUnixUri;
                if(isWindowsUri && isUnixUri){status = false;}
            }
            return status;
        }
    },

    /***
     * file name validation
     */
    isValidFileName:{
        value: function(fileName){
            var status = false;
            if(fileName !== ""){
                fileName = fileName.replace(/^\s+|\s+$/g,"");
                status = !(/[/\\]/g.test(fileName));
                if(status && navigator.userAgent.indexOf("Macintosh") != -1){//for Mac files beginning with . are hidden
                    status = !(/^\./g.test(fileName));
                }
            }
            return status;
        }
    },

    /***
     * check if the file exists
     */
    checkFileExists:{
        value: function(fileUri, folderUri, fileType){
            var uri = "", response=null, status=true;

            //prepare absolute uri
            if(/[^/\\]$/g.test(folderUri)){
                folderUri = folderUri + "/";
            }

            //todo:add file extension check if fileType present

            uri = ""+folderUri+fileUri;

            response = this.application.ninja.coreIoApi.fileExists({"uri":uri});
            if(!!response && response.success && (response.status === 204)){
                status = true;
            }else if(!!response && response.success && (response.status === 404)){
                status = false;
            }else{
                status = false;
            }
            return status;
        }
    }
});