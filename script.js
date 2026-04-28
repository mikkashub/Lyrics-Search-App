// Selectors
const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');

const apiURL = 'https://api.lyrics.ovh';
let lastSearchResults = null;

// Search by song or artist
async function searchSongs(term) {
  showSpinner();
  const res = await fetch(`${apiURL}/suggest/${term}`);
  const data = await res.json();

  lastSearchResults = data;
  showDataSafe(data);
}

// Event listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();

  if (!searchTerm) {
    alert('Please type in a search term');
  } else {
    searchSongs(searchTerm);
  }
});

let currentPage = 0;
const pageSize = 5;

function showDataSafe(lyrics) {
  result.innerHTML = '';
  more.innerHTML = '';

  const ul = document.createElement('ul');
  ul.className = 'songs';

  const start = currentPage * pageSize;
  const paginated = lyrics.data.slice(start, start + pageSize);

  paginated.forEach((song) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = song.artist.name;

    span.appendChild(strong);
    span.appendChild(document.createTextNode(` - ${song.title}`));
    li.appendChild(span);

    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = 'Get Lyrics';
    button.dataset.artist = song.artist.name;
    button.dataset.songtitle = song.title;

    button.addEventListener('click', () => {
      const artist = button.dataset.artist;
      const songTitle = button.dataset.songtitle;
      getLyricsSafe(artist, songTitle);
    });

    li.appendChild(button);
    ul.appendChild(li);
  });

  result.appendChild(ul);

  if (currentPage > 0) {
    const prevButton = document.createElement('button');
    prevButton.className = 'btn';
    prevButton.textContent = 'Prev';
    prevButton.addEventListener('click', () => {
      currentPage--;
      showDataSafe(lyrics);
    });
    more.appendChild(prevButton);
  }

  if (start + pageSize < lyrics.data.length) {
    const nextButton = document.createElement('button');
    nextButton.className = 'btn';
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
      currentPage++;
      showDataSafe(lyrics);
    });
    more.appendChild(nextButton);
  }
}

async function getLyricsSafe(artist, songTitle) {
  showSpinner(); // add this
  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();

  result.innerHTML = '';
  more.innerHTML = '';

  if (data.error) {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = data.error;
    result.append(errorMessage);
    return;
  }

  // Create heading
  const heading = document.createElement('h2');
  const strong = document.createElement('strong');
  strong.textContent = artist;
  heading.append(strong, ` - ${songTitle}`);
  result.append(heading);

  // Create lyrics block with line breaks
  const span = document.createElement('span');
  const lines = data.lyrics.split(/\r\n|\r|\n/);
  lines.forEach((line, index) => {
    span.append(line);
    if (index < lines.length - 1) {
      span.append(document.createElement('br'));
    }
  });
  result.append(span);

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'btn';
  backBtn.textContent = '← Back to Results';
  backBtn.style.marginTop = '20px';
  backBtn.addEventListener('click', () => {
    if (lastSearchResults) {
      showDataSafe(lastSearchResults);
    }
  });
  more.appendChild(backBtn);
}

// Get more songs (pagination)
async function getMoreSongs(url) {
  showSpinner();
  const res = await fetch(url);
  const data = await res.json();

  lastSearchResults = data;
  showDataSafe(data);
}

function showSpinner() {
  result.innerHTML = '<div class="spinner"></div>';
  more.innerHTML = '';
}