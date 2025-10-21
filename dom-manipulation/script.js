









// Initial quotes data
const initialQuotes = [
    {
        id: 1,
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "Work",
        lastModified: new Date().toISOString()
    },
    {
        id: 2,
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
        category: "Innovation",
        lastModified: new Date().toISOString()
    },
    {
        id: 3,
        text: "Your time is limited, so don't waste it living someone else's life.",
        author: "Steve Jobs",
        category: "Life",
        lastModified: new Date().toISOString()
    },
    {
        id: 4,
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "Dreams",
        lastModified: new Date().toISOString()
    }
];

// Server simulation constants
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 30000; // 30 seconds
const SERVER_DELAY = 1000; // Simulate network delay

// DOM elements
const quotesContainer = document.getElementById('quotesContainer');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCategory = document.getElementById('quoteCategory');
const notification = document.getElementById('notification');
const syncStatus = document.getElementById('syncStatus');
const manualSyncBtn = document.getElementById('manualSyncBtn');
const conflictModal = document.getElementById('conflictModal');
const conflictList = document.getElementById('conflictList');
const useServerDataBtn = document.getElementById('useServerData');
const useLocalDataBtn = document.getElementById('useLocalData');
const mergeDataBtn = document.getElementById('mergeData');

// Global variables
let syncInterval;
let lastSyncTime = localStorage.getItem('lastSyncTime') || null;
let pendingChanges = JSON.parse(localStorage.getItem('pendingChanges')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Load quotes from localStorage or use initial quotes
    let quotes = JSON.parse(localStorage.getItem('quotes')) || initialQuotes;
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // Initialize server data simulation
    initializeServerData();
    
    // Populate categories dropdown
    populateCategories();
    
    // Restore last selected filter
    restoreFilter();
    
    // Display quotes based on current filter
    filterQuotes();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', getRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    manualSyncBtn.addEventListener('click', manualSync);
    useServerDataBtn.addEventListener('click', () => resolveConflict('server'));
    useLocalDataBtn.addEventListener('click', () => resolveConflict('local'));
    mergeDataBtn.addEventListener('click', () => resolveConflict('merge'));
    
    // Start periodic syncing
    startPeriodicSync();
    
    // Initial sync
    setTimeout(syncWithServer, 2000);
}

// Initialize mock server data
async function initializeServerData() {
    if (!localStorage.getItem('serverQuotes')) {
        localStorage.setItem('serverQuotes', JSON.stringify(initialQuotes));
    }
}

// Function to populate categories dropdown
function populateCategories() {
    // Clear existing options except the first one
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Get quotes from localStorage
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    // Extract unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    // Get selected category
    const selectedCategory = categoryFilter.value;
    
    // Save selected filter to localStorage
    localStorage.setItem('selectedCategory', selectedCategory);
    
    // Get quotes from localStorage
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    // Filter quotes based on selected category
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display filtered quotes
    displayQuotes(filteredQuotes);
}

// Function to display quotes in the container
function displayQuotes(quotes) {
    // Clear the container
    quotesContainer.innerHTML = '';
    
    // Display each quote
    quotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-container';
        quoteElement.innerHTML = `
            <p class="quote-text">"${quote.text}"</p>
            <p class="quote-author">- ${quote.author}</p>
            <span class="quote-category">${quote.category}</span>
            ${quote.unsynced ? '<div class="unsynced-badge">Unsynced</div>' : ''}
        `;
        quotesContainer.appendChild(quoteElement);
    });
    
    // If no quotes match the filter, show a message
    if (quotes.length === 0) {
        quotesContainer.innerHTML = '<p class="no-quotes">No quotes found for this category.</p>';
    }
}

// Function to get a random quote
function getRandomQuote() {
    // Get quotes from localStorage
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    if (quotes.length === 0) return;
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    // Display only the random quote
    displayQuotes([randomQuote]);
    
    // Update filter to show "All Categories" since we're showing a random quote
    categoryFilter.value = 'all';
    localStorage.setItem('selectedCategory', 'all');
}

