// Format "papel". Starter skeleton: replace its beats with this script's own story. Everything is cued on words (build/word_index.txt).
SCENE_FILES = ['scenes/paper_kit.js', 'scenes/inicio.js'];
const CUT_B = sentenceAfter(Math.max(1.6, frac(0.3))) - 0.05;
TIMELINE = () => [['escena_a', 0], ['escena_b', CUT_B]];
PHRASES = null; READOUT = null;
cue(CUT_B - 0.12, 'swoosh', -8);
