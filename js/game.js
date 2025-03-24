let rows = 4;
let cols = 4;
let winCondition = 4;

const board = document.querySelector('#board');
const status = document.querySelector('#status');
const playerSymbols = ["X", "O"];
const gameTypes =
    {
        PVP: 0, // 2 players play alternately against each other
        EASY_BOT: 1, // 1 player is playing with a bot that places symbols randomly
        MEDIUM_BOT: 2, // 1 player plays with a bot that first tries to win in 1 move and then tries to to block the possibility of its opponent winning in 1 move. Otherwise, it places a symbol randomly.
        MINIMAX_BOT: 3 // 1 player plays with a bot that can't lose. They can only try to draw.
    };

let columnMode = false; // A mode where you can only place symbols on top of already existing ones (on the bottom of the board).
let gameType = gameTypes.MINIMAX_BOT;
let playerTiles = []
for (let i = 0; i < playerSymbols.length; i++)
{
    playerTiles.push([]);
}
let playerSymbol = playerSymbols[0];
let currentPlayer = 0;
let boardState = [];
let boardArray = [];
let freeTiles = [];
let gameOver = false;

function generateBoard()
{
    board.innerHTML = '';
    boardArray = [];
    boardState = [];
    freeTiles = [];
    for (let i = 0; i < rows; i++)
    {
        let rowArray = [];
        let stateRow = [];
        for (let j = 0; j < cols; j++)
        {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-row', i.toString());
            tile.setAttribute('data-col', j.toString());
            tile.addEventListener("click", () => placeSymbol(i, j));
            board.appendChild(tile);
            rowArray.push(tile);
            stateRow.push('');
            freeTiles.push(tile);
        }
        board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        boardArray.push(rowArray);
        boardState.push(stateRow);
    }
}

function placeSymbol(row, col)
{
    if (gameOver === false)
    {
        const tile = boardArray[row][col];
        if (tile.textContent === "")
        {
            tile.textContent = playerSymbols[currentPlayer];
            boardState[row][col] = playerSymbols[currentPlayer];
            playerTiles[currentPlayer].push(tile);
            freeTiles.splice(freeTiles.indexOf(tile), 1);
            const winningTiles = checkWin(playerSymbols[currentPlayer]);
            if (winningTiles === false)
            {
                gameOver = true;
                status.textContent = "Nikt nie wygrywa!";
                boardArray.forEach(row => row.forEach(tile =>
                {
                    tile.classList.add("disabled");
                }));
            }
            else if (winningTiles !== null)
            {
                gameOver = true;
                winningTiles.forEach(tile => tile.style.backgroundColor = "yellow");
                status.textContent = `${playerSymbols[currentPlayer]} wygrywa!`;
                boardArray.forEach(row => row.forEach(tile =>
                {
                    if (winningTiles.includes(tile) === false)
                    {
                        tile.classList.add("disabled");
                    }
                    else
                    {
                        tile.classList.add("winning");
                    }
                }));
            }
            else
            {
                currentPlayer = (currentPlayer + 1) % playerSymbols.length;
                changeStatus();
            }
        }
    }
}
function changeStatus()
{
    if (gameType !== gameTypes.PVP)
    {
        if (playerSymbols[currentPlayer] !== playerSymbol)
        {
            status.textContent = `Bot ${playerSymbols[currentPlayer]} myśli...`;
            botMove();
        }
        else
        {
            status.textContent = `Twoja kolej, ${playerSymbols[currentPlayer]}!`;
        }
    }
    else
    {
        status.textContent = `Tura gracza: ${playerSymbols[currentPlayer]}`;
    }
}
function botMove()
{
    switch (gameType)
    {
        case gameTypes.EASY_BOT:
            placeRandomly();
            break;
        case gameTypes.MEDIUM_BOT:
            if (tryToWin() === false && tryToBlock() === false)
            {
                placeRandomly();
            }
            break;
        case gameTypes.MINIMAX_BOT:
            const botSymbol = playerSymbols[currentPlayer];
            const opponentSymbol = playerSymbols[(currentPlayer + 1) % playerSymbols.length];
            const bestMove = getBestMove(boardState, botSymbol, opponentSymbol);
            if (bestMove) {
                placeSymbol(bestMove.row, bestMove.col);
            }
            break;
    }
}
function placeRandomly()
{
    const tile = freeTiles[Math.floor(Math.random() * freeTiles.length)];
    placeSymbol(tile.getAttribute('data-row'), tile.getAttribute('data-col'));
}

function tryToWin()
{
    const playerSymbol = playerSymbols[currentPlayer];

    for (let i = 0; i < rows; i++)
    {
        for (let j = 0; j < cols; j++)
        {
            const tile = boardArray[i][j];
            if (tile.textContent === "")
            {
                tile.textContent = playerSymbol;

                if (checkWin(playerSymbol) !== null)
                {
                    tile.textContent = "";
                    placeSymbol(tile.getAttribute('data-row'), tile.getAttribute('data-col'));
                    return true;
                }

                tile.textContent = "";
            }
        }
    }
    return false;
}
function tryToBlock()
{
    const opponentSymbol = playerSymbols[(currentPlayer + 1) % playerSymbols.length];

    for (let i = 0; i < rows; i++)
    {
        for (let j = 0; j < cols; j++)
        {
            const tile = boardArray[i][j];
            if (tile.textContent === "")
            {
                tile.textContent = opponentSymbol;

                if (checkWin(opponentSymbol) !== null)
                {
                    tile.textContent = "";
                    placeSymbol(tile.getAttribute('data-row'), tile.getAttribute('data-col'));
                    return true;
                }

                tile.textContent = "";
            }
        }
    }
    return false;
}

