#!/bin/bash

# Deployment script for EcomPhotos
# Run this script to push to GitHub

echo "🚀 Starting deployment..."

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add remote if it doesn't exist
if ! git remote | grep -q "origin"; then
    echo "🔗 Adding remote repository..."
    git remote add origin https://github.com/samuel-nelson/EcomPhotos.git
else
    echo "🔗 Updating remote repository..."
    git remote set-url origin https://github.com/samuel-nelson/EcomPhotos.git
fi

# Add all files
echo "📝 Staging files..."
git add -A

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit: Enterprise photo processing application with PhotoRoom API integration" || {
    echo "⚠️  No changes to commit or commit failed. Continuing..."
}

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://www.netlify.com"
    echo "2. Import your GitHub repository"
    echo "3. Add environment variables in Netlify dashboard"
    echo "4. Deploy!"
else
    echo "❌ Push failed. Please check your GitHub credentials and try again."
    echo "You may need to:"
    echo "1. Install Xcode Command Line Tools: xcode-select --install"
    echo "2. Set up GitHub authentication"
    exit 1
fi
