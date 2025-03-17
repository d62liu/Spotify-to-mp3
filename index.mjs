import puppeteer from 'puppeteer';
import promptSync from 'prompt-sync';
import fs from 'fs';

const client_id = process.env.SPOTIFY_CLIENT_ID || 'YOUR_CLIENT_ID';
const client_secret = process.env.SPOTIFY_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';

const prompt = promptSync();

function extractPlaylistId(input) {
  const regex = /playlist\/([a-zA-Z0-9]+)/;
  const match = input.match(regex);
  return match ? match[1] : input.trim() || null;
}

let playlistId = process.argv[2]
  ? extractPlaylistId(process.argv[2])
  : extractPlaylistId(prompt('Enter Spotify Playlist URL or ID: '));

if (!playlistId) {
  console.error("Invalid playlist URL or ID provided.");
  process.exit(1);
}

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
      console.error(`Error fetching access token: ${response.status} - ${response.statusText}`);
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
  const tracks = [];
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.error("Failed to retrieve access token.");
      return null;
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error(`Error fetching playlist items: ${response.status} - ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    for (const item of data.items) {
      if (item && item.track) {
        const songName = item.track.name;
        const artistNames = item.track.artists.map(artist => artist.name).join(", ");
        tracks.push({ track: `${songName} by ${artistNames}`, songName, artistNames });
      }
    }
    return tracks;
  } catch (error) {
    console.error("Error fetching playlist items:", error);
    return null;
  }
}

async function getYouTubeLink(browser, searchQuery) {
  const page = await browser.newPage();
  try {
    await page.goto('https://www.youtube.com', { waitUntil: 'networkidle2' });
    await page.type('input#search', searchQuery);
    await page.keyboard.press('Enter');
    await page.waitForSelector('ytd-video-renderer', { timeout: 40000 });

    const firstThumbnail = await page.$('ytd-video-renderer a#thumbnail');
    if (firstThumbnail) {
      const videoLink = await page.evaluate(el => el.href, firstThumbnail);
      return videoLink;
    } else {
      console.log("No video found for:", searchQuery);
      return null;
    }
  } catch (error) {
    console.error("Error fetching YouTube link for query:", searchQuery, error);
    return null;
  } finally {
    await page.close();
  }
}

function saveResultsToCSV(results, filename = "results.csv") {
  const header = "Song,YouTube Link\n";
  const rows = results
    .map(item => `"${item.track.replace(/"/g, '""')}","${item.youtubeLink || ''}"`)
    .join("\n");
  fs.writeFileSync(filename, header + rows);
  console.log(`Results saved to ${filename}`);
}

async function main() {
  console.log("Fetching Spotify playlist items...");
  const playlistItems = await getPlaylistItems();
  if (!playlistItems || playlistItems.length === 0) {
    console.error("Playlist is empty or could not be retrieved.");
    return;
  }
  console.log(`Found ${playlistItems.length} tracks.`);

  console.log("Launching browser to fetch YouTube links...");
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    for (const item of playlistItems) {
      console.log(`Searching YouTube for: ${item.track}`);
      const youtubeLink = await getYouTubeLink(browser, item.track);
      item.youtubeLink = youtubeLink;
      console.log(`Found YouTube link: ${youtubeLink}`);
    }
  } catch (error) {
    console.error("Error during YouTube search:", error);
  } finally {
    if (browser) await browser.close();
  }

  const successfulItems = playlistItems.filter(item => item.youtubeLink);
  console.log(`Successfully found YouTube links for ${successfulItems.length} out of ${playlistItems.length} tracks.`);

  saveResultsToCSV(playlistItems);

  return playlistItems;
}

main();

export { main, getPlaylistItems };
