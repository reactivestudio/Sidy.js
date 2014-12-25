/**
 * global jQuery
 * !
 * Sidy.js v0.9.0
 * https://github.com/reactivestudio/sidy.js
 *
 * Sidy.js is a responsive off-, on- canvas sidebar navigation
 * using CSS transforms & transitions.
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2014, Reactive Studio
 * http://www.reactivestudio.ru, https://twitter.com/reactive_studio
 * by Dmitriy Bushin dima.bushin@gmail.com
 *
 * Thanks to Codrops http://www.codrops.com - for the inspiration and ideas.
 */

;(function ( $, window, document, undefined ) {
	"use strict";

	var pluginName = "Sidy",
		pluginCssClass = 'sidy',
		buttonAttr = 'data-panel',

		defaults = {
			keyboard: false,

			arrows: true,
			swipe: true,
			trackpad: false,

			panel : {
				position : 'left',
				size     : '300px',
				fx       : 'push',
				duration : 0.5, // time of transition in seconds.
				easing   : 'cubic-bezier(.16, .68, .43, .99)'
			},
		},

		classes = {
			container:     pluginCssClass + '__container',
			content:       pluginCssClass + '__content',
			panel:         pluginCssClass + '__panel',
			pusher:        pluginCssClass + '__pusher',
			opened:        pluginCssClass + '--opened',
			disabled:      pluginCssClass + '--disabled',
            afterNone:     pluginCssClass + '--after-none',
            toOpen:        pluginCssClass + '--to-open',
            toClose:       pluginCssClass + '--to-close',
		},

		mobileCheck = function() {
            var check = false;
            (function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
                return check;
        },
        hasParentClass = function(element, classname) {
            var parent = $(element).parents('.'+classname);
            if (parent.length) {
                return true;
            };
            return false;
        },

        eventtype = mobileCheck() ? 'touchstart' : 'click'; // event type (if mobile use touch events)

	// Fx constructor.
	function Fx () {
		var states = {
			opened: {},
			closed: {},
			init: {}
		};

		// Fx template output
		this.output = {
			cssRules: {
				pusher: $.extend( {}, states),
				panel: $.extend( {}, states),
				container: $.extend( {}, states),
			},
			cssClasses: {
				pusher: $.extend( {}, states),
				panel: $.extend( {}, states),
				container: $.extend( {}, states),
			},
				inPusher: false,
		};
	};
	Fx.prototype = {
		/* Effect 1: Slide overlay */
		slide_overlay: function (position, size, duration, easing) {
			var panel = $.extend(true, {}, this.output),
				x, y, p = {};

			switch (position) {
				case 'left':
					x = size;
					y = 0;
					p = {
						top: 0,
						left: 0,
						height: '100%',
						width: size
					};
					break;

				case 'right':
					x = '-'+size;
					y = 0;
					p = {
						top: 0,
						right: 0,
						height: '100%',
						width: size
					};
					break;

				case 'top':
					x = 0;
					y = '-'+size;
					p = {
						top: 0,
						height: size,
						width: '100%'
					};
					break;

				case 'bottom':
					x = 0;
					y = size;
					p = {
						bottom: 0,
						height: size,
						width: '100%'
					};
					break;
			};

			panel.cssRules.panel.opened = $.extend( {}, {
				visibility: 'visible',
				'-webkit-transform': 'translate3d(0, 0, 0)',
				transform: 'translate3d(0, 0, 0)',
				// '-webkit-transition': '-webkit-transform '+duration+'s '+easing,
				// transition: 'transform '+duration+'s '+easing
			}, p);
			panel.cssRules.panel.closed = $.extend( {}, {
				visibility: 'visible',
				'-webkit-transform': 'translate3d(-100%, 0, 0)',
				transform: 'translate3d(-100%, 0, 0)',
				// '-webkit-transition': '-webkit-transform '+duration+'s '+easing,
				// transition: 'transform '+duration+'s '+easing
			}, p);

			panel.cssClasses.panel.init = [classes.afterNone];

			panel.inPusher = false;

			return panel;
		},

		/* Effect 2: Reveal */
		reveal: function (position, size, duration, easing) {
			var panel = $.extend(true, {}, this.output),
				x, y, p = {};

			switch (position) {
				case 'left':
					x = size;
					y = 0;
					p = {
						top: 0,
						left: 0,
						height: '100%',
						width: size
					};
					break;

				case 'right':
					x = '-'+size;
					y = 0;
					p = {
						top: 0,
						right: 0,
						height: '100%',
						width: size
					};
					break;

				case 'top':
					x = 0;
					y = '-'+size;
					p = {
						top: 0,
						height: size,
						width: '100%'
					};
					break;

				case 'bottom':
					x = 0;
					y = size;
					p = {
						bottom: 0,
						height: size,
						width: '100%'
					};
					break;
			};

			panel.cssRules.pusher.opened = {
				'-webkit-transform': 'translate3d('+x+', '+y+', 0)',
				transform: 'translate3d('+x+', '+y+', 0)'
			};

			panel.cssRules.panel.opened = $.extend( {}, {
				'z-index': 1,
				visibility: 'visible',
				'-webkit-transition': '-webkit-transform '+duration+'s '+easing,
				transition: 'transform '+duration+'s '+easing
			}, p);
			panel.cssRules.panel.closed = $.extend( {}, {'z-index': 1}, p);

			panel.cssClasses.panel.init = [classes.afterNone];

			return panel;
		},

		/* Effect 3: Push */
		push: function (position, size, duration, easing) {
			var panel = $.extend( true, {}, this.output ),
				x1, y1, x2, y2, p = {};

			switch (position) {
				case 'left':
					x1 = size;
					x2 = '-100%';
					y1 = y2 = 0;
					p = {
						top: 0,
						left: 0,
						height: '100%',
						width: size
					};
					break;

				case 'right':
					x1 = '-'+size;
					x2 = '100%';
					y1 = y2 = 0;
					p = {
						top: 0,
						right: 0,
						height: '100%',
						width: size
					};
					break;

				case 'top':
					x1 = x2 = 0;
					y1 = '-'+size;
					y2 = '100%';
					p = {
						top: 0,
						height: size,
						width: '100%'
					};
					break;

				case 'bottom':
					x1 = x2 = 0;
					y1 = size;
					y2 = '-100%';
					p = {
						bottom: 0,
						height: size,
						width: '100%'
					};
					break;
			};

			panel.cssRules.pusher.opened = {
				'-webkit-transform': 'translate3d('+x1+', '+y1+', 0)',
				transform: 'translate3d('+x1+', '+y1+', 0)'
			};

			panel.cssRules.panel.opened = $.extend( {}, {
				'-webkit-transform': 'translate3d('+x2+', '+y2+', 0)',
				transform: 'translate3d('+x2+', '+y2+', 0)',
				visibility: 'visible',
				'-webkit-transition': '-webkit-transform '+duration+'s '+easing,
				transition: 'transform '+duration+'s '+easing
			}, p);
			panel.cssRules.panel.closed = $.extend( {}, {
				'-webkit-transform': 'translate3d('+x2+', '+y2+', 0)',
				transform: 'translate3d('+x2+', '+y2+', 0)'
			}, p);

			panel.cssClasses.panel.init = [classes.afterNone];

			panel.inPusher = true;

			return panel;
		},

		/* Effect 4: Slide Along */
		slide_along: function (position, size, duration, easing) {
			var panel = $.extend( true, {}, this.output ),
				x, y, p = {};

			switch (position) {
				case 'left':
					x = size;
					y = 0;
					p = {
						top: 0,
						left: 0,
						height: '100%',
						width: size
					};
					break;

				case 'right':
					x = '-'+size;
					y = 0;
					p = {
						top: 0,
						right: 0,
						height: '100%',
						width: size
					};
					break;

				case 'top':
					x = 0;
					y = '-'+size;
					p = {
						top: 0,
						height: size,
						width: '100%'
					};
					break;

				case 'bottom':
					x = 0;
					y = size;
					p = {
						bottom: 0,
						height: size,
						width: '100%'
					};
					break;
			};

			panel.cssRules.pusher.opened = {
				'-webkit-transform': 'translate3d('+x+', '+y+', 0)',
				transform: 'translate3d('+x+', '+y+', 0)'
			};

			panel.cssRules.panel.opened = $.extend( {}, {
				'z-index': 1,
				visibility: 'visible',
				'-webkit-transform': 'translate3d(0, 0, 0)',
				transform: 'translate3d(0, 0, 0)',
				// '-webkit-transition': '-webkit-transform '+duration+'s '+easing,
				// transition: 'transform '+duration+'s '+easing
			}, p);
			panel.cssRules.panel.closed = $.extend( {}, {
				'z-index': 1,
				'-webkit-transform': 'translate3d(-50%, 0, 0)',
				transform: 'translate3d(-50%, 0, 0)'
			}, p);

			panel.cssClasses.panel.init = [classes.afterNone];

			panel.inPusher = false;

			return panel;
		},

		/* Effect 5: Slide Reverse */
		slide_reverse: function (position, size, duration, easing) {
			var panel = $.extend( true, {}, this.output ),
				x, y, p = {};

			switch (position) {
				case 'left':
					x = size;
					y = 0;
					p = {
						top: 0,
						left: 0,
						height: '100%',
						width: size
					};
					break;

				case 'right':
					x = '-'+size;
					y = 0;
					p = {
						top: 0,
						right: 0,
						height: '100%',
						width: size
					};
					break;

				case 'top':
					x = 0;
					y = '-'+size;
					p = {
						top: 0,
						height: size,
						width: '100%'
					};
					break;

				case 'bottom':
					x = 0;
					y = size;
					p = {
						bottom: 0,
						height: size,
						width: '100%'
					};
					break;
			};

			panel.cssRules.pusher.opened = {
				webkitTransform: 'translate3d('+x+', '+y+', 0)',
				transform: 'translate3d('+x+', '+y+', 0)'
			};

			panel.cssRules.panel.opened = $.extend( {}, {
				zIndex: 1,
				visibility: 'visible',
				webkitTransform: 'translate3d(0, 0, 0)',
				transform: 'translate3d(0, 0, 0)',
				webkitTransition: '-webkit-transform '+duration+'s '+easing,
				transition: 'transform '+duration+'s '+easing
			}, p);
			panel.cssRules.panel.closed = $.extend( {}, {
				zIndex: 1,
				webkitTransform: 'translate3d(50%, 0, 0)',
				transform: 'translate3d(50%, 0, 0)'
			}, p);

			panel.cssClasses.panel.init = [];

			panel.inPusher = false;

			return panel;
		},

		/* Effect 6: 3D Rotate In */
		rotate_in: function (position, size, duration, easing) {
			var panel = $.extend( true, {}, this.output ),
				x, y, p = {};

			switch (position) {
				case 'left':
					x = size;
					y = 0;
					p = {
						top: 0,
						left: 0,
						height: '100%',
						width: size
					};
					break;

				case 'right':
					x = '-'+size;
					y = 0;
					p = {
						top: 0,
						right: 0,
						height: '100%',
						width: size
					};
					break;

				case 'top':
					x = 0;
					y = '-'+size;
					p = {
						top: 0,
						height: size,
						width: '100%'
					};
					break;

				case 'bottom':
					x = 0;
					y = size;
					p = {
						bottom: 0,
						height: size,
						width: '100%'
					};
					break;
			};

			panel.cssRules.container.init = {
				webkitPerspective: '1500px',
				perspective: '1500px',
				webkitPerspectiveOrigin: '0% 50%',
				perspectiveOrigin: '0% 50%',
			};

			panel.cssRules.pusher.opened = {
				webkitTransform: 'translate3d('+x+', '+y+', 0)',
				transform: 'translate3d('+x+', '+y+', 0)',
				webkitTransformStyle: 'preserve-3d',
				transformStyle: 'preserve-3d'
			};
			panel.cssRules.pusher.closed = {
				webkitTransformStyle: 'preserve-3d',
				transformStyle: 'preserve-3d'
			};

			panel.cssRules.panel.opened = $.extend( {}, {
				visibility: 'visible',
				webkitTransform: 'translate3d(-100%, 0, 0)  rotateY(0deg)',
				transform: 'translate3d(-100%, 0, 0)  rotateY(0deg)',
				webkitTransition: '-webkit-transform '+duration+'s '+easing,
				transition: 'transform '+duration+'s '+easing,
				webkitTransformStyle: 'preserve-3d',
				transformStyle: 'preserve-3d'
			}, p);
			panel.cssRules.panel.closed = $.extend( {}, {
				webkitTransform: 'translate3d(-100%, 0, 0) rotateY(-90deg)',
				transform: 'translate3d(-100%, 0, 0) rotateY(-90deg)',
				webkitPerspectiveOrigin: '100% 50%',
				perspectiveOrigin: '100% 50%',
				webkitTransformStyle: 'preserve-3d',
				transformStyle: 'preserve-3d'
			}, p);

			panel.cssClasses.panel.init = [];

			panel.inPusher = false;

			return panel;
		},

		/* Effect 7: Scale Down */
		scale_down: function (position, size, duration, easing) {
			var panel = $.extend( true, {}, this.output ),
				x, y, p = {};

			switch (position) {
				case 'left':
					x = size;
					y = 0;
					p = {
						top: 0,
						left: 0,
						height: '100%',
						width: size
					};
					break;

				case 'right':
					x = '-'+size;
					y = 0;
					p = {
						top: 0,
						right: 0,
						height: '100%',
						width: size
					};
					break;

				case 'top':
					x = 0;
					y = '-'+size;
					p = {
						top: 0,
						height: size,
						width: '100%'
					};
					break;

				case 'bottom':
					x = 0;
					y = size;
					p = {
						bottom: 0,
						height: size,
						width: '100%'
					};
					break;
			};

			panel.cssRules.container.opened = {
				'-webkit-perspective': '1500px',
				perspective: '1500px'
			};

			panel.cssRules.pusher.opened = {
				'-webkit-transform': 'translate3d(0, 0, -300px)',
				transform: 'translate3d(0, 0, -300px)',
				'-webkit-transform-style': 'preserve-3d',
				'transform-style': 'preserve-3d'
			};

			panel.cssRules.panel.opened = $.extend( {}, {
				visibility: 'visible',
				'-webkit-transform': 'translate3d(0, 0, 0)',
				transform: 'translate3d(0, 0, 0)',
				'-webkit-transition': '-webkit-transform '+duration+'s '+easing,
				transition: 'transform '+duration+'s '+easing
			}, p);
			panel.cssRules.panel.closed = $.extend( {}, {
				opacity: 1,
				'-webkit-transform': 'translate3d(-100%, 0, 0)',
				transform: 'translate3d(-100%, 0, 0)'
			}, p);

			panel.cssClasses.panel.init = [classes.afterNone];

			panel.inPusher = false;

			return panel;
		},

		/* Effect 8: Scale Up */
		scale_up: function (position, size, duration, easing) {
			var panel = $.extend( true, {}, this.output ),
				x, y, z, p = {};

			switch (position) {
				case 'left':
					x = size;
					y = 0;
					z = '-'+size;
					p = {
						top: 0,
						left: 0,
						height: '100%',
						width: size
					};
					break;

				case 'right':
					x = '-'+size;
					y = 0;
					z = '-'+size;
					p = {
						top: 0,
						right: 0,
						height: '100%',
						width: size
					};
					break;

				case 'top':
					x = 0;
					y = '-'+size;
					z = '-'+size;
					p = {
						top: 0,
						height: size,
						width: '100%'
					};
					break;

				case 'bottom':
					x = 0;
					y = size;
					z = '-'+size;
					p = {
						bottom: 0,
						height: size,
						width: '100%'
					};
					break;
			};

			panel.cssRules.container.opened = {
				webkitPerspective:       '1500px',
				perspective:             '1500px',
				webkitPerspectiveOrigin: '0% 50%',
				perspectiveOrigin:       '0% 50%'
			};

			panel.cssRules.pusher.opened = {
				webkitTransform: 'translate3d('+x+', '+y+', 0)',
				transform:       'translate3d('+x+', '+y+', 0)'
			};

			panel.cssRules.panel.opened = $.extend( {}, {
				zIndex:           1,
				visibility:       'visible',
				webkitTransform:  'translate3d(0, 0, 0)',
				transform:        'translate3d(0, 0, 0)',
				webkitTransition: '-webkit-transform '+duration+'s '+easing,
				transition:       'transform '+duration+'s '+easing
			}, p);
			panel.cssRules.panel.closed = $.extend( {}, {
				zIndex:          1,
				opacity:         1,
				webkitTransform: 'translate3d(0, 0, '+z+')',
				transform:       'translate3d(0, 0, '+z+')'
			}, p);

			panel.cssClasses.panel.init = [classes.afterNone];

			panel.inPusher = false;

			return panel;
		},
	};

	// Panels constructor.
	function Panels (panelClass, Fx) {
		var self = this;
		$('.' + panelClass).each(function() {
			var optionsHTML = {
					position: $(this).attr('data-position'),
					size: $(this).attr('data-size'),
					fx: $(this).attr('data-fx'),
					duration: $(this).attr('data-duration'),
					html: $(this).clone().wrap('<div>').parent().html()
				},
				o = $.extend( {},
					defaults.panel,
					optionsHTML
				);

			if (!(o.fx in Fx)) {
				console.log(pluginName + ' error: fx with name ' + o.fx + ' does not exists. Sorry');
				o.fx = defaults.panel.fx;
			};

			self[$(this).attr('id')] = $.extend(
				{},
				o,
				Fx[o.fx](o.position, o.size, o.duration, o.easing)
			);
		});
	};

	// Sidy constructor
	function Sidy ( element, optionsHTML ) {
		this.options = $.extend( {}, defaults, optionsHTML );

		this.fx = new Fx(); // Get fx methods
		this.panels = new Panels(classes.panel, this.fx); // Get panels

        var sidy = this;
		sidy.init();
	};
	Sidy.prototype = {
		init: function () {
			var sidy = this,
				contentHTML = $('.' + classes.content).clone().wrap('<div>').parent().html();

			// Build Sidy html template
			$('.' + pluginCssClass)
				.html('')
				.removeClass(pluginCssClass)
				.addClass(classes.container)
				.append('<div></div>');

			$('.' + classes.container + ' div').addClass(classes.pusher);
			$('.' + classes.pusher).html(contentHTML);


			// Panels and add some classes.
			$.each(sidy.panels, function(id, options) {
				var $div,
					$pusher = $('.' + classes.pusher),
					$content = $('.' + classes.content);

				$div = (options.inPusher) ? $content : $pusher;

				$div.before(options.html);
				$('#'+id)
					.css(options.cssRules.panel.closed)
					.addClass(classes.disabled)
					.addClass(options.cssClasses.panel.init.join(" "));
			});

			// Get all buttons objects
			sidy.$buttonsOpen  = $('.' + classes.toOpen);
			sidy.$buttonsClose = $('.' + classes.toClose);

			// Add event listeners.
			sidy.$buttonsOpen.on(eventtype, function(event){
				var id = $(this).attr(buttonAttr);
				if (!(id in sidy.panels)) {
					console.log(pluginName + ' error: panel with id: ' + id + ' does not exists. Sorry');
				} else {
					sidy.openPanel(event, id, sidy.panels[id]);
				};
			});
		},

		openPanel: function(event, idPanelToOpen, panel) {
            var sidy = this,
				$panel = $("#" + idPanelToOpen),
				$container = $('.' + classes.container);

            // Some magic with disabling multiple events.
            event.stopPropagation();
            event.preventDefault();

            // Enable panel, apply classes for opening panel with fx.
            $panel.removeClass(classes.disabled);
            setTimeout(function() {
				$('.' + classes.container).css(panel.cssRules.container.opened);
				$panel.attr('style', '');
				$panel.css(panel.cssRules.panel.opened);
				$container.addClass(classes.opened);
				setTimeout(function() {
					// $('.' + classes.pusher).addClass(classes.pusherOpened);
					$('.' + classes.pusher).attr('style', '');
					$('.' + classes.pusher).css(panel.cssRules.pusher.opened);
				}, 25);
            }, 5);


            // Adding event listeners for closing panel.
            // Close panel if there is a click in nonactive panel area.
            $(document).on(eventtype, function(evt){
                if (! hasParentClass(evt.target, classes.panel)) {
                    sidy.closePanel($panel, panel);
                    $(this).off();
                };
            });

            // Close panel if there is a close- button or link.
            sidy.$buttonsClose.on(eventtype, function(event) {
                sidy.closePanel($panel, panel);
                $(this).off();
            });
        },

        closePanel: function($panel, panel) {
            $panel.attr('style', '');
            $panel.css(panel.cssRules.panel.closed);
            $('.' + classes.container).removeClass(classes.opened);
            $('.' + classes.pusher).attr('style', '');
			$('.' + classes.pusher).css(panel.cssRules.pusher.closed);
            setTimeout(function() {
                    $panel.addClass(classes.disabled);
                }, panel.duration*1000 // duration of transition in milliseconds
            );
        }
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Sidy( this, options ) );
			}
		});
	};


	// Auto-initialization
	$(function () {
        $(this).Sidy();

        // Get usage statistics
        // if (getProtocol() !== 'http://' || !location.host.match(/\./) || window.blockFotoramaData) return;
        // $('body').append('<iframe src="http://data.fotorama.io/?version=' + fotoramaVersion + '" style="display: none;"></iframe>');
	});
})( typeof jQuery !== 'undefined' && jQuery, window, document );



