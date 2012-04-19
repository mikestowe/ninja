/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

// RDGE namespaces
var RDGE = RDGE || {};

// manage light links
RDGE.LightManager = function (lightUniformList) {
    // build a list of all light uniforms, contains a list of light uniform lists
    this.lightUniforms = [[], [], [], []];

    // bucket the uniforms lists
    for (var l in lightUniformList) {
        // starts with
        if (l.indexOf("u_light0") == 0) {
            this.lightUniforms[0][l] = l;
        }
        else if (l.indexOf("u_light1") == 0) {
            this.lightUniforms[1][l] = l;
        }
        else if (l.indexOf("u_light2") == 0) {
            this.lightUniforms[2][l] = l;
        }
        else if (l.indexOf("u_light3") == 0) {
            this.lightUniforms[3][l] = l;
        }
    }

    // maps (takes a string returns an object)
    this.lightToMesh = []; // pass light name, returns light of meshes
    this.meshToLight = []; // pass mesh name, returns list of lights

    // list of light objects by type
    this.dirLights = [];
    this.pointLights = [];
    this.spotLights = [];
    this.ambLights = [];
    this.unknLights = [];

    // light types
    this.typePointLight = "point_light";
    this.typeSpotLight = "spot_light";
    this.typeAmbLight = "amb_light";
    this.typeDirLight = "dir_light";

    this.defaultLights =
	[
		RDGE.createLightNode("default0"),
		RDGE.createLightNode("default1"),
		RDGE.createLightNode("default2"),
		RDGE.createLightNode("default3")
	];
};

/*
*  configuration function called when loading the scene
*/
RDGE.LightManager.prototype.setMapping = function (theLightNode, theLinks) {
    this.lightToMesh[theLightNode.name] = theLinks;

    for (var lghtIdx = 0; lghtIdx < theLinks.length; lghtIdx++) {
        var lightList = this.meshToLight[theLinks[lghtIdx]]; // check if mapping list exists

        if (lightList !== undefined) {
            lightList.push(theLightNode);
        } else {
            // create new light list and add light list mapping
            lightList = [];
            lightList.push(theLightNode);
            this.meshToLight[theLinks[lghtIdx]] = lightList;

        }
    }

    if (theLightNode.typeName == this.typePointLight) {
        this.pointLights.push(theLightNode);
    } else if (theLightNode.typeName == this.typeSpotLight) {
        this.spotLights.push(theLightNode);
    } else if (theLightNode.typeName == this.typeAmbLight) {
        this.ambLights.push(theLightNode);
    } else if (theLightNode.typeName == this.typeDirLight) {
        this.dirLights.push(theLightNode);
    } else {
        this.unknLights.push(theLightNode);
    }


};

RDGE.LightManager.prototype.getLightsForMesh = function (mesh) {
    return this.meshToLight[mesh];
};
