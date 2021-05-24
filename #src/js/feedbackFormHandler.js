"use strict"

document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('contact__form');
	form.addEventListener('submit', formSend);

	async function formSend(e) {
		e.preventDefault();

		let error = formValidate(form);

		let formData = new FormData(form);

		if (error === 0) {

			let response = await fetch('sendmail.php', {
				method: 'POST',
				body: formData
			});
			if (response.ok) {
				form.classList.add('_sending');
				let result = await response.json();
				alert(result.message);
				form.reser();
				form.classList.remove('_sending');

			} else {
				alert("Ошибка!");
				form.classList.remove('_sending');
			}
		} else {
			alert('Обязательные поля не заполнены или заполнены с ошибками');
		}
	}

	function formValidate(form) {
		let error = 0;
		let formReq = document.querySelectorAll('._req');

		for (let index = 0; index < formReq.length; index++) {
			const input = formReq[index];
			formRemoveError(input);

			if (input.classList.contains('_name')) {
				if (nameTest(input)) {
					formAddError(input);
					alert("Введенное имя некорректно. Допустимы только латинские и русские буквы, а так же символ пробел и дифис.");
					error++;
				}
			} else if (input.classList.contains('_email')) {
				if (emailTest(input)) {
					formAddError(input);
					alert("Введенный почтовый адресс некорректен. Пожалуйста убедитесь, что в адресе есть '@' и '.'.");
					error++;
				}

			} else if (input.classList.contains('_number')) {
				if (numberTest(input)) {
					formAddError(input);
					alert("Введенный номер телефона некорректен. Пожалуйста убедитесь в том, что номер записан верно");
					error++;
				}
			} else if (input.getAttribute("type") === "checkbox" && input.checked === false) {
				formAddError(input);
				alert("Для отправки необходимо поставить галочку согласия с обработкой персональных данных");
				error++;
			} else {
				if (input.value === '') {
					formAddError(input);
					alert("Все поля должны быть заполненны");
					error++;
				}
			}
		}

		return error;
	}

	function formAddError(input) {
		input.parentElement.classList.add('_error');
		input.classList.add('_error');
	}

	function formRemoveError(input) {
		input.parentElement.classList.remove('_error');
		input.classList.remove('_error');
	}

	//функция теста name
	function nameTest(input) {
		return !/^[a-zA-Zа-яА-ЯёЁ'][a-zA-Z-а-яА-ЯёЁ' ]+[a-zA-Zа-яА-ЯёЁ']?$/.test(input.value)
	}
	//функция теста email
	function emailTest(input) {
		return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
	}
	//функция теста number
	function numberTest(input) {
		return !/^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(input.value);
	}
});