// Initial quotes data
const initialQuotes = [
    { 
        text: "The only way to do great work is to love what you do.", 
        author: "Steve Jobs", 
        category: "Motivation" 
    },
    { 
        text: "Life is what happens to you while you're busy making other plans.", 
        author: "John Lennon", 
        category: "Life" 
    },
    { 
        text: "In the middle of difficulty lies opportunity.", 
        author: "Albert Einstein", 
        category: "Inspiration" 
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
        text: "Be yourself; everyone else is already taken.", 
        author: "Oscar Wilde", 
        category: "Individuality" 
    },
    { 
        text: "You must be the change you wish to see in the world.", 
        author: "Mahatma Gandhi", 
        category: "Change" 
    }
];

// DOM Elements
const quotesContainer = document.getElementById('quotesContainer');
const categoryFilter = document.getElementById('categoryFilter');
const quoteCategory = document.getElementById('quoteCategory');
const addQuoteForm = document.getElementById('addQuoteForm');
const quoteCount = document.getElementById('quoteCount');
const notification = document.getElementById('notification');

// Function to get quotes from localStorage
function getQuotes() {
    const quotes = localStorage.getItem('quotes');
    return quotes ? JSON.parse(quotes) : initialQuotes;
}

// Function to save quotes to localStorage
function saveQuotes(quotes) {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to get the selected category from localStorage
function getSelectedCategory() {
    return localStorage.getItem('selectedCategory') || 'all';
}

// Function to save the selected category to localStorage
function saveSelectedCategory(category) {
    localStorage.setItem('selectedCategory', category);
}

// Function to populate categories in dropdowns
function populateCategories() {
    const quotes = getQuotes();
    const categories = ['all'];
    
    // Extract unique categories from quotes
    quotes.forEach(quote => {
        if (!categories.includes(quote.category)) {
            categories.push(quote.category);
        }
    });
    
    // Populate the filter dropdown
    categoryFilter.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category === 'all' ? 'All Categories' : category;
        categoryFilter.appendChild(option);
    });
    
    // Populate the add quote category dropdown
    quoteCategory.innerHTML = '';
    
    // Remove 'all' category for the add quote form
    const addCategories = categories.filter(cat => cat !== 'all');
    
    addCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        quoteCategory.appendChild(option);
    });
    
    // Add option to create new category
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = '+ Add New Category';
    quoteCategory.appendChild(newOption);
    
    // Restore the last selected category
    const selectedCategory = getSelectedCategory();
    categoryFilter.value = selectedCategory;
}

// Function to filter and display quotes
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    const quotes = getQuotes();
    
    // Save the selected category
    saveSelectedCategory(selectedCategory);
    
    // Filter quotes based on selected category
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display the filtered quotes
    displayQuotes(filteredQuotes);
}

// Function to display quotes
function displayQuotes(quotes) {
    quotesContainer.innerHTML = '';
    
    if (quotes.length === 0) {
        quotesContainer.innerHTML = `
            <div class="empty-state">
                <h3>No quotes found</h3>
                <p>No quotes match the selected category. Try selecting a different category or add a new quote.</p>
            </div>
        `;
        quoteCount.textContent = '0 quotes displayed';
        return;
    }
    
    quotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-card';
        quoteElement.innerHTML = `
            <p class="quote-text">"${quote.text}"</p>
            <p class="quote-author">- ${quote.author}</p>
            <span class="quote-category">${quote.category}</span>
        `;
        quotesContainer.appendChild(quoteElement);
    });
    
    // Update quote counter
    quoteCount.textContent = `${quotes.length} ${quotes.length === 1 ? 'quote' : 'quotes'} displayed`;
}

// Function to show notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Function to add a new quote
function addQuote(event) {
    event.preventDefault();
    
    const quoteText = document.getElementById('quoteText').value;
    const quoteAuthor = document.getElementById('quoteAuthor').value;
    let quoteCategoryValue = quoteCategory.value;
    
    // If user selected "Add New Category", prompt for category name
    if (quoteCategoryValue === 'new') {
        quoteCategoryValue = prompt('Enter new category name:');
        if (!quoteCategoryValue) return; // User cancelled
    }
    
    if (quoteText && quoteAuthor && quoteCategoryValue) {
        const quotes = getQuotes();
        const newQuote = {
            text: quoteText,
            author: quoteAuthor,
            category: quoteCategoryValue
        };
        
        quotes.push(newQuote);
        saveQuotes(quotes);
        
        // Reset form
        addQuoteForm.reset();
        
        // Update categories and quotes display
        populateCategories();
        filterQuotes();
        
        // Show success notification
        showNotification('Quote added successfully!');
    }
}

// Initialize the application
function init() {
    // Set up event listeners
    categoryFilter.addEventListener('change', filterQuotes);
    addQuoteForm.addEventListener('submit', addQuote);
    
    // Populate categories and display quotes
    populateCategories();
    filterQuotes();
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);