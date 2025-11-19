#!/bin/zsh

# change into dir
cd "$(dirname "${1}")" || exit 1

# create working dir
mkdir -p tmp
cd tmp  || exit 1

# extract pkg
xar -xf "${1}"

# get pkg dir
while read path; do

    cd "${path}" || continue
    cat Payload | gunzip -dc | cpio -i
    # find and move app
    find . -name "${2}" -exec mv {} "${3}" \;

done < <(find "$(pwd)" -maxdepth 1 -type d -name '*.pkg')

if [ -d "${3}" ]; then
    echo "extracted"
    exit 0
else
    echo "failure" >&2
    exit 1
fi
