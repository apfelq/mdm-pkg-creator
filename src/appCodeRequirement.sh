#!/bin/sh

codesign -d -r - "${1}" | sed -E 's/^.* => (.*)$/\1/'