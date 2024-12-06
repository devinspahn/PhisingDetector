const apiKey = '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';
const endpoint = 'https://api.openai.com/v1/chat/completions';

console.log("Background script loaded.");

async function fetchCompletion(promptText) {
    console.log("Preparing to fetch completion for:", promptText);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                    { "role": "system", "content": "You are an email security assistant that detects phishing emails." },
                    { "role": "user", "content": `Is the following email a phishing attempt? Please answer with a clear 'Yes' or 'No' and provide a brief explanation.\n\n${promptText}` }
                ],
                max_tokens: 50,
                temperature: 0.3
            })
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const completionText = data.choices[0].message.content.trim();
        console.log("Received completion:", completionText);
        return completionText;
    } catch (error) {
        console.error("Error fetching completion:", error);
        return null;
    }
}

// Listener for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message in background script:", request);

    if (request.action === "analyzePhishing") {
        const emailContent = request.emailContent;
        console.log("Email content received for analysis:", emailContent);

        fetchCompletion(emailContent)
            .then((resultText) => {
                console.log("OpenAI response:", resultText);

                // Determine if the email is phishing based on the response content
                if (resultText && resultText.toLowerCase().startsWith("yes")) {
                    sendResponse({ isPhishing: true, explanation: resultText });
                } else if (resultText && resultText.toLowerCase().startsWith("no")) {
                    sendResponse({ isPhishing: false, explanation: resultText });
                } else {
                    sendResponse({ error: "Unclear response from OpenAI." });
                }
            })
            .catch((error) => {
                console.error("Error analyzing email:", error);
                sendResponse({ error: error.message });
            });

        return true; // Keeps the message channel open for asynchronous response
    } else {
        console.log("No action matched in background script.");
        sendResponse({ error: "Unknown action" });
    }
});
