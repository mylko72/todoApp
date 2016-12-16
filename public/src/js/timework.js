/**
	* @Module $$.timeWork
	*
	* (c) 2016 mypmk72, freelancer & front end developer
	*
	* licenses:	http://codecanyon.net/licenses/
 **/

$$.timeWork= (function ($) {
	//--- Module scope variables ---
	var _startOffsetX = null,
		_endOffsetX = null,
		_clickCnt = 0,
		_idKey = 0,
		_clicked = false,
		_saved = false,
		_cntDone = 0,
		_chkVal = {},
		_mode = "",
		_timeStr = null,
		_timer = null,
		_refreshIntervalId,
		_stopped = false,
		_$bar = null,
		_$timeline = $('#time-line'),
		_$todoModal = $('#todoModal');
		
	//--- Module scope methods ---
	var _init,
		_bindEvents,
		_whichAnimationEvent,
		_updateClock,
		_stopClock,
		_timerFn,
		_getFormData,
		_setDataBar,
		_processChk,
		_loadStoredData,
		_redrawTimeline,
		_chkToDone,
		_getStartPoint,
		_getEndPoint,
		_getRange,
		_countTotal,
		_countDone,
		_showTimeList,
		_delTimeList,
		_renderList,
		_showMsg,
		_hideMsg,
		_slideIn,
		_sortBy;

	//--- Initialized method ---
	_init = function (timeline) {

		$('.container').data('mode','new');

		_updateClock();
		_refreshIntervalId = setInterval (_updateClock, 1000);

		_bindEvents();
	};

	//---  Event handler ---
	_bindEvents = function (){
		
		var _self = this,
			animatedEvent = _whichAnimationEvent();
		
		$('.capsule').one(animatedEvent, function(e){
			$(this).find('span').addClass('shadow showIn');
		});

		/* Handler for registering a thing to do */
		_$timeline.on('click', function(event){
			var e = event,
				_res;
				_timeStr;

			e.stopPropagation();

			_clickCnt++;

			if(_clickCnt>=2){
				_res = _getEndPoint(e, _$bar);	

				// Open a modal popup for register 
				if(_res){
					_$todoModal.modal({
						keyboard: true
					});
				}

				_clickCnt = 0;
				_clicked = false;
			}else{
				_getStartPoint(e, $(this));	

				_clicked = true;
			}
		});

		/* Handler to set a range of a thing to do */
		_$timeline.on('mousemove', function(event){
			var e = event;
			_getRange(e, _$bar);	
		});

		/* Bind ESC key for cancel */
		$(document).on('keydown', function(event){
			var e = event;

			if(_clicked && e.keyCode === 27){
				console.log('cancel!');
				$('#bar_'+ _idKey).remove();
				_clickCnt = 0;
				_clicked = false;
			}
		});
		
		$(document).on('click', '.btn-load', function(event){
			var e = event;

			$(this).hide();
			$('.api-select').css('display','inline-block');
		});

		/* Load Json files */
		$(document).on('click', '.dropdown-menu a', function(event){
			var e = event,
				_url = $(this).data('url');

			_loadStoredData(_url);
		});

		/* Send Json format */
		$(document).on('click', '.btn-send', function(event){
			var e = event,
				_todoData = {},
				_storedData = $$.timeData.getStoredData(),
				_jsonData;

			e.preventDefault();

			_todoData.todo = _storedData; 	
			_jsonData = JSON.stringify(_todoData);
			console.log(_jsonData);
			alert(_jsonData);
		});


		$(document).on('click', '.mytool .del', function(){
			var _idkey = $(this).parents('.bar').data('set').id;
		
			$('#alert').data('id', _idkey);
			$('#alert').show();
			$('#alert').find('.alert').addClass('alert-delete');
			$('#alert').find('.msg')[0].innerHTML = '<strong>Delete!</strong><br />Do you want to delete it?'

			return false;
		});

		/* Handler to delete a thing to do */
		$(document).on('click', '.alert-delete .btn', function(){
			var _idkey = $(this).parents('#alert').data('id');

			if($(this).hasClass('btn-ok')){
				$('#bar_'+_idkey).remove();
				$$.timeData.removeData(_idkey);
			}

			$(this).parent('.alert').removeClass('alert-delete');
			$('#alert').hide();
		});

		$(document).on('click', '.bar input:checkbox', function(){
			var _idkey = $(this).parents('.bar').data('set').id;
		
			$('#alert').data('id', _idkey);
			$('#alert').show();
			$('#alert').find('.alert').addClass('alert-status');
			$('#alert').find('.msg')[0].innerHTML = $(this).is(':checked') ? '<strong>Wait!</strong><br />Do you want to change it in progress?' : '<strong>Wait!</strong><br />Do you want to change it to Done?';
		}); 

		/* A handler that sets a thing-to-do into complete or progress */
		$(document).on('click', '.alert-status .btn', function(){
			var _idkey = $(this).parents('#alert').data('id'),
				_checkVal = $('#bar_'+_idkey).find('.switch input:checkbox').is(':checked');

			$(this).hasClass('btn-ok') ? _chkToDone(_idkey) : $('#bar_'+_idkey).find('.switch input:checkbox').prop('checked',!_checkVal);

			$(this).parent('.alert').removeClass('alert-status');
			$('#alert').hide();
		});

		/* A handler to view more */
		$(document).on('click', '.todo-list .more', function(e){
			e.preventDefault();
			if($(this).hasClass('glyphicon-chevron-up')){
				$(this).parents('.flag-wrapper').find('.desc p').removeClass('opened');
				$(this).removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
				return false;
			}
			$(this).parents('.flag-wrapper').find('.desc p').addClass('opened');
			$(this).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
		});

		$(document).on('click', '.modal .modal-backdrop', function(){
			_$todoModal.find('#cancel').trigger('click'); 
		});

		/* Save a thing-to-do */
		_$todoModal.find('#save').on('click', function(event){
			var _dataSet,
				_idx;

			_saved = true;
			_dataSet = _getFormData();

			if(_dataSet){
				_setDataBar.call(_$bar, _dataSet);

				_idx = $$.timeData.saveData(_dataSet);
			
				_processChk(200, function(){
					_showTimeList('.todo-area', _idx);
				});

				_$todoModal.modal('hide')

				_idKey = '';
				_mode = '';
				_saved = false;
			}
		});

		/* modify a thing-to-do */
		_$todoModal.find('#edit').on('click', function(event){
			var _idkey = _idKey,
				_dataSet,
				_storedData = $$.timeData.getStoredData();

			if(_mode == 'EDIT'){

				_dataSet = _getFormData();

				if(_dataSet){
					_setDataBar.call(_$bar, _dataSet);

					for(var i=0;i<_storedData.length;i++){
						if(_storedData[i].id === _idkey){
							_storedData[i].title = _dataSet.title;
							_storedData[i].description = _dataSet.description;
						}
					}

					// Update timelist
					_processChk(200, function(){
						_updateTimeList('.todo-area', _dataSet);
					});

					// Hide modal popup
					_$todoModal.modal('hide')

					console.log(_storedData);

					_mode = '';
					_idKey = '';
				}
			}
		});

		/* Cancel a thing-to-do */
		_$todoModal.find('#cancel, .close').on('click', function(event){
			if(_mode == 'SAVE'){
				$('#bar_'+ _idKey).remove();
			}
			_$todoModal.modal('hide')

			_mode = '';
			_idKey = '';
		});

		/* Bind keydown key for cancel a thing-to-do */
		_$todoModal.on('keydown', function(event){
			var e = event,
				_$targetId = e.target.getAttribute('id');

			if(_$todoModal.find('#todo-title').val().length){
				_$todoModal.find('#todo-title').removeClass('warn');
			}

			if(_$targetId == 'todoModal'||_$targetId == 'todo-title'||_$targetId == 'todo-desc'){
				if(e.keyCode === 27){
					console.log('cancel!');
					_$todoModal.find('#cancel').trigger('click');
				}
			}
		});

		/* Custom event for Modal */
		_$todoModal.on('show.bs.modal', function(event){
			var e = event,
				_dataSet,
				_$button = $(event.relatedTarget),
				_$bar = _$button.parents('.bar'),
				_$time = $('#todoModal').find('.txt-time');

			_mode = _$button.data('mode');

			if(_mode == 'EDIT'){
				_dataSet = _$bar.data('set');

				var _desc = _dataSet.description;
				var _descStr;

				if(_desc){
					_descStr = $$.util.returnLine(_desc);
					_$todoModal.find('#todo-desc').empty().val(_descStr);
				}

				_$todoModal.find('#todo-title').empty().val(_dataSet.title);
				_$todoModal.find('#startDate').empty().append(_dataSet.startDate);
				_$todoModal.find('#endDate').empty().append(_dataSet.endDate);
				_$todoModal.find('#startTime').empty().append(_dataSet.startTime);
				_$todoModal.find('#endTime').empty().append(_dataSet.endTime);

				_$todoModal.find('#save').hide();
				_$todoModal.find('#edit').show();
				_$todoModal.find('.modal-title .mode').text('Edit');

				_idKey = _dataSet.id;

				console.log(_mode + 'mode');

			}else{
				_$time.find('#startDate').empty().append(_timeStr.startDate());
				_$time.find('#endDate').empty().append(_timeStr.endDate());
				_$time.find('#startTime').empty().append(_timeStr.startTime());
				_$time.find('#endTime').empty().append(_timeStr.endTime());

				_$todoModal.find('#save').show();
				_$todoModal.find('#edit').hide();
				_$todoModal.find('.modal-title .mode').text('Register');

				_mode = 'SAVE';

				console.log(_mode + 'mode');
			}

			_$todoModal.find('#todo-title').focusin();

		});

		_$todoModal.on('hidden.bs.modal', function(){
			_$todoModal.find('#todo-title').val('');
			_$todoModal.find('#todo-desc').val('');
		});
	};
	//---  Event handler end ---

	//---  DOM method start ---
	
	/* Methods for defining animation events */
	_whichAnimationEvent = function(){
		var t,
			el = document.createElement("fakeelement");

		var animations = {
			"animation"      : "animationend",
			"OAnimation"     : "oAnimationEnd",
			"MozAnimation"   : "animationend",
			"WebkitAnimation": "webkitAnimationEnd"
		}

		for (t in animations){
			if (el.style[t] !== undefined){
				return animations[t];
			}
		}
	};

	/* Methods for displaying the current date and time */
	_updateClock = function(){
		var _$clock = $("#clock"),
			_now = new Date(),
			_year = _now.getFullYear(),
			_month = _now.getMonth()+1,
			_date = _now.getDate();

		_month = ( _month > 9 ) ? _month : "0" + _month;
		_date = ( _date > 9 ) ? _date : "0" + _date;
		
		//var timeStr = now.replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
		_$clock.find('.date')[0].innerHTML = _month + '/' + _date + '/' + _year;
		_$clock.find('.time')[0].innerHTML = _timerFn();

	};

	_stopClock = function(newdate){
		if(_stopped){
			clearInterval(_refreshIntervalId);
			$('#clock').find('.date').addClass('only').text(newdate);
			$('#clock').find('.time').hide();
		}
	};

	/* Methods that return the current time */
	_timerFn = function(){
		var _date = new Date();
		var _hour = _date.getHours();
		var _ampm = (_hour<12 || _hour == 24) ? 'AM' : 'PM';
		_hour = _hour%12 || 12;

		var _minute = _date.getMinutes();
		_minute = ( _minute > 9 ) ? _minute : "0" + _minute;

		var _second = _date.getSeconds(); 
		_second = ( _second > 9 ) ? _second : "0" + _second;

		var _millisec = _date.getMilliseconds(); 
		_millisec = ( _millisec > 99 ) ? _millisec : ( _millisec > 9 ) ? "0" + _millisec : "00" + _millisec;

		var _timeString = _hour + ":" + _minute + ":" + _second + ' <sup>' + _ampm + '</sup>';

		return _timeString;
	};

	/* Methods to load a Json file */
	_loadStoredData = function(url){
		var _jsonUrl = url,
			_storedData,
			_result = false;

		$.getJSON(_jsonUrl, function(data){
			_result = $$.timeData.loadData(data.todo);
		})
		.done(function(data){
			if(_result){
				_cntDone = 0;
				_processChk(500, function(){
					if($('.time-area').length){
						$('.time-area').remove();
					}
					_redrawTimeline();
					_showTimeList('.todo-area');
				});
			}
		});
	};

	/* Methods to check loading */
	_processChk = function(duration, callback){
		var _self = this;

		$('<div id="loading" />').appendTo('body');

		_timer = setTimeout(function(){
			if(callback && typeof (callback) === 'function'){
				callback.call(_self);
			}

			$('#loading').remove();
			_timer = null;
		}, duration);
	};

	/* Method to initialize and redraw timeline when loading json file */
	_redrawTimeline = function(){
		var _storedData = $$.timeData.getStoredData(),
			_dateStr = new Date(_storedData[0].startDate),
			_startTime = _storedData[0].startTime,
			_hour,
			_tooltipStr,
			_dataSet = {};

		_mode = 'LOAD';
		_stopped = true;
		_hour = parseInt(_startTime.split(':')[0]);
		_stopClock(_storedData[0].startDate);

		$('.container').data('mode','loaded');
		
		$$.timeData.setObjDate(_dateStr);
		$$.timeLine.init(_hour);

		if($('.bar').length){
			$('.bar').remove();
		}

		$.each(_storedData, function(index, item){
			var _width = item.endPoint - item.startPoint;

			_$bar = $('<div class="bar" id="bar_' + item.id + '" data-set="">'
				+ '<div class="wrapper progress">'
					+ '<div class="inner">'
						+ '<div class="switch demo1">'
							+ '<input type="checkbox"><label><i></i></label>'
						+ '</div>'
					+ '</div>'
				+ '</div>'
				+ '</div>');

			_dataSet = {
				id: item.id,
				startDate: item.startDate,
				startTime: item.startTime, 
				startPoint: item.startPoint,
				endDate: item.endDate, 
				endTime: item.endTime, 
				endPoint: item.endPoint, 
				title: item.title,
				description: item.description, 
				done: item.done 
			};					

			if(item.done) _cntDone++;

			$('#time-sheet').css('left',0).append(_$bar);	

			_$bar.css('left', item.startPoint);
			TimeModel.drawBar(_$timeline, _$bar, item.startPoint, _width);
			_setDataBar.call(_$bar, _dataSet);

			_countTotal();
			_countDone(_cntDone);
		});
	};
	
	/* Methods to get data from a form */
	_getFormData = function(){
		var _idkey = _idKey,
			_dataSet= {},
			_saveMode = _mode=='SAVE' ? true : false,
			_title = _$todoModal.find('#todo-title').val(),
			_desc = _$todoModal.find('#todo-desc').val(),
			_descStr = null;

			_$bar = $('#bar_'+_idkey);
			
			//console.log(_$bar);

			if(!_title){
				_$todoModal.find('#todo-title').addClass('warn').attr('placeholder', 'Please enter a title!');
				_$todoModal.find('#todo-title').focus();
				return false;
			}

			if(_desc.length>0){
				_descStr = $$.util.returnBr(_desc);
			}

			_dataSet = {
				id: _idkey,
				startDate: _saveMode ? _timeStr.startDate() : _$bar.data('set').startDate,
				startTime: _saveMode ? _timeStr.startTime() : _$bar.data('set').startTime,
				startPoint: _saveMode ?  _startOffsetX : _$bar.data('set').startPoint,
				endDate: _saveMode ? _timeStr.endDate() : _$bar.data('set').endDate,
				endTime: _saveMode ? _timeStr.endTime() : _$bar.data('set').endTime,
				endPoint: _saveMode ? _startOffsetX+_endOffsetX : _$bar.data('set').endPoint,
				title: _title,
				description: _descStr,
				done: _saveMode ? false : _$bar.data('set').done
			};					

			return _dataSet;
	};

	/* Methods for setting data in the data- attribute of bar */
	_setDataBar = function(dataSet){
		var _dataSet = dataSet,
			_$tooltip;

		if(_mode == 'SAVE'){
			this.find('.switch input:checkbox').prop('checked', true);
			this.appendTo($('#time-sheet'));
		}else if(_mode == 'LOAD'){
			this.find('.switch input:checkbox').prop('checked', !_dataSet.done);
			this.appendTo($('#time-sheet'));
		}
		this.data('set', _dataSet);

		_$tooltip = this.find('.tooltip').addClass('in');
		_$tooltip.find('.title').text(this.data('set').title);
		_$tooltip.find('.time').text(this.data('set').startTime+'-'+this.data('set').endTime);

		this.data('set').description ? _$tooltip.find('.desc').show().html(this.data('set').description) : _$tooltip.find('.desc').hide();
	};

	/* A method to change a thing to do into Complete or Progress. */
	_chkToDone = function(idkey){
		var _storedData = $$.timeData.getStoredData(),
			_idkey = idkey, 
			_done = $('#bar_'+_idkey).data('set').done;

			$('#bar_'+_idkey).data('set').done = !_done;
			$('.todo-list').find('.time_'+_idkey).toggleClass('done');

			for(var i=0;i<_storedData.length;i++){
				if(_storedData[i].id === _idkey){
					_storedData[i].done = (_done==false) ? true : false; 
					_storedData[i].done ? _cntDone++ : _cntDone--;
				}
			}

			_countDone(_cntDone);
	},

   	/* Method called by the first click on the timeline to register a thing to do */
	_getStartPoint = function (event, target){	

		var	e = event,
			_self = this, 
			_startPos,
			_storedData = $$.timeData.getStoredData(),
			_$timeline = target;

		_idKey = $$.util.rKey();

		_$bar = $('<div class="bar" id="bar_' + _idKey + '" data-set="">'
			+ '<div class="wrapper progress">'
				+ '<div class="inner">'
					+ '<div class="switch demo1">'
						+ '<input type="checkbox"><label><i></i></label>'
					+ '</div>'
				+ '</div>'
			+ '</div>'
			+ '</div>');
			
		_$timeline.append(_$bar);	// Bar 객체 생성

		_startPos = _$bar.offset();
		_startOffsetX = e.pageX-_startPos.left;
		
		_$bar.css('left', _startOffsetX).css('width','2px');

		$$.timeData.getTime(_clickCnt, _startOffsetX);	//할일 시간 설정
	}

	/* Method called by the second click on the timeline to register a thing to do */
	_getEndPoint = function (event, target){	
		var e = event,
			_endPos,
			_getPxToHour = $$.timeLine.getPxToHour(),
			_$bar = target;

		_endPos = _$bar.offset();
		_endOffsetX = e.pageX-_endPos.left;

		if(_endOffsetX && _endOffsetX<(_getPxToHour/2)){
			alert('You must register over at least 30 minutes!');
			$('#bar_'+ _idKey).remove();
			_clickCnt = 0;
			_clicked = false;
			
			return false;
		}

		if(_endOffsetX && _clicked){

			_timeStr = $$.timeData.getTime(_clickCnt, _startOffsetX, _endOffsetX);	//할일 시간 설정

			// Calling method to draw bar on timeline
			TimeModel.drawBar(_$timeline, _$bar, _startOffsetX, _endOffsetX);

			return true; 
		}

		//return endOffsetX;
	}

	/* A method that sets the range for registering a thing to do */
	_getRange = function (event, target){	
		var e = event;
		var _$bar = target;

		if(_clicked){
			var _tempPos = _$bar.offset();
			var _tempOffsetX = e.pageX-_tempPos.left;

			_$bar.css('width', _tempOffsetX+2);
		}
	};

	/* The method that displays the total number of registrations */
	_countTotal = function(){
		var _len = $$.timeData.getStoredData().length,
			_$total = $('.panel-info').find('.total');

		_$total.find('.badge').text(_len);

		return _len;
	};

	/* A method that display the total number of completions */
	_countDone = function(cntDone){
		var _cnt = cntDone,
			_$done = $('.panel-info').find('.done');

		_cntDone = _cnt;

		_$done.find('.badge').text(_cntDone);
	};

	/* A methods to show to-do lists */
	_showTimeList = function(target, idx){
		var _$todoArea = $(target),
			_url = _$todoArea.data('template'),
			_storedData = $$.timeData.getStoredData(), 
			_success = false,
			_li,
			_top,
			_idx = idx || 0;

		_$todoArea.find('.nolist').hide();

		_success = _renderList(_$todoArea, _idx, _storedData, _url);

		if(_success) {
			//_li = _slideIn($('.todo-list'), _idx);
			//_top = $$.util.elemTop($(_li));

			$('.content').css('height', 'auto');
			$('.content').css('height', $('.content').outerHeight());

			//$(window).scrollTop(_top);
		}
	};

	/* A method to update to-do lists */
	_updateTimeList = function(target, dataset){
		var _dataSet = dataset,
			_$moreBtn,
			_$liEl = $(target).find('.time_' + _dataSet.id);

		_$liEl.find('.title').text(_dataSet.title);

		if(_dataSet.description){
			_$liEl.find('.desc').show();
			_$liEl.find('.desc .txts').html(_dataSet.description);
		}else{
			_$liEl.find('.desc').hide();
		}

		_$liEl.find('.desc>p').removeClass('opened');
		_$liEl.find('.more').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
		
		setTimeout(function(){
			if(_$liEl.find('.desc .txts').height()>_$liEl.find('.desc').height()){
				if(_$liEl.find('.flag-wrapper .more').length == 0){
					_$moreBtn = String() + '<a href="#" class="glyphicon glyphicon-chevron-down more">더보기</a>';
					_$liEl.find('.flag-wrapper').append(_$moreBtn);
				}
			}else{
				_$liEl.find('.flag-wrapper .more').remove();
			}
		}, 300);
	};

	/* A method to delete a thing to do */
	_delTimeList = function(idkey){
		var _idkey = idkey,
			_$todolist,
			len;

		_$todolist = $('li.time_'+_idkey).parent('.todo-list');
		_$todolist.find('li.time_'+_idkey).remove();
		_len = _$todolist.find('li').length;

		if(_len == 0) {
			_$todolist.parents('.time-area').remove();
			_$todolist.remove();
		}

		if(!_countTotal()){
			$('.todo-area').find('.nolist').show();
			_chkVal.date = '';
			_chkVal.offsetX = '';
			_chkVal.offsetX2 = '';
		}

		setTimeout(function(){
			_sortBy(_$todolist);

			$('.content').css('height', 'auto');
			$('.content').css('height', $('.content').outerHeight());
		}, 1000);
	};

	/* A methods to render a to-do list from a template */
	_renderList = function(target, idx, storedData, templateUrl){
		var _$todoArea = target,
			_$todoList,
			_$moreBtn,
			_num = 0,
			_idx = idx,
			_storedData = storedData,
			_templateUrl = templateUrl,
			_$liEl;

		console.log('_idx :'+_idx);
	
		$.ajax({
			type : "GET",
			async : false,
			url : _templateUrl,
			success : function(template) {

				_$todoArea.find('.todo-list').empty();
			
				$.each(_storedData, function(index, item){

					var _newLi = $(template).find('.todo-list > li');				
					var _strDate = $$.util.replaceAll(item.startDate, '/', '-');

					if(_chkVal.date != item.startDate){
						if(_$todoArea.find('.date_'+_strDate).size()==0){
							var i;

							if(_chkVal.date){
								_chkVal.offsetX2 = item.startPoint;
							}

							_chkVal.offsetX2 < _chkVal.offsetX ? _$todoArea.prepend(template) : _$todoArea.append(template);
							_chkVal.offsetX2 < _chkVal.offsetX ? i = 0 : i = -1; 
								
							_$todoArea.find('.time-area').eq(i).addClass('date_'+_strDate);
							$('.date_'+_strDate).find('.time-tit').text(item.startDate);
						} else {
							_$todoArea.find('.date_'+_strDate).find('.todo-list').append(_newLi);
						}

						_chkVal.date = item.startDate;
						_chkVal.offsetX = item.startPoint;
						_num = 0;
					} else {
						_$todoArea.find('.date_'+_strDate).find('.todo-list').append(_newLi);
					}

					_$todoList = _$todoArea.find('.date_'+_strDate).find('.todo-list');

					_$liEl = _$todoList.find('li').eq(_num);

					_$liEl.addClass('time_'+item.id);
					//_$liEl.find('.flag-wrapper').addClass('lazy');
					_$liEl.find('.title').text(item.title);
					_$liEl.find('.start-time').text(item.startTime);
					_$liEl.find('.end-time').text(item.endTime);

					if(item.done){
						_$liEl.addClass('done');
					}

					item.description ? _$liEl.find('.desc .txts').html(item.description) : _$liEl.find('.desc').hide();

					if(_$liEl.find('.desc .txts').height()>_$liEl.find('.desc').height()){
						_$moreBtn = String() + '<a href="#" class="glyphicon glyphicon-chevron-down more">더보기</a>';
						_$liEl.find('.flag-wrapper').append(_$moreBtn);
					} 

					_num % 2 == 0 ? _$liEl.find('.direction-r').removeClass('direction-r').addClass('direction-l') 
									:_$liEl.find('.direction-l').removeClass('direction-l').addClass('direction-r'); 

					_num++;
				});
			},
			complete: function(){
				$$.lazyload.init('.flag-wrapper', _idx);
			}
		});

		return true;
	};

	/* A method that shows the message that it is registered */
	_showMsg = function (target){
		$(target).addClass(function(index){
			var _addClass;
			if($(target).is(':hidden')){
				$(target).css('display', 'block');
				_addClass = 'show-in';
			}
			var _top = parseInt($(this).css('top'));
			//$(target).css('opacity', 1);	
			$(target).css('transform', 'translateY(50px)');

			return _addClass;
		});

		setTimeout(function(){
			_hideMsg(target);
		}, 1500);
	};

	/* A methods to hide registration messages */
	_hideMsg = function (target){
		var _top = parseInt($(target).css('top'));
		$(target).css('transform', 'translateY(-50px)');
		$(target).removeClass('show-in')
		//$(target).css('opacity', 0);	
		setTimeout(function(){
			$(target).css('display', 'none');	
		}, 1000);
	};

	/* A methods to sort to-do lists */
	_sortBy = function(target){
		var _$liEl = $(target).find('li');
		_$liEl.each(function(){
			var _idx = $(target).find('li').index(this),
				_$directionL = $(this).find('.direction-l'),
			    _$directionR = $(this).find('.direction-r');

			if(_idx%2 == 1){
				if(_$directionR.hasClass('in')){
					_$directionR.addClass('slideInRight').removeClass('in');
				}
				_$directionL.removeClass('direction-l').addClass('direction-r');
			}else{
				var _$el = _$directionR.removeClass('direction-r').addClass('direction-l');

				if(_$el.hasClass('in')){
					_$el.addClass('slideInLeft').removeClass('in');
				}
			}
		});
	};

	/* Methods to call slide animations */
	_slideIn = function(target, idx){
		var _$todolist = target,
			_li,
			_idx = idx;

		_$todolist.find('li').each(function(index){
			var addclass;

			if(index == _idx) {
				addclass = _idx%2 == 1 ? 'slideInRight' : 'slideInLeft' ;
				$(this).find("div[class*='direction']").addClass(addclass);

				_li = this;	
			}
		});

		return _li;
	};
	//--- DOM method end ---

	//--- Public methods ---
	return {
		init : _init,
		showMsg : _showMsg,
		processChk : _processChk,
		delTimeList : _delTimeList,
		countTotal : _countTotal,
		countDone : _countDone,
		getDoneCnt : function(){
			return _cntDone;
		}
	};

}(jQuery));
