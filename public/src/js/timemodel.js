//Object.create()
var objectCreate = function(arg){
    if( !arg ) { return {}; }
    function obj() {};
    obj.prototype = arg;
    return new obj;
};

Object.create = Object.create || objectCreate;

var TimeModel = {
	id: 0,
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
	drawBar: function(target1, target2, startoffsetx, endoffsetx){
		var $timeline = target1,
			$bar = target2,
			$mytool,
			$del,
			$edit,
			util = new $.Util(),
			tooltipStr;

		$bar.css('width', endoffsetx);
		$bar.data('active', false);

		$mytool = $('<div class="btn btn-default btn-xs mytool" role="group" aria-label="MY Tool">'
				+ '<a href="#" class="edit" data-toggle="modal" data-target="#todoModal" data-mode="EDIT" title="EDIT"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span><p class="bubble"></p></a>'
				+ '<a href="#" class="del" title="DELETE"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span><p class="bubble"></p></a></div>');

		$bar.find('.inner').append($mytool);
		$del = $bar.find('.del'); 
		$edit = $bar.find('.edit'); 

		console.log('타임Bar 생성 : drawBar()');

		tooltipStr = String()+'<div class="tooltip">';
		tooltipStr += '<span class="title"></span>';
		tooltipStr += '<span class="time"></span>';
		tooltipStr += '<span class="desc"></span>';
		tooltipStr += '</div>';

		$bar.find('.wrapper').append(tooltipStr);

		util.tooltip($('.wrapper', $bar), false, 'mousemove');
		util.tooltip($del, true, 'mousemove');
		util.tooltip($edit, true, 'mousemove');

		$mytool.on('click', '.del', function(){
			var //_idx = idnum,
				_idkey = $(this).parents('.bar').data('set').id;

			$(this).parents('.bar').remove();
			$$.timeData.removeData(_idkey);

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
