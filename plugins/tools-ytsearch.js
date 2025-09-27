const _0x28bcce = _0x3f94;
(function (_0x182572, _0x37b5ae) {
    const _0x26d694 = _0x3f94, _0x5147e2 = _0x182572();
    while (!![]) {
        try {
            const _0x583da4 = parseInt(_0x26d694(0x1fd)) / (-0x211 * -0x11 + 0x1126 + 0x3446 * -0x1) + parseInt(_0x26d694(0x1f9)) / (0xfd8 + -0x1cdb + 0xd05) + -parseInt(_0x26d694(0x1ea)) / (0x175 + 0x33f + 0x1 * -0x4b1) * (-parseInt(_0x26d694(0x1d2)) / (0x6 * -0x322 + -0x10d + 0x13dd)) + -parseInt(_0x26d694(0x200)) / (-0x1057 + 0x7a * 0x1f + 0x3a * 0x7) * (parseInt(_0x26d694(0x1f4)) / (-0xc7c + 0x9d * -0x11 + 0x16ef)) + -parseInt(_0x26d694(0x1e5)) / (-0x11ff + -0x3ee + 0x15f4) + -parseInt(_0x26d694(0x1de)) / (-0x2177 * -0x1 + 0x106b + -0x31da) + parseInt(_0x26d694(0x1fa)) / (0x1711 + -0x257 * -0x4 + -0x2064) * (parseInt(_0x26d694(0x1f3)) / (-0x1746 * 0x1 + 0x2 * 0xa82 + 0x6 * 0x62));
            if (_0x583da4 === _0x37b5ae)
                break;
            else
                _0x5147e2['push'](_0x5147e2['shift']());
        } catch (_0x3f9c00) {
            _0x5147e2['push'](_0x5147e2['shift']());
        }
    }
}(_0x41c4, -0x4fa85 + 0x2c * -0x25 + 0x95 * 0x1ae5));
import _0x77fc8c from 'yt-search';
import _0x3cdce4 from 'fs';
const handler = async (_0x4f7a6d, {
    conn: _0x108af5,
    text: _0xce5fc
}) => {
    const _0x298076 = _0x3f94, _0x33e893 = {
            'CHroz': _0x298076(0x1ef),
            'hJRja': '❗\x20Per\x20usare\x20questo\x20comando\x20usa\x20la\x20base\x20di\x20chatunity',
            'SMdFm': _0x298076(0x1df),
            'tiDnQ': function (_0x4e6f7b, _0x4f74c8) {
                return _0x4e6f7b(_0x4f74c8);
            },
            'dLTBj': _0x298076(0x1e8),
            'brFOR': _0x298076(0x1d3),
            'BBzdp': 'chatunity\x20✦\x20Downloader'
        }, _0x5d0a03 = [
            _0x298076(0x1fc),
            _0x298076(0x1e2),
            _0x33e893['CHroz'],
            _0x298076(0x1d7)
        ], _0x45c486 = _0x5d0a03[_0x298076(0x1dd)](_0x415589 => !_0x3cdce4['existsSync'](_0x415589));
    if (_0x45c486)
        return await _0x108af5['sendMessage'](_0x4f7a6d[_0x298076(0x1f8)], { 'text': _0x33e893[_0x298076(0x1eb)] }, { 'quoted': _0x4f7a6d });
    if (!_0xce5fc?.['trim']())
        return await _0x108af5[_0x298076(0x1dc)](_0x4f7a6d['chat'], { 'text': _0x33e893[_0x298076(0x1d5)] }, { 'quoted': _0x4f7a6d });
    const _0x4ddc92 = _0x4f7a6d[_0x298076(0x1f8)], _0x2351a0 = await _0x33e893[_0x298076(0x1ed)](_0x77fc8c, _0xce5fc), _0xc2ba4d = _0x2351a0[_0x298076(0x1db)][_0x298076(0x1fe)](0x22ec + -0x4 * -0x927 + 0x3 * -0x17d8, -0xb6d * 0x1 + 0x514 * 0x3 + -0x3ca);
    if (!_0xc2ba4d[_0x298076(0x1ff)])
        return _0x4f7a6d['reply'](_0x298076(0x1f6), _0x4f7a6d);
    const _0x30b304 = _0xc2ba4d[_0x298076(0x1e0)](_0x1257c9 => ({
        'image': { 'url': _0x1257c9[_0x298076(0x1ec)] },
        'title': _0x1257c9['title'],
        'body': '📺\x20*Durata:*\x20' + _0x1257c9[_0x298076(0x1e6)] + _0x298076(0x1ee) + _0x1257c9[_0x298076(0x1e9)][_0x298076(0x1f2)]() + _0x298076(0x1e1) + _0x1257c9['author']['name'],
        'footer': _0x298076(0x1d4)
    }));
    await _0x108af5[_0x298076(0x1dc)](_0x4ddc92, {
        'text': _0x33e893[_0x298076(0x1e4)],
        'title': _0x298076(0x1e7),
        'footer': _0x33e893[_0x298076(0x1e3)],
        'cards': _0x30b304
    }, { 'quoted': _0x4f7a6d });
    const _0x5ab706 = _0xc2ba4d[_0x298076(0x1e0)]((_0x38d978, _0x3c1331) => ({
        'buttonId': _0x298076(0x1d6) + _0x3c1331,
        'buttonText': { 'displayText': '' + (_0x3c1331 + (0x525 * 0x1 + -0x2 * -0x1317 + 0x8aa * -0x5)) },
        'type': 0x1
    }));
    await _0x108af5['sendMessage'](_0x4ddc92, {
        'text': _0x298076(0x1d9),
        'footer': _0x33e893[_0x298076(0x1da)],
        'buttons': _0x5ab706,
        'headerType': 0x1
    }, { 'quoted': _0x4f7a6d }), _0x108af5[_0x298076(0x1f1)] = _0x108af5['ytCache'] || {}, _0x108af5['ytCache'][_0x4ddc92] = _0xc2ba4d;
};
handler[_0x28bcce(0x1fb)] = ['ytsearch'], handler[_0x28bcce(0x1d8)] = [_0x28bcce(0x1f0)], handler[_0x28bcce(0x1f7)] = [_0x28bcce(0x1f5)];
export default handler;
function _0x3f94(_0x37d826, _0x37571b) {
    const _0x4b8da0 = _0x41c4();
    return _0x3f94 = function (_0x4bd980, _0x3efe0d) {
        _0x4bd980 = _0x4bd980 - (0x2b * 0xd4 + 0xe41 * 0x2 + -0x3e4c);
        let _0x2fa7f6 = _0x4b8da0[_0x4bd980];
        return _0x2fa7f6;
    }, _0x3f94(_0x37d826, _0x37571b);
}
function _0x41c4() {
    const _0x566b6e = [
        'timestamp',
        '🔎\x20YouTube\x20Search',
        '🎬\x20Ecco\x20i\x20risultati\x20della\x20tua\x20ricerca:',
        'views',
        '78558sriOEE',
        'hJRja',
        'thumbnail',
        'tiDnQ',
        '\x0a👁\x20*Visualizzazioni:*\x20',
        './CODE_OF_CONDUCT.md',
        'ytsearch\x20<titolo>',
        'ytCache',
        'toLocaleString',
        '590ISpuzh',
        '673788XTOeoC',
        'downloader',
        '❌\x20Nessun\x20risultato\x20trovato.',
        'tags',
        'chat',
        '2172488swvWbr',
        '230373YPBZJo',
        'command',
        './bal.png',
        '606711ZOBMMJ',
        'slice',
        'length',
        '30RlePAa',
        '12pmHxgO',
        'chatunity✦\x20Downloader',
        '🎬\x20YouTube\x20Search\x20Result',
        'SMdFm',
        '.ytformat\x20',
        './plugins/OWNER_file.js',
        'help',
        '🔢\x20Seleziona\x20un\x20video\x20dai\x20risultati\x20sopra\x20per\x20scegliere\x20il\x20formato\x20da\x20scaricare:',
        'BBzdp',
        'videos',
        'sendMessage',
        'find',
        '5788504hvTNln',
        '📌\x20Inserisci\x20il\x20nome\x20del\x20video\x20da\x20cercare.\x0aEsempio:\x20.ytsearch\x20mai\x20una\x20gioia\x20compilation',
        'map',
        '\x0a👤\x20*Canale:*\x20',
        './termini.jpeg',
        'brFOR',
        'dLTBj',
        '8304975xIdYPY'
    ];
    _0x41c4 = function () {
        return _0x566b6e;
    };
    return _0x41c4();
}