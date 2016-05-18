
// we always assume row and col are valid

// relative directions of piece location to other square
// normalizes directions = assumes the piece can reach (row, col)
function getRelativeDirections(piece, row, col) {
	var diri = row - getPieceRow(piece);
	var dirj = col - getPieceCol(piece);
	
	if(diri > 0) diri = 1;
	if(diri < 0) diri = -1;
	if(dirj > 0) dirj = 1;
	if(dirj < 0) dirj = -1;
	
	return [diri, dirj];
}

// this function doesn't look for pins or moving into check, not even presence of enemy piece
function pieceDirectlyAttacksSquare(piece, row, col) {
	var pRow = getPieceRow(piece);
	var pCol = getPieceCol(piece);
	
	// the piece's square doesn't count
	if(pRow == row && pCol == col)
		return false;
	
	var pieceType = getPieceType(piece);
	
	if(pieceType == PieceType.KNIGHT || pieceType == PieceType.KING)
		return pieceCanPossiblyMoveToSquare(piece, row, col);
	else if(pieceType == PieceType.PAWN) {
		var advDir = getPieceColor(piece) == Color.WHITE ? 1 : -1;
		return pRow + advDir == row && Math.abs(pCol - col) == 1;
	}
	
	// bishop, rook and queen left
	// pre-check
	if(!pieceCanPossiblyMoveToSquare(piece, row, col))
		return false;
	
	var dir = getRelativeDirections(piece, row, col);
	var di = dir[0];
	var dj = dir[1];
	
	var pi = pRow + di;
	var pj = pCol + dj;
	
	// check if the path is clear
	while((pi != row || pj != col) && squareIsEmpty(pi, pj)) {
		pi += di;
		pj += dj;
	}
	
	return pi == row && pj == col;
}

// checks if a piece is pinned
// if YES: returns the relative direction to the piece that pins it
// if NO: returns [-2, -2]
function pieceIsPinned(piece) {
	var ourKing = king[getPieceColor(piece)];
	var pRow = getPieceRow(piece);
	var pCol = getPieceCol(piece);
	var kRow = getPieceRow(ourKing);
	var kCol = getPieceCol(ourKing);
	
	var di = kRow - pRow;
	var dj = kCol - pCol;
	
	if(di != 0 && dj != 0 && Math.abs(di) != Math.abs(dj)) // it's not pinned
		return [-2, -2];
	
	if(di > 0) di = 1;
	if(di < 0) di = -1;
	if(dj > 0) dj = 1;
	if(dj < 0) dj = -1;
	
	// check if the path is clear between the piece and the king
	var pi = pRow + di;
	var pj = pCol + dj;
	
	while(pi >= 1 && pi <= 8 && pj >= 1 && pj <= 8 && squareIsEmpty(pi, pj)) {
		pi += di;
		pj += dj;
	}
	
	var otherPiece = $("#" + pidInSquare[getSquareId(pi, pj)]);
	if(otherPiece.attr("id") != ourKing.attr("id")) // the piece found was not our king
		return [-2, -2];
	
	// check if an enemy piece attacks us from the opposite direction
	di = -di;
	dj = -dj;
	pi = pRow + di;
	pj = pCol + dj;
	
	// find the first piece
	while(pi >= 1 && pi <= 8 && pj >= 1 && pj <= 8 && squareIsEmpty(pi, pj)) {
		pi += di;
		pj += dj;
	}
	
	if(pi < 1 || pi > 8 || pj < 1 || pj > 8)
		return [-2, -2];
	
	// a piece was found
	otherPiece = $("#" + pidInSquare[getSquareId(pi, pj)]);
	
	if(getPieceColor(otherPiece) != getPieceColor(piece) 
		&& pieceDirectlyAttacksSquare(otherPiece, pRow, pCol)
		&& getPieceType(otherPiece) != PieceType.PAWN
		&& getPieceType(otherPiece) != PieceType.KING)
		return [di, dj];
	else
		return [-2, -2];
}

// checks if any of the pieces of color "color" attacks the square (row, col)
function squareIsAttacked(row, col, color) {
	for(var i = 1; i <= 8; i++)
		for(var j = 1; j <= 8; j++)
			if(!squareIsEmpty(i, j)) {
				var crtPiece = $("#" + pidInSquare[getSquareId(i, j)]);
				if(getPieceColor(crtPiece) == color && pieceDirectlyAttacksSquare(crtPiece, row, col))
					return true;
			}
	return false;
}

