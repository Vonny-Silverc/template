<?php
	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\Exception;

	require 'PHPMailer/src/Exception.php';
	require 'PHPMailer/src/PHPMailer.php';

	$mail = new PHPMailer(true);
	$mail->CharSer = 'UTF-8';
	$mail->setLanguage('ru', 'PHPMailer/language/');
	$mail->IsHTML(true);

	//От кого письмо
	$mail->setFrom('mysite@pochta.com', 'Легенда');
	//Кому отправлять
	$mail->addAddress('Vladislavabakumov994@gmail.com');
	//Тема письма
	$mail->Subject = 'Посетитель сайта хочет задать вам вопрос'

	//Тело письма
	$body = '<h1>Вам поступил вопрос с сайта</h1>';

	if(trim(!empty($_POST['name']))){
		$body.='<p><strong> Имя:</strong> '.$_POST['name'].'</p>';
	}
	if(trim(!empty($_POST['email']))){
		$body.='<p><strong> Email:</strong> '.$_POST['email'].'</p>';
	}
	if(trim(!empty($_POST['number']))){
		$body.='<p><strong> Ноиер:</strong> '.$_POST['number'].'</p>';
	}
	if(trim(!empty($_POST['message']))){
		$body.='<p><strong> Сообщение:</strong> '.$_POST['message'].'</p>';
	}

	$mail->Body = $body;

	//Отправляем
	if(!$email->send()) {
		$message = 'Ошибка';
	} else {
		$message = 'Данные отправлены!';
	}

	$response = ['message' => $message];

	header('Content-type: application/json');
	echo json_encode($response);
?>