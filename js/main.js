document.addEventListener("DOMContentLoaded", function() {
  function onfilechange(evt) {
    var selFile = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsArrayBuffer(selFile);
    reader.onloadend = function (e) {
        if (e.total !== 65536) {console.log('Filesize not correct', e.total); return 1;}

        // Load the file into an array of 16 blocks (indicies)
        var loadedFile = new Int8Array(e.target.result);
        var file = [];
        for (var i=0; i<16; i++) {
          var tmp = new Int8Array(loadedFile.slice( i*4096, (i+1)*4096 ))
          file.push(tmp);
        }
        var loadedFile = undefined; //unload loadedFile gracefully

        // Check for block type
        for (var i=0; i<16; i++) {
          console.log(file[i][4084])
        }


    };
  }
  document.getElementById('file').addEventListener('change', onfilechange);
})