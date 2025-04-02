import { playerSymbols } from './script.js';
import { freeTiles, placeSymbol, rows, cols, winCondition, boardState, checkWin, currentPlayer, players, minimaxDepth } from "./game.js";

// Easy bot functions
// Place a symbol randomly on the board.
export function placeRandomly()
{
    const tile = freeTiles[Math.floor(Math.random() * freeTiles.length)];
    placeSymbol(tile.getAttribute('data-row'), tile.getAttribute('data-col'));
}
// Medium bot functions
// Try to win in one move. If it is possible, place the symbol there and return true. Otherwise, return false.
export function tryToWin()
{
    const playerSymbol = playerSymbols[currentPlayer];
    for (let i = 0; i < rows; i++)
    {
        for (let j = 0; j < cols; j++)
        {
            if (boardState[i][j] === "")
            {
                boardState[i][j] = playerSymbol;

                if (checkWin(playerSymbol) !== null)
                {
                    boardState[i][j] = "";
                    placeSymbol(i, j);
                    return true;
                }

                boardState[i][j] = "";
            }
        }
    }
    return false;
}
// Try to block the opponent from winning in one move. If it is possible, place the symbol there and return true. Otherwise, return false.
export function tryToBlock()
{
    const opponentSymbol = playerSymbols[(currentPlayer + 1) % players.length];
    for (let i = 0; i < rows; i++)
    {
        for (let j = 0; j < cols; j++)
        {
            if (boardState[i][j] === "")
            {
                boardState[i][j] = opponentSymbol;
                if (checkWin(opponentSymbol) !== null)
                {
                    boardState[i][j] = "";
                    placeSymbol(i, j);
                    return true;
                }
                boardState[i][j] = "";
            }
        }
    }
    return false;
}
// Minimax functions
// Finds the best move for the minimax bot using alpha-beta pruning.
export function findBestMove()
{
    let bestScore = -Infinity;
    let bestMove = null;
    let botSymbol = playerSymbols[currentPlayer];

    let boardCopy = cloneBoard(boardState);
    for (let i = 0; i < rows; i++)
    {
        for (let j = 0; j < cols; j++)
        {
            if (boardCopy[i][j] === "")
            {
                boardCopy[i][j] = botSymbol;
                let moveScore = minimax(boardCopy, minimaxDepth, false, -Infinity, Infinity);
                boardCopy[i][j] = "";
                if (moveScore > bestScore)
                {
                    bestScore = moveScore;
                    bestMove = { row: i, col: j };
                }
            }
        }
    }
    return bestMove;
}
// The minimax function with alpha-beta pruning.
// 'isMaximizing' is true if the bot is trying to maximize its score.
function minimax(board, depth, isMaximizing, alpha, beta)
{
    let botSymbol = playerSymbols[currentPlayer];
    let opponentSymbol = playerSymbols[(currentPlayer + 1) % players.length];

    if (checkWinState(board, botSymbol)) return 10;
    if (checkWinState(board, opponentSymbol)) return -10;
    if (isDraw(board) || depth === 0) return 0;

    if (isMaximizing)
    {
        let maxEval = -Infinity;
        for (let i = 0; i < rows; i++)
        {
            for (let j = 0; j < cols; j++)
            {
                if (board[i][j] === "")
                {
                    board[i][j] = botSymbol;
                    let evalScore = minimax(board, depth - 1, false, alpha, beta);
                    board[i][j] = "";
                    maxEval = Math.max(maxEval, evalScore);
                    alpha = Math.max(alpha, evalScore);
                    if (beta <= alpha) break;
                }
            }
        }
        return maxEval;
    }
    else
    {
        let minEval = Infinity;
        for (let i = 0; i < rows; i++)
        {
            for (let j = 0; j < cols; j++)
            {
                if (board[i][j] === "")
                {
                    board[i][j] = opponentSymbol;
                    let evalScore = minimax(board, depth - 1, true, alpha, beta);
                    board[i][j] = "";
                    minEval = Math.min(minEval, evalScore);
                    beta = Math.min(beta, evalScore);
                    if (beta <= alpha) break;
                }
            }
        }
        return minEval;
    }
}
// Returns a deep copy of the board state (2D array of strings).
function cloneBoard(board)
{
    return board.map(row => row.slice());
}
// Checks if a player with the given symbol has won the game on a given board.
function checkWinState(board, symbol)
{
    for (let i = 0; i < rows; i++)
    {
        for (let j = 0; j < cols; j++)
        {
            if (board[i][j] === symbol)
            {
                if (checkDirection(board, i, j, 0, 1, symbol) ||   // horizontally
                    checkDirection(board, i, j, 1, 0, symbol) ||   // vertically
                    checkDirection(board, i, j, 1, 1, symbol) ||   // main diagonal (top left -> bottom right)
                    checkDirection(board, i, j, 1, -1, symbol))    // lateral diagonal (top right -> bottom left)
                {
                    return true;
                }
            }
        }
    }
    return false;
}
// Check if there are at least 'winCondition' symbols in a row in the given direction.
function checkDirection(board, row, col, rowDir, colDir, symbol)
{
    let count = 0;
    let r = row, c = col;
    while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === symbol)
    {
        count++;
        r += rowDir;
        c += colDir;
    }
    return count >= winCondition;
}
// Checks if there are no empty tiles in the board.
function isDraw(board)
{
    return board.every(row => row.every(cell => cell !== ""));
}