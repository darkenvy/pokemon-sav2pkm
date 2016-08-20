// Wait for Dom to be ready before listening for file loadings.
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('file').addEventListener('change', poketool.onfilechange);
});

// Primary Namespace
var poketool = {
  onfilechange: function(evt) {
    var selFile = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsArrayBuffer(selFile);
    // Callback because file reading is async
    reader.onloadend = function (e) {
      if (e.total !== 65536) {console.log('Filesize not correct', e.total); return 1;}
      // declare temp function for cleanliness
      var get16Chunks = function() {
        var file = [];
        var loadedFile = new Int8Array(e.target.result);
        for (var i=0; i<16; i++) {
          var tmp = new Int8Array(loadedFile.slice( i*4096, (i+1)*4096 ))
          file.push(tmp);
        }
        return file;
      }
      var file = get16Chunks();
      main(file); // Start main now that a file is loaded
    };
  },
  printBox1: function(file) {
    if (file[1][4084] === 5 ) console.log('yes it is');
  }
}

// ---------------------------------- //
//               Main                 //
// ---------------------------------- //
// main only starts after a file is loaded
// parameter 'file' is the savedata that is split into 16 chunks
function main(file) {
  poketool.printBox1(file);
}






// Check for block type
// for (var i=0; i<16; i++) {
//   console.log(file[i][4084])
// }