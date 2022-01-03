
const userAccessToken; 

const Spotify = {
    getAccessToken() {
        if (userAccessToken) {
            return userAccessToken;
        }
    }
}

export default Spotify;