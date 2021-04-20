/*
* debouncedresize: special jQuery event that happens once after a window resize
*
* latest version and complete README available on Github:
* https://github.com/louisremi/jquery-smartresize/blob/master/jquery.debouncedresize.js
*
* Copyright 2011 @louis_remi
* Licensed under the MIT license.
*/
var $event = $.event,
	$special,
	resizeTimeout;

$special = $event.special.debouncedresize = {
	setup: function () {
		$(this).on("resize", $special.handler);
	},
	teardown: function () {
		$(this).off("resize", $special.handler);
	},
	handler: function (event, execAsap) {
		// Сохранение контекста
		var context = this,
			args = arguments,
			dispatch = function () {
				// установить правильный тип события
				event.type = "debouncedresize";
				$event.dispatch.apply(context, args);
			};

		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
		}

		execAsap ?
			dispatch() :
			resizeTimeout = setTimeout(dispatch, $special.threshold);
	},
	threshold: 250
};

// ==================== Плагин загрузки изображений ===========================
// https://github.com/desandro/imagesloaded

// $('#my-container').imagesLoaded(myFunction)
// выполнить обратный вызов, когда все изображения загружены.
// необходимо, потому что .load () не работает с кешированными изображениями

// функция обратного вызова получает коллекцию изображений в качестве аргумента
// это контейнер

// original: MIT license. Paul Irish. 2010.
// contributors: Oren Solomianik, David DeSandro, Yiannis Chatzikonstantinou

// пустое изображение data-uri обходит предупреждение журнала webkit (спасибо, Дуг Джонс)
var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

$.fn.imagesLoaded = function (callback) {
	var $this = this,
		deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
		hasNotify = $.isFunction(deferred.notify),
		$images = $this.find('img').add($this.filter('img')),
		loaded = [],
		proper = [],
		broken = [];

	// Зарегистрируйте отложенные обратные вызовы
	if ($.isPlainObject(callback)) {
		$.each(callback, function (key, value) {
			if (key === 'callback') {
				callback = value;
			} else if (deferred) {
				deferred[key](value);
			}
		});
	}

	function doneLoading() {
		var $proper = $(proper),
			$broken = $(broken);

		if (deferred) {
			if (broken.length) {
				deferred.reject($images, $proper, $broken);
			} else {
				deferred.resolve($images);
			}
		}

		if ($.isFunction(callback)) {
			callback.call($this, $images, $proper, $broken);
		}
	}

	function imgLoaded(img, isBroken) {
		// не продолжать, если ПУСТОЕ изображение или изображение уже загружено
		if (img.src === BLANK || $.inArray(img, loaded) !== -1) {
			return;
		}

		// сохранить элемент в массиве загруженных изображений
		loaded.push(img);

		// отслеживать битые и правильно загруженные изображения
		if (isBroken) {
			broken.push(img);
		} else {
			proper.push(img);
		}

		// изображение кеша и его состояние для будущих вызовов
		$.data(img, 'imagesLoaded', { isBroken: isBroken, src: img.src });

		// запускать отложенный метод выполнения, если он присутствует
		if (hasNotify) {
			deferred.notifyWith($(img), [isBroken, $images, $(proper), $(broken)]);
		}

		// вызвать doneLoading и очистить слушателей, если все изображения загружены
		if ($images.length === loaded.length) {
			setTimeout(doneLoading);
			$images.unbind('.imagesLoaded');
		}
	}

	// если нет изображений, запускать немедленно
	if (!$images.length) {
		doneLoading();
	} else {
		$images.bind('load.imagesLoaded error.imagesLoaded', function (event) {
			// триггер imgLoaded
			imgLoaded(event.target, event.type === 'error');
		}).each(function (i, el) {
			var src = el.src;

			// узнать, проверено ли это изображение на статус
			// если это было, и источник не изменился, вызовите для него imgLoaded
			var cached = $.data(el, 'imagesLoaded');
			if (cached && cached.src === src) {
				imgLoaded(el, cached.isBroken);
				return;
			}

			// если полное верно и браузер поддерживает естественные размеры, попробуйте 
			// проверить статус изображения вручную
			if (el.complete && el.naturalWidth !== undefined) {
				imgLoaded(el, el.naturalWidth === 0 || el.naturalHeight === 0);
				return;
			}

			// кешированные изображения иногда не запускают загрузку, 
			// поэтому мы сбрасываем исходный код, но только когда имеем дело с IE, 
			// или изображение завершено (загружено) и не удалось вручную проверить взлом 
			// webkit с http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
			if (el.readyState || el.complete) {
				el.src = BLANK;
				el.src = src;
			}
		});
	}

	return deferred ? deferred.promise($this) : $this;
};

