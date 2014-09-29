//========================================================
//========================================================
//
//    live2d_framework.js
//          merged : 2014/09/07 23:30
//
//========================================================
//========================================================

(function(){
var FUNCTION_INITIALIZING = true ;


//****************************************************************
//****************************************************************
//     L2DMatrix44.js
//****************************************************************
//****************************************************************

//package jp.live2d.framework.live2d
//============================================================
//============================================================
//  class L2DMatrix44          
//============================================================
//============================================================
function L2DMatrix44()
{
    this.tr              = new Float32Array(16) ; // 
    for( var i /*:int*/ = 0 ; i < 16 ; i++ ) this.tr[i] = ( ( i % 5 ) == 0 ) ? 1 : 0 ;
}

//============================================================
//    static L2DMatrix44.mul()
//============================================================
L2DMatrix44.mul             = function( a /*float[]*/ , b /*float[]*/ , dst /*float[]*/ )
{
    var c /*:Number*/ = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] //TODO *****************  ;
    var n /*:int*/ = 4 ;
    var i /*:int*/ , j /*:int*/ , k /*:int*/ ;
    for( i = 0 ; i < n ; i++ ) {
        for( j = 0 ; j < n ; j++ ) {
            for( k = 0 ; k < n ; k++ ) {
                c[i + j * 4] += a[i + k * 4] * b[k + j * 4] ;
            }
        }
    }
    for( i = 0 ; i < 16 ; i++ ) {
        dst[i] = c[i] ;
    }
}

//============================================================
//    L2DMatrix44 # getArray()
//============================================================
L2DMatrix44.prototype.getArray        = function()
{
    return this.tr ;
}

//============================================================
//    L2DMatrix44 # getCopyMatrix()
//============================================================
L2DMatrix44.prototype.getCopyMatrix   = function()
{
    return this.tr.clone() ;
}

//============================================================
//    L2DMatrix44 # setMatrix()
//============================================================
L2DMatrix44.prototype.setMatrix       = function( tr /*float[]*/ )
{
    if( this.tr == null || this.tr.length != this.tr.length ) return  ;
    for( var i /*:int*/ = 0 ; i < 16 ; i++ ) this.tr[i] = this.tr[i] ;
}

//============================================================
//    L2DMatrix44 # getScaleX()
//============================================================
L2DMatrix44.prototype.getScaleX       = function()
{
    return this.tr[0] ;
}

//============================================================
//    L2DMatrix44 # getScaleY()
//============================================================
L2DMatrix44.prototype.getScaleY       = function()
{
    return this.tr[5] ;
}

//============================================================
//    L2DMatrix44 # transformX()
//============================================================
L2DMatrix44.prototype.transformX      = function( src /*float*/ )
{
    return this.tr[0] * src + this.tr[12] ;
}

//============================================================
//    L2DMatrix44 # transformY()
//============================================================
L2DMatrix44.prototype.transformY      = function( src /*float*/ )
{
    return this.tr[5] * src + this.tr[13] ;
}

//============================================================
//    L2DMatrix44 # invertTransformX()
//============================================================
L2DMatrix44.prototype.invertTransformX = function( src /*float*/ )
{
    return ( src - this.tr[12] ) / this.tr[0] ;
}

//============================================================
//    L2DMatrix44 # invertTransformY()
//============================================================
L2DMatrix44.prototype.invertTransformY = function( src /*float*/ )
{
    return ( src - this.tr[13] ) / this.tr[5] ;
}

//============================================================
//    L2DMatrix44 # multTranslate()
//============================================================
L2DMatrix44.prototype.multTranslate   = function( shiftX /*float*/ , shiftY /*float*/ )
{
    var tr1 /*:Number*/ = [ 1 , 0 , 0 , 0 , 0 , 1 , 0 , 0 , 0 , 0 , 1 , 0 , shiftX , shiftY , 0 , 1 ] //TODO *****************  ;
    L2DMatrix44.mul(tr1 , this.tr , this.tr) ;
}

//============================================================
//    L2DMatrix44 # translate()
//============================================================
L2DMatrix44.prototype.translate       = function( x /*float*/ , y /*float*/ )
{
    this.tr[12] = x ;
    this.tr[13] = y ;
}

//============================================================
//    L2DMatrix44 # translateX()
//============================================================
L2DMatrix44.prototype.translateX      = function( x /*float*/ )
{
    this.tr[12] = x ;
}

//============================================================
//    L2DMatrix44 # translateY()
//============================================================
L2DMatrix44.prototype.translateY      = function( y /*float*/ )
{
    this.tr[13] = y ;
}

//============================================================
//    L2DMatrix44 # multScale()
//============================================================
L2DMatrix44.prototype.multScale       = function( scaleX /*float*/ , scaleY /*float*/ )
{
    if( arguments.length == 1 ) scaleY = scaleX ;
    var tr1 /*:Number*/ = [ scaleX , 0 , 0 , 0 , 0 , scaleY , 0 , 0 , 0 , 0 , 1 , 0 , 0 , 0 , 0 , 1 ] //TODO *****************  ;
    L2DMatrix44.mul(tr1 , this.tr , this.tr) ;
}

//============================================================
//    L2DMatrix44 # scale()
//============================================================
L2DMatrix44.prototype.scale           = function( scaleX /*float*/ , scaleY /*float*/ )
{
    if( arguments.length == 1 ) scaleY = scaleX ;
    this.tr[0] = scaleX ;
    this.tr[5] = scaleY ;
}


//****************************************************************
//****************************************************************
//     LDPhysics.js
//****************************************************************
//****************************************************************

//package jp.live2d.framework.live2d
//============================================================
//============================================================
//  class L2DPhysics           
//============================================================
//============================================================
function L2DPhysics()
{
    this.physicsList    = null /* TODO NOT INIT */ ; // ArrayList<PhysicsHair>
    this.startTimeMSec  = null /* TODO NOT INIT */ ; // 
    this.physicsList    = [] ;//ArrayList<PhysicsHair>
    this.startTimeMSec  = UtSystem.getUserTimeMSec() ;
}

// //============================================================
// //    static L2DPhysics.load()
// //============================================================
// L2DPhysics.load            = function( _in /*InputStream*/ )
// {
//     var buf /*:Array*/ = UtFile.load(_in) ;//byte[] in is replace _in
//     return L2DPhysics.load(buf) ;
// }

//============================================================
//    static L2DPhysics.load()
//============================================================
L2DPhysics.load            = function( jsonStr /*str*/ )
//L2DPhysics.load            = function( buf /*byte[]*/ )
{
    var ret /*:Array*/ = new L2DPhysics(  ) ;//L2DPhysicsL2DPhysics
    var json /*:Array*/ = JSON.parse(jsonStr) ;//Value
    var params /*:Array*/ = json.physics_hair ;//ArrayList<Value>
    var paramNum /*:int*/ = params.length ;
    for( var i /*:int*/ = 0 ; i < paramNum ; i++ ) {
        var param /*:Array*/ = params[i] ;//Value
        var physics /*:Array*/ = new PhysicsHair(  ) ;//PhysicsHairPhysicsHair
        var setup /*:Array*/ = param.setup ;//Value
        var length /*:Number*/ = setup.length ;
        var resist /*:Number*/ = setup.regist ;
        var mass /*:Number*/ = setup.mass ;
        physics.setup(length , resist , mass) ;
        var srcList /*:Array*/ = param.src ;//ArrayList<Value>
        var srcNum /*:int*/ = srcList.length ;
        for( var j /*:int*/ = 0 ; j < srcNum ; j++ ) {
            var src /*:Array*/ = srcList[j] ;//Value
            var id /*:Array*/ = src.id ;//String
            var type /*:Array*/ = PhysicsHair.Src.SRC_TO_X ;//PhysicsHair.Src
            var typeStr /*:Array*/ = src.ptype ;//String
            if( typeStr == "x" ) {
                type = PhysicsHair.Src.SRC_TO_X ;
            }
            else if( typeStr == "y" ) {
                type = PhysicsHair.Src.SRC_TO_Y ;
            }
            else if( typeStr == "angle" ) {
                type = PhysicsHair.Src.SRC_TO_G_ANGLE ;
            }
            else {
                UtDebug.error("live2d" , "ç‰©ç†æ¼”ç®—ã®è¨­å®šã§ç„¡åŠ¹ãªãƒ‘ãƒ©ãƒ¡ãƒ¼ã‚¿ãŒæŒ‡å®šã•ã‚Œã¾ã—ãŸã€‚PhysicsHair.Src") ;
            }
            var scale /*:Number*/ = src.scale ;
            var weight /*:Number*/ = src.weight ;
            physics.addSrcParam(type , id , scale , weight) ;
        }
        var targetList /*:Array*/ = param.targets ;//ArrayList<Value>
        var targetNum /*:int*/ = targetList.length ;
        for( var j /*:int*/ = 0 ; j < targetNum ; j++ ) {
            var target /*:Array*/ = targetList[j] ;//Value
            var id /*:Array*/ = target.id ;//String
            var type /*:Array*/ = PhysicsHair.Target.TARGET_FROM_ANGLE ;//PhysicsHair.Target
            var typeStr /*:Array*/ = target.ptype ;//String
            if( typeStr == "angle" ) {
                type = PhysicsHair.Target.TARGET_FROM_ANGLE ;
            }
            else if( typeStr == "angle_v" ) {
                type = PhysicsHair.Target.TARGET_FROM_ANGLE_V ;
            }
            else {
                UtDebug.error("live2d" , "ç‰©ç†æ¼”ç®—ã®è¨­å®šã§ç„¡åŠ¹ãªãƒ‘ãƒ©ãƒ¡ãƒ¼ã‚¿ãŒæŒ‡å®šã•ã‚Œã¾ã—ãŸã€‚PhysicsHair.Target") ;
            }
            var scale /*:Number*/ = target.scale ;
            var weight /*:Number*/ = target.weight ;
            physics.addTargetParam(type , id , scale , weight) ;
        }
        ret.addParam(physics) ;
    }
    return ret ;
}

// L2DPhysics.load            = function( buf /*byte[]*/ )
// {
//     var ret /*:Array*/ = new L2DPhysics(  ) ;//L2DPhysicsL2DPhysics
//     var json /*:Array*/ = Json.parseFromBytes(buf) ;//Value
//     var params /*:Array*/ = json.get("physics_hair").getVector(null) ;//ArrayList<Value>
//     var paramNum /*:int*/ = params.size() ;
//     for( var i /*:int*/ = 0 ; i < paramNum ; i++ ) {
//         var param /*:Array*/ = params.get(i) ;//Value
//         var physics /*:Array*/ = new PhysicsHair(  ) ;//PhysicsHairPhysicsHair
//         var setup /*:Array*/ = param.get("setup") ;//Value
//         var length /*:Number*/ = setup.get("length").toFloat() ;
//         var resist /*:Number*/ = setup.get("regist").toFloat() ;
//         var mass /*:Number*/ = setup.get("mass").toFloat() ;
//         physics.setup(length , resist , mass) ;
//         var srcList /*:Array*/ = param.get("src").getVector(null) ;//ArrayList<Value>
//         var srcNum /*:int*/ = srcList.size() ;
//         for( var j /*:int*/ = 0 ; j < srcNum ; j++ ) {
//             var src /*:Array*/ = srcList.get(j) ;//Value
//             var id /*:Array*/ = src.get("id").toString() ;//String
//             var type /*:Array*/ = PhysicsHair.Src.SRC_TO_X ;//PhysicsHair.Src
//             var typeStr /*:Array*/ = src.get("ptype").toString() ;//String
//             if( typeStr.equals("x") ) {
//                 type = PhysicsHair.Src.SRC_TO_X ;
//             }
//             else if( typeStr.equals("y") ) {
//                 type = PhysicsHair.Src.SRC_TO_Y ;
//             }
//             else if( typeStr.equals("angle") ) {
//                 type = PhysicsHair.Src.SRC_TO_G_ANGLE ;
//             }
//             else {
//                 UtDebug.error("live2d" , "ç‰©ç†æ¼”ç®—ã®è¨­å®šã§ç„¡åŠ¹ãªãƒ‘ãƒ©ãƒ¡ãƒ¼ã‚¿ãŒæŒ‡å®šã•ã‚Œã¾ã—ãŸã€‚PhysicsHair.Src") ;
//             }
//             var scale /*:Number*/ = src.get("scale").toFloat() ;
//             var weight /*:Number*/ = src.get("weight").toFloat() ;
//             physics.addSrcParam(type , id , scale , weight) ;
//         }
//         var targetList /*:Array*/ = param.get("targets").getVector(null) ;//ArrayList<Value>
//         var targetNum /*:int*/ = targetList.size() ;
//         for( var j /*:int*/ = 0 ; j < targetNum ; j++ ) {
//             var target /*:Array*/ = targetList.get(j) ;//Value
//             var id /*:Array*/ = target.get("id").toString() ;//String
//             var type /*:Array*/ = PhysicsHair.Target.TARGET_FROM_ANGLE ;//PhysicsHair.Target
//             var typeStr /*:Array*/ = target.get("ptype").toString() ;//String
//             if( typeStr.equals("angle") ) {
//                 type = PhysicsHair.Target.TARGET_FROM_ANGLE ;
//             }
//             else if( typeStr.equals("angle_v") ) {
//                 type = PhysicsHair.Target.TARGET_FROM_ANGLE_V ;
//             }
//             else {
//                 UtDebug.error("live2d" , "ç‰©ç†æ¼”ç®—ã®è¨­å®šã§ç„¡åŠ¹ãªãƒ‘ãƒ©ãƒ¡ãƒ¼ã‚¿ãŒæŒ‡å®šã•ã‚Œã¾ã—ãŸã€‚PhysicsHair.Target") ;
//             }
//             var scale /*:Number*/ = target.get("scale").toFloat() ;
//             var weight /*:Number*/ = target.get("weight").toFloat() ;
//             physics.addTargetParam(type , id , scale , weight) ;
//         }
//         ret.addParam(physics) ;
//     }
//     return ret ;
// }

//============================================================
//    L2DPhysics # addParam()
//============================================================
L2DPhysics.prototype.addParam        = function( phisics /*PhysicsHair*/ )
{
    this.physicsList.push(phisics) ;
}

//============================================================
//    L2DPhysics # updateParam()
//============================================================
L2DPhysics.prototype.updateParam     = function( model /*ALive2DModel*/ )
{
    var timeMSec /*:long*/ = UtSystem.getUserTimeMSec() - this.startTimeMSec ;
    for( var i /*:int*/ = 0 ; i < this.physicsList.length ; i++ ) {
        this.physicsList[i].update(model , timeMSec) ;
    }
}




window.L2DMatrix44          = L2DMatrix44 ;
window.L2DPhysics           = L2DPhysics ;


var FUNCTION_INITIALIZING = false ;
})()