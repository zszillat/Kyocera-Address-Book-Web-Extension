chrome.browserAction.onClicked.addListener(() => {
    const width = 450; // Desired width
    const height = 650; // Desired height
    const left = Math.round((screen.width - width) / 2); // Center on the screen
    const top = Math.round((screen.height - height) / 2);
  
    chrome.windows.create(
      {
        url: chrome.runtime.getURL("persistent.html"), // The options page
        type: "popup", // Opens as a popup window
        width: width,
        height: height,
        left: left,
        top: top
      },
      (newWindow) => {
        console.log("Options page opened in a new window:", newWindow);
      }
    );
  });
  