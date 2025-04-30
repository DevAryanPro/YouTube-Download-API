const ytdl = require('ytdl-core');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const isValid = ytdl.validateURL(url);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = (await ytdl.getInfo(url)).videoDetails;
    const thumbnail = info.thumbnails[info.thumbnails.length - 1].url;

    return res.json({
      title: info.title,
      thumbnail: thumbnail,
      duration: info.lengthSeconds,
      author: info.author.name
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch video info' });
  }
};
