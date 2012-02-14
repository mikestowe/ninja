/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var g_dbgPanel = null;

/**
 * Implements an easy to use debugging panel.
 * @param id - element id of a <div> to convert into a debug panel
 * @param title - header title for the panel
 */
function utilDbgPanel(id, title)
{
  this.id = id;
  this.root = '#' + id;
  this.accordion = this.root + ' .dbgpanel-accordion';
  this.categories = {};
  this.counter = 0;

  $(this.root).addClass('dbgpanel-outer ui-widget-content');
  $(this.root).draggable({handle: this.root, containment: 'body'});
  $(this.root).resizable({minWidth: $(this.root).width(), minHeight: $(this.root).height()});

  $(this.root).append('<h3 class="dbgpanel-title">' + title + '</h3>');
  $(this.root).append('<div class="dbgpanel-accordion" />');
  $(this.accordion).accordion({clearStyle: true});
}

/**
 * Adds a label to the debug panel.
 * @param category - category to which to append a label
 */
utilDbgPanel.prototype.appendLabel = function(category, label)
{
  var cat = this.getCategorySelector(category);
  $(cat).append('<p class="dbgpanel-label">' + label + '</p>');
}

/**
 * Adds a toggle button to the debug panel.
 * @param category - category to which to append a toggle
 * @param value - current value of the boolean
 * @param label - button label
 * @param onChange - function that receives an updated value upon a change
 */
utilDbgPanel.prototype.appendBoolean = function(category, value, label, onChange)
{
  var cat = this.getCategorySelector(category);

  var button = this.getUniqueID();
  $(cat).append('<div class="dbgpanel-button"><input type="checkbox" id="' + button + '"><label for="' + button + '" class="dbgpanel-button-label"/></div>');

  $('#'+button).prop('checked', (value || (value != 0.0)));
  $('#'+button).button({label: label});
  $('#'+button).change(function(e) {
    if (e.target.checked)
      value = (typeof value == "number") ? 1.0 : true;
    else
      value = (typeof value == "number") ? 0.0 : false;
    
    if(onChange)
      onChange(value);
  });
}

/**
 * Adds a slider to the debug panel.
 * @param category - category to which to append a slider
 * @param value - current value of the number
 * @param rangeMin - minimum permitted value
 * @param rangeMax - maximum permitted value
 * @param stepSize - granularity of allowable values
 * @param onChange - function that receives an updated value upon a change
 */
utilDbgPanel.prototype.appendNumber = function(category, value, rangeMin, rangeMax, stepSize, onChange)
{
  var cat = this.getCategorySelector(category);

  var slider = this.getUniqueID();
  $(cat).append('<div id="' + slider + '" class="dbgpanel-slider"/>');

  $('#'+slider).slider({
    min: rangeMin, max: rangeMax, 
    value: value, 
    step: stepSize,
    slide: function(event, ui) {
      value = ui.value;
      if(onChange)
        onChange(value);
    },
    change: function(event, ui) {
      value = ui.value;
      if(onChange)
        onChange(value);
    }
  });
}


/**
 * Returns a unique id that can be used with child elements of this debug panel.
 */
utilDbgPanel.prototype.getUniqueID = function()
{
  return this.id + '_' + this.counter++;
}

/**
 * Queries the jquery selector corresponding to the passed accordion category.
 * @param category - category div for which to return a selector
 */
utilDbgPanel.prototype.getCategorySelector = function(category)
{
  var selector = this.categories[category];
  
  if (selector == undefined)
  {
    // Generate a selector for this category
    selector = this.getUniqueID();
  
    // Add a new div to the accordion ui
    $(this.accordion).accordion("destroy");
    $(this.accordion).append('<h3 class="dbgpanel-category-title">' + category + 
      '</h3><div id="' + selector + '" class="dbgpanel-category-content"></div>');
    $(this.accordion).accordion({clearStyle: true});

    // Store the selector
    selector = '#' + selector;
    this.categories[category] = selector;
  }
  
  return selector;
}

//////////////////////////////////
g_sg=null;
g_wireframe=false;
g_initializedDbgPanel=false;
g_showScene=true;
g_showBloom=true;
enableNormalMapping=true;
g_bloomIntensity1=0.7;
g_bloomIntensity2=0.5;
g_bloomIntensity3=1.0;
g_bloomIntensity4=0.2;
g_mainLight=null;
g_shadowLigthSize=7.93;
g_shadowColor=[1.0 - 0.922, 1.0 - 0.7373, 1.0 - 0.4824, 0.5];
g_depthMapGenShader=null;
g_showSSAO=true;
g_enableShadowMapping=true;
g_sampleRadius=0.36;
g_intensity=0.75;
g_distScale=0.60;
g_bias=0.05;
g_animationRate=1.0;
//////////////////////////////////

