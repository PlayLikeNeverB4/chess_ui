// This file contains functions to use in the GUI of the web application

// how much to adjust the height of the piece (to place it exactly on the middle of the square)
function getAdjHeight(element) {
	if(element.hasClass('king'))
		return 0;
	if(element.hasClass('queen'))
		return 0;
	if(element.hasClass('rook'))
		return 2;
	if(element.hasClass('knight'))
		return 0;
	if(element.hasClass('bishop'))
		return 0;
	if(element.hasClass('pawn'))
		return 2;
	return 50;
}

function getAdjWidth(element) {
	if(element.hasClass('king'))
		return 0;
	if(element.hasClass('queen'))
		return 0;
	if(element.hasClass('rook'))
		return 1;
	if(element.hasClass('knight'))
		return 0;
	if(element.hasClass('bishop'))
		return 0;
	if(element.hasClass('pawn'))
		return 0;
	return 50;
}

function getPieceRow(piece) {
	return sidOfPiece[piece.attr("id")].charCodeAt(1) - "1".charCodeAt(0) + 1;
}

function getPieceCol(piece) {
	return sidOfPiece[piece.attr("id")].charCodeAt(0) - "A".charCodeAt(0) + 1;
}

function getSquareRow(square) {
	return square.attr("id").charCodeAt(1) - "1".charCodeAt(0) + 1;
}

function getSquareCol(square) {
	return square.attr("id").charCodeAt(0) - "A".charCodeAt(0) + 1;
}

function getPieceColor(piece) {
	if(piece.hasClass('white'))
		return Color.WHITE;
	if(piece.hasClass('black'))
		return Color.BLACK;
	return Color.UNDEFINED;
}

function getPieceType(piece) {
	if(piece.hasClass('king')) return PieceType.KING;
	if(piece.hasClass('queen')) return PieceType.QUEEN;
	if(piece.hasClass('rook')) return PieceType.ROOK;
	if(piece.hasClass('bishop')) return PieceType.BISHOP;
	if(piece.hasClass('knight')) return PieceType.KNIGHT;
	if(piece.hasClass('pawn')) return PieceType.PAWN;
	return PieceType.UNDEFINED;
}


function getPieceTypeNormalName(pieceType) {
	if(pieceType == PieceType.KING) return "king";
	if(pieceType == PieceType.QUEEN) return "queen";
	if(pieceType == PieceType.ROOK) return "rook";
	if(pieceType == PieceType.BISHOP) return "bishop";
	if(pieceType == PieceType.KNIGHT) return "knight";
	if(pieceType == PieceType.PAWN) return "pawn";
	return "undefined";
}

function getPieceColorNormalName(color) {
	if(color == Color.WHITE)
		return "white";
	if(color == Color.BLACK)
		return "black";
	return "undefined";
}

function squareIsEmpty(row, col) {
	if(row < 1 || row > 8 || col < 1 || col > 8) alert("WRONG SQUARE COORDINATES!");
	return pidInSquare[getSquareId(row, col)].length == 0;
}

function getFENFirstPart() {
	var FEN = positionToFEN();
	var p = 0;
	while(FEN[p] != ' ')
		p++;
	
	return FEN.substr(0, p);
}

