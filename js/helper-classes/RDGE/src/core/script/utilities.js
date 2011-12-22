/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

function getRandColor()
{
  var r = Math.random();
  var g = Math.random();
  var b =Math.random();
  
  return [r, g, b, 1.0];
}


function unProject( winx, winy, winz, modelMatrix, projMatrix, viewport)
{    
    var inVal   = [0,0,0,0];

    var finalMatrix = mat4.mul( modelMatrix, projMatrix );
    
    finalMatrix = mat4.inverse(finalMatrix);
    if(!finalMatrix)
      return  null;

    inVal[0]=winx;
    inVal[1]=winy;
    inVal[2]=winz;
    inVal[3]=1.0;

    /* Map x and y from window coordinates */
    inVal[0] = (inVal[0] - viewport[0]) / viewport[2];
    inVal[1] = (inVal[1] - viewport[1]) / viewport[3];

    /* Map to range -1 to 1 */
    inVal[0] = inVal[0] * 2 - 1;
    inVal[1] = inVal[1] * 2 - 1;
    inVal[2] = inVal[2] * 2 - 1;

    var v4Out = mat4.transformPoint( finalMatrix, inVal );
    
    if (v4Out[3] <= 0.0001) 
		return null;
    
    v4Out[0] /= v4Out[3];
    v4Out[1] /= v4Out[3];
    v4Out[2] /= v4Out[3];
    
    return [ v4Out[0], v4Out[1], v4Out[2] ];
}

function AABB2LineSegment(box, startPoint, endPoint )
{
  c = vec3.scale( vec3.add(box.min, box.max), 0.5 );
  e = vec3.sub(box.max, box.min);
  d = vec3.sub(endPoint, startPoint);
  m = vec3.sub(startPoint, endPoint); 
  m = vec3.sub(m, box.min),
  m = vec3.sub(m, box.max);

  var adx = Math.abs(d[0]);
  if( Math.abs(m[0]) > e[0] + adx ) return false;
  
  var ady = Math.abs(d[1]);
  if( Math.abs(m[1]) > e[1] + ady ) return false;

  var adz = Math.abs(d[2]);
  if( Math.abs(m[2]) > e[2] + adz ) return false;

  adx += 1.192092896e-07;
  ady += 1.192092896e-07;
  adz += 1.192092896e-07;

  if( Math.abs(m[1] * d[2] - m[2] * d[1]) > e[1] * adz + e[2] * ady ) return false;
  if( Math.abs(m[2] * d[0] - m[0] * d[2]) > e[0] * adz + e[2] * adx ) return false;
  if( Math.abs(m[0] * d[1] - m[1] * d[0]) > e[0] * ady + e[1] * adx ) return false;

  return true;
}

function hitTest(mesh, near, far)
{
  // holds distance to the nearst BV
  var dist = null;
  var BV = null;
  
  for(var index = 0; index < mesh.BVL.length; index++)
  {
    if(AABB2LineSegment(mesh.BVL[index], near, far))
    {
      var center = vec3.scale( vec3.add(mesh.BVL[index].min, mesh.BVL[index].max), 0.5 );
      var newDist = vec3.dot( mat4.row( g_cam.world, 2 ), center);
      if(newDist < dist || dist == null)
      {
        dist = newDist;
        BV = mesh.BVL[index];
      }
    }
  }
  return BV;
}



//
// loadShader
//
// 'shaderId' is the id of a <script> element containing the shader source string.
// Load this shader and return the WebGLShader object corresponding to it.
//
function loadShader(ctx, shaderType, shaderStr)
{

  // pre-pend preprocessor settings
  
  var preProcessor = "#define PC\n"
  preProcessor += shaderStr;
  shaderStr = preProcessor;

    // Create the shader object
    var shader = ctx.createShader(shaderType);
    if (shader == null) {

        ctx.console.log("*** Error: unable to create shader '"+shaderType+"'");       

        return null;
    }

    // Load the shader source
    ctx.shaderSource(shader, shaderStr);

    // Compile the shader
    ctx.compileShader(shader);

    // Check the compile status
    var compiled = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        var error = ctx.getShaderInfoLog(shader);

        ctx.console.log("*** Error compiling shader '"+shaderType+"':"+error);

        ctx.deleteShader(shader);
        return null;
    }

    return shader;
}

// creates id for shader
g_shaderCounter = 0;
function createShader(ctx, strVertShaderName, strFragShaderName, attribs)
{
  var vShader = '', fShader = '';

  if (strVertShaderName.indexOf('{') != -1) {
    vShader = strVertShaderName;
  } else 
  {
	var vshaderRequest = new XMLHttpRequest();
	vshaderRequest.open("GET", 'assets/shaders/' + strVertShaderName + '.glsl', false);
	vshaderRequest.send(null);
	vShader = vshaderRequest.responseText;
  }

  if (strFragShaderName.indexOf('{') != -1) {
    fShader = strFragShaderName;
  } else 
  {
	var fshaderRequest = new XMLHttpRequest();
    fshaderRequest.open("GET", 'assets/shaders/' + strFragShaderName + '.glsl', false);
    fshaderRequest.send(null);
	fShader = fshaderRequest.responseText;
  }

  ctx.useProgram(null);
  // create our shaders
    var vertexShader = loadShader(ctx, ctx.VERTEX_SHADER, vShader);
    var fragmentShader = loadShader(ctx, ctx.FRAGMENT_SHADER, fShader);

    if (!vertexShader || !fragmentShader)
        return null;

    // Create the program object
    var program = ctx.createProgram();

    if (! program)
        return null;

    // Attach our two shaders to the program
    ctx.attachShader (program, vertexShader);
    ctx.attachShader (program, fragmentShader);

    // Bind attributes
    for (var i in attribs)
        ctx.bindAttribLocation (program, i, attribs[i]);

    // Link the program
    ctx.linkProgram(program);

    // Check the link status
    var linked = ctx.getProgramParameter( program, ctx.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        var error = ctx.getProgramInfoLog (program);

        ctx.console.log("Error in program linking:"+error);


        ctx.deleteProgram(program);
        ctx.deleteProgram(fragmentShader);
        ctx.deleteProgram(vertexShader);

        return null;
    }
    
    program.shaderID = "Shader" + g_shaderCounter++;
    program.vname = strVertShaderName;
    program.RDGEUniform = new RDGEUniformInit();

  return program;
}

function getBaseURL() {
    var url = location.href;  // entire url including querystring - also: window.location.href;
    var baseURL = url.substring(0, url.indexOf('/', 14));


    if (baseURL.indexOf('http://localhost') != -1) {
        // Base Url for localhost
        var url = location.href;  // window.location.href;
        var pathname = location.pathname;  // window.location.pathname;
        var index1 = url.indexOf(pathname);
        var index2 = url.indexOf("/", index1 + 1);
        var baseLocalUrl = url.substr(0, index2);

        return baseLocalUrl + "/";
    }
    else {
        // Root Url for domain name
        return baseURL + "/";
    }

}
