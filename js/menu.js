import { playerSymbols } from "./script.js";
import { addClickEvent } from "./helper.js";

const gameSettingsForm = document.getElementById('game-settings');
const playersList = document.getElementById('players-list');
const addPlayerBtn = document.getElementById('add-player');
const removePlayerBtn = document.getElementById('remove-player');
const gameModeSelect = document.getElementById('game-mode');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const winConditionInput = document.getElementById('win-condition');
const warning = document.getElementById('warning');
const warningInfos = document.getElementById('warning-infos');

const sourcesButton = document.getElementById('sources');
const sourcesDialog = document.getElementById('sources-dialog');

const warningTypes =
{
    BOTS_COLUMN_MODE: "Boty nie są w pełni przystosowane do trybu kolumnowego i mogą wykonywać irracjonalne ruchy.",
    BOTS_LARGE_BOARD: "Na większych planszach trudny bot może wcale nie być już aż taki trudny. Ponadto im większa jest plansza, tym trudny bot dłużej myśli. Nie zamykaj strony, gdy przeglądarka wyświetli komunikat „Strona nie odpowiada”.",
}

let playersCount = 2;
const maxPlayers = 4;
const minPlayers = 2;

function createPlayerField(index, value = null)
{
    const wrapper = document.createElement('div');
    wrapper.classList.add('player-field');

    const label = document.createElement('label');
    label.setAttribute('for', 'player' + index);
    label.textContent = 'Gracz ' + (index + 1) + ' (' + playerSymbols[index] + '):';

    const select = document.createElement('select');
    select.id = 'player' + index;
    select.name = 'player' + index;
    select.required = true;

    const options =
    [
        { value: 'player', text: 'Gracz' },
        { value: 'easy-bot', text: 'Łatwy bot' },
        { value: 'medium-bot', text: 'Średni bot' },
        { value: 'minimax-bot', text: 'Trudny bot (Minimax)' }
    ];

    options.forEach(opt =>
    {
        const optionElem = document.createElement('option');
        optionElem.value = opt.value;
        optionElem.textContent = opt.text;
        select.appendChild(optionElem);
    });

    if (value)
    {
        console.log(index + ': ' + value);
        select.value = value;
    }

    select.addEventListener('change', e => updateWarning);

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    return wrapper;
}

function updatePlayersList(values = null)
{
    playersList.innerHTML = '';
    for (let i = 0; i < playersCount; i++) {
        playersList.appendChild(createPlayerField(i, values ? values[i] : null));
    }
}
function addPlayer(index)
{
    playersList.appendChild(createPlayerField(index));
    updateWarning();
}
function removePlayer(index)
{
    playersList.removeChild(playersList.children[index]);
    updateWarning();
}

addPlayerBtn.addEventListener('click', () =>
{
    if (playersCount < maxPlayers)
    {
        playersCount++;
        addPlayer(playersCount - 1);
    }
});

removePlayerBtn.addEventListener('click', () =>
{
    if (playersCount > minPlayers)
    {
        playersCount--;
        removePlayer(playersCount);
    }
});

gameModeSelect.addEventListener('change', () =>
{
    updateWarning();
});
rowsInput.addEventListener('input', updateWarning);
colsInput.addEventListener('input', updateWarning);
winConditionInput.addEventListener('input', updateWarning);

function checkMinimaxBotCount()
{
    return Array.from(playersList.children).filter((player) =>
    {
        const select = player.querySelector('select');
        return select && select.value === 'minimax-bot';
    }).length;
}

function updateWarning()
{
    const gameMode = gameModeSelect.value;
    const rowsValue = parseInt(rowsInput.value, 10);
    const colsValue = parseInt(colsInput.value, 10);
    const winConditionValue = parseInt(winConditionInput.value, 10);

    let hide = true;
    warning.classList.remove('hidden');
    warningInfos.innerHTML = '';
    if (rowsValue < winConditionValue && colsValue < winConditionValue)
    {
        winConditionInput.value = rowsValue > colsValue ? rowsValue : colsValue;
    }
    if (gameMode === 'column')
    {
        hide = false;
        let p = document.createElement('p');
        p.innerHTML = warningTypes.BOTS_COLUMN_MODE;
        warningInfos.appendChild(p);
    }
    if (checkMinimaxBotCount() > 0 && (rowsValue > 3 || colsValue > 3))
    {
        hide = false;
        let p = document.createElement('p');
        p.innerHTML = warningTypes.BOTS_LARGE_BOARD;
        warningInfos.appendChild(p);
    }
    if (hide === true)
    {
        warning.classList.add('hidden');
    }
}

gameSettingsForm.addEventListener('submit', function(event)
{
    const gameSettings = {
        rows: document.getElementById('rows').value,
        cols: document.getElementById('cols').value,
        winCondition: document.getElementById('win-condition').value,
        gameMode: document.getElementById('game-mode').value
    };

    const players = [];
    for (let i = 0; i < gameSettingsForm.querySelectorAll('.player-field').length; i++) {
        const playerSelect = document.getElementById('player' + i);
        if (playerSelect) {
            players.push(playerSelect.value);
        }
    }
    gameSettings.players = players;

    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
});


const savedSettings = localStorage.getItem("gameSettings");
if (savedSettings)
{
    const settings = JSON.parse(savedSettings);

    if (settings.rows) rowsInput.value = settings.rows;
    if (settings.cols) colsInput.value = settings.cols;
    if (settings.winCondition) winConditionInput.value = settings.winCondition;
    if (settings.gameMode) gameModeSelect.value = settings.gameMode;

    const players = settings.players;
    if (Array.isArray(players))
    {
        console.log(players);
        playersCount = players.length > minPlayers && players.length <= maxPlayers ? players.length : minPlayers;
        updatePlayersList(players);
        updateWarning();
    }
}
else
{
    updateWarning();
    updatePlayersList();
}

addClickEvent(sourcesButton, () => sourcesDialog.showModal());