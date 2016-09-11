/*
 *1minute = 2px	, 5minutes = 10px = 1unit, 1hour(60minute) = 120px, 현재 15시이면 120*15 = 1800px

 */

/**
  @module $$.timeLine
**/
$$.timeLine = (function ($) {

	//--- 모듈 스코프 변수 시작 ---
	var _base = null,	//현재시간(_now변수)을 기준으로 타임시트를 재설정하기 위한 변수
		_now = null;			//window 시간을 현재시간으로 설정하기 위한 변수
		_day =  24,
		_unit = 10,		//1unit = 10px
		_fiveminutes = _unit/2,
		_$prev = $('#left'),
		_$next = $('#right'),
		_timeSheetWidth = $('#time-sheet').outerWidth(),
		timeNavObj = null;

	var _init,
		_bindEvents,
		_setupTimeline,
		_createTimeline,
		_createTimeSheet,
		_calToPx,
		_getTotalUnit;
	//--- 모듈 스코프 변수 끝 ---

	//--- 초기화 메서드 시작 ---
	_init = function () {
		timeNavObj = $$.timelineNav; //네비게이션 객체 생성

		_setupTimeline('#time-line');
		_bindEvents();
	};
	//--- 초기화 메서드 끝 ---

	//---  이벤트 핸들러 시작 ---
	_bindEvents = function (){

		_$prev.on('click', timeNavObj.goPrev);	//타임시트 탐색 (이전시간 탐색) 
		_$next.on('click', timeNavObj.goNext);	//타임시트 탐색 (다음시간 탐색) 

		var _$link = $('#time-list').find('li > a');
		// 클릭한 시간을 앞으로 slide
		_$link.on('click', function(){
			var _$self = $(this);
			timeNavObj.goMove(_$self);
		});
	};
	//---  이벤트 핸들러 끝 ---

	//---  DOM 메서드 시작 ---
	_setupTimeline = function (target){
		var _$timeline = $(target).css('width','3000px');
		
		_createTimeline(); // 현재시간을 기준으로 24시간을 생성
		_createTimeSheet(_$timeline);	// 1unit(5minutes) 단위의 타임시트 생성
	};

	//현재 시간을 기준으로 타임라인(24시간) 생성
	_createTimeline = function (servTime){
		var _self = this,	
			_servTime = servTime,
			_d = new Date(),				//현재 시간을 가져오기 위한 Date 오브젝트 생성;
			_n = 0;						//24시간 생성을 위한 카운트변수
		
		$('#timelist').empty();
		
		(!_servTime) ? _now = _d.getHours() : _now = _servTime;		//현재 시간을 가져오거나 서버에 저장된 시간을 가져와서 _now변수에 저장
		console.log('_now : '+ _now);
		_base = _now * _calToPx();							//_now*1hour(120px) 값을 타임시트의 기준(_base) pixel로 설정하여 _base 변수에 저장

		for (var i = _now; i < (_day+2); i++) {		//현재 시간을 기준으로 24시간 생성
			if(_n>=(_day+2)) break;
			var _listEl = document.createElement('li');
			i %= _day;	//나머지연산자를 이용하여 23시 이후는 0시로 초기화
			_n++;
			_listEl.innerHTML = "<a href='#'>"+(i < 10 ? "0": "") + i + ":00</a>";
			document.getElementById('time-list').appendChild(_listEl);
		}
		$('#timelist').children().eq(0).addClass('first');
	};

	//타임시트 생성
	_createTimeSheet = function (target){
		var _self = this,
			_len = _getTotalUnit(),
			_$timeline = target;

		for(var i=0;i<_len;i++){
			//console.log(i);
			$('<div class="unit bg1" />').appendTo(_$timeline);
		}
	};

	_calToPx = function(){
		return _unit * 60/_fiveminutes;
	};
			 
	_getTotalUnit = function (){	//타임시트내의 Total Unit 개수
		return _timeSheetWidth / _unit;
	};
	//---  DOM 메서드 끝 ---

	//---  공개 api ---
	return {
		init : _init,
		calToPx : _calToPx,
		getCurrentHour : function(){
			var d = new Date();
			return d.getHours();
		},
		config : {
			base : _base,
		}
	};
}(jQuery));

$$.timelineNav = (function($){
	//--- 모듈 스코프 변수 시작 ---
	var _cnt = 0,
		_$timesheet = $('#time-sheet');
	//--- 모듈 스코프 변수 끝 ---

	//---  공개 api ---
	return {
		goPrev : function(){
			_cnt==0 ? _cnt : _cnt--;
			_$timesheet.animate({'left': '-'+(120*_cnt)+'px'});
		},
		goNext : function(){
			_cnt>=23-7 ? _cnt : _cnt++;
			_$timesheet.animate({'left':'-'+(120*_cnt)+'px'});
		},
		goMove : function(self){
			var _parent = self.parent();
			var _idx = $('#time-list').children().index(_parent);

			(_idx>18) ? _cnt = 18 : _cnt = _idx;

			_$timesheet.animate({'left': '-'+(120*_cnt)+'px'},'slow');
		}
	};
}(jQuery));

