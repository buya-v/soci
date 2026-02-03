import express from 'express';
import cors from 'cors';
import { adaptVercelHandler } from './adapter.js';

// Import all API handlers
import authLogin from '../api/auth/login.js';
import authTwitterAuthorize from '../api/auth/twitter/authorize.js';
import authTwitterCallback from '../api/auth/twitter/callback.js';
import authFacebookAuthorize from '../api/auth/facebook/authorize.js';
import authFacebookCallback from '../api/auth/facebook/callback.js';
import authFacebookRefresh from '../api/auth/facebook/refresh.js';
import twitterTweet from '../api/twitter/tweet.js';
import twitterTweetOauth1 from '../api/twitter/tweet-oauth1.js';
import twitterRefresh from '../api/twitter/refresh.js';
import facebookPost from '../api/facebook/post.js';
import facebookPages from '../api/facebook/pages.js';
import aiGenerateContent from '../api/ai/generate-content.js';
import aiGenerateImage from '../api/ai/generate-image.js';
import videoGenerate from '../api/video/generate.js';
import videoStatus from '../api/video/status.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login', adaptVercelHandler(authLogin));
app.get('/api/auth/twitter/authorize', adaptVercelHandler(authTwitterAuthorize));
app.get('/api/auth/twitter/callback', adaptVercelHandler(authTwitterCallback));
app.get('/api/auth/facebook/authorize', adaptVercelHandler(authFacebookAuthorize));
app.get('/api/auth/facebook/callback', adaptVercelHandler(authFacebookCallback));
app.post('/api/auth/facebook/refresh', adaptVercelHandler(authFacebookRefresh));

// Twitter routes
app.post('/api/twitter/tweet', adaptVercelHandler(twitterTweet));
app.post('/api/twitter/tweet-oauth1', adaptVercelHandler(twitterTweetOauth1));
app.post('/api/twitter/refresh', adaptVercelHandler(twitterRefresh));

// Facebook routes
app.post('/api/facebook/post', adaptVercelHandler(facebookPost));
app.get('/api/facebook/pages', adaptVercelHandler(facebookPages));

// AI routes
app.post('/api/ai/generate-content', adaptVercelHandler(aiGenerateContent));
app.post('/api/ai/generate-image', adaptVercelHandler(aiGenerateImage));

// Video routes
app.post('/api/video/generate', adaptVercelHandler(videoGenerate));
app.post('/api/video/status', adaptVercelHandler(videoStatus));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
