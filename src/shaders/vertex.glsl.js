var myVertexShader = `

attribute float alpha;
attribute float Teff;
attribute float magSize;
attribute vec4 velVals;

varying float vID;
varying float vAlpha;
varying float vTeff;
varying float vTheta;
//varying float glPointSize;
//varying float vVertexScale;

uniform float oID;
uniform float uVertexScale;
uniform float maxDistance;
uniform vec3 cameraX;
uniform vec3 cameraY;
uniform float time;

const float minPointScale = 0.01;
const float maxPointScale = 1000.;

const float PI = 3.1415926535897932384626433832795;

void main(void) {
	vID = oID;
	vAlpha = alpha;
	vTeff = Teff;
	//vVertexScale = uVertexScale;

	vTheta = 0.;

	vec4 mvPosition = modelViewMatrix * vec4( position + velVals.xyz*time, 1.0 );

	float cameraDist = length(mvPosition.xyz);
	float pointScale = maxDistance/cameraDist;
	pointScale = clamp(pointScale, minPointScale, maxPointScale);
	
	gl_PointSize = uVertexScale * pointScale;
	if (vID < 0.5){ //normal mode, plotting points (should be vID == 0, but this may be safer)
		gl_PointSize = gl_PointSize * magSize;
	} else {
		float vyc = -dot(velVals.xyz,cameraY);
		float vxc = dot(velVals.xyz,cameraX); 
		float vSize = sqrt(vyc*vyc+vxc*vxc)/sqrt(dot(velVals.xyz,velVals.xyz))*velVals[3] * 0.5;
		vTheta = atan(vyc,vxc);
		if (vTheta<0.0){
			vTheta = vTheta+2.0*PI;
		}

		gl_PointSize = gl_PointSize * vSize;

	}
	//glPointSize = gl_PointSize;

	gl_Position = projectionMatrix * mvPosition;

}

`;
