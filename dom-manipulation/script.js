// Initialize quotes array with default quotes if local storage is empty
let quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Success" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "Life" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Motivation" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", category: "Inspiration" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Motivation" },
    { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt", category: "Life" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" },
    { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt", category: "Wisdom" },
    { text: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead", category: "Humor" }
];

// DOM Elements
const quoteTextElement = document.getElementById('quoteText');
const quoteAuthorElement = document.getElementById('quoteAuthor');
const quoteCategoryElement = document.getElementById('quoteCategory');
const generateBtn = document.getElementById('generateBtn');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const quoteInput = document.getElementById('quoteInput');
const authorInput = document.getElementById('authorInput');
const categoryInput = document.getElementById('categoryInput');
const customCategoryInput = document.getElementById('customCategoryInput');
const customCategoryGroup = document.getElementById('customCategoryGroup');
const categoryFilter = document.getElementById('categoryFilter');
const localStorageInfo = document.getElementById('localStorageInfo');
const sessionStorageInfo = document.getElementById('sessionStorageInfo');
const statusMessage = document.getElementById('statusMessage');
const quotesCount = document.getElementById('quotesCount');

// 1. Populate Categories Dynamically
function populateCategories() {
    try {
        // Extract unique categories from quotes
        const categories = [...new Set(quotes.map(quote => quote.category))];
        
        // Clear existing options except the first one
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Add categories to the filter dropdown
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        console.log('Categories populated:', categories);
    } catch (error) {
        console.error('Error populating categories:', error);
    }
}

// 2. Filter Quotes Based on Selected Category
function filterQuotes() {
    try {
        const selectedCategory = categoryFilter.value;
        
        // Filter quotes based on selected category
        let filteredQuotes;
        if (selectedCategory === 'all') {
            filteredQuotes = quotes;
        } else {
            filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        }
        
        // Update quotes count display
        quotesCount.textContent = `${filteredQuotes.length} quotes${selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}`;
        
        // Save the selected category to local storage
        localStorage.setItem('lastSelectedCategory', selectedCategory);
        
        console.log(`Filtered quotes by category: ${selectedCategory}, found ${filteredQuotes.length} quotes`);
        
        return filteredQuotes;
    } catch (error) {
        console.error('Error filtering quotes:', error);
        return quotes;
    }
}

// Load quotes from local storage on initialization
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
    
    // Populate categories after loading quotes
    populateCategories();
    updateStorageInfo();
}

// Save quotes to local storage
function saveQuotesToLocalStorage() {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
        console.log('Quotes saved to local storage:', quotes.length);
    } catch (error) {
        console.error('Error saving quotes to local storage:', error);
        showStatus('Error saving quotes to local storage', 'error');
    }
    
    // Update categories when quotes change
    populateCategories();
    updateStorageInfo();
}

// Save last viewed quote to session storage
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
        const quotesCountValue = quotes.length;
        localStorageInfo.textContent = `Local Storage: ${quotesCountValue} quotes`;
        
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
    const filteredQuotes = filterQuotes();
    
    if (filteredQuotes.length === 0) {
        quoteTextElement.textContent = "No quotes available in this category. Please add some quotes first.";
        quoteAuthorElement.textContent = "";
        quoteCategoryElement.textContent = "";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    quoteTextElement.textContent = `"${randomQuote.text}"`;
    quoteAuthorElement.textContent = `- ${randomQuote.author}`;
    quoteCategoryElement.textContent = randomQuote.category;
    
    // Save the last viewed quote to session storage
    saveLastViewedQuote(randomQuote);
}

function addQuote() {
    const text = quoteInput.value.trim();
    const author = authorInput.value.trim();
    let category = categoryInput.value;
    
    if (category === 'other') {
        category = customCategoryInput.value.trim();
        if (!category) {
            showStatus('Please enter a custom category', 'error');
            return;
        }
    }
    
    if (!text || !author || !category) {
        showStatus('Please enter both quote text, author, and category', 'error');
        return;
    }
    
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    
    // Save to local storage
    saveQuotesToLocalStorage();
    
    // Clear input fields
    quoteInput.value = '';
    authorInput.value = '';
    customCategoryInput.value = '';
    categoryInput.value = 'Inspiration';
    customCategoryGroup.style.display = 'none';
    
    showStatus('Quote added successfully!', 'success');
    
    // Update the display with the new quote
    quoteTextElement.textContent = `"${newQuote.text}"`;
    quoteAuthorElement.textContent = `- ${newQuote.author}`;
    quoteCategoryElement.textContent = newQuote.category;
    
    // Update the filter to show the new category
    filterQuotes();
}

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
            
            // Validate each quote has text, author, and category
            for (let i = 0; i < importedQuotes.length; i++) {
                const quote = importedQuotes[i];
                if (!quote.text || !quote.author || !quote.category) {
                    throw new Error(`Invalid quote at index ${i}: Missing text, author, or category`);
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
categoryFilter.addEventListener('change', filterQuotes);

// Show/hide custom category input
categoryInput.addEventListener('change', function() {
    if (this.value === 'other') {
        customCategoryGroup.style.display = 'block';
    } else {
        customCategoryGroup.style.display = 'none';
    }
});

// Initialize the application
function init() {
    loadQuotesFromLocalStorage();
    
    // Restore the last selected category when the page loads
    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory');
    if (lastSelectedCategory) {
        categoryFilter.value = lastSelectedCategory;
    }
    
    // Apply initial filter
    filterQuotes();
    
    // Check if there's a last viewed quote in session storage
    const lastQuote = loadLastViewedQuote();
    if (lastQuote) {
        quoteTextElement.textContent = `"${lastQuote.text}"`;
        quoteAuthorElement.textContent = `- ${lastQuote.author}`;
        quoteCategoryElement.textContent = lastQuote.category;
    } else {
        generateRandomQuote();
    }
    
    updateStorageInfo();
}

// Start the application
init();