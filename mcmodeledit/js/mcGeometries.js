//tinaun 2014
//based on default Box + Plane Geometries in three.js

var sides = {east:0, west:1, up:2, down:3, south:4, north: 5};

THREE.mcBoxGeometry = function(from, to, faceData){
	THREE.Geometry.call( this );

	var scope = this;

	var mcScale = 16; //mc 'pixel'

	this.width = (to[0] - from[0])  / mcScale;
	this.height = (to[1] - from[1]) / mcScale;
	this.depth = (to[2] - from[2])  / mcScale;

	var width_half = this.width / 2;
	var height_half = this.height / 2;
	var depth_half = this.depth / 2;

	for (side in faceData){ //only build defined sides
		switch(side){
			case "east":
				buildPlane( side, faceData[side], - 1, - 1, this.depth, this.height, width_half); // east
				break;
			case "west":
				buildPlane( side, faceData[side],   1, - 1, this.depth, this.height, -width_half ); // west
				break;
			case "up":
				buildPlane( side, faceData[side],   1,   1, this.width, this.depth, height_half ); // top
				break;
			case "down":
				buildPlane( side, faceData[side],   1, - 1, this.width, this.depth, -height_half ); // bottom
				break;
			case "south":
				buildPlane( side, faceData[side],   1, - 1, this.width, this.height, depth_half ); // south
				break;
			case "north":
				buildPlane( side, faceData[side], - 1, - 1, this.width, this.height, -depth_half ); // north
				break;
			default:
				console.log("invalid side!! ignoring...");
		}
	}

	function buildPlane( side, data, udir, vdir, width, height, depth) {

		var w, ix, iy, u, v,
		width_half = width / 2,
		height_half = height / 2,
		offset = scope.vertices.length;

		if ( ( side === 'north' ) || ( side === 'south' ) ) {

			u = 'x';
			v = 'y';
			w = 'z';

		} else if ( ( side === 'up' ) || ( side === 'down' ) ) {

			u = 'x';
			v = 'z';
			w = 'y';

		} else if ( ( side === 'east' ) || ( side === 'west' ) ) {

			u = 'z';
			v = 'y';
			w = 'x';

		}

		var gridX1 = 2,
		gridY1 = 2,
		segment_width = width,
		segment_height = height,
		normal = new THREE.Vector3();

		normal[ w ] = depth > 0 ? 1 : - 1;

		for ( iy = 0; iy < gridY1; iy ++ ) {

			for ( ix = 0; ix < gridX1; ix ++ ) {

				var vector = new THREE.Vector3();
				vector[ u ] = ( ix * width  - width_half) * udir;
				vector[ v ] = ( iy * height - height_half) * vdir; 
				vector[ w ] = depth;

				scope.vertices.push( vector );

			}

		}

			var a = 0;
			var b = gridX1;
			var c = 1 + gridX1;				
			var d = 1 ;

			var uva = new THREE.Vector2( data.uv[0] / mcScale , (16-data.uv[1]) / mcScale);
			var uvb = new THREE.Vector2( data.uv[0] / mcScale , (16-data.uv[3]) / mcScale);
			var uvc = new THREE.Vector2( data.uv[2] / mcScale , (16-data.uv[3]) / mcScale);
			var uvd = new THREE.Vector2( data.uv[2] / mcScale , (16-data.uv[1]) / mcScale);

			var face = new THREE.Face3( a + offset, b + offset, d + offset );
			face.normal.copy( normal );
			face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
			face.materialIndex = sides[data.textureFacing];

			scope.faces.push( face );
			scope.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

			face = new THREE.Face3( b + offset, c + offset, d + offset );
			face.normal.copy( normal );
			face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
			face.materialIndex = sides[data.textureFacing];

			scope.faces.push( face );
			scope.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

	}

	this.computeCentroids();
	this.mergeVertices();


};

THREE.mcBoxGeometry.prototype = Object.create( THREE.Geometry.prototype );

THREE.mcPlaneGeometry = function(width, height, norm, elem){
	THREE.Geometry.call( this );

	mcScale = 16;

	this.width = width   / mcScale;
	this.height = height / mcScale;

	var ix, iz;
	var width_half = this.width / 2;
	var height_half = this.height / 2;

	var gridX = 1 ;
	var gridZ = 1;

	var gridX1 = gridX + 1;
	var gridZ1 = gridZ + 1;

	var segment_width = this.width / gridX;
	var segment_height = this.height / gridZ;

	var normal = new THREE.Vector3( 0, 0, 0 );
	normal[norm] = 1;

	var uvs = elem.faceData.uv;

	for ( iz = 0; iz < gridZ1; iz ++ ) {

		for ( ix = 0; ix < gridX1; ix ++ ) {

			var x = ix * this.width - width_half;
			var y = iz * this.height - height_half;

			if(norm === 'x')
				this.vertices.push( new THREE.Vector3( 0, x, -y ) );
			else if(norm === 'y')
				this.vertices.push( new THREE.Vector3( x, 0, y ) );
			else if(norm === 'z')
				this.vertices.push( new THREE.Vector3( x, - y, 0 ) );

		}

	}

		var a = 0;
		var b = gridX1;
		var c = 1 + gridX1;				
		var d = 1 ;

		var uva = new THREE.Vector2( uvs[0] / mcScale , (16-uvs[1]) / mcScale);
		var uvb = new THREE.Vector2( uvs[0] / mcScale , (16-uvs[3]) / mcScale);
		var uvc = new THREE.Vector2( uvs[2] / mcScale , (16-uvs[3]) / mcScale);
		var uvd = new THREE.Vector2( uvs[2] / mcScale , (16-uvs[1]) / mcScale);

		var face = new THREE.Face3( a, b, d );
		
		face.normal.copy( normal );
		face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
		
		this.faces.push( face );
		this.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

		face = new THREE.Face3( b, c, d );
		
		face.normal.copy( normal );
		face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
		
		this.faces.push( face );
		this.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

	if(elem.twoSided){
		console.log("second side!!");
		normal = new THREE.Vector3( 0, 0, 0 );
		normal[norm] = -1;
		face = new THREE.Face3( d, b, a );
		
		face.normal.copy( normal );
		face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
		
		this.faces.push( face );
		this.faceVertexUvs[ 0 ].push( [ uvd, uvb, uva ] );

		face = new THREE.Face3( d, c, b );
		
		face.normal.copy( normal );
		face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
		
		this.faces.push( face );
		this.faceVertexUvs[ 0 ].push( [ uvd.clone(), uvc, uvb.clone() ] );

	}

	this.computeCentroids();

};

THREE.mcPlaneGeometry.prototype = Object.create( THREE.Geometry.prototype );