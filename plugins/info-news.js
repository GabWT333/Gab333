const _0x7df004 = _0x52b2;
(function (_0x4a974d, _0x665d29) {
    const _0x103aa2 = _0x52b2, _0x1516c9 = _0x4a974d();
    while (!![]) {
        try {
            const _0x28f190 = -parseInt(_0x103aa2(0x100)) / (-0x2484 + 0x1 * 0x2383 + 0x102) * (parseInt(_0x103aa2(0xf0)) / (-0x4 * -0x5e + 0x12f0 + -0x1466)) + parseInt(_0x103aa2(0x135)) / (0x6c * -0x41 + 0x22fb + 0x142 * -0x6) + -parseInt(_0x103aa2(0x10e)) / (0x1945 + 0xa28 + -0x2369) * (parseInt(_0x103aa2(0x115)) / (-0x260d + -0x19 * 0x5 + 0x268f)) + parseInt(_0x103aa2(0x11b)) / (0x9 * -0x15a + 0x139 * -0x13 + -0x236b * -0x1) + parseInt(_0x103aa2(0x11c)) / (-0x1b * -0x38 + -0x11ce + 0xbed) * (parseInt(_0x103aa2(0x120)) / (-0x1ec6 + 0x368 * -0x7 + -0xa * -0x577)) + -parseInt(_0x103aa2(0xfd)) / (0x21c8 + -0x9a * -0x38 + -0x436f) + parseInt(_0x103aa2(0x10c)) / (-0x4a4 + -0xc1e + -0x866 * -0x2);
            if (_0x28f190 === _0x665d29)
                break;
            else
                _0x1516c9['push'](_0x1516c9['shift']());
        } catch (_0x1efa5e) {
            _0x1516c9['push'](_0x1516c9['shift']());
        }
    }
}(_0x129d, -0x44033 + -0x5304a + 0x1 * 0xcf4c4));
const sourcesBySport = {
    'calcio': [
        {
            'name': _0x7df004(0x10a),
            'url': 'https://www.gazzetta.it/rss/Calcio.xml'
        },
        {
            'name': _0x7df004(0x130),
            'url': _0x7df004(0x122)
        },
        {
            'name': _0x7df004(0xf1),
            'url': _0x7df004(0x12e)
        }
    ],
    'basket': [{
            'name': _0x7df004(0x11f),
            'url': 'https://www.sportando.basketball/feed/'
        }],
    'tennis': [{
            'name': 'Ubitennis',
            'url': _0x7df004(0xf9)
        }],
    'formula1': [{
            'name': _0x7df004(0x114),
            'url': _0x7df004(0x123)
        }],
    'mma': [{
            'name': _0x7df004(0x101),
            'url': _0x7df004(0x106)
        }],
    'ciclismo': [{
            'name': _0x7df004(0x10b),
            'url': 'https://www.cyclingnews.com/rss/news/'
        }]
};
function _0x52b2(_0x517816, _0x20a876) {
    const _0x2b47af = _0x129d();
    return _0x52b2 = function (_0x582e06, _0x20507) {
        _0x582e06 = _0x582e06 - (0x1e70 + 0x1 * -0x93f + -0x1442);
        let _0x1e5cd2 = _0x2b47af[_0x582e06];
        return _0x1e5cd2;
    }, _0x52b2(_0x517816, _0x20a876);
}
async function getNews(_0x52976d = _0x7df004(0xf7)) {
    const _0x1cd704 = _0x7df004, _0x55fb10 = {
            'Pxnjv': '📭\x20Nessuna\x20notizia\x20trovata.',
            'rlviN': function (_0x1ea29a, _0x453192) {
                return _0x1ea29a === _0x453192;
            },
            'ziDKX': 'hmvSy',
            'CMGQz': function (_0x20d50b, _0x347d0d) {
                return _0x20d50b(_0x347d0d);
            },
            'BxdgR': _0x1cd704(0x117),
            'KqcZH': _0x1cd704(0xff),
            'LyGZl': function (_0x4c1981, _0x2474d7) {
                return _0x4c1981 !== _0x2474d7;
            },
            'frYnL': _0x1cd704(0xf4),
            'SIMfQ': _0x1cd704(0x132)
        };
    let _0x39e302 = [];
    const _0x30caa4 = sourcesBySport[_0x52976d] || [];
    for (const _0x3773e0 of _0x30caa4) {
        try {
            if (_0x55fb10[_0x1cd704(0x128)](_0x55fb10['ziDKX'], _0x55fb10[_0x1cd704(0x12b)])) {
                const _0x2fc899 = await _0x55fb10[_0x1cd704(0x113)](fetch, _0x3773e0[_0x1cd704(0x12f)]), _0x233721 = await _0x2fc899[_0x1cd704(0xf5)](), _0x5ddb1d = [..._0x233721['matchAll'](/<item>([\s\S]*?)<\/item>/g)][_0x1cd704(0x112)](0x1906 * 0x1 + -0x7 * 0x326 + -0x4 * 0xbf, -0x1f95 + -0x17 * -0xe5 + 0x5b * 0x1f);
                for (const _0x3a0a56 of _0x5ddb1d) {
                    if (_0x55fb10[_0x1cd704(0x129)] === _0x55fb10['KqcZH'])
                        _0x2fe73a += _0x1cd704(0x107) + _0x17d963['title'] + _0x1cd704(0x131) + _0x2a9932['source'] + _0x1cd704(0xfb) + _0x6dd29f[_0x1cd704(0x104)] + '\x0a\x0a';
                    else {
                        const _0x1dcd7 = _0x3a0a56[-0x1 * -0xbe6 + -0x7bf * 0x2 + 0x133 * 0x3][_0x1cd704(0x136)](/<title><!\[CDATA\[(.?)\]\]><\/title>/) || _0x3a0a56[0xb3d + -0x14ab + -0x325 * -0x3][_0x1cd704(0x136)](/<title>(.?)<\/title>/), _0xa675ad = _0x3a0a56[0x3 * -0xc17 + -0x2 * 0x10c9 + 0x2 * 0x22ec][_0x1cd704(0x136)](/<link>(.*?)<\/link>/);
                        _0x1dcd7 && _0xa675ad && _0x39e302[_0x1cd704(0xf8)]({
                            'title': _0x1dcd7[-0x1281 + -0x12a * -0x17 + -0x844],
                            'link': _0xa675ad[-0xdb1 + 0x19 * -0x25 + 0x114f],
                            'source': _0x3773e0[_0x1cd704(0x12a)]
                        });
                    }
                }
            } else
                _0x595e58['reply'](_0x55fb10[_0x1cd704(0x102)]);
        } catch (_0x4b231b) {
            _0x55fb10[_0x1cd704(0x12c)](_0x55fb10['frYnL'], _0x55fb10[_0x1cd704(0xef)]) ? console[_0x1cd704(0xfe)](_0x1cd704(0x10d) + _0x3773e0['name'] + ':', _0x4b231b[_0x1cd704(0x119)]) : _0x487c2e['error'](_0x1cd704(0x10d) + _0x4ae220[_0x1cd704(0x12a)] + ':', _0x4512dd[_0x1cd704(0x119)]);
        }
    }
    if (!_0x39e302[_0x1cd704(0xfa)])
        return null;
    let _0x166132 = _0x1cd704(0x127) + _0x52976d[_0x1cd704(0x133)]() + _0x1cd704(0x105);
    for (const _0x7b8125 of _0x39e302[_0x1cd704(0x112)](0x1bbc + -0xcce + 0x4e * -0x31, 0x14fa + -0x708 + -0xded)) {
        _0x166132 += _0x1cd704(0x107) + _0x7b8125[_0x1cd704(0x116)] + '*\x0a📌\x20' + _0x7b8125[_0x1cd704(0x124)] + _0x1cd704(0xfb) + _0x7b8125['link'] + '\x0a\x0a';
    }
    return _0x166132['trim']();
}
let handler = async (_0x371355, {conn: _0x3b904e}) => {
    const _0xa39e9f = _0x7df004, _0x173d4f = {
            'OmDlE': function (_0x3becb1, _0x25f074) {
                return _0x3becb1 && _0x25f074;
            },
            'wMCTx': _0xa39e9f(0xf7),
            'oPzfC': function (_0x191630, _0x47d009) {
                return _0x191630 !== _0x47d009;
            },
            'VhPfT': _0xa39e9f(0x121),
            'ljOCu': _0xa39e9f(0x11d),
            'WWfGK': _0xa39e9f(0xf2),
            'RoiTG': _0xa39e9f(0x110)
        }, _0x322e0c = _0x371355[_0xa39e9f(0x134)], _0x4af880 = global['db'][_0xa39e9f(0x10f)][_0xa39e9f(0xfc)][_0x322e0c] || {}, _0x3ed249 = _0x4af880[_0xa39e9f(0x103)] || _0x173d4f['wMCTx'], _0x628d76 = await getNews(_0x3ed249);
    if (_0x628d76)
        _0x173d4f[_0xa39e9f(0xf3)]('ONNBr', _0x173d4f[_0xa39e9f(0x126)]) ? _0x1d679c[_0xa39e9f(0xf8)]({
            'title': _0x1b7262[0x10d4 + 0xf99 + 0x14 * -0x19f],
            'link': _0x534ac8[-0x203c * -0x1 + 0x1486 + -0x34c1],
            'source': _0x620a6d[_0xa39e9f(0x12a)]
        }) : await _0x3b904e[_0xa39e9f(0x118)](_0x371355['chat'], {
            'text': _0x628d76,
            'footer': _0x173d4f[_0xa39e9f(0xf6)],
            'headerType': 0x1
        }, { 'quoted': _0x371355 });
    else {
        if (_0x173d4f[_0xa39e9f(0x11e)] === _0xa39e9f(0xf2))
            _0x371355[_0xa39e9f(0x11a)](_0x173d4f[_0xa39e9f(0x111)]);
        else {
            const _0x16b47a = _0x3fca1f[0x14a7 + -0xd6 * -0x5 + -0x18d4][_0xa39e9f(0x136)](/<title><!\[CDATA\[(.?)\]\]><\/title>/) || _0x47dc01[0x1884 + -0x1ca4 + 0x421 * 0x1]['match'](/<title>(.?)<\/title>/), _0x17d586 = _0x510736[-0x10 * 0x26e + -0x2043 + -0x11c9 * -0x4][_0xa39e9f(0x136)](/<link>(.*?)<\/link>/);
            _0x173d4f[_0xa39e9f(0x125)](_0x16b47a, _0x17d586) && _0x448e6f[_0xa39e9f(0xf8)]({
                'title': _0x16b47a[-0x458 + -0x2369 + 0x1 * 0x27c2],
                'link': _0x17d586[-0x449 + -0x1967 + 0x1db1],
                'source': _0x35485e[_0xa39e9f(0x12a)]
            });
        }
    }
};
function _0x129d() {
    const _0x47abba = [
        'ziDKX',
        'LyGZl',
        'command',
        'https://www.corrieredellosport.it/rss/calcio',
        'url',
        'Tuttosport',
        '*\x0a📌\x20',
        'DoyRc',
        'toUpperCase',
        'sender',
        '88530aeIdAC',
        'match',
        'SIMfQ',
        '112mBsQDJ',
        'Corriere\x20dello\x20Sport',
        'LLvZD',
        'oPzfC',
        'RGxDe',
        'text',
        'ljOCu',
        'calcio',
        'push',
        'https://www.ubitennis.com/feed/',
        'length',
        '\x0a🔗\x20',
        'users',
        '3261411ipLNZr',
        'error',
        'NKWHm',
        '6996UWJtOv',
        'MMA\x20Mania',
        'Pxnjv',
        'preferredSport',
        'link',
        '*\x0a\x0a',
        'https://www.mmamania.com/rss/current.xml',
        '📰\x20*',
        'news',
        'tags',
        'Gazzetta',
        'CyclingNews',
        '4494070FCcxMU',
        'Errore\x20su\x20',
        '129452CQUSTZ',
        'data',
        '📭\x20Nessuna\x20notizia\x20trovata.',
        'RoiTG',
        'slice',
        'CMGQz',
        'FormulaPassion',
        '20dxosfW',
        'title',
        'mLwPM',
        'sendMessage',
        'message',
        'reply',
        '1973808Osgvnu',
        '7vgzkdU',
        '🗞\x20Notizie\x20aggiornate',
        'WWfGK',
        'Sky\x20Basket',
        '2449544TYIRiM',
        'ONNBr',
        'https://www.tuttosport.com/rss/calcio.xml',
        'https://formulapassion.it/feed',
        'source',
        'OmDlE',
        'VhPfT',
        '📢\x20*Ultime\x20notizie\x20-\x20',
        'rlviN',
        'BxdgR',
        'name'
    ];
    _0x129d = function () {
        return _0x47abba;
    };
    return _0x129d();
}
handler[_0x7df004(0x12d)] = /^news$/i, handler[_0x7df004(0x109)] = [_0x7df004(0x108)], handler['help'] = [_0x7df004(0x108)];
export default handler;