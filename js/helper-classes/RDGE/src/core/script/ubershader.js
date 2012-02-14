/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
 
 /* UBERSHADER */ 
/*
    The ubershader function takes a JSON definition object and creates a jshader 
    that supports all or a subset of ubershader features. The ubershader currently 
    supports up to four per-pixel lights, optional diffuse, normal, specular, and 
    environment map textures. Lights can be directional, point, or spot lights. The 
    resulting shader is very much optimized based on the given use case, so if the 
    configuration changes, such as by adding a light, removing a texture, or even 
    changing the type of a light) then the shader needs to be rebuilt and recompiled 
    to reflect those changes.  
*/
ubershader = function(def) {
    var r = new XMLHttpRequest();
    r.open('GET', "assets/shaders/ub_vshader.glsl", false);
    r.send(null);
    if (r.status == 200) {
        vshader = r.responseText;
    }
    r.open('GET', "assets/shaders/ub_fshader.glsl", false);
    r.send(null);
    if (r.status == 200) {
        fshader = r.responseText;
    }
    var preproc = "";
//    var paramBlock = {};

//    paramBlock['u_uvMatrix'] = { 'type': 'mat4' };

    if (typeof def.material != 'undefined') {
        preproc += '#define MATERIAL\n';
    }
    if (typeof def.lighting != 'undefined') {
        preproc += '#define LIGHTING\n';
        preproc += '#define SPECULAR\n';
        for (i = 0; i < 4; ++i) {
            var light = def.lighting['light' + i];
            var t;
            if (typeof light != 'undefined') {
                switch (light.type) {
                    case 'directional': t = 0; break;
                    case 'point': t = 1; break;
                    case 'spot': t = 2; break;
                }
                preproc += '#define LIGHT_' + i + ' ' + t + '\n';
                preproc += '#define LIGHT_' + i + '_SPECULAR\n';
            }
        }
    }
    if (typeof def.diffuseMap != 'undefined') {
        preproc += '#define DIFFUSE_MAP\n';
    }
    if (typeof def.normalMap != 'undefined') {
        preproc += '#define NORMAL_MAP\n';
    }
    if (typeof def.specularMap != 'undefined') {
        preproc += '#define SPECULAR_MAP\n';
    }
    if (typeof def.environmentMap != 'undefined') {
        preproc += '#define ENVIRONMENT_MAP\n';
    }

    // prefix preprocessor settings
    vshader = preproc + vshader;
    fshader = preproc + fshader;

    // build output jshader    
    uberJShader = new jshader();
    uberJShader.def = {
        'shaders': {
            'defaultVShader': vshader,
            'defaultFShader': fshader
        },
        'techniques': {
            'defaultTechnique': [{
                'vshader': 'defaultVShader',
                'fshader': 'defaultFShader',
                'attributes': {
                    'a_pos': { 'type': 'vec3' },
                    'a_normal': { 'type': 'vec3' },
                    'a_texcoord': { 'type': 'vec2' }
                },
                'params': {
                    specularColor : 'u_specularColor',
                },
                'states': {
                    'depthEnable': true,
                    'blendEnable': false,
                    'culling': true,
                    'cullFace': "FRONT"
                }
            }]
            }
        }
        // initialize the jshader
        uberJShader.init();

        // initialize shader parameters
        var technique = uberJShader.defaultTechnique;
        if (typeof def.material != 'undefined') {
            technique.u_ambientColor.set(def.material.ambientColor);
            technique.u_diffuseColor.set(def.material.diffuseColor);
            if (technique.u_specularColor)
                technique.u_specularColor.set(def.material.specularColor);
            if (technique.u_specularPower)
                technique.u_specularPower.set([def.material.specularPower]);
        }
        if (typeof def.lighting != 'undefined') {
            for (i = 0; i < 4; ++i) {
                var light = def.lighting["light" + i];
                if (typeof light != "undefined") {
                    if (light.type == 'directional') {
                        paramBlock['u_light' + i + 'Dir'] = { 'type': 'vec3' };
                        technique['u_light' + i + 'Dir'].set(light['direction'] || [0, 0, 1]);
                    }
                    else if (light.type == 'spot') {
                        paramBlock['u_light' + i + 'Spot'] = { 'type': 'vec2' };
                        technique['u_light' + i + 'Position'].set(light['position'] || [0, 0, 0]);
                        var deg2Rad = Math.PI / 180;
                        technique['u_light' + i + 'Spot'].set([Math.cos((light['spotInnerCutoff'] || 45.0) * deg2Rad),
                                                        Math.cos((light['spotOuterCutoff'] || 90.0) * deg2Rad)]);
                        technique['u_light' + i + 'Atten'].set(light['attenuation'] || [1, 0, 0]);
                    } else {
                        technique['u_light' + i + 'Position'].set(light['position'] || [0, 0, 0]);
                        technique['u_light' + i + 'Atten'].set(light['attenuation'] || [1, 0, 0]);
                    }
                    technique['u_light' + i + 'Color'].set(light['diffuseColor'] || [1, 1, 1, 1]);
                    technique['u_light' + i + 'Specular'].set(light['specularColor'] || [1, 1, 1, 1]);
                }
            }
        }

        if (technique.u_uvMatrix)
            technique.u_uvMatrix.set(def.uvTransform || mat4.identity());

        renderer = g_Engine.getContext().renderer;
        if (technique.s_diffuseMap && typeof def.diffuseMap != 'undefined') {
            technique.s_diffuseMap.set(renderer.getTextureByName(def.diffuseMap.texture, def.diffuseMap.wrap, def.diffuseMap.mips));
        }
        if (technique.s_normalMap && typeof def.normalMap != 'undefined') {
            technique.s_normalMap.set(renderer.getTextureByName(def.normalMap.texture, def.normalMap.wrap, def.normalMap.mips));
        }
        if (technique.s_specMap && typeof def.specularMap != 'undefined') {
            technique.s_specMap.set(renderer.getTextureByName(def.specularMap.texture, def.specularMap.wrap));
        }
        if (technique.s_envMap && typeof def.environmentMap != 'undefined') {
            technique.s_envMap.set(renderer.getTextureByName(def.environmentMap.texture, def.environmentMap.wrap));
        }
        if (technique.u_envReflection) {
            technique.u_envReflection.set([def.environmentMap.envReflection || 1.0]);
        }
        return uberJShader;
    }

