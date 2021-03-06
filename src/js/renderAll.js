
function animate(time) {
	if (!params.pauseAnimation){
		requestAnimationFrame( animate );
		update(time);
		render();
	}

}

function update(time){
	params.keyboard.update();
	if (params.keyboard.down("H")){
		params.helpMessage=!params.helpMessage;
		if (params.helpMessage){
			showSplash();
		}
		else{
			hideSplash()
		}
	}
	if (params.keyboard.down("space")){
		params.useTrackball = !params.useTrackball;
		params.switchControls = true;
		params.controls.dispose();
		initControls();
	}

	params.controls.update();

	updateUICenterText();
	updateUICameraText();
	updateUIRotText();
	if (params.dt > 0){
		updateUITimeText();
	}
	// camera's -z direction
	var cameraDir = params.camera.getWorldDirection();

	
	// find the camera's x and y axes 
	// quaternion is orientation of the camera WRT data space
	var cameraX =  new THREE.Vector3(1,0,0);
	var cameraY =  new THREE.Vector3(0,1,0);
	cameraX.applyQuaternion(params.camera.quaternion);
	cameraY.applyQuaternion(params.camera.quaternion);



	for (var i=0; i<params.partsKeys.length; i++){
		var p = params.partsKeys[i];
		params.partsMesh[p].forEach( function( m, j ) {
			m.material.uniforms.velType.value = params.velopts[params.velType[p]];
			if (params.showParts[p]) {

				m.geometry.setDrawRange( 0, params.plotNmax[p]*(1./params.decimate) )
				m.material.uniforms.uVertexScale.value = params.PsizeMult[p];

				m.material.uniforms.color.value = new THREE.Vector4( params.Pcolors[p][0], params.Pcolors[p][1], params.Pcolors[p][2], params.Pcolors[p][3]);
				if (params.showVel[p]){
					// pass camera orientation to the shader
					m.material.uniforms.cameraX.value = [cameraX.x,cameraX.y,cameraX.z];
					m.material.uniforms.cameraY.value = [cameraY.x,cameraY.y,cameraY.z];
					m.material.uniforms.oID.value = 1.;
					m.material.uniforms.uVertexScale.value *= params.vSizeMult;

				} else {
					m.material.uniforms.oID.value = 0.;
				}
				//this should not be needed because we now redraw every time we filter
				// but I will leave it here, in case we want to revert back to this method
				// if (params.updateFilter[p]){
				// 	var alphas = m.geometry.attributes.alpha.array;
				// 	for( var ii = 0; ii < alphas.length; ii ++ ) {
				// 		alphas[ii] = 1.;
				// 		for (k=0; k<params.fkeys[p].length; k++){
				// 			if (params.parts[p][params.fkeys[p][k]] != null) {
				// 				val = params.parts[p][params.fkeys[p][k]][ii]; 
				// 				if ( val < params.filterVals[p][params.fkeys[p][k]][0] || val > params.filterVals[p][params.fkeys[p][k]][1] ){
				// 					alphas[ii] = 0.;
				// 				} 
				// 			}
				// 		}
				// 	}
				// 	m.geometry.attributes.alpha.needsUpdate = true;
				// 	params.updateFilter[p] = false;
				// }

				if (Math.abs(params.dt) > 0){
					params.time += params.dt;
				}
				m.material.uniforms.time.value = params.time;
				
			} else { 
				m.material.uniforms.color.value = new THREE.Vector4(0);
				m.material.uniforms.oID.value = -1;
			}
			//for filtering

		});
	}

}


function render() {

	params.renderer.render( params.scene, params.camera );

}
