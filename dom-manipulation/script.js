// Initialize quotes array with default quotes if local storage is empty
let quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" }
];

// DOM Elements
const quoteTextElement = document.getElementById('quoteText');
const quoteAuthorElement = document.getElementById('quoteAuthor');
const generateBtn = document.getElementById('generateBtn');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const quoteInput = document.getElementById('quoteInput');
const authorInput = document.getElementById('authorInput');
const localStorageInfo = document.getElementById('localStorageInfo');
const sessionStorageInfo = document.getElementById('sessionStorageInfo');
const statusMessage = document.getElementById('statusMessage');

// 2. Check for loading quotes from local storage on initialization
function loadQuotesFromLocalStorage() {
    try {
        const storedQuotes = localStorage.getItem('quotes');
        if (storedQuotes) {
            quotes = JSON.parse(storedQuotes);
            console.log('Quotes loaded from local storage:', quotes.length);
        }
    } catch (error) {
        console.error('Error loading quotes from local storage:', error);
    }
    updateStorageInfo();
}

// 1. Check for saving quotes to local storage
function saveQuotesToLocalStorage() {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
        console.log('Quotes saved to local storage:', quotes.length);
    } catch (error) {
        console.error('Error saving quotes to local storage:', error);
        showStatus('Error saving quotes to local storage', 'error');
    }
    updateStorageInfo();
}

// 3. Check for saving the last viewed quote to session storage
function saveLastViewedQuote(quote) {
    try {
        sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
        console.log('Last viewed quote saved to session storage');
    } catch (error) {
        console.error('Error saving last viewed quote to session storage:', error);
    }
    updateStorageInfo();
}

function loadLastViewedQuote() {
    try {
        const lastQuote = sessionStorage.getItem('lastViewedQuote');
        if (lastQuote) {
            return JSON.parse(lastQuote);
        }
    } catch (error) {
        console.error('Error loading last viewed quote from session storage:', error);
    }
    return null;
}

function updateStorageInfo() {
    try {
        const quotesCount = quotes.length;
        localStorageInfo.textContent = `Local Storage: ${quotesCount} quotes`;
        
        const lastQuote = loadLastViewedQuote();
        if (lastQuote) {
            sessionStorageInfo.textContent = `Session Storage: Last quote by ${lastQuote.author}`;
        } else {
            sessionStorageInfo.textContent = 'Session Storage: No last quote';
        }
    } catch (error) {
        console.error('Error updating storage info:', error);
    }
}

function generateRandomQuote() {
    if (quotes.length === 0) {
        quoteTextElement.textContent = "No quotes available. Please add some quotes first.";
        quoteAuthorElement.textContent = "";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    quoteTextElement.textContent = `"${randomQuote.text}"`;
    quoteAuthorElement.textContent = `- ${randomQuote.author}`;
    
    // Save the last viewed quote to session storage
    saveLastViewedQuote(randomQuote);
}

function addQuote() {
    const text = quoteInput.value.trim();
    const author = authorInput.value.trim();
    
    if (!text || !author) {
        showStatus('Please enter both quote text and author', 'error');
        return;
    }
    
    const newQuote = { text, author };
    quotes.push(newQuote);
    
    // Save to local storage
    saveQuotesToLocalStorage();
    
    // Clear input fields
    quoteInput.value = '';
    authorInput.value = '';
    
    showStatus('Quote added successfully!', 'success');
    
    // Update the display with the new quote
    quoteTextElement.textContent = `"${newQuote.text}"`;
    quoteAuthorElement.textContent = `- ${newQuote.author}`;
}

// 5. Check for the exportToJsonFile function
function exportToJsonFile() {
    try {
        if (quotes.length === 0) {
            showStatus('No quotes to export', 'error');
            return;
        }
        
        const dataStr = JSON.stringify(quotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'quotes.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showStatus('Quotes exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting quotes:', error);
        showStatus('Error exporting quotes', 'error');
    }
}

// 7. Check for the importFromJsonFile function
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid format: Expected an array of quotes');
            }
            
            // Validate each quote has text and author
            for (let i = 0; i < importedQuotes.length; i++) {
                const quote = importedQuotes[i];
                if (!quote.text || !quote.author) {
                    throw new Error(`Invalid quote at index ${i}: Missing text or author`);
                }
            }
            
            quotes.push(...importedQuotes);
            saveQuotesToLocalStorage();
            
            // Reset file input
            importFileInput.value = '';
            
            showStatus(`Successfully imported ${importedQuotes.length} quotes!`, 'success');
        } catch (error) {
            console.error('Error importing quotes:', error);
            showStatus(`Import failed: ${error.message}`, 'error');
        }
    };
    
    fileReader.onerror = function() {
        showStatus('Error reading file', 'error');
    };
    
    fileReader.readAsText(file);
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    
    if (type === 'success') {
        statusMessage.classList.add('success');
    } else if (type === 'error') {
        statusMessage.classList.add('error');
    }
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
    }, 3000);
}

// Event Listeners
generateBtn.addEventListener('click', generateRandomQuote);
exportBtn.addEventListener('click', exportToJsonFile);
importFileInput.addEventListener('change', importFromJsonFile);
addQuoteBtn.addEventListener('click', addQuote);

// Initialize the application
function init() {
    loadQuotesFromLocalStorage();
    
    // Check if there's a last viewed quote in session storage
    const lastQuote = loadLastViewedQuote();
    if (lastQuote) {
        quoteTextElement.textContent = `"${lastQuote.text}"`;
        quoteAuthorElement.textContent = `- ${lastQuote.author}`;
    } else {
        generateRandomQuote();
    }
    
    updateStorageInfo();
}

// Start the application
init();