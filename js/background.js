browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get('userInput', (result) => {
    if (result.userInput) {
      console.log('Retrieved user input:', result.userInput); 
    }
  });
});

