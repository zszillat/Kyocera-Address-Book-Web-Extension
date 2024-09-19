var globalAddressBookJSON;
var globalKeysJSON;

const JSONTab = document.getElementById("JSONTab");
const CSVTab = document.getElementById("CSVTab");
const textArea = document.getElementById("addressBook");

// Helper function to toggle display style
function toggleDisplay(elementId, displayStyle) {
    document.getElementById(elementId).style.display = displayStyle;
}

// Open and close functions
function openElement(elementId) {
    toggleDisplay(elementId, "flex");
}

function closeElement(elementId) {
    toggleDisplay(elementId, "none");
}

// Event listener setup
function setupEventListener(buttonId, closeId, openId) {
    document.getElementById(buttonId).addEventListener('click', () => {
        closeElement(closeId);
        openElement(openId);
    });
}

// Setting up event listeners
setupEventListener("editAddressBook", "main", "userInputAddressBook");
setupEventListener("editKeys", "main", "userInputKeys");
setupEventListener("backButtonAddressBook", "userInputAddressBook", "main");
setupEventListener("backButtonKeys", "userInputKeys", "main");

function JSONToCSV(jsonArray) {
    const arr = jsonArray.book;
    if (!arr.length) return '';

    const keys = [...new Set(arr.flatMap(Object.keys))]; // Extract the keys from all objects
    const header = keys.join(',');
    const rows = arr.map(obj => keys.map(key => (key in obj ? obj[key] : '')).join(','));
    return [header, ...rows].join('\n'); //combine header and rows
}

function handleJSONToCSV() {
    const JSONForm = textArea.value;
    const CSVForm = JSONToCSV(JSON.parse(JSONForm));
    textArea.value = CSVForm;
}

function CSVToJSON(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const jsonArray = [];
    
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(',');
        
        headers.forEach((header, index) => {
            obj[header] = currentLine[index];
        });
        
        jsonArray.push(obj);
    }
    
    return JSON.stringify(jsonArray, null, 2);
}

function handleCSVToJSON() {
    const CSVForm = textArea.value;
    const JSONForm = CSVToJSON(CSVForm);
    textArea.value = '{\n "book":' + JSONForm + '\n}';
}

function toggleJSONCSVTab(activeTab, inactiveTab) {
    activeTab.style.backgroundColor = "rgb(0, 195, 255)";
    inactiveTab.style.backgroundColor = "rgb(231, 231, 231)";
}

JSONTab.addEventListener('click', () => {
    if (CSVTab.style.backgroundColor === "rgb(0, 195, 255)") {
        toggleJSONCSVTab(JSONTab, CSVTab);
        handleCSVToJSON();
    }
});

CSVTab.addEventListener('click', () => {
    if (window.getComputedStyle(JSONTab).backgroundColor === "rgb(0, 195, 255)") {
        toggleJSONCSVTab(CSVTab, JSONTab);
        handleJSONToCSV();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    // Generic function to load JSON from browser storage
    const loadFromStorage = (key, inputElementId, globalVar) => {
        browser.storage.local.get(key, (result) => {
            if (result[key]) {
                document.getElementById(inputElementId).value = result[key];
                window[globalVar] = JSON.parse(result[key]);
            }
        });
    };

    // Generic function to save JSON to browser storage
    const saveToStorage = (key, inputElementId, globalVar) => {
        const jsonValue = document.getElementById(inputElementId).value;
        browser.storage.local.set({ [key]: jsonValue }, () => {});
        window[globalVar] = JSON.parse(jsonValue);
    };

    // Load and save logic for address book and keys
    loadFromStorage('addressBookJSON', 'addressBook', 'globalAddressBookJSON');
    loadFromStorage('keysJSON', 'keys', 'globalKeysJSON');

    // Address book save handler
    document.getElementById('saveAddressBook').addEventListener('click', () => {
        if (CSVTab.style.backgroundColor === "rgb(0, 195, 255)") {
            document.getElementById('JSONTab').click();
        }
        saveToStorage('addressBookJSON', 'addressBook', 'globalAddressBookJSON');
        closeElement('userInputAddressBook');
        openElement('main');
    });

    // Keys save handler
    document.getElementById('saveKeys').addEventListener('click', () => {
        saveToStorage('keysJSON', 'keys', 'globalKeysJSON');
        closeElement('userInputKeys');
        openElement('main');
    });
});

function inject(inputId, inputText) {
    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
            action: "replace",
            id: inputId,
            text: inputText,
        });
    });
}

function retrieve(inputId) {}

function submitForm(id) {
    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
            action: "submitForm",
            id: id,
        });
    });
}

document.getElementById('start').addEventListener('click', () => {
    var arr = globalAddressBookJSON.book;
    //for each contact
    for (var i=0; i<arr.length; i++) {
        var obj = arr[i];
        //for each field
        for (var key in obj) { inject(globalKeysJSON[key], arr[i][key]) }
        submitForm(globalAddressBookJSON.book[0].submitButton);
    }
});
