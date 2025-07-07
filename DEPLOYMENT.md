# Deployment Instructions for LOKAWAZ

## Overview
This guide will help you deploy the LOKAWAZ application using:
- **Frontend**: Netlify (React/Vite app)
- **Backend**: Railway (Node.js/Express API)
- **Database**: PostgreSQL (Railway or Neon)

## Prerequisites
1. GitHub account
2. Netlify account
3. Railway account (or alternative: Render, Heroku)
4. Cloudinary account (for image uploads)
5. Groq account (for AI chatbot)

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

## Step 2: Deploy Backend on Railway

1. **Go to Railway.app** and sign in
2. **Create New Project** → **Deploy from GitHub repo**
3. **Select your repository**
4. **Configure the service**:
   - Root Directory: `server`
   - Start Command: `npm start`
   - Port: `8000`

5. **Set Environment Variables** in Railway:
   ```
   NODE_ENV=production
   PORT=8000
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   DATABASE_URL=postgresql://username:password@hostname:port/database
   CORS_ORIGIN=https://your-app-name.netlify.app
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   GROQ_API_KEY=your-groq-api-key
   ```

6. **Deploy** and note your Railway URL (e.g., `https://your-app.railway.app`)

## Step 3: Setup Database

**Option A: Railway PostgreSQL**
1. In Railway, add a PostgreSQL service
2. Copy the DATABASE_URL from Railway
3. Update your environment variables

**Option B: Neon (Recommended)**
1. Go to neon.tech and create account
2. Create new project
3. Copy connection string
4. Add to Railway environment variables

## Step 4: Deploy Frontend on Netlify

1. **Go to Netlify** and sign in
2. **New site from Git** → **GitHub**
3. **Select your repository**
4. **Configure build settings**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`

5. **Set Environment Variables** in Netlify:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

6. **Deploy** and note your Netlify URL

## Step 5: Update CORS Configuration

1. **Update your backend environment** in Railway:
   ```
   CORS_ORIGIN=https://your-actual-netlify-url.netlify.app
   ```

2. **Redeploy** the backend

## Step 6: Update Frontend API URL

Update the `netlify.toml` file with your actual backend URL:
```toml
[context.production.environment]
  VITE_API_BASE_URL = "https://your-actual-backend.railway.app/api"
```

## Step 7: Database Migration

1. **Connect to your deployed database**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed the database** (if needed):
   ```bash
   npm run db:seed
   ```

## Step 8: Test Your Deployment

1. **Visit your Netlify URL**
2. **Test all functionality**:
   - User registration/login
   - Creating issues
   - Image uploads
   - Chatbot
   - Admin dashboard

## Alternative Deployment Options

### Backend Alternatives:
- **Render**: Similar to Railway, free tier available
- **Vercel**: Good for Node.js APIs
- **DigitalOcean App Platform**: More control

### Database Alternatives:
- **Supabase**: PostgreSQL with built-in auth
- **PlanetScale**: MySQL-compatible
- **MongoDB Atlas**: NoSQL option

### Frontend Alternatives:
- **Vercel**: Alternative to Netlify
- **GitHub Pages**: For static sites only

## Security Checklist

✅ Change default JWT secret
✅ Use strong database passwords
✅ Enable HTTPS (automatic on Netlify/Railway)
✅ Set proper CORS origins
✅ Use environment variables for all secrets
✅ Enable rate limiting in production

## Monitoring and Logs

- **Railway**: Built-in logging and metrics
- **Netlify**: Function logs and analytics
- **Consider**: Adding error tracking (Sentry)

## Custom Domain (Optional)

1. **Buy domain** from registrar
2. **Add to Netlify**: Site settings → Domain management
3. **Update CORS** in backend to include custom domain

## Troubleshooting

**Common Issues**:
1. **CORS errors**: Check CORS_ORIGIN environment variable
2. **Database connection**: Verify DATABASE_URL
3. **Build failures**: Check Node.js version compatibility
4. **API not found**: Verify VITE_API_BASE_URL

**Debug Steps**:
1. Check deployment logs in Railway/Netlify
2. Test API endpoints directly
3. Verify environment variables
4. Check network tab in browser dev tools
