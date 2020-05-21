// bubbles that will be drawn every frame
let bubbles = []

let holdShape = null
let holdLine = null
let holding = false

// distance in pixels before a line is drawn between bubbles
let threshold = 200

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

// set up audio
let playing = false
const audioCtx = new AudioContext()
let frequency = 440

class Bubble {
  constructor(pos, vel, color, freq) {
    this.pos = pos
    this.vel = vel
    this.color = color
    this.r = 20

    this.sineNode = new OscillatorNode(audioCtx, {
      type: 'sine',
      frequency: freq
    })
    this.gainNode = audioCtx.createGain()
    this.sineNode.connect(this.gainNode)
    this.gainNode.connect(audioCtx.destination)
    this.gainNode.gain.value = 0
    this.sineNode.start()
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
  const [x, y] = getCursorPosition(canvas, e)
  const color = `rgb(
    ${Math.floor(Math.random() * 255)},
    ${Math.floor(Math.random() * 255)},
    ${Math.floor(Math.random() * 255)}
  )`
  holdShape = {x: x, y: y, color: color}
  holdLine = {start: [x, y], end: [x, y], color: color}
  holding = true
})

canvas.addEventListener('mousemove', function (e) {
  // update position of the held shape
  const [x, y] = getCursorPosition(canvas, e)
  if (holding) {
    holdShape = Object.assign(holdShape, {x: x, y: y})
    holdLine = Object.assign(holdLine, {end: [x, y]})
  }
})

canvas.addEventListener('mouseup', function (e) {
  const [x, y] = getCursorPosition(canvas, e)
  if (holding) {
    // calculate velocity
    let vx = Math.round(((holdLine.start[0] - x) / 60) * 100) / 100
    let vy = Math.round(((holdLine.start[1] - y) / 60) * 100) / 100

    let bubble = new Bubble([x, y], [vx, vy], holdShape.color, frequency)
    bubbles.push(bubble)
    holdShape = null
    holdLine = null
    holding = false
  }
})

document.addEventListener('keydown', function (e) {
  // backspace
  if (e.keyCode === 8 && !holding) {
    for (let bubble of bubbles) {
      bubble.sineNode.stop()
    }
    bubbles = [] // clear screen
  }
  // '1' and '2' keys -- A5, E5
  if (e.keyCode === 49) frequency = 440
  if (e.keyCode === 50) frequency = 659.255
})

// this function is run 60 times a second, right after the screen is cleared
function draw() {
  // draw lines between bubbles that are close
  for (let i=0; i<bubbles.length; i++) {
    // j=i+1 here, so no pairs are repeated
    for (let j=i+1; j<bubbles.length; j++) {
      let distance = calcDistance(bubbles[i], bubbles[j])
      if (distance <= threshold) {
        // draw line more transparent if bubbles are father away
        ctx.globalAlpha = 1 - (distance / 200)

        // increase volume if bubbles are closer together
        bubbles[i].gainNode.gain.value = (1 - (distance / 200))
        bubbles[j].gainNode.gain.value = (1 - (distance / 200))

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
      }
    }
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

// calculate the distance in pixels between two bubbles
const calcDistance = (b1, b2) => {
  return Math.pow(Math.pow(b2.pos[0] - b1.pos[0], 2) + Math.pow(b2.pos[1] - b1.pos[1], 2), 0.5)
}

let frame = 0
window.setInterval(() => {
	frame += 1
	document.getElementById('frame').innerHTML = `
		frame: ${frame}, seconds: ${Math.round((frame/60) * 100) / 100}<br>
    frequency: ${frequency}
	`

	ctx.clearRect(0, 0, canvas.width, canvas.height)
	draw()
}, 1000/60)
