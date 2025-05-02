const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");

const app = express();
app.use(cors());

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An error occurred while processing your request",
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// API Documentation Endpoint
app.get("/", (req, res) => {
  res.json({
    api: "YouTube Download API",
    status: "operational",
    endpoints: {
      info: "/info?url=YOUTUBE_URL",
      mp3: "/mp3?url=YOUTUBE_URL",
      mp4: "/mp4?url=YOUTUBE_URL"
    },
    example: "https://you-tube-download-api.vercel.app/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  });
});

// Video Information Endpoint
app.get("/info", async (req, res, next) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: "Bad Request", 
        message: "YouTube URL parameter is required" 
      });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ 
        error: "Bad Request", 
        message: "Invalid YouTube URL" 
      });
    }

    const info = await ytdl.getInfo(url).catch(err => {
      console.error('YTDL Info Error:', err);
      throw new Error("Failed to fetch video information");
    });

    const { title, thumbnails, lengthSeconds, viewCount } = info.videoDetails;
    
    res.json({
      title,
      duration: lengthSeconds,
      views: viewCount,
      thumbnail: thumbnails[thumbnails.length - 1].url,
      formats: info.formats.map(f => ({
        itag: f.itag,
        quality: f.qualityLabel,
        mimeType: f.mimeType,
        url: f.url
      }))
    });

  } catch (err) {
    next(err); // Pass to error handling middleware
  }
});

// MP3 Download Endpoint
app.get("/mp3", async (req, res, next) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: "Bad Request", 
        message: "YouTube URL parameter is required" 
      });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ 
        error: "Bad Request", 
        message: "Invalid YouTube URL" 
      });
    }

    const info = await ytdl.getInfo(url).catch(err => {
      console.error('YTDL Info Error:', err);
      throw new Error("Failed to fetch video information");
    });

    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    ytdl(url, {
      quality: 'highestaudio',
      filter: 'audioonly',
    }).on('error', err => {
      console.error('YTDL Stream Error:', err);
      res.status(500).json({ 
        error: "Download Failed", 
        message: "Error while streaming audio" 
      });
    }).pipe(res);

  } catch (err) {
    next(err);
  }
});

// MP4 Download Endpoint
app.get("/mp4", async (req, res, next) => {
  try {
    const { url, quality = 'highest' } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: "Bad Request", 
        message: "YouTube URL parameter is required" 
      });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ 
        error: "Bad Request", 
        message: "Invalid YouTube URL" 
      });
    }

    const info = await ytdl.getInfo(url).catch(err => {
      console.error('YTDL Info Error:', err);
      throw new Error("Failed to fetch video information");
    });

    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    
    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.header('Content-Type', 'video/mp4');

    ytdl(url, {
      quality,
      filter: format => format.container === 'mp4',
    }).on('error', err => {
      console.error('YTDL Stream Error:', err);
      res.status(500).json({ 
        error: "Download Failed", 
        message: "Error while streaming video" 
      });
    }).pipe(res);

  } catch (err) {
    next(err);
  }
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