// return which piece of color "color" attacks the square (row, col)
function getPiecesAttackingSquare(row, col, color) {
	var ret = new Array();
	var num = 0;
	
	for(var i = 1; i <= 8; i++)
		for(var j = 1; j <= 8; j++)
			if(!squareIsEmpty(i, j)) {
				var crtPiece = $("#" + pidInSquare[getSquareId(i, j)]);
				if(getPieceColor(crtPiece) == color && pieceDirectlyAttacksSquare(crtPiece, row, col)) {
					ret[num] = crtPiece;
					num++;
				}
			}
	return ret;
}

// return which piece give check to the player to move
function piecesGivingCheck() {
	var ourKing = king[turn];
	var enemyColor = turn == Color.WHITE ? Color.BLACK : Color.WHITE;
	
	return getPiecesAttackingSquare(getPieceRow(ourKing), getPieceCol(ourKing), enemyColor);
}

// piece - query object
// this function assumes that the board is empty
function pieceCanPossiblyMoveToSquare(piece, row, col) {
	var pRow = getPieceRow(piece);
	var pCol = getPieceCol(piece);
	var pieceType = getPieceType(piece);
	
	if(pieceType == PieceType.KING)
		return Math.abs(pRow - row) <= 1 && Math.abs(pCol - col) <= 1;
	else if(pieceType == PieceType.QUEEN)	
		return pRow == row || pCol == col || Math.abs(pRow - row) == Math.abs(pCol - col);
	else if(pieceType == PieceType.ROOK)
		return pRow == row || pCol == col;
	else if(pieceType == PieceType.BISHOP)
		return Math.abs(pRow - row) == Math.abs(pCol - col);
	else if(pieceType == PieceType.KNIGHT) {
		var di = Math.abs(pRow - row);
		var dj = Math.abs(pCol - col);
		return (di == 2 && dj == 1) || (di == 1 && dj == 2);
	}
	// pawns are always treated specially	
	
	return false;
}

