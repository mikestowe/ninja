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
