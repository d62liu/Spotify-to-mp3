const ytdl = require("@distube/ytdl-core");
const fs = require("fs");

const url = "https://www.youtube.com/watch?v=8WVBT7FrgJI&ab_channel=Ttv_thereaper22";

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
