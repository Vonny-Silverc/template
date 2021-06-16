
$(document).ready(function () {
	$(".filter-class__list").on("click", "a", function (event) {
		event.preventDefault();

		let cat = $(this).attr('href');

		$(".filter-class__button").each(function () {
			let workCat = $(this).attr('href');
			if (workCat != cat) {
				$(this).removeClass('active');
			} else {
				$(this).addClass('active');
			}
		})


		if (cat == 'all') {
			$(".class-item").removeClass('_invisible');

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