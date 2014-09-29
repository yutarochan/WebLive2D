//===============================================================
//===============================================================
//	Live2D Cubism Simple Sample
//	
//	(c)2014 Live2D Inc. All rights reserved.
//===============================================================
//===============================================================

var requestID ; 					// アニメーションを停止するためのID
var modelWrapper = null ;
var firstDraw = true ;

//========================================
//	main 
//========================================
function main() 
{
	var SETTINGS = window.PROMO_MODEL_SETTING ;
	
	// Get WebGL Context
	var canvas = document.getElementById("glcanvas");

	// Context Lost / Retored
	canvas.addEventListener("webglcontextlost", contextLost, false);
	canvas.addEventListener("webglcontextrestored" , function(e){initLoop(canvas); }, false);// reinit

	//	Tocuh処理
	//	canvas1 , frame_img のtouch/mouseイベントが取れた場合はtouchPosにセットされる。
	//	通常前面のイベントだけが取られる（要検証）
	var frame_img		= document.getElementById("frame_img")  ;
	var frame_img2		= document.getElementById("frame_img2")  ;
	var frame_img3		= document.getElementById("frame_img3")  ;
	Promo1_util.setupTouch( canvas ) ;	
	Promo1_util.setupTouch( frame_img ) ;	
	Promo1_util.setupTouch( frame_img2 ) ;	
	Promo1_util.setupTouch( frame_img3 ) ;	
	
	// 加速度センサを初期化
	Promo1_util.setupAccel() ;
	
	// Init and start Loop
	initLoop(canvas);
}

	
//========================================
//	initLoop
//========================================
function initLoop(canvas) 
{
	// setup GL Context
	var gl = Promo1_util.getWebGLContext(canvas);
	if ( !gl ) { myerror("Failed to create WebGL context.") ;  return ; }

	// Clear Color
	gl.clearColor( 0.0 , 0.0 , 0.0 , 0.0 ) ;	 

	// モデルをロード
	modelWrapper = new SampleLive2DWrapper( canvas , gl , PROMO_MODEL_SETTING.MODEL_JSON_PATH ) ;

	//------------ 描画ループ ------------
	var tick = function() {
		draw( gl ) ; // 1回分描画
		requestID = requestAnimationFrame( tick , canvas ) ;// 一定時間後に自身を呼び出す
	};
	tick();
}

//========================================
//	context lost
//========================================
function contextLost(e)
{
	myerror("context lost") ;
	loadLive2DCompleted = false ;
	initLive2DCompleted = false ;

	cancelAnimationFrame( requestID ); // 停止
	e.preventDefault();　// 
}

//========================================
//	draw
//========================================
function draw(gl)
{
	
	// Canvasをクリアする
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Live2D初期化
	draw_Live2D(gl) ;
	
}

//========================================================
//========================================================
//	Live2D関連
//========================================================
//========================================================

