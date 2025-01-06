import puppeteer from 'puppeteer';

const client_id = 'd3122c73ca094774a88360da4b90e9c6';
const client_secret = '0fa9601ac3b54549b7fb30131f25c42d';
const playlistid = '5jeFDsaqN1LtQA96PdC6Ve';

async function get_accesstoken() {
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            body: `grant_type=client_credentials`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}` // Fixed use of Buffer for base64 encoding
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
            return [];
        }

        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistid}/tracks`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
        });

        if (!response.ok) {
            console.log(`Error: ${response.status} - ${response.statusText}`);
            return [];
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
        return [];
    }
}

async function get_link(val) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://www.youtube.com');

        await page.type('[name="search_query"]', val);
        await page.keyboard.press('Enter');

        await page.waitForSelector('ytd-video-renderer', { timeout: 40000 });

        const firstThumbnail = await page.$('ytd-video-renderer a#thumbnail');
        if (firstThumbnail) {
            const videoLink = await page.evaluate(el => el.href, firstThumbnail);
            console.log(videoLink);
            return videoLink;
        } else {
            console.log("No video thumbnails found");
            return null;
        }
    } catch (error) {
        console.error(`Error fetching link for ${val}:`, error);
        return null;
    } finally {
        await browser.close();
    }
}

async function main() {
    const playlist = await get_playlist_items();
    const links = [];

    for (const val of playlist) {
        const link = await get_link(val);
        if (link) {
            links.push(link);
        }
    }

    console.log(links);
    return links;
}

main().then((links) => {
    console.log("Finished fetching links:", links);
}).catch((error) => {
    console.error("Error in main function:", error);
});
