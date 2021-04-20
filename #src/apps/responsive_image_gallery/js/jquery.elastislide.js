(function (window, $, undefined) {

    // http://www.netcu.de/jquery-touchwipe-iphone-ipad-library
    $.fn.touchwipe = function (settings) {

        var config = {
            min_move_x: 20,
            min_move_y: 20,
            wipeLeft: function () { },
            wipeRight: function () { },
            wipeUp: function () { },
            wipeDown: function () { },
            preventDefaultEvents: true
        };

        if (settings) $.extend(config, settings);

        this.each(function () {
            var startX;
            var startY;
            var isMoving = false;

            function cancelTouch() {
                this.removeEventListener('touchmove', onTouchMove);
                startX = null;
                isMoving = false;
            }

            function onTouchMove(e) {
                if (config.preventDefaultEvents) {
                    e.preventDefault();
                }
                if (isMoving) {
                    var x = e.touches[0].pageX;
                    var y = e.touches[0].pageY;
                    var dx = startX - x;
                    var dy = startY - y;
                    if (Math.abs(dx) >= config.min_move_x) {
                        cancelTouch();
                        if (dx > 0) {
                            config.wipeLeft();
                        }
                        else {
                            config.wipeRight();
                        }
                    }
                    else if (Math.abs(dy) >= config.min_move_y) {
                        cancelTouch();
                        if (dy > 0) {
                            config.wipeDown();
                        }
                        else {
                            config.wipeUp();
                        }
                    }
                }
            }

            function onTouchStart(e) {
                if (e.touches.length == 1) {
                    startX = e.touches[0].pageX;
                    startY = e.touches[0].pageY;
                    isMoving = true;
                    this.addEventListener('touchmove', onTouchMove, false);
                }
            }
            if ('ontouchstart' in document.documentElement) {
                this.addEventListener('touchstart', onTouchStart, false);
            }
        });

        return this;
    };

    $.elastislide = function (options, element) {
        this.$el = $(element);
        this._init(options);
    };

    $.elastislide.defaults = {
        speed: 450,	// скорость анимации
        easing: '',	// эффект замедления анимации
        imageW: 190,	// ширина изображения
        margin: 3,	// внешний отступ изображения справа
        border: 2,	// граница изображения
        minItems: 1,	// минимальное количество отображаемых элементов.
        // когда мы изменяем размер окна, это гарантирует, что minItems всегда отображаются
        // (если, конечно, minItems больше, чем общее количество элементов)
        current: 0,	// индекс текущего элемента
        // когда мы изменяем размер окна, карусель будет следить за тем, чтобы этот элемент был виден
        onClick: function () { return false; } // обратный вызов элемента
    };

    $.elastislide.prototype = {
        _init: function (options) {

            this.options = $.extend(true, {}, $.elastislide.defaults, options);

            // <ul>
            this.$slider = this.$el.find('ul');

            // <li>
            this.$items = this.$slider.children('li');

            // общее количество элементов / изображений
            this.itemsCount = this.$items.length;

            // кэшировать родительский элемент <ul>, так как нам в конечном итоге потребуется пересчитать его ширину при изменении размера окна
            this.$esCarousel = this.$slider.parent();

            // проверить параметры
            this._validateOptions();

            // установить размеры и инициализировать несколько переменных ...
            this._configure();

            // добавить кнопки навигации
            this._addControls();

            // инициализировать события
            this._initEvents();

            // показать <ul>
            this.$slider.show();

            // переместиться в текущую позицию
            this._slideToCurrent(false);

        },
        _validateOptions: function () {

            if (this.options.speed < 0)
                this.options.speed = 450;
            if (this.options.margin < 0)
                this.options.margin = 4;
            if (this.options.border < 0)
                this.options.border = 1;
            if (this.options.minItems < 1 || this.options.minItems > this.itemsCount)
                this.options.minItems = 1;
            if (this.options.current > this.itemsCount - 1)
                this.options.current = 0;

        },
        _configure: function () {

            // индекс текущего элемента
            this.current = this.options.current;

            // ширина родительского элемента ul (div.es-carousel) - это "видимая" ширина
            this.visibleWidth = this.$esCarousel.width();

            // проверить, нужно ли нам изначально изменять размер элементов
            if (this.visibleWidth < this.options.minItems * (this.options.imageW + 2 * this.options.border) + (this.options.minItems - 1) * this.options.margin) {
                this._setDim((this.visibleWidth - (this.options.minItems - 1) * this.options.margin) / this.options.minItems);
                this._setCurrentValues();
                // сколько элементов соответствует текущей ширине
                this.fitCount = this.options.minItems;
            }
            else {
                this._setDim();
                this._setCurrentValues();
            }

            // установить ширину <ul>
            this.$slider.css({
                width: this.sliderW
            });

        },
        _setDim: function (elW) {

            // стили <li>
            this.$items.css({
                marginRight: this.options.margin,
                width: (elW) ? elW : this.options.imageW + 2 * this.options.border
            }).children('a').css({ // стили <a>
                borderWidth: this.options.border
            });

        },
        _setCurrentValues: function () {

            // общая площадь, занятая одним предметом
            this.itemW = this.$items.outerWidth(true);

            // общая ширина слайдера / <ul>
            // это в конечном итоге изменится при изменении размера окна
            this.sliderW = this.itemW * this.itemsCount;

            // ширина родительского элемента ul (div.es-carousel) - это "видимая" ширина
            this.visibleWidth = this.$esCarousel.width();

            // сколько элементов соответствует текущей ширине
            this.fitCount = Math.floor(this.visibleWidth / this.itemW);

        },
        _addControls: function () {

            this.$navNext = $('<span class="es-nav-next">Next</span>');
            this.$navPrev = $('<span class="es-nav-prev">Previous</span>');
            $('<div class="es-nav"/>')
                .append(this.$navPrev)
                .append(this.$navNext)
                .appendTo(this.$el);

            //this._toggleControls();

        },
        _toggleControls: function (dir, status) {

            // показать / скрыть кнопки навигации
            if (dir && status) {
                if (status === 1)
                    (dir === 'right') ? this.$navNext.show() : this.$navPrev.show();
                else
                    (dir === 'right') ? this.$navNext.hide() : this.$navPrev.hide();
            }
            else if (this.current === this.itemsCount - 1 || this.fitCount >= this.itemsCount)
                this.$navNext.hide();

        },
        _initEvents: function () {

            var instance = this;

            // изменение размера окна
            $(window).on('resize.elastislide', function (event) {

                instance._reload();

                // перейти к текущему элементу
                clearTimeout(instance.resetTimeout);
                instance.resetTimeout = setTimeout(function () {
                    instance._slideToCurrent();
                }, 200);

            });

            // события кнопок навигации
            this.$navNext.on('click.elastislide', function (event) {
                instance._slide('right');
            });

            this.$navPrev.on('click.elastislide', function (event) {
                instance._slide('left');
            });

            // событие нажатия элемента
            this.$slider.on('click.elastislide', 'li', function (event) {
                instance.options.onClick($(this));
                return false;
            });

            // сенсорные события
            instance.$slider.touchwipe({
                wipeLeft: function () {
                    instance._slide('right');
                },
                wipeRight: function () {
                    instance._slide('left');
                }
            });

        },
        reload: function (callback) {
            this._reload();
            if (callback) callback.call();

        },
        _reload: function () {

            var instance = this;

            // снова установить значения
            instance._setCurrentValues();

            // нужно изменить размер элементов
            if (instance.visibleWidth < instance.options.minItems * (instance.options.imageW + 2 * instance.options.border) + (instance.options.minItems - 1) * instance.options.margin) {
                instance._setDim((instance.visibleWidth - (instance.options.minItems - 1) * instance.options.margin) / instance.options.minItems);
                instance._setCurrentValues();
                instance.fitCount = instance.options.minItems;
            }
            else {
                instance._setDim();
                instance._setCurrentValues();
            }

            instance.$slider.css({
                width: instance.sliderW + 10 // TODO: +10px seems to solve a firefox "bug" :S
            });

        },
        _slide: function (dir, val, anim, callback) {

            // if animating return
            //if( this.$slider.is(':animated') )
            //return false;

            // текущий внешний отступ слева
            var ml = parseFloat(this.$slider.css('margin-left'));

            // значение просто передается, когда нам нужно точное значение для оставшегося поля (используется в _slideToCurrent function)
            if (val === undefined) {

                // how much to slide?
                var amount = this.fitCount * this.itemW, val;

                if (amount < 0) return false;

                // не оставляйте пробел между последним элементом / первым элементом и концом / началом доступной ширины ползунка
                if (dir === 'right' && this.sliderW - (Math.abs(ml) + amount) < this.visibleWidth) {
                    amount = this.sliderW - (Math.abs(ml) + this.visibleWidth) - this.options.margin; // уменьшить внешний отступ слева
                    // показать / скрыть кнопки навигации
                    this._toggleControls('right', -1);
                    this._toggleControls('left', 1);
                }
                else if (dir === 'left' && Math.abs(ml) - amount < 0) {
                    amount = Math.abs(ml);
                    // показать / скрыть кнопки навигации
                    this._toggleControls('left', -1);
                    this._toggleControls('right', 1);
                }
                else {
                    var fml; // оставшийся будущаий внешний отступ
                    (dir === 'right')
                        ? fml = Math.abs(ml) + this.options.margin + Math.abs(amount)
                        : fml = Math.abs(ml) - this.options.margin - Math.abs(amount);

                    // показать / скрыть кнопки навигации
                    if (fml > 0)
                        this._toggleControls('left', 1);
                    else
                        this._toggleControls('left', -1);

                    if (fml < this.sliderW - this.visibleWidth)
                        this._toggleControls('right', 1);
                    else
                        this._toggleControls('right', -1);

                }

                (dir === 'right') ? val = '-=' + amount : val = '+=' + amount

            }
            else {
                var fml = Math.abs(val); // будующий внешний левый отступ

                if (Math.max(this.sliderW, this.visibleWidth) - fml < this.visibleWidth) {
                    val = - (Math.max(this.sliderW, this.visibleWidth) - this.visibleWidth);
                    if (val !== 0)
                        val += this.options.margin;	// уменьшите поле слева, если не на первой позиции

                    // показать / скрыть кнопки навигации
                    this._toggleControls('right', -1);
                    fml = Math.abs(val);
                }

                // показать / скрыть кнопки навигации
                if (fml > 0)
                    this._toggleControls('left', 1);
                else
                    this._toggleControls('left', -1);

                if (Math.max(this.sliderW, this.visibleWidth) - this.visibleWidth > fml + this.options.margin)
                    this._toggleControls('right', 1);
                else
                    this._toggleControls('right', -1);

            }

            $.fn.applyStyle = (anim === undefined) ? $.fn.animate : $.fn.css;

            var sliderCSS = { marginLeft: val };

            var instance = this;

            this.$slider.stop().applyStyle(sliderCSS, $.extend(true, [], {
                duration: this.options.speed, easing: this.options.easing, complete: function () {
                    if (callback) callback.call();
                }
            }));

        },
        _slideToCurrent: function (anim) {

            // сколько слайдов сделать?
            var amount = this.current * this.itemW;
            this._slide('', -amount, anim);

        },
        add: function ($newelems, callback) {

            // добавляет новые элементы в карусель
            this.$items = this.$items.add($newelems);
            this.itemsCount = this.$items.length;
            this._setDim();
            this._setCurrentValues();
            this.$slider.css({
                width: this.sliderW
            });
            this._slideToCurrent();

            if (callback) callback.call($newelems);

        },
        setCurrent: function (idx, callback) {

            this.current = idx;

            var ml = Math.abs(parseFloat(this.$slider.css('margin-left'))),
                posR = ml + this.visibleWidth,
                fml = Math.abs(this.current * this.itemW);

            if (fml + this.itemW > posR || fml < ml) {
                this._slideToCurrent();
            }

            if (callback) callback.call();

        },
        destroy: function (callback) {

            this._destroy(callback);

        },
        _destroy: function (callback) {
            this.$el.off('.elastislide').removeData('elastislide');
            $(window).off('.elastislide');
            if (callback) callback.call();
        }
    };

    var logError = function (message) {
        if (this.console) {
            console.error(message);
        }
    };

    $.fn.elastislide = function (options) {
        if (typeof options === 'string') {
            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function () {
                var instance = $.data(this, 'elastislide');
                if (!instance) {
                    logError("cannot call methods on elastislide prior to initialization; " +
                        "attempted to call method '" + options + "'");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for elastislide instance");
                    return;
                }
                instance[options].apply(instance, args);
            });
        }
        else {
            this.each(function () {
                var instance = $.data(this, 'elastislide');
                if (!instance) {
                    $.data(this, 'elastislide', new $.elastislide(options, this));
                }
            });
        }
        return this;
    };

})(window, jQuery);