#!/bin/sh

unzip -d "${2}" "${1}"

rm -rf "${2}/__MACOSX"

fileName="$(find -E "${2}" -regex ".*/.*\.dmg$")"

cp -a "${fileName}" "${3}"

rm -rf "${2}"