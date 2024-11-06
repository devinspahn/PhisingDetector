console.log("Content script is running.");

let previousEmailContent = ""; // Store previous content for comparison

// Retrieve the main email text
function retrieveEmailText() {
    const emailBody = document.querySelector("div.a3s"); // Gmail's email content area
    return emailBody ? emailBody.innerText.trim() : null;
}

// Check for new email content and request analysis if found
function verifyEmail() {
    const currentEmailText = retrieveEmailText();
    if (currentEmailText && currentEmailText !== previousEmailContent) {
        console.log("Detected new email content for analysis:", currentEmailText);
        previousEmailContent = currentEmailText; // Update stored content

        // Send message to background script for phishing analysis
        chrome.runtime.sendMessage(
            { action: "analyzePhishing", emailContent: currentEmailText },
            (response) => {
                if (response && response.error) {
                    console.error("Error during analysis:", response.error);
                } else if (response && response.isPhishing) {
                    alert("Warning: This email could be a phishing attempt.\nExplanation: " + response.explanation);
                } else if (response) {
                    alert("Email appears safe.\nExplanation: " + response.explanation);
                } else {
                    console.log("Background script did not provide a response.");
                }
            }
        );
    } else if (!currentEmailText) {
        console.log("No email content available.");
    }
}

// Periodically check for changes in email content every 2 seconds
setInterval(verifyEmail, 2000); // Interval in milliseconds
