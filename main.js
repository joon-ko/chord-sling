let circles = []
let holdShape = null
let holding = false

function getCursorPosition(canvas, event) {
	const rect = canvas.getBoundingClientRect()
	const x = event.clientX - rect.left - 1
	const y = event.clientY - rect.top - 1
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
  holding = true
})

canvas.addEventListener('mousemove', function (e) {
  // display coordinate info
	const [x, y] = getCursorPosition(canvas, e)
	document.getElementById('info').innerHTML = `x: ${x}, y: ${y}`

  // update position of the held shape
  if (holding) {
    holdShape = Object.assign(holdShape, {x: x, y: y})
  }
})

canvas.addEventListener('mouseup', function (e) {
  const [x, y] = getCursorPosition(canvas, e)
  if (holding) {
    holdShape = Object.assign(holdShape, {x: x, y: y})
    circles.push(holdShape)
    holdShape = null
    holding = false
  }
})

// this function is run 60 times a second, and right after the screen is cleared
function draw() {
	for (let circle of circles) {
		const { x, y, color } = circle
		drawCircle(x, y, color)
	}

  if (holding) {
    const { x, y, color } = holdShape
    drawCircle(x, y, color)
  }
}

function drawCircle(x, y, color) {
	ctx.beginPath()
	ctx.arc(x, y, 10, 0, 2*Math.PI, true)
	ctx.fillStyle = color
	ctx.fill()
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
