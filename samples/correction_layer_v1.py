"""
Correction Layer v1 - Gospel/Jazz Piano Chord Detection
Turns messy MIDI notes into clean, usable chord progressions
"""

import pretty_midi
from collections import defaultdict, Counter

# Note names
NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Major scale intervals
MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]
MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10]

# Chord templates (intervals from root)
CHORD_TEMPLATES = {
    'maj': {0, 4, 7},
    'maj7': {0, 4, 7, 11},
    'maj9': {0, 2, 4, 7, 11},
    'm': {0, 3, 7},
    'm7': {0, 3, 7, 10},
    'm9': {0, 2, 3, 7, 10},
    '7': {0, 4, 7, 10},
    '9': {0, 2, 4, 7, 10},
    '13': {0, 2, 4, 7, 9, 10},
    'dim': {0, 3, 6},
    'dim7': {0, 3, 6, 9},
    'aug': {0, 4, 8},
    'sus2': {0, 2, 7},
    'sus4': {0, 5, 7},
}

class CorrectionLayerV1:
    def __init__(self, midi_file_path):
        self.midi = pretty_midi.PrettyMIDI(midi_file_path)
        self.notes = self._extract_notes()
        self.detected_key = None
        self.key_scale = None

    def _extract_notes(self):
        """Extract all notes with timing"""
        all_notes = []
        for instrument in self.midi.instruments:
            for note in instrument.notes:
                all_notes.append({
                    'start': note.start,
                    'end': note.end,
                    'pitch': note.pitch,
                    'duration': note.end - note.start
                })
        return sorted(all_notes, key=lambda x: x['start'])

    def detect_key(self):
        """Detect the key signature using Krumhansl-Schmuckler algorithm"""
        # Count pitch class occurrences weighted by duration
        pitch_class_weights = [0] * 12

        for note in self.notes:
            pc = note['pitch'] % 12
            pitch_class_weights[pc] += note['duration']

        # Krumhansl-Kessler key profiles (simplified)
        major_profile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
        minor_profile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

        # Calculate correlation for each possible key
        best_correlation = -1
        best_key = None
        best_mode = None

        for tonic in range(12):
            # Test major
            correlation = sum(pitch_class_weights[(tonic + i) % 12] * major_profile[i] for i in range(12))
            if correlation > best_correlation:
                best_correlation = correlation
                best_key = tonic
                best_mode = 'major'

            # Test minor
            correlation = sum(pitch_class_weights[(tonic + i) % 12] * minor_profile[i] for i in range(12))
            if correlation > best_correlation:
                best_correlation = correlation
                best_key = tonic
                best_mode = 'minor'

        self.detected_key = best_key
        self.key_scale = MAJOR_SCALE if best_mode == 'major' else MINOR_SCALE

        return NOTE_NAMES[best_key], best_mode

    def group_notes_by_time(self, window_size=2.0):
        """Group notes into time windows"""
        windows = defaultdict(list)

        for note in self.notes:
            window_idx = int(note['start'] / window_size)
            windows[window_idx].append(note)

        return windows

    def detect_chord_from_notes(self, notes):
        """Detect chord from a group of notes with confidence scoring"""
        if not notes:
            return None, 0.0

        # Get pitch classes weighted by duration
        pitch_classes = defaultdict(float)
        for note in notes:
            pc = note['pitch'] % 12
            pitch_classes[pc] += note['duration']

        # Get top pitch classes (limit to most important ones)
        sorted_pcs = sorted(pitch_classes.items(), key=lambda x: x[1], reverse=True)
        top_pcs = set([pc for pc, _ in sorted_pcs[:6]])  # Take up to 6 most prominent notes

        if len(top_pcs) < 2:
            return None, 0.0

        # Try to find best matching chord template
        best_chord = None
        best_score = 0

        for root in range(12):
            for chord_type, intervals in CHORD_TEMPLATES.items():
                chord_pcs = {(root + interval) % 12 for interval in intervals}

                # Calculate match score
                matches = len(chord_pcs & top_pcs)
                extra_notes = len(top_pcs - chord_pcs)
                missing_notes = len(chord_pcs - top_pcs)

                # Score: prioritize matches, penalize extra/missing notes
                score = matches - (extra_notes * 0.3) - (missing_notes * 0.5)

                # Boost score if chord is diatonic to key
                if self.detected_key is not None and self.is_diatonic(root):
                    score += 0.5

                if score > best_score:
                    best_score = score
                    best_chord = (root, chord_type)

        if best_chord is None:
            return None, 0.0

        root, chord_type = best_chord

        # Calculate confidence (0-1)
        confidence = min(1.0, best_score / len(CHORD_TEMPLATES[chord_type]))

        # Format chord name
        chord_name = NOTE_NAMES[root] + chord_type

        return chord_name, confidence

    def is_diatonic(self, pitch_class):
        """Check if a pitch class is in the detected key"""
        if self.detected_key is None:
            return True

        relative_pc = (pitch_class - self.detected_key) % 12
        return relative_pc in self.key_scale

    def smooth_chord_progression(self, raw_chords, min_duration=1.0):
        """Smooth out rapid chord changes"""
        if not raw_chords:
            return []

        smoothed = []
        current_chord = None
        current_start = 0
        chord_count = 0

        for timestamp, chord_info in sorted(raw_chords.items()):
            chord, confidence = chord_info

            # If chord changed
            if chord != current_chord:
                # Save previous chord if it lasted long enough
                if current_chord is not None and chord_count >= min_duration:
                    smoothed.append({
                        'time': current_start,
                        'chord': current_chord[0],
                        'confidence': current_chord[1]
                    })

                current_chord = (chord, confidence)
                current_start = timestamp
                chord_count = 1
            else:
                chord_count += 1

        # Add final chord
        if current_chord is not None and chord_count >= min_duration:
            smoothed.append({
                'time': current_start,
                'chord': current_chord[0],
                'confidence': current_chord[1]
            })

        return smoothed

    def normalize_extensions(self, chord_name):
        """Normalize chord extensions (treat maj7/maj9 as similar)"""
        # Group similar chords
        if chord_name.endswith('maj9'):
            return chord_name.replace('maj9', 'maj7~')  # ~ means "or similar"
        if chord_name.endswith('m9'):
            return chord_name.replace('m9', 'm7~')
        if chord_name.endswith('13'):
            return chord_name.replace('13', '9~')

        return chord_name

    def process(self, window_size=2.0, min_chord_duration=1.0):
        """Run full correction layer pipeline"""
        print("=" * 70)
        print("CORRECTION LAYER V1 - PROCESSING")
        print("=" * 70)

        # Step 1: Detect key
        key_name, key_mode = self.detect_key()
        print(f"\n✓ Detected Key: {key_name} {key_mode}")

        # Step 2: Group notes by time
        windows = self.group_notes_by_time(window_size)
        print(f"✓ Grouped notes into {len(windows)} time windows ({window_size}s each)")

        # Step 3: Detect chords in each window
        raw_chords = {}
        for window_idx, notes in windows.items():
            chord, confidence = self.detect_chord_from_notes(notes)
            if chord:
                raw_chords[window_idx * window_size] = (chord, confidence)

        print(f"✓ Detected {len(raw_chords)} chord candidates")

        # Step 4: Smooth progression
        smoothed_chords = self.smooth_chord_progression(
            raw_chords,
            min_duration=min_chord_duration
        )
        print(f"✓ Smoothed to {len(smoothed_chords)} stable chords")

        # Step 5: Output results
        print("\n" + "=" * 70)
        print("CORRECTED CHORD PROGRESSION:")
        print("=" * 70)

        for chord_data in smoothed_chords:
            time = chord_data['time']
            chord = chord_data['chord']
            confidence = chord_data['confidence']

            # Normalize for display
            normalized = self.normalize_extensions(chord)

            # Confidence indicator
            if confidence >= 0.7:
                indicator = "✓✓✓"
            elif confidence >= 0.5:
                indicator = "✓✓"
            elif confidence >= 0.3:
                indicator = "✓"
            else:
                indicator = "?"

            # Check if diatonic - extract root note properly
            root_str = chord[0]
            if len(chord) > 1 and chord[1] == '#':
                root_str = chord[:2]
            root_pc = NOTE_NAMES.index(root_str)
            diatonic = "✓" if self.is_diatonic(root_pc) else "⚠"

            print(f"{int(time):3d}s: {normalized:12s} [{indicator}] Diatonic:{diatonic} ({confidence:.2f})")

        print("\n" + "=" * 70)
        print("LEGEND:")
        print("  ✓✓✓ = High confidence (>=70%)")
        print("  ✓✓  = Medium confidence (>=50%)")
        print("  ✓   = Low confidence (>=30%)")
        print("  ?   = Very uncertain (<30%)")
        print("  ~   = May include extensions (e.g., maj7~ = maj7 or maj9)")
        print("  ✓   = Diatonic to key")
        print("  ⚠   = Non-diatonic (common in gospel/jazz)")
        print("=" * 70)

        return smoothed_chords


if __name__ == "__main__":
    # Run correction layer on the basic-pitch output
    print("\nLoading MIDI from basic-pitch...\n")

    corrector = CorrectionLayerV1('output/audio_basic_pitch.mid')
    results = corrector.process(
        window_size=2.0,           # 2-second windows
        min_chord_duration=1.0     # Minimum 1 second per chord (2 windows)
    )

    print("\n✅ CORRECTION LAYER V1 COMPLETE")
    print(f"   Detected {len(results)} chords in {corrector.detected_key} key")
