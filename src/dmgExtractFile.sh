#!/bin/sh

if hdiutil attach -noverify -mountpoint "${2}" "${1}"; then

    while [ ! -d "${2}" ]
    do
        sleep 1
    done
fi

fileName="$(find -E "${2}" -regex ".*/${4}$")"

cp -a "${fileName}" "${3}"

hdiutil detach "${2}" -force