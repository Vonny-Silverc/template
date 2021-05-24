
//ACTIVE-----------------------------------------------------------------------
$('wrapper').addClass('loaded');
$('.icon-menu').click(function (event) {
	$(this).toggleClass('active');
	$('.menu__body').toggleClass('active');
	$('.menu__link').toggleClass('active');
	//$('.overlay').toggleClass('active');
	$('body').toggleClass('lock');
});

//scroll and filter-----------------------------------------------------------
$(document).ready(function () {
	$(".menu__list").on("click", "a", function (event) {
		event.preventDefault();
		var id = $(this).attr('href'),
			top = $(id).offset().top;
		$('.menu__body, .menu__list, .menu__icon, .content__overlay').removeClass(' active');
		$('body').removeClass('lock');
		$('body,html').animate({ scrollTop: top }, 1500);
	});

	$(".menu-filter__list").on("click", "a", function (event) {
		event.preventDefault();

		let cat = $(this).attr('href');

		$(".menu-filtero__button").each(function () {
			let workCat = $(this).attr('href');
			if (workCat != cat) {
				$(this).removeClass('active');
			} else {
				$(this).addClass('active');
			}
		})


		if (cat == 'all') {
			$(".gallery-item").removeClass('_invisible');

		} else {
			$("[data-cat]").each(function () {
				let workCat = $(this).data('cat');

				if (workCat != cat) {
					$(this).addClass('_invisible');
				} else {
					$(this).removeClass('_invisible');
				}
			});
		}
	});
});
//-----------------------------------------------------------------------------