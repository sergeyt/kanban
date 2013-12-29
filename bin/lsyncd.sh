#!/usr/bin/env bash

apt-packages-install rsync lsyncd
sudo mkdir /home/vagrant/.lsyncd
sudo cp /vagrant/etc/lsyncd.config /home/vagrant/.lsyncd/lsyncd.config


