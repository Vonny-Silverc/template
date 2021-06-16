$(document).ready(function () {
	$('.icon-menu').click(function (event) {
		$(this).toggleClass('active');
		$('.header').toggleClass('active');
		$('.menu-left__body').toggleClass('active');
		$('.content').toggleClass('active');
		$('.overlay').toggleClass('active');
		$('body').toggleClass('lock');
	});

	$("menu-left__list").on("click", "a", function (event) {
		event.preventDefault();
		let id = $(this).attr('href'),
			top = $(id).offset().top;
		$('.menu-left__body, .menu-left__list, .menu-icon, .overlay').removeClass(' active');
		$('body').removeClass('lock');
		$('body,html').animate({ scrollTop: top }, 1500);
	});
});