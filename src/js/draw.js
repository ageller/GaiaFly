
function clearPartsMesh(pClear = params.partsKeys) {
	for (var i=0; i<pClear.length; i++){
		var p = pClear[i];

		params.partsMesh[p].forEach( function( e, i ) {
			e.geometry.dispose();
			params.scene.remove( e );

		} );

		params.partsMesh[p] = [];

	}
}

function drawScene(pdraw = params.partsKeys)
{
	clearPartsMesh(pClear = pdraw);
	console.log("drawing", pdraw, params.plotNmax,params.decimate)

	//d3.select("#splashdiv5").text("Drawing...");
	params.drawfrac = 0.;
	var ndraw = 0.;
	var ndiv = Math.round(params.parts.totalSize / 10.);

	//params.octree = new THREE.Octree({scene:params.scene});

	for (var i=0; i<pdraw.length; i++){
		var p = pdraw[i];

		var material = new THREE.ShaderMaterial( {
			uniforms: {
				color: {value: new THREE.Vector4( params.Pcolors[p][0], params.Pcolors[p][1], params.Pcolors[p][2], params.Pcolors[p][3])},
				oID: {value: 0},
				SPHrad: {value: params.parts[p].doSPHrad},
				uVertexScale: {value: params.PsizeMult[p]},
				maxDistance: {value: params.boxSize},
				cameraY: {value: [0.,1.,0.]},
				cameraX: {value: [1.,0.,0.]},
				velType: {value: 0.},
				bb: {value: params.tex['bb']},
				sTeff: {value: params.sTeff},
				Teffac: {value: params.Teffac},
				time: {value: params.time}
			},

			vertexShader: myVertexShader,
			fragmentShader: myFragmentShader,
			depthWrite:false,
			depthTest: false,
			transparent:true,
			alphaTest: false,
			blending:THREE.AdditiveBlending,
		} );

		//geometry
		//var geo = new THREE.Geometry();
		var geo = new THREE.BufferGeometry();

		// attributes
		//positions
		var positions = new Float32Array( params.plotNmax[p] * 3 ); // 3 vertices per point
		geo.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		//alphas for filtering
		var alphas = new Float32Array( params.plotNmax[p] ); 
		geo.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

		//temperatures for coloring
		var Teff = new Float32Array( params.plotNmax[p] ); 
		geo.addAttribute( 'Teff', new THREE.BufferAttribute( Teff, 1 ) );

		//individual point sizes based on magnitude
		var magSize = new Float32Array( params.plotNmax[p] ); 
		geo.addAttribute( 'magSize', new THREE.BufferAttribute( magSize, 1 ) );


		//angles for velocities
		var velVals = new Float32Array( params.plotNmax[p] * 4); // unit vector (vx, vy, vz), scaled magnitude
		geo.addAttribute( 'velVals', new THREE.BufferAttribute( velVals, 4 ) );

		geo.setDrawRange( 0, params.plotNmax[p] );

		var mesh = new THREE.Points(geo, material);
		params.scene.add(mesh)

		var positions = mesh.geometry.attributes.position.array;
		var index = 0;
		var vindex = 0;
		var aindex = 0;

		var includePoint = true;
		//for (var j=0; j<params.parts[p].Coordinates.length/params.decimate; j++){
		for (var j=0; j<params.plotNmax[p]; j++){

			//we are now including the filtering here instead of simply changing the alpha value during rendering
			includePoint = true;
			for (k=0; k<params.fkeys[p].length; k++){
				if (params.parts[p][params.fkeys[p][k]] != null) {
					val = params.parts[p][params.fkeys[p][k]][j]; 
					if ( val < params.filterVals[p][params.fkeys[p][k]][0] || val > params.filterVals[p][params.fkeys[p][k]][1] ){
						includePoint = false;
					} 
				}
			}

			if (includePoint){

				//geo.vertices.push(new THREE.Vector3(params.parts[p].Coordinates[j][0], params.parts[p].Coordinates[j][1], params.parts[p].Coordinates[j][2] ))
				
				positions[index] = params.parts[p].Coordinates[j][0];
				index++;
				positions[index] = params.parts[p].Coordinates[j][1];
				index++;
				positions[index] = params.parts[p].Coordinates[j][2];
				index++;

				if (params.parts[p].Velocities != null){
					velVals[vindex] = params.parts[p].VelVals[j][0]/params.parts[p].magVelocities[j];
					vindex++;
					velVals[vindex] = params.parts[p].VelVals[j][1]/params.parts[p].magVelocities[j];
					vindex++;
					velVals[vindex] = params.parts[p].VelVals[j][2]/params.parts[p].magVelocities[j];
					vindex++;
					velVals[vindex] = params.parts[p].VelVals[j][3];
					vindex++;
				}

				alphas[aindex] = 1.;

				if (params.parts[p].hasOwnProperty('Teff')){

					Teff[aindex] = params.parts[p].Teff[j];
				} else {
					Teff[aindex] = -1.;
				}

				if (params.parts[p].hasOwnProperty('gMag')){
					magSize[aindex] = Math.pow(10., 1. - (params.parts[p].gMag[j] - params.parts[p].gMagMin)/(params.parts[p].gMagMax - params.parts[p].gMagMin));
				} else {
					magSize[aindex] = 1.;
				}

				aindex ++;

				ndraw += 1;
				if (ndraw % ndiv < 1 || ndraw == params.parts.totalSize){
					params.drawfrac = (1 + ndraw/params.parts.totalSize)*0.5;
					//updateDrawingBar();
				}
			}
		}

		mesh.position.set(0,0,0);


		params.partsMesh[p].push(mesh)
		//params.octree.add( mesh, { useVertices: true } );
	}

	//this will not be printed if you change the N value in the slider, and therefore only redraw one particle type
	//because ndraw will not be large enough, but I don't think this will cause a problem
	//if (ndraw >= Math.floor(params.parts.totalSize/params.decimate)){
		console.log("done drawing")
		clearloading();

	//}

}

