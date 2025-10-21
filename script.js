// Initial quotes data
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