//========================================
//	draw Live2D Model
//========================================
function draw_Live2D(gl) 
{
	var live2DModel = modelWrapper.getModel() ;
	if( ! live2DModel ) return ;// ロードが完了していないので何もしないで返る
	
	if( firstDraw ){
		var loading = document.getElementById("loading");
		loading.style.display = "none" ;

		firstDraw = false ;
	}

	var live2DPhysics = modelWrapper.getPhysics() ;
	var live2DMotions = modelWrapper.getMotions() ;
	var mainMotionMgr = modelWrapper.getMotionManager() ;
	
	var t = UtSystem.getTimeMSec() * 0.001 ;// 時刻を取得して 秒に変更

	//----------------------------------------------
	// モーションファイルのモーションを反映する
	live2DModel.loadParam() ;//前回セーブされた状態をロード
	try{
		//------- MAIN MOTION --------
		if( mainMotionMgr.isFinished() && live2DMotions && live2DMotions.length > 0 ){
			var bm = Math.floor( Math.random() * live2DMotions.length ) ;
			if( live2DMotions[bm] ){
				var eno = mainMotionMgr.startMotion( live2DMotions[bm] , false ) ;
			}
		}
		else{
			if( ! mainMotionMgr.updateParam( live2DModel )  ){
				// eyeMotion.setParam(model) ;
			}
		}
	}catch(e){
		mylog(e) ;
	}
	live2DModel.saveParam() ;//状態を保存
	
	//----------------------------------------------
	// ドラッグに反応させる
	Promo1_util.updateDragMotion( live2DModel ) ;

	// 物理演算させる
	if( live2DPhysics )live2DPhysics.updateParam(live2DModel);//物理演算でパラメータ更新

	// 加速度センサを反映する
	var accel = Promo1_util.accelXYZ ;

	live2DModel.addToParamFloat( "PARAM_ANGLE_X" , -50*accel[0] ) ;
	live2DModel.addToParamFloat( "PARAM_ANGLE_Y" , 50*accel[1] ) ;

	// live2DModel.addToParamFloat( "PARAM_EYE_BALL_X" ,  2*touchPos[0] ) ;
	// live2DModel.addToParamFloat( "PARAM_EYE_BALL_Y" , -2*touchPos[1] ) ;

	//----------------------------------------------
	// 表示位置を指定するための行列を定義する
	var zoom = PROMO_MODEL_SETTING.ZOOM || ( 1.6+0.3* Math.sin(0.5*t))  ;
	var matrix = new L2DMatrix44() ;
	{// 行列の計算
		// キャンバスサイズとモデルサイズで、倍率を調整する
		var canvas = document.getElementById("glcanvas");
		var smodel = canvas.width / live2DModel.getCanvasWidth() ;// canvasの横幅を-1..1区間に収める
		matrix.multScale( smodel , smodel ) ;		//左から掛ける
	
		// viewport 変換 
		var sw = 2.0 / canvas.width ;// canvasの横幅を-1..1区間に収める
		var sh = 2.0 / canvas.height;// canvasの縦幅を-1..1区間に収める
		matrix.multScale( sw , -sh ) ;		//左から掛ける
		matrix.multTranslate( -1 , 1 ) ;	//左から掛ける
	
		// 拡大縮小する
		var cx = PROMO_MODEL_SETTING.ZOOM_CENTER_X ;
		var cy = PROMO_MODEL_SETTING.ZOOM_CENTER_Y ;
		matrix.multTranslate( -cx , -cy ) ;	//左から掛ける
		matrix.multScale( zoom , zoom ) ;	//左から掛ける
		matrix.multTranslate( cx , cy ) ;	//左から掛ける
	
		// 位置調整	
		var ox = PROMO_MODEL_SETTING.OFFSET_X ;
		var oy = PROMO_MODEL_SETTING.OFFSET_Y ;
		matrix.multTranslate( ox , oy ) ;	//左から掛ける

		// 加速度によってモデルの描画位置をずらす
		var accelScale = 2.5 - zoom ;
		matrix.multTranslate( accelScale*accel[0] , -0.2 + accelScale*accel[1] ) ;	//左から掛ける
	}

	// モデルに行列をセットする
	live2DModel.setMatrix( matrix.getArray() ) ;

	//----------------------------------------------
	// フレームを描く
	var frame_img3 = document.getElementById("frame_img3");
	var frame_img2 = document.getElementById("frame_img2");
	if( frame_img2 ){
		frame_img2.style.opacity = Promo1_util.clamp( 20*( 1.6 - zoom ) ,  0 , 1 ) ;
	}

	//----------------------------------------------
	// // 背景をずらしてみる
	var backimg = document.getElementById("back_img");
	{
		backimg.style.visibility  = "visible" ;
		backimg.style.position = 'absolute'; 
		var backzoom = Math.pow( zoom ,0.3 ) ;
		var originalSize = Promo1_util.getOriginalImageSize(backimg) ;
	
		var imgw = originalSize.width*3*backzoom ;
		var imgh = originalSize.height*3*backzoom ;

//		var bounds = Promo1_util.getPosition(canvas) ;
		var bounds = { top:0 , left:0 } ;

		var left = 400 + (-imgw*0.5)*backzoom ;
		var top  = 600 + (-imgh*0.5)*backzoom ;
	
		var imgleft = left +  0.6*accel[0]*800 ;
		var imgtop  =  top + -0.6*accel[1]*800 ;
	
		backimg.style.left   = ( imgleft )+"px";
		backimg.style.top    = ( imgtop  )+"px";
		backimg.style.width  = ( imgw )+"px";
		backimg.style.height = ( imgh )+"px";
		backimg.style.clip   = "rect(" + (bounds.top-imgtop)+"px, " + (bounds.left-imgleft+640)  +"px," 
			+ (bounds.top-imgtop+800)+"px, " + (bounds.left-imgleft) + "px )" ;
	}

	//----------------------------------------------
	// Live2Dモデルを更新して描画
	live2DModel.update() ;	// 現在のパラメータに合わせて頂点等を計算
	live2DModel.draw() ;	// 描画
}


//========================================
//	画面にも見える形でログを出す
//========================================
function mylog( msg , isError )
{
	var myconsole = document.getElementById("myconsole");
	if( myconsole ){
		var tagmsg = isError ? "<span style='color:red'>" + msg + "</span>" : msg ;
		myconsole.innerHTML = myconsole.innerHTML + "<br>" + tagmsg ;
	}
	console.log(msg) ;
}

//========================================
function myerror( msg ){
	mylog( msg , true ) ;
}

