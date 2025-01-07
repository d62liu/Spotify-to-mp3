import ytdl from '@distube/ytdl-core'
import fs from "fs";
import {main} from "./index.mjs" 
const url = "https://www.youtube.com/watch?v=asBlT_zETzU&ab_channel=supertf";

main();
(async () => {
  try {
    const stream = await ytdl(url);
    stream.pipe(fs.createWriteStream("test.mp4"))
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



