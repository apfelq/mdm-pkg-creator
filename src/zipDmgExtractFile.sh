#!/bin/sh

if [ ! -e "${1}" ]; then
    echo "failure" >&2
    exit 1
fi

unzip -d "${2}" "${1}"

rm -rf "${2}/__MACOSX"

find -E "${2}" -regex ".*/.*\.dmg$" -exec cp -a {} "${3}" \;

rm -rf "${2}"

if [ -e "${3}" ]; then
    echo "extracted"
    exit 0
else
    echo "failure" >&2
    exit 1
fi