// move the element to the target square
// element, target - objects from a jquery query
// animate - Animate.YES or Animate.NO
// real - RealMove.YES or RealMove.NO
function moveToSquare(element, target, animate, real) {
	var targetSid = target.attr("id");
	var eId = element.attr("id");
	var oldSid = sidOfPiece[eId];
	var isDifferentSquare = targetSid != oldSid;
	
	var pRow = getPieceRow(element);
	var pCol = getPieceCol(element);
	var sqRow = getSquareRow(target);
	var sqCol = getSquareCol(target);
	var advDir = getPieceColor(element) == Color.WHITE ? 1 : -1;
	
	var toggle = false;
	if(real == RealMove.YES && isDifferentSquare && animate == Animate.NO) {
		toggle = true;
		//alert("toggle set to true");
	}
	
	// capture if the square is occupied
	if(pidInSquare[targetSid].length > 0 && isDifferentSquare) {
		lastCapturedPiece = $("#" + pidInSquare[targetSid]);
		
		if(animate == Animate.NO) {
			lastCapturedPiece.remove();
			delete lastCapturedPiece;
			lastCapturedPiece = null;
		}
		else toggle = false;
	}
	
	// if it's a castling move, move the rook too
	if(getPieceType(element) == PieceType.KING && Math.abs(pCol - sqCol) == 2) {
		var dj = getRelativeDirections(element, sqRow, sqCol)[1];
		var rookCol = dj == 1 ? 8 : 1;
		
		moveToSquare($("#" + pidInSquare[getSquareId(pRow, rookCol)]), $("#" + getSquareId(pRow, pCol + dj)),
						animate, RealMove.NO);
	}
	
	// if it's an en-passant move, capture the pawn
	if(getPieceType(element) == PieceType.PAWN && pCol != sqCol && squareIsEmpty(sqRow, sqCol)) {
		var otherPawn = $("#" + pidInSquare[getSquareId(pRow, epCol)]);
		lastCapturedPiece = otherPawn;
		if(animate == Animate.NO) {
			lastCapturedPiece.remove();
			delete lastCapturedPiece;
			lastCapturedPiece = null;
		}
		else toggle = false;
		pidInSquare[getSquareId(pRow, epCol)] = "";
	}
	
	if(isDifferentSquare && real == RealMove.YES) {
		// update en-passant square (if it's a double advance)
		epRow = epCol = -1;
		if(getPieceType(element) == PieceType.PAWN && pCol == sqCol && pRow + 2 * advDir == sqRow) {
			epRow = pRow + advDir;
			epCol = pCol;
		}
	}
	
	// update half-move clock
	if(real == RealMove.YES) {
		if(getPieceType(element) == PieceType.PAWN || !squareIsEmpty(sqRow, sqCol))
			halfMoveClock = 0;
		else
			halfMoveClock++;
	}
	
	// update move number
	if(real == RealMove.YES && isDifferentSquare && getPieceColor(element) == Color.BLACK)
		moveNumber++;
	
	if(animate == Animate.NO) {
		var targetTop = target.offset().top;
		var targetLeft = target.offset().left;
		var targetWidth = target.width();
		var targetHeight = target.height();
		var elemWidth = element.width();
		var elemHeight = element.height();
		var adjWidth = getAdjWidth(element);
		var adjHeight = getAdjHeight(element);
		
		element.offset({
			top : targetTop + targetHeight / 2.0 - elemHeight / 2.0 + adjHeight,
			left : targetLeft + targetWidth / 2.0 - elemWidth / 2.0 + adjWidth
		});
		
		if(isDifferentSquare && real == RealMove.YES)
			lastMove = getSquareId(pRow, pCol) + " " + getSquareId(sqRow, sqCol);
	}
	else if(animate == Animate.YES) {
		var currentSid = sidOfPiece[element.attr("id")];
		var currentSquare = $("#" + currentSid);
		var elemTop = currentSquare.offset().top;
		var elemLeft = currentSquare.offset().left;
		var targetTop = target.offset().top;
		var targetLeft = target.offset().left;
		
		var relHeight = targetTop - elemTop;
		var relWidth = targetLeft - elemLeft;
		
		//alert("left " + (relWidth >= 0 ? "+" : "-") + "=" + Math.abs(relWidth));
		//alert("top " + (relHeight >= 0 ? "+" : "-") + "=" + Math.abs(relHeight));
		
		//alert("Top: " + element.offset().top + "\nLeft: " + element.offset().left);
		
		// make sure the pawn will be removed
		// so treat it like a "captured" piece
		
		var promotionRow = (getPieceColor(element) == Color.WHITE ? 8 : 1);
		if(sqRow == promotionRow && getPieceType(element) == PieceType.PAWN) {
			promotedPawn = element;
			//alert("setting lastC... = " + lastCapturedPiece);
		}
		//alert("set lastC... = " + lastCapturedPiece);
		
		$(element).css("z-index", crtZIndex++);
		$(element).animate( {
			left: (relWidth >= 0 ? "+" : "-") + "=" + Math.abs(relWidth),
			top: (relHeight >= 0 ? "+" : "-") + "=" + Math.abs(relHeight)
		}, function() {
			//alert("Animation callback");
			//alert(lastCapturedPiece);
			if(lastCapturedPiece != null) {
				lastCapturedPiece.remove();
				delete lastCapturedPiece;
				lastCapturedPiece = null;
				canToggle = true;
			}
			
			// promotion for COMPUTERs
			if(promotionTo != null) {
				//alert("Creating new piece");
				promotedPawn.remove();
				delete promotedPawn;
				promotedPawn = null;
				
				promoting = true;
				createPiece(promotionTo, getPieceColor(element), targetSid);
				
				// check if the new peace gives check
				givingCheck = piecesGivingCheck();
			}
			else canToggle = true;
		});
	}
	
	// selection
	if(real == RealMove.YES && isDifferentSquare) {
		var currentSid = sidOfPiece[element.attr("id")];
	
		// remove all previous
		$(".square").removeClass("selectedFrom");
		$(".square").removeClass("selectedTo");
		
		// add new
		$("#" + currentSid).addClass("selectedFrom");
		$("#" + targetSid).addClass("selectedTo");
	}
	
	sidOfPiece[eId] = targetSid;
	pidInSquare[targetSid] = eId;
	if(isDifferentSquare)
		pidInSquare[oldSid] = "";
	
 	if(isDifferentSquare && real == RealMove.YES) {
		hasMoved[element.attr("id")] = true;
		
		// check if it's a promotion (for humans)
		var promotionRow = (getPieceColor(element) == Color.WHITE ? 8 : 1);
		if(sqRow == promotionRow && getPieceType(element) == PieceType.PAWN) {
			canToggle = false;
			promoting = true;
			if(playerType[getPieceColor(element)] == PlayerType.HUMAN)
				promotionPopup(sqRow, sqCol);
		}
		else canToggle = toggle;
		
		//alert("1 " + canToggle);
	}
	//alert("final " + canToggle);
}


