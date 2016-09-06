
// 배열요소를 삭제하는 메소드 추가
Array.prototype.removeElement = function(index) {
	this.splice(index,1);     
	return this; 
}; 

var $$ = {};

(function ($) {
	

    /**
	Global object which lives on every page.  This object will handle the creation of other necessary objects for page functionality. 
	@class $.Global
	@constructor
	**/
    $.Global= function () {

        /** 
		Init function will check for specific body classes and create the necessary page object.
		@function init
		**/
        function init() {
			$$.timeLine.init();
			new $.TimePicker().init();
			new $.Form().init();
		}
		
		init();

	};

}(jQuery));

$(function (){
	new $.Global();
});

(function ($) {
	$.Form= function () {
		
		function init(){

			bindEvents();

			$(':checked').trigger('click');
		}

		function bindEvents(){
			
			/* checkbox toggle */
			$(':checkbox').click(function(){
				var $label = $(this).next('label');
				$(this).is(':checked') ? $label.addClass('on') : $label.removeClass('on');
				$(this).is(':checked') ? $(this).prop('checked', true) : $(this).prop('checked', false);
			});

			/* radio button toggle */
			$(':radio').click(function(){
				var $label = $(this).next('label');
				console.log($label);
				var val = $(this).attr('name');
				var $labelGroup = $('input[name='+val+']').next();
				$labelGroup.removeClass('on');
				if($(this).is(':checked')){
					$('input[name='+val+']').prop('checked',false);
					$(this).prop('checked',true);
					$label.addClass('on');
				}
			});

		}

		return {
			init : init
		};

	};

}(jQuery));
