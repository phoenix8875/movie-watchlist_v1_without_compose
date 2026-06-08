const API_URL = `http://${window.location.hostname}:5000/api/movies`;

// Fetch movies from backend when page loads
async function fetchMovies() {
    try {
        const response = await fetch(API_URL);
        const movies = await response.json();
        const list = document.getElementById('movieList');
        list.innerHTML = '';
        
        movies.forEach(movie => {
            const li = document.createElement('li');
            
            // Create text container for movie title
            const textSpan = document.createElement('span');
            textSpan.textContent = movie.title;
            li.appendChild(textSpan);
            
            // Create Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '❌';
            deleteBtn.style.background = 'transparent';
            deleteBtn.style.padding = '2px 5px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.onclick = () => deleteMovie(movie.id);
            
            li.appendChild(deleteBtn);
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Error fetching movies:', err);
    }
}

// Post a new movie to the backend
async function addMovie() {
    const input = document.getElementById('movieInput');
    const title = input.value.trim();
    if (!title) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        if (response.ok) {
            input.value = '';
            fetchMovies();
        }
    } catch (err) {
        console.error('Error adding movie:', err);
    }
}

// Send a DELETE request to the backend API
async function deleteMovie(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchMovies(); // Refresh list after deletion
        }
    } catch (err) {
        console.error('Error deleting movie:', err);
    }
}

// Load movies on start
fetchMovies();
