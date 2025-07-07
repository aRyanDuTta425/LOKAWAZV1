#!/bin/bash

# Quick Vercel Deployment Script for LOKAWAZ

echo "🚀 LOKAWAZ Vercel Deployment"
echo "=============================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your database (Neon/Supabase)"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Update VITE_API_BASE_URL with your Vercel domain"
echo "4. Run database migrations"
echo ""
echo "📖 See VERCEL_DEPLOYMENT.md for detailed instructions"
