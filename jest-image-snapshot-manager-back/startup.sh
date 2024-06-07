#!/bin/sh
# Path - deploy/startup.sh

cd /app
node bin/console.js migration:run --force
nginx;
node bin/server.js