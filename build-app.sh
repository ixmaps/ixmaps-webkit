./build-dest.sh
node nwbuild.js &&
# fix for ubuntu libs
sed -i 's/udev\.so\.0/udev.so.1/g'  build/ixmaps-webkit/linux64/ixmaps-webkit

