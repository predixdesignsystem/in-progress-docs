#!/bin/bash

# Exit with nonzero exit code if anything fails
set -e

# Move to repo root
cd $TRAVIS_BUILD_DIR

# Initialize a fresh git repo in this subdirectory we'll commit to
rm -rf .git/
git init .
git checkout --orphan gh-pages

# Prep git credentials
GIT_USER_NAME="Travis CI"
GIT_USER_EMAIL="PredixtravisCI@ge.com"
GIT_COMMIT_MESSAGE="[Travis] Rebuild documentation (commit: $TRAVIS_COMMIT)"

# Set git credentials
git config user.name $GIT_USER_NAME
git config user.email $GIT_USER_EMAIL

# Add and commit changes
git add -A . &>/dev/null
git commit --allow-empty -m "[Travis] Rebuild documentation ($(date))" &>/dev/null

# After cloning
git remote add origin "https://$GH_USERNAME:$GH_TOKEN@github.com/predixdesignsystem/in-progress-docs.git"
git push origin gh-pages:gh-pages --force
