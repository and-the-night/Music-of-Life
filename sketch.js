const sampler = new Tone.Sampler({
  "C1": "Notes/C1.wav",
  "C#1": "Notes/C#1.wav",
  "D1": "Notes/D1.wav",
  "D#1": "Notes/D#1.wav",
  "E1": "Notes/E1.wav",
  "F1": "Notes/F1.wav",
  "F#1": "Notes/F#1.wav",
  "G1": "Notes/G1.wav",
  "G#1": "Notes/G#1.wav",
  "A1": "Notes/A1.wav",
  "A#1": "Notes/A#1.wav",
  "B1": "Notes/B1.wav",
  "C2": "Notes/C2.wav",
  "C#2": "Notes/C#2.wav",
  "D2": "Notes/D2.wav",
  "D#2": "Notes/D#2.wav",
  "E2": "Notes/E2.wav",
  "F2": "Notes/F2.wav",
  "F#2": "Notes/F#2.wav",
  "G2": "Notes/G2.wav",
  "G#2": "Notes/G#2.wav",
  "A2": "Notes/A2.wav",
  "A#2": "Notes/A#2.wav",
  "B2": "Notes/B2.wav",
  "C3": "Notes/C3.wav",
  "C#3": "Notes/C#3.wav",
  "D3": "Notes/D3.wav",
  "D#3": "Notes/D#3.wav",
  "E3": "Notes/E3.wav",
  "F3": "Notes/F3.wav",
  "F#3": "Notes/F#3.wav",
  "G3": "Notes/G3.wav",
  "G#3": "Notes/G#3.wav",
  "A3": "Notes/A3.wav",
  "A#3": "Notes/A#3.wav",
  "B3": "Notes/B3.wav",
  "C4": "Notes/C4.wav",
  "C#4": "Notes/C#4.wav",
  "D4": "Notes/D4.wav",
  "D#4": "Notes/D#4.wav",
  "E4": "Notes/E4.wav",
  "F4": "Notes/F4.wav",
  "F#4": "Notes/F#4.wav",
  "G4": "Notes/G4.wav",
  "G#4": "Notes/G#4.wav",
  "A4": "Notes/A4.wav",
  "A#4": "Notes/A#4.wav",
  "B4": "Notes/B4.wav"
}, () => {
  console.log("Sampler Loaded");
});

sampler.envelope = {
  attack: 0.2,
  decay: 0,
  sustain: 1,
  release: 0.1
}
sampler.toDestination();
sampler.volume.value = -6;

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      let num = i * rightInterval + j * downInterval;
      arr[i][j] = {
        isOn: 0,
        note: convertToNote(num),
        hue: convertToHue(num)
      }
    }
  }
  return arr;
}

let state = "setup";
let grid;
let cols;
let rows;
let resolution = 40;
let downInterval = 7;
let rightInterval = 5;

let notesLibrary = [
  'C', 
  'C#', 
  'D', 
  'D#', 
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B'
]

function setup() {
  createCanvas(480, 480);
  frameRate(1);
  colorMode(HSB);
  cols = width / resolution;
  rows = height / resolution;
  textAlign(CENTER);
  textSize(15);

  grid = make2DArray(cols, rows);
  
  const playBtn = createButton('Play');
  playBtn.mousePressed(() => {
    state = 'play';
        console.log("play1");
  });
  
  const resetBtn = createButton('Reset');
  resetBtn.mousePressed(() => {
    state = 'setup';
    grid = make2DArray(cols, rows);
  });

}

function draw() {
  background(255);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * resolution;
      let y = j * resolution;
      strokeWeight(1);
      stroke(40);
      
      let cell = grid[i][j];
      
      if (grid[i][j].isOn == 1) {
        fill(cell.hue, 100, 100);
        sampler.triggerAttack(cell.note);

        setTimeout(() => {
          sampler.triggerRelease()
        }, 200);
        // WebMidi.outputs[0].channels[1].playNote(cell.note);
      } else {
        fill(0);
      }
      
      rect(x, y, resolution - 1, resolution - 1);
      
      noStroke();
      fill(255);
      text(grid[i][j].note, x + resolution/2 + 1, y + resolution/2 + 4);
    }
  }
  
  if(state == 'play') {
    console.log("play2");
    let next = make2DArray(cols, rows);

    // Compute next based on grid
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let state = grid[i][j].isOn;
        // Count live neighbors!
        let sum = 0;
        let neighbors = countNeighbors(grid, i, j);

        if (state == 0 && neighbors == 3) {
          next[i][j].isOn = 1;
        } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
          next[i][j].isOn = 0;
        } else {
          next[i][j].isOn = state;
        }
      }
    }

    grid = next;

  }
}


function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += grid[col][row].isOn;
    }
  }
  sum -= grid[x][y].isOn;
  return sum;
}

function mousePressed() {
  if(
    state == 'setup' &&
    mouseX > 0 && mouseX < width &&
    mouseY > 0 && mouseY < height
  ) {
    let i = Math.floor(mouseX / resolution);
    let j = Math.floor(mouseY / resolution);
    
    let cell = grid[i][j];
    
    if(cell.isOn == 0) {
      cell.isOn = 1;
    } else {
      cell.isOn = 0;
    }
  }
}

function convertToNote(num) {
  let oct = Math.floor(num / 12) % 4 +2;
  let noteNum = num % 12;
  
  // if (oct > 7) oct -= 7;
  
  
  return notesLibrary[noteNum] + oct;
}

function convertToHue(num) {
  return (num % 12) * 30;
}