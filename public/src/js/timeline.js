/**
	* @Module $$.timeLine
	* 1min = 2px, 5min = 10px, 1hours = 120px
	*
	* (c) 2016 mylko72@maru.net
	*
	* licenses:	http://codecanyon.net/licenses/
	*
 **/

$$.timeLine = (function ($) {

	//--- Module scope variables ---
	var _now = null,	
		_unit = 10,		
		_timeNavObj = null;

	//--- Module scope methods ---
	var _init,
		_bindEvents,
		_setupTimeline,
		_createTimeline,
		_createTimeSheet,
		_getTotalUnit;

	//--- Initialized method ---
	_init = function (times) {
		var _times = times,
			_d = new Date();			

		_now = (_times) ? _times : _d.getHours();		

		_timeNavObj = $$.timelineNav; 
		_setupTimeline('#time-line', _now);

		_bindEvents();
	};

	//---  Event handler start ---
	_bindEvents = function (){
		var _$prev = $('#left'),
			_$next = $('#right');

		// Move to previous or next time in timeline
		_$prev.on('click', _timeNavObj.goPrev);	
		_$next.on('click', _timeNavObj.goNext);	

		var _$link = $('#time-list').find('li > a');

		// Handler to slide to the clicked time
		_$link.on('click', function(e){
			var _$self = $(this);
			_timeNavObj.goMove(e, _$self);
		});
	};
	//---  Event handler end ---

	//---  DOM method start ---
	
	/* Methods to install timelines */
	_setupTimeline = function (target, now){
		var _$timeline = $(target).css('width','3000px');
		
		_createTimeline(now);  
		_createTimeSheet(_$timeline);	
	};

	/* A methods that generate 24 hours based on the current time */
	_createTimeline = function (now){
		var _self = this,	
			_day =  24,
			_now = now,
			_n = 0;						
		
		$('#time-list').empty();
		
		console.log('current time : '+ _now);

		for (var i = _now; i < (_day+2); i++) {		
			if(_n>=(_day+2)) break;
			var _listEl = document.createElement('li');
			i %= _day;	
			_n++;
			_listEl.innerHTML = "<a href='#'>"+(i < 10 ? "0": "") + i + ":00</a>";
			document.getElementById('time-list').appendChild(_listEl);
		}
		$('#time-list').children().eq(0).addClass('first');
	};

	/* Methods for generating timesheets */
	_createTimeSheet = function (target){
		var _self = this,
			_totalUnit = _getTotalUnit(),
			_$timeline = target;

		_$timeline.empty();

		for(var i=0;i<_totalUnit;i++){
			$('<div class="unit bg1" />').appendTo(_$timeline);
		}
	};
			 
	_getTotalUnit = function (){	
		var _timeSheetWidth = $('#time-sheet').outerWidth();

		return _timeSheetWidth / _unit;
	};
	//--- DOM method end ---

	//--- Public methods ---
	return {
		init : _init,
		// A methods that return 1 hour in px
		getPxToHour : function(){
			var _5min = _unit/2;
			return _unit * 60/_5min;
		},
		getCurrentHour : function(){
			return _now;
		}
	};
}(jQuery));

/**
	* @Module $$.timelineNav
	*
 **/
$$.timelineNav = (function($){
	//--- Module scope variables ---
	var _cnt = 0,
		_$timesheet = $('#time-sheet');

	//--- Public methods ---
	return {
		goPrev : function(e){
			if(!_$timesheet.is(':animated')){
				_cnt==0 ? _cnt : _cnt--;
				_$timesheet.animate({'left': '-'+(120*_cnt)+'px'});
			}
			e.preventDefault();
		},
		goNext : function(e){
			if(!_$timesheet.is(':animated')){
				_cnt>=23-7 ? _cnt : _cnt++;
				_$timesheet.animate({'left':'-'+(120*_cnt)+'px'});
			}
			e.preventDefault();
		},
		goMove : function(e, self){
			var _parent = self.parent();
			var _idx = $('#time-list').children().index(_parent);

			(_idx>18) ? _cnt = 18 : _cnt = _idx;

			_$timesheet.animate({'left': '-'+(120*_cnt)+'px'},'slow');
			e.preventDefault();
		}
	};
}(jQuery));

