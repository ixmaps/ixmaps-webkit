./build-dest.sh
node nwbuild.js &&
sed -i 's/udev\.so\.0/udev.so.1/g'  build/ixmaps-node-server/linux64/ixmaps-node-server

