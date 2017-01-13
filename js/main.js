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
  this.sections = {};

  // Prevents error if save is only one SaveSlot big
  if (slotInt === 1 && arrayBuffer.byteLength === 65536) return;
  
  // Generate Section objects and append to SaveSlot
  var arrayBufferTyped = new Uint8Array(arrayBuffer);
  for (var i=0+(slotInt*16); i<16+(slotInt*16); i++) { // 0-16 or 16-32
    var sectionSlice = new Section( arrayBufferTyped.slice(i*4096,(i+1)*4096) )
    // Add to sections if key doesnt exist.
    // If key does exist, this is because saveslotA can have 2 sections from
    // saveslotB. See furlocks-forest.net/wiki/?page=Pokemon_GBA_Save_Format
    if (!this.sections.hasOwnProperty(sectionSlice.id) || 
        this.sumTypedArray(sectionSlice.saveIndex) > 
        this.sumTypedArray(this.sections[sectionSlice.id].saveIndex)
        ) { this.sections[sectionSlice.id] = sectionSlice }
  }
  
  // dont pass full 4096 into it. only the coresponding size
  // only run if initialized with data
  if (arrayBuffer) { 
    this.pcBuffer = this.mergeTyped(
        this.sections['5'].data.slice(0, 3968),
        this.sections['6'].data.slice(0, 3968),
        this.sections['7'].data.slice(0, 3968),
        this.sections['8'].data.slice(0, 3968),
        this.sections['9'].data.slice(0, 3968),
        this.sections['10'].data.slice(0, 3968),
        this.sections['11'].data.slice(0, 3968),
        this.sections['12'].data.slice(0, 3968),
        this.sections['13'].data.slice(0, 2000)
      );
  }

  // find 5-13


}
SaveSlot.prototype = {
  constructor: SaveSlot,
  mergeTyped: function() {
    var results = []
    for (var i=0; i< arguments.length; i++) {
      var each = Array.prototype.slice.call(arguments[i]);
      results = Array.prototype.concat.apply(results, each);
    }
    return new Uint8Array(results);
  },
  sumTypedArray: function(typedArr) {
    var arr = Array.prototype.slice.call(typedArr);
    return arr.reduce(function(a,b) {return a+b});
  }
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
function PCBuffer(pcBufferSections) {
  this.data = pcBufferSections;
}
Section.prototype = new SaveSlot();
Section.prototype.constructor = PCBuffer;

// 14 in-game PC boxes. All Boxs belong to PCBuffer.
// function Box() {

// }
// Box.prototype = {
//   constructor: Box
// }
