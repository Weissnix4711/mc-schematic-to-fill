function parseSchematic(file) {
  console.log(file.files[0]);

  file.files[0].arrayBuffer().then(buffer => {
    nbt.parse(buffer, (error, data) => {
      if (error) { throw error; }
      console.log(data.value);
      document.getElementById('parsedblock').innerHTML = JSON.stringify(data, null, 2);
      fillCommands = blockArrayToFillCommands(data.value);
      document.getElementById('fillcommandsblock').innerHTML = fillCommands;
    });
  });
};

// calculate coords of a block from its index
function calculateCoords(index, length, width, height) {
  console.log(`i: ${index} l: ${length} w: ${width} h: ${height}`)
  blocksPerY = length * width;
  console.log(blocksPerY)
  coordY = Math.floor(index / blocksPerY);
  coordZ = Math.floor((index - (coordY * blocksPerY)) / width);
  coordX = Math.floor(((index - (coordY * blocksPerY)) - (coordZ * width)));
  coords = [coordX, coordY, coordZ];
  console.log(coords);
  return coords;
}

// get item name from its id
function getNameFromID(id) {
  return ids.find(
    element => { return element.type == id; }
  ).text_type;
}

// takes array of block ids and converts it to a series of fill commands
function blockArrayToFillCommands(data) {
  const length = data.Length.value; // maximum z val
  const width = data.Width.value; // maximum x val
  const height = data.Height.value; // maximum y val
  let fillCommands = [];
  let lastBlockIndex = 0;
  let lastBlockId = data.Blocks.value[0];

  for (var i = 0; i < data.Blocks.value.length; i++) {
    thisBlockId = data.Blocks.value[i];
    indexDifference = i - lastBlockIndex;
    console.log(indexDifference)

    // has to be done in case end of length is reached and must wrap arround
    if ((thisBlockId !== lastBlockId) || (indexDifference + calculateCoords(lastBlockIndex, length, width, height)[0] >= width)) { // w + 1
      // coords of first block of same-block section
      let fromCoords = '~' + calculateCoords(lastBlockIndex, length, width, height).join(' ~');
      // coords of current block (first block which is different)
      let toCoords = calculateCoords(i - 1, length, width, height);
      toCoords = '~' + toCoords.join(' ~');

      console.log(`iteration: ${i} diff: ${indexDifference} fromCoords: ${fromCoords} toCoords: ${toCoords} lastBlockId: ${lastBlockId & 0xff} thisid: ${thisBlockId}`)
      // add command to array
      fillCommands.push(`fill ${fromCoords} ${toCoords} ${getNameFromID(lastBlockId & 0xff)}`);

      // reset lastblock
      lastBlockIndex = i;
      lastBlockId = thisBlockId;
    }
  }
  return fillCommands.join('\n');
};