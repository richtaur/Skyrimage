<?php

include '../../skyrimage.php';

$id = (int) $_GET['id'];
$output = $skyrimage->getRowById($id);

header('Content-type: application/json');
echo json_encode($output);
