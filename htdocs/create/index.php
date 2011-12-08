<?php

include '../../skyrimage.php';

$src = $_POST['src'];
$text = $_POST['text'];

if ($src && $text) {
	$row = $skyrimage->insertRow($src, $text);
	if ($row) {
		$output = (object) array(
			'message' => 'Row inserted',
			'row' => $row
		);
	} else {
		$output = (object) array(
			'message' => 'Sorry, unknown error'
		);
	}
} else {
	$output = (object) array(
		'error' => 'src and text are both required'
	);
}

header('Content-type: application/json');
echo json_encode($output);
