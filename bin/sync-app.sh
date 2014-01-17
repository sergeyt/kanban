#!/usr/bin/env bash

# initial sync
sudo rsync -rtvu --progress /vagrant/app/ /home/vagrant/app/

EVENTS="CREATE,CLOSE_WRITE,DELETE,MODIFY,MOVED_FROM,MOVED_TO"

while true
  do inotifywait -mrq -e $EVENTS --format '%w' /vagrant/app/
  sudo rsync -rtvu --progress /vagrant/app/ /home/vagrant/app/
done