function correctPlacement(element) {
	alert("Should not be used!");
	var target = $("#" + sidOfPiece[element.attr("id")]);
	var targetTop = target.offset().top;
	var targetLeft = target.offset().left;
	var targetWidth = target.width();
	var targetHeight = target.height();
	var elemWidth = element.width();
	var elemHeight = element.height();
	var adjWidth = getAdjWidth(element);
	var adjHeight = getAdjHeight(element);
	
	//alert("top: " + targetTop);
	//alert("left: " + targetLeft);
	
	if(Math.abs(element.offset().top - targetTop + targetHeight / 2.0 - elemHeight / 2.0 + adjHeight) > 50
	|| Math.abs(element.offset().left - targetLeft + targetWidth / 2.0 - elemWidth / 2.0 + adjWidth) > 50) {
		element.offset({
			top : targetTop + targetHeight / 2.0 - elemHeight / 2.0 + adjHeight,
			left : targetLeft + targetWidth / 2.0 - elemWidth / 2.0 + adjWidth
		});
	}
	
	//alert("done");
}

function makePieceDraggable(pieceId) {
	$("#" + pieceId).draggable( {
		containment: "#board",
		revert : "invalid",
		revertDuration : 100,
		start : function(event, ui) {
			$(this).css("z-index", crtZIndex++);
		},
		stop : function(event, ui) {
			$(".square").removeClass("reachable");
		}
	}).mousedown( function() {
		for(var i = 1; i <= 8; i++)
			for(var j = 1; j <= 8; j++)
				if(getPieceRow($(this)) != i || getPieceCol($(this)) != j) {
					if(pieceCanMoveToSquare($(this), i, j)
					&& playerType[getPieceColor($(this))] == PlayerType.HUMAN) {
						//$("#" + getSquareId(i, j)).addClass("reachable");
						$("#" + getSquareId(i, j)).droppable("option", "disabled", false);
						console.log(getSquareId(i, j));
					}
					else {
						$("#" + getSquareId(i, j)).droppable("option", "disabled", true);
					}
				}
	}).mouseup( function() {
		for(var i = 1; i <= 8; i++)
			for(var j = 1; j <= 8; j++)
				if(getPieceRow($(this)) != i || getPieceCol($(this)) != j) {
					if(pieceCanMoveToSquare($(this), i, j)
					&& playerType[getPieceColor($(this))] == PlayerType.HUMAN) {
						//$("#" + getSquareId(i, j)).addClass("reachable");
						$("#" + getSquareId(i, j)).droppable("option", "disabled", false);
					}
					else {
						$("#" + getSquareId(i, j)).droppable("option", "disabled", true);
					}
				}
		
		$(".square").removeClass("reachable");
	});
}

// creates a new piece on a target square
// pieceType - pawn, knight, bishop, rook, queen, king, e.g. : PieceType.PAWN
// color - white, black, e.g. : Color.WHITE
function createPiece(pieceType, color, targetSquareId) {
	//alert("creating piece");
	var pieceSrc = "images/";
	if(color == Color.BLACK)
		pieceSrc += "b_";
	else
		pieceSrc += "w_";
	
	pieceSrc += getPieceTypeNormalName(pieceType) + ".png";
	
	var piece = document.createElement("img");
	piece.setAttribute("src", pieceSrc);
	document.body.appendChild(piece);
	piece.className = "piece " + getPieceColorNormalName(color) + " " + getPieceTypeNormalName(pieceType);
	var newId = "p" + crtPieceId;
	crtPieceId++;
	piece.setAttribute("id", newId);
	sidOfPiece[newId] = targetSquareId;
	pidInSquare[targetSquareId] = newId;
	
	//alert(sidOfPiece[$("#" + targetSquareId).attr("id")]);
	//alert(targetSquareId);
	//alert(newId);
	moveToSquare($("#" + newId), $("#" + targetSquareId), Animate.NO, RealMove.NO);
	
	if(playerType[color] == PlayerType.HUMAN)
		makePieceDraggable(newId);
	
	if(promoting)
		canToggle = true;
}

