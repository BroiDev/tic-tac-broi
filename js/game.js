import { playMusic, playerSymbols } from './script.js';
import { addClickEvent, addSubmitEvent } from './helper.js';
import { placeRandomly, tryToWin, tryToBlock, findBestMove } from './bots.js';

const playerTypes =
{
    PLAYER: "player", // A living human being
    EASY_BOT: "easy-bot", // A bot that places symbols randomly
    MEDIUM_BOT: "medium-bot", // A bot that first tries to win in 1 move and then tries to to block the possibility of its opponent winning in 1 move. Otherwise, it places a symbol randomly.
    MINIMAX_BOT: "minimax-bot" // A bot that can't lose (on 3x3 and classic mode).
};
const gameModes =
{
    CLASSIC: "classic", // A classic game mode where you can place symbols anywhere on the board.
    COLUMN: "column" // A game mode where you can only place symbols on top of already existing ones (on the bottom of the board).
};

function getLocalStorageSettings()
{
    const settings = localStorage.getItem('gameSettings');
    return settings ? JSON.parse(settings) : null;
}

// Pobierz ustawienia z URL, localStorage lub zastosuj wartości domyślne
const params = new URLSearchParams(window.location.search);
const localStorageSettings = getLocalStorageSettings();
export const rows = params.get("rows") ? parseInt(params.get("rows"), 10) : (localStorageSettings ? localStorageSettings.rows : 3); // The number of rows in the board.
export const cols = params.get("rows") ? parseInt(params.get("cols"), 10) : (localStorageSettings ? localStorageSettings.cols : 3); // The number of colums in the board.
export const winCondition = params.get("win-condition") ? parseInt(params.get("win-condition"), 10) : (localStorageSettings ? localStorageSettings.winCondition : 3); // The number of symbols in a row to win.
const gameMode = params.get("game-mode") || (localStorageSettings ? localStorageSettings.gameMode : gameModes.CLASSIC); // The game mode (classic or column).
export const minimaxDepth = 5; // The depth of the minimax algorithm. The higher the number, the more time it takes to calculate the best move.

export let players = [];
for (let i = 0; i < 4; i++)
{
    let playerParam = params.get('player' + i);
    if (playerParam)
    {
        players.push(playerParam);
    }
}
if (players.length < 2 && localStorageSettings)
{
    players = localStorageSettings.players.slice(0, 4);
}
if (players.length < 2)
{
    players = [...Array(2).fill(playerTypes.PLAYER), ...players];
}
const realPlayersCount = players.filter(player => player === playerTypes.PLAYER).length;
console.log(`Real players: ${realPlayersCount}`);

const restartButton = document.querySelector('#restart');
const volumeSlider = document.querySelector('#volume');
const board = document.querySelector('#board');
const status = document.querySelector('#status');
const elevatorMusic = document.querySelector('#elevator-music');
elevatorMusic.volume = localStorage.getItem("volume") || 0.5;
let playPromise = undefined;

let playerTiles;
export let currentPlayer;
export let boardState;
let boardArray;
let columnsArray;
export let freeTiles;
let gameOver;
let botThinking;
let lastMove;

function resetVariables()
{
    playerTiles = [];
    for (let i = 0; i < players.length; i++)
    {
        playerTiles.push([]);
    }
    currentPlayer = 0;
    boardState = [];
    boardArray = [];
    columnsArray = [];
    freeTiles = [];
    gameOver = false;
    botThinking = false;
    lastMove = undefined;
    elevatorMusic.currentTime = 0;
}

const statusMessages =
{
    BOT_THINKING: () => `Bot ${playerSymbols[currentPlayer]} myśli...`,
    PLAYER_TURN: () => `Tura gracza: ${playerSymbols[currentPlayer]}`,
    YOUR_TURN: () => `Twoja kolej, ${playerSymbols[currentPlayer]}!`,
    WIN: () => `${playerSymbols[currentPlayer]} wygrywa!`,
    DRAW: () => "Nikt nie wygrywa!"
}

function startGame()
{
    generateBoard();
    changeStatus();
}
function generateBoard()
{
    board.innerHTML = '';
    if (gameMode === gameModes.COLUMN)
    {
        board.classList.add('column-mode');
    }
    else
    {
        board.classList.remove('column-mode');
    }
    resetVariables();
    for (let i = 0; i < cols; i++)
    {
        const column = document.createElement('div');
        column.classList.add('column');
        column.setAttribute('data-col', i.toString());
        board.appendChild(column);
        columnsArray.push(column);
    }
    for (let i = 0; i < rows; i++)
    {
        let rowArray = [];
        let stateRow = [];
        for (let j = 0; j < cols; j++)
        {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.tabIndex = 0;
            tile.setAttribute('data-row', i.toString());
            tile.setAttribute('data-col', j.toString());
            addSubmitEvent(tile, () => placePlayerSymbol(i, j));
            columnsArray[j].appendChild(tile);
            rowArray.push(tile);
            stateRow.push('');
            freeTiles.push(tile);
        }
        document.documentElement.style.setProperty('--columns', cols.toString());
        document.documentElement.style.setProperty('--rows', rows.toString());
        boardArray.push(rowArray);
        boardState.push(stateRow);
    }
}

