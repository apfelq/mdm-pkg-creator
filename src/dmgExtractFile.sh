#!/bin/sh

if yes | hdiutil attach -noverify -nobrowse -mountpoint "${2}" "${1}" > /dev/null; then

    while [ ! -d "${2}" ]
    do
        sleep 1
    done
fi

fileName="$(find -E "${2}" -regex ".*/${4}$")"

cp -a "${fileName}" "${3}"

hdiutil detach "${2}" -force