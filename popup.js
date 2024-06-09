document.getElementById('find-elements').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let className = document.getElementById('class-name').value;

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: findElementsByClass,
            args: [className],
        },
        (results) => {
            const elementsDiv = document.getElementById('elements');
            elementsDiv.innerHTML = ''; // Clear previous results
            const urls = [];
            results[0].result.forEach((element, index) => {
                let a = document.createElement('a');
                a.href = element.url;  // Use the element URL
                a.textContent = `${index + 1}. ${element.text}`;
                a.target = '_blank'; // Open in new tab
                urls.push(element.url);
                a.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent default action
                    chrome.tabs.create({ url: element.url, active: false }); // Open in new tab without redirecting current tab
                });
                let br = document.createElement('br');
                elementsDiv.appendChild(a);
                elementsDiv.appendChild(br);
            });

            // Add event listener to "Open All Websites" button
            document.getElementById('open-all-websites').addEventListener('click', () => {
                urls.forEach(url => {
                    chrome.tabs.create({ url: url, active: false });
                });
            });

            // Add event listener to "Copy All Websites" button
            document.getElementById('copy-all-websites').addEventListener('click', () => {
                const textArea = document.createElement('textarea');
                textArea.value = urls.join('\n');
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                // Show alert on the current webpage
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tab.id },
                        function: () => alert('All URLs copied to clipboard')
                    }
                );
            });
        }
    );
});

function findElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    return Array.from(elements).map(element => {
        // Ensure to get both the text content and the href (URL) of the element
        return {
            text: element.textContent,
            url: element.href || element.getAttribute('href')
        };
    });
}
