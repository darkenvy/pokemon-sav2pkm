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
  mergeArrays: function(arr1, arr2) {
   return arr1 + arr2.join();
  },
  bin2Str: function(len7Str) {
    // Convert binary to string

    // should change len7Str now that this is a more universal function
    // Requires the input to be only 7 chars in length
    // However, this function will return the whoel boxname
    var output = '';
    len7Str.forEach(function(letter) {
      if (letter > -96 && letter < -85) letter = letter + 143;
      else letter = letter + 134;
      output += String.fromCharCode(letter);
    })
    return output;
  },
  compilePCBox: function(file) {
    var allBox = [];
    // Check for block type
    for (var i=0; i<10; i++) {
      if (file[i][4084] >= 5) {
        // If box is #13, then it's size is only 2000. Else 3969.
        var amt = file[i][4084] === 13 ? 2000 : 3969;
        allBox = poketool.mergeArrays(allBox, file[i].slice(0, amt) );
      }
    }
    return new Int8Array(allBox.split(','));
  },
  getBoxName: function(entirePCBox, boxNum) {
    var nameList = entirePCBox.slice(33604,33730); // All box names
    var boxName = nameList.slice(boxNum*9, (boxNum*9)+7); // one box name
    return this.bin2Str(boxName);
  },
  
  setPkm: function(pkm, slot) {
    // Returns a new bank of 420 slots.
    // slot is a number 0-420. 
    // pkm is the pokemon 80b data

  }
}

// ---------------------------------- //
//               Main                 //
// ---------------------------------- //
// main only starts after a file is loaded
// parameter 'file' is the savedata that is split into 16 chunks
var pcBox;
var boxNames;
function main(file) {
  // global scope for now. for debugging
  pcBox = poketool.compilePCBox(file);
  console.log(poketool.getBoxName(pcBox, 1));
  // boxNames = pcBox.slice(33604,33730);
  
  // Display all box names
  // for (var i=0; i<8; i++) {
  //   var section = boxNames.slice(i*9,(i*9)+7)
  //   console.log(poketool.bin2Str(section));
  // }

  // Display all pokemon
  // var allBoxes = pcBox.slice(4,33604);
  // for (var i=0; i<420; i++) {
  //   var pkm = allBoxes.slice(i*80,(i*80)+80);
  //   var pkmName = pkm.slice(8,18);
  //   console.log( poketool.bin2Str(pkmName) )
  // }


}






