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
/* <notice>
 Code from node-uuid: https://github.com/broofa/node-uuid/raw/master/uuid.js<br/>
 MIT license https://github.com/broofa/node-uuid/blob/master/LICENSE.md<br/>
 </notice> */

/**
	@module components/core/class-uuid
    @requires montage/core/core
*/
/**
    @class components/core/class-uuid.ClassUuid
    @extends module:montage/core/core.Montage
 */
var Montage = require("montage/core/core").Montage,
    CHARS = '0123456789ABCDEF'.split(''),
    FORMAT = 'xxxxx'.split(''),

    ClassUuid = exports.ClassUuid = Montage.create(Montage,/** @lends module:montage/core/class-uuid.ClassUuid# */ {

/**
    Returns a univerally unique ID (UUID).
    @function
    @param {Property} argument TODO
    @returns {String} The UUID.
    */
        generate: {
            enumerable: false,
            value: function generate(argument) {
                var c = CHARS, id = FORMAT, r;

                id[0] = c[(r = Math.random() * 0x100000000) & 0xf];
                id[1] = c[(r >>>= 4) & 0xf];
                id[2] = c[(r >>>= 4) & 0xf];
                id[3] = c[(r >>>= 4) & 0xf];
                id[4] = c[(r >>>= 4) & 0xf];
                
                return id.join('');
            }
        }
    });
