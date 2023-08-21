#!/bin/bash
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ -z "${DEV_ENV}" ]; then
  echo "ERROR: Please set DEV_ENV: export DEV_ENV=qa"
  exit 1
fi

printf "${RED}Current DEV_ENV=$DEV_ENV${NC}\n" 