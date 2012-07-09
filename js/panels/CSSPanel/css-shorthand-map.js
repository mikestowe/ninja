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

exports.CSS_SHORTHAND_MAP = {
    'background-attachment' : ['background'],
    'background-clip' : ['background'],
    'background-color' : ['background'],
    'background-image' : ['background'],
    'background-origin' : ['background'],
    'background-position-x' : ['background', 'background-position'],
    'background-position-y' : ['background', 'background-position'],
    'background-repeat-x' : ['background', 'background-repeat'],
    'background-repeat-y' : ['background', 'background-repeat'],

    'border-bottom' : ['border'],
    'border-bottom-color' : ['border-bottom'],
    'border-bottom-style' : ['border-bottom'],
    'border-bottom-width' : ['border-bottom'],

    'border-left' : ['border'],
    'border-left-color' : ['border-left'],
    'border-left-style' : ['border-left'],
    'border-left-width' : ['border-left'],

    'border-right' : ['border'],
    'border-right-color' : ['border-right'],
    'border-right-style' : ['border-right'],
    'border-right-width' : ['border-right'],

    'border-top' : ['border'],
    'border-top-color' : ['border-top'],
    'border-top-style' : ['border-top'],
    'border-top-width' : ['border-top'],

    'border-color' : ['border'],
    'border-style' : ['border'],

    'border-image-outset' : ['border-image'],
    'border-image-repeat' : ['border-image'],
    'border-image-slice' : ['border-image'],
    'border-image-source' : ['border-image'],
    'border-image-width' : ['border-image'],

    'border-bottom-left-radius' : ['border-radius'],
    'border-bottom-right-radius' : ['border-radius'],
    'border-top-left-radius' : ['border-radius'],
    'border-top-right-radius' : ['border-radius'],

    'font-style' : ['font'],
    'font-family' : ['font'],
    'font-size' : ['font'],
    'font-variant' : ['font'],
    'font-weight' : ['font'],

    'list-style-image' : ['list-style'],
    'list-style-position' : ['list-style'],
    'list-style-type' : ['list-style'],

    'margin-bottom' : ['margin'],
    'margin-left' : ['margin'],
    'margin-right' : ['margin'],
    'margin-top' : ['margin'],

    'padding-bottom' : ['padding'],
    'padding-left' : ['padding'],
    'padding-right' : ['padding'],
    'padding-top' : ['padding'],

    '-webkit-animation-name'            : ['-webkit-animation'],
    '-webkit-animation-duration'        : ['-webkit-animation'],
    '-webkit-animation-timing-function' : ['-webkit-animation'],
    '-webkit-animation-delay'           : ['-webkit-animation'],
    '-webkit-animation-iteration-count' : ['-webkit-animation'],
    '-webkit-animation-direction'       : ['-webkit-animation'],
    '-webkit-animation-fill-mode'       : ['-webkit-animation'],

    '-webkit-transition-property' : ['-webkit-transition'],
    '-webkit-transition-duration' : ['-webkit-transition'],
    '-webkit-transition-timing-function' : ['-webkit-transition'],
    '-webkit-transition-delay' : ['-webkit-transition']
};

exports.CSS_SHORTHAND_TO_SUBPROP_MAP = {
    'background' : ["background-image", "background-repeat-x", "background-repeat-y", "background-attachment",
                    "background-position-x", "background-position-y", "background-origin", "background-clip",
                    "background-color"],
    'border' : ['border-width', 'border-style', 'border-color'],
    'border-top' : ['border-top-width', 'border-top-style', 'border-top-color'],
    'border-right' : ['border-right-width', 'border-right-style', 'border-right-color'],
    'border-bottom' : ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
    'border-left' : ['border-left-width', 'border-left-style', 'border-left-color'],
    'border-image' : ['border-image-outset', 'border-image-repeat','border-image-slice', 'border-image-source', 'border-image-width'],
    'border-radius' : ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius",
                       "border-bottom-left-radius"],
    'font' : ["font-family", "font-size", "font-style", "font-variant", "font-weight", "line-height"],
    'list' : ["list-style-type", "list-style-image", "list-style-position"],
    'margin' : ["margin-top", "margin-right", "margin-bottom", "margin-left"],
    'padding' : ["padding-top", "padding-right", "padding-bottom", "padding-left"],
    '-webkit-animation': ["webkit-animation-name", "webkit-animation-duration", "webkit-animation-timing-function", "webkit-animation-delay", "webkit-animation-iteration-count", "webkit-animation-direction", "webkit-animation-fill-mode"],
    '-webkit-transition' : ["-webkit-transition-property", "-webkit-transition-duration",
                            "-webkit-transition-timing-function", "-webkit-transition-delay"]
};
