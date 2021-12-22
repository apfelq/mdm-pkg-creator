#!/bin/zsh

output=$(osascript ./src/pkgExtractApp.scpt "${1}" "${2}" "${3}")

if [ "${output}" = "extracted" ]; then
    echo "${output}"
    exit 0
else
    echo "${output}" >&2
    exit 1
fi