// popup when the game is finished
function createEndPopup(message) {
		var $popupWindow = $('<div id="popup" class="popup"/>').appendTo("body");
		
		$popupWindow.css("z-index", crtZIndex++);
		
		var popupHTML = new String("");
		popupHTML += "<center>";
		popupHTML += "<p>";
		popupHTML += message;
		popupHTML += "</p>";
		popupHTML += "<p>";
		popupHTML += "<button id='quit2' style='font-size:14pt'>Back to Main Menu!</button>";
		popupHTML += "</p>";
		popupHTML += "</center>";
		
		$popupWindow.html(popupHTML);
		
		$("#quit2").click( function() {
			warnAtUnload = false;
			window.location.replace(".");
		});
		
		var boardTop = $("#board").offset().top;
		var boardLeft = $("#board").offset().left;
		var boardHeight = $("#board").height();
		var boardWidth = $("#board").width();
		var windowHeight = $("#popup").height();
		var windowWidth = $("#popup").width();
		
		$popupWindow.offset( {
			top : boardTop + boardHeight / 2 - windowHeight / 2,
			left: boardLeft + boardWidth / 2 - windowWidth / 2
		});
}

function endGame(state) {
	$(document).ready( function() {
		$(".piece").each( function() {
			//alert(getPieceType($(this)));
			if ($(this).data('draggable'))
				$(this).draggable("destroy");
		});
		
		if(state == GameState.CHECKMATE) {
			// other color wins
			turn = (turn == Color.WHITE ? Color.BLACK : Color.WHITE);
			createEndPopup(turn + " won by checkmate!");
		}
		if(state == GameState.STALEMATE)
			createEndPopup("Game drawn by stalemate!");
		if(state == GameState.INS_MATERIAL)
			createEndPopup("Game drawn by insufficient material!");
		if(state == GameState.DRAW_50)
			createEndPopup("Game drawn by 50 move rule!");
		if(state == GameState.DRAW_REPETITION)
			createEndPopup("Game drawn by threefold repetition!");
		
		gameIsOver = true;
	});
}

function gameOver() {
	var crt = getFENFirstPart();
	if(timesPosition[crt] >= 3)
		return GameState.DRAW_REPETITION;
	
	if(halfMoveClock >= 50)
		return GameState.DRAW_50;

	givingCheck = piecesGivingCheck();
	
	var canMove = false;
	//alert("over? color = " + turn);
	$(".piece").each( function() {
		if(getPieceColor($(this)) == turn) {
			for(var i = 1; i <= 8 && !canMove; i++)
				for(var j = 1; j <= 8 && !canMove; j++)
					if(pieceCanMoveToSquare($(this), i, j)) {
						//alert("over at piece " + getPieceType($(this)));
						canMove = true;
					}
			
			if(canMove) return;
		}
		//alert("iterating a piece");
	});
	
	// check for checkmate / stalemate
	if(!canMove) {
		if(givingCheck.length > 0)
			return GameState.CHECKMATE;
		else
			return GameState.STALEMATE;
	}
	
	// check for insufficient material
	var whitePieceCount = 0;
	var blackPieceCount = 0;
	var whitePieceValue = 0;
	var blackPieceValue = 0;
	
	$(".piece").each( function() {
		if(getPieceColor($(this)) == Color.WHITE) {
			whitePieceCount++;
			whitePieceValue += getPieceValue($(this));
		}
		else {
			blackPieceCount++;
			blackPieceValue += getPieceValue($(this));
		}
	});
	
	if(whitePieceCount <= 2 && blackPieceCount <= 2) {
		if(whitePieceCount == 1 && blackPieceCount == 1)
			return GameState.INS_MATERIAL;
		if(whitePieceValue == 0 && blackPieceValue == 3)
			return GameState.INS_MATERIAL;
		if(whitePieceValue == 3 && blackPieceValue == 0)
			return GameState.INS_MATERIAL;
	}
	
	//alert("over is " + over);
	return GameState.UNCLEAR;
}

function updateMaterialCount() {
	var whitePieceValue = 0;
	var blackPieceValue = 0;
	
	$(".piece").each( function() {
		if(getPieceColor($(this)) == Color.WHITE)
			whitePieceValue += getPieceValue($(this));
		else
			blackPieceValue += getPieceValue($(this));
	});
	
	$("#whitecount").html(whitePieceValue);
	$("#blackcount").html(blackPieceValue);
}

function toggleTurn() {
	$(document).ready( function() {
		turn = (turn == Color.WHITE ? Color.BLACK : Color.WHITE);
		canToggle = false;
		promoting = false;
		promotionTo = null;
		lastMove = "";
		
		var crt = getFENFirstPart();
		
		if(typeof timesPosition[crt] == "undefined")
			timesPosition[crt] = 1;
		else {
			timesPosition[crt]++;
			var other = (turn == Color.WHITE ? Color.BLACK : Color.WHITE);
			if(playerType[other] == PlayerType.COMPUTER)
				forceNotRep[other] = true;
		}
		
		updateMaterialCount();
		
		var state = gameOver();
		if(state != GameState.UNCLEAR) {
			endGame(state);
			return;
		}
		//alert("not over");
		
		if(playerType[turn] == PlayerType.COMPUTER) {
			toggleThink(turn);
			setTimeout("makeAIMove()", 1000);
			//alert("OMG");
			//makeAIMove();
			//setTimeout("toggleThink(turn)", 1000);
			//toggleThink(turn);
		}
		
		var interval = setInterval( function() {
			if(canToggle) {
				clearInterval(interval);
				
				if(playerType[turn] == PlayerType.COMPUTER)
					toggleThink(turn);
				
				updateGameHistory(turn, lastMove);
				//alert("~interval");
				toggleTurn();
			}
		}, 100);
	});
}

