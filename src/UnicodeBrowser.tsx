import React, { useState, useMemo } from 'react';
import { Search, X, Copy, Check } from 'lucide-react';

const UNICODE_BLOCKS = [
  { name: 'Basic Latin', start: 0x0020, end: 0x007F },
  { name: 'Greek and Coptic', start: 0x0370, end: 0x03FF },
  { name: 'Cyrillic', start: 0x0400, end: 0x04FF },
  { name: 'Thai', start: 0x0E00, end: 0x0E7F },
  { name: 'Georgian', start: 0x10A0, end: 0x10FF },
  { name: 'Phonetic Extensions', start: 0x1D00, end: 0x1D7F },
  { name: 'Letterlike Symbols', start: 0x2100, end: 0x214F },
  { name: 'Latin Extended-C', start: 0x2C60, end: 0x2C7F },
  { name: 'Georgian Supplement', start: 0x2D00, end: 0x2D2F },
  { name: 'Latin Extended-D', start: 0xA720, end: 0xA7FF },
  { name: 'Latin Extended-E', start: 0xAB30, end: 0xAB6F }
];

const CHAR_NAMES = {
  0x0020: 'SPACE', 0x0021: 'EXCLAMATION MARK', 0x0022: 'QUOTATION MARK',
  0x0023: 'NUMBER SIGN', 0x0024: 'DOLLAR SIGN', 0x0025: 'PERCENT SIGN',
  0x0026: 'AMPERSAND', 0x0027: 'APOSTROPHE', 0x0028: 'LEFT PARENTHESIS',
  0x0029: 'RIGHT PARENTHESIS', 0x002A: 'ASTERISK', 0x002B: 'PLUS SIGN',
  0x002C: 'COMMA', 0x002D: 'HYPHEN-MINUS', 0x002E: 'FULL STOP',
  0x002F: 'SOLIDUS', 0x0030: 'DIGIT ZERO', 0x0031: 'DIGIT ONE',
  0x0032: 'DIGIT TWO', 0x0033: 'DIGIT THREE', 0x0034: 'DIGIT FOUR',
  0x0035: 'DIGIT FIVE', 0x0036: 'DIGIT SIX', 0x0037: 'DIGIT SEVEN',
  0x0038: 'DIGIT EIGHT', 0x0039: 'DIGIT NINE', 0x003A: 'COLON',
  0x003B: 'SEMICOLON', 0x003C: 'LESS-THAN SIGN', 0x003D: 'EQUALS SIGN',
  0x003E: 'GREATER-THAN SIGN', 0x003F: 'QUESTION MARK', 0x0040: 'COMMERCIAL AT',
  0x0041: 'LATIN CAPITAL LETTER A', 0x0042: 'LATIN CAPITAL LETTER B',
  0x0043: 'LATIN CAPITAL LETTER C', 0x0044: 'LATIN CAPITAL LETTER D',
  0x0045: 'LATIN CAPITAL LETTER E', 0x0046: 'LATIN CAPITAL LETTER F',
  0x0047: 'LATIN CAPITAL LETTER G', 0x0048: 'LATIN CAPITAL LETTER H',
  0x0049: 'LATIN CAPITAL LETTER I', 0x004A: 'LATIN CAPITAL LETTER J',
  0x004B: 'LATIN CAPITAL LETTER K', 0x004C: 'LATIN CAPITAL LETTER L',
  0x004D: 'LATIN CAPITAL LETTER M', 0x004E: 'LATIN CAPITAL LETTER N',
  0x004F: 'LATIN CAPITAL LETTER O', 0x0050: 'LATIN CAPITAL LETTER P',
  0x0051: 'LATIN CAPITAL LETTER Q', 0x0052: 'LATIN CAPITAL LETTER R',
  0x0053: 'LATIN CAPITAL LETTER S', 0x0054: 'LATIN CAPITAL LETTER T',
  0x0055: 'LATIN CAPITAL LETTER U', 0x0056: 'LATIN CAPITAL LETTER V',
  0x0057: 'LATIN CAPITAL LETTER W', 0x0058: 'LATIN CAPITAL LETTER X',
  0x0059: 'LATIN CAPITAL LETTER Y', 0x005A: 'LATIN CAPITAL LETTER Z',
  0x005B: 'LEFT SQUARE BRACKET', 0x005C: 'REVERSE SOLIDUS',
  0x005D: 'RIGHT SQUARE BRACKET', 0x005E: 'CIRCUMFLEX ACCENT',
  0x005F: 'LOW LINE', 0x0060: 'GRAVE ACCENT', 0x0061: 'LATIN SMALL LETTER A',
  0x0062: 'LATIN SMALL LETTER B', 0x0063: 'LATIN SMALL LETTER C',
  0x0064: 'LATIN SMALL LETTER D', 0x0065: 'LATIN SMALL LETTER E',
  0x0066: 'LATIN SMALL LETTER F', 0x0067: 'LATIN SMALL LETTER G',
  0x0068: 'LATIN SMALL LETTER H', 0x0069: 'LATIN SMALL LETTER I',
  0x006A: 'LATIN SMALL LETTER J', 0x006B: 'LATIN SMALL LETTER K',
  0x006C: 'LATIN SMALL LETTER L', 0x006D: 'LATIN SMALL LETTER M',
  0x006E: 'LATIN SMALL LETTER N', 0x006F: 'LATIN SMALL LETTER O',
  0x0070: 'LATIN SMALL LETTER P', 0x0071: 'LATIN SMALL LETTER Q',
  0x0072: 'LATIN SMALL LETTER R', 0x0073: 'LATIN SMALL LETTER S',
  0x0074: 'LATIN SMALL LETTER T', 0x0075: 'LATIN SMALL LETTER U',
  0x0076: 'LATIN SMALL LETTER V', 0x0077: 'LATIN SMALL LETTER W',
  0x0078: 'LATIN SMALL LETTER X', 0x0079: 'LATIN SMALL LETTER Y',
  0x007A: 'LATIN SMALL LETTER Z', 0x007B: 'LEFT CURLY BRACKET',
  0x007C: 'VERTICAL LINE', 0x007D: 'RIGHT CURLY BRACKET', 0x007E: 'TILDE'
};

