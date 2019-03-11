const fs = require('fs');

const deleteFile = filepath => {
  fs.unlink(filepath, err => {
    console.log(err);
  });
};

exports.deleteFile = deleteFile;
