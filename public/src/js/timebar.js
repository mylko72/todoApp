//Object.create()�� �������� �ʴ� �������� ���� ũ�ν������� �޼���
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
	title: '���� ����',
	description: '���� ����',
	done: false,
	toString: function(){
		return this.startDate + ' ' + this.startTime + '���� ' + this.endDate + ' ' + this.endTime + '���� ���� �������� ' + this.title + ' ��(��) ����߽��ϴ�';
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
