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
// Class Rectangle
//      2D rectangle
///////////////////////////////////////////////////////////////////////
var Rectangle = exports.Rectangle = Object.create(Object.prototype, {
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////
    m_top: { value: null, writable: true },
    m_left: { value: null, writable: true },
    m_width: { value: null, writable: true },
    m_height: { value: null, writable: true },


    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////
    set: { value: function(l,t,w,h)        {  this.m_left = l;  this.m_top = t;  this.m_width = w;  this.m_height = h; } },

    getLeft: { value: function()        {  return this.m_left;      } },
    setLeft: { value: function(l)       {  this.m_left = l;         } },

    getRight: { value: function()        {  return this.m_left + this.m_width;       } },
    setRight: { value: function(r)       {  this.m_width = r - this.m_left;          } },

    getBottom: { value: function()        {  return this.m_top + this.m_height;       } },
    setBottom: { value: function(b)       {  this.m_height = b - this.m_top;          } },

    getTop: { value: function()        {  return this.m_top;                       } },
    setTop: { value: function(t)       {  this.m_top = t;                          } },

    getCenter: { value: function()        {  return [this.m_left + 0.5*this.m_width,  this.m_top + 0.5*this.m_height];       } },

    getWidth: { value: function()        {  return this.m_width;                     } },
    setWidth: { value: function(w)       {  this.m_width = w;                        } },

    getHeight: { value: function()        {  return this.m_height;                    } },
    setHeight: { value: function(h)       {  this.m_height = h;                       } },

    geomType: { value: function()       {  return this.GEOM_TYPE_RECTANGLE;         } },

    ///////////////////////////////////////////////////////////////////////
    // Methods
    ///////////////////////////////////////////////////////////////////////
    contains: {
        value: function( x, y )
        {
            if (x < this.getLeft())     return false;
            if (x > this.getRight())    return false;
            if (y < this.getTop())      return false;
            if (y > this.getBottom())   return false;

            return true;
        }
    },

    dup: {
        value: function()
        {
            var rtnRec = Object.create(Rectangle, {});
            rtnRec.m_top    = this.m_top;
            rtnRec.m_left   = this.m_left;
            rtnRec.m_width  = this.m_width;
            rtnRec.m_height = this.m_height;

            return rtnRec;
        }
    },

    onBoundary: {
        value: function( x, y )
        {
            if ((MathUtils.fpCmp(y,this.getTop()) >= 0) && (MathUtils.fpCmp(y,this.getBottom()) <= 0))
            {
                if ((MathUtils.fpCmp(x, this.getLeft()) == 0) || (MathUtils.fpCmp(x, this.getRight()) == 0))  return true;

                if ((MathUtils.fpCmp(x,this.getLeft()) >= 0) && (MathUtils.fpCmp(x,this.getRight()) <= 0))
                {
                    if ((MathUtils.fpCmp(y, this.getTop()) == 0) || (MathUtils.fpCmp(y, this.getBottom()) == 0))  return true;
                }
            }

            return false;
        }
    },

    setToPoint: {
        value: function( pt )
        {
            this.m_left = pt[0];  this.m_top = pt[1];
            this.m_width = 0;  this.m_height = 0;
        }
    },

    setToBounds: {
        value: function( bounds )
        {
            var pt = bounds[0];
            this.setToPoint( pt );
            for (var i=1;  i<4;  i++)
                this.unionPoint( bounds[i] );
        }
    },

    getPoint: {
        value: function(i)
        {
            if (i < 0)  throw( "invalid point index in Rectangle.getPoint: " + i );

            i = i % 4;
            var pt = [0,0];
            switch (i)
            {
                case 0:
                    pt[0] = this.getLeft();
                    pt[1] = this.getTop();
                    break;

                case 1:
                    pt[0] = this.getLeft();
                    pt[1] = this.getBottom();
                    break;

                case 2:
                    pt[0] = this.getRight();
                    pt[1] = this.getBottom();
                    break;

                case 3:
                    pt[0] = this.getRight();
                    pt[1] = this.getTop();
                    break;
            }

            return pt;
        }
    },

    getQuadrant: {
        value: function( iQuad )
        {
            // quadrant ordering starts at upper left and continues around counter-clockwise

            var rtnQuad = this.dup();
            var hw = 0.5*this.m_width,  hh = 0.5*this.m_height;
            rtnQuad.m_width = hw;
            rtnQuad.m_height = hh;
            switch (iQuad)
            {
                case 0:
                    // no-op
                    break;

                case 1:
                    rtnQuad.m_top += hh;
                    break;

                case 2:
                    rtnQuad.m_left += hw;
                    rtnQuad.m_top += hh;
                    break;

                case 3:
                    rtnQuad.m_left += hw;
                    break;

                default:
                    throw new Error( "invalid quadrant to Rectangle.getQuadrant: " + iQuad );
                    break;
            }

            return rtnQuad;
        }
    },

    unionPoint: {
        value: function( pt )
        {
            var x = pt[0];
            var xMin = this.getLeft(),  xMax = this.getRight();
            if (x < xMin)       xMin =x;
            else if (x > xMax)  xMax = x;

            var y = pt[1];
            var yMin = this.getTop(),  yMax = this.getBottom();
            if (y < yMin)       yMin = y;
            else if (y > yMax)  yMax = y;

            this.setLeft( xMin );  this.setWidth( xMax - xMin );
            this.setTop( yMin );    this.setHeight( yMax - yMin );
        }
    },


    translate: {
        value: function( dx, dy )
        {
            this.m_left += dx;
            this.m_top  += dy;
        }
    }
});

