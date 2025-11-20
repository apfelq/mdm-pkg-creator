#!/bin/sh

if yes | hdiutil attach -noverify -nobrowse -mountpoint "${2}" "${1}" > /dev/null; then

    while [ ! -d "${2}" ]
    do
        sleep 1
    done
fi

find -E "${2}" -regex ".*/${4}$" -exec cp -a {} "${3}" \;

hdiutil detach "${2}" -force

if [ -e "${3}" ]; then
    echo "extracted"
    exit 0
else
    echo "failure" >&2
    exit 1
fi