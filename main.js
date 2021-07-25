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

function calculateCoords(index, length, width, height) {
  console.log(`i: ${index} l: ${length} w: ${width} h: ${height}`)
  blocksPerY = length * width;
  coordY = Math.floor(index / blocksPerY);
  coordZ = Math.floor((index - (coordY * blocksPerY)) / length);
  coordX = Math.floor(((index - (coordY * blocksPerY)) - (coordZ * length)));
  coords = [coordX, coordY, coordZ];
  console.log(coords);
  return coords;
}

function getNameFromID(id) {
  return ids.find(
    element => { return element.type == id; }
  ).text_type;
}

function blockArrayToFillCommands(data) {
  const length = data.Length.value;
  const width = data.Width.value;
  const height = data.Height.value;
  let fillCommands = [];
  let lastBlockIndex = 0;
  let lastBlockId = data.Blocks.value[0];

  for (var i = 0; i < data.Blocks.value.length; i++) {
    thisBlockId = data.Blocks.value[i];
    indexDifference = i - lastBlockIndex;
    if ((thisBlockId !== lastBlockId) || (indexDifference + (Math.floor(i / width)) >= width)) {
      let fromCoords = '~' + calculateCoords(lastBlockIndex, length, width, height).join(' ~');
      //let toCoords = [];
      let toCoords = calculateCoords(i, length, width, height);
      toCoords[2] -= 1;
      toCoords = '~' + toCoords.join(' ~');
      //toNoOfBlocks = i - lastBlockIndex;
      //toCoords[0] = Math.floor(toNoOfBlocks / width) * width; // x

      console.log(`iteration: ${i} diff: ${indexDifference} fromCoords: ${fromCoords} toCoords: ${toCoords} lastBlockId: ${lastBlockId & 0xff} thisid: ${thisBlockId}`)
      fillCommands.push(`fill ${fromCoords} ${toCoords} ${getNameFromID(lastBlockId & 0xff)}`);

      lastBlockIndex = i;
      lastBlockId = thisBlockId;
    }
  }
  return fillCommands.join('\n');
};