function getBestMove(currentBoardState, botSymbol, opponentSymbol) {
    const boardCopy = currentBoardState.map(row => [...row]);
    const moves = getAvailableMoves(boardCopy);
    if (moves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
        const newBoard = copyBoard(boardCopy);
        newBoard[move.row][move.col] = botSymbol;
        const result = minimax(newBoard, 0, false, botSymbol, opponentSymbol, -Infinity, Infinity);
        if (result.score > bestScore) {
            bestScore = result.score;
            bestMove = move;
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing, botSymbol, opponentSymbol, alpha, beta) {
    if (hasPlayerWon(board, botSymbol)) {
        return { score: 1 };
    }
    if (hasPlayerWon(board, opponentSymbol)) {
        return { score: -1 };
    }
    if (isBoardFull(board)) {
        return { score: 0 };
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        let bestMove = null;
        const moves = getAvailableMoves(board);
        for (const move of moves) {
            const newBoard = copyBoard(board);
            newBoard[move.row][move.col] = botSymbol;
            const result = minimax(newBoard, depth + 1, false, botSymbol, opponentSymbol, alpha, beta);
            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = move;
            }
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) break;
        }
        return { score: bestScore, move: bestMove };
    } else {
        let bestScore = Infinity;
        let bestMove = null;
        const moves = getAvailableMoves(board);
        for (const move of moves) {
            const newBoard = copyBoard(board);
            newBoard[move.row][move.col] = opponentSymbol;
            const result = minimax(newBoard, depth + 1, true, botSymbol, opponentSymbol, alpha, beta);
            if (result.score < bestScore) {
                bestScore = result.score;
                bestMove = move;
            }
            beta = Math.min(beta, bestScore);
            if (beta <= alpha) break;
        }
        return { score: bestScore, move: bestMove };
    }
}

function hasPlayerWon(board, player) {
    // Sprawdź wiersze
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j <= cols - winCondition; j++) {
            let win = true;
            for (let k = 0; k < winCondition; k++) {
                if (board[i][j + k] !== player) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }
    }

    // Sprawdź kolumny
    for (let j = 0; j < cols; j++) {
        for (let i = 0; i <= rows - winCondition; i++) {
            let win = true;
            for (let k = 0; k < winCondition; k++) {
                if (board[i + k][j] !== player) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }
    }

    // Sprawdź główną przekątną
    for (let i = 0; i <= rows - winCondition; i++) {
        for (let j = 0; j <= cols - winCondition; j++) {
            let win = true;
            for (let k = 0; k < winCondition; k++) {
                if (board[i + k][j + k] !== player) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }
    }

    // Sprawdź przeciwną przekątną
    for (let i = 0; i <= rows - winCondition; i++) {
        for (let j = winCondition - 1; j < cols; j++) {
            let win = true;
            for (let k = 0; k < winCondition; k++) {
                if (board[i + k][j - k] !== player) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }
    }

    return false;
}

function isBoardFull(board) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] === '') return false;
        }
    }
    return true;
}

function getAvailableMoves(board) {
    const moves = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] === '') {
                moves.push({ row: i, col: j });
            }
        }
    }
    return moves;
}

function copyBoard(board) {
    return board.map(row => [...row]);
}

function checkWin(playerSymbol)
{
    // Checking rows
    for (let i = 0; i < rows; i++)
    {
        let winningTiles = [];
        for (let j = 0; j < cols; j++)
        {
            const tile = boardArray[i][j];
            if (tile.textContent === playerSymbol)
            {
                winningTiles.push(tile);
            }
            else
            {
                winningTiles = [];
            }
            if (winningTiles.length >= winCondition)
            {
                return winningTiles;
            }
        }
    }

    // Checking columns
    for (let j = 0; j < cols; j++)
    {
        let winningTiles = [];
        for (let i = 0; i < rows; i++)
        {
            const tile = boardArray[i][j];
            if (tile.textContent === playerSymbol)
            {
                winningTiles.push(tile);
            }
            else
            {
                winningTiles = [];
            }
            if (winningTiles.length >= winCondition)
            {
                return winningTiles;
            }
        }
    }

    // Checking the main diagonal (top left -> bottom right)
    for (let i = 0; i <= rows - winCondition; i++)
    {
        for (let j = 0; j <= cols - winCondition; j++)
        {
            let winningTiles = [];
            for (let k = 0; k < winCondition; k++)
            {
                const tile = boardArray[i + k][j + k];
                if (tile.textContent === playerSymbol)
                {
                    winningTiles.push(tile);
                }
                else
                {
                    winningTiles = [];
                }
                if (winningTiles.length >= winCondition)
                {
                    return winningTiles;
                }
            }
        }
    }

    // Checking the lateral diagonal (top right -> bottom left)
    for (let i = 0; i <= rows - winCondition; i++)
    {
        for (let j = winCondition - 1; j < cols; j++)
        {
            let winningTiles = [];
            for (let k = 0; k < winCondition; k++)
            {
                const tile = boardArray[i + k][j - k];
                if (tile.textContent === playerSymbol)
                {
                    winningTiles.push(tile);
                }
                else
                {
                    winningTiles = [];
                }
                if (winningTiles.length >= winCondition)
                {
                    return winningTiles;
                }
            }
        }
    }
    // Checking a draw
    if (freeTiles.length === 0)
    {
        return false;
    }

    // No win if none of the above conditions are met.
    return null;
}

generateBoard();
changeStatus();