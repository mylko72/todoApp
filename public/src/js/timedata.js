/**
  @module $$.timeData
**/
$$.timeData = (function ($) {

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
		_addStrHtml,
		_addTime,
		_delTime,
		_saveData,
		_getDaysInMonth;


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

	_saveTime = function (no, title, desc){
		var _self = this,
			_no = no,
			_title = title,
			_desc = desc;

		_storedData[_no] = {};
		
		_storedData[_no]["no"] = _no;
		_storedData[_no]["startYear"] = _startDateStr;
		_storedData[_no]["startTime"] = _startTimeStr;
		_storedData[_no]["startPoint"] = startOffsetX;
		_storedData[_no]["endYear"] = _endDateStr;
		_storedData[_no]["endTime"] = _endTimeStr;
		_storedData[_no]["endPoint"] = startOffsetX + endOffsetX;
		_storedData[_no]["title"] = _title;
		_storedData[_no]["desc"] = _desc;

		_addStrHtml('.todo-list', _no);
		_getTimeList('#object-info', _no);

		setTimeout(function(){
			_showMsg('#msgBx');
		}, 200);
	};

	_saveData = function(timeWorker){
		_storedData = timeWorker;

		_addStrHtml('.todo-list', _storedData.no);
		_getTimeList('#object-info', _storedData.no);

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

	_getTimeList = function (target, idx){
		var _$objInfo = $(target),
			_result = '\n';

		for(var prop in _storedData[idx]){
			_result += '[속성명 : ' + prop + ', 값: ' + _storedData[idx][prop] + ']\n';
		}
		console.log(idx);
		_$objInfo.append('<li class="list-group-item" />');
		_$objInfo.children().eq(idx).text(_result);
	};

	_addStrHtml = function (target, idx){
		var _$todoList = $(target).eq(-1);

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

	_delTime = function (target){
		var _idx = $('.del').index(target);
		$('.bar').eq(_idx).remove();
		$(target).remove();

		_storedData.removeElement(_idx);

		$('.todo-list').children().eq(_idx).remove();

		$('#object-info').children().eq(_idx).remove();

		idNum--;
	};

	_getDaysInMonth = function (_year, _month) {
		return 32 - new Date(_year, _month, 32).getDate();
	};

	return {
		getData : function(){
			return _storedData;
		},
		getTime : _getTime,
		delTime : _delTime,
		saveData : _saveData
	};

}(jQuery));
