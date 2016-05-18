
// 1 - based
function getSquareId(row, col) {
	var c1 = "A".charCodeAt(0) + col - 1;
	var c2 = "1".charCodeAt(0) + row - 1;
	var ret = String.fromCharCode(c1, c2);
	return ret;
}

function getPieceNotation(piece) {
	var ret = new String();
	var pieceType = getPieceType(piece);
	if(pieceType == PieceType.KING)
		ret = "k";
	if(pieceType == PieceType.QUEEN)
		ret = "q";
	if(pieceType == PieceType.ROOK)
		ret = "r";
	if(pieceType == PieceType.BISHOP)
		ret = "b";
	if(pieceType == PieceType.KNIGHT)
		ret = "n";
	if(pieceType == PieceType.PAWN)
		ret = "p";
	
	if(getPieceColor(piece) == Color.WHITE)
		ret = ret.toUpperCase();

	return ret;
}

function getPieceTypeFromNotation(pieceNotation) {
	if(pieceNotation.toLowerCase() === "k")
		return PieceType.KING;
	if(pieceNotation.toLowerCase() === "q")
		return PieceType.QUEEN;
	if(pieceNotation.toLowerCase() === "r")
		return PieceType.ROOK;
	if(pieceNotation.toLowerCase() === "b")
		return PieceType.BISHOP;
	if(pieceNotation.toLowerCase() === "n")
		return PieceType.KNIGHT;
	if(pieceNotation.toLowerCase() === "p")
		return PieceType.PAWN;

	return PieceType.UNDEFINED;
}

function getPieceColorFromNotation(colorNotation) {
	if(colorNotation === 'w')
		return Color.WHITE;
	if(colorNotation === 'b')
		return Color.BLACK;
	return Color.UNDEFINED;
}

function getNotationFromPieceColor(pieceColor) {
	if(pieceColor == Color.WHITE)
		return "w";
	if(pieceColor == Color.BLACK)
		return "b";
	return "_";
}

function getDifficultyFromNotation(difficulty) {
	if(difficulty == "EASY")
		return 0;
	if(difficulty == "MEDIUM")
		return 1;
	if(difficulty == "HARD")
		return 2;
	alert("Error at difficulty! \"" + difficulty + "\" is not a valid one!");
}

function positionToFEN() {
	var ret = "";
	var num = 0;
	for(var i = 8; i >= 1; i--) {
		for(var j = 1; j <= 8; j++) {
			num = 0;
			while(j <= 8 && squareIsEmpty(i, j)) {
				num++;
				j++;
			}
			if(num > 0) {
				ret += num;
				j--;
			}
			else
				ret += getPieceNotation($("#" + pidInSquare[getSquareId(i, j)]));
		}
		if(i > 1)
			ret += "/";
	}

	// to move
	ret += " " + getNotationFromPieceColor(turn);

	// castling rights
	var castle = new String("");
	if(!hasMoved[king[Color.WHITE].attr("id")]) {
		if(!squareIsEmpty(1, 8) && !hasMoved[pidInSquare[getSquareId(1, 8)]]
		&& getPieceType($("#" + pidInSquare[getSquareId(1, 8)])) == PieceType.ROOK
		&& getPieceColor($("#" + pidInSquare[getSquareId(1, 8)])) == Color.WHITE)
			castle += "K";

		if(!squareIsEmpty(1, 1) && !hasMoved[pidInSquare[getSquareId(1, 1)]]
		&& getPieceType($("#" + pidInSquare[getSquareId(1, 1)])) == PieceType.ROOK
		&& getPieceColor($("#" + pidInSquare[getSquareId(1, 1)])) == Color.WHITE)
			castle += "Q";
	}

	if(!hasMoved[king[Color.BLACK].attr("id")]) {
		if(!squareIsEmpty(8, 8) && !hasMoved[pidInSquare[getSquareId(8, 8)]]
		&& getPieceType($("#" + pidInSquare[getSquareId(8, 8)])) == PieceType.ROOK
		&& getPieceColor($("#" + pidInSquare[getSquareId(8, 8)])) == Color.BLACK)
			castle += "k";

		if(!squareIsEmpty(8, 1) && !hasMoved[pidInSquare[getSquareId(8, 1)]]
		&& getPieceType($("#" + pidInSquare[getSquareId(8, 1)])) == PieceType.ROOK
		&& getPieceColor($("#" + pidInSquare[getSquareId(8, 1)])) == Color.BLACK)
			castle += "q";
	}

	if(castle.length == 0)
		ret += " -";
	else
		ret += " " + castle;

	// en-passant
	if(epRow != -1)
		ret += " " + getSquareId(epRow, epCol).toLowerCase();
	else
		ret += " -";

	// halfmove clock
	ret += " " + halfMoveClock;
	
	// move number
	ret += " " + moveNumber;
	
	//alert(ret);

	return ret;
}

function makeAIMove() {
	var crt = positionToFEN();
	var difficulty;
	if(turn == Color.WHITE)
		difficulty = getDifficultyFromNotation(CHOSEN_difficultyWhite);
	else
		difficulty = getDifficultyFromNotation(CHOSEN_difficultyBlack);
	
	if(forceNotRep[turn]) {
		difficulty++;
		forceNotRep[turn] = false;
		//alert("forced");
	}
	
	//alert(crt);
	$.post("ai/ai_move.php", 
	{
		FEN : crt,
		DIFFICULTY : difficulty
	},
	function(data, status) {
		if(status == "success") {
			handleMove(data);
		}
		else
			alert("ERROR!");
	});
}

function handleMove(move) {
	//alert(move);
	
	if(move.length < 4 || move.length > 10)
		alert("Move returned \"" + move + "\" is probably wrong!");
	
	var firstId = move.substr(0, 2);
	var secondId = move.substr(3, 2);
	var promotion = null;
	
	if(move.length > 7) {
		var promotion = move.substr(6, 1);
		//alert("\"" + promotion + "\"");
		promotionTo = getPieceTypeFromNotation(promotion);
		//alert(promotionTo);
	}
	
	lastMove = firstId + " " + secondId;
	if(promotion != null)
		lastMove += " =" + promotion;
	
	//alert(firstId);
	//alert(secondId);
	var pieceId = pidInSquare[firstId];
	//alert($("#" + pieceId).attr("id"));
	//alert(firstId);
	//alert(secondId);
	
	//alert("Make COMPUTER move : " + new Date().getSeconds());
	$(document).ready( function() {
		//alert("Moving piece (for COMPUTER): " + move);
		moveToSquare($("#" + pieceId), $("#" + secondId), Animate.YES, RealMove.YES);
	});
}