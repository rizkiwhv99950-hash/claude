// "Diamnya dia" · format papel. Every cut is a word (build/word_index.txt).
SCENE_FILES = ['scenes/paper_kit.js', 'scenes/diam.js'];
const CUT_B = wi(5) - 0.1;    // "Kata"
const CUT_C = wi(24) - 0.1;   // "Tapi"
const CUT_D = wi(32) - 0.1;   // "Jadi"
TIMELINE = () => [['sunyi', 0], ['ramai', CUT_B], ['luka', CUT_C], ['tanpakata', CUT_D]];
PHRASES = null; READOUT = null;
cue(CUT_B - 0.12, 'whoosh', -6);
cue(CUT_C - 0.12, 'whoosh', -8);
cue(CUT_D - 0.12, 'whoosh', -8);
