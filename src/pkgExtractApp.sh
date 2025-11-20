#!/bin/zsh

# change into dir
cd "$(dirname "${1}")" || exit 1

# extract pkg
pkgutil --expand-full "${1}" tmp

# find and move app
/usr/bin/find . -name "${2}" -exec mv {} "${3}" \;

if [ -d "${3}" ]; then
    echo "extracted"
    exit 0
else
    echo "failure" >&2
    exit 1
fi