function pieceCanMoveToSquare(piece, row, col) {
	// if the piece has wrong color it can't move
	if(getPieceColor(piece) != turn)
		return false;

	var pRow = getPieceRow(piece);
	var pCol = getPieceCol(piece);
	var pieceType = getPieceType(piece);
	
	// pre-check
	if(pieceType != PieceType.PAWN && pieceType != PieceType.KING && !pieceCanPossiblyMoveToSquare(piece, row, col))
		return false;

	var color = getPieceColor(piece);
		
	// cannot capture own piece
	if(!squareIsEmpty(row, col)
		&& getPieceColor($("#" + pidInSquare[getSquareId(row, col)])) == getPieceColor(piece))
		return false;

	var otherColor = color == Color.WHITE ? Color.BLACK : Color.WHITE;
	
	if(pieceType == PieceType.KING) {
		// the king must not move into check
		
		// normal moves
		if(pieceCanPossiblyMoveToSquare(piece, row, col)) {
			// temporarly delete the king
			pidInSquare[sidOfPiece[piece.attr("id")]] = "";
						
			
			var ok = !squareIsAttacked(row, col, otherColor);
						
			pidInSquare[sidOfPiece[piece.attr("id")]] = piece.attr("id");
		}
		
		// try castling
		var castlingRow = color == Color.WHITE ? 1 : 8;
		if(!ok && pRow == castlingRow && !hasMoved[piece.attr("id")]) {
			
			// kingside
			if(row == castlingRow && col == 7) {
				// check for rook
				if(!squareIsEmpty(castlingRow, 8) && squareIsEmpty(castlingRow, 6)
				&& getPieceType($("#" + pidInSquare[getSquareId(castlingRow, 8)])) == PieceType.ROOK
				&& getPieceColor($("#" + pidInSquare[getSquareId(castlingRow, 8)])) == color
				&& !hasMoved[pidInSquare[getSquareId(castlingRow, 8)]]) {
					// must not move through check
					var throughCheck = false;
					for(var c = 5; c <= 7; c++)
						if(squareIsAttacked(castlingRow, c, otherColor))
							throughCheck = true;
				
					if(!throughCheck)
						return true;
				}
			}
			
			// queenside
			if(row == castlingRow && col == 3) {
				// check for rook
				if(!squareIsEmpty(castlingRow, 1) && squareIsEmpty(castlingRow, 4)
				&& getPieceType($("#" + pidInSquare[getSquareId(castlingRow, 1)])) == PieceType.ROOK
				&& getPieceColor($("#" + pidInSquare[getSquareId(castlingRow, 1)])) == color
				&& !hasMoved[pidInSquare[getSquareId(castlingRow, 1)]]) {
					// must not move through check
					var throughCheck = false;
					for(var c = 3; c <= 5; c++)
						if(squareIsAttacked(castlingRow, c, otherColor))
							throughCheck = true;
				
					if(!throughCheck)
						return true;
				}
			}
		}
		
		return ok;
	}
	
	// if pinned, it can only move in the direction of the pin
	var dirPin = pieceIsPinned(piece);
	var dirMove = getRelativeDirections(piece, row, col);
	if(dirPin[0] != -2
		&& (dirPin[0] != dirMove[0] || dirPin[1] != dirMove[1] || pieceType == PieceType.KNIGHT))
		return false;
	
	if(givingCheck.length > 0) { // it's check
		// the piece must either block the check or capture the checking piece
		
		if(givingCheck.length == 2)
			return false; // the king must move
		
		var enemyPiece = givingCheck[0];

		// if it's a knight, we must capture it
		if(getPieceType(enemyPiece) == PieceType.KNIGHT)
			return getPieceRow(enemyPiece) == row && getPieceCol(enemyPiece) == col
			&& pieceDirectlyAttacksSquare(piece, row, col);
		else if(getPieceType(enemyPiece) == PieceType.PAWN) {
			// try normal capture
			if(getPieceRow(enemyPiece) == row && getPieceCol(enemyPiece) == col
			&& pieceDirectlyAttacksSquare(piece, row, col))
				return true;
			
			// en-passant
			var advDir = otherColor == Color.WHITE ? 1 : -1;
			if(getPieceRow(enemyPiece) == pRow && Math.abs(getPieceCol(enemyPiece) - pCol) == 1
				&& epRow == getPieceRow(enemyPiece) - advDir && epCol == getPieceCol(enemyPiece)
				&& epRow == row && epCol == col)
				return true;
		}
		else {
			// check if this move captures the attacking piece
			if(getPieceRow(enemyPiece) == row && getPieceCol(enemyPiece) == col
				&& pieceDirectlyAttacksSquare(piece, row, col))
				return true;
			
			// check if this move blocks the check
			var dir = getRelativeDirections(king[turn], getPieceRow(enemyPiece), getPieceCol(enemyPiece));
			var di = dir[0];
			var dj = dir[1];
			var pi = getPieceRow(king[turn]) + di;
			var pj = getPieceCol(king[turn]) + dj;
			
			while(squareIsEmpty(pi, pj)) {
				if(pi == row && pj == col) {
					// check if we can reach square (pi, pj)
					if(pieceType == PieceType.PAWN) {
						// single advance
						var advDir = color == Color.WHITE ? 1 : -1;
						if(pRow + advDir == pi && pCol == pj)
							return true;
						
						// double advance
						if(pRow == (color == Color.WHITE ? 2 : 7) && pRow + 2 * advDir == pi
						&& pCol == pj && squareIsEmpty(pRow + advDir, pCol))
							return true;
					}
					else return pieceDirectlyAttacksSquare(piece, pi, pj);
					
					// none of the moves were possible
					return false;
				}
					
				pi += di;
				pj += dj;
			}
			
			return false;
		}
	}
	else {
		// it's not check
		if(pieceType == PieceType.KNIGHT) {
			return pieceCanPossiblyMoveToSquare(piece, row, col);
		}
		else if(pieceType == PieceType.PAWN) {
			// capture enemy pieces
			if(pieceDirectlyAttacksSquare(piece, row, col)
			&& !squareIsEmpty(row, col)
			&& getPieceColor($("#" + pidInSquare[getSquareId(row, col)])) != color)
				return true;
				
			// en-passant
			if(epRow == row && epCol == col
				&& pieceDirectlyAttacksSquare(piece, row, col))
				return true;
			
			// advance
			var advDir = color == Color.WHITE ? 1 : -1;
			
			// single advance
			if(pRow + advDir == row && pCol == col && squareIsEmpty(pRow + advDir, pCol))
				return true;
			
			// double advance
			if(pRow == (color == Color.WHITE ? 2 : 7) && pRow + 2 * advDir == row
			&& pCol == col
			&& squareIsEmpty(pRow + advDir, pCol) && squareIsEmpty(pRow + 2 * advDir, pCol))
				return true;
			
			return false;
		}
		
		// bishop, rook and queen left
		
		return pieceDirectlyAttacksSquare(piece, row, col);
	}
}

function getPieceValue(piece) {
	var pieceType = getPieceType(piece);
	if(pieceType == PieceType.KING)
		return 0;
	if(pieceType == PieceType.QUEEN)
		return 9;
	if(pieceType == PieceType.ROOK)
		return 5;
	if(pieceType == PieceType.BISHOP)
		return 3;
	if(pieceType == PieceType.KNIGHT)
		return 3;
	if(pieceType == PieceType.PAWN)
		return 1;
	alert("Wrong piece type ?! (" + getPieceRow(piece) + "," + getPieceCol(piece) + ")");
}