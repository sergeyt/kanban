#!/usr/bin/env bash

sudo apt-get install rsync libxml2-dev lua5.1 liblua5.1-dev

cd /usr/local
wget https://lsyncd.googlecode.com/files/lsyncd-2.1.5.tar.gz
sudo tar xvf lsyncd-2.1.5.tar.gz
cd lsyncd-2.1.5
./confugure
make
sudo checkinstall

rm -f lsyncd-2.1.5.tar.gz
