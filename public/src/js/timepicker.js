var startOffsetX = null,
	endOffsetX = null,
	clickCnt = 0,
	idNum = 0;

/**
  @module $$.timePicker
 **/
$$.timePicker= (function ($) {

	var _startPos = null,
		_endPos = null,
		_clicked = false,
		_$bar = null,
		_$del = null,
		_settings = {},
		config = null,
		calToPx = null,
		storedData = {},
		timeStr = null,
		timeDataObj = null,
		tempBar = null,
		timeWorker = [];
		
	var _init,
		_bindEvents,
		_getStartPoint,
		_getEndPoint,
		_getChkPoint,
		_getRange,
		_drawBar;

	/** 
	Init function will check for specific body classes and create the necessary page object.
	@function init
	**/
	_init = function (timeline) {

		calToPx = $$.timeLine.calToPx();
		config = $$.timeLine.config;

		timeDataObj = $$.timeData;
		//storedData = timeDataObj.getData();

		_bindEvents();
	}

	_bindEvents = function (){
		
		var _self = this,
			_saved = false,
			_$timeline = $('#time-line'),
			_$todoModal = $('#todoModal');

		_$timeline.on('click', function(event){
			var e = event;
			e.stopPropagation();
			_getStartPoint(e, $(this));	//시간설정(bar생성)을 위한 start point

		});

		_$timeline.on('mousemove', function(event){
			var e = event;
			_getRange(e, _$bar);	//시간설정(bar생성)을 위한 end point
		});

		_$todoModal.find('#save').on('click', function(event){
			_saved = true;
			_$todoModal.modal('hide')
		});

		_$todoModal.find('#cancel').on('click', function(event){
			_$todoModal.modal('hide')
		});

		_$todoModal.on('hide.bs.modal', function(){
			var _idx = idNum-1;
			if(_saved){
				var _title = _$todoModal.find('#todo-title').val();
				var _desc = _$todoModal.find('#todo-desc').val();

				_settings = {
					no: _idx,
					startDate: timeStr.startDate(),
					startTime: timeStr.startTime(),
					startPoint: startOffsetX,
					endDate: timeStr.endDate(),
					endTime: timeStr.endTime(),
					endPoint: startOffsetX + endOffsetX, 
					title: _title,
					description: _desc 
				};					
				tempBar = TimeBar.extend(_settings);
				//console.log(tempBar.__proto__===TimeBar);
				timeWorker.push(tempBar);

				timeDataObj.saveData(timeWorker);
				_saved = false;
				tempBar = '';
			}else{
				$('.del').eq(_idx).trigger('click');	
			}
		});

		_$todoModal.on('hidden.bs.modal', function(){
			_$todoModal.find('#todo-title').val('');
			_$todoModal.find('#todo-desc').val('');
		});
	}

	_getStartPoint = function (event, target){	// 할일설정(bar생성)을 위한 Start 함수

		var _self = this, 
			e = event,
			_$timeline = target;

		clickCnt++;

		if(clickCnt>=2){

			_getEndPoint(e, _$bar);	//할일 종료를 위한 함수 호출

			if(endOffsetX != null &&endOffsetX<(calToPx/2)){
				alert('call 1');
				alert('할 일은 최소한 30분이상 등록할 수 있습니다!');
				$('#bar'+idNum).remove();
				clickCnt = 0;
				_clicked = false;
				return false;
			}

			if(endOffsetX != null && storedData.length>0){
				var _lastPoint = startOffsetX+endOffsetX;

				_getChkPoint(_lastPoint); // 등록시간 중복오류 체크 
			}

			if(endOffsetX != null && _clicked){

				timeStr = timeDataObj.getTime(clickCnt, idNum, startOffsetX, endOffsetX);	//할일 시간 설정
				//$('#display-info span').eq(clickCnt-1).append(testStr);

				_drawBar(_$timeline, _$bar);		//설정한 시간만큼 Bar를 타임시트에 생성

				// Modal popup open
				$('#todoModal').modal({
					keyboard: true,
					timeStr: timeStr
				});

				$('#todoModal').on('shown.bs.modal', function(){
					var _$time = $('#todoModal').find('.txt-time');

					_$time.find('#startDate').empty().append(timeStr.startDate());
					_$time.find('#endDate').empty().append(timeStr.endDate());
					_$time.find('#startTime').empty().append(timeStr.startTime());
					_$time.find('#endTime').empty().append(timeStr.endTime());

					$(this).find('#todo-title').focus();
				});

				clickCnt = 0;
				_clicked = false;

				return false;
			}
		}

		_$bar = $('<div class="bar progress" id="bar'+idNum+'"><div class="switch demo1"><input type="checkbox"><label><i></i></label></div></div>').appendTo(_$timeline);	// Bar 객체 생성

		_startPos = _$bar.offset();
		startOffsetX = (e.pageX+config.base)-(_startPos.left+config.base);

		if(storedData.length>0){ //데이터가 하나이상 등록되어 있다면

			_getChkPoint(startOffsetX); // 등록시간 중복오류 체크 

		}

		_$bar.css('left', startOffsetX).css('width','2px');

		timeDataObj.getTime(clickCnt, idNum, startOffsetX);	//할일 시간 설정
		//$('#display-info span').eq(clickCnt-1).append(testStr);

		_clicked = true;
	}

	_getEndPoint = function (event, target){	// 할일 종료를 위한 End 함수
		var e = event;
		var _$bar = target;

		_endPos = _$bar.offset();
		endOffsetX = (e.pageX+config.base)-(_endPos.left+config.base);

		/*if(endOffsetX>($.timeline._getAnHour()*2)){
			alert("할일은 최대 2시간까지 가능합니다");
			endOffsetX = 240;	//할일시간이 2시간(240px)이 넘어가지 않도록 설정
		}*/

		return endOffsetX;
	}

	_getChkPoint = function (locOfClick, callback){
		var _idx = 0;
		if(callback && typeof (callback) === 'fuction'){
			callback();
		}
		do{
			if(locOfClick > storedData[_idx]["startPoint"] &&  locOfClick < storedData[_idx]["endPoint"]){
				alert("이미 할 일이 등록되어 있습니다. 다른 시간을 선택해 주세요!!");
				$('#bar'+idNum).remove();
				clickCnt = 0;
				_clicked = false;
				return false;
			}
			_idx++;
		}while (_idx<storedData.length);
	};

	_getRange = function (event, target){	// 시간 범위 설정
		var e = event;
		var _$bar = target;

		if(_clicked){
			var _tempPos = _$bar.offset();
			var _tempOffsetX = e.pageX-_tempPos.left;

			_$bar.css('width', _tempOffsetX+2);
		}
	}

	_drawBar = function (target1, target2){		// Bar 생성
		var _$timeline = target1;
		var _$bar = target2;

		_$bar.css('width', endOffsetX);

		_$del = $('<div class="btn btn-default btn-xs del" id="del'+idNum+'" role="group" aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></div>').appendTo(_$timeline);
		_$del.css({'left' : (startOffsetX+endOffsetX)-24});

		idNum++;

		//time.home.setTimeData._delTime();
		
		_$del.bind('click', function(){
			var _self = $(this);
			timeDataObj.delTime(_self);

			return false;
		});
	}

	return {
		init : _init
	};

}(jQuery));
