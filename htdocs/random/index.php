<?php

include '../../skyrimage.php';

$output = $skyrimage->getRandomRows();

header('Content-type: application/json');
echo json_encode($output);
