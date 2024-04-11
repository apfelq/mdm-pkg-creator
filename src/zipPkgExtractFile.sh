#!/bin/sh

unzip -d "${2}" "${1}"

fileName="$(find -E "${2}" -regex ".*/.*\.pkg$")"

cp -a "${fileName}" "${3}"

rm -rf "${2}"