#!/usr/bin/env bash

# {{{ Ubuntu utilities

<%= import 'bin/ubuntu.sh' %>

# }}}

# Use Google Public DNS for resolving domain names.
# The default is host-only DNS which may not be installed.
nameservers-local-purge
nameservers-append '8.8.8.8'
nameservers-append '8.8.4.4'

# Use a local Ubuntu mirror, results in faster downloads.
apt-mirror-pick 'ru'

# Update packages cache.
apt-packages-update

# Install VM packages.
apt-packages-install     \
  git-core               \
  imagemagick            \
  curl                   \
  chrpath                \
  inotify-tools          \
  build-essential        \
  openssl                \
  automake               \
  autoconf               \
  libtool                \
  pkg-config             \
  libreadline6           \
  libreadline6-dev       \
  zlib1g                 \
  zlib1g-dev             \
  libssl-dev             \
  libyaml-dev            \
  libsqlite3-dev         \
  sqlite3                \
  libxml2-dev            \
  libxslt-dev            \
  libc6-dev              \
  ncurses-dev            \
  bindfs

<%= import 'bin/node.sh' %>
<%= import 'bin/mongo.sh' %>
<%= import 'bin/meteor.sh' %>

# making bin scripts as executables
sudo chmod a+x /vagrant/bin/

# init app dir
sudo rsync -rtvu --progress /vagrant/app/ /home/vagrant/app/

# fix meteor-npm package
cd /home/vagrant/app/packages/npm
npm install

# todo start sync service
# echo starting sync service...
# sudo cp /vagrant/etc/init.d/sync-app.sh /etc/init.d/sync-app.sh
# sudo chmod a+x /etc/init.d/sync-app.sh
# sudo update-rc.d sync-app.sh defaults
# sudo service sync-app.sh start
