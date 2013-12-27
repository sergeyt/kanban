#!/usr/bin/env bash

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
