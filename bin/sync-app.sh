#!/usr/bin/env bash

# fix problem with mongo locks
sudo rsync -rtvu --delete --progress /vagrant/app/ /home/vagrant/app/

inotifywait -r -m -e close_write --format '%w%f' /vagrant/app/ | while read MODFILE
do
    echo need to rsync $MODFILE ...
    $TARGET_FILE = /home$MODFILE
    sudo rsync -av $MODFILE $TARGET_FILE
done
