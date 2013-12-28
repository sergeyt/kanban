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
  ncurses-dev  

<%= import 'bin/node.sh' %>
<%= import 'bin/mongo.sh' %>
<%= import 'bin/meteor.sh' %>
<%= import 'bin/lsyncd.sh' %>

echo 'if [ -d "/vagrant/bin" ]; then PATH=$PATH":/vagrant/bin"; fi' >> ~/.profile

# fix meteor-npm package
cd /home/vagrant/app/packages/npm
npm install

# run sync daemon todo try to use start-stop-daemon
# cd /vagrant/bin
# nohup bash ./sync-app.sh &

cp /vagrant/etc/lsyncd.config ~/.lsyncd/lsyncd.config
# todo run lsyncd
