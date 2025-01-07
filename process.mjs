import ytdl from '@distube/ytdl-core'
import fs from "fs";
import {main, getPlaylistItem} from "./index.mjs" 

const url = await main();
const playlist = await getPlaylistItem();
for (let i = 0; i < length(url); i++){
(async () => {
  try {
    const stream = await ytdl(url[i]);
    stream.pipe(fs.createWriteStream(`${playlist[i]}.mp4`))
      .on("finish", () => {
        console.log("Download completed!");
      })
      .on("error", (error) => {
        console.error("Error writing to file:", error);
      });
  } catch (error) {
    console.error("Error downloading video:", error);
  }
})();
}



