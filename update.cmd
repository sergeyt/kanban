git submodule update --init
git submodule foreach git pull origin master

cd app\packages\async
git submodule update --init
cd ..\..\..

cd app\packages\moment
git submodule update --init
cd ..\..\..

cd app\packages\typeahead
git submodule update --init
cd ..\..\..
