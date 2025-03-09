import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5001/api/books")
        .then(response => setBooks(response.data))
        .catch(error => console.error("Error fetching books:", error));
  }, []);

  return (
      <div>
        <h1>Book Recommendation</h1>
        <ul>
          {books.map((book) => (
              <li key={book._id}>
                <h3>{book.title}</h3>
                <p>Author: {book.author}</p>
                <p>Genre: {book.genre}</p>
                <p>Mood: {book.mood}</p>
                <img src={book.cover} alt={book.title} width="100" />
              </li>
          ))}
        </ul>
      </div>
  );
};

export default App;
