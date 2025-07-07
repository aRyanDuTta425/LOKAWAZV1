# Render Deployment Guide for LOKAWAZ Backend

## Overview
Deploy your LOKAWAZ Node.js backend on Render with automatic deployments from GitHub.

## Prerequisites
1. ✅ GitHub repository (already done)
2. ✅ Render account (sign up at render.com)
3. Database service (we'll use Render PostgreSQL or external)
4. Environment variables ready

## Step 1: Prepare Backend for Render

### Update package.json for production
The server package.json should have these scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npx prisma generate",
    "postinstall": "npx prisma generate"
  }
}
```

### Environment Variables Needed
```bash
# Database
DATABASE_URL=postgresql://username:password@hostname/database

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=production
PORT=10000

# CORS (your Vercel frontend URL)
CORS_ORIGIN=https://lokawazweb-jikbjvitq-aryan-duttas-projects.vercel.app

# External Services
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key  
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GROQ_API_KEY=your-groq-api-key
```

## Step 2: Deploy Backend to Render

### Method 1: Render Dashboard (Recommended)

1. **Go to Render.com** and sign in with GitHub
2. **Click "New +"** → **"Web Service"**
3. **Connect Repository**: Select your LOKAWAZV1 repository
4. **Configure Service**:
   - **Name**: `lokawaz-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

5. **Advanced Settings**:
   - **Auto-Deploy**: Yes (deploys on git push)
   - **Instance Type**: Free tier is fine for testing

### Method 2: render.yaml (Infrastructure as Code)

Create this file in your repo root:

```yaml
services:
  - type: web
    name: lokawaz-backend
    env: node
    rootDir: server
    buildCommand: npm install && npx prisma generate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

## Step 3: Setup Database

### Option A: Render PostgreSQL (Recommended)

1. **In Render Dashboard**: Click "New +" → "PostgreSQL"
2. **Configure Database**:
   - **Name**: `lokawaz-database`
   - **Database**: `lokawaz`
   - **User**: `lokawaz_user`
   - **Region**: Same as your web service
   - **Plan**: Free tier available

3. **Get Connection Details**:
   - After creation, copy the "External Database URL"
   - Format: `postgresql://username:password@hostname/database`

### Option B: External Database

- **Neon**: Free PostgreSQL with generous limits
- **Supabase**: PostgreSQL with additional features
- **ElephantSQL**: Simple PostgreSQL hosting

## Step 4: Configure Environment Variables

In your Render web service dashboard:

1. **Go to Environment tab**
2. **Add these variables**:

```bash
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-jwt-secret-at-least-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://lokawazweb-jikbjvitq-aryan-duttas-projects.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GROQ_API_KEY=your-groq-api-key
```

## Step 5: Deploy and Test

### Automatic Deployment
1. **Commit changes** to your repository
2. **Push to GitHub**: `git push origin main`
3. **Render automatically deploys** (if auto-deploy enabled)

### Manual Deployment
1. **In Render Dashboard**: Go to your service
2. **Click "Manual Deploy"** → "Deploy latest commit"

### Check Deployment
1. **Monitor build logs** in Render dashboard
2. **Test your API**: `https://your-service.onrender.com/health`
3. **Check database connection**: Logs will show connection status

## Step 6: Database Migration

Once deployed, initialize your database:

### Option A: Using Render Shell
1. **In Render Dashboard**: Go to your service
2. **Click "Shell"** tab
3. **Run migration commands**:
```bash
npx prisma db push
npx prisma db seed
```

### Option B: One-time Deploy Script
Add this to your package.json:
```json
{
  "scripts": {
    "deploy": "npx prisma db push && npx prisma db seed"
  }
}
```

## Step 7: Update Frontend

Update your Vercel environment variables:

1. **Go to Vercel Dashboard** → Your project → Settings → Environment Variables
2. **Update VITE_API_BASE_URL**:
```bash
VITE_API_BASE_URL=https://your-service-name.onrender.com/api
```
3. **Redeploy** your frontend

## Step 8: Test Full Application

### API Health Check
```bash
curl https://your-service-name.onrender.com/health
```

### Test Authentication
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

### Test Database Connection
Check your Render logs for database connection messages.

## Render Service URLs

After deployment, you'll get:
- **Service URL**: `https://your-service-name.onrender.com`
- **API Base**: `https://your-service-name.onrender.com/api`
- **Health Check**: `https://your-service-name.onrender.com/health`

## Troubleshooting

### Common Issues

**Build Failures**:
- Check build logs in Render dashboard
- Verify package.json scripts
- Ensure all dependencies are listed

**Database Connection**:
- Verify DATABASE_URL format
- Check if database service is running
- Ensure database allows external connections

**CORS Errors**:
- Verify CORS_ORIGIN matches your frontend URL
- Check if your frontend URL is correct

**Environment Variables**:
- Ensure all required variables are set
- Check for typos in variable names
- Verify sensitive values are correct

### Debug Commands

```bash
# Check logs
# Go to Render Dashboard → Service → Logs

# Test database connection
npx prisma db push --preview-feature

# Generate Prisma client
npx prisma generate

# Check environment
printenv | grep DATABASE_URL
```

## Performance Optimization

### Free Tier Limitations
- **Sleep after 15min inactivity** (wakes up on request)
- **750 hours/month** computing time
- **Limited memory/CPU**

### Upgrade Benefits
- **No sleep/downtime**
- **Better performance**
- **More compute resources**

## Monitoring

### Built-in Monitoring
- **Service Dashboard**: CPU, memory, response time
- **Logs**: Real-time and historical
- **Metrics**: Request count, error rates

### External Monitoring
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Performance**: New Relic, DataDog

## Security Best Practices

- ✅ **Environment variables** for all secrets
- ✅ **HTTPS** (automatic on Render)
- ✅ **CORS** properly configured
- ✅ **Rate limiting** enabled in your app
- ✅ **Input validation** on all endpoints

## Cost Estimation

### Free Tier
- **Web Service**: 750 hours/month (free)
- **PostgreSQL**: 90 days free, then $7/month
- **Bandwidth**: 100GB/month included

### Paid Tier
- **Starter**: $7/month (no sleep, better performance)
- **Pro**: $25/month (advanced features)

## Next Steps After Deployment

1. **Custom Domain**: Add your domain in Render dashboard
2. **SSL Certificate**: Automatic with custom domains  
3. **Database Backups**: Configure automated backups
4. **Monitoring**: Set up alerts and monitoring
5. **CI/CD**: Already configured with GitHub integration

## Support Resources

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Community**: Render Discord server
- **Support**: help@render.com for paid plans
