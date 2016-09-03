/*
 *1minute = 2px	, 5minutes = 10px = 1unit, 1hour(60minute) = 120px, 현재 15시이면 120*15 = 1800px

 */

(function ($) {
    /**
	@class $.TimeLine
	@constructor
	**/
    $.TimeLine= function () {

		var base = null,	//현재시간(now변수)을 기준으로 타임시트를 재설정하기 위한 변수
			now = null;			//window 시간을 현재시간으로 설정하기 위한 변수
			day =  24,
			unit = 10,		//1unit = 10px
			fiveminutes = unit/2,
			$prev = $('#left'),
			$next = $('#right'),
			timeSheetWidth = $('#time-sheet').outerWidth();

		/** 
		Init function will check for specific body classes and create the necessary page object.
		@function init
		**/
		function init() {
			$.timeNav = new $.TimelineNav(); //네비게이션 객체 생성

			setupTimeline('#time-line');
			bindEvents();
		}

		function bindEvents(){

			$prev.on('click', $.timeNav.goPrev);	//타임시트 탐색 (이전시간 탐색) 
			$next.on('click', $.timeNav.goNext);	//타임시트 탐색 (다음시간 탐색) 

			var $link = $('#time-list').find('li > a');
			// 클릭한 시간을 앞으로 slide
			$link.on('click', function(){
				var $self = $(this);
				$.timeNav.goMove($self);
			});
		}
		
		function setupTimeline(target){
			var $timeline = $(target).css('width','3000px');
			
			createTimeline(); // 현재시간을 기준으로 24시간을 생성
			createTimeSheet($timeline);	// 1unit(5minutes) 단위의 타임시트 생성
		}

		//현재 시간을 기준으로 타임라인(24시간) 생성
		function createTimeline(servTime){
			var self = this,	
				d = new Date(),				//현재 시간을 가져오기 위한 Date 오브젝트 생성;
				n = 0;						//24시간 생성을 위한 카운트변수
			
			$('#timelist').empty();
			
			(!servTime) ? now = d.getHours() : now = servTime;		//현재 시간을 가져오거나 서버에 저장된 시간을 가져와서 now변수에 저장
			console.log('now : '+ now);
			base = now * calToPx();							//now*1hour(120px) 값을 타임시트의 기준(base) pixel로 설정하여 base 변수에 저장

			for (var i = now; i < (day+2); i++) {		//현재 시간을 기준으로 24시간 생성
				if(n>=(day+2)) break;
				var list = document.createElement('li');
				i %= day;	//나머지연산자를 이용하여 23시 이후는 0시로 초기화
				n++;
				list.innerHTML = "<a href='#'>"+(i < 10 ? "0": "") + i + ":00</a>";
				document.getElementById('time-list').appendChild(list);
			}
			$('#timelist').children().eq(0).addClass('first');
		}

		//타임시트 생성
		function createTimeSheet(target){
			var self = this,
				len = getTotalUnit(),
				$timeline = target;

			for(var i=0;i<len;i++){
				//console.log(i);
				$('<div class="unit bg1" />').appendTo($timeline);
			}
		}

		function calToPx(){
			return unit * 60/fiveminutes;
		}
				 
		function getTotalUnit(){	//타임시트내의 Total Unit 개수
			return timeSheetWidth / unit;
		}

		return {
			init : init,
			calToPx : calToPx,
			getCurrentHour : function(){
				var d = new Date();
				return d.getHours();
			},
			config : {
				base : base,
			}
		};
	};

	$.TimelineNav = function(){
		var cnt = 0,
			$timesheet = $('#time-sheet');

		return {
			goPrev : function(){
				cnt==0 ? cnt : cnt--;
				$timesheet.animate({'left': '-'+(120*cnt)+'px'});
			},
			goNext : function(){
				cnt>=23-7 ? cnt : cnt++;
				$timesheet.animate({'left':'-'+(120*cnt)+'px'});
			},
			goMove : function(self){
				var parent = self.parent();
				var idx = $('#time-list').children().index(parent);

				(idx>18) ? cnt = 18 : cnt = idx;

				$timesheet.animate({'left': '-'+(120*cnt)+'px'},'slow');
			}
		};
	};

}(jQuery));

