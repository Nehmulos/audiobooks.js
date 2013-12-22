#!/bin/bash
pkill node
git pull origin master
nohup node main.js &
