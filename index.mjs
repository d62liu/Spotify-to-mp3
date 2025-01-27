import puppeteer from 'puppeteer'; 
import promptSync from 'prompt-sync';
const client_id = 'YOUR CLIENT ID';
const client_secret = 'YOUR CLIENT';
const prompt = promptSync();
// let ask = prompt("playlist link:")
// let playlistlink = `${ask}`
const regex = '^/playlist\/([a-zA-Z0-9]+)\?/';
const playlistid = "3Yf4eUuIIV0dskod5W2Nkm" //(playlistlink.match(regex))[1];

export {main, getPlaylistItems};
async function getAccessToken() {
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
            }
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error);
        return null;
    }
}

async function getPlaylistItems() {
    const info = [];
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            console.error("Failed to retrieve access token");
            return null;
        }

        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistid}/tracks`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`);
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
async function getLink(val) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://www.youtube.com');             
        await page.type('[name="search_query"]', `${val}`);
        await page.keyboard.press('Enter');
        await page.waitForSelector('ytd-video-renderer', { timeout: 40000 });

        const firstThumbnail = await page.$('ytd-video-renderer a#thumbnail');
        if (firstThumbnail) {
            const videoLink = await page.evaluate(el => el.href, firstThumbnail);
            return videoLink;
        } else {
            console.log("No thumbnails found");
            return null;
        }
    } catch (error) {
        console.error("Error fetching link:", error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function main() {
    const links = [];
    try {
        const playlist = await getPlaylistItems();
        if (!playlist || playlist.length === 0) {
            console.error("Playlist is empty or could not be retrieved.");
            return;
        }

        for (const val of playlist) {
            const link = await getLink(val);
            if (link) {
                links.push(link);
            }
        }
       
        return(links) // remove for output
    } catch (error) {
        console.error("Error in main function:", error);
    }
}   
main();
