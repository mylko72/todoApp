/**
  @module $$.timeData
**/
$$.timeData = (function ($) {

	//--- 모듈 스코프 변수 시작 ---
	var _nowStr = null, 
		_currentDay = null,		//현재일(theDay)
		_today = null,			//오늘(today)
		_todayObj = new Date(),
		_storedData = [],
		_startDateStr,
		_startTimeStr,
		_endDateStr,
		_endTimeStr;

	var _getNToday,
		_getTime,
		_getTimeInfo,
		_renderHtml,
		_addTime,
		_removeData,
		_saveData,
		_getDaysInMonth;
	//--- 모듈 스코프 변수 끝 ---

	//---  Time 메소드 시작 ---
	
	/* Date 개체를 입력받아 yyyy-MM-dd hh:mm:ss 형식으로 반환 */
	_getNToday = function (dt){	

		var _self = this,
			_year,
			_month,
			_date,
			_dateObj,
			_daysInMonth;	//총일수(Month기준)

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

	/* 클릭좌표를 날짜와 시간으로 변환 */
	_getTime = function (clickcnt, startoffsetx, endoffsetx){
		
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

	//데이타저장
	_saveData = function(dataSet){
		var _dataSet = dataSet,
			_tempData;

		_tempData = TimeModel.extend(_dataSet);
		_storedData.push(_tempData);

		console.log(_storedData);

		setTimeout(function(){
			$$.timePicker.showMsg('#msgBx');
			$$.timePicker.countTotal();
		}, 200);

		return _storedData;
	}


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

	_addTime = function (tTimes){
		var _now = $$.timeLine.getCurrentHour(),
			_hour = Math.floor(tTimes/60) + _now,
			_day =  24;

		//console.log(_now);

		if(_hour>=_day){
			_hour %= _day;		//나머지연산자를 이용하여 24시가 넘어가면 0시로 초기화
			_currentDay = _today+1;
		}else{
			_currentDay = _today;
		}

		var _minute = Math.floor(tTimes%60);

		var _timeStr = (_hour < 10 ? "0": "") + _hour+':' + (_minute < 10 ? "0": "") + _minute;

		return _timeStr;
	};

	/* 데이타 삭제 */
	_removeData = function (idKey){
		var _idx,
			_idKey = idKey,
			_cntDone;
		
		for(var i=0;i<_storedData.length;i++){
			if(_storedData[i].id === _idKey){
				_idx = _storedData.indexOf(_storedData[i]);
			}
		}

		if(_storedData[_idx].done){
			_cntDone = $$.timePicker.getDoneCnt();
			_cntDone--;
			$$.timePicker.countDone(_cntDone);
		}

		_storedData.removeElement(_idx);

		$$.timePicker.countTotal();
		$$.timePicker.delTimeList(_idKey);

		console.log(_storedData);

		//idNum--;
	};

	_getDaysInMonth = function (_year, _month) {
		return 32 - new Date(_year, _month, 32).getDate();
	};
	//--- 이벤트 핸들러 끝 ---

	//--- 공개 api ---
	return {
		getStoredData : function(){
			return _storedData;
		},
		getTime : _getTime,
		removeData : _removeData,
		saveData : _saveData
	};

}(jQuery));
