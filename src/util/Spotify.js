
const clientID = '55a6e6e84e8547858179ce82db7c2e60';
const redirectURI = 'https://spotify-jammming.surge.sh/';

let accessToken; 

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        const newAccessToken = window.location.href.match(/access_token=([^&]*)/);
        const newExpiresIn = window.location.href.match(/expires_in=([^&]*)/);

        if (newAccessToken && newExpiresIn) {
            accessToken = newAccessToken[1];
            const expiresIn = Number(newExpiresIn[1]);
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        ).then(response => {
            if (response.ok) {
                return response.json();
            } throw new Error('Request failed!');
        }, networkError => {
            console.log(networkError.message);
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            } else {
                return jsonResponse.tracks.items.map(track => ({
                    id: track.id, 
                    name: track.name, 
                    artist: track.artists[0].name, 
                    album: track.album.name, 
                    uri: track.uri
                }));
            }
        });
    },

    savePlaylist(playlistName, trackURIs) {
        if (!(playlistName && trackURIs)) return;

        const accessToken = this.getAccessToken()
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };

        let userID; 
        let playlistID;

        return fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Request failed!');
          }, networkError => {
            console.log(networkError.message);
          }).then(jsonResponse => {
              userID = jsonResponse.id;
              return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                  method: 'POST',
                  headers: headers,
                  body: JSON.stringify({name: playlistName})
              }).then(response => {
                  if (response.ok) {
                      return response.json();
                  }
                  throw new Error('Request failed!');
              }, networkError => {
                  console.log(networkError.message);
              }).then(jsonResponse => {
                playlistID = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({uris: trackURIs})
                }).then(response => {
                    if (response.ok) {
                    return response.json();
                    }
                    throw new Error('Request failed!');
                }, networkError => {
                    console.log(networkError.message);
                }).then(jsonResponse => jsonResponse);
            });
        })
    }
}

export default Spotify;