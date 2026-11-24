// "Diamnya dia" · format papel. Every cut is a word (build/word_index.txt).
SCENE_FILES = ['scenes/paper_kit.js', 'scenes/diam.js'];
const CUT_B = wi(5) - 0.1;    // "Kata"
const CUT_C = wi(14) - 0.1;   // "Ceritanya"
const CUT_D = wi(27) - 0.1;   // "Dia tertawa"
const CUT_E = wi(42) - 0.1;   // "Tapi"
const CUT_F = wi(50) - 0.1;   // "Jawabannya"
const CUT_G = wi(59) - 0.1;   // "Jadi"
TIMELINE = () => [['sunyi', 0], ['ramai', CUT_B], ['cerita', CUT_C], ['tawa', CUT_D], ['luka', CUT_E], ['pendek', CUT_F], ['tanpakata', CUT_G]];
PHRASES = null; READOUT = null;
cue(CUT_B - 0.12, 'whoosh', -6);
cue(CUT_D - 0.12, 'swoosh', -8);
cue(CUT_E - 0.12, 'whoosh', -8);
cue(CUT_G - 0.12, 'whoosh', -8);
