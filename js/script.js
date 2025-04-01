import { addClickEvent } from "./helper.js";

export const playerSymbols = ["⨉", "◯", "△", "☐"];

export let playMusic = localStorage.getItem("playMusic") !== "false";

const icon = document.querySelector("link[rel='icon']");
const soundButton = document.getElementById("sound");
const settingsButton = document.getElementById("settings");
const settingsDialog = document.getElementById("settings-dialog");
const sliders = document.querySelectorAll(".input-container.slider");
const dialogs = document.querySelectorAll('dialog');
dialogs.forEach(dialog =>
{
    const closeDialogButton = dialog.querySelector('.close');
    closeDialogButton.addEventListener("click", () => dialog.close());
});

icon.href = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "../img/icon-white.png" : "../img/icon.png";

sliders.forEach(slider =>
{
    const input = slider.querySelector("input");
    const output = slider.querySelector("output");

    input.value = localStorage.getItem(input.id) || input.value;
    output.textContent = (input.value * 100).toFixed(0) + "%";

    input.addEventListener("input", () =>
    {
        output.textContent = (input.value * 100).toFixed(0) + "%";
        localStorage.setItem(input.id, input.value);
    });
});

if (playMusic === false)
{
    soundButton.classList.add("off");
}
addClickEvent(soundButton, () =>
{
    playMusic = !playMusic;
    localStorage.setItem("playMusic", playMusic);
    soundButton.classList.toggle("off");
    console.log("chuj JS w dupę");
});
addClickEvent(settingsButton, () =>
{
    settingsDialog.showModal();
});