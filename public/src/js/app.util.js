
(function ($) {

	$.Util = function(){
	
        /** 
		Init function will check for specific body classes and create the necessary page object.
		@function init
		**/
        function init() {

			// 배열요소를 삭제하는 메소드 추가
			Array.prototype.removeElement = function(index) {
				this.splice(index,1);     
				return this; 
			}; 
			
			if (!Array.indexOf) {
				Array.prototype.indexOf = function (obj, start) {
					for (var i = (start || 0); i < this.length; i++) {
						if (this[i] == obj) {
							return i;
						}
					}
				}
			}
		}

		//랜덤키 생성
		var randomKey = function () {
			return 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
		};

		//툴팁 레이어
		var tooltip = function(target, titleVar, event){
			var $target = target;
			var $tooltip = $target.find('.tooltip');

			var title = titleVar; // 'title'속성을 툴팁 텍스트로 설정시 true로 설정하다.
			var eventType = event;	// 이벤트 type 설정
			var text ='';

			if(title){
				text = $tartet.attr('title');	//title변수가 true이면 'a'태그의 'title'속성에서 텍스트를 가져와 text변수에 저장한다.
			}

			$target.bind({
				'mouseenter' :function(e){
					var evnt = e;
					showTooltip(evnt);
				},
				'mousemove': function(e){
					var evnt = e;
					showTooltip(evnt);
					//console.log('mousemove');
				},
				'mouseleave': function(e){
					hideTooltip();
				}
			});

			if(eventType=='mouseover'){		// 이벤트 type이 'mouseover'이면 'mousemove'이벤트를 제거하여 showTooltip 함수가 실행되는 것을 막는다. 
				$target.unbind('mousemove');
			}

			function showTooltip(evnt){

				var e = evnt;	//이벤트 객체를 변수로 저장

				if(eventType=='mouseover'||eventType=='mousemove'){	//이벤트 type이 'mouseover'이거나 'mousemove'이면 실행될 공통 구문 (이벤트 좌표를 구하는 구문)

					var ex = e.pageX;	//이벤트가 발생한 x좌표
					var ey = e.pageY;	//이벤트가 발생한 y좌표

					var offset = $target.offset();	// 브라우저의 screen 좌표(0,0)에서 $container요소가 위치한 오프셋 좌표
					var offsetX = ex - offset.left;		// 이벤트가 발생한 x좌표에서 $container요소의 오프셋좌표의 x좌표를 뺀 값을 변수에 저장 ($container요소의 position이 relatvie일때 유효함)
					var offsetY = ey - offset.top;		// 이벤트가 발생한 y좌표에서 $container요소의 오프셋좌표의 y좌표를 뺀 값을 변수에 저장 ($container요소의 position이 relatvie일때 유효함)

					console.log(ex);
				}

				if(title){
					$link.attr('title','');	// 'a'태그의 'title'속성의 텍스트를 지운다.
					$tooltip.html(text);	// text변수에 저장된 텍스트를 $tooltip 텍스트로 설정한다.
				}

				if(eventType=='mouseover'||eventType=='mousemove'){		//$tooltip의 넓이와 높이값을 변수에 저장한다.
					var width = $tooltip.outerWidth();		
					var height = $tooltip.outerHeight();
				}

				$tooltip.show();	//$tooltip를 화면에 보여준다.

				if(eventType=='mouseover'||eventType=='mousemove'){
					$tooltip.css({ 'left' : offsetX-20, 'top' : offsetY-height-10 });	//이벤트가 발생한 좌표를 $tooltip의 좌표로 설정한다.
				}

			}

			function hideTooltip(){

				$tooltip.hide();

				if(title){
					$tooltip.html('');
					$(this).attr('title',text);
				}
			}

		}	
			
		
		return {
			init : init,
			rKey : randomKey,
			tooltip: tooltip
		};
	};


}(jQuery));
