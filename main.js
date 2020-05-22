// bubbles that will be drawn every frame
let bubbles = []

// slingshot graphics
let holdShape = null
let holdLine = null
let holding = false

// bubble re-drag
let dragMode = false
let draggingBubble = null

// distance in pixels before a line is drawn between bubbles
let threshold = 200

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
resizeCanvas()

window.addEventListener('resize', resizeCanvas)

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

// set up audio
let playing = false
let started = false
let audioCtx = null // initialized on first mousedown

// starting parameters
let type = 'sine'
let rootPitch = 40
let pitch = 40
let rootPitchName = 'C4'
let pitchName = 'C4'
let rootFreq = 261.63
let frequency = 261.63

const keyCodeToPitchDelta = new Map([
  [49, 0],
  [50, 2],
  [51, 4],
  [52, 5],
  [53, 7],
  [54, 9],
  [55, 11],
  [56, 12]
])

const soundMatrix = new Map()

class Bubble {
  constructor(pos, vel, color, freq, type) {
    this.pos = pos
    this.vel = vel
    this.color = color
    this.r = 20

    this.freq = freq
    this.type = type
  }

  onUpdate() {
    this.pos[0] += this.vel[0]
    this.pos[1] += this.vel[1]

    this._checkCollision()
  }

  _checkCollision() {
    // right wall
    if (this.pos[0] + this.r >= canvas.width) {
      this.pos[0] = canvas.width - this.r
      this.vel[0] *= -1
    }
    // left wall
    if (this.pos[0] - this.r <= 0) {
      this.pos[0] = this.r
      this.vel[0] *= -1
    }
    // top wall
    if (this.pos[1] + this.r >= canvas.height) {
      this.pos[1] = canvas.height - this.r
      this.vel[1] *= -1
    }
    // bottom wall
    if (this.pos[1] - this.r <= 0) {
      this.pos[1] = this.r
      this.vel[1] *= -1
    }
  }

  render() {
    drawBubble(...this.pos, this.color, this.r)
  }
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return [x, y]
}

canvas.addEventListener('mousedown', function (e) {
  // start AudioContext if not done yet
  if (!started) {
    audioCtx = new AudioContext()
    started = true
  }

  const [x, y] = getCursorPosition(canvas, e)

  if (!dragMode) {
    const color = `rgb(
      ${Math.floor(Math.random() * 255)},
      ${Math.floor(Math.random() * 255)},
      ${Math.floor(Math.random() * 255)}
    )`
    holdShape = {x: x, y: y, color: color}
    holdLine = {start: [x, y], end: [x, y], color: color}
    holding = true
  } else {
    // check if mouse is over a bubble
    let bubble = getMousedOverBubble(x, y)
    if (bubble !== null) {
      bubble.vel = [0, 0] // freeze bubble if it was moving
      draggingBubble = bubble
    }
  }
})

canvas.addEventListener('mousemove', function (e) {
  // update position of the held shape
  const [x, y] = getCursorPosition(canvas, e)
  if (holding) {
    holdShape = Object.assign(holdShape, {x: x, y: y})
    holdLine = Object.assign(holdLine, {end: [x, y]})
  }
  if (draggingBubble !== null) {
    draggingBubble.pos = [x, y]
  }
})

canvas.addEventListener('mouseup', function (e) {
  const [x, y] = getCursorPosition(canvas, e)
  if (holding) {
    // calculate velocity
    let vx = Math.round(((holdLine.start[0] - x) / 60) * 100) / 100
    let vy = Math.round(((holdLine.start[1] - y) / 60) * 100) / 100

    let bubble = new Bubble([x, y], [vx, vy], holdShape.color, frequency, type)
    bubbles.push(bubble)
    holdShape = null
    holdLine = null
    holding = false
  }
  if (draggingBubble !== null) {
    draggingBubble.pos = [x, y]
    draggingBubble = null
  }
})

document.addEventListener('keydown', function (e) {
  // backspace -- clear screen
  if (e.keyCode === 8 && !holding) {
    bubbles = []
    soundMatrix.forEach(soundObject => {
      soundObject.soundNode.stop()
    })
    soundMatrix.clear()
  }

  // '1' thru '8' keys -- C4 thru C5
  if (49 <= e.keyCode && e.keyCode <= 56) {
    pitch = rootPitch + keyCodeToPitchDelta.get(e.keyCode);
    [pitchName, frequency] = pitchMap.get(pitch)
  }

  // 'q', 'w', 'e', 'r' -- sine, square, sawtooth, triangle
  if (e.keyCode === 81) type = 'sine'
  if (e.keyCode === 87) type = 'square'
  if (e.keyCode === 69) type = 'sawtooth'
  if (e.keyCode === 82) type = 'triangle'

  // spacebar -- hold for re-drag mode
  if (e.keyCode === 32) dragMode = true

  // left, right -- shift the root pitch by a semitone
  if (e.keyCode === 37 || e.keyCode === 39) {
    if (e.keyCode === 37) { // left
      if (rootPitch > 16) { // stop shifting root past C2
        rootPitch--;
        pitch--;
      }
    } else { // right
      if (rootPitch < 64) { // stop shifting root past C6
        rootPitch++;
        pitch++;
      }
    }
    [rootPitchName, rootFreq] = pitchMap.get(rootPitch);
    [pitchName, frequency] = pitchMap.get(pitch);
  }
})

