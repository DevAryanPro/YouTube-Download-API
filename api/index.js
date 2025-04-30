module.exports = (req, res) => {
  res.json({
    message: 'YouTube API Service',
    endpoints: {
      info: '/info?url=YOUTUBE_URL',
      mp3: '/mp3?url=YOUTUBE_URL',
      mp4: '/mp4?url=YOUTUBE_URL'
    },
    example: '/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  });
};
