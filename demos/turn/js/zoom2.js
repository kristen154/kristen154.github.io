(function($){
	var zoomOptions = {
		max : 2,
		flipbook : null,
		  easeFunction: 'ease-in-out',
		  duration: 500,
		  when: {}
	},
	zoomMethods = {
		init : function(opts){
			var that = this,
			data = this.data(),
			options = $.extend({},zoomOptions,opts);
			var elWidth = options.flipbook.width()
			var elHeight = options.flipbook.height()
			data.zoom = {
				opts : options,
				initScale : 1,
				poscenter : point2D(0,0),
				tMatrix : [1,0,0,1,0,0],
				lastTranslate : point2D(0,0),
				ticking:false,
				elWidth : elWidth,
				elHeight : elHeight,
				lastcenter : point2D(elWidth / 2, elHeight / 2),
				maxMove : point2D(0, 0),
				center : point2D( elWidth /2 ,elHeight /2),
				initCenter: point2D(options.flipbook.offset().left + elWidth / 2, options.flipbook.offset().top + elHeight / 2)
			}

			if(typeof(options.max)!='function'){
				var max = options.max;
				options.max = function(){return max;};
			}

			for(var eventName in options.when){
				if (Object.prototype.hasOwnProperty.call(options.when, eventName)) {
			        this.bind('zoom.'+eventName, options.when[eventName]);
			      }
			}
			var mc = new Hammer.Manager(data.zoom.opts.flipbook[0]);
			mc.add(new Hammer.Pan({ threshold: 0, pointers: 1 }))
			mc.add(new Hammer.Pinch({ threshold: 0 }))
			mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
			mc.on("panmove", bind(zoomMethods._onPan,that));
			mc.on("panstart",bind(zoomMethods._onPanStart,that))
			mc.on("panend",bind(zoomMethods._onPanEnd,that))
			mc.on("pinchmove", bind(zoomMethods._onPinch,that));
			mc.on("pinchstart",bind(zoomMethods._onPinchStart,that));
			mc.on("pinchend",bind(zoomMethods._onPinchEnd,that));
			mc.on("doubletap",bind(zoomMethods._onDoubleTap,that));
		},

		_onPanStart : function(){

			var data = this.data().zoom;
			data.duration = '';
			data.lastTranslate = point2D(data.tMatrix[4],data.tMatrix[5]);//缓存上一次的偏移值
		},

		_onPan : function(ev){

				var data = this.data().zoom;
			//var that = this
			if(data.tMatrix[0]!=1){//如果等于1的话pan触发tturn
				data.tMatrix[4] = data.lastTranslate.x + ev.deltaX
				data.tMatrix[5] = data.lastTranslate.y + ev.deltaY
				bind(zoomMethods.requestElementUpdate,this)();
			}
			
		},

		_onPanEnd : function(){

			var data = this.data().zoom;
			if(data.tMatrix[0]!=1){
				var nowScale = data.tMatrix[0];
				data.maxMove.x = data.center.x * (nowScale - 1);
				data.maxMove.y = data.center.y * (nowScale - 1);
				data.duration = '.3s ease all';
				if(data.tMatrix[4] < -data.maxMove.x){
					data.tMatrix[4] = -data.maxMove.x;
				}else if(data.tMatrix[4] >data.maxMove.x){
					data.tMatrix[4] = data.maxMove.x;
				}
				if(data.tMatrix[5] < -data.maxMove.y){
					data.tMatrix[5] = -data.maxMove.y;
				}else if(data.tMatrix[5] >data.maxMove.y){
					data.tMatrix[5] = data.maxMove.y;
				}
				bind(zoomMethods.requestElementUpdate,this)();
			}
		},


		_onPinch : function(ev){
			var that = this,
			data = this.data().zoom,
			nowScale = data.tMatrix[0] = data.tMatrix[3] = data.initScale * ev.scale;
			var composscal = (1 - ev.scale) ;
			data.tMatrix[4] = composscal * data.poscenter.x + data.lastTranslate.x
			data.tMatrix[5] = composscal * data.poscenter.y + data.lastTranslate.y
			bind(zoomMethods.requestElementUpdate,that)();

		},

		_onPinchStart : function(ev){
			var that = this,
			data = this.data().zoom;
			data.duration = '';
			data.lastTranslate = point2D(data.tMatrix[4],data.tMatrix[5]);
			data.initScale = data.tMatrix[0] || 1;
			data.pointer = point2D(ev.center.x,ev.center.y);
			data.lastcenter = point2D(data.center.x + data.lastTranslate.x , data.center.y + data.lastTranslate.y)
			data.poscenter = point2D(ev.center.x - data.lastcenter.x, ev.center.y-data.lastcenter.y)
			bind(zoomMethods.requestElementUpdate,that)();
		},

		_onPinchEnd : function(ev){
			var that = this,
			data = this.data().zoom;
			if(data.tMatrix[0] < 1){//当缩小到少于原图时
				data.duration = '.3s ease all';
				data.tMatrix = [1,0,0,1,0,0];
				bind(zoomMethods.requestElementUpdate,that)();
			}
			
		},

		_onDoubleTap : function(ev){
			var that = this,
			data = this.data().zoom;
			data.duration = ".3s ease all";
			var nowScale = data.tMatrix[0];
			if(nowScale != 1 || data.tMatrix[4]!= 0){
				//scale不等于1，要重回1
				data.tMatrix[0] = data.tMatrix[3] = 1;
				data.tMatrix[4] = data.tMatrix[5] = 0;
			}else{
				var pointer = ev.center
				var scale = 2
				data.tMatrix[0] = data.tMatrix[3] = scale
				data.tMatrix[4] = (1 - scale) * ( pointer.x - (data.opts.flipbook.offset().left + data.center.x)) //(1-k) * 触摸点到元素中心点的距离
				data.tMatrix[5] = (1 - scale) * ( pointer.y - (data.opts.flipbook.offset().top + data.center.y))
			}
			bind(zoomMethods.requestElementUpdate,that)();
			
		},

		updateElementTransform : function(){
			var that = this,
			data = this.data().zoom,
			el = data.opts.flipbook;
			//el.style.transition = duration
		    var tmp = data.tMatrix.join(',')
		    el.css({'transition':data.duration,'transform': 'matrix(' + tmp + ')'})
		    

		    data.ticking = false;
		},

		requestElementUpdate: function(){
			var that = this;
			var data = this.data().zoom;
			if(!data.ticking) {
		        bind(zoomMethods.updateElementTransform,that)();
		        //data.ticking = true;
		    }
		}
	};
	function point2D(x,y){
		return {x : x, y : y}
	}
	function bind(func, context){
		return function(){
			return func.apply(context, arguments);
		}
	}

	var reqAnimationFrame = (function () {
    return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
	$.extend($.fn, {
		zoom: function() {
			var arg = arguments;
			if(!arg[0] || typeof(arg[0]) =='object')
				return zoomMethods.init.apply($(this[0]),arg)
		}
	})
})(jQuery)