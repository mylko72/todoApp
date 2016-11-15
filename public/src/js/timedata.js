/**
  @module $$.timeData
**/
$$.timeData = (function ($) {

	//--- 모듈 스코프 변수 시작 ---
	var _currentDay = null,		//현재일(theDay)
		_daysInMonth = null,	//총일수(Month기준)
		_year,
		_month,
		_date,
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
		_comparator,
		_addTime,
		_removeData,
		_saveData,
		_loadData,
		_getDaysInMonth;
	//--- 모듈 스코프 변수 끝 ---

	//---  Time 메소드 시작 ---
	
	/* Date 개체를 입력받아 yyyy-MM-dd hh:mm:ss 형식으로 반환 */
	_getNToday = function (date){	

		var _self = this,
			_dateObj = date;

		console.log('_dateObj :' + _dateObj);
		console.log('_currentDay :' + _currentDay);

		if(_currentDay > _daysInMonth){						//현재 날짜가 총일수보다 커지면 다음달로 설정
			//_dateObj = new Date ();
			_dateObj.setDate (_dateObj.getDate () + 1);
			_month = _dateObj.getMonth()+1;
			_date = _dateObj.getDate();

			_currentDay = _today;

		}else{

			//_dateObj = new Date(dt);
			_year = _dateObj.getFullYear();
			_month = _dateObj.getMonth()+1;
			_date = _dateObj.getDate();
			//_currentDay = _today = _date;		//Date객체로 구한 날짜를 현재 날짜와 오늘 날짜로 설정

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

		if(clickcnt==1){
			var _startTime = startoffsetx / 2;
			_startTimeStr = _addTime(_startTime);
			_startDateStr = _getNToday(_todayObj);
		}else{
			var _endTime = (startoffsetx + endoffsetx)/2;
			_endTimeStr = _addTime(_endTime);
			_endDateStr = _getNToday(_todayObj);
		}

		console.log('_startDateStr :'+_startDateStr);
		console.log('_endDateStr :'+_endDateStr);

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
			_idx,
			_timeData;

		_timeData = TimeModel.extend(_dataSet);
		_storedData.push(_timeData);
		
		//_storedData.sort(_comparator);
		_storedData.sort(function(a,b){
			return a.startPoint < b.startPoint ? -1 : a.startPoint > b.startPoint ? 1 : 0;
		});
		
		for(var i=0;i<_storedData.length;i++){
			if(_storedData[i].id === _dataSet.id){
				_idx = _storedData.indexOf(_storedData[i]);
			}
		}

		console.log('저장 되었습니다 : _saveData()');
		console.log(_storedData);

		setTimeout(function(){
			$$.timeWork.showMsg('#msgBx');
			$$.timeWork.countTotal();
		}, 200);

		return _idx;
	};

	_loadData = function(data){
		_storedData = data;
		console.log(_storedData);

		return true;
	},

	_comparator = function(a, b){
		if (a > b) {
			return 1;
		} else if(a < b) {
			return -1;
		}
		return 0;
	};

	_getTimeInfo = function (target, idx){
		var _$objInfo = $(target),
			_result = '\n';

		for(var prop in _storedData[idx]){
			_result += '[속성명 : ' + prop + ', 값: ' + _storedData[idx][prop] + ']\n';
		}
		_$objInfo.append('<li class="list-group-item" />');
		_$objInfo.children().eq(idx).text(_result);
	};

	_addTime = function (times){
		var _now = $$.timeLine.getCurrentHour(),
			_hour = Math.floor(times/60) + _now,
			_day =  24;

		if(_hour>=_day){
			_today = _todayObj.getDate();
			_hour %= _day;		//나머지연산자를 이용하여 24시가 넘어가면 0시로 초기화
			_currentDay = _today+1;
		}else{
			_currentDay = _today;
		}

		var _minute = Math.floor(times%60);

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
			_cntDone = $$.timeWork.getDoneCnt();
			_cntDone--;
			$$.timeWork.countDone(_cntDone);
		}

		_storedData.removeElement(_idx);

		$$.timeWork.countTotal();
		$$.timeWork.delTimeList(_idKey);
	};

	_getDaysInMonth = function (_year, _month) {
		return 32 - new Date(_year, _month, 32).getDate();
	};
	//--- 이벤트 핸들러 끝 ---

	//--- 공개 api ---
	return {
		setObjDate: function(date){
			_today = null;
			_todayObj = date;
		},
		getStoredData : function(){
			return _storedData;
		},
		getTime : _getTime,
		removeData : _removeData,
		saveData : _saveData,
		loadData : _loadData
	};

}(jQuery));
