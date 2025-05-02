const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");

const app = express();
app.use(cors());

// Constants
const API_NAME = "YouTube Download API";
const API_VERSION = "1.0.0";
const API_DESCRIPTION = "A professional API for fetching YouTube video information and downloading content in MP3/MP4 formats";
const API_BASE_URL = "https://you-tube-download-api.vercel.app";

// Helper function to validate YouTube URL
const validateYouTubeUrl = (url) => {
  return ytdl.validateURL(url) && ytdl.validateID(ytdl.getURLVideoID(url));
};

// API Documentation Endpoint
app.get("/", (req, res) => {
  const documentation = {
    api: API_NAME,
    version: API_VERSION,
    description: API_DESCRIPTION,
    endpoints: {
      info: {
        url: `${API_BASE_URL}/info?url={youtube_url}`,
        description: "Get video information (title, thumbnail, etc.)",
        parameters: {
          url: "YouTube video URL (required)"
        },
        example: `${API_BASE_URL}/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ`
      },
      mp3: {
        url: `${API_BASE_URL}/mp3?url={youtube_url}`,
        description: "Download audio in MP3 format",
        parameters: {
          url: "YouTube video URL (required)"
        },
        example: `${API_BASE_URL}/mp3?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ`
      },
      mp4: {
        url: `${API_BASE_URL}/mp4?url={youtube_url}`,
        description: "Download video in MP4 format",
        parameters: {
          url: "YouTube video URL (required)"
        },
        example: `${API_BASE_URL}/mp4?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ`
      }
    },
    note: "All endpoints require a valid YouTube URL as a query parameter",
    repository: "https://github.com/MatheusIshiyama/youtube-download-api"
  };

  res.json(documentation);
});

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Video Information Endpoint
app.get("/info", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: "Missing URL parameter",
        message: "Please provide a YouTube URL as a query parameter"
      });
    }

    if (!validateYouTubeUrl(url)) {
      return res.status(400).json({
        error: "Invalid YouTube URL",
        message: "The provided URL is not a valid YouTube video URL"
      });
    }

    const info = await ytdl.getInfo(url);
    const { videoDetails } = info;

    const response = {
      id: videoDetails.videoId,
      title: videoDetails.title,
      description: videoDetails.description,
      duration: videoDetails.lengthSeconds,
      views: videoDetails.viewCount,
      uploadDate: videoDetails.uploadDate,
      author: {
        name: videoDetails.author.name,
        channelUrl: videoDetails.author.channel_url,
        subscriberCount: videoDetails.author.subscriber_count
      },
      thumbnails: videoDetails.thumbnails,
      formats: info.formats.map(format => ({
        itag: format.itag,
        mimeType: format.mimeType,
        quality: format.quality,
        qualityLabel: format.qualityLabel,
        audioQuality: format.audioQuality,
        url: format.url
      })),
      relatedVideos: info.related_videos
    };

    res.json(response);
  } catch (error) {
    console.error("Error in /info endpoint:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request"
    });
  }
});

// MP3 Download Endpoint
app.get("/mp3", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: "Missing URL parameter",
        message: "Please provide a YouTube URL as a query parameter"
      });
    }

    if (!validateYouTubeUrl(url)) {
      return res.status(400).json({
        error: "Invalid YouTube URL",
        message: "The provided URL is not a valid YouTube video URL"
      });
    }

    const info = await ytdl.getInfo(url);
    const videoName = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    
    res.header("Content-Disposition", `attachment; filename="${videoName}.mp3"`);
    res.header("Content-Type", "audio/mpeg");

    ytdl(url, {
      quality: "highestaudio",
      filter: "audioonly",
      format: "mp3"
    }).pipe(res);

  } catch (error) {
    console.error("Error in /mp3 endpoint:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request"
    });
  }
});

// MP4 Download Endpoint
app.get("/mp4", async (req, res) => {
  try {
    const { url, quality } = req.query;

    if (!url) {
      return res.status(400).json({
        error: "Missing URL parameter",
        message: "Please provide a YouTube URL as a query parameter"
      });
    }

    if (!validateYouTubeUrl(url)) {
      return res.status(400).json({
        error: "Invalid YouTube URL",
        message: "The provided URL is not a valid YouTube video URL"
      });
    }

    const info = await ytdl.getInfo(url);
    const videoName = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    
    res.header("Content-Disposition", `attachment; filename="${videoName}.mp4"`);
    res.header("Content-Type", "video/mp4");

    const requestedQuality = quality || "highest";
    
    ytdl(url, {
      quality: requestedQuality,
      filter: format => format.container === 'mp4'
    }).pipe(res);

  } catch (error) {
    console.error("Error in /mp4 endpoint:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while processing your request"
    });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong on our end"
  });
});

// Start Server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`${API_NAME} v${API_VERSION} running on port ${PORT}`);
});
