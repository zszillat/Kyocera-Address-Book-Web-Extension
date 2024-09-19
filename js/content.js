function injectText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.value = text;
    } else {
        console.warn(`Element with ID ${id} not found.`);
    }
}

function handleMessage(message) {
    const element = document.getElementById(message.id);

    switch (message.action) {
        case "replace":
            if (element) {
                injectText(message.id, message.text);
            } else {
                console.warn(`Element with ID ${message.id} not found for replace action.`);
            }
            break;

        case "submitForm":
            if (element) {
                element.click();
            } else {
                console.warn(`Element with ID ${message.id} not found for submitForm action.`);
            }
            break;

        default:
            console.warn(`Unknown action: ${message.action}`);
    }
}

browser.runtime.onMessage.addListener(handleMessage);
