(function ($) {

    /**
	@class $.Util
	@constructor
	**/
	$.Util = function(){
	
		var $tooltip;
		var $bubble;

        /** 
		@function init
		**/
        function init() {

			// Add a method to delete an array element
			Array.prototype.removeElement = function(index) {
				this.splice(index,1);     
				return this; 
			}; 
			
			if (!Array.indexOf) {
				// Adding a method that returns the index value of a specific item in an array
				Array.prototype.indexOf = function (obj, start) {
					for (var i = (start || 0); i < this.length; i++) {
						if (this[i] == obj) {
							return i;
						}
					}
				}
			}
		}

		// Generate ramdom key
		var randomKey = function () {
			return 'f' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
		};

		// Converts newline to the br tag
		var returnBr = function (value){
			var lines = value.split("\n");
			var descStr = "";
			for (var i = 0; i < lines.length; i++) {
				descStr += (i==lines.length-1) ? lines[i] : lines[i] + "<br />";
			}

			return descStr; 
		};

		// Converts the br tag to newline character
		var returnLine = function (value){
			var lines = value.split("<br />");
			var descStr = "";
			for (var i = 0; i < lines.length; i++) {
				descStr += (i==lines.length-1) ? lines[i] : lines[i] + "\n";
			}

			return descStr;
		};

		// Returns the top coordinates of the passed element
		var elemTop = function(elem) {
			var offset = elem.offset();

			return offset.top;
		}

		// Move the scrollbar to the position of an element
		var scrollTo = function(element, position, speed, func) { 
			var pos = position || $(element).offset().top, 
				_speed = speed || 800, 
				callback = (func) ? func() : null; 
				
			$('body').animate({scrollTop: pos}, _speed, function () {callback;});
		};

		// Replace a character in a string with the passed character
		var replaceAll = function(str, searchStr, replaceStr) {
		    return str.split(searchStr).join(replaceStr);
		};

		//--- Tooltip function ---
		var tooltip = function(target, titleVar, event){
			var $target = target;

			// Set to true when title attribute is set to tooltip text
			var title = titleVar; 
			// Set the type of event
			var eventType = event;	
			var text ='';

			// If the title variable is true, 
			// take the text from the 'title' attribute of the 'a' tag and store it in the text variable.
			if(title){
				text = $target.attr('title');	
				$bubble = $target.find('.bubble');
			}else{
				$tooltip = $target.find('.tooltip');
			}

			// Define a handler based on event type
			$target.bind({
				'mouseenter' :function(e){
					var evnt = e;
					showTooltip(evnt);
				},
				'mousemove': function(e){
					var evnt = e;
					showTooltip(evnt);
					//console.log('mousemove');
				},
				'mouseleave': function(e){
					var evnt = e;
					hideTooltip(evnt);
				}
			});
			// If the event type is 'mouseover', remove the 'mousemove' event to prevent the showTooltip function from executing
			if(eventType=='mouseover'){		
				$target.unbind('mousemove');
			}

			// Functions that show tooltips
			function showTooltip(evnt){

				var e = evnt;	
				var src = e.currentTarget;

				if (e.cancelBubble) e.cancelBubble = true;
				else if (e.stopPropagation) e.stopPropagation();

				// If the event type is 'mouseover' or 'mousemove', get the coordinates of the event.
				if(eventType=='mouseover'||eventType=='mousemove'){	

					var ex = e.pageX;	
					var ey = e.pageY;	

					// The offset coordinates at which the $ container element is located at the screen coordinates (0,0) of the browser
					var offset = $target.offset();	 
					var offsetX = ex - offset.left;		 
					var offsetY = ey - offset.top;		
				}

				if(title){
					$target.attr('title','');	
					$bubble.html(text);	
				}

				if(eventType=='mouseover'||eventType=='mousemove'){		
					// Store the width and height values of $ tooltip in a variable.
					var width = (src.nodeName == 'A') ? $bubble.outerWidth() : $tooltip.outerWidth();		
					var height = (src.nodeName == 'A') ? $bubble.outerHeight() : $tooltip.outerHeight();
				}

				if(src.nodeName == 'A'){
					if($tooltip != undefined) $tooltip.hide();
					$bubble.show();
				}else{
					$tooltip.show();	
				}

				if(eventType=='mouseover'||eventType=='mousemove'){
					// Set the location of the tooltip to the coordinates at which the event occurred
					(src.nodeName == 'A') ? $bubble.css({ 'left' : offsetX-20, 'top' : offsetY-height-10 }) : $tooltip.css({ 'left' : offsetX-20, 'top' : offsetY-height-10 });	
				}

			}

			// Functions that hide tooltips
			function hideTooltip(evnt){
				var e = evnt;	
				var src = e.currentTarget;

				(src.nodeName == 'A') ? $bubble.hide() : $tooltip.hide();

				if(title){
					$bubble.html('');
					$(this).attr('title',text);
				}
			}

		}	
			
		//--- Public API ---
		return {
			init : init,
			rKey : randomKey,
			returnBr : returnBr,
			returnLine : returnLine,
			elemTop : elemTop,
			scrollTo : scrollTo,
			replaceAll : replaceAll,
			tooltip: tooltip
		};
	};
}(jQuery));
