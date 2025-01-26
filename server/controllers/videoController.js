import {  statSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReadStream } from "node:fs";
import https from "https";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const liveVideoStreamController = (req, res) => {
  try {
    const cloudinaryURL = "videoulr";

    const range = req.headers.range;

    if (!range) {
      return res.status(400).send("Requires Range header");
    }

    // Extract the range start and calculate chunk size
    const chunkSize = 10 ** 6; // 1 MB
    const start = Number(range.replace(/\D/g, ""));
    const end = start + chunkSize - 1;

    const options = {
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    };

    // Fetch video using HTTPS with the range header
    https.get(cloudinaryURL, options, (videoStream) => {
      const { statusCode, headers } = videoStream;

      // If the response is not partial content, return an error
      if (statusCode !== 206 && statusCode !== 200) {
        return res.status(500).send("Unable to fetch video.");
      }

      // Forward headers from Cloudinary to the client
      res.writeHead(statusCode, {
        "Content-Range": headers["content-range"],
        "Accept-Ranges": headers["accept-ranges"] || "bytes",
        "Content-Length": headers["content-length"],
        "Content-Type": headers["content-type"] || "video/mp4",
      });

      // Pipe the Cloudinary video stream to the client
      videoStream.pipe(res);
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};


export const staticVideoController =  (req, res) => {
    try {
      const file = __dirname + "/public/livechat.mp4";
  
      const stat = statSync(file);
      const fileSize = stat.size;
  
      const range = req.headers.range;
  
      if (!range) {
        return res.status(400).send("Requires Range header");
      }
  
      const chunkSize = 10 ** 6; // 1 MB
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + chunkSize - 1, fileSize - 1); // Adjust to avoid exceeding file size
      const contentLength = end - start + 1;
  
      const fileStream = createReadStream(file, { start, end });
  
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`, // Correct range format
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };
  
      res.writeHead(206, headers); // Set headers before piping data
      fileStream.pipe(res); // Pipe the stream to the response
    } catch (error) {
      res.status(500).send(error.message);
    }
  }