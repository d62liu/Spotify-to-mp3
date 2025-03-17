import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';
import { main, getPlaylistItems } from './index.mjs';
import pLimit from 'p-limit';

const CONCURRENT_DOWNLOADS = parseInt(process.env.CONCURRENT_DOWNLOADS || '5', 10);
const DOWNLOAD_DIR = 'downloads';

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_');

const download = async (videoUrl, videoName, index, total) => {
  if (!videoUrl) {
    console.error(`Skipping ${videoName} (No valid URL)`);
    return;
  }

  try {
    console.log(`[${index + 1}/${total}] Downloading: ${videoName}`);

    const filePath = path.join(DOWNLOAD_DIR, `${sanitizeFilename(videoName)}.mp3`);
    const stream = await ytdl(videoUrl, { quality: '18' });

    return new Promise((resolve, reject) => {
      stream.pipe(fs.createWriteStream(filePath))
        .on('finish', () => {
          console.log(`✅ Download completed: ${videoName}`);
          resolve();
        })
        .on('error', (error) => {
          console.error(`❌ Error writing ${videoName}:`, error);
          reject(error);
        });
    });
  } catch (error) {
    console.error(`❌ Error downloading ${videoName}:`, error);
  }
};

const processDownloads = async () => {
  try {
    const urlList = await main();
    const playlist = await getPlaylistItems();

    if (!urlList || !playlist || urlList.length === 0 || playlist.length === 0) {
      console.error('No valid playlist items found.');
      return;
    }

    const limit = pLimit(CONCURRENT_DOWNLOADS);
    const tasks = urlList.map((videoUrl, i) =>
      limit(() => download(videoUrl, playlist[i].track, i, urlList.length))
    );

    await Promise.all(tasks);
    console.log('All downloads are complete!');
  } catch (error) {
    console.error('Error processing downloads:', error);
  }
};

processDownloads();
