// Wait for Dom to be ready before listening for file loadings.
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('file').addEventListener('change', poketool.bin.onfilechange);
});

// Primary Namespace
var poketool = {
  bin: {
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
     // returns a string, deliminated
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
    }
  },

  box: {
    extractF5Chunks: function(file) {
      // returns chunks 0-4 in order. This is the rest of the save file
      // NOTE: this is repeated code as with extractPCBoxes(). Can reduce
      var chunks = [];
      // Check for block type
      for (var i=0; i<5; i++) {
        // chunks in the save can be out of order. So we must order them. 0-4
        for (var j=0; j<14; j++) {
          if (file[j][4084] === i) {
            // This is a fix. The empty array was creating an additional element
            if (chunks.length === 0) {
              chunks = file[i];
            } else {
              chunks = poketool.bin.mergeArrays(chunks + ',', file[i]);
            }
            break; // once we find it, no use to keep searching. Move on
          }
        }
      }
      return new Int8Array(chunks.split(','));
    },
    extractPCBoxes: function(file) {
      // Returns all boxes as one contiguous box
      var allBox = [];
      // Check for block type
      for (var i=5; i<14; i++) {
        // chunks in the save can be out of order. So we must order them. 5-13
        for (var j=0; j<14; j++) {
          if (file[j][4084] === i) {
            // If box is #13, then it's size is only 2000. Else 3969.
            var amt = file[j][4084] === 13 ? 2000 : 3969;
            allBox = poketool.bin.mergeArrays(allBox, file[j].slice(0, amt) );
            break;
          }
        }
      }
      return new Int8Array(allBox.split(','));
    },
    extractSingleBox: function(pcBoxes, boxNum) {
      // Block '8' (zero inclusive, so really 9) has a short data size
      var singleBox;
      if (boxNum === 8) {
        singleBox = pcBoxes.slice(3968*boxNum, 3968*(boxNum+1));
        singleBox = singleBox.slice(0,2000); // This is easier for now
      } else {
        singleBox = pcBoxes.slice(3968*boxNum, 3968*(boxNum+1));
      }
      return singleBox;

    },
    getBoxName: function(entirePCBox, boxNum) {
      var nameList = entirePCBox.slice(33604,33730); // All box names
      var boxName = nameList.slice(boxNum*9, (boxNum*9)+7); // one box name
      return poketool.bin.bin2Str(boxName);
    },
    compileIntoSav: function(first5Chunks, pcBoxes) {
      // http://furlocks-forest.net/wiki/?page=Pokemon_GBA_Save_Format
      // var sav = poketool.bin.mergeArrays(first5Chunks.join(), pcBoxes)
      // We assume pcBoxes is already in order thanks to previous methods

      var addAll32Bit = function(box) {
        // Doing the footer slice in here
        var newBox = box.slice(0, box.length-12);
        var reduced = newBox.reduce(function(a, b) {return a + b;}, 0);

        return reduced
      }
      var addUpperLower16 = function(all32) {
        console.log(all32);
        // var new16 = new Int16Array([all32])
        // var 
        // return new16[0] & 0xffff;
      }

      var box = poketool.box.extractSingleBox(pcBoxes, 0)
      console.log(box);
      var pcBox32 = new Int32Array(box.buffer);
      console.log(pcBox32.length);
      console.log(addAll32Bit(pcBox32));
      console.log(addUpperLower16(addAll32Bit(pcBox32)));


    }
  },

  pkm: {
    info: {
      name: function(pkm) {
        var binName = pkm.slice(8,18);
        return poketool.bin.bin2Str(binName);
      }
    },
    get: function(entirePCBox, slot) {
      // slot is 0-419. Box unspecific
      return entirePCBox.slice( (slot*80)+4, ((slot+1)*80)+4 )
    },
    set: function(entirePCBox, pkm, slot) {
      // Returns a new bank of 420 slots.
      // slot is a number 0-419. 
      // pkm is the pokemon 80b data

      // need to make a null responce (fill with 00 if null)
      var start = entirePCBox.slice(0, (slot*80)+4)
      var end = entirePCBox.slice( ((slot+1)*80)+4, 33744)

      var whole = ( start.join() + ',' +
                    pkm.join() + ',' + 
                    end.join())
      // console.log(tmp.length, tmp);
      return new Int8Array( whole.split(',') );
    }
  }

}

// ----------------------------------------------------------- //


function downloadBlob(int8Array) {
  var blob = new Blob([int8Array], { type: 'octet/stream'})
  var url = URL.createObjectURL(blob)
  document.getElementById('dl-link').href = url
  document.getElementById('dl-link').setAttribute('download', 'left.sav');
}

// ---------------------------------- //
//               Main                 //
// ---------------------------------- //
// main only starts after a file is loaded
// parameter 'file' is the savedata that is split into 16 chunks

var pcBox; // global scope for now. for debugging

function main(file) {
  pcBox = poketool.box.extractPCBoxes(file); // import save into obj
  chunks05 = poketool.box.extractF5Chunks(file);
  poketool.box.compileIntoSav(chunks05, pcBox);
  // console.log(chunks);
  // console.log(poketool.box.getBoxName(pcBox, 0)); // display box name x
  // console.log( poketool.pkm.setPkm(pcBox, [], null) ); // set pokemon into slot
  // var poke = poketool.pkm.getPkm(pcBox, 62) // ho-oh
  // downloadBlob(poke);

  

  
  
}



// for (var i=0; i<100; i++) {
//   var poke = poketool.pkm.getPkm(pcBox, i);
//   console.log(poketool.pkm.info.name(poke), i);
// }

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