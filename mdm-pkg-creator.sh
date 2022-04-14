#!/bin/sh

# expand path
export PATH="/usr/local/bin:${PATH}"

# change to script dir
cd "$(dirname "$0")" || exit 1

# check that everything is up to date and installed
git pull
npm ci

# run node script
node dist/index.js 2>&1 | tee mdm-pkg-creator.log