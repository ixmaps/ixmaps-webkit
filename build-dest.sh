rm ixmaps.nw
rm -rf dest
mkdir dest

cp -a node_modules/ixmaps-node-server/* dest
cp -a node_modules/ixmaps-chrome-extension/src/*js dest
cp -a src/* dest
cd dest

zip -pr ../ixmaps.nw *
cd ..

