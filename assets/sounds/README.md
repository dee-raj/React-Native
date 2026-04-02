# Sound Effects

This directory contains sound effect files for the game.

## Required Sound Files

To enable sound effects, add the following `.wav` files to this directory:

- `tap.wav` - General tap/click sound
- `correct.wav` - Correct answer sound
- `wrong.wav` - Wrong answer sound
- `win.wav` - Victory sound
- `level-up.wav` - Level up sound
- `shuffle.wav` - Shuffle sound
- `click.wav` - Button click sound
- `flip.wav` - Card flip sound
- `match.wav` - Match found sound
- `mismatch.wav` - No match sound
- `move.wav` - Move piece sound
- `merge.wav` - Tiles merging sound
- `connect.wav` - Connection sound
- `error.wav` - Error sound
- `hint.wav` - Hint used sound
- `slide.wav` - Sliding puzzle move sound

## Sound Requirements

- Format: WAV (recommended) or MP3
- Duration: 0.1 - 1.0 seconds
- Sample Rate: 44100 Hz
- Channels: Mono or Stereo

## Finding Free Sound Effects

You can find free sound effects at:
- https://freesound.org
- https://opengameart.org
- https://www.zapsplat.com

## Note

If sound files are not present, the game will run silently without errors.
The SoundManager gracefully handles missing sound files.
