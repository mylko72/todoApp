//Object.create()
var objectCreate = function(arg){
    if( !arg ) { return {}; }
    function obj() {};
    obj.prototype = arg;
    return new obj;
};

Object.create = Object.create || objectCreate;

var TimeWorker = {
	no: 0,
	startDate: '0000-00-00',
	startTime: '00:00',
	startPoint: 0,
	endDate: '0000-00-00',
	endTime: '00:00',
	endPoint: 0,
	title: '할일 제목',
	description: '할일 내용',
	done: false,
	toString: function(){
		return this.startDate + ' ' + this.startTime + ' 부터' + this.endDate + ' ' + this.endTime + ' 까지' + this.title + '(을)를 할일로 등록했습니다.';
	},
	drawBar: function(target1, target2, startoffsetx, endoffsetx, idnum){
		var $timeline = target1,
			$bar = target2,
			$del;

		$bar.css('width', endoffsetx);

		$del = $('<div class="btn btn-default btn-xs del" id="del'+idnum+'" role="group" aria-label="Delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></div>').appendTo($timeline);
		$del.css({'left' : (startoffsetx+endoffsetx)-24});

		//idnum++;

		//time.home.setTimeData._delTime();
		
		$del.bind('click', function(){
			var self = this;
			$$.timeData.delTime(self);

			return false;
		});
	},
	extend: function(config){
		var tmp = Object.create(this),
			key;
		for(key in config){
			if(config.hasOwnProperty(key)){
				tmp[key] = config[key];
			}
		}
		return tmp;
	}
}
