// pitch is not based on MIDI pitch but sequential number on an 88-key piano

const pitchMap = new Map([
	[16, ['C2', 65.406]],
	[17, ['C#/Db2', 69.296]],
	[18, ['D2', 73.416]],
	[19, ['D#/Eb2', 77.782]],
	[20, ['E2', 82.407]],
	[21, ['F2', 87.307]],
	[22, ['F#2/Gb2', 92.499]],
	[23, ['G2', 97.998]],
	[24, ['G#/Ab2', 103.826]],
	[25, ['A2', 110]],
	[26, ['A#/Bb2', 116.541]],
	[27, ['B2', 123.471]],
	[28, ['C3', 130.813]],
	[29, ['C#/Db3', 138.5913]],
	[30, ['D3', 146.8324]],
	[31, ['D#/Eb3', 155.5635]],
	[32, ['E3', 164.8138]],
	[33, ['F3', 174.6141]],
	[34, ['F#/Gb3', 184.9972]],
	[35, ['G3', 195.9977]],
	[36, ['G#/Ab3', 207.6523]],
	[37, ['A3', 220.0000]],
	[38, ['A#/Bb3', 233.0819]],
	[39, ['B3', 246.9417]],
	[40, ['C4', 261.6256]],
	[41, ['C#/Db4', 277.1826]],
	[42, ['D4', 293.6648]],
	[43, ['D#/Eb4', 311.1270]],
	[44, ['E4', 329.6276]],
	[45, ['F4', 349.2282]],
	[46, ['F#/Gb4', 369.9944]],
	[47, ['G4', 391.9954]],
	[48, ['G#/Ab4', 415.3047]],
	[49, ['A4', 440]],
	[50, ['A#/Bb4', 466.1638]],
	[51, ['B4', 493.8833]],
	[52, ['C5', 523.2511]],
	[53, ['C#/Db5', 554.3653]],
	[54, ['D5', 587.3295]],
	[55, ['D#/Eb5', 622.2540]],
	[56, ['E5', 659.2551]],
	[57, ['F5', 698.4565]],
	[58, ['F#/Gb5', 739.9888]],
	[59, ['G5', 783.9909]],
	[60, ['G#/Ab5', 830.6094]],
	[61, ['A5', 880]],
	[62, ['A#/Bb5', 932.3275]],
	[63, ['B5', 987.7666]],
	[64, ['C6', 1046.502]],
	[65, ['C#/Db6', 1108.731]],
	[66, ['D6', 1174.659]],
	[67, ['D#/Eb6', 1244.508]],
	[68, ['E6', 1318.510]],
	[69, ['F6', 1396.913]],
	[70, ['F#6/Gb6', 1479.978]],
	[71, ['G6', 1567.982]],
	[72, ['G#/Ab6', 1661.219]],
	[73, ['A6', 1760]],
	[74, ['A#/Bb6', 1864.655]],
	[75, ['B6', 1975.533]],
	[76, ['C6', 2093.005]]
])