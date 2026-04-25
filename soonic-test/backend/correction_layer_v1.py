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
        self.left_hand_notes = []
        self.right_hand_notes = []

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

    def separate_hands(self):
        """
        Hybrid hand separation using:
        1. Fixed split point (Middle C = MIDI 60)
        2. Pitch proximity refinement for boundary notes
        3. Temporal continuity (notes close in time tend to stay together)
        """
        MIDDLE_C = 60
        PROXIMITY_THRESHOLD = 12  # 1 octave around Middle C
        TIME_WINDOW = 0.5  # Notes within 0.5s are considered simultaneous

        if not self.notes:
            return [], []

        # Step 1: Initial split by pitch
        left_hand = []
        right_hand = []
        boundary_notes = []

        for note in self.notes:
            if note['pitch'] < MIDDLE_C - PROXIMITY_THRESHOLD:
                # Clearly left hand (below C4)
                left_hand.append(note)
                note['hand'] = 'left'
            elif note['pitch'] >= MIDDLE_C + PROXIMITY_THRESHOLD:
                # Clearly right hand (above C5)
                right_hand.append(note)
                note['hand'] = 'right'
            else:
                # Boundary notes (within 1 octave of Middle C)
                boundary_notes.append(note)

        # Step 2: Assign boundary notes using pitch proximity
        # For each boundary note, check which hand it's closer to in pitch
        for note in boundary_notes:
            # Find nearby notes (within time window)
            nearby_left = [n for n in left_hand
                          if abs(n['start'] - note['start']) < TIME_WINDOW]
            nearby_right = [n for n in right_hand
                           if abs(n['start'] - note['start']) < TIME_WINDOW]

            # Calculate average distance to each hand
            if nearby_left and nearby_right:
                avg_dist_left = sum(abs(note['pitch'] - n['pitch']) for n in nearby_left) / len(nearby_left)
                avg_dist_right = sum(abs(note['pitch'] - n['pitch']) for n in nearby_right) / len(nearby_right)

                if avg_dist_left < avg_dist_right:
                    left_hand.append(note)
                    note['hand'] = 'left'
                else:
                    right_hand.append(note)
                    note['hand'] = 'right'
            elif nearby_left:
                left_hand.append(note)
                note['hand'] = 'left'
            elif nearby_right:
                right_hand.append(note)
                note['hand'] = 'right'
            else:
                # No nearby notes, use simple split
                if note['pitch'] < MIDDLE_C:
                    left_hand.append(note)
                    note['hand'] = 'left'
                else:
                    right_hand.append(note)
                    note['hand'] = 'right'

        # Sort by time
        left_hand.sort(key=lambda x: x['start'])
        right_hand.sort(key=lambda x: x['start'])

        self.left_hand_notes = left_hand
        self.right_hand_notes = right_hand

        return left_hand, right_hand

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

    def group_notes_by_time(self, notes, window_size=0.5):
        """Group notes into time windows"""
        windows = defaultdict(list)

        for note in notes:
            window_idx = int(note['start'] / window_size)
            windows[window_idx].append(note)

        return windows

    def is_chord_or_melody(self, notes, onset_threshold=0.1):
        """
        Determine if notes form a chord (simultaneous) or melody (sequential)

        Onset threshold: 100ms (0.1s)
        - Notes starting within 100ms = chord
        - Notes spread beyond 100ms = melody/arpeggio
        """
        if len(notes) < 2:
            return 'single_note'

        onsets = [n['start'] for n in notes]
        onset_spread = max(onsets) - min(onsets)

        if onset_spread < onset_threshold:
            return 'chord'
        else:
            return 'melody'

    def detect_chord_from_notes(self, notes):
        """Detect chord from a group of notes with confidence scoring"""
        if not notes:
            return None, 0.0, []

        # Check if notes form a chord or melody
        note_type = self.is_chord_or_melody(notes)

        if note_type == 'melody' or note_type == 'single_note':
            # Don't try to detect chord from sequential notes
            return None, 0.0, []

        # Get pitch classes weighted by duration
        pitch_classes = defaultdict(float)
        for note in notes:
            pc = note['pitch'] % 12
            pitch_classes[pc] += note['duration']

        # Get top pitch classes (limit to most important ones)
        sorted_pcs = sorted(pitch_classes.items(), key=lambda x: x[1], reverse=True)
        top_pcs = set([pc for pc, _ in sorted_pcs[:6]])  # Take up to 6 most prominent notes

        if len(top_pcs) < 2:
            return None, 0.0, []

        # Try to find best matching chord template
        best_chord = None
        best_score = 0
        best_chord_pcs = set()

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
                    best_chord_pcs = chord_pcs

        if best_chord is None:
            return None, 0.0, []

        root, chord_type = best_chord

        # Calculate confidence (0-1)
        confidence = min(1.0, best_score / len(CHORD_TEMPLATES[chord_type]))

        # Format chord name
        chord_name = NOTE_NAMES[root] + chord_type

        # Convert pitch classes to sorted list with note names
        chord_notes = sorted(list(best_chord_pcs))
        note_names = [NOTE_NAMES[pc] for pc in chord_notes]

        return chord_name, confidence, chord_notes

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
            chord, confidence, chord_notes = chord_info

            # If chord changed
            if chord != current_chord:
                # Save previous chord if it lasted long enough
                if current_chord is not None and chord_count >= min_duration:
                    smoothed.append({
                        'time': current_start,
                        'chord': current_chord[0],
                        'confidence': current_chord[1],
                        'notes': current_chord[2]
                    })

                current_chord = (chord, confidence, chord_notes)
                current_start = timestamp
                chord_count = 1
            else:
                chord_count += 1

        # Add final chord
        if current_chord is not None and chord_count >= min_duration:
            smoothed.append({
                'time': current_start,
                'chord': current_chord[0],
                'confidence': current_chord[1],
                'notes': current_chord[2]
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

    def process(self, window_size=0.5, min_chord_duration=0.5):
        """Run full correction layer pipeline with hand separation"""
        print("=" * 70)
        print("CORRECTION LAYER V1 - PROCESSING (WITH HAND SEPARATION)")
        print("=" * 70)

        # Step 1: Separate hands
        left_hand, right_hand = self.separate_hands()
        print(f"\n✓ Hand Separation: {len(left_hand)} left hand notes, {len(right_hand)} right hand notes")

        # Step 2: Detect key (using all notes)
        key_name, key_mode = self.detect_key()
        print(f"✓ Detected Key: {key_name} {key_mode}")

        # Step 3: Group LEFT HAND notes by time for chord detection
        left_windows = self.group_notes_by_time(left_hand, window_size)
        print(f"✓ Grouped left hand into {len(left_windows)} time windows ({window_size}s each)")

        # Step 4: Detect chords from LEFT HAND only
        raw_chords = {}
        for window_idx, notes in left_windows.items():
            chord, confidence, chord_notes = self.detect_chord_from_notes(notes)
            if chord:
                raw_chords[window_idx * window_size] = (chord, confidence, chord_notes)

        print(f"✓ Detected {len(raw_chords)} chord candidates from left hand")

        # Step 5: Smooth progression
        smoothed_chords = self.smooth_chord_progression(
            raw_chords,
            min_duration=min_chord_duration
        )
        print(f"✓ Smoothed to {len(smoothed_chords)} stable chords")

        # Step 6: Group RIGHT HAND notes for melody tracking
        right_windows = self.group_notes_by_time(right_hand, window_size)
        melody_notes = []
        for window_idx in sorted(right_windows.keys()):
            notes = right_windows[window_idx]
            if notes:
                # Get unique pitch classes in this window
                pitches = sorted(set([n['pitch'] % 12 for n in notes]))
                note_names = [NOTE_NAMES[pc] for pc in pitches]
                melody_notes.append({
                    'time': window_idx * window_size,
                    'pitches': pitches,
                    'note_names': note_names
                })

        print(f"✓ Tracked {len(melody_notes)} melody segments in right hand")

        # Step 7: Output results
        print("\n" + "=" * 70)
        print("CORRECTED CHORD PROGRESSION (LEFT HAND):")
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

        # Return both chords and melody
        return {
            'chords': smoothed_chords,
            'melody': melody_notes,
            'stats': {
                'left_hand_notes': len(left_hand),
                'right_hand_notes': len(right_hand),
                'total_notes': len(self.notes)
            }
        }


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
