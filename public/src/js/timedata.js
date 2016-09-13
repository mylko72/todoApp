/**
  @module $$.timeData
**/
$$.timeData = (function ($) {

	//--- 모듈 스코프 변수 시작 ---
	var _nowStr = null, 
		_startDateStr = null,
		_endDateStr = null,
		_startTimeStr = null,
		_endTimeStr = null

		_day =  24,
		_currentDay = null,		//현재일(theDay)
		_today = null,			//오늘(today)
		_daysInMonth = null,	//총일수(Month기준)
		_dateObj = null,
		_year = null,
		_month = null,
		_date = null,
		_todayObj = new Date(),
		_storedData = null;

	var _getNToday,
		_getTime,
		_showMsg,
		_hideMsg,
		_getTimeList,
		_getTimeInfo,
		_addStrHtml,
		_renderHtml,
		_addTime,
		_removeData,
		_saveData,
		_sortBy,
		_getDaysInMonth;
	//--- 모듈 스코프 변수 끝 ---

	//---  이벤트 핸들러 시작 ---
	_getNToday = function (dt){	//Date 개체를 입력받아 yyyy-MM-dd hh:mm:ss 형식으로 반환

		var _self = this;

		if(_currentDay > _daysInMonth){						//현재 날짜가 총일수보다 커지면 다음달로 설정
			_dateObj = new Date ();
			_dateObj.setDate (_dateObj.getDate () + 1);
			_month = _dateObj.getMonth()+1;
			_date = _dateObj.getDate();

			_currentDay = _today;

		}else{

			_dateObj = new Date(dt);
			_year = _dateObj.getFullYear();
			_month = _dateObj.getMonth()+1;
			_date = _dateObj.getDate();

			if(_daysInMonth==null){
				_daysInMonth = _getDaysInMonth(_year, _month-1);		//이달의 총일수를 설정
			}

			if(_currentDay==null){
				_currentDay = _today = _date;		//Date객체로 구한 날짜를 현재 날짜와 오늘 날짜로 설정
			}

			if(_currentDay>_date){				//현재 날짜가 Date객체로 얻은 날짜(getDate())보다 크면 getDate()+1을 하여 익일로 설정
				_date = _dateObj.getDate()+1
			}

		}
		return (_year + '-' + (_month < 10 ? "0": "") + (_month) + '-' + (_date < 10 ? "0": "") + _date);
	};

	_getTime = function (clickcnt, idnum, startoffsetx, endoffsetx){
		
		var _self = this;

		_getNToday(_todayObj);

		if(clickcnt==1){
			var _startTime = startoffsetx / 2;
			_startTimeStr = _addTime(_startTime);
			_startDateStr = _getNToday(_todayObj);
		}else{
			var _endTime = (startoffsetx + endoffsetx)/2;
			_endTimeStr = _addTime(_endTime);
			_endDateStr = _getNToday(_todayObj);

			//saveTime();

			//addStrHtml('#time-info');
		}

		return {
			startDate : function(){
				return _startDateStr;
			},
			endDate : function(){
				return _endDateStr;
			},
			startTime : function(){
				return _startTimeStr;
			},
			endTime : function(){
				return _endTimeStr;
			}
		};
	};

	//할일저장
	_saveData = function(storedData){
		_storedData = storedData;
		_getTimeList('.todo-list', _storedData);

		console.log(_storedData);

		setTimeout(function(){
			_showMsg('#msgBx');
		}, 200);
	}

	_showMsg = function (target){
		$(target).addClass(function(index){
			var _addClass;
			if($(target).is(':hidden')){
				$(target).css('display', 'block');
				_addClass = 'in';
			}
			var _top = parseInt($(this).css('top'));
			$(target).css('transform', 'translateY(30px)');

			return _addClass;
		});

		setTimeout(function(){
			_hideMsg(target);
		}, 2000);
	};

	_hideMsg = function (target){
		var _top = parseInt($(target).css('top'));
		$(target).css('transform', 'translateY(-30px)');
		$(target).removeClass('in')
		setTimeout(function(){
			$(target).css('display', 'none');	
		}, 2000);
	};

	//할일 목록
	_getTimeList = function(target, storedData){
		var _$todoList = $(target),
			_url = _$todoList.data('template'),
			_storedData = storedData[storedData.length-1],
			_idx = _storedData.no,
			_$liEl;

		_$todoList.find('.nolist').hide();
		_$liEl = _renderHtml(_$todoList, _storedData.startDate, _url);

		//(_nowStr != _storedData.startDate) ? _$todoList.find('.time-tit').eq(-1).text(_storedData.startDate) : _$todoList.find('.time-tit').eq(0).text(_storedData.startDate);
		$('.date_'+_storedData.startDate).find('.time-tit').text(_storedData.startDate);

		/*if(_idx%2 == 0){
			_$liEl.find('.direction-r').removeClass().addClass('direction-l');
		}*/

	   	_$liEl.addClass('num_'+_storedData.no);
		_$liEl.find('.title').text(_storedData.title);
		_$liEl.find('.start-time').text(_storedData.startTime);
		_$liEl.find('.end-time').text(_storedData.endTime);
		_$liEl.find('.desc').text(_storedData.description);

		_sortBy($('.date_'+_storedData.startDate).find('.timeline'));

		_nowStr = _storedData.startDate;
	};

	_getTimeInfo = function (target, idx){
		var _$objInfo = $(target),
			_result = '\n';

		console.log(_storedData[idx]);

		for(var prop in _storedData[idx]){
			_result += '[속성명 : ' + prop + ', 값: ' + _storedData[idx][prop] + ']\n';
		}
		console.log(idx);
		_$objInfo.append('<li class="list-group-item" />');
		_$objInfo.children().eq(idx).text(_result);
	};

	_addStrHtml = function (target, idx){
		var _$todoList = $(target).eq(-1);

		console.log(idx);

		var _str='<li class="list-group-item">';
		_str += '<span class="badge">' + (idx+1) + '</span> ';
		_str += '<span class="input-chk inline"><input type="checkbox" name="todo" id="chk'+(idx+1)+'">';
		_str += '<label for="chk'+(idx+1)+'">' + _storedData[idx]["title"] + '</label>';
		_str += '</span>';
		_str += '<p class="time">';
		_str += '<span class="start-time">' + _startTimeStr + '</span> ~ <span class="end-time">' + _endTimeStr + '</span>';
		_str += '</p>';
		//str += ' 설정시간 : <span class="_today">' + _startDateStr + '</span> ';
		//str += '<span class="start-time">' + _startTimeStr + '</span> ~  ';
		//str += '<span class="today2">' + _endDateStr + '</span> '; 
		//str += '<span class="end-time">' + _endTimeStr + '</span><br />';
		_str += '<p style="display:none">내용 : ' + _storedData[idx]["desc"] + '</p>';
		_str += '</li>';

		if(_nowStr==null){
			$('<h3 class="years">' + _startDateStr  + '</h3>').insertBefore(_$todoList);
			//$todoList.attr('id', 'todo-list'+(idx+1));
			_nowStr = _startDateStr;
		}else if(_nowStr != _startDateStr){
			$('<h3 class="years">' + _startDateStr  + '</h3>').insertAfter(_$todoList);
			_$todoList = $('<ul class="list-group todo-list" />');
			_$todoList.insertAfter($('.years').eq(-1));
			_nowStr = _startDateStr;
		}
		_$todoList.append(_str);

		setTimeout(function(){
			new $.Form().init();
		}, 2000);
	};

	//Html(목록) 렌더링
	_renderHtml = function(target, date, url){
		var _$target = target,
			_date = date,
			_url = url,
			_$liEl;
	
		$.ajax({
			type : "GET",
			async : false,
			url : _url,
			success : function(data) {
				if(_$target.find('.date_'+_date).size()==0/* || _nowStr != _date*/){
					_$target.append(data);
					_$target.find('.time-area').eq(-1).addClass('date_'+_date);
				}else{
					console.log('.date_'+_date);
					var _liEl = $(data).find('li');
					_$target.find('.date_'+_date+' .timeline').append(_liEl);
				}
			},
			complete: function(){
				_$liEl = _$target.find('.date_'+_date+' .timeline').find('li').eq(-1);
			}
		});

		return _$liEl;
	};

	_addTime = function (tTimes){
		var _now = $$.timeLine.getCurrentHour();
		var _hour = Math.floor(tTimes/60) + _now;

		console.log(_now);

		if(_hour>=_day){
			_hour %= _day;		//나머지연산자를 이용하여 24시가 넘어가면 0시로 초기화
			_currentDay = _today+1;
		}else{
			_currentDay = _today;
		}

		var _minute = Math.floor(tTimes%60);

		var _timeStr = (_hour < 10 ? "0": "") + _hour+' : ' + (_minute < 10 ? "0": "") + _minute;

		return _timeStr;
	};

	_removeData = function (idx){
		var _idx = idx;
		//var _idx = $('.del').index(target);
		//$('.bar').eq(_idx).remove();
		//$(target).remove();

		_storedData.removeElement(_idx);

		console.log(_storedData);

		$('.timeline').find('li.num_'+idx).remove();
		setTimeout(function(){
			_sortBy('.timeline');
		}, 1000);

		//$('#object-info').children().eq(_idx).remove();

		idNum--;
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

	_getDaysInMonth = function (_year, _month) {
		return 32 - new Date(_year, _month, 32).getDate();
	};
	//--- 이벤트 핸들러 끝 ---

	//--- 공개 api ---
	return {
		getData : function(){
			return _storedData;
		},
		getTime : _getTime,
		removeData : _removeData,
		saveData : _saveData
	};

}(jQuery));
