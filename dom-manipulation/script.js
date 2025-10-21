// Initial quotes data
const initialQuotes = [
    {
        id: 1,
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "Work",
        lastModified: new Date().toISOString(),
        version: 1
    },
    {
        id: 2,
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
        category: "Innovation",
        lastModified: new Date().toISOString(),
        version: 1
    },
    {
        id: 3,
        text: "Your time is limited, so don't waste it living someone else's life.",
        author: "Steve Jobs",
        category: "Life",
        lastModified: new Date().toISOString(),
        version: 1
    },
    {
        id: 4,
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "Dreams",
        lastModified: new Date().toISOString(),
        version: 1
    }
];

// Server simulation constants
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com';
const SYNC_INTERVAL = 15000; // 15 seconds
const SERVER_DELAY = 800; // Simulate network delay

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
let isOnline = true;

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
    setTimeout(syncQuotes, 2000);
}

// Initialize mock server data
async function initializeServerData() {
    if (!localStorage.getItem('serverQuotes')) {
        localStorage.setItem('serverQuotes', JSON.stringify(initialQuotes));
        localStorage.setItem('serverLastUpdate', new Date().toISOString());
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
            ${quote.conflict ? '<div class="conflict-badge">Conflict</div>' : ''}
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
        version: 1,
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
    syncQuotes();
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
    syncInterval = setInterval(syncQuotes, SYNC_INTERVAL);
    showNotification('Auto-sync enabled (every 15 seconds)');
}

// Manual sync trigger
function manualSync() {
    syncQuotes();
}

// Main sync function - periodically checks for new quotes from server
async function syncQuotes() {
    if (!isOnline) {
        showNotification('Offline - sync will resume when connection is restored', true);
        return;
    }

    updateSyncStatus('syncing', 'Syncing...');
    
    try {
        // Fetch latest quotes from server
        const serverQuotes = await fetchQuotesFromServer();
        const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
        
        // Check if server has newer data
        const serverLastUpdate = localStorage.getItem('serverLastUpdate');
        const hasServerUpdates = !lastSyncTime || new Date(serverLastUpdate) > new Date(lastSyncTime);
        
        if (hasServerUpdates || pendingChanges.length > 0) {
            // Check for conflicts
            const conflicts = detectConflicts(localQuotes, serverQuotes);
            
            if (conflicts.length > 0) {
                showConflictModal(conflicts, serverQuotes);
            } else {
                // No conflicts, proceed with normal sync
                await performSync(localQuotes, serverQuotes);
            }
        } else {
            showNotification('Already up to date');
        }
        
        updateSyncStatus('synced', 'Synced');
        lastSyncTime = new Date().toISOString();
        localStorage.setItem('lastSyncTime', lastSyncTime);
        
    } catch (error) {
        console.error('Sync failed:', error);
        updateSyncStatus('error', 'Sync Failed');
        showNotification('Sync failed. Please check your connection.', true);
    }
}

// Fetch quotes from mock server
async function fetchQuotesFromServer() {
    try {
        // Simulate API call with JSONPlaceholder
        const response = await fetch(`${MOCK_SERVER_URL}/posts?_limit=5`);
        
        if (!response.ok) {
            throw new Error('Server response was not ok');
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, SERVER_DELAY));
        
        // Get actual server data from localStorage (simulated)
        const serverQuotes = JSON.parse(localStorage.getItem('serverQuotes')) || [];
        
        // Occasionally simulate server updates for testing
        if (Math.random() > 0.7) { // 30% chance to simulate server update
            simulateServerUpdate(serverQuotes);
        }
        
        return serverQuotes;
        
    } catch (error) {
        // Fallback to localStorage if network fails
        console.warn('Using fallback server data:', error);
        return JSON.parse(localStorage.getItem('serverQuotes')) || [];
    }
}

