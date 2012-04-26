/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

///////////////////////////////////////////////////////////////////////
// Class Utils
//      Vector Utility functions
///////////////////////////////////////////////////////////////////////
var VecUtils = exports.VecUtils = Object.create(Object.prototype,
{
    ///////////////////////////////////////////////////////////////////////
    // Instance variables
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    // Property accessors
    ///////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////
    // Vector Methods
    ///////////////////////////////////////////////////////////////////////
    vecNormalize: {
        value: function(dimen, vec, lenToMake) {
            var rtnVec;
            try
            {
                var len = 1.0
                var nArgs = arguments.length;
                if (nArgs > 2)
                    len = lenToMake;

                var sum = 0.0;
                for (var i=0;  i<dimen;  i++)
                    sum += vec[i]*vec[i];
                sum = Math.sqrt( sum );
                if (MathUtils.fpSign(sum) != 0)
                {
                    var scale = len/sum;
                    rtnVec = [0];
                    for (var i=0;  i<dimen;  i++)
                        rtnVec[i] = vec[i]*scale;
                }
                else
                {
                    rtnVec = [0];
                    for (var i=1;  i<dimen;  i++)
                        rtnVec[i] = 0;
                }
            }
            catch(e)
            {
                throw new Error( "exception in vecNormalize: " + e);
            }

            return rtnVec;
            }
    },

	vecAdd: {
        value: function( dimen,  a, b ) {

            var rtnVec;
            if ((a.length < dimen) || (b.length < dimen))
            {
                throw new Error( "dimension error in VecUtils.vecAdd" );
            }

            rtnVec = [0];
            for (var i=0;  i<dimen;  i++)
                rtnVec[i] = a[i] + b[i];

            return rtnVec;
        }
    },


	vecSubtract : {
        value: function( dimen, a, b ) {
            var rtnVec;
            if ((a.length < dimen) || (b.length < dimen))
            {
                throw new Error( "dimension error in VecUtils.vecSubtract" );
            }

            rtnVec = [0];
            for (var i=0;  i<dimen;  i++)
                rtnVec[i] = a[i] - b[i];

            return rtnVec;
        }
    },

	vecDist : {
        value: function( dimen,  a, b ) {
            var sum;

            if ((a.length < dimen) || (b.length < dimen))
            {
                throw new Error( "dimension error in VecUtils.vecSubtract" );
            }

            var sum = 0.0;
            for (var i=0;  i<dimen;  i++)
            {
                var d = a[i] - b[i];
                sum += d*d;
            }
            sum = Math.sqrt( sum );

            return sum;
        }
    },

    vecDistSq : {
            value: function( dimen,  a, b ) {
                var sum;

                if ((a.length < dimen) || (b.length < dimen))
                {
                    throw new Error( "dimension error in VecUtils.vecDistSq" );
                }

                var sum = 0.0;
                for (var i=0;  i<dimen;  i++)
                {
                    var d = a[i] - b[i];
                    sum += d*d;
                }
                return sum;
            }
        },

    vecDot : {
        value: function( dimen,  v0, v1 ) {
            if ((v0.length < dimen) || (v1.length < dimen))
            {
                throw new Error( "dimension error in VecUtils.vecDot" );
            }

            var sum = 0.0;
            for (var i=0;  i<dimen;  i++)
                sum += v0[i] * v1[i];

            return sum;
        }
    },


    vecCross: {
        value: function( dimen,  v0, v1 ) {
            if ((v0.length < dimen) || (v1.length < dimen))
            {
                throw new Error( "dimension error in VecUtils.vecCross" );
            }

            var rtnVal;
            if (dimen == 2)
                rtnVal = v0[0]*v1[1] - v0[1]*v1[0];
            else if (dimen == 3)
            {
                rtnVal = [ v0[1]*v1[2] - v0[2]*v1[1], -v0[0]*v1[2] + v0[2]*v1[0], v0[0]*v1[1] - v0[1]*v1[0] ];
            }
            else
                throw new Error( "VecUtils.vecCross supports only 2 or 3 dimensional vectors:  " + dimen );

            return rtnVal;
        }
    },


	vecInterpolate: {
        value: function( dimen,  a, b, t ) {
            if ((a.length < dimen) || (b.length < dimen))
            {
                throw new Error( "dimension error in VecUtils.vecSubtract" );
            }

            var rtnVec = [0];
            for (var i=0;  i<dimen;  i++)
                rtnVec[i] = a[i] + t*(b[i] - a[i]);

            return rtnVec;
        }
    },

	vecMag: {
        value: function( dimen, vec ) {
            var sum = 0.0;
            for (var i=0;  i<dimen;  i++)
                sum += vec[i]*vec[i];
            return Math.sqrt( sum );
        }
    },

    vecNegate: {
        value: function( dimen, v ) {
            for (var i=0;  i<dimen;  i++)
                v[i] = -v[i];

            return v;
        }
    },

	vecScale: {
        value: function(dimen, vec, scale) {
            for (var i=0;  i<dimen;  i++)
                vec[i] *= scale;

            return vec;
        }
    },

	matI :
	{
		value: function(dimen)
		{
			var mat = [];
			for (var i=0;  i<dimen*dimen;  i++)  mat.push(0);

			var index = 0;
			for (var i=0;  i<dimen;  i++)
			{
				mat[index] = 1.0;
				index += dimen + 1;
			}
	
			return mat;	
		}
	},

	matTranslation:
	{
		value: function (vec)
		{
			var mat = Matrix.I(4);
			glmat4.translate(mat, vec);
			return mat;
		}
	},

	matRotationX:
	{
		value: function( angle )
		{
			var mat = Matrix.I(4);
			glmat4.rotateX(mat, angle);
			return mat;
		}
	},

	matRotationY:
	{
		value: function( angle )
		{
			var mat = Matrix.I(4);
			glmat4.rotateY(mat, angle);
			return mat;
		}
	},

	matRotationZ:
	{
		value: function( angle )
		{
			var mat = Matrix.I(4);
			glmat4.rotateZ(mat, angle);
			return mat;
		}
	},

	matRotation:
	{
		value: function(angle, axis)
		{
			var mat = Matrix.I(4);
			glmat4.rotate(mat, angle, axis);
			return mat;
		}
	}

});