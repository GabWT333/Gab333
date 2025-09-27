const _0x1ed645 = _0x4a9a;
(function (_0x21cf29, _0x45cb7b) {
    const _0x2d64c7 = _0x4a9a, _0x56d8e8 = _0x21cf29();
    while (!![]) {
        try {
            const _0x3fa258 = parseInt(_0x2d64c7(0xf3)) / (0x1 * -0x216f + -0x406 * -0x3 + 0x155e * 0x1) * (-parseInt(_0x2d64c7(0x117)) / (-0xab3 + 0x2531 + -0x6 * 0x46a)) + parseInt(_0x2d64c7(0x112)) / (-0xb2f + 0xa64 + 0xce) + parseInt(_0x2d64c7(0x11d)) / (0x10 * 0x10a + 0xe17 + 0x1eb3 * -0x1) * (parseInt(_0x2d64c7(0xfe)) / (0x76 * -0x1 + -0x10a4 * 0x2 + 0x21c3)) + -parseInt(_0x2d64c7(0x10b)) / (-0x7 * -0x8c + -0x1 * -0x358 + -0x726) * (parseInt(_0x2d64c7(0x108)) / (-0x3e3 + -0x2 * -0x3b3 + -0x37c)) + -parseInt(_0x2d64c7(0xfa)) / (-0x2620 + -0x1d49 * -0x1 + 0x8df) + -parseInt(_0x2d64c7(0x116)) / (0x414 + -0xa66 + -0x1 * -0x65b) + parseInt(_0x2d64c7(0xf5)) / (-0x11a6 * -0x1 + 0x1 * -0x1c42 + 0x1d * 0x5e);
            if (_0x3fa258 === _0x45cb7b)
                break;
            else
                _0x56d8e8['push'](_0x56d8e8['shift']());
        } catch (_0x492e7b) {
            _0x56d8e8['push'](_0x56d8e8['shift']());
        }
    }
}(_0x8912, -0x31241 * 0x2 + 0x46b00 + 0x73b7 * 0xd));
const sources = [
    {
        'name': _0x1ed645(0x11b),
        'url': _0x1ed645(0x113)
    },
    {
        'name': 'Repubblica',
        'url': _0x1ed645(0xfd)
    },
    {
        'name': _0x1ed645(0x115),
        'url': 'https://www.lastampa.it/rss/homepage.xml'
    },
    {
        'name': _0x1ed645(0xfc),
        'url': _0x1ed645(0x11a)
    },
    {
        'name': _0x1ed645(0x103),
        'url': _0x1ed645(0x11e)
    },
    {
        'name': _0x1ed645(0x10d),
        'url': 'http://feeds.reuters.com/reuters/topNews'
    },
    {
        'name': _0x1ed645(0x111),
        'url': 'https://www.ilsole24ore.com/rss/notizie.xml'
    }
];
async function getNews() {
    const _0x3b68a1 = _0x1ed645, _0x1f1f75 = {
            'BJlzU': function (_0x2aac45, _0x13359b) {
                return _0x2aac45(_0x13359b);
            },
            'YIprB': function (_0x49c59d, _0x5a1d40) {
                return _0x49c59d && _0x5a1d40;
            }
        };
    let _0x1a2676 = [];
    for (const _0x33867b of sources) {
        try {
            const _0x22633a = await _0x1f1f75['BJlzU'](fetch, _0x33867b[_0x3b68a1(0xf2)]), _0x25d01e = await _0x22633a[_0x3b68a1(0xf9)](), _0x503a6c = [..._0x25d01e[_0x3b68a1(0x109)](/<item>([\s\S]*?)<\/item>/g)][_0x3b68a1(0x106)](-0xee3 + 0x105a + -0x177, 0x1011 + 0x29 * -0xe3 + 0x144b);
            for (const _0x2f6590 of _0x503a6c) {
                const _0x52cbdc = _0x2f6590[-0x6da * 0x1 + -0x2 * -0xbe4 + -0x10ed][_0x3b68a1(0x114)](/<title><!\[CDATA\[(.?)\]\]><\/title>/) || _0x2f6590[-0x466 * -0x2 + 0xa3 + 0x96e * -0x1][_0x3b68a1(0x114)](/<title>(.?)<\/title>/), _0x5eecc9 = _0x2f6590[0x153f + -0x1c7c * 0x1 + 0x3 * 0x26a]['match'](/<link>(.*?)<\/link>/);
                _0x1f1f75[_0x3b68a1(0x119)](_0x52cbdc, _0x5eecc9) && _0x1a2676['push']({
                    'title': _0x52cbdc[-0x118c * -0x2 + -0x129 + -0x21ee],
                    'link': _0x5eecc9[-0x1670 + 0x11c6 + -0x5 * -0xef],
                    'source': _0x33867b[_0x3b68a1(0x100)]
                });
            }
        } catch (_0x55571c) {
            console['error'](_0x3b68a1(0xfb) + _0x33867b[_0x3b68a1(0x100)] + ':', _0x55571c[_0x3b68a1(0xf7)]);
        }
    }
    if (!_0x1a2676[_0x3b68a1(0x102)])
        return null;
    let _0x347c61 = _0x3b68a1(0x101);
    for (const _0x575908 of _0x1a2676) {
        _0x347c61 += _0x3b68a1(0x10c) + _0x575908[_0x3b68a1(0x11c)] + _0x3b68a1(0xf8) + _0x575908[_0x3b68a1(0x110)] + _0x3b68a1(0x104) + _0x575908[_0x3b68a1(0x120)] + '\x0a\x0a';
    }
    return _0x347c61[_0x3b68a1(0x11f)]();
}
let handler = async (_0x3543f1, {conn: _0x3fc682}) => {
    const _0x4a8a01 = _0x1ed645, _0x29d841 = { 'qaxjT': _0x4a8a01(0x105) }, _0x57134b = await getNews();
    if (!_0x57134b)
        return _0x3543f1[_0x4a8a01(0x107)](_0x29d841[_0x4a8a01(0x10a)]);
    await _0x3fc682[_0x4a8a01(0xf1)](_0x3543f1[_0x4a8a01(0xff)], {
        'text': _0x57134b,
        'footer': _0x4a8a01(0x10e),
        'headerType': 0x1
    }, { 'quoted': _0x3543f1 });
};
handler[_0x1ed645(0xf6)] = /^notiziario$/i, handler[_0x1ed645(0xf4)] = [_0x1ed645(0x10f)], handler['help'] = [_0x1ed645(0x118)];
function _0x4a9a(_0x11f972, _0x703941) {
    const _0x494049 = _0x8912();
    return _0x4a9a = function (_0x2e52a1, _0x1b0bee) {
        _0x2e52a1 = _0x2e52a1 - (-0x2132 + 0x1 * 0x1918 + 0x90b);
        let _0x10c179 = _0x494049[_0x2e52a1];
        return _0x10c179;
    }, _0x4a9a(_0x11f972, _0x703941);
}
export default handler;
function _0x8912() {
    const _0x41ef53 = [
        'message',
        '*\x0a\x20\x20_',
        'text',
        '1158960tjtcoY',
        'Errore\x20su\x20',
        'BBC\x20World',
        'https://www.repubblica.it/rss/homepage/rss2.0.xml',
        '2487655JLRcjd',
        'chat',
        'name',
        '📰\x20*Notiziario\x20Giornaliero*\x0a\x0a',
        'length',
        'CNN',
        '_\x0a\x20\x20🔗\x20',
        '📭\x20Nessuna\x20notizia\x20trovata.',
        'slice',
        'reply',
        '14WohQaO',
        'matchAll',
        'qaxjT',
        '9246AnLNeH',
        '•\x20*',
        'Reuters',
        '🗞\x20Notizie\x20da\x20fonti\x20ufficiali',
        'news',
        'source',
        'Il\x20Sole\x2024\x20Ore',
        '1630143nSOVkH',
        'https://www.ansa.it/sito/ansait_rss.xml',
        'match',
        'La\x20Stampa',
        '3022776UXUxpI',
        '55716IHKmld',
        'notiziario',
        'YIprB',
        'http://feeds.bbci.co.uk/news/world/rss.xml',
        'ANSA',
        'title',
        '4BbSQTG',
        'http://rss.cnn.com/rss/edition_world.rss',
        'trim',
        'link',
        'sendMessage',
        'url',
        '11YZVwwX',
        'tags',
        '214150NBCqEH',
        'command'
    ];
    _0x8912 = function () {
        return _0x41ef53;
    };
    return _0x8912();
}