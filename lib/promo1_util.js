
// å®Ÿè£…æ–¹æ³•ã‚’è©¦è¡ŒéŒ¯èª¤ä¸­

(function (){//===== å³æ™‚é–¢æ•°(ãƒ­ãƒ¼ã‚«ãƒ«ã«ã™ã‚‹) ======



function Promo1_util(){


}


//========================================
//	WebGLã®ã‚³ãƒ³ãƒ†ã‚­ã‚¹ãƒˆã‚’å–å¾—ã™ã‚‹
//========================================
Promo1_util.getWebGLContext = function(canvas)
{
	var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"] ;
	
	for( var i = 0 ; i < NAMES.length ; i++ ){
		try{
			var ctx = canvas.getContext( NAMES[i] );
			if( ctx ) return ctx ;
		} 
		catch(e){}
	}
	return null ;
}

//========================================
//	request ã¨ã—ã¦ãƒ­ãƒ¼ãƒ‰ã™ã‚‹
//========================================
Promo1_util.loadBytes = function ( path , callback )
{
	load_exe( path , "arraybuffer" , function (req){ 
		callback(req.response) ; 
	}) ;
}

//========================================
//	request ã¨ã—ã¦ãƒ­ãƒ¼ãƒ‰ã™ã‚‹
//========================================
Promo1_util.loadText = function ( path , callback )
{
	load_exe( path , "text" , function (req){ 
		callback(req.responseText) ; 
	}) ;
}



//========================================
//========================================
function load_exe( path , type , callback ){
	var request = new XMLHttpRequest();
	request.open("GET", path , true);
	request.responseType = type  ;//"arraybuffer" ;
	request.onload = function(){
		switch( request.status ){
		case 200:
			callback( request ) ;
			break ;
		default:
			myerror( "Failed to load (" + request.status + ") : " + path ) ;
			break ;
		}
	}
	request.send(null) ;
	return request ;
}




//Promo1_util.touchPos  = new Array(0,0) ;  // ç”»é¢ã‚’ä¸­å¿ƒã«x,y
Promo1_util.accelXYZ  = new Array(0,0,0) ;// åŠ é€Ÿåº¦

//========================================
//	Touch
//========================================
Promo1_util.setupTouch = function( ele /*canvas,imageãªã©*/ ){
	if( ! ele ) return ;
	
	var useCapture = false ;
	ele.addEventListener( "touchstart" , touchBegin , useCapture ) ;
	ele.addEventListener( "touchmove"  , touchMoved , useCapture ) ;
	ele.addEventListener( "mousemove"  , touchMoved , useCapture ) ;
	ele.addEventListener( "touchend"   , touchEnd , useCapture ) ;
//	ele.addEventListener( "touchcancel", myTouchHandler , useCapture ) ;

    // æš«å®šå‡¦ç†
    var MODEL_LOGICAL_W = ele.width ;
    var MODEL_LOGICAL_H = ele.height  ;
    var MODEL_LOGICAL_CENTER_X = ele.width*0.5 ;
    var MODEL_LOGICAL_CENTER_Y = ele.height*0.5 ;
    var MOUSE_TO_FACE_TARGET_SCALE = 1 ;

    // å…¨ä½“åº§æ¨™ã‚’ã€eleåº§æ¨™ã«ç›´ã—ã€ localã® x , y ã‚’è¿”ã™
    function getLocalPos( e ){
        var touch = ( e instanceof MouseEvent ? e : e.touches[0] ) ;
        var elepos =  Promo1_util.getPosition(ele) ;

        return { x:(touch.clientX-elepos.left) , y:(touch.clientY-elepos.top) } ;
    }

    function touchMoved(e){
        var localPos = getLocalPos(e) ;
        //ä¸Šä¸‹ã®ç«¯ã¯ãƒ–ãƒ©ã‚¦ã‚¶ã®åˆ¶å¾¡ã‚’å¥ªã‚ãªã„ï¼ˆæ‰±ã„ã‚„ã™ãã™ã‚‹ï¼‰
        if( 100 < localPos.y && localPos.y < ele.height-100 ) e.preventDefault();

        // touchPos[0] = 2.0 * touch.clientX / ele.width - 1 ;
        // touchPos[1] = 2.0 * touch.clientY / ele.height - 1 ;

        var mouseX = 2 * ( localPos.x - MODEL_LOGICAL_CENTER_X ) / MODEL_LOGICAL_W ;
        var mouseY = 2 * ( localPos.y - MODEL_LOGICAL_CENTER_Y ) / MODEL_LOGICAL_H ;
        dragMotion_faceTargetX = clamp( mouseX * MOUSE_TO_FACE_TARGET_SCALE , -1 , 1) ;
        dragMotion_faceTargetY = clamp( mouseY * MOUSE_TO_FACE_TARGET_SCALE , -1 , 1) ;

        //console.log(dragMotion_faceTargetX) ;

    }

    function touchBegin(e){
        var localPos = getLocalPos(e) ;

        this.touching = true ;

        var mouseX = 2 * ( localPos.x - MODEL_LOGICAL_CENTER_X ) / MODEL_LOGICAL_W ;
        var mouseY = 2 * ( localPos.y - MODEL_LOGICAL_CENTER_Y ) / MODEL_LOGICAL_H ;
        dragMotion_faceTargetX = clamp( mouseX * MOUSE_TO_FACE_TARGET_SCALE , -1 , 1) ;
        dragMotion_faceTargetY = clamp( mouseY * MOUSE_TO_FACE_TARGET_SCALE , -1 , 1) ;

        //lastControlTime = UtSystem.getSystemTimeMSec() ;
    }


        
    function touchEnd(e){
        var touch = ( e instanceof MouseEvent ? e : e.touches[0] )   ;
        
    }

}


//========================================
//	åŠ é€Ÿåº¦ã‚»ãƒ³ã‚µã®åˆæœŸåŒ–
//========================================
Promo1_util.setupAccel = function(  ){
	var accelX = 0 ;//ä»®
	var accelY = 0 ;//ä»®
	var accelZ = 0 ;//ä»®

	var onDeviceMotion = function (e){
		var accel = e.accelerationIncludingGravity ;//é‡åŠ›åŠ é€Ÿåº¦
        var blend = 0.5 ;
        var ref = Promo1_util.accelXYZ ;
		ref[0] = ref[0]*blend + (( accelX + accel.x/9.8 ) * 0.5)*(1-blend) ;	
		ref[1] = ref[1]*blend + (( accelY + accel.y/9.8 ) * 0.5)*(1-blend) ;	
		ref[2] = ref[2]*blend + (( accelZ + accel.z/9.8 ) * 0.5)*(1-blend) ;	
	}
	window.addEventListener("devicemotion" , onDeviceMotion , true ) ;
}


var dragMotion_lastTime = 0 ;
var dragMotion_curTime  = 0 ;
var dragMotion_faceX    = 0 ;
var dragMotion_faceY    = 0 ;
var dragMotion_faceVX   = 0 ;
var dragMotion_faceVY   = 0 ;
var dragMotion_faceTargetX = 0 ;
var dragMotion_faceTargetY = 0 ;

var FRAME_RATE = 30 ;

Promo1_util.clamp = function(value , min , max ) { 
    return (value < min) ? min : ( value > max ? max : value ) ;
}

var clamp = Promo1_util.clamp ;

//============================================================
//    LAppAnimation # updateDragMotion()
//============================================================
Promo1_util.updateDragMotion = function( model /*ALive2DModel*/ )
{

    dragMotion_lastTime = dragMotion_curTime ;
    dragMotion_curTime = UtSystem.getSystemTimeMSec() ;
    var frameRate /*:Number*/ = 1000.0 / ( dragMotion_curTime - dragMotion_lastTime ) ;
    if( frameRate < 10 ) frameRate = 10 ;
    /* final */var FACE_PARAM_MAX_V /*:Number*/ = 30.0 / 7.5 ;
    /* final */var MAX_V /*:Number*/ = FACE_PARAM_MAX_V * 1.0 / frameRate ;
    /* final */var TIME_TO_MAX_SPEED /*:Number*/ = 0.2 ;
    /* final */var FRAME_TO_MAX_SPEED /*:Number*/ = TIME_TO_MAX_SPEED * FRAME_RATE ;
    /* final */var MAX_A /*:Number*/ = MAX_V / FRAME_TO_MAX_SPEED ;
    var dx /*:Number*/ = ( dragMotion_faceTargetX - dragMotion_faceX ) ;
    var dy /*:Number*/ = ( dragMotion_faceTargetY - dragMotion_faceY ) ;
    if( dx == 0 && dy == 0 ) return  ;
    var d /*:Number*/ =  /*(Number)*/ Math.sqrt(dx * dx + dy * dy) ;
    var vx /*:Number*/ = MAX_V * dx / d ;
    var vy /*:Number*/ = MAX_V * dy / d ;
    var ax /*:Number*/ = vx - dragMotion_faceVX ;
    var ay /*:Number*/ = vy - dragMotion_faceVY ;
    var a /*:Number*/ =  /*(Number)*/ Math.sqrt(ax * ax + ay * ay) ;
    if( a < -MAX_A || a > MAX_A ) {
        ax *= MAX_A / a ;
        ay *= MAX_A / a ;
        a = MAX_A ;
    }
    dragMotion_faceVX += ax ;
    dragMotion_faceVY += ay ;
    {
        var max_v /*:Number*/ = 0.5 * (  /*(Number)*/ Math.sqrt(MAX_A * MAX_A + 16 * MAX_A * d - 8 * MAX_A * d) - MAX_A ) ;
        var cur_v /*:Number*/ =  /*(Number)*/ Math.sqrt(dragMotion_faceVX * dragMotion_faceVX + dragMotion_faceVY * dragMotion_faceVY) ;
        if( cur_v > max_v ) {
            dragMotion_faceVX *= max_v / cur_v ;
            dragMotion_faceVY *= max_v / cur_v ;
        }
    }
    dragMotion_faceX += dragMotion_faceVX ;
    dragMotion_faceY += dragMotion_faceVY ;
    var zzz /*:Number*/ = dragMotion_faceX * dragMotion_faceY ;
    var _weight /*:Number*/ = 1.0 ;
    model.addToParamFloat("PARAM_ANGLE_X" , clamp(dragMotion_faceX * 30 , -30 , 30) , _weight) ;
    model.addToParamFloat("PARAM_ANGLE_Y" , clamp(-dragMotion_faceY * 30 , -30 , 30) , _weight) ;
//    model.addToParamFloat("PARAM_ANGLE_Z" , clamp(zzz * 30 , -30 , 30) , _weight) ;
    model.addToParamFloat("PARAM_BODY_ANGLE_X" , clamp(dragMotion_faceX * 5 , -10 , 10) , _weight) ;
    model.addToParamFloat("PARAM_EYE_BALL_X" , clamp(dragMotion_faceX , -1 , 1) , _weight) ;
    model.addToParamFloat("PARAM_EYE_BALL_Y" , clamp(-dragMotion_faceY , -1 , 1) , _weight) ;
    if( dragMotion_faceY < -0.5 ) {
        model.addToParamFloat("PARAM_BASE_Y" , ( -dragMotion_faceY - 0.5 ) * 10 , _weight) ;
    }
}

//============================================================
//  æœ¬æ¥ã®ã‚µã‚¤ã‚ºã‚’å–å¾—ã™ã‚‹
//  c.f. http://dogmap.jp/2009/06/17/javascript-image-natural-size-2/
//============================================================
Promo1_util.getOriginalImageSize = function(image){
    var w = image.width ;
    var h = image.height ;
 
    // for Firefox, Safari, Chrome
    if ( typeof image.naturalWidth !== 'undefined' ) 
    { 
        w = image.naturalWidth;
        h = image.naturalHeight;
 
    } 
    else if ( typeof image.runtimeStyle !== 'undefined' ) //IE
    {
        var runtimeStyle= image.runtimeStyle;
        var tmpw = runtimeStyle.width ;
        var tmph = runtimeStyle.height ;
        runtimeStyle.width  = "auto";
        runtimeStyle.height = "auto";
        w = image.width;
        h = image.height;
        runtimeStyle.width  = tmpw;
        runtimeStyle.height = tmph;
 
    }
    else // Opera
    {
        var tmpw = image.width ;
        var tmph = image.height ;
        image.removeAttribute("width");
        image.removeAttribute("height");
        w = image.width;
        h = image.height;
        image.width  = mem.w;
        image.height = mem.h;
    }
 
    return {width:w, height:h};
}

//============================================================
//============================================================
Promo1_util.getPosition = function(e) {
    var html = document.documentElement;
    var r = e.getBoundingClientRect();
    var left = r.left - html.clientLeft;
    var top  = r.top - html.clientTop;
    return { left:left, top:top };
};

window.Promo1_util = Promo1_util ;

})() ;//===== å³æ™‚é–¢æ•°å‘¼ã³å‡ºã— ======