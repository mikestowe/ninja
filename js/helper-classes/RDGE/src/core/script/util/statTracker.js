/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var stat = (function() {
    pages = {};
    dlgId = "";

    self = function(cat, name, value, func, reset) {
        if (reset == undefined) {
            reset = true;
        }
        category = (!cat) ? 'default' : cat;
        if (!pages[category]) {
            pages[category] = [];
        }
        pages[category].push(this);
        this.name = name;
        this.defValue = value;
        this.value = value;
        this.func = func;
        this.reset = reset;
        this.reportInterval = 500;

        stat.dirty = true;
        stat.find = function(cat, name) {
            var stats = pages[cat];
            for (i = 0; i < stats.length; ++i) {
                if (stats[i].name == name) {
                    return stats[i];
                }
            }
            return null;
        }
        stat.closePage = function(id) {
            pages[id] = null;
            stat.dirty = true;
        }
        stat.reportAll = function(id) {
            if (stat.dirty == true) {
                var e = document.getElementById(id);
                if (!e) {
                    return;
                }
                var str = "<div id=\"stat_tabs\">";
                str += "<ul>";
                for (cat in pages) {
                    if (!pages[cat])
                        continue;
                    str += "<li><a href=\"#" + cat + "\">" + cat + "</a></li>";
                }
                str += "</ul>";
                for (cat in pages) {
                    if (!pages[cat])
                        continue;
                    str += "<div id=\"" + cat + "\">";
                    str += "</div>";
                }
                str += "</div>";

                e.innerHTML = str;
                $("#stat_tabs").tabs();
                stat.dirty = false;
            }

            for (cat in pages) {
                var c = document.getElementById(cat);
                stat.report(c, cat, id);
            }
        }

        stat.report = function(e, cat, id) {
            if (!cat) {
                cat = 'default';
            }
            var stats = pages[cat];
            if (!stats) {
                return;
            }
            outputHTML = "<table width=\"100%\" cellspacing = 1 border = 0><tr>";
            var n = 0;
            for (i = 0; i < stats.length; ++i) {
                outputHTML += "<td width=200 align=center bgcolor=\"#3F3F3F\">";

                if (stats[i].func) {
                    outputHTML += stats[i].name + " : " + stats[i].func(stats[i].value);
                } else {
                    outputHTML += stats[i].name + " : " + stats[i].value;
                }
                outputHTML += "</td>";
                if (n++ >= 3) {
                    outputHTML += "</tr><tr>";
                    n = 0;
                }
                if (stats[i].reset) {
                    stats[i].value = stats[i].defValue;
                }
            }
            outputHTML += "</tr></table>";

            e.innerHTML = outputHTML;
        }
    }
    var fr = function() { self.reportAll("RDGE_STATS"); };
    setInterval(fr, 500);
    return self;
}
)();

dbCanvas = function(width, height) {
	this.front = document.createElement('canvas'); 
	this.front.setAttribute("width", width);
	this.front.setAttribute("height", height);
	this.front.setAttribute("style", "position:absolute; margin: 0.0em; padding: 0.0em;");	
	this.front.ctx = this.front.getContext("2d");
			
	this.back = document.createElement('canvas'); 
	this.back.setAttribute("width", width);
	this.back.setAttribute("height", height);
	this.front.setAttribute("style", "position:absolute; margin: 0.0em; padding: 0.0em;");	
	this.back.ctx = this.back.getContext("2d");
	this.swap = function() {
		var tmp = this.front; 
		this.front = this.back;
		this.back = tmp;
		
		this.front.style.visibility='visible';
		this.back.style.visibility='hidden';		
	}
}

