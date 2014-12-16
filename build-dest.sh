rm ixmaps.nw
rm -rf dest
mkdir dest

SRCDIR=node_modules

if [ -e ../ixmaps-node-server ] && [ -e ../ixmaps-chrome-extension ]; then
  echo "building from local version"
  SRCDIR=..
fi

rsync -a $SRCDIR/ixmaps-node-server/* dest
rsync -a $SRCDIR/ixmaps-chrome-extension/src/*js dest
rsync -a src/* dest

