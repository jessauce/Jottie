// Create spotify.js file with the Spotify integration code

// Spotify API configuration - Replace with your actual Client ID
const CLIENT_ID = '1794d3d794ec456eb1dfd78289716fe7';
const LOCAL_REDIRECT_URI = 'http://127.0.0.1:5500/public/callback.html';
const DEPLOYED_REDIRECT_URI = 'https://jotties.web.app/callback.html'; // Replace with actual deployed URL

const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-library-read'
];

// Detect if the app is deployed or running locally
const isDeployed = window.location.hostname !== '127.0.0.1' && window.location.hostname !== 'localhost';
const REDIRECT_URI = isDeployed ? DEPLOYED_REDIRECT_URI : LOCAL_REDIRECT_URI;

// Token storage keys
const TOKEN_KEY = 'spotify_access_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry';

// Check if token exists and is valid
function hasValidToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return false;
    return Date.now() < parseInt(expiry);
}

// Redirect to Spotify authorization page
function authorizeSpotify() {
    const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(' '))}&show_dialog=true`;
    window.location.href = url;
}

// Handle the redirect from Spotify with token
function handleCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    if (params.has('access_token')) {
        const token = params.get('access_token');
        const expiresIn = params.get('expires_in'); // in seconds
        const expiry = Date.now() + (parseInt(expiresIn) * 1000);
        
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiry);
        
        // Redirect back to the main page dynamically
        const MAIN_PAGE = isDeployed ? 'https://your-deployed-url.com/public/index.html' : 'http://127.0.0.1:5500/public/index.html';
        window.location.href = MAIN_PAGE;
        return true;
    }
    return false;
}

// Get the access token
function getAccessToken() {
    if (hasValidToken()) {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
}

// Initialize the Spotify Web Playback SDK
async function initSpotifyPlayer() {
    if (!hasValidToken()) {
        return false;
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
        
        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = getAccessToken();
            const player = new Spotify.Player({
                name: 'Jottie Music Player',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });
            
            // Error handling
            player.addListener('initialization_error', ({ message }) => {
                console.error('Initialization error:', message);
                reject(message);
            });
            
            player.addListener('authentication_error', ({ message }) => {
                console.error('Authentication error:', message);
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(TOKEN_EXPIRY_KEY);
                reject(message);
            });
            
            player.addListener('account_error', ({ message }) => {
                console.error('Account error:', message);
                reject(message);
            });
            
            player.addListener('playback_error', ({ message }) => {
                console.error('Playback error:', message);
            });
            
            // Playback status updates
            player.addListener('player_state_changed', state => {
                updatePlayerState(state);
            });
            
            // Ready
            player.addListener('ready', ({ device_id }) => {
                console.log('Spotify Player Ready with Device ID:', device_id);
                localStorage.setItem('spotify_device_id', device_id);
                resolve(player);
            });
            
            // Not Ready
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });
            
            // Connect to the player
            player.connect();
        };
    });
}

// Update player state in the UI
// Update player state in the UI
function updatePlayerState(state) {
    if (!state) {
        console.log('No state available');
        return;
    }
    
    const playerElement = document.getElementById('spotify-player-controls');
    if (!playerElement) return;
    
    const trackInfoElement = document.getElementById('spotify-track-info');
    const playButtonElement = document.getElementById('spotify-play-button');
    
    if (state.track_window.current_track) {
        const { current_track } = state.track_window;
        
        // Update track info
        trackInfoElement.innerHTML = `
            <img src="${current_track.album.images[0].url}" alt="Album Artwork" class="album-artwork">
            <div class="track-details">
                <div class="track-name">${current_track.name}</div>
                <div class="artist-name">${current_track.artists.map(artist => artist.name).join(', ')}</div>
            </div>
        `;
        
        // Update play/pause button
        playButtonElement.innerHTML = state.paused ? 
            '<i class="fas fa-play"></i>' : 
            '<i class="fas fa-pause"></i>';
            
        // Store the currently playing track info for the mini player
        const songData = {
            title: current_track.name,
            artist: current_track.artists.map(artist => artist.name).join(', '),
            albumArt: current_track.album.images[0].url
        };
        
        // Save to localStorage and dispatch event
        localStorage.setItem('currentlyPlaying', JSON.stringify(songData));
        window.dispatchEvent(new Event('spotifyUpdate'));
    }
}

// Play a track on Spotify
async function playTrack(uri) {
    const token = getAccessToken();
    if (!token) {
        console.error('No valid token found');
        return false;
    }
    
    const device_id = localStorage.getItem('spotify_device_id');
    if (!device_id) {
        console.error('No device ID found');
        return false;
    }
    
    try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                uris: [uri]
            })
        });
        return true;
    } catch (error) {
        console.error('Error playing track:', error);
        return false;
    }
}

// Search tracks on Spotify
async function searchTracks(query) {
    const token = getAccessToken();
    if (!token) {
        console.error('No valid token found');
        return [];
    }
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        return data.tracks.items;
    } catch (error) {
        console.error('Error searching tracks:', error);
        return [];
    }
}

// Get user's playlists
async function getUserPlaylists() {
    const token = getAccessToken();
    if (!token) {
        console.error('No valid token found');
        return [];
    }
    
    try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        return [];
    }
}

// Create Spotify widget for dashboard
function createSpotifyWidget(dashboardContainer) {
    const spotifyWidget = document.createElement('div');
    spotifyWidget.id = 'spotify-widget';
    spotifyWidget.className = 'widget';
    spotifyWidget.innerHTML = `
        <h2><i class="fab fa-spotify"></i> Spotify</h2>
        <div id="spotify-content">
            ${hasValidToken() ? `
                <div id="spotify-player">
                    <div id="spotify-track-info">
                        <div class="placeholder-text">Ready to play music</div>
                    </div>
                    <div id="spotify-player-controls">
                        <button id="spotify-previous-button"><i class="fas fa-step-backward"></i></button>
                        <button id="spotify-play-button"><i class="fas fa-play"></i></button>
                        <button id="spotify-next-button"><i class="fas fa-step-forward"></i></button>
                    </div>
                    <div id="spotify-search">
                        <input type="text" id="spotify-search-input" placeholder="Search for songs...">
                        <button id="spotify-search-button"><i class="fas fa-search"></i></button>
                    </div>
                    <div id="spotify-search-results"></div>
                    <div id="spotify-playlists">
                        <div>Your Playlists</div>
                        <ul id="spotify-playlist-list">
                            <li class="loading">Loading playlists...</li>
                        </ul>
                    </div>
                </div>
            ` : `
                <div id="spotify-login">
                    <p>Connect your Spotify account to play music.</p>
                    <button id="spotify-login-button" class="btn primary">Connect Spotify</button>
                </div>
            `}
        </div>
    `;
    
    dashboardContainer.appendChild(spotifyWidget);
    
    // Add event listeners
    if (hasValidToken()) {
        // Initialize player
        initSpotifyPlayer().then(player => {
            window.spotifyPlayer = player;
            
            // Load user playlists
            loadUserPlaylists();
            
            // Add control event listeners
            document.getElementById('spotify-play-button').addEventListener('click', () => {
                player.togglePlay();
            });
            
            document.getElementById('spotify-previous-button').addEventListener('click', () => {
                player.previousTrack();
            });
            
            document.getElementById('spotify-next-button').addEventListener('click', () => {
                player.nextTrack();
            });
            
            // Add search functionality
            const searchInput = document.getElementById('spotify-search-input');
            const searchButton = document.getElementById('spotify-search-button');
            
            const performSearch = () => {
                const query = searchInput.value.trim();
                if (query) {
                    const resultsElement = document.getElementById('spotify-search-results');
                    resultsElement.innerHTML = '<div class="loading">Searching...</div>';
                    
                    searchTracks(query).then(tracks => {
                        if (tracks.length === 0) {
                            resultsElement.innerHTML = '<div class="no-results">No tracks found</div>';
                            return;
                        }
                        
                        resultsElement.innerHTML = `
                            <ul class="search-results-list">
                                ${tracks.map(track => `
                                    <li data-uri="${track.uri}">
                                        <img src="${track.album.images[2]?.url || ''}" alt="Album thumbnail">
                                        <div class="track-info">
                                            <div class="track-name">${track.name}</div>
                                            <div class="artist-name">${track.artists.map(a => a.name).join(', ')}</div>
                                        </div>
                                    </li>
                                `).join('')}
                            </ul>
                        `;
                        
                        // Add click event to play tracks
                        document.querySelectorAll('.search-results-list li').forEach(item => {
                            item.addEventListener('click', () => {
                                const uri = item.dataset.uri;
                                playTrack(uri);
                            });
                        });
                    });
                }
            };
            
            searchButton.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }).catch(error => {
            console.error('Failed to initialize Spotify player:', error);
            const playerElement = document.getElementById('spotify-content');
            playerElement.innerHTML = `
                <div class="error-message">
                    <p>Failed to initialize Spotify player. Please try reconnecting or upgrade to premium.</p>
                    <button id="spotify-reconnect-button" class="btn primary">Reconnect Spotify</button>
                </div>
            `;
            
            document.getElementById('spotify-reconnect-button').addEventListener('click', () => {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(TOKEN_EXPIRY_KEY);
                authorizeSpotify();
            });
        });
    } else {
        // Add login button event listener
        document.getElementById('spotify-login-button').addEventListener('click', () => {
            authorizeSpotify();
        });
    }
}



// Load user's playlists into the widget
async function loadUserPlaylists() {
    const playlistsElement = document.getElementById('spotify-playlist-list');
    if (!playlistsElement) return;
    
    try {
        const playlists = await getUserPlaylists();
        
        if (playlists.length === 0) {
            playlistsElement.innerHTML = '<li class="no-playlists">No playlists found</li>';
            return;
        }
        
        playlistsElement.innerHTML = playlists.map(playlist => `
            <li data-id="${playlist.id}">
                <img src="${playlist.images[0]?.url || ''}" alt="Playlist cover">
                <span>${playlist.name}</span>
            </li>
        `).join('');
        
        // Add click event to load playlist tracks
        document.querySelectorAll('#spotify-playlist-list li').forEach(item => {
            item.addEventListener('click', async () => {
                const playlistId = item.dataset.id;
                await loadPlaylistTracks(playlistId);
            });
        });
    } catch (error) {
        console.error('Error loading playlists:', error);
        playlistsElement.innerHTML = '<li class="error">Failed to load playlists</li>';
    }
}

// Load tracks from a specific playlist
async function loadPlaylistTracks(playlistId) {
    const token = getAccessToken();
    if (!token) return;
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const tracks = data.items.map(item => item.track);
        
        const resultsElement = document.getElementById('spotify-search-results');
        resultsElement.innerHTML = `
            <div>Playlist Tracks</div>
            <ul class="search-results-list">
                ${tracks.map(track => `
                    <li data-uri="${track.uri}">
                        <img src="${track.album.images[2]?.url || ''}" alt="Album thumbnail">
                        <div class="track-info">
                            <div class="track-name">${track.name}</div>
                            <div class="artist-name">${track.artists.map(a => a.name).join(', ')}</div>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
        
        // Add click event to play tracks
        document.querySelectorAll('.search-results-list li').forEach(item => {
            item.addEventListener('click', () => {
                const uri = item.dataset.uri;
                playTrack(uri);
            });
        });
    } catch (error) {
        console.error('Error loading playlist tracks:', error);
        document.getElementById('spotify-search-results').innerHTML = '<div class="error">Failed to load playlist tracks</div>';
    }
}

// Check if we are on the callback page
function handleSpotifyAuth() {
    if (window.location.href.includes('callback') && window.location.hash) {
        return handleCallback();
    }
    return false;
}

// Export functions
export {
    authorizeSpotify,
    createSpotifyWidget,
    handleSpotifyAuth,
    hasValidToken
};

function updateSpotifyWidget(songData) {
    const { title, artist, albumArt } = songData;

    // Update Jotify's full Spotify widget
    const songTitle = document.getElementById('spotify-song-title');
    const songArtist = document.getElementById('spotify-song-artist');
    const songImage = document.getElementById('spotify-album-art');

    if (songTitle && songArtist && songImage) {
        songTitle.textContent = title;
        songArtist.textContent = artist;
        songImage.src = albumArt;
    }

    // Broadcast the currently playing song to the rest of the app
    localStorage.setItem('currentlyPlaying', JSON.stringify(songData));

    // Dispatch an event to notify other pages (like the dashboard)
    window.dispatchEvent(new Event('spotifyUpdate'));
}

// Add this to your spotify.js file

// Create a mini player for the dashboard
export function createSpotifyMiniPlayer(dashboardContainer) {
    const miniPlayerWidget = document.createElement('div');
    miniPlayerWidget.id = 'spotify-mini-widget';
    miniPlayerWidget.className = 'widget';
    miniPlayerWidget.style.order = '-1'; // Make it appear at the top 999 kung bottom 
     
    miniPlayerWidget.innerHTML = `
        <h2><i class="fab fa-spotify"></i>Jotify</h2>
        <div id="spotify-mini-content">
            <div id="spotify-mini-track-info">
                <div class="placeholder-text">Not playing</div>
            </div>
        </div>
    `;
    
    dashboardContainer.appendChild(miniPlayerWidget);
    
    // Listen for Spotify updates
    window.addEventListener('spotifyUpdate', updateMiniPlayer);
    
    // Check if there's already a song playing when loading the dashboard
    const currentlyPlaying = localStorage.getItem('currentlyPlaying');
    if (currentlyPlaying) {
        try {
            const songData = JSON.parse(currentlyPlaying);
            updateMiniPlayerWithData(songData);
        } catch (e) {
            console.error('Error parsing currently playing data', e);
        }
    } else {
        // If no song is currently saved, check the current playback
        fetchCurrentPlayback();
    }
}

// Update the mini player with currently playing song
function updateMiniPlayer() {
    const currentlyPlaying = localStorage.getItem('currentlyPlaying');
    if (currentlyPlaying) {
        try {
            const songData = JSON.parse(currentlyPlaying);
            updateMiniPlayerWithData(songData);
        } catch (e) {
            console.error('Error parsing currently playing data', e);
        }
    } else {
        const trackInfoElement = document.getElementById('spotify-mini-track-info');
        if (trackInfoElement) {
            trackInfoElement.innerHTML = `<div class="placeholder-text">Not playing</div>`;
        }
    }
}

// Update mini player UI with song data
function updateMiniPlayerWithData(songData) {
    const trackInfoElement = document.getElementById('spotify-mini-track-info');
    if (!trackInfoElement) return;
    
    const { title, artist, albumArt } = songData;
    
    trackInfoElement.innerHTML = `
        <img src="${albumArt}" alt="Album Artwork" class="album-artwork">
        <div class="track-details">
            <div class="track-name">${title}</div>
            <div class="artist-name">${artist}</div>
        </div>
    `;
}

// Fetch current playback from Spotify API
async function fetchCurrentPlayback() {
    const token = getAccessToken();
    if (!token) return;
    
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 204) {
            // No content - nothing is playing
            return;
        }
        
        const data = await response.json();
        if (data && data.item) {
            const songData = {
                title: data.item.name,
                artist: data.item.artists.map(a => a.name).join(', '),
                albumArt: data.item.album.images[0]?.url || ''
            };
            
            // Update localStorage and UI
            localStorage.setItem('currentlyPlaying', JSON.stringify(songData));
            updateMiniPlayerWithData(songData);
        }
    } catch (error) {
        console.error('Error fetching current playback:', error);
    }
}