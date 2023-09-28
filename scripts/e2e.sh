#!/bin/bash

test=$1

if [ -z $test ]; then
  echo "Please select a test"
  exit 0
fi

yarn playwright test ./e2e/$test.spec.ts
