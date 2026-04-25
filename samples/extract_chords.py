import pretty_midi
from collections import defaultdict

# Load MIDI
midi = pretty_midi.PrettyMIDI('output/audio_basic_pitch.mid')

# Get all notes
all_notes = []
for instrument in midi.instruments:
    for note in instrument.notes:
        all_notes.append({
            'start': note.start,
            'pitch': note.pitch,
            'name': pretty_midi.note_number_to_name(note.pitch)
        })

# Group into 2-second windows
windows = defaultdict(list)
for note in all_notes:
    window = int(note['start'] / 2.0)
    windows[window].append(note['pitch'])

# Simple chord detection
def detect_chord(pitches):
    if not pitches:
        return None

    # Get unique pitch classes (0-11)
    pitch_classes = sorted(set(p % 12 for p in pitches))

    # Get root (lowest note)
    root_names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

    if len(pitch_classes) < 3:
        return None

    # Check common chord patterns
    root = min(pitch_classes)
    intervals = [(p - root) % 12 for p in pitch_classes]
    intervals.sort()

    root_name = root_names[root]

    # Major: 0, 4, 7
    if set(intervals) >= {0, 4, 7}:
        if 10 in intervals or 11 in intervals:
            return f"{root_name}maj7"
        return f"{root_name}maj"

    # Minor: 0, 3, 7
    if set(intervals) >= {0, 3, 7}:
        if 10 in intervals:
            return f"{root_name}m7"
        return f"{root_name}m"

    # Dominant 7: 0, 4, 7, 10
    if set(intervals) >= {0, 4, 10}:
        return f"{root_name}7"

    return f"{root_name}?"

# Analyze first 20 windows (40 seconds)
print("DETECTED CHORD PROGRESSION:")
print("=" * 60)

prev_chord = None
for i in range(min(20, max(windows.keys())+1)):
    if i in windows:
        chord = detect_chord(windows[i])
        if chord and chord != prev_chord:
            print(f"{i*2}s: {chord}")
            prev_chord = chord

print("\n" + "=" * 60)
print("This is what your correction layer needs to clean up.")
