import ytdl from '@distube/ytdl-core'
import fs from "fs";
import {main, getPlaylistItems} from "./index.mjs" 
import pLimit from 'p-limit'; 

const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegStatic);


ffmpeg()
.input('video.mp4')
.outputOptions('-ab', '192k')
.saveToFile('audio.mp3')


const url = await main();
const playlist = await getPlaylistItems();
const limit = pLimit(5);

const download = async (videoUrl, videoname) => {
  try {
    const stream = await ytdl(videoUrl, {quality:"18"});
    stream.pipe(fs.createWriteStream(`${videoname}.mp3`))
      .on("finish", () => {
        console.log("Download completed!");
      })

      .on("error", (error) => {
        console.error("Error writing to file:", error);

      });
  } catch (error) {
    console.error("Error downloading video:", error);
  }
};

const tasks = []; 

for (let i = 0; i < url.length; i++) {
  const videoUrl = url[i];
  const fileName = playlist[i]; 
  const task = limit(() => download(videoUrl, fileName));
  tasks.push(task);
}
Promise.all(tasks).then(() => console.log("all downloads are complete"))