import ytdl from '@distube/ytdl-core'
import fs from "fs";
import {main, getPlaylistItems} from "./index.mjs" 

const url = await main();
const playlist = await getPlaylistItems();

for (let i = 0; i < url.length; i++){
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



