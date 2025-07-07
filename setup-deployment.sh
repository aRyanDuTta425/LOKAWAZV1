#!/bin/bash

# Deployment Setup Script for LOKAWAZ

echo "🚀 LOKAWAZ Deployment Setup"
echo "============================"

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "client" ] && [ ! -d "server" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."

# Install client dependencies
echo "Installing client dependencies..."
cd client && npm install
if [ $? -eq 0 ]; then
    echo "✅ Client dependencies installed"
else
    echo "❌ Failed to install client dependencies"
    exit 1
fi

# Install server dependencies
echo "Installing server dependencies..."
cd ../server && npm install
if [ $? -eq 0 ]; then
    echo "✅ Server dependencies installed"
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Failed to generate Prisma client"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Create accounts on Railway and Netlify"
echo "2. Set up your database (Railway PostgreSQL or Neon)"
echo "3. Configure environment variables"
echo "4. Deploy backend to Railway"
echo "5. Deploy frontend to Netlify"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
