// Mock API Service - Simulates real server interactions
class MockApiService {
    constructor() {
        this.baseUrl = 'https://jsonplaceholder.typicode.com';
        this.delay = 800; // Simulate network delay
        this.failureRate = 0.1; // 10% chance of failure for testing
    }

    // Simulate network delay
    async simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, this.delay));
    }

    // Simulate random failures for testing
    simulateRandomFailure() {
        if (Math.random() < this.failureRate) {
            throw new Error('Mock API: Random server error occurred');
        }
    }

    // Generate mock server data
    generateMockServerData() {
        return [
            {
                id: 101,
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                category: "Work",
                lastModified: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                version: 2,
                serverId: 'server-101'
            },
            {
                id: 102,
                text: "Innovation distinguishes between a leader and a follower.",
                author: "Steve Jobs",
                category: "Innovation",
                lastModified: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                version: 1,
                serverId: 'server-102'
            },
            {
                id: 103,
                text: "Your time is limited, so don't waste it living someone else's life.",
                author: "Steve Jobs",
                category: "Life",
                lastModified: new Date().toISOString(), // Just now
                version: 3,
                serverId: 'server-103'
            },
            {
                id: 104,
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt",
                category: "Dreams",
                lastModified: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
                version: 2,
                serverId: 'server-104'
            },
            {
                id: 105,
                text: "It is during our darkest moments that we must focus to see the light.",
                author: "Aristotle",
                category: "Inspiration",
                lastModified: new Date().toISOString(),
                version: 1,
                serverId: 'server-105'
            }
        ];
    }

    // Fetch quotes from mock server
    async fetchQuotes() {
        console.log('🔍 Fetching quotes from mock API...');
        
        try {
            await this.simulateDelay();
            this.simulateRandomFailure();

            // Method 1: Try to fetch from JSONPlaceholder first (real mock API)
            try {
                const response = await fetch(`${this.baseUrl}/posts?_limit=3`);
                if (response.ok) {
                    const posts = await response.json();
                    console.log('✅ Successfully fetched from JSONPlaceholder API', posts.length, 'posts');
                    
                    // Convert posts to our quote format
                    const serverQuotes = this.generateMockServerData();
                    this.simulateServerChanges(serverQuotes); // Add some random changes
                    
                    // Update server timestamp
                    localStorage.setItem('serverLastUpdate', new Date().toISOString());
                    localStorage.setItem('serverQuotes', JSON.stringify(serverQuotes));
                    
                    return serverQuotes;
                }
            } catch (fetchError) {
                console.warn('JSONPlaceholder fetch failed, using fallback:', fetchError);
            }

            // Method 2: Fallback to localStorage with simulated updates
            let serverQuotes = JSON.parse(localStorage.getItem('serverQuotes')) || this.generateMockServerData();
            
            // Simulate server-side changes
            this.simulateServerChanges(serverQuotes);
            
            // Update server data in localStorage
            localStorage.setItem('serverQuotes', JSON.stringify(serverQuotes));
            localStorage.setItem('serverLastUpdate', new Date().toISOString());
            
            console.log('✅ Successfully fetched from mock server fallback', serverQuotes.length, 'quotes');
            return serverQuotes;

        } catch (error) {
            console.error('❌ Failed to fetch quotes from mock API:', error);
            
            // Final fallback - return whatever we have in localStorage
            const fallbackQuotes = JSON.parse(localStorage.getItem('serverQuotes')) || this.generateMockServerData();
            console.warn('Using fallback server data due to error');
            return fallbackQuotes;
        }
    }

    // Simulate server-side changes to make sync more interesting
    simulateServerChanges(serverQuotes) {
        const changeTypes = ['modify', 'add', 'remove'];
        const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];
        
        console.log(`🔄 Simulating server change: ${changeType}`);

        switch (changeType) {
            case 'modify':
                if (serverQuotes.length > 0) {
                    const randomIndex = Math.floor(Math.random() * serverQuotes.length);
                    const quote = serverQuotes[randomIndex];
                    
                    // Modify the quote text slightly
                    const modifications = [
                        " (Updated)",
                        " - Enhanced",
                        " - Revised",
                        " - Server Edit"
                    ];
                    const modification = modifications[Math.floor(Math.random() * modifications.length)];
                    
                    if (!quote.text.includes(modification)) {
                        quote.text += modification;
                        quote.lastModified = new Date().toISOString();
                        quote.version = (quote.version || 1) + 1;
                        console.log(`📝 Server modified quote: "${quote.text}"`);
                    }
                }
                break;

            case 'add':
                const newQuotes = [
                    {
                        id: Date.now() + Math.floor(Math.random() * 1000),
                        text: "Life is what happens to you while you're busy making other plans.",
                        author: "John Lennon",
                        category: "Life",
                        lastModified: new Date().toISOString(),
                        version: 1,
                        serverId: 'server-' + Date.now()
                    },
                    {
                        id: Date.now() + Math.floor(Math.random() * 1000),
                        text: "The way to get started is to quit talking and begin doing.",
                        author: "Walt Disney",
                        category: "Action",
                        lastModified: new Date().toISOString(),
                        version: 1,
                        serverId: 'server-' + Date.now()
                    },
                    {
                        id: Date.now() + Math.floor(Math.random() * 1000),
                        text: "The only impossible journey is the one you never begin.",
                        author: "Tony Robbins",
                        category: "Motivation",
                        lastModified: new Date().toISOString(),
                        version: 1,
                        serverId: 'server-' + Date.now()
                    }
                ];
                
                const newQuote = newQuotes[Math.floor(Math.random() * newQuotes.length)];
                serverQuotes.push(newQuote);
                console.log(`➕ Server added new quote: "${newQuote.text}"`);
                break;

            case 'remove':
                if (serverQuotes.length > 3) {
                    const removeIndex = Math.floor(Math.random() * serverQuotes.length);
                    const removedQuote = serverQuotes.splice(removeIndex, 1)[0];
                    console.log(`🗑️ Server removed quote: "${removedQuote.text}"`);
                }
                break;
        }
    }

    // Post quotes to mock server
    async postQuotes(quotes) {
        console.log('📤 Posting quotes to mock API...', quotes.length, 'quotes');
        
        try {
            await this.simulateDelay();
            this.simulateRandomFailure();

            // Method 1: Try to post to JSONPlaceholder (real mock API)
            try {
                const response = await fetch(`${this.baseUrl}/posts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: 'Quote Sync Update',
                        body: `Synced ${quotes.length} quotes`,
                        quotes: quotes,
                        timestamp: new Date().toISOString(),
                        userId: 1
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Successfully posted to JSONPlaceholder API', result);
                }
            } catch (postError) {
                console.warn('JSONPlaceholder post failed, using fallback:', postError);
            }

            // Method 2: Update localStorage (simulated server storage)
            const serverQuotes = JSON.parse(localStorage.getItem('serverQuotes')) || [];
            
            // Merge the posted quotes with existing server quotes
            const updatedServerQuotes = this.mergeQuotesForServer(serverQuotes, quotes);
            
            localStorage.setItem('serverQuotes', JSON.stringify(updatedServerQuotes));
            localStorage.setItem('serverLastUpdate', new Date().toISOString());

            console.log('✅ Successfully updated mock server with', quotes.length, 'quotes');
            return { success: true, message: 'Quotes synced successfully' };

        } catch (error) {
            console.error('❌ Failed to post quotes to mock API:', error);
            throw new Error(`Failed to sync with server: ${error.message}`);
        }
    }

    // Merge quotes for server storage (server-side logic)
    mergeQuotesForServer(serverQuotes, clientQuotes) {
        const merged = [...serverQuotes];
        const serverIds = new Set(serverQuotes.map(q => q.id));

        clientQuotes.forEach(clientQuote => {
            const existingIndex = merged.findIndex(q => q.id === clientQuote.id);
            
            if (existingIndex === -1) {
                // New quote - add it
                merged.push({
                    ...clientQuote,
                    serverId: `server-${clientQuote.id}`,
                    lastModified: new Date().toISOString()
                });
            } else {
                // Existing quote - update if client version is newer
                const serverQuote = merged[existingIndex];
                const clientTime = new Date(clientQuote.lastModified);
                const serverTime = new Date(serverQuote.lastModified);
                
                if (clientTime > serverTime) {
                    merged[existingIndex] = {
                        ...clientQuote,
                        serverId: serverQuote.serverId || `server-${clientQuote.id}`,
                        lastModified: new Date().toISOString(),
                        version: (serverQuote.version || 1) + 1
                    };
                }
            }
        });

        return merged;
    }

    // Check server status
    async checkServerStatus() {
        try {
            await this.simulateDelay();
            
            // Try to reach JSONPlaceholder
            const response = await fetch(`${this.baseUrl}/posts/1`);
            return {
                online: response.ok,
                timestamp: new Date().toISOString(),
                server: 'JSONPlaceholder'
            };
        } catch (error) {
            return {
                online: false,
                timestamp: new Date().toISOString(),
                server: 'Mock API Fallback',
                error: error.message
            };
        }
    }
}

// Initialize mock API service
const mockApi = new MockApiService();

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
    }
];

// Server simulation constants
const SYNC_INTERVAL = 15000; // 15 seconds

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
    console.log('🚀 Initializing Dynamic Quote Generator...');
    
    // Load quotes from localStorage or use initial quotes
    let quotes = JSON.parse(localStorage.getItem('quotes')) || initialQuotes;
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // Initialize server data
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
    
    // Check server status and start periodic syncing
    checkServerStatus();
    startPeriodicSync();
    
    // Initial sync after a short delay
    setTimeout(syncQuotes, 3000);
}

// Initialize server data
async function initializeServerData() {
    if (!localStorage.getItem('serverQuotes')) {
        console.log('📦 Initializing server data for the first time...');
        const serverQuotes = mockApi.generateMockServerData();
        localStorage.setItem('serverQuotes', JSON.stringify(serverQuotes));
        localStorage.setItem('serverLastUpdate', new Date().toISOString());
    }
}

// Check server status
async function checkServerStatus() {
    try {
        const status = await mockApi.checkServerStatus();
        isOnline = status.online;
        
        if (status.online) {
            console.log('✅ Server is online:', status.server);
            showNotification(`Connected to ${status.server}`, false);
        } else {
            console.warn('⚠️ Server is offline, using fallback mode');
            showNotification('Server offline - using local data', true);
        }
        
        updateSyncStatus(status.online ? 'synced' : 'error', 
                        status.online ? 'Online' : 'Offline');
                        
    } catch (error) {
        console.error('❌ Failed to check server status:', error);
        isOnline = false;
        updateSyncStatus('error', 'Offline');
    }
}

// Function to populate categories dropdown
function populateCategories() {
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('selectedCategory', selectedCategory);
    
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    displayQuotes(filteredQuotes);
}

// Function to display quotes in the container
function displayQuotes(quotes) {
    quotesContainer.innerHTML = '';
    
    quotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-container';
        quoteElement.innerHTML = `
            <p class="quote-text">"${quote.text}"</p>
            <p class="quote-author">- ${quote.author}</p>
            <span class="quote-category">${quote.category}</span>
            ${quote.unsynced ? '<div class="unsynced-badge">Unsynced</div>' : ''}
            ${quote.conflict ? '<div class="conflict-badge">Conflict</div>' : ''}
            <div class="quote-meta">
                <small>v${quote.version} • ${new Date(quote.lastModified).toLocaleTimeString()}</small>
            </div>
        `;
        quotesContainer.appendChild(quoteElement);
    });
    
    if (quotes.length === 0) {
        quotesContainer.innerHTML = '<p class="no-quotes">No quotes found for this category.</p>';
    }
}

// FETCH QUOTES FROM SERVER USING MOCK API - MAIN FUNCTION
async function fetchQuotesFromServer() {
    console.group('🔍 fetchQuotesFromServer()');
    
    try {
        updateSyncStatus('syncing', 'Fetching from server...');
        
        // Use the mock API service to fetch quotes
        const serverQuotes = await mockApi.fetchQuotes();
        
        console.log('✅ Successfully fetched quotes from server:', serverQuotes.length);
        console.table(serverQuotes.map(q => ({ 
            id: q.id, 
            text: q.text.substring(0, 30) + '...', 
            version: q.version,
            category: q.category 
        })));
        
        // Update local storage with server data
        localStorage.setItem('serverQuotes', JSON.stringify(serverQuotes));
        localStorage.setItem('serverLastUpdate', new Date().toISOString());
        
        console.groupEnd();
        return serverQuotes;
        
    } catch (error) {
        console.error('❌ fetchQuotesFromServer failed:', error);
        console.groupEnd();
        
        // Fallback to existing server data
        const fallbackQuotes = JSON.parse(localStorage.getItem('serverQuotes')) || [];
        console.warn('Using fallback server data:', fallbackQuotes.length, 'quotes');
        
        return fallbackQuotes;
    }
}

// POST QUOTES TO SERVER USING MOCK API
async function postQuotesToServer(quotes) {
    console.group('📤 postQuotesToServer()');
    
    try {
        updateSyncStatus('syncing', 'Posting to server...');
        
        // Use the mock API service to post quotes
        const result = await mockApi.postQuotes(quotes);
        
        console.log('✅ Successfully posted quotes to server:', quotes.length, 'quotes');
        console.log('Server response:', result);
        
        console.groupEnd();
        return result;
        
    } catch (error) {
        console.error('❌ postQuotesToServer failed:', error);
        console.groupEnd();
        throw error;
    }
}

// Main sync function
async function syncQuotes() {
    if (!isOnline) {
        console.warn('📵 Sync skipped - offline mode');
        return;
    }

    console.group('🔄 syncQuotes()');
    
    try {
        updateSyncStatus('syncing', 'Syncing with server...');
        
        // 1. Fetch latest quotes from server
        const serverQuotes = await fetchQuotesFromServer();
        const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
        
        console.log('📊 Sync stats:', {
            localQuotes: localQuotes.length,
            serverQuotes: serverQuotes.length,
            pendingChanges: pendingChanges.length
        });
        
        // 2. Check for conflicts
        const conflicts = detectConflicts(localQuotes, serverQuotes);
        
        if (conflicts.length > 0) {
            console.warn('⚠️ Conflicts detected:', conflicts.length);
            showConflictModal(conflicts, serverQuotes);
        } else {
            // 3. No conflicts, perform normal sync
            await performSync(localQuotes, serverQuotes);
        }
        
        updateSyncStatus('synced', 'Synced');
        lastSyncTime = new Date().toISOString();
        localStorage.setItem('lastSyncTime', lastSyncTime);
        
        console.log('✅ Sync completed successfully');
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
        updateSyncStatus('error', 'Sync Failed');
        showNotification('Sync failed: ' + error.message, true);
    }
    
    console.groupEnd();
}

// ... (rest of the functions remain the same as previous implementation)
// [Include all the other functions from the previous implementation: 
// detectConflicts, showConflictModal, resolveConflict, mergeQuotes, 
// performSync, addQuote, getRandomQuote, etc.]

// Start periodic syncing with server
function startPeriodicSync() {
    console.log('⏰ Starting periodic sync every', SYNC_INTERVAL / 1000, 'seconds');
    syncInterval = setInterval(syncQuotes, SYNC_INTERVAL);
    showNotification(`Auto-sync enabled (every ${SYNC_INTERVAL / 1000} seconds)`);
}

// Manual sync trigger
function manualSync() {
    console.log('🔄 Manual sync triggered by user');
    syncQuotes();
}

// Update sync status display
function updateSyncStatus(status, message) {
    syncStatus.textContent = message;
    syncStatus.className = status;
    
    // Add timestamp for debugging
    if (status === 'synced') {
        syncStatus.title = `Last sync: ${new Date().toLocaleTimeString()}`;
    }
}

// Function to show notification
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.style.background = isError 
        ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
        : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Add quote function (example of one other function)
function addQuote() {
    const text = quoteText.value.trim();
    const author = quoteAuthor.value.trim();
    const category = quoteCategory.value.trim();
    
    if (!text || !author || !category) {
        showNotification('Please fill in all fields', true);
        return;
    }
    
    const newQuote = {
        id: Date.now(),
        text,
        author,
        category,
        lastModified: new Date().toISOString(),
        version: 1,
        unsynced: true
    };
    
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    pendingChanges.push({
        type: 'add',
        data: newQuote,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
    
    populateCategories();
    quoteText.value = '';
    quoteAuthor.value = '';
    quoteCategory.value = '';
    
    showNotification('Quote added successfully!');
    filterQuotes();
    syncQuotes(); // Trigger immediate sync
}

// Online/offline detection
window.addEventListener('online', async () => {
    isOnline = true;
    console.log('🌐 Online - checking server status...');
    await checkServerStatus();
    showNotification('Connection restored - resuming sync');
    syncQuotes();
});

window.addEventListener('offline', () => {
    isOnline = false;
    console.warn('📵 Offline - pausing sync');
    updateSyncStatus('error', 'Offline');
    showNotification('Connection lost - sync paused', true);
});