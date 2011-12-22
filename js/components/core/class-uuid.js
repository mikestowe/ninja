/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
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
