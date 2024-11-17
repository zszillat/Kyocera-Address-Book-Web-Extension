// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.type === 'logData') {
//         bgSendPostRequest(message.ip, message.apiLink, message.jsonData);
//     }
// });

// /**
//  * Sends a POST request to the printer's API to add a new address or perform any other action.
//  *
//  * @param {string} ip - The IP address of the printer (e.g., '172.16.20.242').
//  * @param {string} apilink - The API endpoint (e.g., 'basic/set.cgi').
//  * @param {object} jsonData - The data to send (should be in the format of the payload object).
//  * @returns {Promise} - Resolves with the response text or JSON from the server.
//  */
// function bgSendPostRequest(ip, apilink, jsonData) {
//     // Construct the full URL using the provided IP address and API link
//     const url = `https://${ip}/${apilink}`;
  
//     // Convert the JSON data to URL-encoded format
//     const urlEncodedData = new URLSearchParams(jsonData).toString();
  
//     // Send the POST request using fetch
//     return fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',  // Content type must be URL encoded
//         'Accept': 'text/html, application/xhtml+xml, application/xml;q=0.9',
//         'Accept-Encoding': 'gzip, deflate, br, zstd',  // Matching accept encoding
//         'Cache-Control': 'no-cache',
//         'Pragma': 'no-cache',
//         'User-Agent': navigator.userAgent,  // Automatically uses browser's user-agent
//         'Origin': `https://${ip}`,
//         'Referer': `https://${ip}/basic/AddrBook_Addr_NewCntct_Prpty.htm?arg1=1&arg2=0&arg3=&arg4=0&arg5=&arg6=1&arg50=0`
//       },
//       body: urlEncodedData // Body is the URL-encoded string
//     })
//       .then(response => response.text())  // You can change this to response.json() if the response is JSON
//       .then(data => {
//         console.log('Success:', data);
//         return data;
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//         throw error;  // Propagate the error for further handling if necessary
//       });
//   }