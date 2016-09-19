var startOffsetX = null,
	endOffsetX = null,
	clickCnt = 0,
	idKey = 0,
	idNum = 0;

/**
  @module $$.timePicker
 **/
$$.timePicker= (function ($) {
	//--- 모듈 스코프 변수 시작 ---
	var _startPos = null,
		_endPos = null,
		_clicked = false,
		_saved = false,
		_$bar = null,
		_$del = null,
		_$timeline = $('#time-line'),
		_$todoModal = $('#todoModal');
		_storedData = [],
		_tempData = null;
		config = null,
		calToPx = null,
		timeStr = null;
		
	var _init,
		_bindEvents,
		_saveData,
		_getStartPoint,
		_getEndPoint,
		_getChkPoint,
		_getRange,
		_drawBar;
	//--- 모듈 스코프 변수 끝 ---

	//--- 초기화 메서드 시작 ---
	_init = function (timeline) {

		calToPx = $$.timeLine.calToPx();
		config = $$.timeLine.config;

		_bindEvents();
	}
	//--- 초기화 메서드 끝 ---

	//---  이벤트 핸들러 시작 ---
	_bindEvents = function (){
		
		var _self = this;

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
			_saveData();
		});

		_$todoModal.find('#cancel').on('click', function(event){
			$('#bar_'+idKey).remove();
			_$todoModal.modal('hide')
			idKey = '';
		});

		_$todoModal.on('hidden.bs.modal', function(){
			_$todoModal.find('#todo-title').val('');
			_$todoModal.find('#todo-desc').val('');
			console.log('cancel');
		});

		$(document).on('click', '.timeline .more', function(e){
			e.preventDefault();
			if($(this).hasClass('glyphicon-chevron-up')){
				$(this).parents('.desc').find('p').removeClass('opened');
				$(this).removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
				return false;
			}
			$(this).parents('.desc').find('p').addClass('opened');
			$(this).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
		})
	}
	//---  이벤트 핸들러 끝 ---

	//---  DOM 메서드 시작 ---
	_saveData = function(){
		var _idkey = idKey,
			_settings = {};

		if(_saved){
			var _title = _$todoModal.find('#todo-title').val();
			var _$desc = _$todoModal.find('#todo-desc');

			var _lines = _$desc.val().split("\n");
			var _descStr = "";
			for (var i = 0; i < _lines.length; i++) {
				_descStr += _lines[i] + "<br />";
			}
			//_descStr += "</p>";

			_settings = {
				id: _idkey,
				startDate: timeStr.startDate(),
				startTime: timeStr.startTime(),
				startPoint: startOffsetX,
				endDate: timeStr.endDate(),
				endTime: timeStr.endTime(),
				endPoint: startOffsetX + endOffsetX, 
				title: _title,
				description: _descStr 
			};					
			_tempData = TimeWorker.extend(_settings);
			_storedData.push(_tempData);

			$$.timeData.saveData(_storedData);

			_$bar.data('set', _settings);
			_$bar.data('active', true);

			var _$tooltip = _$bar.find('.tooltip');
			_$tooltip.find('.title').text(_$bar.data('set').title);
			_$tooltip.find('.time').text(_$bar.data('set').startTime+'-'+_$bar.data('set').endTime);
			_$tooltip.find('.desc').html(_$bar.data('set').description);

			_tempData = '';
			_saved = false;
		}
		/*else{
			$('.del').eq(_idx).trigger('click');	
		}*/
	};

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
				$('#bar_'+idKey).remove();
				clickCnt = 0;
				_clicked = false;
				return false;
			}

			if(endOffsetX != null && _storedData.length>0){
				var _lastPoint = startOffsetX+endOffsetX;

				_getChkPoint(_lastPoint); // 등록시간 중복오류 체크 
			}

			if(endOffsetX != null && _clicked){

				timeStr = $$.timeData.getTime(clickCnt, startOffsetX, endOffsetX);	//할일 시간 설정

				//설정한 시간만큼 Bar를 타임시트에 생성
				TimeWorker.drawBar(_$timeline, _$bar, startOffsetX, endOffsetX, idNum);

				idNum++;

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

		idKey = $$.util.rKey();

		_$bar = $('<div class="bar progress" id="bar_'+idKey+'" data-set="" data-active="false"><div class="inner"><div class="switch demo1"><input type="checkbox"><label><i></i></label></div></div></div>').appendTo(_$timeline);	// Bar 객체 생성

		_startPos = _$bar.offset();
		startOffsetX = (e.pageX+config.base)-(_startPos.left+config.base);

		if(_storedData.length>0){ //데이터가 하나이상 등록되어 있다면
			_getChkPoint(startOffsetX); // 등록시간 중복오류 체크 
		}

		_$bar.css('left', startOffsetX).css('width','2px');

		$$.timeData.getTime(clickCnt, startOffsetX);	//할일 시간 설정
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
			if(locOfClick > _storedData[_idx]["startPoint"] &&  locOfClick < _storedData[_idx]["endPoint"]){
				alert("이미 할 일이 등록되어 있습니다. 다른 시간을 선택해 주세요!!");
				$('#bar_'+idKey).remove();
				clickCnt = 0;
				_clicked = false;
				return false;
			}
			_idx++;
		}while (_idx<_storedData.length);
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

	//---  DOM 메서드 끝 ---

	//---  공개 api ---
	return {
		init : _init
	};

}(jQuery));
