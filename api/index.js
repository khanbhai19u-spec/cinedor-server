const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

app.get('/api/stream', async (req, res) => {
    try {
        const { id, type = 'movie', season = 1, episode = 1 } = req.query;

        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'TMDB ID is required!' 
            });
        }

        const primaryStream = type === 'movie'
            ? `https://vidsrc.cc/v2/embed/movie/${id}`
            : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;

        const backupStream = type === 'movie'
            ? `https://player.autoembed.cc/embed/movie/${id}`
            : `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`;

        const downloadBase = type === 'movie' 
            ? `https://dl.vidsrc.vip/movie/${id}`
            : `https://dl.vidsrc.vip/tv/${id}/${season}/${episode}`;

        return res.json({
            success: true,
            tmdb_id: id,
            media_type: type,
            season: type === 'tv' ? parseInt(season) : null,
            episode: type === 'tv' ? parseInt(episode) : null,
            streams: [
                {
                    server_name: "Primary Stream Server",
                    url: primaryStream,
                    headers: { "User-Agent": USER_AGENT, "Referer": "https://vidsrc.cc/" }
                },
                {
                    server_name: "Backup Stream Server",
                    url: backupStream,
                    headers: { "User-Agent": USER_AGENT, "Referer": "https://autoembed.cc/" }
                }
            ],
            downloads: [
                { quality: "1080p Full HD", url: `${downloadBase}?res=1080` },
                { quality: "720p HD", url: `${downloadBase}?res=720` },
                { quality: "480p SD", url: `${downloadBase}?res=480` }
            ]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        status: "Online",
        message: "BZD Media Server is running perfectly!",
        usage: "/api/stream?id=550&type=movie"
    });
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
