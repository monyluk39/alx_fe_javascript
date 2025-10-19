// Quote data
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

// DOM elements
const quoteText = document.getElementById("quote-text");
const quoteCategory = document.getElementById("quote-category");
const categorySelect = document.getElementById("category");
const formSection = document.getElementById("form-section");
const showQuoteBtn = document.getElementById("show-quote");
const addQuoteBtn = document.getElementById("add-quote");

// Initialize category options
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

// Display random quote based on category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteText.textContent = "No quotes available for this category.";
    quoteCategory.textContent = "";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteText.textContent = `"${random.text}"`;
  quoteCategory.textContent = `— Category: ${random.category}`;
}

// Create quote addition form dynamically
function createAddQuoteForm() {
  formSection.innerHTML = `
    <form id="quote-form">
      <input type="text" id="new-quote" placeholder="Enter your quote" required>
      <input type="text" id="new-category" placeholder="Enter category" required>
      <button type="submit">Add Quote</button>
    </form>
  `;

  const form = document.getElementById("quote-form");
  form.addEventListener("submit", event => {
    event.preventDefault();
    const newQuote = document.getElementById("new-quote").value.trim();
    const newCategory = document.getElementById("new-category").value.trim();

    if (newQuote && newCategory) {
      quotes.push({ text: newQuote, category: newCategory });
      populateCategories();
      formSection.innerHTML = "<p>Quote added successfully!</p>";
    }
  });
}

// Event listeners
showQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", createAddQuoteForm);

// Initial setup
populateCategories();
