#!/usr/bin/env bash

# initial sync
sudo rsync -rtvu --progress /vagrant/app/ /home/vagrant/app/

EVENTS="CREATE,CLOSE_WRITE,DELETE,MODIFY,MOVED_FROM,MOVED_TO"

inotifywait -mrq -e $EVENTS --format '%w' /vagrant/app/ | while read MODFILE
do
  echo need to rsync '$MODFILE' ...
  $TARGET_FILE = /home$MODFILE
  sudo rsync -av $MODFILE $TARGET_FILE
done