function getCanvasDimensions(canvas) {
    var canvas = canvas;
    var dim = {};
    dim.x = 0.0; 
    dim.y = 0.0; 
    dim.width = canvas.width;
    dim.height = canvas.height;
    
    var obj = canvas;
    if ( obj.offsetParent ) {
        do {
            dim.x += obj.offsetLeft;
            dim.y += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return dim;
}

graph2D = function(title, id, w, h, minRng, maxRng, style) {
	this.style = style || { 'bgcolor' : "#000" };
	this.sampleRes = 512;
	this.scale = 1.0;
	this.rangeMin = minRng;
	this.rangeMax = maxRng;
	this.offsetY = 0.0;
	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute("width", w);
	this.canvas.setAttribute("height", h-32);
	this.canvas.setAttribute("style", "position:absolute; margin: 0.0em; padding: 0.0em;");	
	self = this;
	this.onclick = function(e) {
		var dim = getCanvasDimensions(self.canvas);
		var mx = e.clientX - dim.x;
		var my = e.clientY - dim.y;
		for( var i = 0; i < self.tracked.length; ++i) {
			var cb = self.tracked[i].checkbox;
			var l = cb.x;
			var r = cb.x + cb.w;
			var t = cb.y;
			var b = cb.y + cb.h;			
			if( mx < l )
				continue;
			if( mx > r )
				continue;		
			if( my > b )
				continue;		
			if( my < t )
				continue;
			self.tracked[i].hide = !self.tracked[i].hide;				
			break;							
		}		
	}
	this.canvas.onclick = this.onclick;
	this.ctx = this.canvas.getContext("2d");
		
	this.tracked = [];
	this.addStat = function(label, stat, color, hidden) {
		this.tracked.push({ 'label': label, 'stat': stat, 'color' : color, 'samples' : [], 'hide' : hidden, 'checkbox' : { 'x':0, 'y':0, 'w':12, 'h':12 } });
	}
	
	this.markers = [];
	this.addMarker = function(label, v, color) {
		if( ( v.slice ) && ( typeof v.slice === 'function' ) ) {
			for( i = 0; i < v.length; ++i ) {
				this.markers.push({ 'label' : label + i, 'value' : v[i], 'color' : color });			
			}
		} else if( typeof v === 'object' ) {
			var rng = v.max - v.min; 
			var count = rng / v.interval;
			var step = v.interval;
			for( i = 0; i <= count; ++i ) {
				this.markers.push({ 'label' : label + i, 'value' : ( i * step ) - v.min, 'color' : color });			
			}			
		} else {
			this.markers.push({ 'label' : label, 'value' : v, 'color' : color });
		}
	}
	
	this.update = function() {
		for( var i = 0; i < this.tracked.length; ++i) {
			var t = this.tracked[i];

			// sample
			if(t.samples.length > this.sampleRes) {
				t.samples.shift();
			}
			t.samples.push(t.stat.value);
		}	
	}
	
	this.draw = function() {
		var cvs = this.canvas;
		var ctx = this.ctx;
		var w = cvs.width;
		var h = cvs.height;
		var minR = this.rangeMin * this.scale;
		var maxR = this.rangeMax * this.scale;
		var denom = 1.0 / ( maxR - minR );
		var numCols = 4;
		var numRows = Math.floor( this.tracked.length / numCols + 0.5 );
		
		var footerHeight = 16.0 + numRows * 16.0;
		var offsetY = footerHeight;
		
	
		ctx.fillStyle = this.style.bgcolor;		
		ctx.strokeStyle = this.style.bgcolor;
		ctx.fillRect (0, 0, w, h-footerHeight);
		
		// draw marker lines
		for( var i = 0; i < this.markers.length; ++i) {		
			var m = this.markers[i];	

            ctx.fillStyle = m.color;			
			ctx.strokeStyle = m.color;
			
			var y = h - ( offsetY + ( m.value - minR ) * denom * h );
			var dim = ctx.measureText(m.value);
			
			ctx.lineWidth = 1.0;
			ctx.beginPath();
			ctx.moveTo(0, Math.round( y ));
			ctx.lineTo(w, Math.round( y ));
			ctx.stroke();
			ctx.closePath();	
		}	
	
		ctx.lineWidth = 1.0;
		for( var i = 0; i < this.tracked.length; ++i) {
			var t = this.tracked[i];
			
			// don't draw it.
			if(t.hide) 
				continue;			
			
			var ratio =  w / this.sampleRes;
			
			ctx.fillStyle = t.color;
			ctx.beginPath();
			
			var y = (t.samples[0] - minR)*denom*h;
			ctx.moveTo(0, h - (offsetY + y));
			for (var x = 1; x < t.samples.length; x++) {
				y = (t.samples[x] - minR)*denom*h;		
				ctx.lineTo(x * ratio, h - (offsetY + y)); 
			}
			
			ctx.strokeStyle = t.color;
			ctx.stroke();
			ctx.closePath();		
		}
				
		// draw marker text	
		var alpha = 0.25;	
		ctx.globalAlpha = alpha;
		var r = w * 0.125 / this.scale;
		ctx.fillStyle = "#044";
		
		ctx.fillRect(w-r, 0, r, h);
		for( var i = 0; i < this.markers.length; ++i) {		
			var m = this.markers[i];
            ctx.fillStyle = m.color;			
			ctx.strokeStyle = m.color;
			var y = h - ( offsetY + ( m.value - minR ) * denom * h );	
			ctx.font = Math.round( 10 / this.scale ) + "pt courier";
			var dim = ctx.measureText(m.value);
			ctx.globalAlpha = 1.0;		
			ctx.fillText(m.value, w - dim.width - 5, y - 2, r);
			ctx.globalAlpha = alpha;
		}

		ctx.globalAlpha = 1.0;
		ctx.lineWidth = 1.0;
		ctx.fillStyle = "#0A0A0A";		
		ctx.strokeStyle = "#8F8F8F";
		ctx.fillRect(0, h-footerHeight, w, footerHeight);
		ctx.translate([0.5,0.5]);
		var offset = w/numCols;
		var xmargin = 16;
		var ymargin = h-footerHeight+16;// + numRows * 16.0;
		for( var i = 0; i < this.tracked.length; ++i) {
			var t = this.tracked[i];
			ctx.font = "6pt Arial";
			ctx.fillStyle = t.color;
			ctx.strokeStyle = t.color;
			var index = (i+numCols)%numCols;
			var row = Math.floor(i/numCols);
			var ox = Math.floor(xmargin + offset * index);
			var oy = Math.floor(ymargin + row * 16.0);
			// update/render checkbox
			t.checkbox.x = Math.floor( ox-t.checkbox.w/2 );
			t.checkbox.y = Math.floor( oy-t.checkbox.h/2 );		
			if( t.hide ) {
				ctx.strokeRect(t.checkbox.x, t.checkbox.y, t.checkbox.w, t.checkbox.h);				
			} else {
				ctx.fillRect(t.checkbox.x, t.checkbox.y, t.checkbox.w, t.checkbox.h);				
			}
			ctx.fillText(t.label, ox + 10, oy+4);
		}		
		ctx.translate([-0.5,-0.5]);
	}
			
	var self = this;
	setInterval(function() { self.update(); self.draw(); }, 16);		
}