function placePlayerSymbol(row, col)
{
    if (botThinking === false)
    {
        placeSymbol(row, col);
    }
}
export function placeSymbol(row, col)
{
    if (gameOver === false)
    {
        if (gameMode === gameModes.COLUMN)
        {
            for (let i = rows - 1; i >= 0; i--)
            {
                if (boardState[i][col] === "")
                {
                    row = i;
                    break;
                }
            }
        }
        const tile = boardArray[row][col];
        if (boardState[row][col] === "")
        {
            tile.textContent = playerSymbols[currentPlayer];
            boardState[row][col] = playerSymbols[currentPlayer];
            playerTiles[currentPlayer].push(tile);
            freeTiles.splice(freeTiles.indexOf(tile), 1);
            if (lastMove !== undefined)
            {
                lastMove.classList.remove('last-move');
            }
            lastMove = tile;
            lastMove.classList.add('last-move');
            const winningTiles = checkWin(playerSymbols[currentPlayer]);
            if (winningTiles === false)
            {
                gameOver = true;
                changeStatusMessage(statusMessages.DRAW);
                boardArray.forEach(row => row.forEach(tile =>
                {
                    tile.classList.add("disabled");
                }));
            }
            else if (winningTiles !== null)
            {
                gameOver = true;
                changeStatusMessage(statusMessages.WIN);
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
                currentPlayer = (currentPlayer + 1) % players.length;
                changeStatus();
            }
        }
    }
}
function changeStatus()
{
    if (players[currentPlayer] !== playerTypes.PLAYER)
    {
        botThinking = true;
        changeStatusMessage(statusMessages.BOT_THINKING);
        if (players[currentPlayer] === playerTypes.MINIMAX_BOT)
        {
            document.documentElement.style.setProperty("--cursor", "wait");
            board.classList.add("loading");
            if (playMusic === true)
            {
                playElevatorMusic();
            }
        }
        setTimeout(botMove, 500);
    }
    else
    {
        botThinking = false;
        if (realPlayersCount > 1)
        {
            changeStatusMessage(statusMessages.PLAYER_TURN);
        }
        else
        {
            changeStatusMessage(statusMessages.YOUR_TURN);
        }
    }
}
function changeStatusMessage(message)
{
    status.textContent = message();
    document.title = message() + " — Kółko i krzyżyk";
}
function botMove()
{
    switch (players[currentPlayer])
    {
        case playerTypes.EASY_BOT:
            placeRandomly();
            break;
        case playerTypes.MEDIUM_BOT:
            if (tryToWin() === false && tryToBlock() === false)
            {
                placeRandomly();
            }
            break;
        case playerTypes.MINIMAX_BOT:
            const bestMove = findBestMove();
            if (bestMove !== null)
            {
                placeSymbol(bestMove.row, bestMove.col);
            }
            if (players[currentPlayer] !== playerTypes.MINIMAX_BOT || gameOver === true)
            {
                pauseElevatorMusic();
                document.documentElement.style.setProperty("--cursor", "inherit");
                board.classList.remove("loading");
            }
            else if (elevatorMusic.ended)
            {
                elevatorMusic.currentTime = 0;
                playPromise = elevatorMusic.play();
            }
            break;
    }
}

// Check if a player with the given symbol has won the game and return tiles which made them do so. Returns false if the game is a draw, null if no one has won yet.
export function checkWin(playerSymbol)
{
    // Checking rows
    for (let i = 0; i < rows; i++)
    {
        let winningTiles = [];
        for (let j = 0; j < cols; j++)
        {
            const tile = boardArray[i][j];
            if (boardState[i][j] === playerSymbol)
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
            if (boardState[i][j] === playerSymbol)
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
                if (boardState[i + k][j + k] === playerSymbol)
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
                if (boardState[i + k][j - k] === playerSymbol)
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

function playElevatorMusic()
{
    console.log(`Elevator music ready state: ${elevatorMusic.readyState}`);
    if (elevatorMusic.ended)
    {
        elevatorMusic.currentTime = 0;
    }
    playPromise = elevatorMusic.play();
    console.log("Playing elevator music");
}
function pauseElevatorMusic()
{
    if (playPromise !== undefined)
    {
        playPromise.then(_ =>
        {
            elevatorMusic.pause();
            console.log("Paused elevator music");
        })
            .catch(error =>
            {
                console.log("Error pausing elevator music: ", error);
            });
    }
}

// Main
volumeSlider.addEventListener("input", () =>
{
    elevatorMusic.volume = volumeSlider.value;
});
addClickEvent(restartButton, startGame);
startGame();