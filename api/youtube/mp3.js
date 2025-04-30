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

    const info = await ytdl.getInfo(url);
    const videoName = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    res.setHeader('Content-Disposition', `attachment; filename="${videoName}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    ytdl(url, {
      quality: 'highestaudio',
      filter: 'audioonly',
      format: 'mp3'
    }).pipe(res);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to process MP3' });
  }
};
