$(document).ready(function () {
	$('.menu-burger').click(function (event) {
		$(this).toggleClass('active');
		$('.menu__body').toggleClass('active');
		$('.menu__link').toggleClass('active');
		$('.content__overlay').toggleClass('active');
		$('body').toggleClass('lock');
	});
	
	$(".menu__list").on("click", "a", function (event) {
		event.preventDefault();
		let id = $(this).attr('href'),
			top = $(id).offset().top;
		$('.menu__body, .menu__list, .menu-burger, .content__overlay').removeClass(' active');
		$('body').removeClass('lock');
		$('body,html').animate({ scrollTop: top }, 1500);
	});
});