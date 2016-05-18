<?php

ini_set('max_execution_time', 300);

$FEN = $_POST["FEN"];
$DIFFICULTY = $_POST["DIFFICULTY"];

$last_line = system('./geobot ' . '"' . $FEN . '" ' . $DIFFICULTY, $retval);

?>
