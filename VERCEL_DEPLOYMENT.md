# LOKAWAZ - Vercel Deployment Guide

## Overview
Deploy your full-stack LOKAWAZ application on Vercel with serverless functions for the backend and static hosting for the frontend.

## Prerequisites
1. GitHub account with your code pushed
2. Vercel account (sign up at vercel.com)
3. Database service (recommended: Neon, Supabase, or PlanetScale)
4. Cloudinary account (for image uploads)
5. Groq account (for AI chatbot)

## Step 1: Prepare Database

### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string
4. Note: `postgresql://username:password@hostname/database?sslmode=require`

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

### Option C: PlanetScale
1. Go to [planetscale.com](https://planetscale.com) and sign up
2. Create a new database
3. Create a branch (e.g., "main")
4. Get connection string

## Step 2: Setup External Services

### Cloudinary (Image Uploads)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials:
   - Cloud Name
   - API Key
   - API Secret

### Groq (AI Chatbot)
1. Sign up at [groq.com](https://groq.com)
2. Get your API key from the dashboard

## Step 3: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

## Step 4: Configure Environment Variables

In your Vercel dashboard, go to Project → Settings → Environment Variables and add:

### Database
```
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
```

### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
```

### Server Configuration
```
NODE_ENV=production
```

### Cloudinary (Image Uploads)
```
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Groq (AI Chatbot)
```
GROQ_API_KEY=your-groq-api-key
```

### Frontend Environment
```
VITE_API_BASE_URL=https://your-app-name.vercel.app/api
```

## Step 5: Database Setup

### Initialize Database
```bash
# Install dependencies locally
cd server
npm install

# Generate Prisma client
npx prisma generate

# Apply database schema
npx prisma db push

# Seed database (optional)
npm run db:seed
```

### Alternative: Use Vercel Functions
Create a one-time setup function by adding this to your Vercel environment:
```
SETUP_DATABASE=true
```

## Step 6: Update API URLs

After deployment, update your frontend environment variables in Vercel:
1. Go to Project → Settings → Environment Variables
2. Update `VITE_API_BASE_URL` with your actual Vercel URL
3. Redeploy the project

## Step 7: Test Your Deployment

1. Visit your Vercel URL
2. Test all functionality:
   - ✅ User registration/login
   - ✅ Creating issues
   - ✅ Image uploads
   - ✅ Chatbot functionality
   - ✅ Admin dashboard
   - ✅ Dark/light mode

## Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │  Vercel Functions│    │   Database      │
│   (Frontend)    │───▶│   (Backend API)  │───▶│  (Neon/Other)   │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Serverless     │    │   PostgreSQL    │
│   React App     │    │   Node.js/Express│    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs in Vercel dashboard
# Common fixes:
- Ensure all dependencies are in package.json
- Check Node.js version compatibility
- Verify build commands
```

#### 2. Database Connection Issues
```bash
# Verify DATABASE_URL format
# For Neon: postgresql://username:password@hostname/database?sslmode=require
# For Supabase: postgresql://postgres:password@hostname:5432/postgres
```

#### 3. API Not Working
```bash
# Check Function logs in Vercel dashboard
# Verify environment variables are set
# Test API endpoints directly: https://your-app.vercel.app/api/health
```

#### 4. CORS Issues
```javascript
// Already configured in server/src/config/cors.js
// Should work automatically with Vercel
```

### Debug Commands

```bash
# Local development
npm run dev

# Check Vercel deployment
vercel logs

# Test API locally
curl http://localhost:3000/api/health

# Test deployed API
curl https://your-app.vercel.app/api/health
```

## Custom Domain (Optional)

1. **Purchase domain** from any registrar
2. **In Vercel Dashboard**:
   - Go to Project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions
3. **Update environment variables** to use custom domain

## Performance Optimization

### Frontend
- ✅ Static asset optimization (automatic)
- ✅ Image optimization (use Vercel Image)
- ✅ Code splitting (Vite handles this)

### Backend
- ✅ Serverless functions (automatic scaling)
- ✅ Database connection pooling
- ✅ Edge caching for static responses

## Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Function Logs**: Available in Vercel dashboard
3. **Database Monitoring**: Available in your database provider
4. **Error Tracking**: Consider adding Sentry

## Security

- ✅ HTTPS (automatic on Vercel)
- ✅ Environment variables (secure storage)
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ JWT token security

## Scaling

- **Frontend**: Automatically scales with Vercel Edge Network
- **Backend**: Serverless functions auto-scale
- **Database**: Consider connection pooling for high traffic

## Cost Estimation

### Vercel (Free Tier)
- ✅ 100GB bandwidth/month
- ✅ 100 serverless function executions/day
- ✅ Custom domains

### Database
- **Neon**: Free tier with 512MB storage
- **Supabase**: Free tier with 500MB storage
- **PlanetScale**: Free tier with 1GB storage

## Next Steps

1. **Monitor Performance**: Check Vercel analytics
2. **Add Error Tracking**: Integrate Sentry or similar
3. **Setup CI/CD**: Automatic deployment on git push
4. **Add Testing**: Implement automated tests
5. **Backup Strategy**: Setup database backups

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Issues**: Create issues in your repository
- **Community**: Vercel Discord server
