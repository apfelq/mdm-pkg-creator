#!/bin/zsh

if pkgutil --check-signature "${1}" > /dev/null; then
    echo "signed"
else
    echo "not-signed"
fi

exit 0