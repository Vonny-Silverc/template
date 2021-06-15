
let filterSelectEl = document.getElementById('filter-id');
let items_el = document.getElementById('items-id');

filter_select_el.onchange = function() {
	let items = items_el.getElementsByClassName('item');

	for (let i=0; i<items.length; i++) {
		if (items[i].classList.contains(this.value)) {
			this.removeClass('_invisible');
		} else {
			this.addClass('_invisible');
		}
	}
};