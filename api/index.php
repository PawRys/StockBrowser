<?php
header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Headers: *');

// echo '{"msg":"hello PHP! 😊"}';
// var_dump($_POST['data']);
// print_r($_POST);

$VAULT = './exchange_vault';
$FILES = scandir($VAULT);

for ($i = 2; $i < count($FILES); $i++) {
	$fileage = time() - filemtime("$VAULT/$FILES[$i]");
	if ($fileage > 120) {
		unlink("$VAULT/$FILES[$i]");
	}
}

if ($_POST['action'] == 'provide') {
	$data = json_decode($_POST['data'], true);
	$pinCode = $_POST['pin'];
	$fileToSaveTo = fopen("$VAULT/$pinCode.txt", 'w');
	// $hash = password_hash($_POST['password'], PASSWORD_BCRYPT);
	$hash = '$2y$10$NVT.pWG0PQWtV9KrsSfEHOHb0j3K.JoroXFGsq3n4B5p1ajMxWtLu';

	if (password_verify($_POST['password'], $hash)) {
		$msg = '{"message":"Hasło poprawne. Udostępniasz pełne dane. ✔"}';
	} else {
		$msg = '{"message":"Hasło niepoprawne. Udostępniasz okrojone dane. ✖"}';
		foreach ($data as $k => $v) {
			$data[$k]['pCub'] = 0;
		}
	}
	fwrite($fileToSaveTo, json_encode($data));
	fclose($fileToSaveTo);
	echo $msg;
}

if ($_POST['action'] == 'request') {
	$pinCode = $_POST['pin'];
	if (file_exists("$VAULT/$pinCode.txt")) {
		$data = file_get_contents("$VAULT/$pinCode.txt");
		$message = 'Pobrano dane z chmury ✔';
		echo '{"message":"📜 Pobrano dane z chmury ✔","data":' . $data . '}';
		unlink("$VAULT/$pinCode.txt");
	} else {
		echo '{"message":"Podany kod jest nieaktualny. ❌"}';
	}
}
