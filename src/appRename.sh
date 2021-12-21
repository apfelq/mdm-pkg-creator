#!/bin/sh

if [ "${1}" = "${2}" ]
then 
    exit 0
fi

mv "${1}" "${2}"