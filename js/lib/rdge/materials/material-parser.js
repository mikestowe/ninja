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

var MaterialParser = function MaterialParser(theStr) {

    this._strBuffer = theStr;

    this.nextValue = function (prop, endKeyArg, advanceBufferArg) {
        if (!this._strBuffer) return;

        // make the 2 & 3rd argument optional.  default is to advance the string
        var endKey = "\n", advanceBuffer = true;
        if (endKeyArg) {
            endKey = endKeyArg;
        }

        if (advanceBufferArg) {
            advanceBuffer = advanceBufferArg;
        }

        var iStart = this._strBuffer.indexOf(prop);
        if (iStart < 0) return;

        var iEnd = this._strBuffer.indexOf(endKey, iStart);
        if (iEnd < 0) throw new Error("property " + prop + " improperly terminated: " + this._strBuffer);

        iStart += prop.length;
        var nChars = iEnd - iStart;
        var rtnStr = this._strBuffer.substr(iStart, nChars);

        if (advanceBuffer) {
            this._strBuffer = this._strBuffer.substr(iEnd + endKey.length);
        }

        return rtnStr;
    };

    this.nextToken = function () {
        if (!this._strBuffer) return;

        // find the limits
        var index = this._strBuffer.search(/\S/); 	// first non-whitespace character
        if (index > 0) this._strBuffer = this._strBuffer.slice(index);
        index = this._strBuffer.search(/\s/); 	// first whitespace character marking the end of the token

        var token;
        if (index > 0) {
            token = this._strBuffer.slice(0, index);
            this._strBuffer = this._strBuffer.slice(index);
        }

        return token;
    };

    this.advancePastToken = function (token) {
        var index = this._strBuffer.indexOf(token);
        if (index < 0) {
            console.log("could not find token: " + token + " in string: " + this._strBuffer);
        } else {
            this._strBuffer = this._strBuffer.substr(index + token.length);
        }
    };
};

if (typeof exports === "object") {
    exports.MaterialParser = MaterialParser;
}


