/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var MaterialParser = function MaterialParser( theStr ) {

	this._strBuffer = theStr;

	this.nextValue = function( prop, endKeyArg, advanceBufferArg ) {
		if (!this._strBuffer)  return;

		// make the 2 & 3rd argument optional.  default is to advance the string
		var endKey = "\n",  advanceBuffer = true;
		if (endKeyArg) {
			endKey = endKeyArg;
        }

		if (advanceBufferArg) {
			advanceBuffer = advanceBufferArg;
        }

		var iStart = this._strBuffer.indexOf( prop );
		if (iStart < 0)  return;

		var iEnd = this._strBuffer.indexOf( endKey, iStart );
		if (iEnd < 0)  throw new Error( "property " + prop + " improperly terminated: " + this._strBuffer);

		iStart += prop.length;
		var nChars = iEnd - iStart;
		var rtnStr = this._strBuffer.substr( iStart, nChars );

		if (advanceBuffer) {
			this._strBuffer = this._strBuffer.substr( iEnd + endKey.length  );
        }

		return rtnStr;
	};

	this.nextToken = function() {
		if (!this._strBuffer)  return;

		// find the limits
		var index = this._strBuffer.search( /\S/ );		// first non-whitespace character
		if (index > 0) this._strBuffer = this._strBuffer.slice(index);
		index   = this._strBuffer.search( /\s/ );		// first whitespace character marking the end of the token

		var token;
		if (index > 0) {
			token = this._strBuffer.slice(0, index);
			this._strBuffer = this._strBuffer.slice( index  );
		}

		return token;
	};

	this.advancePastToken = function( token ) {
		var index = this._strBuffer.indexOf( token );
		if (index < 0) {
			console.log( "could not find token: " + token + " in string: " + this._strBuffer );
        } else {
			this._strBuffer = this._strBuffer.substr( index + token.length );
        }
	}

};

if (typeof exports === "object") {
    exports.MaterialParser = MaterialParser;
}