function toggleThink(color) {
	$(document).ready( function() {
		var str;
		if(color == Color.WHITE)
			str = $("#whitename").text();
		else if(color == Color.BLACK)
			str = $("#blackname").text();
		else
			alert("Error at toggleThink() argument");
		
		/*if($("#whitename").length == 0)
			alert("IOI white");
		if($("#blackname").length == 0)
			alert("IOI black");
		
		alert("String: \"" + str + "\"");*/
		var p = str.search(" -");
		if(p != -1)
			str = str.substr(0, p);
		else
			str += " - thinking...";
		
		if(color == Color.WHITE)
			$("#whitename").html(str);
		else if(color == Color.BLACK)
			$("#blackname").html(str);
	});
};
	
// prompts user to choose the piece to promote to
// (row, col) - square of promotion
// (the pawn must already be on that square)
function promotionPopup(row, col) {
	// temporarly disable turn
	
	var $popupWindow = $('<div id="popup" class="promotionpopup"/>').appendTo("body");
	
	$popupWindow.css("z-index", crtZIndex++);
	
	//alert(row);
	//alert(col);
	//alert(pidInSquare[getSquareId(row, col)]);
	var pawn = $("#" + pidInSquare[getSquareId(row, col)]);
	var color = getPieceColor(pawn);
	var colChar = color == Color.WHITE ? "w" : "b";
	
	var popupHTML = new String("");
	popupHTML += "<center>choose piece</center>";
	popupHTML += "<center>";
	popupHTML += "<table>";
	popupHTML += "<tr><td>&nbsp;</td></tr>";
	popupHTML += "<tr>";
	popupHTML += "<td><center><img src='images/" + colChar + "_rook.png' class='smallrook popuppiece'></center></td>";
	popupHTML += "<td><center><img src='images/" + colChar + "_bishop.png' class='smallbishop popuppiece'></center></td>";
	popupHTML += "</tr>";
	popupHTML += "<tr>";
	popupHTML += "<td><center><img src='images/" + colChar + "_queen.png' class='smallqueen popuppiece'></center></td>";
	popupHTML += "<td><center><img src='images/" + colChar + "_knight.png' class='smallknight popuppiece'></center></td>";
	popupHTML += "</tr>";
	popupHTML += "</table>";
	popupHTML += "</center>";
	$popupWindow.html(popupHTML);
	
	var boardTop = $("#board").offset().top;
	var boardLeft = $("#board").offset().left;
	var boardHeight = $("#board").height();
	var boardWidth = $("#board").width();
	var windowHeight = $("#popup").height();
	var windowWidth = $("#popup").width();
	
	$popupWindow.offset( {
		top : boardTop + boardHeight / 2 - windowHeight / 2,
		left: boardLeft + boardWidth / 2 - windowWidth / 2
	});
	
	//alert("promote popup");
	$(".popuppiece").click( function() {
		// erase the pawn
		pidInSquare[getSquareId(row, col)] = "";
		pawn.remove();
		delete pawn;
	
		// promote
		var pieceToCreate = new String("");
		if($(this).hasClass('smallqueen')) pieceToCreate = PieceType.QUEEN;
		if($(this).hasClass('smallrook')) pieceToCreate = PieceType.ROOK;
		if($(this).hasClass('smallbishop')) pieceToCreate = PieceType.BISHOP;
		if($(this).hasClass('smallknight')) pieceToCreate = PieceType.KNIGHT;
		
		createPiece(pieceToCreate, color, getSquareId(row, col));
		
		lastMove += " =" + getPieceNotation($("#" + pidInSquare[getSquareId(row, col)]));
		
		//alert("erase?");
		var $popupWindow = $("#popup");
		$popupWindow.remove();
		delete $popupWindow;
		
		// check if the new peace gives check
		givingCheck = piecesGivingCheck();
	});
}

