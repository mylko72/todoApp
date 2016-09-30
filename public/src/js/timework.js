/**
  @module $$.timeWork
 **/
$$.timeWork= (function ($) {
	//--- 모듈 스코프 변수 시작 ---
	var startOffsetX = null,
		endOffsetX = null,
		clickCnt = 0,
		idKey = 0,
		idNum = 0,

		_clicked = false,
		_saved = false,
		_cntDone = 0,
		_mode = "",
		_$bar = null,
		_$timeline = $('#time-line'),
		_$todoModal = $('#todoModal');
		config = null,
		timeStr = null;
		
	var _init,
		_bindEvents,
		_getFormData,
		_setData,
		_chkToDone,
		_getStartPoint,
		_getEndPoint,
		_getChkPoint,
		_getRange,
		_countTotal,
		_countDone,
		_showTimeList,
		_renderHtml,
		_showMsg,
		_hideMsg,
		_sortBy;
	//--- 모듈 스코프 변수 끝 ---

	//--- 초기화 메서드 시작 ---
	_init = function (timeline) {

		config = $$.timeLine.config;

		_bindEvents();
	}
	//--- 초기화 메서드 끝 ---

	//---  이벤트 핸들러 시작 ---
	_bindEvents = function (){
		
		var _self = this;

		/* 할일 설정과 종료 이벤트 */
		_$timeline.on('click', function(event){
			var e = event,
				_timeStr;

			e.stopPropagation();

			clickCnt++;

			if(clickCnt>=2){
				_timeStr = _getEndPoint(e, _$bar);	//할일 종료를 위한 함수 호출
				
				// 할일 등록 팝업 Open
				$('#todoModal').modal({
					keyboard: true,
					timeStr: _timeStr
				});

				clickCnt = 0;
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
				console.log('취소되었습니다!');
				$('#bar_'+idKey).remove();
				clickCnt = 0;
				_clicked = false;
			}

			//_mode = '';
		});

		/* 할일 등록 저장 */
		_$todoModal.find('#save').on('click', function(event){
			var _dataSet,
				_idx;

			_saved = true;
			_dataSet = _getFormData();

			if(_dataSet){
				_setData(_dataSet);

				_idx = $$.timeData.saveData(_dataSet);
				//console.log(_storedData);
				_showTimeList('.todo-list', _idx);
		
				_$todoModal.modal('hide')

				idKey = '';
				_mode = '';
				_saved = false;
			}
		});

		/* 할일 수정 */
		_$todoModal.find('#edit').on('click', function(event){
			var _idKey = idKey,
				_dataSet,
				_storedData = $$.timeData.getStoredData();

			if(_mode == 'EDIT'){

				_dataSet = _getFormData();


				if(_dataSet){
					_setData(_dataSet);
					
					//var _idx = $.inArray(_idKey, _storedData.id);
					var newArr = _storedData.filter(function(data){
						return data.id === _idKey
					});
					//console.log('idx :' + _idx);
					console.log('newArr :' + newArr);

					for(var i=0;i<_storedData.length;i++){
						if(_storedData[i].id === _idKey){
							_storedData[i].title = _dataSet.title;
							_storedData[i].description = _dataSet.description;
						}
					}


					//타임리스트 수정
					_updateTimeList('.todo-list', _dataSet);

					//tooltip 데이타수정
					
					_$todoModal.modal('hide')

					console.log(_storedData);

					_mode = '';
					idKey = '';
				}
			}
		});

		/* 할일 등록 취소 */
		_$todoModal.find('#cancel').on('click', function(event){
			if(_mode == 'SAVE'){
				$('#bar_'+idKey).remove();
			}
			_$todoModal.modal('hide')

			_mode = '';
			idKey = '';
		});

		/* 할일 등록 취소를 위한 ESC키 바인드 */
		_$todoModal.on('keydown', function(event){
			var e = event,
				_$targetId = e.target.getAttribute('id');

			if(_$targetId == 'todoModal'||_$targetId == 'todo-title'||_$targetId == 'todo-desc'){
				if(e.keyCode === 27){
					console.log('취소되었습니다!');
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

				_descStr = $$.util.returnLine(_desc);

				_$todoModal.find('#todo-title').empty().val(_dataSet.title);
				_$todoModal.find('#todo-desc').empty().val(_descStr);

				_$todoModal.find('#startDate').empty().append(_dataSet.startDate);
				_$todoModal.find('#endDate').empty().append(_dataSet.endDate);
				_$todoModal.find('#startTime').empty().append(_dataSet.startTime);
				_$todoModal.find('#endTime').empty().append(_dataSet.endTime);

				_$todoModal.find('#save').hide();
				_$todoModal.find('#edit').show();

				idKey = _dataSet.id;

				console.log(_mode);

			}else{
				_$time.find('#startDate').empty().append(timeStr.startDate());
				_$time.find('#endDate').empty().append(timeStr.endDate());
				_$time.find('#startTime').empty().append(timeStr.startTime());
				_$time.find('#endTime').empty().append(timeStr.endTime());

				_$todoModal.find('#save').show();
				_$todoModal.find('#edit').hide();

				_mode = 'SAVE';

				console.log(_mode);
			}

			_$todoModal.find('#todo-title').focusin();
		});

		_$todoModal.on('hidden.bs.modal', function(){
			_$todoModal.find('#todo-title').val('');
			_$todoModal.find('#todo-desc').val('');
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
		});

		$(document).on('click', '.bar input:checkbox', _chkToDone); 

		$(document).on('dragover', '#dropzone, .flag.title', function(event){
			event.preventDefault();
		});

		$(document).on('dragstart', '.timeline .flag.title', function(event){
			var _class = $(this).attr('class');
			_class = _class.split(' ')[1];
			console.log('drag가 시작되었음');
			console.log(_class);
			event.originalEvent.dataTransfer.setData('Text', _class);
		});

		$(document).on('drop', '#dropzone, .flag.title', function(event){
			
			var id = event.target.getAttribute('id');
			var data = event.originalEvent.dataTransfer.getData('Text');
			//console.log('id :' + id);
			//console.log('data :' + data);
			event.target.appendChild($('.'+data)[0]);
			if(id == 'dropzone'){
				alert('휴지통에 담았습니다. 데이타가 삭제됩니다.');
				$$.timeData.removeData(_idKey);
			}
			event.preventDefault();
		});

	}
	//---  이벤트 핸들러 끝 ---

	//---  DOM 메서드 시작 ---
	
	/* 등록 데이타 가져오기 */
	_getFormData = function(){
		var _idKey = idKey,
			_$bar = $('#bar_'+_idKey),
			_dataSet= null,
			_saveMode = _mode=='SAVE' ? true : false;

		//if(_saved){
			var _title = _$todoModal.find('#todo-title').val();
			var _desc = _$todoModal.find('#todo-desc').val();
			var _descStr;

			if(!_title){
				alert('할일 제목을 입력해주세요!');
				_$todoModal.find('#todo-title').focus();
				return false;
			}

			_descStr = $$.util.returnBr(_desc);

			_dataSet = {
				id: _idKey,
				startDate: _saveMode ? timeStr.startDate() : _$bar.data('set').startDate,
				startTime: _saveMode ? timeStr.startTime() : _$bar.data('set').startTime,
				startPoint: _saveMode ?  startOffsetX : _$bar.data('set').startPoint,
				endDate: _saveMode ? timeStr.endDate() : _$bar.data('set').endDate,
				endTime: _saveMode ? timeStr.endTime() : _$bar.data('set').endTime,
				endPoint: _saveMode ? startOffsetX+endOffsetX : _$bar.data('set').endPoint,
				title: _title,
				description: _descStr,
				done: _saveMode ? false : _$bar.data('set').done
			};					

			return _dataSet;
		//}
	};

	/* 데이타 설정 */
	_setData = function(dataSet){
		var _dataSet = dataSet,
			_$tooltip;

		console.log(_mode);

		if(_mode == 'SAVE'){
			_$bar.find('.switch input:checkbox').prop('checked', true);
			_$bar.appendTo($('#time-sheet'));
		}
		_$bar.data('set', _dataSet);

		_$tooltip = _$bar.find('.tooltip');
		_$tooltip.find('.title').text(_$bar.data('set').title);
		_$tooltip.find('.time').text(_$bar.data('set').startTime+'-'+_$bar.data('set').endTime);
		_$tooltip.find('.desc').html(_$bar.data('set').description);

		console.log(_$bar.data('set'));
	};

	/* 할일 상태(진행/완료) 전환 */
	_chkToDone = function(){
		var _idKey,
			_storedData = $$.timeData.getStoredData(),
			_idKey = $(this).parents('.bar').data('set').id,
			_done = $(this).parents('.bar').data('set').done;

			$(this).parents('.bar').data('set').done = !_done;

			$(this).is(':checked') ? alert('할일 진행으로 전환됩니다!') : alert('할일 완료로 전환됩니다!'); 

			$('.timeline').find('.time_'+_idKey).toggleClass('done');

			for(var i=0;i<_storedData.length;i++){
				if(_storedData[i].id === _idKey){
					_storedData[i].done = $(this).is(':checked') ? false : true;
					_storedData[i].done ? _cntDone++ : _cntDone--;
				}
			}
			console.log(_storedData);

			_countDone(_cntDone);
	},

   	/* 할일설정(bar생성)을 위한 Start 함수 */
	_getStartPoint = function (event, target){	

		var _self = this, 
			e = event,
			_startPos,
			_calToPx = $$.timeLine.calToPx();
			_storedData = $$.timeData.getStoredData();
			_$timeline = target;

		idKey = $$.util.rKey();

		_$bar = $('<div class="bar" id="bar_'+idKey+'" data-set="">'
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
		startOffsetX = (e.pageX+config.base)-(_startPos.left+config.base);
		
		/*데이터가 하나이상 저장되어 있다면
		if(_storedData.length>0){ 
			_getChkPoint(startOffsetX); // 등록시간 중복오류 체크 
		}*/

		_$bar.css('left', startOffsetX).css('width','2px');

		$$.timeData.getTime(clickCnt, startOffsetX);	//할일 시간 설정
	}

	/* 할일 종료를 위한 End 함수 */
	_getEndPoint = function (event, target){	
		var e = event,
			_endPos,
			_calToPx = $$.timeLine.calToPx();
			_$bar = target;

		_endPos = _$bar.offset();
		endOffsetX = (e.pageX+config.base)-(_endPos.left+config.base);

		if(endOffsetX != null &&endOffsetX<(_calToPx/2)){
			alert('할 일은 최소한 30분이상 등록할 수 있습니다!');
			$('#bar_'+idKey).remove();
			clickCnt = 0;
			_clicked = false;
			return false;
		}

		if(endOffsetX != null && _clicked){

			timeStr = $$.timeData.getTime(clickCnt, startOffsetX, endOffsetX);	//할일 시간 설정

			//설정한 시간만큼 Bar를 타임시트에 생성
			TimeModel.drawBar(_$timeline, _$bar, startOffsetX, endOffsetX, idNum);

			idNum++;

			return timeStr;
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
				$('#bar_'+idKey).remove();
				clickCnt = 0;
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

			if(e.keyCode==27){
				console.log('ESC키가 눌렸습니다');
			}
		}
	};

	_countTotal = function(){
		var _len = $$.timeData.getStoredData().length,
			_$total = $('.panel-info').find('.total');

		_$total.find('.badge').text(_len);
	};

	_countDone = function(cntDone){
		var _cnt = cntDone,
			_$done = $('.panel-info').find('.done');

		_cntDone = _cnt;

		_$done.find('.badge').text(_cntDone);
	};

	/* 할일 리스트 출력 */
	_showTimeList = function(target, idx){
		var _$todoList = $(target),
			_url = _$todoList.data('template'),
			_storedData = $$.timeData.getStoredData(), 
			_idx = idx,
			_$liEl,
			_$moreBtn;

		_$todoList.find('.nolist').hide();
		_$liEl = _renderHtml(_$todoList, _idx, _storedData, _url);

		$('.date_'+_storedData[_idx].startDate).find('.time-tit').text(_storedData[_idx].startDate);

	   	_$liEl.addClass('time_'+_storedData[_idx].id);
		_$liEl.find('.title').text(_storedData[_idx].title);
		_$liEl.find('.start-time').text(_storedData[_idx].startTime);
		_$liEl.find('.end-time').text(_storedData[_idx].endTime);
		_$liEl.find('.desc .txts').html(_storedData[_idx].description);


		if(_$liEl.find('.desc .txts').height()>_$liEl.find('.desc p').height()){
			_$moreBtn = String() + '<a href="#" class="glyphicon glyphicon-chevron-down more">더보기</a>';
			_$liEl.find('.desc .txts').append(_$moreBtn);
		} 

		_sortBy($('.date_'+_storedData[_idx].startDate).find('.timeline'));

		_nowStr = _storedData[_idx].startDate;
	};

	_updateTimeList = function(target, dataset){
		var _dataSet = dataset,
			_$liEl = $(target).find('.time_' + _dataSet.id);

		_$liEl.find('.title').text(_dataSet.title);
		_$liEl.find('.desc .txts').html(_dataSet.description);
	};

	/* 할일 리스트 삭제 */
	_delTimeList = function(idkey){
		var _idKey = idkey,
			_$timeline;

		_$timeline = $('li.time_'+_idKey).parent('.timeline');
		_$timeline.find('li.time_'+_idKey).remove();

		setTimeout(function(){
			_sortBy(_$timeline);
		}, 1000);
	};

	/* Html(목록) 렌더링 */
	_renderHtml = function(target, idx, storedData, url){
		var _$target = target,
			_idx = idx,
			_date = storedData[_idx].startDate,
			_length = storedData.length,
			_url = url,
			_$timelist,
			_$liEl;
	
		$.ajax({
			type : "GET",
			async : false,
			url : _url,
			success : function(template) {
				if(_$target.find('.date_'+_date).size()==0/* || _nowStr != _date*/){
					_$target.append(template);
					_$target.find('.time-area').eq(-1).addClass('date_'+_date);

					_$target.find('.time-area').eq(-1).addClass('date_'+_date);
				}else{
					_liEl = $(template).find('li');
					_$timelist = _$target.find('.timeline');

					if(_idx == 0){
						_liEl.insertBefore(_$timelist.find('li').eq(_idx));
					}else{
						if(_idx == _length-1){
							_liEl.insertAfter(_$timelist.find('li').eq(_idx-1));
						}else{
							_liEl.insertBefore(_$timelist.find('li').eq(_idx));
						}
					}
				}
			},
			complete: function(){
				_$liEl = _$target.find('.timeline').find('li').eq(_idx);
			}
		});

		return _$liEl;
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
			var _idx = $(target).find('li').index(this);	
			if(_idx%2 == 1){
				$(this).find('.direction-l').removeClass().addClass('direction-r');
			}else{
				$(this).find('.direction-r').removeClass().addClass('direction-l');
			}
		});
	};

	//---  DOM 메서드 끝 ---

	//---  공개 api ---
	return {
		init : _init,
		showMsg : _showMsg,
		delTimeList : _delTimeList,
		countTotal : _countTotal,
		countDone : _countDone,
		getDoneCnt : function(){
			return _cntDone;
		}
	};

}(jQuery));