const getCharName = (code) => {
  if (CHAR_NAMES[code]) return CHAR_NAMES[code];
  const block = UNICODE_BLOCKS.find(b => code >= b.start && code <= b.end);
  return block ? `${block.name.toUpperCase()} CHARACTER` : 'UNICODE CHARACTER';
};

const getUTF8 = (code) => {
  const bytes = [];
  if (code <= 0x7F) bytes.push(code);
  else if (code <= 0x7FF) {
    bytes.push(0xC0 | (code >> 6));
    bytes.push(0x80 | (code & 0x3F));
  } else if (code <= 0xFFFF) {
    bytes.push(0xE0 | (code >> 12));
    bytes.push(0x80 | ((code >> 6) & 0x3F));
    bytes.push(0x80 | (code & 0x3F));
  } else {
    bytes.push(0xF0 | (code >> 18));
    bytes.push(0x80 | ((code >> 12) & 0x3F));
    bytes.push(0x80 | ((code >> 6) & 0x3F));
    bytes.push(0x80 | (code & 0x3F));
  }
  return bytes.map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
};

const getUTF16 = (code) => {
  if (code <= 0xFFFF) return '0x' + code.toString(16).toUpperCase().padStart(4, '0');
  const high = Math.floor((code - 0x10000) / 0x400) + 0xD800;
  const low = ((code - 0x10000) % 0x400) + 0xDC00;
  return '0x' + high.toString(16).toUpperCase() + ' 0x' + low.toString(16).toUpperCase();
};

