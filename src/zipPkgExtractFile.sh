#!/bin/sh

if [ ! -e "${1}" ]; then
    echo "failure" >&2
    exit 1
fi

unzip -d "${2}" "${1}"

find -E "${2}" -regex ".*/.*\.pkg$" cp -a {} "${3}" \;

rm -rf "${2}"

if [ -e "${3}" ]; then
    echo "extracted"
    exit 0
else
    echo "failure" >&2
    exit 1
fi