$(function () {
	// ================== Плагин загрузки изображений =========================
	// https://github.com/desandro/imagesloaded автор

	// $('#my-container').imagesLoaded(myFunction)
	// выполняет обратный вызов, когда все изображения загружены.
	// необходимо, потому что .load() не работает с кешированными изображениями

	// функция обратного вызова получает коллекцию изображений в качестве аргумента
	// это контейнер

	// original: mit license. paul irish. 2010.
	// contributors: Oren Solomianik, David DeSandro, Yiannis Chatzikonstantinou

	$.fn.imagesLoaded = function (callback) {
		var $images = this.find('img'),
			len = $images.length,
			_this = this,
			blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

		function triggerCallback() {
			callback.call(_this, $images);
		}

		function imgLoaded() {
			if (--len <= 0 && this.src !== blank) {
				setTimeout(triggerCallback);
				$images.off('load error', imgLoaded);
			}
		}

		if (!len) {
			triggerCallback();
		}

		$images.on('load error', imgLoaded).each(function () {
			// кешированные изображения иногда не запускают загрузку, поэтому мы сбрасываем исходный код
			if (this.complete || this.complete === undefined) {
				var src = this.src;
				// взломать webkit от  http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
				// URI данных обходит предупреждение журнала webkit (спасибо, Дуг Джонс)
				this.src = blank;
				this.src = src;
			}
		});

		return this;
	};

	// gallery container
	var $rgGallery = $('#rg-gallery'),
		// контейнер карусели
		$esCarousel = $rgGallery.find('div.es-carousel-wrapper'),
		// элементы карусели
		$items = $esCarousel.find('ul > li'),
		// общее количество элементов
		itemsCount = $items.length;

	Gallery = (function () {
		// индекс текущего элемента
		var current = 0,
			// режим: carousel || fullview
			mode = 'carousel',
			// контролировать, загружается ли одно изображение
			anim = false,
			init = function () {

				// (не обязательно) предварительная загрузка изображений здесь ...
				$items.add('<img src="images/ajax-loader.gif"/><img src="images/black.png"/>').imagesLoaded(function () {
					// добавить параметры
					_addViewModes();

					// добавить обертку большого изображения
					_addImageWrapper();

					// показать первое изображение
					_showImage($items.eq(current));

				});

				// инициализировать карусель
				if (mode === 'carousel')
					_initCarousel();

			},
			_initCarousel = function () {

				// используем плагин elastislide:
				// http://tympanus.net/codrops/2011/09/12/elastislide-responsive-carousel/
				$esCarousel.show().elastislide({
					imageW: 65,
					onClick: function ($item) {
						if (anim) return false;
						anim = true;
						// при нажатии показать изображение
						_showImage($item);
						// изменить текущий
						current = $item.index();
					}
				});

				// установить ток elastislide на текущий
				$esCarousel.elastislide('setCurrent', current);

			},
			_addViewModes = function () {

				// верхние правые кнопки: скрыть / показать карусель

				var $viewfull = $('<a href="#" class="rg-view-full"></a>'),
					$viewthumbs = $('<a href="#" class="rg-view-thumbs rg-view-selected"></a>');

				$rgGallery.prepend($('<div class="rg-view"/>').append($viewfull).append($viewthumbs));

				$viewfull.on('click.rgGallery', function (event) {
					if (mode === 'carousel')
						$esCarousel.elastislide('destroy');
					$esCarousel.hide();
					$viewfull.addClass('rg-view-selected');
					$viewthumbs.removeClass('rg-view-selected');
					mode = 'fullview';
					return false;
				});

				$viewthumbs.on('click.rgGallery', function (event) {
					_initCarousel();
					$viewthumbs.addClass('rg-view-selected');
					$viewfull.removeClass('rg-view-selected');
					mode = 'carousel';
					return false;
				});

				if (mode === 'fullview')
					$viewfull.trigger('click');

			},
			_addImageWrapper = function () {

				// добавляет структуру для большого изображения и кнопок навигации (если общее количество элементов > 1)
				// также инициализирует события навигации

				$('#img-wrapper-tmpl').tmpl({ itemsCount: itemsCount }).appendTo($rgGallery);

				if (itemsCount > 1) {
					// добавить навигацию
					var $navPrev = $rgGallery.find('a.rg-image-nav-prev'),
						$navNext = $rgGallery.find('a.rg-image-nav-next'),
						$imgWrapper = $rgGallery.find('div.rg-image');

					$navPrev.on('click.rgGallery', function (event) {
						_navigate('left');
						return false;
					});

					$navNext.on('click.rgGallery', function (event) {
						_navigate('right');
						return false;
					});

					// добавить события Touchwipe в большую оболочку изображения
					$imgWrapper.touchwipe({
						wipeLeft: function () {
							_navigate('right');
						},
						wipeRight: function () {
							_navigate('left');
						},
						preventDefaultEvents: false
					});

					$(document).on('keyup.rgGallery', function (event) {
						if (event.keyCode == 39)
							_navigate('right');
						else if (event.keyCode == 37)
							_navigate('left');
					});

				}

			},
			_navigate = function (dir) {

				// перемещаться по большим изображениям

				if (anim) return false;
				anim = true;

				if (dir === 'right') {
					if (current + 1 >= itemsCount)
						current = 0;
					else
						++current;
				}
				else if (dir === 'left') {
					if (current - 1 < 0)
						current = itemsCount - 1;
					else
						--current;
				}

				_showImage($items.eq(current));

			},
			_showImage = function ($item) {

				// показывает большое изображение, связанное с $item

				var $loader = $rgGallery.find('div.rg-loading').show();

				$items.removeClass('selected');
				$item.addClass('selected');

				var $thumb = $item.find('img'),
					largesrc = $thumb.data('large'),
					title = $thumb.data('description');

				$('<img/>').load(function () {

					$rgGallery.find('div.rg-image').empty().append('<img src="' + largesrc + '"/>');

					if (title)
						$rgGallery.find('div.rg-caption').show().children('p').empty().text(title);

					$loader.hide();

					if (mode === 'carousel') {
						$esCarousel.elastislide('reload');
						$esCarousel.elastislide('setCurrent', current);
					}

					anim = false;

				}).attr('src', largesrc);

			},
			addItems = function ($new) {

				$esCarousel.find('ul').append($new);
				$items = $items.add($($new));
				itemsCount = $items.length;
				$esCarousel.elastislide('add', $new);

			};

		return {
			init: init,
			addItems: addItems
		};

	})();

	Gallery.init();

	/*
	Пример добавления дополнительных элементов в галерею:
	
	var $new  = $('<li><a href="#"><img src="images/thumbs/1.jpg" data-large="images/1.jpg" alt="image01" data-description="From off a hill whose concave womb reworded" /></a></li>');
	Gallery.addItems( $new );
	*/
});