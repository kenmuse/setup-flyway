#!/bin/bash

if [ -z "$1" ]; then
  echo "::error::Must supply version argument"
  exit 1
fi

if [ -z "$2" ]; then
  echo "::error::Must supply path argument"
  exit 1
fi

EXPECTED_VERSION=$1
EXPECTED_PATH=$(echo $2 | sed -e 's/\\/\//g' -e 's/^\([A-Z]\):/\/\L\1/')

RAW_VERSION=$(flyway --version 2>&1)
ACTUAL_VERSION=$(echo "${RAW_VERSION}" | grep -E "Flyway [A-Za-z]+ Edition ")
echo "Found: ${ACTUAL_VERSION}"
GREP_VERSION=$(echo $ACTUAL_VERSION | grep -E "Flyway [A-Za-z]+ Edition ${EXPECTED_VERSION} ")
if [ -z "$GREP_VERSION" ]; then
  echo "::error::Unexpected version (${RAW_VERSION})"
  echo "Expected: ${EXPECTED_VERSION}"
  exit 1
fi

ACTUAL_PATH=$(dirname `which flyway`)
echo "Actual path: ${ACTUAL_PATH}"
if [ "${EXPECTED_PATH}" != "${ACTUAL_PATH}" ]; then
  echo "::error::Unexpected path."
  echo "Expected: ${EXPECTED_PATH}"
  exit 1
fi

#flyway --version | sed -n "s/Flyway \(Community\|Enterprise\) Edition \([[:digit:].]\+\) by Redgate/\2/p"

#flyway --version | grep  "Flyway \(Community\|Enterprise\) Edition \([[:digit:].]\+\)"