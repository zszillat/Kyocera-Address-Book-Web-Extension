function formatNumber(num) {
return   num.toString().padStart(4, '0');
}

// Toggle input field based on selected numbering method
document.querySelectorAll('input[name="numbering-method"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.getElementById('increment-input').disabled = !document.getElementById('increment-numbers').checked;
    });
});

/**
 * Sends a POST request to the printer's API.
 */
async function sendPostRequest(ip, apilink, jsonData) {
    const url = `https://${ip}/${apilink}`;
    const urlEncodedData = new URLSearchParams(jsonData).toString();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html, application/xhtml+xml, application/xml;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'User-Agent': navigator.userAgent,
                'Origin': `https://${ip}`,
                'Referer': `https://${ip}/basic/AddrBook_Addr_NewCntct_Prpty.htm`
            },
            body: urlEncodedData
        });
        return await response.text();
    } catch (error) {
        throw error;
    }
}

// Handle form submission
document.getElementById('extension-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    document.getElementById('loading').style.visibility = "visible";

    const formElements = event.target.elements;
    const ip = formElements['ip'].value;
    const csvFile = formElements['csv-file'].files[0];
    const numberingMethod = formElements['numbering-method'].value;
    let incrementInput = formElements['increment-input'].value;

    let i = (numberingMethod === 'increment') ? incrementInput : 1;
    console.log(i);
    const jsonFileUrl = chrome.runtime.getURL(`template.json`);

    try {
        const jsonData = await fetch(jsonFileUrl).then(response => response.json());
        const { csv_fields: jsonCSV, json: jsonPost, apiLink } = jsonData;
        
        const csvContent = await csvFile.text();
        const { data: rows, meta: { fields: headers } } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

        const postPromises = rows.map(row => {
            let jsonWorkablePost = { ...jsonPost };
            headers.forEach(header => {
                const complexHeaderName = jsonCSV[header.trim()];
                jsonWorkablePost[complexHeaderName] = row[header];
            });

            console.log(numberingMethod)
            if (numberingMethod === 'increment') {
                jsonWorkablePost[jsonCSV['Number']] = i;
                i++
            }

            jsonWorkablePost[jsonCSV['Number']] = formatNumber(jsonWorkablePost[jsonCSV['Number']]);
            console.log(jsonWorkablePost[jsonCSV['Number']]);
            return sendPostRequest(ip, apiLink, jsonWorkablePost);
        });

        await Promise.all(postPromises);
        document.getElementById('complete').style.visibility = "visible";
    } catch (error) {
        console.error(error);
    } finally {
        document.getElementById('loading').style.visibility = "hidden";
    }
});

document.addEventListener("DOMContentLoaded", () => {

    //get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        let currentTab = tabs[0];
        console.log(currentTab.url);

        if (currentTab) {
          document.getElementById('ip').textContent = "Current URL: " + currentTab.url;
 
        }
    });

    const infoElement = document.getElementById("info");
    const defaultInfoMessage = "Hover over a field and more info will appear here";
  
    // Mapping hover targets to their explanations
    const hoverMessages = {
      lineIP: "Enter the IP address of the device here.",
      lineCSV: "Upload a CSV file containing the address book. For a template csv please see example.csv in the github repository",
      lineNumbering: "Number can be left blank in the CSV and increment will increment each address automatically",
      lineStartNumber: "Set this to one higher than the highest already existing number, or leave it at 1 if starting with a blank address book",
    };
  
    // Add hover event listeners to relevant elements
    Object.keys(hoverMessages).forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("mouseenter", () => {
          infoElement.textContent = hoverMessages[id];
        });
        element.addEventListener("mouseleave", () => {
          infoElement.textContent = defaultInfoMessage;
        });
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        let currentTab = tabs[0];
        if (currentTab) {
            document.getElementById('lineIP').style.display = "none";
          document.getElementById('ip').value = cleanUrl(currentTab.url);
        }
      });

  });

  function cleanUrl(url) {
    // Remove the "https://" prefix if it exists
    if (url.startsWith('https://')) {
      url = url.slice(8);
    }
    
    // Remove the trailing slash if it exists
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    
    return url;
  }