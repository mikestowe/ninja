/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
///////////////////////////////////////////////////////////////////////
// MaterialsLibrary module  -- Contains an array of GLMaterials.
///////////////////////////////////////////////////////////////////////
var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    AppModel = require("js/models/app-model").AppModel;

var MaterialParser = require("js/lib/rdge/materials/material-parser").MaterialParser;
var FlatMaterial = require("js/lib/rdge/materials/flat-material").FlatMaterial;
var LinearGradientMaterial = require("js/lib/rdge/materials/linear-gradient-material").LinearGradientMaterial;
var RadialGradientMaterial = require("js/lib/rdge/materials/radial-gradient-material").RadialGradientMaterial;
var BumpMetalMaterial = require("js/lib/rdge/materials/bump-metal-material").BumpMetalMaterial;
var UberMaterial = require("js/lib/rdge/materials/uber-material").UberMaterial;
//var CloudMaterial = require("js/lib/rdge/materials/cloud-material").CloudMaterial;
//var RadialBlurMaterial = require("js/lib/rdge/materials/radial-blur-material").RadialBlurMaterial;
//var RaidersMaterial = require("js/lib/rdge/materials/radial-blur-material").RaidersMaterial;
var PlasmaMaterial = require("js/lib/rdge/materials/plasma-material").PlasmaMaterial;
var PulseMaterial = require("js/lib/rdge/materials/pulse-material").PulseMaterial;
//var TunnelMaterial = require("js/lib/rdge/materials/tunnel-material").TunnelMaterial;
//var ReliefTunnelMaterial = require("js/lib/rdge/materials/relief-tunnel-material").ReliefTunnelMaterial;
var FlagMaterial = require("js/lib/rdge/materials/flag-material").FlagMaterial;
//var SquareTunnelMaterial = require("js/lib/rdge/materials/square-tunnel-material").SquareTunnelMaterial;
//var FlyMaterial = require("js/lib/rdge/materials/fly-material").FlyMaterial;
var WaterMaterial = require("js/lib/rdge/materials/water-material").WaterMaterial;
var ParisMaterial = require("js/lib/rdge/materials/water-material").ParisMaterial;
//var ZInvertMaterial = require("js/lib/rdge/materials/z-invert-material").ZInvertMaterial;
//var DeformMaterial = require("js/lib/rdge/materials/deform-material").DeformMaterial;
//var StarMaterial = require("js/lib/rdge/materials/star-material").StarMaterial;
//var TwistMaterial = require("js/lib/rdge/materials/twist-material").TwistMaterial;
var TwistVertMaterial = require("js/lib/rdge/materials/twist-vert-material").TwistVertMaterial;
var TaperMaterial = require("js/lib/rdge/materials/taper-material").TaperMaterial;
//var JuliaMaterial = require("js/lib/rdge/materials/julia-material").JuliaMaterial;
//var KeleidoscopeMaterial = require("js/lib/rdge/materials/keleidoscope-material").KeleidoscopeMaterial;
//var MandelMaterial = require("js/lib/rdge/materials/mandel-material").MandelMaterial;


