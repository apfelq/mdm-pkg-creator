#!/bin/sh

if defaults read "${1}" CFBundleShortVersionString > /dev/null 2>&1; then
    defaults read "${1}" CFBundleShortVersionString
    exit
elif defaults read "${1}" CFBundleVersion > /dev/null 2>&1; then
    defaults read "${1}" CFBundleVersion
    exit
else
    defaults read "${1}" CFBundleInfoDictionaryVersion
fi