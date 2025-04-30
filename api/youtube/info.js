const ytdl = require('ytdl-core');

module.exports = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await ytdl.getInfo(url);
    const details = info.videoDetails;
    const thumbnail = info.videoDetails.thumbnails.pop().url;

    return res.json({
      title: details.title,
      thumbnail: thumbnail,
      duration: details.lengthSeconds,
      author: details.author.name,
      viewCount: details.viewCount
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch video info' });
  }
};
