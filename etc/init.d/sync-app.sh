#! /bin/sh

case "$1" in
start|"")
rm -f /tmp/sync-app.log
/vagrant/bin/sync-app.sh /home/sharez/ > /tmp/sync-app.log 2>&1 &
;;
restart|reload|force-reload)
echo "Error: argument '$1' not supported" >&2
exit 3
;;
stop)
# todo
;;
*)
echo "Usage: sync-app.sh [start|stop]" >&2
exit 3
;;
esac
:
