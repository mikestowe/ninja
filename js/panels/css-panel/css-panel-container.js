/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage;
var PanelBase = require("js/panels/PanelBase").PanelBase;
var Content = require("js/panels/css-panel/css-panel.reel").CSSPanelNew;

exports.CSSPanelContainer = Montage.create(PanelBase, {
    panelName : { value: "CSSPanelNew" },
    minHeight : { value: 200 },
    content : { value: Content }
});