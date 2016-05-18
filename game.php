<?php
	if(!isset($_POST['WHITE'])) $_POST['WHITE'] = 'error';
	if(!isset($_POST['BLACK'])) $_POST['BLACK'] = 'error';
	if(!isset($_POST['PLAYER_COLOR'])) $_POST['PLAYER_COLOR'] = 'error';
	if(!isset($_POST['DIFFICULTY_WHITE'])) $_POST['DIFFICULTY_WHITE'] = 'error';
	if(!isset($_POST['DIFFICULTY_BLACK'])) $_POST['DIFFICULTY_BLACK'] = 'error';
	
	echo '<div style="visibility:hidden">' . $_POST['WHITE'] . '</div>';
	echo '<div style="visibility:hidden">' . $_POST['BLACK'] . '</div>';
	echo '<div style="visibility:hidden">' . $_POST['PLAYER_COLOR'] . '</div>';
	echo '<div style="visibility:hidden">' . $_POST['DIFFICULTY_WHITE'] . '</div>';
	echo '<div style="visibility:hidden">' . $_POST['DIFFICULTY_BLACK'] . '</div>';
?>

<html>
<head>

<link rel="stylesheet" type="text/css" href="gui.css"/>

<script src="scripts/jquery-1.8.3.min.js"></script>
<script src="scripts/jquery.ui.core.js"></script>
<script src="scripts/jquery.ui.widget.js"></script>
<script src="scripts/jquery.ui.mouse.js"></script>
<script src="scripts/jquery.ui.draggable.js"></script>
<script src="scripts/jquery.ui.droppable.js"></script>
<script src="scripts/global.js"></script>
<script src="scripts/transfer.js"></script>
<script src="scripts/logic.js"></script>
<script src="scripts/dynamics.js"></script>
<script src="scripts/transfer.js"></script>
</head>

<body>

<script>
	warnAtUnload = false;
    CHOSEN_whitePlayerType = "<?php echo $_POST['WHITE']; ?>";
	CHOSEN_blackPlayerType = "<?php echo $_POST['BLACK']; ?>";
	CHOSEN_playerColor = "<?php echo $_POST['PLAYER_COLOR']; ?>";
	CHOSEN_difficultyWhite = "<?php echo $_POST['DIFFICULTY_WHITE']; ?>";
	CHOSEN_difficultyBlack = "<?php echo $_POST['DIFFICULTY_BLACK']; ?>";
	
	if(CHOSEN_whitePlayerType == "error" || CHOSEN_blackPlayerType == "error"
	|| CHOSEN_playerColor == "error" || CHOSEN_difficultyWhite == "error"
	|| CHOSEN_difficultyBlack == "error")
		window.location.replace(".");
	else
		warnAtUnload = true;
</script>

<!--
<button id="getfen">GET FEN</button>
<button id="loadfen">LOAD FEN</button>
-->

<script>
init();

/*
$(document).ready( function() {
	$("#getfen").click( function() {
		prompt("FEN:", positionToFEN());
		return false;
	});
	$("#loadfen").click( function() {
		var FEN = prompt("FEN:");
		loadFEN(FEN);
	});
});
*/
</script>

</body>
</html>