const App = () => {
  const [selectedBlock, setSelectedBlock] = useState(UNICODE_BLOCKS[0]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const characters = useMemo(() => {
    const chars = [];
    for (let i = selectedBlock.start; i <= selectedBlock.end; i++) {
      const char = String.fromCodePoint(i);
      if (char.trim()) chars.push({ code: i, char });
    }
    return chars;
  }, [selectedBlock]);

  const filteredChars = useMemo(() => {
    if (!searchQuery) return characters;
    const q = searchQuery.toLowerCase();
    return characters.filter(c => {
      const name = getCharName(c.code).toLowerCase();
      const codeStr = c.code.toString(16);
      return name.includes(q) || codeStr.includes(q) || `u+${codeStr}`.includes(q);
    });
  }, [characters, searchQuery]);

  const copyToClipboard = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleCharClick = (char) => {
    setSelectedChar(char);
  };

  const handleCharRightClick = (e, char) => {
    e.preventDefault();
    copyToClipboard(char.char, 'rightclick');
  };

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const text = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textSec = darkMode ? 'text-gray-400' : 'text-gray-600';
  const cardBg = darkMode ? 'bg-gray-900' : 'bg-white';
  const hoverBg = darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const border = darkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bg} ${text} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${cardBg} border-b ${border} sticky top-0 z-40 backdrop-blur-sm bg-opacity-80`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-light tracking-wide">Unicode</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSec}`} />
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2 ${cardBg} ${text} border ${border} rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-30 w-64 transition-all`}
              />
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 ${cardBg} ${text} border ${border} rounded-full text-sm hover:bg-opacity-80 transition-all`}
            >
              {darkMode ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className={`w-64 ${cardBg} border-r ${border} min-h-screen sticky top-16 self-start`}>
          <nav className="p-4 space-y-1">
            {UNICODE_BLOCKS.map((block) => (
              <button
                key={block.name}
                onClick={() => setSelectedBlock(block)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                  selectedBlock.name === block.name
                    ? `${darkMode ? 'bg-gray-800' : 'bg-gray-200'} font-medium`
                    : `${hoverBg}`
                }`}
              >
                {block.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-light mb-2">{selectedBlock.name}</h2>
            <p className={`text-sm ${textSec}`}>
              U+{selectedBlock.start.toString(16).toUpperCase().padStart(4, '0')} – U+{selectedBlock.end.toString(16).toUpperCase().padStart(4, '0')}
            </p>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
            {filteredChars.map((c) => (
              <div
                key={c.code}
                onClick={() => handleCharClick(c)}
                onContextMenu={(e) => handleCharRightClick(e, c)}
                className={`${cardBg} border ${border} rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 group`}
              >
                <span className="text-3xl mb-2">{c.char}</span>
                <span className={`text-xs ${textSec} group-hover:${text} transition-colors`}>
                  {c.code.toString(16).toUpperCase().padStart(4, '0')}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal */}
      {selectedChar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedChar(null)}>
          <div className={`${cardBg} rounded-2xl p-8 max-w-md w-full shadow-2xl`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="text-7xl">{selectedChar.char}</div>
              <button onClick={() => setSelectedChar(null)} className={`p-2 ${hoverBg} rounded-lg transition-colors`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <InfoRow label="Name" value={getCharName(selectedChar.code)} />
              <InfoRow 
                label="Code Point" 
                value={`U+${selectedChar.code.toString(16).toUpperCase().padStart(4, '0')}`}
                onCopy={() => copyToClipboard(`U+${selectedChar.code.toString(16).toUpperCase().padStart(4, '0')}`, 'codepoint')}
                copied={copiedField === 'codepoint'}
              />
              <InfoRow 
                label="Character" 
                value={selectedChar.char}
                onCopy={() => copyToClipboard(selectedChar.char, 'char')}
                copied={copiedField === 'char'}
              />
              <InfoRow 
                label="HTML Entity" 
                value={`&#${selectedChar.code};`}
                onCopy={() => copyToClipboard(`&#${selectedChar.code};`, 'html')}
                copied={copiedField === 'html'}
              />
              <InfoRow 
                label="UTF-8" 
                value={getUTF8(selectedChar.code)}
                onCopy={() => copyToClipboard(getUTF8(selectedChar.code), 'utf8')}
                copied={copiedField === 'utf8'}
              />
              <InfoRow 
                label="UTF-16" 
                value={getUTF16(selectedChar.code)}
                onCopy={() => copyToClipboard(getUTF16(selectedChar.code), 'utf16')}
                copied={copiedField === 'utf16'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value, onCopy, copied }) => {
  const darkMode = document.documentElement.classList.contains('dark');
  const textSec = darkMode ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className={`text-xs ${textSec} mb-1`}>{label}</div>
        <div className="text-sm font-mono break-all">{value}</div>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className={`ml-4 p-2 ${hoverBg} rounded-lg transition-all`}
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};

export default App;