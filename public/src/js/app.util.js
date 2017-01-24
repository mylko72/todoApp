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

			if (!Number.isNaN) { 
				/* Polyphil to check for NaN
				 * var a = 2/"foo";
				 * Number.isNaN(a);
				 */
				Number.isNaN = function(n) { 
					return n !== n;
				};
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
		};
		
		var scrollTop = function(){
			return $(window).scrollTop();
		};

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
			scrollTop : scrollTop,
			scrollTo : scrollTo,
			replaceAll : replaceAll,
			tooltip: tooltip
		};
	};
}(jQuery));

(function($){
	var eventDriven = $('<div />'),
		eventDictionary = {
			global : {
				RESIZE : 'resize',
				 ROTATE : 'rotate',
				 SCROLL : 'scroll'
			 }
		};

	var ticking = false,
		fireScroll = false,
		fireResize = false;

	/**
	  Function to throttle speed of events
	  @function throttle
	 **/
	var throttle = (function () {
		return function (fn, delay) {
			delay || (delay = 100);
			var last = (function () {
					return +new Date();
				})(),
			timeoutId = null;

			return function () {
				var args = arguments;
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = null;
				}

				var now = (function () {
					return +new Date();
				})();
				if (now - last > delay) {
					fn.apply(this, args);
					last = now;
				} else {
					timeoutId = setTimeout(function () {
						fn.apply(this, args);
					}, delay);
				}
			};
		};
	})();

	var requestTick = function(ev) {
		if (!ticking) {
			window.webkitRequestAnimationFrame(function () {
				if (fireScroll) {
					eventDriven.trigger(jQuery.Event(eventDictionary.global.SCROLL));
					fireScroll = false;
				}
				if (fireResize) {
					eventDriven.trigger(jQuery.Event(eventDictionary.global.RESIZE));
					fireResize = false;
				}
				ticking = false;
			});
			ticking = true;
		}
	}

	$.LazyLoadImages = function(){
		return {
			lazy : [],
			elem : [],
			init : function(el, index){
				var self = this;
				self.lazy = [];
				self.elem = [];

				self.elem = $(el);
				self.setLazy(index);
				self.bindEvents();

				$$.util = new $.Util();
			},
			setLazy : function(index){
				var self = this,
					len = self.elem.length;
				for(var i=0;i<len;i++){
					var $elem = $(self.elem[i]);
					if($elem.attr('data-lazy-loaded') !== 'true' && self.isInView($elem)){
						if(i==index){
							$elem.addClass('lazy');
							$elem.attr('data-lazy-loaded', 'false');
							self.lazy.push($elem);
							setTimeout(function(){
								eventDriven.trigger(jQuery.Event(eventDictionary.global.SCROLL));
							}, 300);
						}else{
							$elem.attr('data-lazy-loaded', 'true');
						}
					}else{
						$elem.addClass('lazy');
						$elem.attr('data-lazy-loaded', 'false');
						self.lazy.push($elem);
					}
				}
			},
			scan : function(){
				var self = this,
					len = self.lazy.length;

				for(var i=0;i<len;i++){
					var $lazy = $(self.lazy[i]);
					if($lazy.attr('data-lazy-loaded') !== 'true' && self.isInView($lazy)){
						$lazy.attr('data-lazy-loaded', 'true');
						$lazy.animate({'opacity':1});
						$lazy.removeClass('lazy');
					}
				}
			},
			isInView : function(elem){
				if(!elem.is(':visible')){
					return false;	
				}
				var elemTop = $$.util.elemTop(elem),
					scrollBottom = $(window).height()+$$.util.scrollTop(),
					threshold = 0;

				if(elemTop < scrollBottom+threshold){
					return true;
				}
				return false;
		   	},
			bindEvents : function(){
				var self = this;
				eventDriven.on(eventDictionary.global.SCROLL, function(e){
					self.scan();
				});
				$(window).on('scroll', throttle(function (e) {
					fireScroll = true;
					if (typeof window.webkitRequestAnimationFrame !== 'undefined') {
						requestTick();
					} else {
						eventDriven.trigger(jQuery.Event(eventDictionary.global.SCROLL));
					}
				}, 250));
			}
		};
	};
}(jQuery));