var Grid = (function () {

	// список элементов
	var $grid = $('#og-grid'),
		// элемент
		$items = $grid.children('li'),
		// индекс текущего развернутого элемента
		current = -1,
		// положение (top) развернутого элемента
		// знавал, если просмотр будет расширяться в другой строке
		previewPos = -1,
		// дополнительное количество пикселей для прокрутки окна
		scrollExtra = 0,
		// дополнительный отступ при расширении (между предварительным наложением и следующими элементами)
		marginExpanded = 10,
		$window = $(window), winsize,
		$body = $('html, body'),
		// переходные события
		transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
		// поддержка csstransitions
		support = Modernizr.csstransitions,
		// настройки по умолчанию
		settings = {
			minHeight: 500,
			speed: 350,
			easing: 'ease'
		};

	function init(config) {

		// настройки...
		settings = $.extend(true, {}, settings, config);

		// предварительная загрузика всех изображений
		$grid.imagesLoaded(function () {

			// сохранить размер и смещение элемента
			saveItemInfo(true);
			// получить размер окна
			getWinSize();
			// инициализировать некоторые события
			initEvents();

		});

	}

	// добавить больше элементов в сетку.
	// новые элементы необходимо добавить в сетку.
	// после этого вызовите Grid.addItems(theItems);
	function addItems($newitems) {

		$items = $items.add($newitems);

		$newitems.each(function () {
			var $item = $(this);
			$item.data({
				offsetTop: $item.offset().top,
				height: $item.height()
			});
		});

		initItemsEvents($newitems);

	}

	// сохраняет смещение вершины и высоты элемента (если saveheight имеет значение true)
	function saveItemInfo(saveheight) {
		$items.each(function () {
			var $item = $(this);
			$item.data('offsetTop', $item.offset().top);
			if (saveheight) {
				$item.data('height', $item.height());
			}
		});
	}

	function initEvents() {

		// при щелчке по элементу показывать предварительный просмотр с информацией об элементе и большим изображением.
		// закройте элемент, если он уже развернут.
		// также закрыть, если щелкнуть крестик элемента
		initItemsEvents($items);

		// при изменении размера окна снова получить размер окна
		// сбросить некоторые значения ...
		$window.on('debouncedresize', function () {

			scrollExtra = 0;
			previewPos = -1;
			// сохранить смещение элемента
			saveItemInfo();
			getWinSize();
			var preview = $.data(this, 'preview');
			if (typeof preview != 'undefined') {
				hidePreview();
			}

		});

	}

	function initItemsEvents($items) {
		$items.on('click', 'span.og-close', function () {
			hidePreview();
			return false;
		}).children('a').on('click', function (e) {

			var $item = $(this).parent();
			// проверьте, открыт ли элемент уже
			current === $item.index() ? hidePreview() : showPreview($item);
			return false;

		});
	}

	function getWinSize() {
		winsize = { width: $window.width(), height: $window.height() };
	}

	function showPreview($item) {

		var preview = $.data(this, 'preview'),
			// верхнее смещение итема
			position = $item.data('offsetTop');

		scrollExtra = 0;

		// если предварительный просмотр существует и previewPos отличается (другая строка) от верхней части элемента, закройте его
		if (typeof preview != 'undefined') {

			// не в одном ряду
			if (previewPos !== position) {
				// если position> previewPos, то при прокрутке окна необходимо учитывать текущую высоту предварительного просмотра.
				if (position > previewPos) {
					scrollExtra = preview.height;
				}
				hidePreview();
			}
			// тот же ряд
			else {
				preview.update($item);
				return false;
			}

		}

		// обновление previewPos
		previewPos = position;
		// инициализировать новый предварительный просмотр для выбранного элемента
		preview = $.data(this, 'preview', new Preview($item));
		// развернуть наложение предварительного просмотра
		preview.open();

	}

	function hidePreview() {
		current = -1;
		var preview = $.data(this, 'preview');
		preview.close();
		$.removeData(this, 'preview');
	}

	// предварительный просмотр obj / overlay
	function Preview($item) {
		this.$item = $item;
		this.expandedIdx = this.$item.index();
		this.create();
		this.update();
	}

	Preview.prototype = {
		create: function () {
			// создать структуру предварительного просмотра:
			this.$title = $('<h3></h3>');
			this.$description = $('<p></p>');
			this.$href = $('<a href="#">Visit website</a>');
			this.$details = $('<div class="og-details"></div>').append(this.$title, this.$description, this.$href);
			this.$loading = $('<div class="og-loading"></div>');
			this.$fullimage = $('<div class="og-fullimg"></div>').append(this.$loading);
			this.$closePreview = $('<span class="og-close"></span>');
			this.$previewInner = $('<div class="og-expander-inner"></div>').append(this.$closePreview, this.$fullimage, this.$details);
			this.$previewEl = $('<div class="og-expander"></div>').append(this.$previewInner);
			// добавить элемент предварительного просмотра к элементу
			this.$item.append(this.getEl());
			// установить переходы для превью и элемента
			if (support) {
				this.setTransition();
			}
		},
		update: function ($item) {

			if ($item) {
				this.$item = $item;
			}

			// если уже развернут, удалите класс "og-extended" из текущего элемента и добавьте его в новый элемент
			if (current !== -1) {
				var $currentItem = $items.eq(current);
				$currentItem.removeClass('og-expanded');
				this.$item.addClass('og-expanded');
				// правильно расположите превью
				this.positionPreview();
			}

			// обновить текущее значение
			current = this.$item.index();

			// обновить содержимое превью
			var $itemEl = this.$item.children('a'),
				eldata = {
					href: $itemEl.attr('href'),
					largesrc: $itemEl.data('largesrc'),
					title: $itemEl.data('title'),
					description: $itemEl.data('description')
				};

			this.$title.html(eldata.title);
			this.$description.html(eldata.description);
			this.$href.attr('href', eldata.href);

			var self = this;

			// удалить текущее изображение в превью
			if (typeof self.$largeImg != 'undefined') {
				self.$largeImg.remove();
			}

			// предварительно загрузить большое изображение и добавить его в превью
			// для маленьких экранов мы не показываем большое изображение (медиа-запрос скроет оболочку fullimage)
			if (self.$fullimage.is(':visible')) {
				this.$loading.show();
				$('<img/>').load(function () {
					var $img = $(this);
					if ($img.attr('src') === self.$item.children('a').data('largesrc')) {
						self.$loading.hide();
						self.$fullimage.find('img').remove();
						self.$largeImg = $img.fadeIn(350);
						self.$fullimage.append(self.$largeImg);
					}
				}).attr('src', eldata.largesrc);
			}

		},
		open: function () {

			setTimeout($.proxy(function () {
				// установить высоту для предварительного просмотра и элемента
				this.setHeights();
				// прокрутите, чтобы разместить предварительный просмотр в нужном месте
				this.positionPreview();
			}, this), 25);

		},
		close: function () {

			var self = this,
				onEndFn = function () {
					if (support) {
						$(this).off(transEndEventName);
					}
					self.$item.removeClass('og-expanded');
					self.$previewEl.remove();
				};

			setTimeout($.proxy(function () {

				if (typeof this.$largeImg !== 'undefined') {
					this.$largeImg.fadeOut('fast');
				}
				this.$previewEl.css('height', 0);
				// текущий развернутый элемент (может отличаться от этого. $item)
				var $expandedItem = $items.eq(this.expandedIdx);
				$expandedItem.css('height', $expandedItem.data('height')).on(transEndEventName, onEndFn);

				if (!support) {
					onEndFn.call();
				}

			}, this), 25);

			return false;

		},
		calcHeight: function () {

			var heightPreview = winsize.height - this.$item.data('height') - marginExpanded,
				itemHeight = winsize.height;

			if (heightPreview < settings.minHeight) {
				heightPreview = settings.minHeight;
				itemHeight = settings.minHeight + this.$item.data('height') + marginExpanded;
			}

			this.height = heightPreview;
			this.itemHeight = itemHeight;

		},
		setHeights: function () {

			var self = this,
				onEndFn = function () {
					if (support) {
						self.$item.off(transEndEventName);
					}
					self.$item.addClass('og-expanded');
				};

			this.calcHeight();
			this.$previewEl.css('height', this.height);
			this.$item.css('height', this.itemHeight).on(transEndEventName, onEndFn);

			if (!support) {
				onEndFn.call();
			}

		},
		positionPreview: function () {

			// прокрутка страницы
			// случай 1: высота предварительного просмотра + высота элемента соответствует высоте окна
			// случай 2: высота предварительного просмотра + высота элемента не помещается в высоту окна, а высота предварительного просмотра меньше высоты окна
			// случай 3: высота предварительного просмотра + высота элемента не помещается в высоту окна, а высота предварительного просмотра больше, чем высота окна
			var position = this.$item.data('offsetTop'),
				previewOffsetT = this.$previewEl.offset().top - scrollExtra,
				scrollVal = this.height + this.$item.data('height') + marginExpanded <= winsize.height ? position : this.height < winsize.height ? previewOffsetT - (winsize.height - this.height) : previewOffsetT;

			$body.animate({ scrollTop: scrollVal }, settings.speed);

		},
		setTransition: function () {
			this.$previewEl.css('transition', 'height ' + settings.speed + 'ms ' + settings.easing);
			this.$item.css('transition', 'height ' + settings.speed + 'ms ' + settings.easing);
		},
		getEl: function () {
			return this.$previewEl;
		}
	}

	return {
		init: init,
		addItems: addItems
	};

})();