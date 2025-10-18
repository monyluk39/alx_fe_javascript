// Initial quotes array 
const quotes = [ 
{ text: "The best way to predict the future is to invent it.", category: "Motivation" },
{ text: "Life is what happens when you're busy making other plans.", category: "Life" }, 
{ text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }, 
{ text: "Code is like humor. When you have to explain it, it's bad.", category: "Programming" }
]; 
// DOM elements 
const quoteDisplay = document.getElementById("quoteDisplay"); 
const categorySelect = document.getElementById("categorySelect"); 
const newQuoteBtn = document.getElementById("newQuote"); 
const addQuoteBtn = document.getElementById("addQuote"); 
const newQuoteText = document.getElementById("newQuoteText"); 
const newQuoteCategory = document.getElementById("newQuoteCategory"); 
// Initialize category dropdown 
function populateCategories() { 
const categories = [...new Set(quotes.map(q => q.category))]; 
categorySelect.innerHTML = ""; 
categories.forEach(cat => { 
const option = document.createElement("option"); 
option.value = cat; 
option.textContent = cat; 
categorySelect.appendChild(option); 
}); 
} 
// Display a random quote based on selected category 
function showRandomQuote() { 
const selectedCategory = categorySelect.value; 
const filteredQuotes = quotes.filter(q => q.category === selectedCategory); 
if (filteredQuotes.length === 0) {
quoteDisplay.textContent = "No quotes available for this category."; 
return; 
} 
const randomIndex = Math.floor(Math.random() * filteredQuotes.length); 
const randomQuote = filteredQuotes[randomIndex]; 
quoteDisplay.textContent = "${randomQuote.text}" - '[${randomQuote.category}]'; 
} 
// Add a new quote dynamically 
function addQuote() { 
const text = newQuoteText.value.trim(); 
const category = newQuoteCategory.value.trim(); 
if (!text || !category) 
{ 
alert("Please enter both quote text and category.");
Return; 
} 
quotes.push({text,category }); 
populateCategories(); 
newQuoteText.value = ""; 
newQuoteCategory.value = ""; 
alert("New quote added successfully!"); 
} 
// Event listeners 
newQuoteBtn.addEventListener("click",showRandomQuote); 
addQuoteBtn.addEventListener("click",addQuote); 
// Initial setup 
populateCategories(); 
showRandomQuote(); 