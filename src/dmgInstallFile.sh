#!/bin/sh

dmgPath=$1
mntPath=$2
shift
shift

if yes | hdiutil attach -noverify -nobrowse -mountpoint "${mntPath}" "${dmgPath}" > /dev/null; then

    while [ ! -d "${mntPath}" ]
    do
        sleep 1
    done
fi

eval "$@"

hdiutil detach "${mntPath}" -force