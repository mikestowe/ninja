/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

function Shader(name, shaderHandle, renderProc, initRenderProc, envMap)
{
    this.name           = name;
    this.shaderHandle   = shaderHandle;
    this.initRenderProc = initRenderProc;
    this.renderProc     = renderProc;
    this.postRenderProc = postRenderProcDefault;
    this.envMap         = envMap;
    this.envDiff        = envMap;
}

function ShaderManager()
{
    this.shaderMap = [];
}

ShaderManager.prototype.addShader = function(name, vShader, fShader, attribs, renderProc, initRenderProc, envMapName, envDiffMapName)
{
    var shader = this.shaderMap[name];
    if(shader == undefined)
    {
		
        var handle = createShader(g_Engine.getContext().renderer.ctx, vShader, fShader, attribs);
      if (envMapName != undefined || envDiffMapName != undefined)
      {
              var envMap = g_texMan.loadMaterial(envMapName);
              var envDiff = g_texMan.loadMaterial(envDiffMapName);
              this.shaderMap[name] = new Shader(name, handle, renderProc, initRenderProc, envMap);
              this.shaderMap[name].envDiff = envDiff;
      }
      else
      {
              this.shaderMap[name] = new Shader(name, handle, renderProc, initRenderProc, null);
              this.shaderMap[name].envDiff = null;
      }
      
      this.shaderMap[name].name = name;   
        
        return this.shaderMap[name];
    }
    
    return shader;
}

ShaderManager.prototype.getShaderNames = function()
{
    var names = [];
    for(var index in this.shaderMap)
    {
        names.push(this.shaderMap[index].name);
    }
    
    return names;
}

ShaderManager.prototype.getShaderByName = function(name)
{
    var shader = this.shaderMap[name];
    
    if(shader != undefined && shader != null)
        return shader;
        
//     gl.console.log("No shader by the name of: \"" + name + "\"");
    
    return null;
}


/**
* Setup shader names
**/
ShaderManager.prototype.init = function()
{
    // create shaders for each look
    this.addShader(    "default",  vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_DullPlastic.png",     "material_DullPlastic.png" );
    this.addShader(    "barlights",vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_barlights.png",       "material_barlightsDull.png");
    this.addShader(    "gloss",    vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_gloss.png",           "material_glossDull.png"   );
    this.addShader(    "inGlass",  vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_inGlass.png",         "material_inGlassDull.png");
    this.addShader(    "normals",  vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_normal.png",          "material_normalDull.png"  );
    this.addShader(    "paint",    vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_paint.png",           "material_paintDull.png"   );
    this.addShader(    "plastic",  vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_plastic.png",         "material_plasticDull.png" );
    this.addShader(    "shadows",  vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_shadows.png",         "material_shadowsDull.png" );
    this.addShader(    "skin",     vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_skin.png",            "material_skinDull.png"    );
    this.addShader(    "wax",      vortexVShader, vortexFShader, ["vert", "normal", "texcoord"], renderProcDefault, renderInitProcDefault, "material_wax.png",             "material_waxDull.png"     );
    
    // used by backdrop
    this.addShader("shadowReceiver",shadow_vshader, shadow_fshader, ["vert", "normal", "texcoord"], renderProcShadowReceiver, renderInitShadowReceiver);
    this.addShader("shadowProj", shadowProj_vshader, shadowProj_fshader, [ "vert", "normal", "texcoord"], renderProcShadowProjection, renderInitShadowProjection);
    
}
