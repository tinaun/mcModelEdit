// 2014 tinaun

var mcModelEdit = angular.module('mcModelEdit', []);

var modelNeedsUpdate = false;

var scope;

var texture = new Image();
var tex = new THREE.Texture(texture);
var topTex;
texture.onload = function () { tex.needsUpdate = true; if ( callback ) callback( this ); };

tex.magFilter = THREE.NearestFilter;
texture.crossOrigin = this.crossOrigin;

var img_src = 'img/invalid.png'

texture.src = img_src;

var sideMat = new THREE.MeshPhongMaterial({color: 0xffffff , map: tex});


var materials = [];
for(var i = 0; i < 6; i++){
	materials.push( sideMat.clone() );
}

var cubeMat = new THREE.MeshFaceMaterial(materials);

	function handleFiles(files, id) {
  		for (var i = 0; i < files.length; i++) {
    		var file = files[i];
	    	var imageType = /image.*/;
	    
	    	if (!file.type.match(imageType)) {
	      		continue;
	    	}
	    
	    
	    	var reader = new FileReader();
	    	
	    	var imgtag = document.getElementById("texture" + id);
	  		imgtag.title = file.name;	

	  		reader.onload = function(event) {
	    		imgtag.src = event.target.result;

	    		if(id == 2){
	    			topTex = tex.clone();
	    			topTex.image = imgtag;
	    			materials[2] = new THREE.MeshPhongMaterial({color: 0xffffff , map: topTex});
	    		
	    			materials[2].needsUpdate = true;
	    			cubeMat.needsUpdate = true;
	    			topTex.needsUpdate = true;
	    		} else {
	    			tex.image = imgtag;
	    			tex.needsUpdate = true;
	    		}
	  		};	

	  		reader.readAsDataURL(file);
  		}	
	}


mcModelEdit.controller('mcCtrl', function($scope) {
	$scope.model = {};
	$scope.elements = [];
	$scope.meshes = [];

	$scope.model.valid = false;

	$scope.name = 'nothing';
	$scope.viewRaw = true;


	$scope.toggle = function(type){
		if($scope.viewRaw)
			$scope.viewRaw = false;
		else
			$scope.viewRaw = true;

	}

	$scope.update = function(){
		if($scope.objJSON) {
			var model;
			try {
				model = JSON.parse($scope.objJSON);
				$scope.model.valid = true;
			} catch (e) {
				$scope.name = 'invalid json';
				$scope.model.valid = false;
			}

			if($scope.model.valid){
				$scope.name = 'valid json';
				$scope.meshes = [];
				if(model.hasOwnProperty('elements')){
					$scope.elements = model.elements;
				
					angular.forEach(model.elements, function(elem, i){
						if(elem.type == "cube"){
							var x = elem.to[0] - elem.from[0];
							var y = elem.to[1] - elem.from[1];
							var z = elem.to[2] - elem.from[2];

							var geom = new THREE.mcBoxGeometry(elem.from, elem.to, elem.faceData);

							var mesh = new THREE.Mesh(geom, cubeMat);

							mesh.position.x = (x/2 - 8 + elem.from[0])/16;
							mesh.position.y = (y/2 - 8 + elem.from[1])/16;
							mesh.position.z = (z/2 - 8 + elem.from[2])/16;
							if (elem.rotation){
								mesh.rotation.x = (elem.rotation[0]*Math.PI)/180;  //mc rotates in deg
								mesh.rotation.y = (elem.rotation[1]*Math.PI)/180;
								mesh.rotation.z = (elem.rotation[2]*Math.PI)/180;
							}

							$scope.meshes.push(mesh);

						} else if (elem.type == "plane"){
							var x = elem.to[0] - elem.from[0];
							var y = elem.to[1] - elem.from[1];
							var z = elem.to[2] - elem.from[2];

							var mesh, geom;
							var u, v, w;

							if ( x == 0 ){
								u = y;
								v = z;
								w = 'x';
							} else if ( y == 0 ){
								u = x;
								v = z;
								w = 'y';						
							} else if (z == 0){
								u = x;
								v = y;
								w = 'z';
							} else {
								console.log('invalid mesh');
							}

							geom = new THREE.mcPlaneGeometry(u, v, w, elem);



							if(elem.facing === 'up'){
								mesh = new THREE.Mesh(geom, materials[2]);
							} else {
								mesh = new THREE.Mesh(geom, sideMat);
							}

							mesh.position.x = (x/2 - 8 + elem.from[0])/16;
							mesh.position.y = (y/2 - 8 + elem.from[1])/16;
							mesh.position.z = (z/2 - 8 + elem.from[2])/16;
							if (elem.rotation){
								mesh.rotation.x = (elem.rotation[0]*Math.PI)/180;  //mc rotates in deg
								mesh.rotation.y = (elem.rotation[1]*Math.PI)/180;
								mesh.rotation.z = (elem.rotation[2]*Math.PI)/180;
							}

							$scope.meshes.push(mesh)

						} else {
							console.log('invalid element type');
						}

					});
				}
				modelNeedsUpdate = true;
				
			}
		}

	}

});


