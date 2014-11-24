rm ixmaps.nw
rm -rf dest
mkdir dest

SRCDIR=node_modules

if [ -d ../ixmaps-node-server ] && [ -d ../ixmaps-chrome-extension ]; then
  echo "building from local version"
  SRCDIR=..
fi

cp -a $SRCDIR/ixmaps-node-server/* dest
cp -a $SRCDIR/ixmaps-chrome-extension/src/*js dest
cp -a src/* dest