// Function to add a new quote
function addQuote() {
    // Get form values
    const text = quoteText.value.trim();
    const author = quoteAuthor.value.trim();
    const category = quoteCategory.value.trim();
    
    // Validate inputs
    if (!text || !author || !category) {
        showNotification('Please fill in all fields', true);
        return;
    }
    
    // Create new quote object
    const newQuote = {
        id: Date.now(), // Simple ID generation
        text,
        author,
        category,
        lastModified: new Date().toISOString(),
        unsynced: true
    };
    
    // Get existing quotes from localStorage
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    // Add new quote
    quotes.push(newQuote);
    
    // Save updated quotes to localStorage
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // Add to pending changes
    pendingChanges.push({
        type: 'add',
        data: newQuote,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
    
    // Update categories dropdown
    populateCategories();
    
    // Clear form
    quoteText.value = '';
    quoteAuthor.value = '';
    quoteCategory.value = '';
    
    // Show success notification
    showNotification('Quote added successfully!');
    
    // Refresh quotes display
    filterQuotes();
    
    // Trigger sync
    syncWithServer();
}

// Function to restore last selected filter
function restoreFilter() {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        categoryFilter.value = savedCategory;
    }
}

// Start periodic syncing with server
function startPeriodicSync() {
    syncInterval = setInterval(syncWithServer, SYNC_INTERVAL);
}

// Manual sync trigger
function manualSync() {
    syncWithServer();
}

// Main sync function
async function syncWithServer() {
    updateSyncStatus('syncing', 'Syncing...');
    
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, SERVER_DELAY));
        
        // Get server data (simulated)
        const serverQuotes = JSON.parse(localStorage.getItem('serverQuotes')) || [];
        const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
        
        // Check for conflicts
        const conflicts = detectConflicts(localQuotes, serverQuotes);
        
        if (conflicts.length > 0) {
            showConflictModal(conflicts);
        } else {
            // No conflicts, proceed with normal sync
            await performSync(localQuotes, serverQuotes);
        }
        
        updateSyncStatus('synced', 'Synced');
        lastSyncTime = new Date().toISOString();
        localStorage.setItem('lastSyncTime', lastSyncTime);
        
    } catch (error) {
        console.error('Sync failed:', error);
        updateSyncStatus('error', 'Sync Failed');
        showNotification('Sync failed. Please try again.', true);
    }
}

// Detect conflicts between local and server data
function detectConflicts(localQuotes, serverQuotes) {
    const conflicts = [];
    
    // Check for modified quotes
    localQuotes.forEach(localQuote => {
        const serverQuote = serverQuotes.find(sq => sq.id === localQuote.id);
        if (serverQuote && 
            serverQuote.lastModified !== localQuote.lastModified &&
            new Date(serverQuote.lastModified) > new Date(localQuote.lastModified)) {
            conflicts.push({
                type: 'modified',
                local: localQuote,
                server: serverQuote
            });
        }
    });
    
    // Check for quotes deleted on server but present locally
    localQuotes.forEach(localQuote => {
        if (!serverQuotes.find(sq => sq.id === localQuote.id)) {
            conflicts.push({
                type: 'removed',
                local: localQuote,
                server: null
            });
        }
    });
    
    return conflicts;
}

// Show conflict resolution modal
function showConflictModal(conflicts) {
    conflictList.innerHTML = '';
    
    conflicts.forEach(conflict => {
        const conflictItem = document.createElement('div');
        conflictItem.className = `conflict-item ${conflict.type}`;
        
        let content = '';
        switch (conflict.type) {
            case 'modified':
                content = `Modified: "${conflict.local.text}"`;
                break;
            case 'removed':
                content = `Removed: "${conflict.local.text}"`;
                break;
            case 'added':
                content = `Added: "${conflict.local.text}"`;
                break;
        }
        
        conflictItem.textContent = content;
        conflictList.appendChild(conflictItem);
    });
    
    conflictModal.style.display = 'block';
}

// Resolve conflicts based on user choice
function resolveConflict(resolution) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    const serverQuotes = JSON.parse(localStorage.getItem('serverQuotes')) || [];
    
    let resolvedQuotes;
    
    switch (resolution) {
        case 'server':
            // Use server data completely
            resolvedQuotes = [...serverQuotes];
            showNotification('Using server data');
            break;
            
        case 'local':
            // Keep local data
            resolvedQuotes = [...localQuotes];
            // Update server with local data
            localStorage.setItem('serverQuotes', JSON.stringify(localQuotes));
            showNotification('Keeping local data');
            break;
            
        case 'merge':
            // Merge both datasets
            resolvedQuotes = mergeQuotes(localQuotes, serverQuotes);
            showNotification('Data merged successfully');
            break;
    }
    
    // Update local storage
    localStorage.setItem('quotes', JSON.stringify(resolvedQuotes));
    
    // Clear pending changes
    pendingChanges = [];
    localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
    
    // Close modal and refresh
    conflictModal.style.display = 'none';
    populateCategories();
    filterQuotes();
}

// Merge local and server quotes
function mergeQuotes(localQuotes, serverQuotes) {
    const merged = [...serverQuotes];
    
    localQuotes.forEach(localQuote => {
        const existingIndex = merged.findIndex(q => q.id === localQuote.id);
        
        if (existingIndex === -1) {
            // Quote doesn't exist on server, add it
            merged.push(localQuote);
        } else {
            // Quote exists, use the most recent version
            const serverQuote = merged[existingIndex];
            const localTime = new Date(localQuote.lastModified);
            const serverTime = new Date(serverQuote.lastModified);
            
            if (localTime > serverTime) {
                merged[existingIndex] = localQuote;
            }
        }
    });
    
    return merged;
}