mcModelEdit.controller('mcScene', function($scope) {
	var domElement = document.getElementById('holder');
	$scope.overlay = true;


	$scope.scene = new THREE.Scene();
	$scope.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	$scope.controls = new THREE.OrbitControls( $scope.camera , domElement);

	$scope.renderer = new THREE.WebGLRenderer();
	$scope.renderer.setSize(window.innerWidth, window.innerHeight);

	var light = new THREE.DirectionalLight( 0xffffff, 1 );
    	light.position.set(1,3, 1);

    var ambient = new THREE.AmbientLight( 0x404040 );

    

	var geometry = new THREE.CubeGeometry(1,1,1);
	var material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe:true});
	var cube = new THREE.Mesh(geometry, material);
	cube.position.x = 0;
	cube.position.y = 0;
	cube.position.z = 0;
	

	geometry = new THREE.PlaneGeometry(50,50);
	material = new THREE.MeshBasicMaterial({color: 0x75B5FF});
	var backplane = new THREE.Mesh(geometry, material);
	backplane.position.z = -30;

	var backgroundScene = new THREE.Scene();
    var backgroundCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        backgroundScene .add(backgroundCamera );
        backgroundScene .add(backplane );

    var overlayScene = new THREE.Scene();
    overlayScene.add(cube);

    var size = 1;
	var step = 1/16;
	var gridHelper = new THREE.GridHelper( size, step );

	gridHelper.position = new THREE.Vector3( 0, -0.5, 0 );
	gridHelper.rotation = new THREE.Euler( 0, 0, 0 );

	overlayScene.add( gridHelper );

	domElement.appendChild($scope.renderer.domElement);

	$scope.camera.position.z = -3;
	$scope.camera.lookAt(new THREE.Vector3(0,0,0));

	var modelElem = $scope.meshes.length;


	$scope.updateMeshes = function(){
		$scope.scene = new THREE.Scene();
		$scope.scene.add(light);
		$scope.scene.add(ambient);
		


		angular.forEach($scope.meshes, function(elem, i){
			$scope.scene.add(elem);
		});
	}

	$scope.frameC = 0;

	$scope.render = function () {
		requestAnimationFrame($scope.render);

		if(modelNeedsUpdate){
			console.log('update');
			$scope.updateMeshes();
			modelNeedsUpdate = false;
		}



		$scope.renderer.autoClear = false;
        $scope.renderer.clear();
		$scope.renderer.render(backgroundScene, backgroundCamera);
		if($scope.overlay)		
			$scope.renderer.render(overlayScene, $scope.camera)
		$scope.renderer.render($scope.scene, $scope.camera);

	};

	scope = $scope
	$scope.render();

});