export function addClickEvent(element, callback)
{
    element.addEventListener("click", callback);
}
export function addSubmitEvent(element, callback)
{
    element.addEventListener("click", callback);
    element.addEventListener("keypress", event =>
    {
        if (event.key === "Enter")
        {
            callback();
        }
    });
}