// assume FEN is correct
function loadFEN(FEN) {
	// delete all previous pieces
	$(".piece").each( function() {
		$(this).remove();
		delete $(this);
	});
	
	// remove all selections
	$(".square").removeClass('selectedFrom');
	$(".square").removeClass('selectedTo');

	var k = 0;
	for(var i = 8; i >= 1; i--) {
		var j = 1;
		while(FEN[k] != '/' && FEN[k] != ' ') {
			var crt = parseInt(FEN[k]);
			if(!isNaN(crt)) {
				for(var aux = 0; aux < crt; aux++) {
					pidInSquare[getSquareId(i, j)] = "";
					j++;
				}
			}
			else {
				var color = (FEN[k] === FEN[k].toLowerCase() ? Color.BLACK : Color.WHITE);
				var pieceType = getPieceTypeFromNotation(FEN[k]);
				createPiece(pieceType, color, getSquareId(i, j));
				
				if(pieceType == PieceType.KING)
					king[color] = $("#" + pidInSquare[getSquareId(i, j)]);
					
				j++;
			}
			k++;
		}
		k++;
		
		if(j != 9)
			alert("FEN is wrong!");
	}
	
	// to move
	turn = getPieceColorFromNotation(FEN[k]);
	k += 2;
	
	$(".piece").each( function() {
		hasMoved[$(this).attr("id")] = false;
	});
	
	// castling rights
	var str = new String("");
	while(FEN[k] !== ' ') {
		str += FEN[k];
		k++;
	}
	k++;
	
	if(str.indexOf("K") == -1 && !squareIsEmpty(1, 8)
		&& getPieceType($("#" + pidInSquare[getSquareId(1, 8)])) == PieceType.ROOK
		&& getPieceColor($("#" + pidInSquare[getSquareId(1, 8)])) == Color.WHITE)
		hasMoved[pidInSquare[getSquareId(1, 8)]] = true;
	if(str.indexOf("Q") == -1 && !squareIsEmpty(1, 1)
		&& getPieceType($("#" + pidInSquare[getSquareId(1, 1)])) == PieceType.ROOK
		&& getPieceColor($("#" + pidInSquare[getSquareId(1, 1)])) == Color.WHITE)
		hasMoved[pidInSquare[getSquareId(1, 1)]] = true;
	if(str.indexOf("k") == -1 && !squareIsEmpty(8, 8)
		&& getPieceType($("#" + pidInSquare[getSquareId(8, 8)])) == PieceType.ROOK
		&& getPieceColor($("#" + pidInSquare[getSquareId(8, 8)])) == Color.BLACK)
		hasMoved[pidInSquare[getSquareId(8, 8)]] = true;
	if(str.indexOf("q") == -1 && !squareIsEmpty(8, 1)
		&& getPieceType($("#" + pidInSquare[getSquareId(8, 1)])) == PieceType.ROOK
		&& getPieceColor($("#" + pidInSquare[getSquareId(8, 1)])) == Color.BLACK)
		hasMoved[pidInSquare[getSquareId(8, 1)]] = true;
	
	// en-passant rights
	if(FEN[k] === '-') {
		epRow = epCol = -1;
		k += 2;
	}
	else {
		epRow = getSquareRow($("#" + FEN.substring(k, k + 2).toUpperCase()));
		epCol = getSquareCol($("#" + FEN.substring(k, k + 2).toUpperCase()));
		k += 3;
	}
	
	// halfmove clock
	str = "";
	while(FEN[k] !== ' ') {
		str += FEN[k];
		k++;
	}
	halfMoveClock = parseInt(str);
	if(isNaN(halfMoveClock))
		alert("Failed at parsing half-move clock!");
	
	// move number
	k++;
	str = "";
	while(k < FEN.length) {
		str += FEN[k];
		k++;
	}
	moveNumber = parseInt(str);
	if(isNaN(moveNumber))
		alert("Failed at parsing move number!");
}

// create the board
function initBoard() {
	// build the board
	var $table = $('<table id="board" class="board"></table>').appendTo("body");

	var tableHTML = new String("");
	
	for(var i = 9; i >= 0; i--) {
		tableHTML += "<tr>";
		
		if(i == 0 || i == 9) {
			for(var j = 0; j <= 9; j++) {
				if(j == 0 || j == 9)
					tableHTML += "<td class='fillcoord'></td>";
				else {
					if(i == 0)
						tableHTML += "<td class='rowcoord'>" + String.fromCharCode("a".charCodeAt(0) + j - 1) + "</td>";
					else
						tableHTML += "<td class='rowcoord'></td>";
				}
			}
		}
		else {
			for(var j = 0; j <= 9; j++) {
				if(j == 0)
					tableHTML += "<td class='colcoord'>" + i + "</td>";
				else if(j == 9)
					tableHTML += "<td class='colcoord'></td>";
				else {
					// real square
					tableHTML += "<td id='" + getSquareId(i, j) + "' class='";
					tableHTML += ((i + j) % 2 == 0 ? "white" : "black");
					tableHTML += "Background square'></td>";
				}
			}
		}
		
		tableHTML += "</tr>";
	}
	
	$table.html(tableHTML);
	
	$table.offset({
			left : $table.offset().left + 100
		});
	
	// make all squares droppable
	$(document).ready( function() {
		$(".square").droppable({
			accept : ".piece",
			drop: function(ev, ui) {
				moveToSquare(ui.draggable, $(this), Animate.NO, RealMove.YES);
			}
		});
	});

	$(window).resize( function() {
		$(".piece").each( function() {
			moveToSquare($(this), $("#" + sidOfPiece[$(this).attr("id")]), Animate.NO, RealMove.NO);
		});
	});
}

