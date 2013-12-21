#!/bin/bash
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" | sudo tee -a /etc/apt/sources.list.d/10gen.list
sudo apt-get update

# install mongodb
sudo apt-get install -y git mongodb-10gen curl

# install nodejs from tarball
# cd /usr/local
# wget http://nodejs.org/dist/v0.8.23/node-v0.8.23-linux-x86.tar.gz
# sudo tar -xvzf node-v0.8.23-linux-x86.tar.gz --strip=1
# rm -f node-v0.8.23-linux-x86.tar.gz

# install nodejs using apt-get
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs

# install npm packages
sudo npm install -g grunt-cli
sudo npm install -g karma
sudo npm install -g mocha
sudo npm install -g bower

# install meteor and meteorite
curl https://install.meteor.com | sudo sh
sudo npm install -g meteorite