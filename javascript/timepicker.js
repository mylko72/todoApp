var startOffsetX = null,
	endOffsetX = null,
	clickCnt = 0,
	idNum = 0;

(function ($) {
    /**
	@class $.TimePicker
	@constructor
	**/
    $.TimePicker= function () {

		var startPos = null,
			endPos = null,
			cnt = 0,
			config = null,
			clicked = false,
			$bar = null,
			calToPx = null,

			storedData = null,

			timeStr = null,
			time = {};

			
		/** 
		Init function will check for specific body classes and create the necessary page object.
		@function init
		**/
		function init(timeline) {

			calToPx = new $.TimeLine().calToPx();
			config = new $.TimeLine().config;

			$.timedata = new $.TimeData();
			storedData = $.timedata._getData();

			bindEvents();
		}

		function bindEvents(){
			
			var self = this,
				saved = false,
				$timeline = $('#time-line'),
				$todoModal = $('#todoModal');

			$timeline.on('click', function(event){
				var e = event;
				getStartPoint(e, $(this));	//시간설정(bar생성)을 위한 start point

			});

			$timeline.on('mousemove', function(event){
				var e = event;
				getRange(e, $bar);	//시간설정(bar생성)을 위한 end point
			});

			$todoModal.find('#save').on('click', function(event){
				saved = true;
				$todoModal.modal('hide')
			});

			$todoModal.find('#cancel').on('click', function(event){
				$todoModal.modal('hide')
			});

			$('#todoModal').on('hide.bs.modal', function(){
				var idx = idNum-1;
				if(saved){
					var title = $todoModal.find('#todo-title').val();
					var memo = $todoModal.find('#todo-memo').val();
					$.timedata._saveTime(idx, title, memo);
					saved = false;
				}else{
					$('.del').eq(idx).trigger('click');	
				}
			});

			$('#todoModal').on('hidden.bs.modal', function(){
				$('#todoModal').find('#todo-title').val('');
				$('#todoModal').find('#todo-memo').val('');
			});
		}

		function getStartPoint(event, target){	// 할일설정(bar생성)을 위한 Start 함수

			var self = this, 
				e = event,
				$timeline = target;

			clickCnt++;

			if(clickCnt>=2){

				getEndPoint(e, $bar);	//할일 종료를 위한 함수 호출

				if(endOffsetX != null &&endOffsetX<(calToPx/2)){
					alert('call 1');
					alert('할 일은 최소한 30분이상 등록할 수 있습니다!');
					$('#bar'+idNum).remove();
					clickCnt = 0;
					clicked = false;
					return false;
				}

				if(endOffsetX != null && storedData.length>0){
					var lastPoint = startOffsetX+endOffsetX;

					getChkPoint(lastPoint); // 등록시간 중복오류 체크 
				}

				if(endOffsetX != null && clicked){

					var timeStr = $.timedata._getTime(clickCnt, idNum, startOffsetX, endOffsetX);	//할일 시간 설정
					//$('#display-info span').eq(clickCnt-1).append(testStr);

					drawBar($timeline, $bar);		//설정한 시간만큼 Bar를 타임시트에 생성

					// Modal popup open
					$('#todoModal').modal({
						keyboard: true,
						timeStr: timeStr
					});

					$('#todoModal').on('shown.bs.modal', function(){
						var $time = $('#todoModal').find('.txt-time');

						$time.find('#year').empty().append(timeStr.startYear);
						$time.find('#year2').empty().append(timeStr.endYear);
						$time.find('#start-date').empty().append(timeStr.startDate);
						$time.find('#end-date').empty().append(timeStr.endDate);

						$(this).find('#todo-title').focus();
					});

					clickCnt = 0;
					clicked = false;

					return false;
				}
			}

			$bar = $('<div class="bar progress" id="bar'+idNum+'">').appendTo($timeline);	// Bar 객체 생성

			startPos = $bar.offset();
			startOffsetX = (e.pageX+config.base)-(startPos.left+config.base);

			if(storedData.length>0){ //데이터가 하나이상 등록되어 있다면

				getChkPoint(startOffsetX); // 등록시간 중복오류 체크 

			}

			$bar.css('left', startOffsetX).css('width','2px');

			$.timedata._getTime(clickCnt, idNum, startOffsetX);	//할일 시간 설정
			//$('#display-info span').eq(clickCnt-1).append(testStr);

			clicked = true;
		}

		function getEndPoint(event, target){	// 할일 종료를 위한 End 함수
			var e = event;
			var $bar = target;

			endPos = $bar.offset();
			endOffsetX = (e.pageX+config.base)-(endPos.left+config.base);

			/*if(endOffsetX>($.timeline._getAnHour()*2)){
				alert("할일은 최대 2시간까지 가능합니다");
				endOffsetX = 240;	//할일시간이 2시간(240px)이 넘어가지 않도록 설정
			}*/

			return endOffsetX;
		}

		function getChkPoint(locOfClick, callback){
			var cnt = 0;
			if(callback && typeof (callback) === 'fuction'){
				callback();
			}
			do{
				if(locOfClick > storedData[cnt]["startPoint"] &&  locOfClick < storedData[cnt]["endPoint"]){
					alert("이미 할 일이 등록되어 있습니다. 다른 시간을 선택해 주세요!!");
					$('#bar'+idNum).remove();
					clickCnt = 0;
					clicked = false;
					return false;
				}
				cnt++;
			}while (cnt<storedData.length);
		}

		function getRange(event, target){	// 시간 범위 설정
			var e = event;
			var $bar = target;

			if(clicked){
				var tempPos = $bar.offset();
				var tempOffsetX = e.pageX-tempPos.left;

				$bar.css('width', tempOffsetX+2);
			}
		}

		function drawBar(target1, target2){		// Bar 생성
			var $timeline = target1;
			var $bar = target2;

			$bar.css('width', endOffsetX);

			$del = $('<div class="btn btn-default btn-xs del" id="del'+idNum+'" role="group" aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></div>').appendTo($timeline);
			$del.css({'left' : (startOffsetX+endOffsetX)-24});

			idNum++;

			//time.home.setTimeData._delTime();
			
			$del.bind('click', function(){
				var self = $(this);
				$.timedata._delTime(self);

				return false;
			});
		}

		return {
			init : init
		};
	};

}(jQuery));