function updateGameHistory(color, move) {
	if(color == Color.WHITE) {
		var newRow = new String("");
		
		newRow = "<tr style='text-align:center'>";
		newRow += "<td>" + moveNumber + "</td>";
		newRow += "<td>" + move + "</td>";
		newRow += "<td id='gh" + moveNumber + "'" + "</td>";
		newRow += "</tr>";
	
		$("#gamehistory").append(newRow);
	}
	else {
		$("#gh" + (moveNumber - 1)).html(move);
	}
	
	//$("#gamehistorydiv").scrollTop($(this).height());
	$("#gamehistorydiv").scrollTop(100000);
}

function restartGame() {
	$(document).ready( function() {
		for(var i = 1; i <= 8; i++)
			for(var j = 1; j <= 8; j++)
				pidInSquare[getSquareId(i, j)] = new String("");
		
		timesPosition = new Array();
		forceNotRep = new Array();
		forceNotRep[Color.WHITE] = false;
		forceNotRep[Color.BLACK] = false;
		
		var $gameHistory = $("#gamehistory");
		
		var ghHTML = new String("");
		
		ghHTML += "<thead>";
		ghHTML += "<tr style='text-align:center'>";
		ghHTML += "<th>#</th>";
		ghHTML += "<th>WHITE</th>";
		ghHTML += "<th>BLACK</th>";
		ghHTML += "</tr>";
		ghHTML += "</thead>";
		
		$gameHistory.html(ghHTML);
		
		loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
		
		turn = turn == Color.WHITE ? Color.BLACK : Color.WHITE;
		gameIsOver = false;
		toggleTurn();
	});
}

// initiates board information
function initBoardInfo() {
	// material count information
	var $materialCount = $('<table id="matcount" class="materialcount"></table>').appendTo("body");
	
	var matHTML = new String("");
	matHTML += "<tr style='text-align:center'>";
	matHTML += "<td colspan='2'>Material count:</td>";
	matHTML += "</tr>";
	matHTML += "<tr style='text-align:center'>";
	matHTML += "<td>WHITE</td>";
	matHTML += "<td>BLACK</td>";
	matHTML += "</tr>";
	matHTML += "<tr style='text-align:center'>";
	matHTML += "<td id='whitecount'></td>";
	matHTML += "<td id='blackcount'></td>";
	matHTML += "</tr>";
	
	$materialCount.html(matHTML);
	
	var boardTop = $("#board").offset().top;
	var boardLeft = $("#board").offset().left;
	var boardHeight = $("#board").height();
	var boardWidth = $("#board").width();
	var windowHeight = $("#matcount").height();
	var windowWidth = $("#matcount").width();
	
	$materialCount.offset( {
		top : boardTop + windowHeight / 2,
		left: boardLeft + boardWidth + windowWidth / 3
	});
	
	// game history information
	var $gameHistoryDiv = $('<div id="gamehistorydiv" class="gamehistorydiv"></div>').appendTo("body");
	var $gameHistory = $('<table id="gamehistory" class="gamehistorytable"></table>').appendTo($gameHistoryDiv);
	
	$gameHistoryDiv.prepend("<center style='font-size:20pt'>Game history:</center>");
	
	var ghHTML = new String("");
	
	ghHTML += "<thead>";
	ghHTML += "<tr style='text-align:center'>";
	ghHTML += "<th>#</th>";
	ghHTML += "<th>WHITE</th>";
	ghHTML += "<th>BLACK</th>";
	ghHTML += "</tr>";
	ghHTML += "</thead>";
	
	$gameHistory.html(ghHTML);
	
	var boardTop = $("#board").offset().top;
	var boardLeft = $("#board").offset().left;
	var boardHeight = $("#board").height();
	var boardWidth = $("#board").width();
	var windowHeight = $("#matcount").height();
	var windowWidth = $("#matcount").width();
	
	$gameHistoryDiv.offset( {
		top : boardTop + 2 * windowHeight,
		left: boardLeft + boardWidth + windowWidth / 3
	});
	
	var $menu = $('<table id="menu" class="menu"></table>').appendTo("body");
	
	var menuHTML = new String("");
	menuHTML += "<tr style='text-align:center'>";
	menuHTML += "<td colspan='2'>Menu</td>";
	menuHTML += "</tr>";
	menuHTML += "<tr>";
	menuHTML += "<td><center><button id='restart' style='font-size:20pt'>Restart</button></center></td>";
	menuHTML += "<td><button id='quit' style='font-size:20pt'>Quit</button></td>";
	menuHTML += "</tr>";
	
	$menu.html(menuHTML);
	
	$menu.offset( {
		top : boardTop + 4 * windowHeight,
		left: boardLeft + boardWidth + windowWidth / 3
	});
	
	$("#restart").click( function() {
		if(gameIsOver) {
			// remove all popups
			$(".popup").remove();
			$(".promotionpopup").remove();
		}
			
		restartGame();
	});

	$("#quit").click( function() {
		//if(!gameIsOver) {
			warnAtUnload = false;
			window.location.replace(".");
		//}
	});
}

