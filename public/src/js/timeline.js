/**
	* @Module $$.timeLine
	* 1min = 2px, 5min = 10px, 1hours = 120px
	*
	* (c) 2016 mypmk72, freelancer & front end developer
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

		_setupTimeline('#time-line', _now);
		_timeNavObj = $$.timelineNav; 

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

		for (var i = _now; i < (_day+1); i++) {		
			if(_n>=(_day+1)) break;
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
		_hour = $$.timeLine.getPxToHour(),
		_$timesheet = $('#time-sheet'),
		_limit = _$timesheet.outerWidth() - $('.time-inner').outerWidth(); 


	$(window).on('resize', function(e){
		var _left = parseInt(_$timesheet.css('left'));
		_limit = _$timesheet.outerWidth() - $('.time-inner').outerWidth(); 

		if(Math.abs(_left)>_limit) {
			_$timesheet.css('left', '-'+ _limit +'px');
		}
	});

	//--- Public methods ---
	return {
		goPrev : function(e){
			if(!_$timesheet.is(':animated')){
				_cnt==0 ? _cnt : _cnt--;
				_$timesheet.animate({'left': '-'+(_hour*_cnt)+'px'});
			}
			e.preventDefault();
		},
		goNext : function(e){
			var _move, _value;

			if(!_$timesheet.is(':animated')){
				_cnt>=24-7 ? _cnt : _cnt++;
				_value = _hour*_cnt;
				_move = (_value > _limit) ? _limit : _value;

				_$timesheet.animate({'left':'-'+_move+'px'});
			}
			e.preventDefault();
		},
		goMove : function(e, self){
			var _parent = self.parent(),
				_idx = $('#time-list').children().index(_parent),
				_move,
				_value;

			_cnt = (_idx>18) ? 18 : _idx;
			_value = _hour*_cnt;
			_move = (_value > _limit) ? _limit : _value;

			_$timesheet.animate({'left': '-'+_move+'px'},'slow');
			e.preventDefault();
		}
	};
}(jQuery));

