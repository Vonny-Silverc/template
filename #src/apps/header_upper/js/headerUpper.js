$(document).ready(function () {
	$('.menu-burger').click(function (event) {
		$(this).toggleClass('active');
		$('.menu-upper__body').toggleClass('active');
		$('.menu-upper__link').toggleClass('active');
		$('.overlay').toggleClass('active');
		$('body').toggleClass('lock');
	});
	
	$(".menu-upper__list").on("click", "a", function (event) {
		event.preventDefault();
		let id = $(this).attr('href'),
			top = $(id).offset().top;
		$('.menu-upper__body, .menu-upper__list, .menu-burger, .overlay').removeClass(' active');
		$('body').removeClass('lock');
		$('body,html').animate({ scrollTop: top }, 1500);
	});
});