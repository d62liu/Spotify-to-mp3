import puppeteer from 'puppeteer';

const client_id = 'd3122c73ca094774a88360da4b90e9c6';
const client_secret = '0fa9601ac3b54549b7fb30131f25c42d';
const playlistid = '6dQz1ZnwnluFiUhBOMrJQC';

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
    const info = [];
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
        for (const item of data.items) {
            if (item && item.track) {
                const songName = item.track.name;
                const artistNames = item.track.artists.map(artist => artist.name).join(", ");
                info.push(`${songName} by ${artistNames}`);
            }
        }
        return info;
    } catch (error) {
        console.error("Error fetching playlist items:", error);
        return null;
    }
}


const getYoutubeThumbnailLink = async (searchQuery) => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to YouTube
    await page.goto('https://www.youtube.com');
    console.log("YouTube loaded");

    await page.type('input#search', searchQuery);
    console.log("Search query entered");

    const searchButton = await page.$('button#search-icon-legacy');
    if (searchButton) {
        console.log("Search button clicked");
        await searchButton.click();
    } else {
        console.log("Search button not found");
        await browser.close();
        return;
    }

    await page.waitForSelector('ytd-video-renderer', { timeout: 10000 });

    const firstThumbnail = await page.$('ytd-video-renderer a#thumbnail');
    if (firstThumbnail) {
        console.log("First video thumbnail found and clicked");
        await firstThumbnail.click();
    } else {
        console.log("No video thumbnails found");
        await browser.close();
        return;
    }

    await page.waitForSelector('h1.title', { timeout: 10000 });

    const videoLink = page.url();
    console.log("Video link:", videoLink);


    return videoLink;
};

(async () => {
    const searchQuery = "Hello by Adele"; 
    const videoLink = await getYoutubeThumbnailLink(searchQuery);

    if (videoLink) {
        console.log("Video link:", videoLink);
    } else {
        console.log("Failed to retrieve video link");
    }
})();