// Perform normal sync (no conflicts)
async function performSync(localQuotes, serverQuotes) {
    // Apply pending changes to server (simulated)
    if (pendingChanges.length > 0) {
        const updatedServerQuotes = [...serverQuotes];
        
        pendingChanges.forEach(change => {
            switch (change.type) {
                case 'add':
                    updatedServerQuotes.push(change.data);
                    break;
                case 'modify':
                    const index = updatedServerQuotes.findIndex(q => q.id === change.data.id);
                    if (index !== -1) {
                        updatedServerQuotes[index] = change.data;
                    }
                    break;
                case 'delete':
                    const deleteIndex = updatedServerQuotes.findIndex(q => q.id === change.data.id);
                    if (deleteIndex !== -1) {
                        updatedServerQuotes.splice(deleteIndex, 1);
                    }
                    break;
            }
        });
        
        localStorage.setItem('serverQuotes', JSON.stringify(updatedServerQuotes));
        
        // Clear pending changes
        pendingChanges = [];
        localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
    }
    
    // Update local quotes with any server changes
    const updatedLocalQuotes = mergeQuotes(localQuotes, serverQuotes);
    localStorage.setItem('quotes', JSON.stringify(updatedLocalQuotes));
    
    // Remove unsynced flags
    updatedLocalQuotes.forEach(quote => {
        delete quote.unsynced;
    });
    localStorage.setItem('quotes', JSON.stringify(updatedLocalQuotes));
    
    showNotification('Data synced successfully');
}

// Update sync status display
function updateSyncStatus(status, message) {
    syncStatus.textContent = message;
    syncStatus.className = status;
}

// Function to show notification
function showNotification(message, isError = false) {
    notification.textContent = message;
    
    if (isError) {
        notification.style.background = 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === conflictModal) {
        conflictModal.style.display = 'none';
    }
});



















/***  Initial quotes data
const initialQuotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "Work"
    },
    {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
        category: "Innovation"
    },
    {
        text: "Your time is limited, so don't waste it living someone else's life.",
        author: "Steve Jobs",
        category: "Life"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "Dreams"
    },
    {
        text: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle",
        category: "Inspiration"
    },
    {
        text: "Whoever is happy will make others happy too.",
        author: "Anne Frank",
        category: "Happiness"
    },
    {
        text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
        author: "Ralph Waldo Emerson",
        category: "Courage"
    },
    {
        text: "You will face many defeats in life, but never let yourself be defeated.",
        author: "Maya Angelou",
        category: "Perseverance"
    }
];

// DOM elements
const quotesContainer = document.getElementById('quotesContainer');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCategory = document.getElementById('quoteCategory');
const notification = document.getElementById('notification');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Load quotes from localStorage or use initial quotes
    let quotes = JSON.parse(localStorage.getItem('quotes')) || initialQuotes;
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // Populate categories dropdown
    populateCategories();
    
    // Restore last selected filter
    restoreFilter();
    
    // Display quotes based on current filter
    filterQuotes();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', getRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
}

// Function to populate categories dropdown
function populateCategories() {
    // Clear existing options except the first one
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Get quotes from localStorage
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    // Extract unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    // Get selected category
    const selectedCategory = categoryFilter.value;
    
    // Save selected filter to localStorage
    localStorage.setItem('selectedCategory', selectedCategory);
    
    // Get quotes from localStorage
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    // Filter quotes based on selected category
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display filtered quotes
    displayQuotes(filteredQuotes);
}

// Function to display quotes in the container
function displayQuotes(quotes) {
    // Clear the container
    quotesContainer.innerHTML = '';
    
    // Display each quote
    quotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-container';
        quoteElement.innerHTML = `
            <p class="quote-text">"${quote.text}"</p>
            <p class="quote-author">- ${quote.author}</p>
            <span class="quote-category">${quote.category}</span>
        `;
        quotesContainer.appendChild(quoteElement);
    });
    
    // If no quotes match the filter, show a message
    if (quotes.length === 0) {
        quotesContainer.innerHTML = '<p class="no-quotes">No quotes found for this category.</p>';
    }
}

// Function to get a random quote
function getRandomQuote() {
    // Get quotes from localStorage
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    if (quotes.length === 0) return;
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    // Display only the random quote
    displayQuotes([randomQuote]);
    
    // Update filter to show "All Categories" since we're showing a random quote
    categoryFilter.value = 'all';
    localStorage.setItem('selectedCategory', 'all');
}

// Function to add a new quote
function addQuote() {
    // Get form values
    const text = quoteText.value.trim();
    const author = quoteAuthor.value.trim();
    const category = quoteCategory.value.trim();
    
    // Validate inputs
    if (!text || !author || !category) {
        showNotification('Please fill in all fields', true);
        return;
    }
    
    // Create new quote object
    const newQuote = {
        text,
        author,
        category
    };
    
    // Get existing quotes from localStorage
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    // Add new quote
    quotes.push(newQuote);
    
    // Save updated quotes to localStorage
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // Update categories dropdown
    populateCategories();
    
    // Clear form
    quoteText.value = '';
    quoteAuthor.value = '';
    quoteCategory.value = '';
    
    // Show success notification
    showNotification('Quote added successfully!');
    
    // Refresh quotes display
    filterQuotes();
}

// Function to restore last selected filter
function restoreFilter() {
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        categoryFilter.value = savedCategory;
    }
}

// Function to show notification
function showNotification(message, isError = false) {
    notification.textContent = message;
    
    if (isError) {
        notification.style.background = 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
    ****/