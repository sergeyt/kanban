#!/usr/bin/env bash

sudo apt-get install rsync lsyncd
sudo mkdir /home/vagrant/.lsyncd
sudo cp /vagrant/etc/lsyncd.config /home/vagrant/.lsyncd/lsyncd.config