document.addEventListener('keyup', function (e) {
  if (e.keyCode === 32) dragMode = false
})

// this function is run 60 times a second, right after the screen is cleared
function draw() {
  let lineCount = 0
  let activePairs = []
  // draw lines between bubbles that are close
  for (let i=0; i<bubbles.length; i++) {
    // j=i+1 here, so no pairs are repeated
    for (let j=i+1; j<bubbles.length; j++) {
      let distance = calcDistance(bubbles[i], bubbles[j])
      if (distance <= threshold) {
        const strength = 1 - (distance / threshold)
        ctx.globalAlpha = strength
        activePairs.push([i, j, strength])
        activePairs.push([j, i, strength])

        drawLine({
          start: bubbles[i].pos,
          end: bubbles[j].pos,
          color: (() => {
            // parse out 'rgb(a,b,c)' into [a, b, c]
            const rgb1 = bubbles[i].color.replace(/[^\d,]/g, '').split(',').map(Number)
            const rgb2 = bubbles[j].color.replace(/[^\d,]/g, '').split(',').map(Number)
            return `rgb(
              ${(rgb1[0] + rgb2[0]) / 2},
              ${(rgb1[1] + rgb2[1]) / 2},
              ${(rgb1[2] + rgb2[2]) / 2}
            )`
          })()
        })

        lineCount++
      } else {
        changeGain(i, j, 0)
        changeGain(j, i, 0)
      }
    }
  }

  for (item of activePairs) {
    let [i, j, strength] = item
    changeGain(i, j, strength / 25) // 25 is a sufficient damping factor that doesn't clip easily
  }

  // reset to full opacity
  ctx.globalAlpha = 1.0

  // draw all bubbles
  for (let bubble of bubbles) {
    bubble.onUpdate()
    bubble.render()
  }

  if (holding) {
    let { x, y, color } = holdShape
    drawBubble(x, y, color, 20)
    drawLine(holdLine)
  }
}

function drawBubble(x, y, color, radius) {
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2*Math.PI, true)
  ctx.fillStyle = color
  ctx.fill()
}

function drawLine(line) {
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(...line.start)
  ctx.lineTo(...line.end)
  ctx.strokeStyle = line.color
  ctx.stroke()
}

// change the gain of bubbles[i]'s note w.r.t. its distance from bubbles[j].
function changeGain(i, j, newGain) {
  const key = `${i} ${j}`
  if (!soundMatrix.has(key)) {
    let soundNode = new OscillatorNode(audioCtx, {
      type: bubbles[i].type,
      frequency: bubbles[i].freq
    })
    let gainNode = audioCtx.createGain()
    let pannerNode = new StereoPannerNode(audioCtx)
    gainNode.gain.value = 0
    soundNode.connect(gainNode)
    gainNode.connect(pannerNode)
    pannerNode.connect(audioCtx.destination)
    soundNode.start()

    soundMatrix.set(key, {
      soundNode: soundNode,
      gainNode: gainNode,
      pannerNode: pannerNode
    })
  }
  soundObject = soundMatrix.get(key)
  soundObject.gainNode.gain.linearRampToValueAtTime(newGain, audioCtx.currentTime + (1/60))

  // panning is from -1 to 1, so make a range from 0 to 2 and subtract 1
  const panValue = (bubbles[i].pos[0] / (canvas.width / 2)) - 1
  soundObject.pannerNode.pan.linearRampToValueAtTime(panValue, audioCtx.currentTime + (1/60))
}

// x, y -- current mouse position
function getMousedOverBubble(x, y) {
  let got = null
  for (let bubble of bubbles) {
    if (bubble.pos[0] - bubble.r <= x && x <= bubble.pos[0] + bubble.r &&
        bubble.pos[1] - bubble.r <= y && y <= bubble.pos[1] + bubble.r) {
      got = bubble
      break
    }
  }
  return got
}

// calculate the distance in pixels between two bubbles
const calcDistance = (b1, b2) => {
  return Math.pow(Math.pow(b2.pos[0] - b1.pos[0], 2) + Math.pow(b2.pos[1] - b1.pos[1], 2), 0.5)
}

let frame = 0
window.setInterval(() => {
  frame += 1
  document.getElementById('info').innerHTML = `
    wave type: ${type}<br>
    root pitch: ${rootPitchName}, root freq: ${rootFreq} Hz<br>
    pitch: ${pitchName}, frequency: ${frequency} Hz<br>
    re-drag mode: ${dragMode ? 'on' : 'off'}
  `

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  draw()
}, 1000/60)
