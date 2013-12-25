#!/usr/bin/env bash

# prefferable way to install nodejs, but it does not work now
# apt-packages-ppa 'chris-lea/node.js'
# apt-packages-update
# apt-packages-install nodejs npm

cd /usr/local
wget http://nodejs.org/dist/v0.10.24/node-v0.10.24-linux-x86.tar.gz
sudo tar -xvzf node-v0.10.24-linux-x86.tar.gz --strip=1
rm -f node-v0.10.24-linux-x86.tar.gz

# set node path
echo 'if [ -d "/usr/lib/node_modules" ]; then NODE_PATH="/usr/lib/node_modules"; fi' >> ~/.profile

# install mocha test framework
npm install -g mocha

# install assertion libraries
npm install -g expect.js
npm install -g should
npm install -g chai

# task tools
npm install -g grunt

# node js coverage
if [ -x /usr/local/bin/jscoverage ]
then
  echo 'We have the jscoverage executable already.'
else
  cd /usr/local/src
  git clone https://github.com/visionmedia/node-jscoverage.git
  cd node-jscoverage
  ./configure && make && make install
  echo 'node-jscoverage installed from git source '
fi

# RequireJS / r.js
npm install -g requirejs
