// "Bagaimana kita jatuh cinta" · format papel. Every cut is a word (build/word_index.txt).
SCENE_FILES = ['scenes/paper_kit.js', 'scenes/cinta.js'];
const CUT_B = wi(9) - 0.1;    // "Lihat"
const CUT_C = wi(22) - 0.1;   // "Tapi"
const CUT_D = wi(36) - 0.1;   // "Mungkin"
TIMELINE = () => [['jatuh', 0], ['hadiah', CUT_B], ['penilai', CUT_C], ['sempurna', CUT_D]];
PHRASES = null; READOUT = null;
cue(CUT_B - 0.12, 'whoosh', -6);
cue(CUT_C - 0.12, 'whoosh', -6);
cue(CUT_D - 0.12, 'whoosh', -6);
