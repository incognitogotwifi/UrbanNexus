#!/bin/bash

# Build script for BrowserQuest
# This script creates the client-build directory and copies optimized assets

echo "Building BrowserQuest..."

# Create build directory
mkdir -p client-build

# Copy static files
cp -r client/*.html client-build/
cp -r client/*.json client-build/
cp -r client/css client-build/
cp -r client/maps client-build/

# Create minified JS bundle
echo "Creating JavaScript bundle..."
mkdir -p client-build/js

# Simple concatenation of core JS files (in real implementation, this would use RequireJS optimizer)
cat client/js/lib/jquery.min.js \
    client/js/lib/underscore.min.js \
    client/js/lib/modernizr.min.js \
    client/js/*.js > client-build/js/game.min.js

echo "Build complete!"
