#!/bin/sh
#
# Use this script to run your program LOCALLY.
#
# Note: Changing this script WILL NOT affect how CodeCrafters runs your program.
#
# Learn more: https://codecrafters.io/program-interface

# set -e # Exit early if any commands fail

# Lint before executing to prevent bad code.
OUTPUT=$(FORCE_COLOR=1 npm run lint 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "$OUTPUT"
  exit $EXIT_CODE
fi

# Copied from .codecrafters/run.sh
#
# - Edit this to change how your program runs locally
# - Edit .codecrafters/run.sh to change how your program runs remotely
exec node build/main.js "$@"
