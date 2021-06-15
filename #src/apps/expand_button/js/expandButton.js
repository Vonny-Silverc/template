$(document).ready(function () {
	if ($('.class__name').find('.gallery-item').length > 8) {
		$('.class-hide').click(function () {
			$('.class__name:nth-child(n+9)').slideToggle('');
			$(this).toggleClass('opnd');
			if ($(this).hasClass('opnd')) {
				$(this).html('hide more work');
			}
			else { $(this).html('load more work'); }
		});
	} else { $('.class-hide').hide(); }
});