/**
	* @Module $$.timeData
	*
	* (c) 2016 mypmk72, freelancer & front end developer
	*
	* licenses:	http://codecanyon.net/licenses/
 **/

$$.timeData = (function ($) {
	//--- Module scope variables ---
	var _currentDay = null,		
		_daysInMonth = null,	
		_year,
		_month,
		_date,
		_today = null,			
		_todayObj = new Date(),
		_storedData = [],
		_startDateStr,
		_startTimeStr,
		_endDateStr,
		_endTimeStr;

	//--- Module scope methods ---
	var _getNToday,
		_getTime,
		_comparator,
		_addTime,
		_removeData,
		_saveData,
		_loadData,
		_getDaysInMonth;
	
	//--- Initialized method ---
	_init = function(){

		_year = _todayObj.getFullYear();
		_month = _todayObj.getMonth()+1;
		_date = _todayObj.getDate();

		if(_daysInMonth==null){
			// Set the total number of days for this month
			_daysInMonth = _getDaysInMonth(_year, _month-1);		
		}

	};
	
	//---  DOM method start ---
	
	/* A methods that take a Date object and return it in yyyy-MM-dd format */
	_getNToday = function (date){	

		var _self = this,
			_dateObj = date;

		// Set the next month if the current date is greater than the total number of days
		if(_currentDay > _daysInMonth){						
			_dateObj.setDate (_dateObj.getDate () + 1);
			_month = _dateObj.getMonth()+1;
			_date = _dateObj.getDate();

			_currentDay = _today;

		}else{

			_year = _dateObj.getFullYear();
			_month = _dateObj.getMonth()+1;
			_date = _dateObj.getDate();

			if(_currentDay==null){
				// Set the date obtained by a Date object to the current date and today's date
				_currentDay = _today = _date;		
			}

			// If the current date is greater than the date obtained by a Date object, set getDate () + 1 to the next day
			if(_currentDay>_date){				
				_date = _dateObj.getDate()+1
			}
			
		}

		return ((_month < 10 ? "0": "") + (_month) + '/' + (_date < 10 ? "0": "") + _date) + '/' + _year;
	};

	/* A methods to convert click coordinates to date and time */
	_getTime = function (clickcnt, startoffsetx, endoffsetx){
		
		var _self = this;

		if($('.container').data('mode')=='new'){
			_todayObj = new Date();
		}

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

	/* A methods to store data */
	_saveData = function(dataSet){
		var _dataSet = dataSet,
			_idx,
			_timeData;

		_timeData = TimeModel.extend(_dataSet);
		_storedData.push(_timeData);
		
		_storedData.sort(function(a,b){
			return a.startPoint < b.startPoint ? -1 : a.startPoint > b.startPoint ? 1 : 0;
		});
		
		for(var i=0;i<_storedData.length;i++){
			if(_storedData[i].id === _dataSet.id){
				_idx = _storedData.indexOf(_storedData[i]);
			}
		}

		console.log(_storedData);

		setTimeout(function(){
			$$.timeWork.showMsg('#msgBx');
			$$.timeWork.countTotal();
		}, 200);

		return _idx;
	};

	/* A methods that return true if data is loaded */
	_loadData = function(data){
		if(data){
			_storedData = data;
		}
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

	/* Methods that return coordinates as a time */
	_addTime = function (times){
		var _now = $$.timeLine.getCurrentHour(),
			_hour = Math.floor(times/60) + _now,
			_day =  24,
			_minute,
			_timeStr;

		if(_hour>=_day){
			_today = _todayObj.getDate();
			_hour %= _day;		// Use the remaining operators to initialize to 0 o'clock after 24 hours
			_currentDay = _today+1;
		}else{
			_currentDay = _today;
		}

		_minute = Math.floor(times%60);
		_timeStr = (_hour < 10 ? "0": "") + _hour+':' + (_minute < 10 ? "0": "") + _minute;

		return _timeStr;
	};

	/* A methods to delete data */
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
		
		console.log(_storedData);

		$$.timeWork.countTotal();
		$$.timeWork.processChk(200, function(){
			this.delTimeList(_idKey);
		});
	};

	/* A method that returns the total number of days in this month */
	_getDaysInMonth = function (_year, _month) {
		return 32 - new Date(_year, _month, 32).getDate();
	};
	//--- DOM method end ---

	//--- Public methods ---
	return {
		init: _init,
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
