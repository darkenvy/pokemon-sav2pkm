// Wait for Dom to be ready before listening for file loadings.
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('file').addEventListener('change', function(evt) {
    var selFile = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsArrayBuffer(selFile);

    // Callback because file reading is async
    reader.onloadend = function (e) {
      if (e.total !== 65536) {console.log('Filesize not correct', e.total); return 1;}
      else {
        // console.log('loaded: ', e.target.result)
        fileLoaded(e.target.result);
      }
      // declare temp function for cleanliness
      // var get16Chunks = function() {
      //   var file = [];
      //   var loadedFile = new Int8Array(e.target.result);
      //   for (var i=0; i<16; i++) {
      //     var tmp = new Int8Array(loadedFile.slice( i*4096, (i+1)*4096 ))
      //     file.push(tmp);
      //   }
      //   return file;
      // }
      // var file = get16Chunks();
      // main(file); // Start main now that a file is loaded
    };
  });
});

function fileLoaded(arrayBuffer) {
  // console.log(new Uint8Array(arrayBuffer));
  var saveslot = new SaveSlot(arrayBuffer);
  console.log(saveslot);
}

// ----------------------------------------------------------------- //

function SaveSlot(arrayBuffer) {
  this.sections = [];

  var arrayBufferTyped = new Uint8Array(arrayBuffer)
  for (var i=0; i<16; i++) {
    // this.sections.push( arrayBufferTyped.slice(i*4096, (i+1)*4096) )
    var sectionSlice = arrayBufferTyped.slice(i*4096, (i+1)*4096)
    this.sections.push( new Section(sectionSlice) )
  }

}
SaveSlot.prototype = {
  constructor: SaveSlot
}




function Section(slice) {
  this.data = slice
}
Section.prototype = new SaveSlot()
Section.prototype.constructor = Section




// function Box() {

// }
// Box.prototype = {
//   constructor: Box
// }