exports.MaterialsModel = Montage.create(Component, {

    hasTemplate: {
        value: false
    },

    deserializedFromTemplate: {
        value: function() {
            // Load all the materials
            this.addMaterial(new FlatMaterial());
            this.addMaterial(new BumpMetalMaterial());
            //this.addMaterial(new CloudMaterial());
            //this.addMaterial(new DeformMaterial());
            this.addMaterial(new FlagMaterial());
            //this.addMaterial(new FlyMaterial());
            //this.addMaterial(new JuliaMaterial());
            //this.addMaterial(new KeleidoscopeMaterial());
            this.addMaterial(new LinearGradientMaterial());
            //this.addMaterial(new MandelMaterial());
            this.addMaterial(new ParisMaterial());
            this.addMaterial(new PlasmaMaterial());
            this.addMaterial(new PulseMaterial());
            //this.addMaterial(new RadialBlurMaterial());
            this.addMaterial(new RadialGradientMaterial());
            //this.addMaterial(new RaidersMaterial());
            //this.addMaterial(new ReliefTunnelMaterial());
            //this.addMaterial(new SquareTunnelMaterial());
            //this.addMaterial(new StarMaterial());
            this.addMaterial(new TaperMaterial());
            //this.addMaterial(new TunnelMaterial());
            //this.addMaterial(new TwistMaterial());
            this.addMaterial(new TwistVertMaterial());
            this.addMaterial(new UberMaterial());
            this.addMaterial(new WaterMaterial());
            //this.addMaterial(new ZInvertMaterial());
        }
    },

    _materials : {
        value: AppModel.materials
    },

    materials : {
        get: function() {
            return this._materials;
        }
    },

    addMaterial: {
        value: function (material) {
            this._materials.push(material);
        }
    },

    addMaterialAt: {
        value: function (material, index) {
            this._materials.splice(index, 0, material);
        }
    },

    removeMaterialAt: {
        value: function (index) {
            return this._materials.splice(index, 1);
        }
    },

    removeMaterial: {
        value: function (materialName) {
            var index = this.getIndexOfMaterial(materialName);
            if(index !== -1) {
                return this.removeMaterialAt(index);
            }
        }
    },

    getMaterialAt: {
        value: function (index) {
            return this._materials[index];
        }
    },

    getMaterial: {
        value: function (materialName) {
            var index = this.getIndexOfMaterial(materialName);
            if(index !== -1) {
                return this._materials[index];
            }
        }
    },

    getMaterialByShader:
    {
        value: function( shaderName )
        {
            var index = this.getIndexOfMaterialByShader( shaderName );
            if (index >= 0)
                return this._materials[index];
        }
    },

    getIndexOfMaterialByShader: {
        value: function (shaderName) {
            var len = this._materials.length;
            for(var i=0; i<len; i++) {
                var material = this._materials[i];
                if(material.getShaderName() === shaderName) {
                    return i;
                }
            }

            return -1;
        }
    },

    getIndexOfMaterial: {
        value: function (materialName) {
            var len = this._materials.length;
            for(var i=0; i<len; i++) {
                var material = this._materials[i];
                if(material.getName() === materialName) {
                    return i;
                }
            }

            return -1;
        }
    },

    clearAllMaterials: {
        value: function() {
            this._materials = [];
        }
    },

    exportFlatMaterial: {
        value: function() {
            return new FlatMaterial();
        }
    },

    getDefaultMaterialName: {
        value: function() {
            return "Flat";
        }
    },

    exportMaterials: {
        value: function()
        {
            var matArray = [];
            var nMats = this._materials.length;
            for (var i=0;  i<nMats;  i++) {
                var material = this._materials[i];
                var matObj = material.exportJSON();
                matArray.push( matObj );
            }

            var jObj =
            {
                'materialLibrary':  1.0,
                'materials':        matArray
            };

            // prepend an identifiable string to aid parsing when the
            // material model is loaded.
            var jStr = "materialLibrary;" + JSON.stringify( jObj );

            return jStr;
        }
    },

    createMaterialByShaderName:
    {
        value: function(shaderName)
        {
            var mat;
            switch (shaderName)
            {
                case "flat":                mat = new FlatMaterial();               break;
                case "linearGradient":      mat = new LinearGradientMaterial();     break;
                case "radialGradient":      mat = new RadialGradientMaterial();     break;
                case "bumpMetal":           mat = new BumpMetalMaterial();          break;
                case "uber":                mat = new UberMaterial();               break;
                //case "cloud":             mat = new CloudMaterial();              break;

                case "taper":               mat = new TaperMaterial();              break;
                case "twistVert":           mat = new TwistVertMaterial();          break;
                //case "radialBlur":          mat = new RadialBlurMaterial();         break;
                case "plasma":              mat = new PlasmaMaterial();             break;
                case "pulse":               mat = new PulseMaterial();              break;
                //case "tunnel":              mat = new TunnelMaterial();             break;
                //case "reliefTunnel":        mat = new ReliefTunnelMaterial();       break;
                //case "squareTunnel":        mat = new SquareTunnelMaterial();       break;
                case "flag":                mat = new FlagMaterial();               break;
                //case "fly":                 mat = new FlyMaterial();                break;
                case "water":               mat = new WaterMaterial();              break;
                case "paris":               mat = new ParisMaterial();              break;
                //case "raiders":             mat = new RaidersMaterial();            break;
                //case "zinvert":             mat = new ZInvertMaterial();            break;
                //case "deform":              mat = new DeformMaterial();             break;
                //case "star":                mat = new StarMaterial();               break;
                //case "twist":               mat = new TwistMaterial();              break;
                //case "julia":               mat = new JuliaMaterial();              break;
                //case "keleidoscope":        mat = new KeleidoscopeMaterial();       break;
                //case "mandel":              mat = new MandelMaterial();             break;


                default:
                    console.log( "Unrecognized shader name: " + shaderName );
                    break;
            }

            return mat;
        }
    },

    importMaterials: {
        value: function( jObj )
        {
            // make sure we have some materials to import before doing anything
            var matArray = jObj.materials;
            if (!matArray)  return;

            // we replace allmaterials, so remove anything
            // that is currently there.
            this.clearAllMaterials();

            var nMats = matArray.length;
            for (var i=0;  i<nMats;  i++)
            {
                var jMatObj = matArray[i];
                var type = jMatObj.material;
                var mat = this.createMaterialByShaderName( type );
                if (mat) {
                    importStr = mat.importJSON( jMatObj );
                    this.addMaterial( mat );
                }
            }

            return;
        }
    }

});