utilDbgPanel.prototype.enableFXDebug = function( )
{
	this.appendBoolean("General",g_showScene,"Enable scene render",function(val) { g_showScene=val; });
	this.appendBoolean("General",g_wireframe,"Enable wireframe",function(val) { g_wireframe=val; });
	this.appendBoolean("General",true,"Enable frustum culling",function(val) { g_sg.frustumCulling=val; });
	this.appendBoolean("General",enableNormalMapping,"Enable normal mapping",function(val) { enableNormalMapping=val; });
	
	
	this.appendBoolean("Shadows",g_enableShadowMapping,"Enable shadow mapping",function(val) { var scene = g_Engine.getContext().getScene();
																			scene.renderGraph.shadowDepthMap.visibility = (!val ? 0 : 1);
																			var scene = g_Engine.getContext().getScene();
																			scene.renderGraph.finalPass.shader.screenQuad.u_shadowMap.set("assets/images/white");
																			scene.renderGraph.finalPass.textures[2].enabled = val;
																			});
	this.appendLabel("Shadows","Light Size");
	this.appendNumber("Shadows",g_shadowLigthSize, 1.0, 32.0, 0.01, function(val) { var scene = g_Engine.getContext().getScene();
		scene.renderGraph.shadowMap.shader.shadowMap.u_lightSize.set([val]);});
		
	this.appendLabel("Shadows","Color-R");
	this.appendNumber("Shadows",g_shadowColor[0], 0.0, 1.0, 0.001, function(val) { var scene = g_Engine.getContext().getScene();
		g_shadowColor[0] = 1.0 - val;
		scene.renderGraph.shadowMap.shader.shadowMap.u_shadowColor.set(g_shadowColor);});
	this.appendLabel("Shadows","Color-G");
	this.appendNumber("Shadows",g_shadowColor[1], 0.0, 1.0, 0.001, function(val) { var scene = g_Engine.getContext().getScene();
		g_shadowColor[1] = 1.0 - val;
		scene.renderGraph.shadowMap.shader.shadowMap.u_shadowColor.set(g_shadowColor);});
	this.appendLabel("Shadows","Color-B");
	this.appendNumber("Shadows",g_shadowColor[2], 0.0, 1.0, 0.001, function(val) { var scene = g_Engine.getContext().getScene();
		g_shadowColor[2] = 1.0 - val;
		scene.renderGraph.shadowMap.shader.shadowMap.u_shadowColor.set(g_shadowColor);});
	this.appendLabel("Shadows","Color-A");
	this.appendNumber("Shadows",g_shadowColor[3], 0.0, 1.0, 0.001, function(val) { var scene = g_Engine.getContext().getScene();
		g_shadowColor[3] = val;
		scene.renderGraph.shadowMap.shader.shadowMap.u_shadowColor.set(g_shadowColor);});
		

	this.appendLabel("Animation","Rate");
	this.appendNumber("Animation",g_animationRate,-4.0,4.0,0.1,function(val) { g_animationRate=val; });

	this.appendBoolean("Bloom",g_showBloom,"Enable bloom",function(val) {	var scene = g_Engine.getContext().getScene();
																			scene.renderGraph.glowMap.visibility = (!val ? 0 : 1);
																			var scene = g_Engine.getContext().getScene();
																			scene.renderGraph.finalPass.shader.screenQuad.u_glowFinal.set("assets/images/black");
																			scene.renderGraph.finalPass.textures[0].enabled = val;
																			});
	this.appendLabel("Bloom","1024x1024 mip weight");
	this.appendNumber("Bloom",g_bloomIntensity1,0.0,1.5,0.01,function(val) { var scene = g_Engine.getContext().getScene();
		scene.renderGraph.blurFull.shader.gaussianBlur.u_weight.set([val]);});
	this.appendLabel("Bloom","256x256 mip weight");
	this.appendNumber("Bloom",g_bloomIntensity2,0.0,1.5,0.01,function(val) { var scene = g_Engine.getContext().getScene();
		scene.renderGraph.blurQuater.shader.gaussianBlur.u_weight.set([val]);});
	this.appendLabel("Bloom","128x128 mip weight");
	this.appendNumber("Bloom",g_bloomIntensity3,0.0,1.5,0.01,function(val) { var scene = g_Engine.getContext().getScene();
		scene.renderGraph.blurThreeQuater.shader.gaussianBlur.u_weight.set([val]);});
//	this.appendLabel("Bloom","64x64 mip weight");
//	this.appendNumber("Bloom",g_bloomIntensity4,0.0,1.5,0.01,function(val) { g_bloomIntensity4=val; });

	this.appendBoolean("Ambient Occlusion",g_showSSAO,"Enable SSAO",function(val) { var scene = g_Engine.getContext().getScene();
																					scene.renderGraph.depth_map.visibility = (!val ? 0 : 1);
																					var scene = g_Engine.getContext().getScene();
																					scene.renderGraph.finalPass.shader.screenQuad.u_ssaoRT.set("assets/images/black");
																					scene.renderGraph.finalPass.textures[1].enabled = val;
																					});
	this.appendLabel("Ambient Occlusion","Sampling radius");
	this.appendNumber("Ambient Occlusion",g_sampleRadius,0.0,5.0,0.0001,function(val) 
	{ var scene = g_Engine.getContext().getScene();
		scene.renderGraph.SSAO.shader.ssao.u_artVals.data[0] = val;})
	this.appendLabel("Ambient Occlusion","Intensity");
	this.appendNumber("Ambient Occlusion",g_intensity,0.0,3.0,0.0001,function(val) { var scene = g_Engine.getContext().getScene();
		scene.renderGraph.SSAO.shader.ssao.u_artVals.data[1] = val;});
	this.appendLabel("Ambient Occlusion","Distance scaling");
	this.appendNumber("Ambient Occlusion",g_distScale,0.0,2.0,0.0001,function(val) { var scene = g_Engine.getContext().getScene();
		scene.renderGraph.SSAO.shader.ssao.u_artVals.data[2] = val;});
	this.appendLabel("Ambient Occlusion","Bias");
	this.appendNumber("Ambient Occlusion",g_bias,0.0,0.5,0.0001,function(val) { var scene = g_Engine.getContext().getScene();
		scene.renderGraph.SSAO.shader.ssao.u_artVals.data[3] = val;});
}
