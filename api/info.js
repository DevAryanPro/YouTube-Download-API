const ytdl = require('ytdl-core');

module.exports = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });
    if (!ytdl.validateURL(url)) return res.status(400).json({ error: 'Invalid YouTube URL' });

    const info = await ytdl.getInfo(url);
    const thumbnails = info.videoDetails.thumbnails;
    
    res.json({
      title: info.videoDetails.title,
      thumbnail: thumbnails[thumbnails.length - 1].url,
      duration: info.videoDetails.lengthSeconds,
      author: info.videoDetails.author.name,
      viewCount: info.videoDetails.viewCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch video info' });
  }
};
