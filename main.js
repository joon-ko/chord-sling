// bubbles that will be drawn every frame
let bubbles = []

let holdShape = null
let holdLine = null
let holding = false

// distance in pixels before a line is drawn between bubbles
let threshold = 200

class Bubble {
  constructor(pos, vel, color) {
    this.pos = pos
    this.vel = vel
    this.color = color
    this.r = 20
    this._checkCollision()
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

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

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

    let bubble = new Bubble([x, y], [vx, vy], holdShape.color)
    bubbles.push(bubble)
    holdShape = null
    holdLine = null
    holding = false
  }
})

document.addEventListener('keydown', function (e) {
  if (e.keyCode === 8 && !holding) {
    bubbles = [] // clear screen
  }
})

// this function is run 60 times a second, right after the screen is cleared
function draw() {
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
  ctx.moveTo(...holdLine.start)
  ctx.lineTo(...holdLine.end)
  ctx.strokeStyle = line.color
  ctx.stroke()
}

let frame = 0
window.setInterval(() => {
	frame += 1
	document.getElementById('frame').innerHTML = `
		frame: ${frame}, seconds: ${Math.round((frame/60) * 100) / 100}
	`

	ctx.clearRect(0, 0, canvas.width, canvas.height)
	draw()
}, 1000/60)
