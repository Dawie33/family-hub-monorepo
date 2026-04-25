#!/bin/bash
DOMAIN="training-camp"
TOKEN="$(grep DUCKDNS_TOKEN /home/$(whoami)/training-camp/.env.production | cut -d= -f2)"
RESULT=$(curl -s "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip=")
echo "$(date) - $RESULT" >> /var/log/duckdns.log
