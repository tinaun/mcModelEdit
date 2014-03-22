//checks to see if the model data is in the correct mc model format for the version targeted

var hasElements = function (obj, elmList){
  for( var i = 0; i < elmList.length; i++ ){
    if( !obj.hasOwnProperty(elmList[i]) )
      return false;
  }
  return true;
}

var validateRotation = function (r){

  if( !(r instanceof Array) ) return false;

  var x = r[0], y = r[1], z = r[2];
  var validR = [ -45, -22.5, 0, 22.5, 45 ];

  if(!( (x && y) || (y && z) || (x && z) )){
    var w;
    w = x ? x : ( y ? y : z );
    
    for( var i = 0; i < validR.length; i++ ){
      if( validR[i] === w )
        return true;
    }
  }

  return false;
}


var validateModel = function (model){
  var validateFormat = '14w11b';

  var required;  //elements required for model
      required.model = ['elements'];
      required.element = ['type', 'from', 'to', 'faceData'];
      required.face = ['uv'];

  if( hasElements(model, required.model) ){ //model is correct format
    var elements = model.elements;
    for( var i = 0; i < elements.length; i++ ){
      var elem = elements[i];
      if ( hasElements(elem, required.element) ){ //element is correct format
        
        if( elem.rotation && !validateRotation(elem.rotation) ){  //check rotation
          return false;
        }
        
        for( var face in elem.faceData ){
          if(!hasElements( face, required.face) ){
            return false;
          }
        }
        
      } else { return false; }
    }
    return true;
  }

  return false;
}
