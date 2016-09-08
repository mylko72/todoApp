//Object.create()을 지원하지 않는 브라우저를 위한 크로스브라우저 메서드
var objectCreate = function(arg){
    if( !arg ) { return {}; }
    function obj() {};
    obj.prototype = arg;
    return new obj;
};

Object.create = Object.create || objectCreate;

var TimeBar = {
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
		return this.startDate + ' ' + this.startTime + '부터 ' + this.endDate + ' ' + this.endTime + '까지 할일 내용으로 ' + this.title + ' 를(을) 등록했습니다';
	},
	extend: function(config){
		var tmp = Object.create(this);
		for(var key in config){
			if(config.hasOwnProperty(key)){
				tmp[key] = config[key];
			}
		}
		return tmp;
	}
}
