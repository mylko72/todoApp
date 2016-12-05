var nowStr = null, 
	todayStr = null,
	todayStr2 = null,
	startTimeStr = null,
	endTimeStr = null
	config = null,

	day =  24,
	currentDay = null,		//현재일(theDay)
	today = null,			//오늘(today)
	daysInMonth = null,	//총일수(Month기준)
	dateObj = null,
	year = null,
	month = null,
	date = null,
	todayObj = new Date();

(function ($) {

    /**
	@class $.TimeData
	@constructor
	**/
    $.TimeData = function () {

		var storedData = [];

		function getNToday(dt){	//Date 개체를 입력받아 yyyy-MM-dd hh:mm:ss 형식으로 반환

			var self = this;

			if(currentDay > daysInMonth){						//현재 날짜가 총일수보다 커지면 다음달로 설정
				dateObj = new Date ();
				dateObj.setDate (dateObj.getDate () + 1);
				month = dateObj.getMonth()+1;
				date = dateObj.getDate();

				currentDay = today;

			}else{

				dateObj = new Date(dt);
				year = dateObj.getFullYear();
				month = dateObj.getMonth()+1;
				date = dateObj.getDate();

				if(daysInMonth==null){
					daysInMonth = getDaysInMonth(year, month-1);		//이달의 총일수를 설정
				}

				if(currentDay==null){
					currentDay = today = date;		//Date객체로 구한 날짜를 현재 날짜와 오늘 날짜로 설정
				}

				if(currentDay>date){				//현재 날짜가 Date객체로 얻은 날짜(getDate())보다 크면 getDate()+1을 하여 익일로 설정
					date = dateObj.getDate()+1
				}

			}
			return (year + '-' + (month < 10 ? "0": "") + (month) + '-' + (date < 10 ? "0": "") + date);
		}

		function getTime(clickcnt, idnum, startoffsetx, endoffsetx){
			
			var self = this;

			getNToday(todayObj);

			if(clickcnt==1){
				var startTime = startoffsetx / 2;
				startTimeStr = addTime(startTime);
				todayStr = getNToday(todayObj);
			}else{
				var endTime = (startoffsetx + endoffsetx)/2;
				endTimeStr = addTime(endTime);
				todayStr2 = getNToday(todayObj);

				//saveTime();

				//addStrHtml('#time-info');
			}

			return {
				startYear : function(){
					return todayStr;
				},
				endYear : function(){
					return todayStr2;
				},
				startDate : function(){
					return startTimeStr;
				},
				endDate : function(){
					return endTimeStr;
				}
			};
		}

		function saveTime(no, title, memo){
			var self = this;

			storedData[no] = {};
			
			storedData[no]["no"] = no;
			storedData[no]["startYear"] = todayStr;
			storedData[no]["startTime"] = startTimeStr;
			storedData[no]["startPoint"] = startOffsetX;
			storedData[no]["endYear"] = todayStr2;
			storedData[no]["endTime"] = endTimeStr;
			storedData[no]["endPoint"] = startOffsetX + endOffsetX;
			storedData[no]["title"] = title;
			storedData[no]["memo"] = memo;

			addStrHtml('.todo-list', no);
			getTimeList('#object-info', no);

			setTimeout(function(){
				showMsg('#msgBx');
			}, 200);
		}

		function showMsg(target){
			$(target).addClass(function(index){
				var addClass;
				if($(target).is(':hidden')){
					$(target).css('display', 'block');
					addClass = 'in';
				}
				var top = parseInt($(this).css('top'));
				$(target).css('transform', 'translateY(30px)');

				return addClass;
			});

			setTimeout(function(){
				hideMsg(target);
			}, 2000);
		}

		function hideMsg(target){
			var top = parseInt($(target).css('top'));
			$(target).css('transform', 'translateY(-30px)');
			$(target).removeClass('in')
			setTimeout(function(){
				$(target).css('display', 'none');	
			}, 2000);
		}

		function getTimeList(target, idx){
			var $objInfo = $(target),
				result = '\n';

			for(var prop in storedData[idx]){
				result += '[속성명 : ' + prop + ', 값: ' + storedData[idx][prop] + ']\n';
			}
			console.log(idx);
			$objInfo.append('<li class="list-group-item" />');
			$objInfo.children().eq(idx).text(result);

		}

		function addStrHtml(target, idx){
			var $todoList = $(target).eq(-1);

			var str='<li class="list-group-item">';
			str += '<span class="badge">' + (idx+1) + '</span> ';
			str += '<span class="input-chk inline"><input type="checkbox" name="todo" id="chk'+(idx+1)+'">';
			str += '<label for="chk'+(idx+1)+'">' + storedData[idx]["title"] + '</label>';
			str += '</span>';
			str += '<p class="time">';
			str += '<span class="start-time">' + startTimeStr + '</span> ~ <span class="end-time">' + endTimeStr + '</span>';
			str += '</p>';
			//str += ' 설정시간 : <span class="today">' + todayStr + '</span> ';
			//str += '<span class="start-time">' + startTimeStr + '</span> ~  ';
			//str += '<span class="today2">' + todayStr2 + '</span> '; 
			//str += '<span class="end-time">' + endTimeStr + '</span><br />';
			str += '<p style="display:none">내용 : ' + storedData[idx]["memo"] + '</p>';
			str += '</li>';

			if(nowStr==null){
				$('<h3 class="years">' + todayStr  + '</h3>').insertBefore($todoList);
				//$todoList.attr('id', 'todo-list'+(idx+1));
				nowStr = todayStr;
			}else if(nowStr != todayStr){
				$('<h3 class="years">' + todayStr  + '</h3>').insertAfter($todoList);
				$todoList = $('<ul class="list-group todo-list" />');
				$todoList.insertAfter($('.years').eq(-1));
				nowStr = todayStr;
			}
			$todoList.append(str);

			setTimeout(function(){
				new $.Form().init();
			}, 2000);
		}

		function addTime(tTimes){
			var now = new $.TimeLine().getCurrentHour();
			var hour = Math.floor(tTimes/60) + now;

			console.log(now);

			if(hour>=day){
				hour %= day;		//나머지연산자를 이용하여 24시가 넘어가면 0시로 초기화
				currentDay = today+1;
			}else{
				currentDay = today;
			}

			var minute = Math.floor(tTimes%60);

			var timeStr = (hour < 10 ? "0": "") + hour+' : ' + (minute < 10 ? "0": "") + minute;

			return timeStr;
		}

		function delTime(target){
			var idx = $('.del').index(target);
			$('.bar').eq(idx).remove();
			$(target).remove();

			storedData.removeElement(idx);

			$('.todo-list').children().eq(idx).remove();

			$('#object-info').children().eq(idx).remove();

			idNum--;
		} 

		function getDaysInMonth(year, month) {
			return 32 - new Date(year, month, 32).getDate();
		}

		return {
			_getData : function(){
				return storedData;
			},
			_getTime : getTime,
			_delTime : delTime,
			_saveTime : saveTime
		};
	};

}(jQuery));
