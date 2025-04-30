module.exports = (req, res) => {
  const ping = new Date();
  ping.setHours(ping.getHours() - 3);
  console.log(
    `Ping at: ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`
  );
  res.json({
    message: 'YouTube API Service',
    endpoints: {
      info: '/api/youtube/info?url=YOUTUBE_URL',
      mp3: '/api/youtube/mp3?url=YOUTUBE_URL',
      mp4: '/api/youtube/mp4?url=YOUTUBE_URL',
      docs: '/api-docs'
    }
  });
};
