
//ACTIVE-----------------------------------------------------------------------
$('wrapper').addClass('loaded');
$('.menu__container').onclick(function (event) {
	$(this).toggleClass('active');
	$('.menu__body').toggleClass('active');
	$('.menu__list').toggleClass('active');
	$('.body').toggleClass('lock');
});

//scroll-----------------------------------------------------------------------
 $(document).ready(function(){
	 $(".menu__list").on("click","a", function (event) {
        event.preventDefault();
        var id  = $(this).attr('href'),
           top = $(id).offset().top;
		$('.menu__body, .menu__list, .menu__icon').removeClass(' active');
		$('body').removeClass('lock');
        $('body,html').animate({scrollTop: top}, 1500);
    });
});
//-----------------------------------------------------------------------------