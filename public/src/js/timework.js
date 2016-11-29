/**
  @module $$.timeWork
 **/
$$.timeWork= (function ($) {
	//--- 모듈 스코프 변수 시작 ---
	var _startOffsetX = null,
		_endOffsetX = null,
		_clickCnt = 0,
		_idKey = 0,
		_clicked = false,
		_saved = false,
		_cntDone = 0,
		_chkDate,
		_mode = "",
		_timeStr = null,
		_timer = null,
		_refreshIntervalId,
		_stopped = false,
		_$bar = null,
		_$timeline = $('#time-line'),
		_$todoModal = $('#todoModal');
		
	var _init,
		_bindEvents,
		_whichAnimationEvent,
		_updateClock,
		_stopClock,
		_timerFn,
		_getFormData,
		_setDataBar,
		_processChk,
		_loadStoredData,
		_redrawTimeline,
		_chkToDone,
		_getStartPoint,
		_getEndPoint,
		_getChkPoint,
		_getRange,
		_countTotal,
		_countDone,
		_showTimeList,
		_delTimeList,
		_renderList,
		_showMsg,
		_hideMsg,
		_slideIn,
		_sortBy;
	//--- 모듈 스코프 변수 끝 ---

	//--- 초기화 메서드 시작 ---
	_init = function (timeline) {

		_updateClock();
		_refreshIntervalId = setInterval (_updateClock, 1000);

		_bindEvents();
	};
	//--- 초기화 메서드 끝 ---

	//---  이벤트 핸들러 시작 ---
	_bindEvents = function (){
		
		var _self = this,
			animatedEvent = _whichAnimationEvent();
		
		$('.capsule').one(animatedEvent, function(e){
			$(this).find('span').addClass('shadow showIn');
		});

		/* 할일 설정과 종료 이벤트 */
		_$timeline.on('click', function(event){
			var e = event,
				_res;
				_timeStr;

			e.stopPropagation();

			_clickCnt++;

			if(_clickCnt>=2){
				_res = _getEndPoint(e, _$bar);	//할일 종료를 위한 함수 호출

				// 할일 등록 팝업 Open
				if(_res){
					_$todoModal.modal({
						keyboard: true
					});
				}

				_clickCnt = 0;
				_clicked = false;
			}else{
				_getStartPoint(e, $(this));	//할일 설정을 위한 함수 호출

				_clicked = true;
			}
		});

		/* 할일 설정 범위 이벤트 */
		_$timeline.on('mousemove', function(event){
			var e = event;
			_getRange(e, _$bar);	
		});

		/* 취소를 위한 ESC키 바인드 */
		$(document).on('keydown', function(event){
			var e = event;

			if(_clicked && e.keyCode === 27){
				console.log('cancel!');
				$('#bar_'+ _idKey).remove();
				_clickCnt = 0;
				_clicked = false;
			}
		});
		
		$(document).on('click', '.btn-load', function(event){
			var e = event;

			$(this).hide();
			$('.api-select').css('display','inline-block');
		});

		$(document).on('click', '.dropdown-menu a', function(event){
			var e = event,
				_url = $(this).data('url');

			_loadStoredData(_url);
		});

		$(document).on('click', '.btn-send', function(event){
			var e = event,
				_todoData = {},
				_storedData = $$.timeData.getStoredData(),
				_jsonData;

			e.preventDefault();

			_todoData.todo = _storedData; 	
			_jsonData = JSON.stringify(_todoData);
			console.log(_jsonData);
			alert(_jsonData);
		});


		$(document).on('click', '.mytool .del', function(){
			var _idkey = $(this).parents('.bar').data('set').id;
		
			$('#alert').data('id', _idkey);
			$('#alert').show();
			$('#alert').find('.alert').addClass('alert-delete');
			$('#alert').find('.msg')[0].innerHTML = '<strong>Delete!</strong><br />Do you want to delete it?'

			return false;
		});

		$(document).on('click', '.alert-delete .btn', function(){
			var _idkey = $(this).parents('#alert').data('id');

			if($(this).hasClass('btn-ok')){
				$('#bar_'+_idkey).remove();
				$$.timeData.removeData(_idkey);
			}

			$(this).parent('.alert').removeClass('alert-delete');
			$('#alert').hide();
		});

		$(document).on('click', '.bar input:checkbox', function(){
			var _idkey = $(this).parents('.bar').data('set').id;
		
			$('#alert').data('id', _idkey);
			$('#alert').show();
			$('#alert').find('.alert').addClass('alert-status');
			$('#alert').find('.msg')[0].innerHTML = $(this).is(':checked') ? '<strong>Wait!</strong><br />Do you want it changed in progress?' : '<strong>Wait!</strong><br />Do you want it changed in completion?';
		}); 

		$(document).on('click', '.alert-status .btn', function(){
			var _idkey = $(this).parents('#alert').data('id'),
				_chkVal = $('#bar_'+_idkey).find('.switch input:checkbox').is(':checked');

			if($(this).hasClass('btn-ok')){
				_chkToDone(_idkey);
			}else{
				$('#bar_'+_idkey).find('.switch input:checkbox').prop('checked',!_chkVal)
			}
			$(this).parent('.alert').removeClass('alert-status');
			$('#alert').hide();
		});

		//$(document).on('click', '.bar input:checkbox', _chkToDone); 

		$(document).on('click', '.todo-list .more', function(e){
			e.preventDefault();
			if($(this).hasClass('glyphicon-chevron-up')){
				$(this).parents('.flag-wrapper').find('.desc p').removeClass('opened');
				$(this).removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
				return false;
			}
			$(this).parents('.flag-wrapper').find('.desc p').addClass('opened');
			$(this).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
		});

		$(document).on('click', '.modal .modal-backdrop', function(){
			_$todoModal.find('#cancel').trigger('click'); 
		});

		/* 할일 등록 저장 */
		_$todoModal.find('#save').on('click', function(event){
			var _dataSet,
				_idx;

			_saved = true;
			_dataSet = _getFormData();

			if(_dataSet){
				_setDataBar.call(_$bar, _dataSet);

				_idx = $$.timeData.saveData(_dataSet);
			
				_processChk(200, function(){
					_showTimeList('.todo-area', _idx);
				});

				_$todoModal.modal('hide')

				_idKey = '';
				_mode = '';
				_saved = false;
			}
		});

		/* 할일 수정 */
		_$todoModal.find('#edit').on('click', function(event){
			var _idkey = _idKey,
				_dataSet,
				_storedData = $$.timeData.getStoredData();

			if(_mode == 'EDIT'){

				_dataSet = _getFormData();

				if(_dataSet){
					_setDataBar.call(_$bar, _dataSet);

					for(var i=0;i<_storedData.length;i++){
						if(_storedData[i].id === _idkey){
							_storedData[i].title = _dataSet.title;
							_storedData[i].description = _dataSet.description;
						}
					}

					//타임리스트 수정
					_processChk(200, function(){
						_updateTimeList('.todo-area', _dataSet);
					});

					//tooltip 데이타수정
					_$todoModal.modal('hide')

					console.log(_storedData);

					_mode = '';
					_idKey = '';
				}
			}
		});

		/* 할일 등록 취소 */
		_$todoModal.find('#cancel, .close').on('click', function(event){
			if(_mode == 'SAVE'){
				$('#bar_'+ _idKey).remove();
			}
			_$todoModal.modal('hide')

			_mode = '';
			_idKey = '';
		});

		/* 할일 등록 취소를 위한 ESC키 바인드 */
		_$todoModal.on('keydown', function(event){
			var e = event,
				_$targetId = e.target.getAttribute('id');

			if(_$todoModal.find('#todo-title').val().length){
				_$todoModal.find('#todo-title').removeClass('warn');
			}

			if(_$targetId == 'todoModal'||_$targetId == 'todo-title'||_$targetId == 'todo-desc'){
				if(e.keyCode === 27){
					console.log('cancel!');
					_$todoModal.find('#cancel').trigger('click');
				}
			}
		});

		_$todoModal.on('show.bs.modal', function(event){
			var e = event,
				_dataSet,
				_$button = $(event.relatedTarget),
				_$bar = _$button.parents('.bar'),
				_$time = $('#todoModal').find('.txt-time');

			_mode = _$button.data('mode');

			if(_mode == 'EDIT'){
				_dataSet = _$bar.data('set');

				console.log(_dataSet);

				var _desc = _dataSet.description;
				var _descStr;

				if(_desc){
					_descStr = $$.util.returnLine(_desc);
					_$todoModal.find('#todo-desc').empty().val(_descStr);
				}

				_$todoModal.find('#todo-title').empty().val(_dataSet.title);
				_$todoModal.find('#startDate').empty().append(_dataSet.startDate);
				_$todoModal.find('#endDate').empty().append(_dataSet.endDate);
				_$todoModal.find('#startTime').empty().append(_dataSet.startTime);
				_$todoModal.find('#endTime').empty().append(_dataSet.endTime);

				_$todoModal.find('#save').hide();
				_$todoModal.find('#edit').show();

				_idKey = _dataSet.id;

				console.log(_mode + 'mode');

			}else{
				_$time.find('#startDate').empty().append(_timeStr.startDate());
				_$time.find('#endDate').empty().append(_timeStr.endDate());
				_$time.find('#startTime').empty().append(_timeStr.startTime());
				_$time.find('#endTime').empty().append(_timeStr.endTime());

				_$todoModal.find('#save').show();
				_$todoModal.find('#edit').hide();

				_mode = 'SAVE';

				console.log(_mode + 'mode');
			}

			_$todoModal.find('#todo-title').focusin();

		});

		_$todoModal.on('hidden.bs.modal', function(){
			_$todoModal.find('#todo-title').val('');
			_$todoModal.find('#todo-desc').val('');
		});

	};
	//---  이벤트 핸들러 끝 ---

	//---  DOM 메서드 시작 ---
	_whichAnimationEvent = function(){
		var t,
			el = document.createElement("fakeelement");

		var animations = {
			"animation"      : "animationend",
			"OAnimation"     : "oAnimationEnd",
			"MozAnimation"   : "animationend",
			"WebkitAnimation": "webkitAnimationEnd"
		}

		for (t in animations){
			if (el.style[t] !== undefined){
				return animations[t];
			}
		}
	};

	_updateClock = function(){
		var _$clock = $("#clock"),
			_now = new Date(),
			_year = _now.getFullYear(),
			_month = _now.getMonth()+1,
			_date = _now.getDate();

		//var timeStr = now.replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
		_$clock.find('.date')[0].innerHTML = _year + '-' + _month + '-' + _date;
		_$clock.find('.time')[0].innerHTML = _timerFn();

	};

	_stopClock = function(newdate){
		if(_stopped){
			clearInterval(_refreshIntervalId);
			$('#clock').find('.date').addClass('only').text(newdate);
			$('#clock').find('.time').hide();
		}
	};

	_timerFn = function(){
		var _date = new Date();
		var _hour = _date.getHours();
		var _ampm = (_hour<12 || _hour == 24) ? 'AM' : 'PM';
		_hour = _hour%12 || 12;

		var _minute = _date.getMinutes();
		_minute = ( _minute > 9 ) ? _minute : "0" + _minute;

		var _second = _date.getSeconds(); 
		_second = ( _second > 9 ) ? _second : "0" + _second;

		var _millisec = _date.getMilliseconds(); 
		_millisec = ( _millisec > 99 ) ? _millisec : ( _millisec > 9 ) ? "0" + _millisec : "00" + _millisec;

		var _timeString = _hour + ":" + _minute + ":" + _second + ' <sup>' + _ampm + '</sup>';

		return _timeString;
	};

	_loadStoredData = function(url){
		var _jsonUrl = url,
			_storedData,
			_result = false;

		$.getJSON(_jsonUrl, function(data){

			//$('<div id="loading" />').appendTo('body');

			_result = $$.timeData.loadData(data.todo);
		})
		.done(function(data){
			if(_result){
				_processChk(500, function(){
					if($('.time-area').length){
						$('.time-area').remove();
					}
					_redrawTimeline();
					_showTimeList('.todo-area');
				});
			}
		});
	};

	_processChk = function(duration, callback){
		var _self = this;

		$('<div id="loading" />').appendTo('body');

		_timer = setTimeout(function(){
			if(callback && typeof (callback) === 'function'){
				callback.call(_self);
			}

			$('#loading').remove();
			_timer = null;
		}, duration);
	};

	_redrawTimeline = function(){
		var _storedData = $$.timeData.getStoredData(),
			_dateStr = new Date(_storedData[0].startDate),
			_startTime = _storedData[0].startTime,
			_hour,
			_tooltipStr,
			_dataSet;

		_mode = 'LOAD';
		_stopped = true;
		_hour = parseInt(_startTime.split(':')[0]);

		_stopClock(_storedData[0].startDate);
		$$.timeData.setObjDate(_dateStr);
		$$.timeLine.init(_hour);

		if($('.bar').length){
			$('.bar').remove();
		}

		$.each(_storedData, function(index, item){
			var _width = item.endPoint - item.startPoint;

			_$bar = $('<div class="bar" id="bar_' + item.id + '" data-set="">'
				+ '<div class="wrapper progress">'
					+ '<div class="inner">'
						+ '<div class="switch demo1">'
							+ '<input type="checkbox"><label><i></i></label>'
						+ '</div>'
					+ '</div>'
				+ '</div>'
				+ '</div>');

			$('#time-sheet').css('left',0)
							.append(_$bar);	

			_dataSet = {
				id: item.id,
				startDate: item.startDate,
				startTime: item.startTime, 
				startPoint: item.startPoint,
				endDate: item.endDate, 
				endTime: item.endTime, 
				endPoint: item.endPoint, 
				title: item.title,
				description: item.description, 
				done: item.done 
			};					

			_$bar.css('left', item.startPoint);

			TimeModel.drawBar(_$timeline, _$bar, item.startPoint, _width);
			_setDataBar.call(_$bar, _dataSet);
			_countTotal();
		});
	};
	
	/* 등록 데이타 가져오기 */
	_getFormData = function(){
		var _idkey = _idKey,
			_dataSet= null,
			_saveMode = _mode=='SAVE' ? true : false,
			_title = _$todoModal.find('#todo-title').val(),
			_desc = _$todoModal.find('#todo-desc').val(),
			_descStr = null;

			_$bar = $('#bar_'+_idkey);
			
			//console.log(_$bar);

			if(!_title){
				//alert('할일 제목을 입력해주세요!');
				_$todoModal.find('#todo-title').addClass('warn').attr('placeholder', 'Please enter a title!');
				_$todoModal.find('#todo-title').focus();
				return false;
			}

			if(_desc.length>0){
				_descStr = $$.util.returnBr(_desc);
			}

			_dataSet = {
				id: _idkey,
				startDate: _saveMode ? _timeStr.startDate() : _$bar.data('set').startDate,
				startTime: _saveMode ? _timeStr.startTime() : _$bar.data('set').startTime,
				startPoint: _saveMode ?  _startOffsetX : _$bar.data('set').startPoint,
				endDate: _saveMode ? _timeStr.endDate() : _$bar.data('set').endDate,
				endTime: _saveMode ? _timeStr.endTime() : _$bar.data('set').endTime,
				endPoint: _saveMode ? _startOffsetX+_endOffsetX : _$bar.data('set').endPoint,
				title: _title,
				description: _descStr,
				done: _saveMode ? false : _$bar.data('set').done
			};					

			return _dataSet;
	};

	/* 데이타 설정 */
	_setDataBar = function(dataSet){
		var _dataSet = dataSet,
			_$tooltip;

		if(_mode == 'SAVE' || _mode == 'LOAD'){
			this.find('.switch input:checkbox').prop('checked', true);
			this.appendTo($('#time-sheet'));
		}
		this.data('set', _dataSet);

		_$tooltip = this.find('.tooltip').addClass('in');
		_$tooltip.find('.title').text(this.data('set').title);
		_$tooltip.find('.time').text(this.data('set').startTime+'-'+this.data('set').endTime);
		if(this.data('set').description){
			_$tooltip.find('.desc').show().html(this.data('set').description);
		}else{
			_$tooltip.find('.desc').hide();
		}
	};

	/* 할일 상태(진행/완료) 전환 */
	_chkToDone = function(idkey){
		var _storedData = $$.timeData.getStoredData(),
			_idkey = idkey, 
			_done = $('#bar_'+_idkey).data('set').done;

			console.log(_idkey);

			$('#bar_'+_idkey).data('set').done = !_done;
			$('.todo-list').find('.time_'+_idkey).toggleClass('done');

			for(var i=0;i<_storedData.length;i++){
				if(_storedData[i].id === _idkey){
					_storedData[i].done = (_done==false) ? true : false;
					_storedData[i].done ? _cntDone++ : _cntDone--;
				}
			}

			console.log(_storedData);

			_countDone(_cntDone);
	},

   	/* 할일설정(bar생성)을 위한 Start 함수 */
	_getStartPoint = function (event, target){	

		var	e = event,
			_self = this, 
			_startPos,
			_storedData = $$.timeData.getStoredData(),
			_$timeline = target;

		_idKey = $$.util.rKey();

		_$bar = $('<div class="bar" id="bar_' + _idKey + '" data-set="">'
			+ '<div class="wrapper progress">'
				+ '<div class="inner">'
					+ '<div class="switch demo1">'
						+ '<input type="checkbox"><label><i></i></label>'
					+ '</div>'
				+ '</div>'
			+ '</div>'
			+ '</div>');
			
		_$timeline.append(_$bar);	// Bar 객체 생성

		_startPos = _$bar.offset();
		_startOffsetX = e.pageX-_startPos.left;
		
		_$bar.css('left', _startOffsetX).css('width','2px');

		$$.timeData.getTime(_clickCnt, _startOffsetX);	//할일 시간 설정
	}

	/* 할일 종료를 위한 End 함수 */
	_getEndPoint = function (event, target){	
		var e = event,
			_endPos,
			_getPxToHour = $$.timeLine.getPxToHour(),
			_$bar = target;

		_endPos = _$bar.offset();
		//endOffsetX = (e.pageX+config.base)-(_endPos.left+config.base);
		_endOffsetX = e.pageX-_endPos.left;

		if(_endOffsetX && _endOffsetX<(_getPxToHour/2)){
			alert('할 일은 최소한 30분이상 등록할 수 있습니다!');
			$('#bar_'+ _idKey).remove();
			_clickCnt = 0;
			_clicked = false;
			
			return false;
		}

		if(_endOffsetX && _clicked){

			_timeStr = $$.timeData.getTime(_clickCnt, _startOffsetX, _endOffsetX);	//할일 시간 설정

			console.log(_timeStr.startDate());

			//설정한 시간만큼 Bar를 타임시트에 생성
			TimeModel.drawBar(_$timeline, _$bar, _startOffsetX, _endOffsetX);

			return true; 
		}

		/*if(endOffsetX != null && _storedData.length>0){
		  var _lastPoint = startOffsetX+endOffsetX;

		  _getChkPoint(_lastPoint); // 등록시간 중복오류 체크 
		  }*/


		/*if(endOffsetX>($.timeline._getAnHour()*2)){
			alert("할일은 최대 2시간까지 가능합니다");
			endOffsetX = 240;	//할일시간이 2시간(240px)이 넘어가지 않도록 설정
		}*/

		//return endOffsetX;
	}

	_getChkPoint = function (locOfClick, callback){
		var _idx = 0,
			_storedData = $$.timeData.getStoredData();

		if(callback && typeof (callback) === 'fuction'){
			callback();
		}
		do{
			if(locOfClick > _storedData[_idx]["startPoint"]+30 &&  locOfClick < _storedData[_idx]["endPoint"]){
				alert("이미 할 일이 등록되어 있습니다. 다른 시간을 선택해 주세요!!");
				$('#bar_'+ _idKey).remove();
				_clickCnt = 0;
				_clicked = false;
				return false;
			}
			_idx++;
		}while (_idx<_storedData.length);
	};
	
	/* 할일 범위 설정 */
	_getRange = function (event, target){	
		var e = event;
		var _$bar = target;

		if(_clicked){
			var _tempPos = _$bar.offset();
			var _tempOffsetX = e.pageX-_tempPos.left;

			_$bar.css('width', _tempOffsetX+2);
		}
	};

	_countTotal = function(){
		var _len = $$.timeData.getStoredData().length,
			_$total = $('.panel-info').find('.total');

		_$total.find('.badge').text(_len);

		return _len;
	};

	_countDone = function(cntDone){
		var _cnt = cntDone,
			_$done = $('.panel-info').find('.done');

		_cntDone = _cnt;

		_$done.find('.badge').text(_cntDone);
	};

	/* 할일 리스트 출력 */
	_showTimeList = function(target, idx){
		var _$todoArea = $(target),
			_url = _$todoArea.data('template'),
			_storedData = $$.timeData.getStoredData(), 
			_success = false,
			_li,
			_top,
			_idx = idx || 0;

		_$todoArea.find('.nolist').hide();

		console.log(_idx);

		_success = _renderList(_$todoArea, _idx, _storedData, _url);

		if(_success) {
			//_li = _slideIn($('.todo-list'), _idx);
			//_top = $$.util.elemTop($(_li));

			$('.content').css('height', 'auto');
			$('.content').css('height', $('.content').outerHeight());

			//$(window).scrollTop(_top);
		}
		//_sortBy($('.date_'+_storedData[_idx].startDate).find('.todo-list'));
	};

	_updateTimeList = function(target, dataset){
		var _dataSet = dataset,
			_$moreBtn,
			_$liEl = $(target).find('.time_' + _dataSet.id);

		_$liEl.find('.title').text(_dataSet.title);

		if(_dataSet.description){
			_$liEl.find('.desc').show();
			_$liEl.find('.desc .txts').html(_dataSet.description);
		}else{
			_$liEl.find('.desc').hide();
		}

		_$liEl.find('.desc>p').removeClass('opened');
		_$liEl.find('.more').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
		
		setTimeout(function(){
			if(_$liEl.find('.desc .txts').height()>_$liEl.find('.desc').height()){
				if(_$liEl.find('.flag-wrapper .more').length == 0){
					_$moreBtn = String() + '<a href="#" class="glyphicon glyphicon-chevron-down more">더보기</a>';
					_$liEl.find('.flag-wrapper').append(_$moreBtn);
				}
			}else{
				_$liEl.find('.flag-wrapper .more').remove();
			}
		}, 300);
	};

	/* 할일 리스트 삭제 */
	_delTimeList = function(idkey){
		var _idkey = idkey,
			_$todolist,
			len;

		_$todolist = $('li.time_'+_idkey).parent('.todo-list');
		_$todolist.find('li.time_'+_idkey).remove();
		_len = _$todolist.find('li').length;

		if(_len == 0) {
			_$todolist.parents('.time-area').remove();
			_$todolist.remove();
		}

		if(!_countTotal()){
			$('.todo-area').find('.nolist').show();
			_chkDate = '';
		}

		setTimeout(function(){
			_sortBy(_$todolist);

			$('.content').css('height', 'auto');
			$('.content').css('height', $('.content').outerHeight());
		}, 1000);
	};

	/* Html(목록) 렌더링 */
	_renderList = function(target, idx, storedData, templateUrl){
		var _$todoArea = target,
			_$todoList,
			_$moreBtn,
			_num = 0,
			_idx = idx,
			_storedData = storedData,
			_templateUrl = templateUrl,
			_$liEl;
	
		$.ajax({
			type : "GET",
			async : false,
			url : _templateUrl,
			success : function(template) {

				_$todoArea.find('.todo-list').empty();
			
				$.each(_storedData, function(index, item){

					var _newLi = $(template).find('.todo-list > li');				

					//console.log('_chkDate :'+_chkDate);
					//console.log('item.startDate :'+item.startDate);

					if(_chkDate != item.startDate){
						if(_$todoArea.find('.date_'+item.startDate).size()==0){
							var i;

							if(_chkDate){
								var lastIdx = _chkDate.lastIndexOf('-');
								var _dd = _chkDate.substring(lastIdx+1, _chkDate.length);
								var lastIdx2 = item.startDate.lastIndexOf('-');
								var _dd2 = item.startDate.substring(lastIdx2+1, item.startDate.length);
							}

							_dd2 < _dd ? _$todoArea.prepend(template) : _$todoArea.append(template);
							_dd2 < _dd ? i = 0 : i = -1; 
								
							_$todoArea.find('.time-area').eq(i).addClass('date_'+item.startDate);
							$('.date_'+item.startDate).find('.time-tit').text(item.startDate);
						} else {
							_$todoArea.find('.date_'+item.startDate).find('.todo-list').append(_newLi);
						}

						_chkDate = item.startDate;
						_num = 0;

					} else {
						_$todoArea.find('.date_'+item.startDate).find('.todo-list').append(_newLi);
					}

					_$todoList = _$todoArea.find('.date_'+item.startDate).find('.todo-list');

					_$liEl = _$todoList.find('li').eq(_num);

					_$liEl.addClass('time_'+item.id);
					_$liEl.find('.title').text(item.title);
					_$liEl.find('.start-time').text(item.startTime);
					_$liEl.find('.end-time').text(item.endTime);

					item.description ? _$liEl.find('.desc .txts').html(item.description) : _$liEl.find('.desc').hide();

					if(_$liEl.find('.desc .txts').height()>_$liEl.find('.desc').height()){
						_$moreBtn = String() + '<a href="#" class="glyphicon glyphicon-chevron-down more">더보기</a>';
						_$liEl.find('.flag-wrapper').append(_$moreBtn);
					} 

					_num % 2 == 0 ? _$liEl.find('.direction-r').removeClass('direction-r').addClass('direction-l') 
									:_$liEl.find('.direction-l').removeClass('direction-l').addClass('direction-r'); 

					_num++;
				});
			}
		});

		return true;
	};

	/* 등록 메시지 show */
	_showMsg = function (target){
		$(target).addClass(function(index){
			var _addClass;
			if($(target).is(':hidden')){
				$(target).css('display', 'block');
				_addClass = 'show-in';
			}
			var _top = parseInt($(this).css('top'));
			//$(target).css('opacity', 1);	
			$(target).css('transform', 'translateY(50px)');

			return _addClass;
		});

		setTimeout(function(){
			_hideMsg(target);
		}, 1500);
	};

	/* 등록 메시지 hide */
	_hideMsg = function (target){
		var _top = parseInt($(target).css('top'));
		$(target).css('transform', 'translateY(-50px)');
		$(target).removeClass('show-in')
		//$(target).css('opacity', 0);	
		setTimeout(function(){
			$(target).css('display', 'none');	
		}, 1000);
	};

	_sortBy = function(target){
		var _$liEl = $(target).find('li');
		_$liEl.each(function(){
			var _idx = $(target).find('li').index(this),
				_$directionL = $(this).find('.direction-l'),
			    _$directionR = $(this).find('.direction-r');

			if(_idx%2 == 1){
				if(_$directionR.hasClass('in')){
					_$directionR.addClass('slideInRight').removeClass('in');
				}
				_$directionL.removeClass('direction-l').addClass('direction-r');
			}else{
				var _$el = _$directionR.removeClass('direction-r').addClass('direction-l');

				if(_$el.hasClass('in')){
					_$el.addClass('slideInLeft').removeClass('in');
				}
			}
		});
	};

	_slideIn = function(target, idx){
		var _$todolist = target,
			_li,
			_idx = idx;

		_$todolist.find('li').each(function(index){
			var addclass;

			if(index == _idx) {
				addclass = _idx%2 == 1 ? 'slideInRight' : 'slideInLeft' ;
				$(this).find("div[class*='direction']").addClass(addclass);

				_li = this;	
			}
		});

		return _li;
	};
	//---  DOM 메서드 끝 ---

	//---  공개 api ---
	return {
		init : _init,
		showMsg : _showMsg,
		processChk : _processChk,
		delTimeList : _delTimeList,
		countTotal : _countTotal,
		countDone : _countDone,
		getDoneCnt : function(){
			return _cntDone;
		}
	};

}(jQuery));
