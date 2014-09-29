
(function (){
var FUNCTION_INITIALIZING = true ;

//============================================================
//============================================================
//  class SampleLive2DWrapper
//============================================================
//============================================================
function SampleLive2DWrapper( canvas , gl , modelJsonFilePath )
{
	if( FUNCTION_INITIALIZING ) return ;

	
	this.live2DModel 	= null ;
	this.live2DMotions	= [] ;
	this.live2DPhysics	= null ;

	this.mainMotionMgr = new MotionQueueManager() ;

	this.loadLive2DCompleted = false ;	// モデルのロードが完了したら true 
	this.initLive2DCompleted = false ;	// モデルの初期化が完了したら true
	this.loadedImages		= [] ;

	// Context Lost / Retored
	canvas.addEventListener("webglcontextlost", contextLost, false);

	//---	
	this.canvas 		= canvas ;
	this.gl				= gl ;
	this.modelJson 		= null ;//JSON object
	
	var dirPos = modelJsonFilePath.lastIndexOf("/") ;
	this.modelHomeDir 	= dirPos < 0 ? "./" : modelJsonFilePath.substring(0, dirPos+1) ;
	
	
	var selfObj = this ;
	
	loadText( modelJsonFilePath , function(text){
		selfObj.modelJson  = JSON.parse( text ) ;
		
		// Model JSONをロードする
		selfObj.load() ;
	}) ;
	

	
}


//========================================
//	context lost
//========================================
function contextLost(e)
{
	this.loadLive2DCompleted = false ;
	this.initLive2DCompleted = false ;
}

//========================================
//	load Live2D Model
//========================================
SampleLive2DWrapper.prototype.load = function() 
{
	var loadCount = 0 ;
	var selfObj = this ;
	// load moc
	loadBytes( this.modelHomeDir + this.modelJson.model , function(buf){
		selfObj.live2DModel = Live2DModelWebGL.loadModel( buf ) ;
	} ) ;

	// load textures
	for( var i = 0 ; i < this.modelJson.textures.length ; i++ ){
		(function ( tno ){// 即時関数で i の値を tno に固定する（onerror用)
			selfObj.loadedImages[tno] = new Image() ; ;
			selfObj.loadedImages[tno].src = selfObj.modelHomeDir + selfObj.modelJson.textures[tno] ;
			selfObj.loadedImages[tno].onload = function(){
				if( (++loadCount) == selfObj.modelJson.textures.length ) selfObj.loadLive2DCompleted = true ;//全て読み終わった
			}
			selfObj.loadedImages[tno].onerror = function() { 
				myerror("Failed to load image : " + selfObj.modelJson.textures[tno] ); 
			}
		})( i ) ;
	}

	// load motions
	if( this.modelJson.motions ){
		for( var i = 0 ; i < this.modelJson.motions.idle.length ; i++ ){
			(function ( mno ){// 即時関数で i の値を mno に固定する
				var mdef = selfObj.modelJson.motions.idle[mno] ;
				loadBytes( selfObj.modelHomeDir + mdef.file , function(buf){
			        var motion = Live2DMotion.loadMotion(buf);
			        motion.setFadeIn( mdef.fade_in );
			        motion.setFadeOut( mdef.fade_out );

			        selfObj.live2DMotions[mno] = motion ;
				} ) ;
			})( i ) ;
		}
	}

	// 物理演算
	if(this.modelJson.physics != null){
		loadText( this.modelHomeDir + this.modelJson.physics , function(text){
			selfObj.live2DPhysics = L2DPhysics.load( text );
		} ) ;
	}


}


//========================================
//	init Live2D Model
//	ロード完了後、初回描画時に初期化される
//========================================
SampleLive2DWrapper.prototype.init_Live2D = function(gl)
{
	mylog("init Live2D") ;

	// 画像からWebGLテクスチャ化を生成し、モデルに登録
	for( var i = 0 ; i < this.loadedImages.length ; i++ ){
		var texName = createTexture( gl , this.loadedImages[i] ) ;//Image型からテクスチャを生成
		this.live2DModel.setTexture( i , texName ) ;// モデルにテクスチャをセット
	}

	// テクスチャの元画像の参照をクリア
	this.loadedImages = null ;

	// OpenGLのコンテキストをセット
	this.live2DModel.setGL( gl ) ;

}


//========================================
//========================================
/*
SampleLive2DWrapper.prototype.draw_Live2D = function(gl) 
{
	if( ! live2DModel || ! loadLive2DCompleted ) return ;// ロードが完了していないので何もしないで返る
	
	// ロード完了後に初回のみ初期化する
	if( ! initLive2DCompleted ){
		initLive2DCompleted = true ;

		// 初期化する
		init_Live2D(gl) ;
	}

	//----------------------------------------------
	// Live2Dモデルを更新して描画
	live2DModel.update() ;	// 現在のパラメータに合わせて頂点等を計算
	live2DModel.draw() ;	// 描画
}
*/


//========================================
//========================================
SampleLive2DWrapper.prototype.getModel = function() 
{
	if( ! this.live2DModel || ! this.loadLive2DCompleted ) return null ;

	// ロード完了後に初回のみ初期化する
	if( ! this.initLive2DCompleted ){
		this.initLive2DCompleted = true ;

		// 初期化する
		this.init_Live2D(this.gl) ;
	}
	
	return this.live2DModel ;	
}

SampleLive2DWrapper.prototype.getPhysics = function() 
{
	return this.live2DPhysics ;
}

SampleLive2DWrapper.prototype.getMotions = function() 
{
	return this.live2DMotions  ;
}

SampleLive2DWrapper.prototype.getMotionManager = function() 
{
	return this.mainMotionMgr ;//MotionQueueManager
}

//========================================
// createTexture()
// @return int型 の glTextureName
//========================================
function createTexture( gl, image) 
{
	var texture = gl.createTexture();	 // テクスチャオブジェクトを作成する
	if ( !texture ){ mylog("Failed to generate gl texture name.") ; return -1 ; }

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);	// imageを上下反転
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D , texture );
	gl.texImage2D( gl.TEXTURE_2D , 0 , gl.RGBA , gl.RGBA , gl.UNSIGNED_BYTE , image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
	
	return texture ;
}


//========================================
//	request としてロードする
//========================================
function loadBytes( path , callback )
{
	load_exe( path , "arraybuffer" , function (req){ 
		callback(req.response) ; 
	}) ;
}

//========================================
//	request としてロードする
//========================================
function loadText( path , callback )
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


window.SampleLive2DWrapper = SampleLive2DWrapper ;

var FUNCTION_INITIALIZING = false ;	
})() ;


