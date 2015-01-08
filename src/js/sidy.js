/**!
 * Sidy.js is jQuery plugin for responsive off-, on- canvas
 * sidebar navigation using CSS3 transforms & transitions.
 *
 * Copyright 2014, Reactive Studio, by Dmitriy Bushin
 * dima.bushin@gmail.com
 * MIT licensed.
 *
 * Sidy.js v1.1.0
 * https://github.com/reactivestudio/Sidy.js
 * https://twitter.com/reactive_studio
 *
 * Thanks to Codrops http://tympanus.net/codrops
 * for the inspiration and ideas.
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
				duration : 0.65, // time of transition in seconds.
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
		var elements = {
				container: {},
				pusher:    {},
				panel:     {}
			};

		this._toggleSize = function(size) {
			return (size.charAt(0) === '-')? size.substr(1) : '-'+size;
		};

		this._cssTranslate3d = function(x, y, z) {
			return {
				webkitTransform: 'translate3d('+x+', '+y+', '+z+')',
				transform:       'translate3d('+x+', '+y+', '+z+')',
			};
		};

		this._cssTransitionAll = function(duration, easing) {
			return {
				webkitTransition: 'all '+duration+'s '+easing,
				transition: 'all '+duration+'s '+easing
			};
		};

		this._cssTransitionTransform = function(duration, easing) {
			return {
				webkitTransition: '-webkit-transform '+duration+'s '+easing,
				transition: 'transform '+duration+'s '+easing
			};
		};

		this._getPosition = function(position, size, offset) {
			var parameters = {
					opened: {
						x: 0,
						y: 0,
					},
					closed: {
						x: 0,
						y: 0,
					},
					panelCssRules: {},
				};

			switch (position) {
				case 'left':
					parameters.opened.x = size;
					parameters.closed.x = this._toggleSize(offset);
					parameters.panelCssRules = {
						top: 0,
						left: 0,
						height: '100%',
						width: size
					};
					break;

				case 'right':
					parameters.opened.x = this._toggleSize(size);
					parameters.closed.x = offset;
					parameters.panelCssRules = {
						top: 0,
						right: 0,
						height: '100%',
						width: size
					};
					break;

				case 'top':
					parameters.opened.y = size;
					parameters.closed.y = this._toggleSize(offset);
					parameters.panelCssRules = {
						top: 0,
						height: size,
						width: '100%'
					};
					break;

				case 'bottom':
					parameters.opened.y = this._toogleSize(size);
					parameters.closed.y = offset;
					parameters.panelCssRules = {
						bottom:0,
						height: size,
						width: '100%'
					};
					break;
			};

			return parameters;
		};

		// Fx template output
		this.output = {
			css: {
				opened: $.extend( {}, elements ),
				closed: $.extend( {}, elements ),
			},
			inPusher:  false,
			afterNone: false,
		};
	};
	Fx.prototype = {
		/* Effect 1: Slide overlay */
		slide_overlay: function (position, size, duration, easing) {
			var options = $.extend(true, {}, this.output),
				p = this._getPosition(position, size, '100%');

			options.css.opened.panel = $.extend(
				{},
				{visibility: 'visible'},
				this._cssTranslate3d(0, 0, 0),
				p.panelCssRules
			);

			options.css.closed.panel = $.extend(
				{},
				// {visibility: 'visible'},
				this._cssTransitionAll(duration, easing),
				this._cssTranslate3d(p.closed.x, p.closed.y, 0),
				p.panelCssRules
			);

			options.css.closed.pusher = $.extend(
				{},
				this._cssTransitionTransform(duration, easing)
			);

			options.inPusher  = false;
			options.afterNone = true;

			return options;
		},

		/* Effect 2: Reveal */
		reveal: function (position, size, duration, easing) {
			var options = $.extend(true, {}, this.output),
				p = this._getPosition(position, size, '100%');

			options.css.opened.pusher = $.extend(
				{},
				{visibility: 'visible'},
				this._cssTranslate3d(p.opened.x, p.opened.y, 0)
			);

			options.css.opened.panel = $.extend(
				{},
				{visibility: 'visible', zIndex: 1},
				this._cssTransitionTransform(duration, easing),
				p.panelCssRules
			);

			options.css.closed.panel = $.extend(
				{},
				{zIndex: 1},
				this._cssTransitionAll(duration, easing),
				p.panelCssRules
			);

			options.css.closed.pusher = $.extend(
				{},
				this._cssTransitionTransform(duration, easing)
			);

			options.inPusher  = false;
			options.afterNone = true;

			return options;
		},

		/* Effect 3: Push */
		push: function (position, size, duration, easing) {
			var options = $.extend(true, {}, this.output),
				p = this._getPosition(position, size, '100%');

			options.css.opened.pusher = $.extend(
				{},
				this._cssTranslate3d(p.opened.x, p.opened.y, 0)
			);

			options.css.opened.panel = $.extend(
				{},
				{visibility: 'visible'},
				this._cssTransitionTransform(duration, easing),
				this._cssTranslate3d(p.closed.x, p.closed.y, 0),
				p.panelCssRules
			);

			options.css.closed.panel = $.extend(
				{},
				this._cssTransitionAll(duration, easing),
				this._cssTranslate3d(p.closed.x, p.closed.y, 0),
				p.panelCssRules
			);

			options.css.closed.pusher = $.extend(
				{},
				this._cssTransitionTransform(duration, easing)
			);

			options.inPusher  = true;
			options.afterNone = true;

			return options;
		},

		/* Effect 4: Slide Along */
		slide_along: function (position, size, duration, easing) {
			var options = $.extend(true, {}, this.output),
				p = this._getPosition(position, size, '50%');

			options.css.opened.pusher = $.extend(
				{},
				this._cssTranslate3d(p.opened.x, p.opened.y, 0)
			);

			options.css.opened.panel = $.extend(
				{},
				{visibility: 'visible', zIndex: 1},
				this._cssTransitionTransform(duration, easing),
				this._cssTranslate3d(0, 0, 0),
				p.panelCssRules
			);

			options.css.closed.panel = $.extend(
				{},
				{zIndex: 1},
				this._cssTransitionAll(duration, easing),
				this._cssTranslate3d(p.closed.x, p.closed.y, 0),
				p.panelCssRules
			);

			options.css.closed.pusher = $.extend(
				{},
				this._cssTransitionTransform(duration, easing)
			);

			options.inPusher  = false;
			options.afterNone = true;

			return options;
		},

		/* Effect 5: Slide Reverse */
		slide_reverse: function (position, size, duration, easing) {
			var options = $.extend(true, {}, this.output),
				p = this._getPosition(position, size, '-50%');

			options.css.opened.pusher = $.extend(
				{},
				this._cssTranslate3d(p.opened.x, p.opened.y, 0)
			);

			options.css.opened.panel = $.extend(
				{},
				{visibility: 'visible', zIndex: 1},
				this._cssTransitionTransform(duration, easing),
				this._cssTranslate3d(0, 0, 0),
				p.panelCssRules
			);

			options.css.closed.panel = $.extend(
				{},
				{zIndex: 1},
				this._cssTransitionAll(duration, easing),
				this._cssTranslate3d(p.closed.x, p.closed.y, 0),
				p.panelCssRules
			);

			options.css.closed.pusher = $.extend(
				{},
				this._cssTransitionTransform(duration, easing)
			);

			options.inPusher  = false;
			options.afterNone = true;

			return options;
		},

		/* Effect 6: Scale Down */
		scale_down: function (position, size, duration, easing) {
			var options = $.extend(true, {}, this.output),
				p = this._getPosition(position, size, '100%');

			options.css.opened.container = $.extend(
				{},
				{webkitPerspective: '1500px', perspective: '1500px'}
			);

			options.css.opened.pusher = $.extend(
				{},
				{
					webkitTransformStyle: 'preserve-3d',
					transformStyle:       'preserve-3d'
				},
				this._cssTranslate3d(0, 0, '-300px')
			);

			options.css.opened.panel = $.extend(
				{},
				{visibility: 'visible'},
				this._cssTransitionTransform(duration, easing),
				this._cssTranslate3d(0, 0, 0),
				p.panelCssRules
			);

			options.css.closed.panel = $.extend(
				{},
				{opacity: 1},
				this._cssTransitionAll(duration, easing),
				this._cssTranslate3d(p.closed.x, p.closed.y, 0),
				p.panelCssRules
			);

			options.css.closed.pusher = $.extend(
				{},
				this._cssTransitionTransform(duration, easing)
			);

			options.inPusher  = false;
			options.afterNone = true;

			return options;
		},

		/* Effect 7: Scale Up */
		scale_up: function (position, size, duration, easing) {
			var options = $.extend(true, {}, this.output),
				p = this._getPosition(position, size, '100%');

			options.css.opened.container = $.extend(
				{},
				{
					webkitPerspective: '1500px',
					perspective: '1500px',
					webkitPerspectiveOrigin: '0% 50%',
					perspectiveOrigin: '0% 50%'
				}
			);

			options.css.opened.pusher = $.extend(
				{},
				this._cssTranslate3d(p.opened.x, p.opened.y, 0)
			);

			options.css.opened.panel = $.extend(
				{},
				{visibility: 'visible', opacity: 1, zIndex: 1},
				this._cssTransitionTransform(duration, easing),
				this._cssTranslate3d(0, 0, 0),
				p.panelCssRules
			);

			options.css.closed.panel = $.extend(
				{},
				{opacity: 1, zIndex: 1},
				this._cssTransitionAll(duration, easing),
				this._cssTranslate3d(0, 0, '-300px'),
				p.panelCssRules
			);

			options.css.closed.pusher = $.extend(
				{},
				this._cssTransitionTransform(duration, easing)
			);

			options.inPusher  = false;
			options.afterNone = false;

			return options;
		},
	};

	// Panels constructor.
	function Panels (panelClass, Fx) {
		var self = this;

		$('.' + panelClass).each(function() {
			var $p = $(this),
				optionsFromHTML = {
					position: $p.attr('data-position'),
					size:     $p.attr('data-size'),
					fx:       $p.attr('data-fx'),
					duration: $p.attr('data-duration'),
					html:     $p.clone().wrap('<div>').parent().html()
				},
				o = $.extend(
					{},
					defaults.panel,
					optionsFromHTML
				);

			if (o.size === 'auto') {
				o.size = (o.position === 'left' || o.position === 'right')? $p.width()+'px': $p.height()+'px';
			};

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
				var $pusher  = $('.' + classes.pusher),
					$content = $('.' + classes.content),
					$div = (options.inPusher) ? $content : $pusher;

				$div.before(options.html);
				$('#'+id)
					.css(options.css.closed.panel)
					.addClass(classes.disabled);
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

		openPanel: function(event, idPanel, options) {
            var sidy = this,
				$container = $('.'+classes.container),
				$panel     = $("#"+idPanel),
				$pusher    = $('.'+classes.pusher);

            // Some magic with disabling multiple events.
            event.stopPropagation();
            event.preventDefault();

            // Enable panel, apply classes for opening panel with fx.
            $panel.removeClass(classes.disabled);
            setTimeout(function() {
				$container
					.css(options.css.opened.container)
					.addClass(classes.opened);
				$panel.css(options.css.opened.panel);
				setTimeout(function() {
					$pusher
						.css(options.css.closed.pusher)
						.css(options.css.opened.pusher);
				}, 25);
            }, 1);


            // Adding event listeners for closing panel.
            // Close panel if there is a click in nonactive panel area.
            $(document).on(eventtype, function(evt){
                if (! hasParentClass(evt.target, classes.panel)) {
                    sidy.closePanel(idPanel, options);
                    $(this).off();
                };
            });

            // Close panel if there is a close- button or link.
            sidy.$buttonsClose.on(eventtype, function(event) {
                sidy.closePanel(idPanel, options);
                $(this).off();
            });
        },

        closePanel: function(idPanel, options) {
			var $container = $('.'+classes.container),
				$panel     = $("#"+idPanel),
				$pusher    = $('.'+classes.pusher);

            $container.removeClass(classes.opened);
            $panel.attr('style', '').css(options.css.closed.panel);
			$pusher.attr('style', '').css(options.css.closed.pusher);

            setTimeout(function() {
					$container.attr('style', '');
					$pusher.attr('style', '');
                    $panel.addClass(classes.disabled);
                }, options.duration*1000 // duration of transition in milliseconds
            );
        }
	};

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
