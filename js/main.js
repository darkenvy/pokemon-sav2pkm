// Wait for Dom to be ready before listening for file loadings.
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('file').addEventListener('change', function(evt) {
    var selFile = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsArrayBuffer(selFile);

    // Callback because file reading is async
    reader.onloadend = function (e) {
      if (e.total !== 65536 && e.total !== 131072) {console.log('Filesize not correct', e.total); return 1;}
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
  var saveSlotA = new SaveSlot(arrayBuffer, 0);
  var saveSlotB = new SaveSlot(arrayBuffer, 1);

  console.log(saveSlotA);
  console.log(saveSlotB);

  // Will need to compare SlotA & B to see which is newer


}

// ----------------------------------------------------------------- //


// SaveSlot Object. up to 2 saveslots per game save.
function SaveSlot(arrayBuffer, slotInt) {
  this.sections = [];
  this.pcBuffer;

  // Prevents error if save is only one SaveSlot big
  if (slotInt === 1 && arrayBuffer.byteLength === 65536) return;
  
  // Generate Section objects and append to SaveSlot
  var arrayBufferTyped = new Uint8Array(arrayBuffer)
  for (var i=0+(slotInt*16); i<16+(slotInt*16); i++) { // 0-16 or 16-32
    var sectionSlice = arrayBufferTyped.slice(i*4096, (i+1)*4096)
    this.sections.push( new Section(sectionSlice) )
  }

}
SaveSlot.prototype = {
  constructor: SaveSlot
};



// There are 16 sections per SaveSlot. All 16 belong to respective SaveSlot instance
function Section(slice) {
  this.data = slice;
  this.id = this.data[4096-12]; // Technically 2Bytes But second Byte never used
  this.checksum = this.data.slice(4096-10, 4096-8);
  this.validationCode = this.data.slice(4096-8, 4096-4); // Always 37,32,1,8
  this.saveIndex = this.data.slice(4096-4, 4096);
}
Section.prototype = new SaveSlot();
Section.prototype.constructor = Section;



// One PCBuffer per SaveSlot. A PCBuffer contains all in-game PC boxes
function PCBuffer = {

}
Section.prototype = new SaveSlot();
Section.prototype.constructor = PCBuffer;

// 14 in-game PC boxes. All Boxs belong to PCBuffer.
// function Box() {

// }
// Box.prototype = {
//   constructor: Box
// }