// Simulate server-side updates for testing
function simulateServerUpdate(serverQuotes) {
    const actions = ['modify', 'add', 'remove'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    switch (action) {
        case 'modify':
            if (serverQuotes.length > 0) {
                const randomIndex = Math.floor(Math.random() * serverQuotes.length);
                serverQuotes[randomIndex].text += " (Updated)";
                serverQuotes[randomIndex].lastModified = new Date().toISOString();
                serverQuotes[randomIndex].version++;
            }
            break;
        case 'add':
            const newQuote = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                text: "New quote from server simulation",
                author: "Server Bot",
                category: "Server",
                lastModified: new Date().toISOString(),
                version: 1
            };
            serverQuotes.push(newQuote);
            break;
        case 'remove':
            if (serverQuotes.length > 2) {
                serverQuotes.splice(Math.floor(Math.random() * serverQuotes.length), 1);
            }
            break;
    }
    
    localStorage.setItem('serverQuotes', JSON.stringify(serverQuotes));
    localStorage.setItem('serverLastUpdate', new Date().toISOString());
}

// Post data to mock server
async function postQuotesToServer(quotes) {
    try {
        // Simulate API POST call
        const response = await fetch(`${MOCK_SERVER_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quotes, timestamp: new Date().toISOString() })
        });
        
        if (!response.ok) {
            throw new Error('Failed to post data to server');
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, SERVER_DELAY));
        
        // Update server data in localStorage (simulated)
        localStorage.setItem('serverQuotes', JSON.stringify(quotes));
        localStorage.setItem('serverLastUpdate', new Date().toISOString());
        
        return true;
        
    } catch (error) {
        console.error('Failed to post to server:', error);
        throw error;
    }
}

// Detect conflicts between local and server data
function detectConflicts(localQuotes, serverQuotes) {
    const conflicts = [];
    
    // Create maps for easier lookup
    const localMap = new Map(localQuotes.map(q => [q.id, q]));
    const serverMap = new Map(serverQuotes.map(q => [q.id, q]));
    
    // Check for modified quotes (both exist but different versions)
    localQuotes.forEach(localQuote => {
        const serverQuote = serverMap.get(localQuote.id);
        if (serverQuote) {
            const localTime = new Date(localQuote.lastModified);
            const serverTime = new Date(serverQuote.lastModified);
            
            // Conflict if both were modified and server has newer version
            if (serverQuote.version > localQuote.version && 
                serverTime > localTime && 
                (serverQuote.text !== localQuote.text || 
                 serverQuote.author !== localQuote.author || 
                 serverQuote.category !== localQuote.category)) {
                conflicts.push({
                    type: 'modified',
                    local: localQuote,
                    server: serverQuote,
                    description: `"${localQuote.text}" was modified on server`
                });
            }
        }
    });
    
    // Check for quotes removed on server
    localQuotes.forEach(localQuote => {
        if (!serverMap.has(localQuote.id) && !localQuote.unsynced) {
            conflicts.push({
                type: 'removed',
                local: localQuote,
                server: null,
                description: `"${localQuote.text}" was removed from server`
            });
        }
    });
    
    // Check for quotes added on server that conflict with local additions
    serverQuotes.forEach(serverQuote => {
        if (!localMap.has(serverQuote.id)) {
            // Check if this might be a conflict with a local addition
            const similarLocal = localQuotes.find(local => 
                local.text === serverQuote.text && local.unsynced
            );
            if (similarLocal) {
                conflicts.push({
                    type: 'duplicate',
                    local: similarLocal,
                    server: serverQuote,
                    description: `Similar quote already exists on server`
                });
            }
        }
    });
    
    return conflicts;
}

// Show conflict resolution modal
function showConflictModal(conflicts, serverQuotes) {
    conflictList.innerHTML = '';
    
    conflicts.forEach((conflict, index) => {
        const conflictItem = document.createElement('div');
        conflictItem.className = `conflict-item ${conflict.type}`;
        
        let content = `
            <strong>${conflict.description}</strong>
            <div class="conflict-details">
        `;
        
        if (conflict.type === 'modified') {
            content += `
                <div class="version-local">
                    <strong>Your version:</strong> "${conflict.local.text}"
                </div>
                <div class="version-server">
                    <strong>Server version:</strong> "${conflict.server.text}"
                </div>
            `;
        } else if (conflict.type === 'removed') {
            content += `
                <div class="version-local">
                    <strong>Your quote:</strong> "${conflict.local.text}"
                </div>
                <div class="version-server">
                    <strong>Status:</strong> This quote was removed from the server
                </div>
            `;
        } else if (conflict.type === 'duplicate') {
            content += `
                <div class="version-local">
                    <strong>Your quote:</strong> "${conflict.local.text}"
                </div>
                <div class="version-server">
                    <strong>Server quote:</strong> "${conflict.server.text}"
                </div>
            `;
        }
        
        content += `</div>`;
        conflictItem.innerHTML = content;
        conflictList.appendChild(conflictItem);
    });
    
    // Store server quotes for resolution
    conflictModal.dataset.serverQuotes = JSON.stringify(serverQuotes);
    conflictModal.style.display = 'block';
    
    showNotification(`Found ${conflicts.length} conflict(s) that need resolution`, true);
}

// Resolve conflicts based on user choice
function resolveConflict(resolution) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    const serverQuotes = JSON.parse(conflictModal.dataset.serverQuotes) || [];
    
    let resolvedQuotes;
    
    switch (resolution) {
        case 'server':
            // Use server data completely
            resolvedQuotes = [...serverQuotes];
            // Add any local unsynced additions that don't conflict
            localQuotes.forEach(quote => {
                if (quote.unsynced && !serverQuotes.find(sq => sq.id === quote.id)) {
                    resolvedQuotes.push(quote);
                }
            });
            showNotification('Using server data - your conflicting changes were discarded');
            break;
            
        case 'local':
            // Keep local data and push to server
            resolvedQuotes = [...localQuotes];
            // Update server with local data
            postQuotesToServer(localQuotes).catch(console.error);
            showNotification('Keeping local data - server will be updated');
            break;
            
        case 'merge':
            // Merge both datasets intelligently
            resolvedQuotes = mergeQuotes(localQuotes, serverQuotes);
            // Update server with merged data
            postQuotesToServer(resolvedQuotes).catch(console.error);
            showNotification('Data merged successfully - server updated with merged data');
            break;
    }
    
    // Remove conflict flags and unsynced flags
    resolvedQuotes.forEach(quote => {
        delete quote.unsynced;
        delete quote.conflict;
    });
    
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

// Merge local and server quotes intelligently
function mergeQuotes(localQuotes, serverQuotes) {
    const merged = [...serverQuotes];
    const mergedIds = new Set(serverQuotes.map(q => q.id));
    
    localQuotes.forEach(localQuote => {
        if (!mergedIds.has(localQuote.id)) {
            // New local quote - add it
            merged.push(localQuote);
            mergedIds.add(localQuote.id);
        } else {
            // Quote exists in both - use the most recent version
            const existingIndex = merged.findIndex(q => q.id === localQuote.id);
            const existingQuote = merged[existingIndex];
            
            const localTime = new Date(localQuote.lastModified);
            const serverTime = new Date(existingQuote.lastModified);
            
            if (localTime > serverTime || localQuote.version > existingQuote.version) {
                // Local version is newer
                merged[existingIndex] = { ...localQuote };
            }
            // Else keep server version
        }
    });
    
    return merged;
}

// Perform normal sync (no conflicts)
async function performSync(localQuotes, serverQuotes) {
    let quotesToSync = [...localQuotes];
    
    // Apply pending changes to server
    if (pendingChanges.length > 0) {
        showNotification(`Syncing ${pendingChanges.length} pending change(s)...`);
        
        try {
            await postQuotesToServer(localQuotes);
            
            // Clear pending changes after successful sync
            pendingChanges = [];
            localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
            
        } catch (error) {
            console.error('Failed to sync pending changes:', error);
            throw error;
        }
    }
    
    // Update local quotes with any server changes (merge)
    const updatedLocalQuotes = mergeQuotes(localQuotes, serverQuotes);
    
    // Remove unsynced flags from successfully synced quotes
    updatedLocalQuotes.forEach(quote => {
        if (quote.unsynced) {
            delete quote.unsynced;
        }
    });
    
    // Save updated quotes
    localStorage.setItem('quotes', JSON.stringify(updatedLocalQuotes));
    
    showNotification('Data synced successfully!');
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
    }, 4000);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === conflictModal) {
        conflictModal.style.display = 'none';
    }
});

// Simulate online/offline status for testing
window.addEventListener('online', () => {
    isOnline = true;
    showNotification('Connection restored - resuming sync');
    syncQuotes();
});

window.addEventListener('offline', () => {
    isOnline = false;
    updateSyncStatus('error', 'Offline');
    showNotification('Connection lost - sync paused', true);
});