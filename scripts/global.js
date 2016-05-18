// These are the global variables used in the application

var crtPieceId = 0;
var crtZIndex = 10;
var pidInSquare = new Array();
var sidOfPiece = new Array();
var king = new Array();
var turn = new String();
var playerType = new Array();
var CHOSEN_whitePlayerType; // used to get them from $_POST
var CHOSEN_blackPlayerType; // used to get them from $_POST
var CHOSEN_playerColor; // used to get them from $_POST
var CHOSEN_difficultyWhite; // used to get them from $_POST
var CHOSEN_difficultyBlack; // used to get them from $_POST
var warnAtUnload;
var lastCapturedPiece = null;
var promotedPawn = null;
var canToggle = false;
var promoting = false;
var epRow = -1;
var epCol = -1;
var hasMoved = new Array();
var givingCheck = new Array();
var halfMoveClock = -1;
var moveNumber = -1;
var promotionTo = "";
var lastMove = "";
var timesPosition;
var forceNotRep;
var gameIsOver;

var Color = {
	WHITE : "WHITE",
	BLACK : "BLACK",
	UNDEFINED : "__UNDEFINED__"
}
var PieceType = {
	KING : "PT_KING",
	QUEEN : "PT_QUEEN",
	ROOK : "PT_ROOK",
	BISHOP : "PT_BISHOP",
	KNIGHT : "PT_KNIGHT",
	PAWN : "PT_PAWN",
	UNDEFINED : "__UNDEFINED_PIECE__"
}
var Animate = {
	YES : "ANIMATE",
	NO : "NOT_ANIMATE"
}
var RealMove = {
	YES : "REALMOVE",
	NO : "NOT_REALMOVE"
}
var PlayerType = {
	HUMAN : "HUMAN",
	COMPUTER : "COMPUTER"
}
var GameState = {
	CHECKMATE : "checkmate",
	STALEMATE : "stalemate",
	INS_MATERIAL : "insufficient material",
	DRAW_50 : "50 move rule",
	DRAW_REPETITION : "threefold repetition",
	UNCLEAR : "unclear"
}