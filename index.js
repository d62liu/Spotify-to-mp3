const client_id = 'd3122c73ca094774a88360da4b90e9c6';
const client_secret = '0fa9601ac3b54549b7fb30131f25c42d';
const playlistid = '2FfM3gA2Kl9Zl8PKsNmfgw';

async function get_accesstoken() {
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            body: `grant_type=client_credentials`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${btoa(`${client_id}:${client_secret}`)}`
            },
            method: "POST"
        });

        if (!response.ok) {
            console.log(`Error: ${response.status} - ${response.statusText}`);
            return null; 
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error);
        return null;
    }
}

async function get_playlist_items() {
    try {
        const accessToken = await get_accesstoken();
        if (!accessToken) {
            console.error("Failed to retrieve access token");
            return null;
        }

        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistid}/tracks`, {
            headers: {
                "Authorization": `Bearer ${accessToken}` 
            },
        });

        if (!response.ok) {
            console.log(`Error: ${response.status} - ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching playlist items:", error);
        return null;
    }
}

get_playlist_items().then(data => {
    if (!data || !data.items) {
        console.log("empty");
        return;
    }
    for (const item of data.items) { // Use for...of to iterate over array elements
        if (item && item.track) {
            const songName = item.track.name; // Access the track's 'name' property
            const artistNames = item.track.artists.map(artist => artist.name).join(", "); // Get artist names
            console.log(`Artist(s): ${artistNames}, Song: ${songName}`);
        }
    }
});