function swapId(first, second) {
	var firstId = first.attr("id");
	var secondId = second.attr("id");
	first.attr("id", secondId);
	second.attr("id", firstId);
}

function swapHTML(first, second) {
	var firstHTML = first.html();
	var secondHTML = second.html();
	first.html(secondHTML);
	second.html(firstHTML);
}

function flipBoard() {
	for(var i = 1; i <= 8; i++)
		for(var j = 1; j <= 4; j++)
			swapId($("#" + getSquareId(i, j)), $("#" + getSquareId(i, 9 - j)));
	for(var j = 1; j <= 8; j++)
		for(var i = 1; i <= 4; i++)
			swapId($("#" + getSquareId(i, j)), $("#" + getSquareId(9 - 	i, j)));
	
	swapHTML($("#whitename"), $("#blackname"));
	swapId($("#whitename"), $("#blackname"));
	
	$(".rowcoord").each( function() {
		if($(this).html().length > 0) {
			var str = $(this).html();
			var newStr = String.fromCharCode("h".charCodeAt(0) - (str.charCodeAt(0) - "a".charCodeAt(0)));
			$(this).html(newStr);
		}
	});
	$(".colcoord").each( function() {
		if($(this).html().length > 0) {
			var str = $(this).html();
			var newStr = String.fromCharCode("8".charCodeAt(0) - (str.charCodeAt(0) - "1".charCodeAt(0)));
			$(this).html(newStr);
		}
	});
	
	// flip square colors
	$(".square").each( function() {
		//alert("Found square " + $(this).attr("id"));
		if($(this).hasClass("whiteBackground")) {
			$(this).removeClass("whiteBackground");
			$(this).addClass("blackBackground");
		}
		else {
			$(this).removeClass("blackBackground");
			$(this).addClass("whiteBackground");
		}
	});
}

// initiates the game interface
function init() {
	$(document).ready( function() {
		for(var i = 1; i <= 8; i++)
			for(var j = 1; j <= 8; j++)
				pidInSquare[getSquareId(i, j)] = new String("");
		
		timesPosition = new Array();
		forceNotRep = new Array();
		forceNotRep[Color.WHITE] = false;
		forceNotRep[Color.BLACK] = false;
		
		playerType[Color.WHITE] = CHOSEN_whitePlayerType;
		playerType[Color.BLACK] = CHOSEN_blackPlayerType;
		
		if(playerType[Color.WHITE] != PlayerType.HUMAN && playerType[Color.WHITE] != PlayerType.COMPUTER)
			alert("Error at player type: " + playerType[Color.WHITE]);
		if(playerType[Color.BLACK] != PlayerType.HUMAN && playerType[Color.BLACK] != PlayerType.COMPUTER)
			alert("	 type: " + playerType[Color.BLACK]);
		
		// create the two name labels
		var $blackName = $('<div id="blackname" style="font-size:30pt"></div>').appendTo("body");
		
		if(playerType[Color.BLACK] == PlayerType.COMPUTER) {
			$blackName.html("GEOBOT");
			$blackName.html($blackName.text() + " (" + CHOSEN_difficultyBlack + ")");
		}
		else $blackName.html("PLAYER");
		
		$blackName.offset( {
			left : $blackName.offset().left + 170
		});
		
		initBoard();
		
		var $whiteName = $('<div id="whitename" style="font-size:30pt"></div>').appendTo("body");
		
		if(playerType[Color.WHITE] == PlayerType.COMPUTER) {
			$whiteName.html("GEOBOT");
			$whiteName.html($whiteName.text() + " (" + CHOSEN_difficultyWhite + ")");
		}
		else $whiteName.html("PLAYER");
		
		$whiteName.offset( {
			left : $whiteName.offset().left + 170
		});
		
		initBoardInfo();
		
		// if the player is black, flip the board
		if(playerType[Color.BLACK] == PlayerType.HUMAN && playerType[Color.WHITE] != PlayerType.HUMAN)
			flipBoard();
		
		loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
		
		turn = turn == Color.WHITE ? Color.BLACK : Color.WHITE;
		gameIsOver = false;
		toggleTurn();
	});
}

$(document).ready( function() {
	$("#getfen").click( function() {
		//alert("FEN: " + positionToFEN());
		prompt("FEN:", positionToFEN());
		//prompt("FEN:", getFENFirst());
	});
});

$(document).ready( function() {
	$("#loadfen").click( function() {
		var FEN = prompt("Input FEN:");
		if(FEN != null)
			loadFEN(FEN);
	});
});

window.onbeforeunload = function () {
	if(warnAtUnload)
		return "You have attempted to leave this page. If you leave this page, your game will be lost. Are you sure you want to exit this page?";
}