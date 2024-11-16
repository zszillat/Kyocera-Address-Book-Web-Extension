

// Disable input field when increment option is selected
document.querySelectorAll('input[name="numbering-method"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const incrementInput = document.getElementById('increment-input');
        if (document.getElementById('increment-numbers').checked) {
            incrementInput.disabled = false;
        } else {
            incrementInput.disabled = true;
        }
    });
});

/**
 * Sends a POST request to the printer's API to add a new address or perform any other action.
 *
 * @param {string} ip - The IP address of the printer (e.g., '172.16.20.242').
 * @param {string} apilink - The API endpoint (e.g., 'basic/set.cgi').
 * @param {object} jsonData - The data to send (should be in the format of the payload object).
 * @returns {Promise} - Resolves with the response text or JSON from the server.
 */
function sendPostRequest(ip, apilink, jsonData) {
    // Construct the full URL using the provided IP address and API link
    const url = `https://${ip}/${apilink}`;
  
    // Convert the JSON data to URL-encoded format
    const urlEncodedData = new URLSearchParams(jsonData).toString();
  
    // Send the POST request using fetch
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',  // Content type must be URL encoded
        'Accept': 'text/html, application/xhtml+xml, application/xml;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br, zstd',  // Matching accept encoding
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': navigator.userAgent,  // Automatically uses browser's user-agent
        'Origin': `https://${ip}`,
        'Referer': `https://${ip}/basic/AddrBook_Addr_NewCntct_Prpty.htm?arg1=1&arg2=0&arg3=&arg4=0&arg5=&arg6=1&arg50=0`
      },
      body: urlEncodedData // Body is the URL-encoded string
    })
      .then(response => response.text())  // You can change this to response.json() if the response is JSON
      .then(data => {
        console.log('Success:', data);
        return data;
      })
      .catch((error) => {
        console.error('Error:', error);
        throw error;  // Propagate the error for further handling if necessary
      });
  }
  

// Form Submission
document.getElementById('extension-form').addEventListener('submit', function(event) {
    // Prevent the default form submission
    event.preventDefault();

    // Get form elements
    const formElements = event.target.elements;

    // Assign each form input to a variable
    const ip = formElements['ip'].value;
    const printer = formElements['printer'].value;
    const csvFile = formElements['csv-file'].files[0]; // Handle file input
    const numberingMethod = formElements['numbering-method'].value;
    const incrementInput = formElements['increment-input'].value;

    var i = 1

    if (numberingMethod == 'increment-numbers') {
        i = incrementInput;
    }

    // Use chrome.runtime.getURL to get the path to the JSON file in the extension
    const jsonFileUrl = chrome.runtime.getURL(`templates/${printer}.json`);

    // Fetch the JSON file
    fetch(jsonFileUrl)
        .then(response => response.json()) // Parse the response as JSON
        .then(jsonData => {

            console.log(jsonData);

            const jsonCSV = jsonData['csv_fields'];
            const jsonPost = jsonData['json'];
        
            // Use FileReader to read the file
            const reader = new FileReader();
        
            reader.onload = function(event) {
            // Parse the CSV content using PapaParse
            const csvContent = event.target.result;
        
            // Parse CSV using PapaParse
            Papa.parse(csvContent, {
                complete: function(results) {
                // The results object contains the parsed data
                const headers = results.meta.fields; // The CSV headers
                const rows = results.data; // The CSV rows
                
                // Loop through each row
                rows.forEach((row, rowIndex) => {
        
                    var jsonWorkablePost = jsonPost;
        
                    // Loop through each header
                    headers.forEach(header => {
        
                        var complexHeaderName = jsonCSV[header.trim()];
                        jsonWorkablePost[complexHeaderName] = row[header]
        
                    });
        
                    if (numberingMethod == 'increment-numbers') {
                        json.jsonWorkablePost[
                            jsonCSV['Number']
                        ] = i;
        
                        i++;
                    }
        
                    sendPostRequest(
                        ip, 
                        jsonData['apiLink'], 
                        jsonWorkablePost)
                });
        
                },
                header: true, // Treat the first row as headers
                skipEmptyLines: true, // Skip empty lines
            });
            };
        
            // Read the file as text
            reader.readAsText(csvFile);






        })
        .catch(error => {
            console.error('Error loading JSON file:', error);
        });
    
});
