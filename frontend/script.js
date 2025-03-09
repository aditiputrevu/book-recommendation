async function getBooks(mood, genre, popularity) {
    const response = await fetch(`http://localhost:5002/api/books?mood=${mood}&genre=${genre}&popularity=${popularity}`);
    const data = await response.json();
    return data;
}

function displayBooks(books) {
    const bookGrid = document.querySelector('.book-grid');
    bookGrid.innerHTML = books.map(book => `
    <div class="book-card">
      <img src="${book.cover}" alt="${book.title}">
      <h3>${book.title}</h3>
      <p>Author: ${book.author}</p>
      <p>Genre: ${book.genre}</p>
      <p>Popularity: ${book.popularity}</p>
    </div>
  `).join('');
}

document.querySelector('.mood-selector').addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') {
        const mood = e.target.dataset.mood;
        const genre = document.getElementById('genre-filter').value;
        const popularity = document.getElementById('popularity-filter').value;
        const books = await getBooks(mood, genre, popularity);
        displayBooks(books);
    }
});

document.getElementById('popularity-filter').addEventListener('input', (e) => {
    document.getElementById('popularity-value').textContent = e.target.value;
});

// Load default books on page load
window.addEventListener('load', async () => {
    const books = await getBooks('neutral', 'all', 1);
    displayBooks(books);
});