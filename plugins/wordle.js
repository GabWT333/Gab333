const _0x356813 = _0x4500;
(function (_0x5bf70e, _0xaee475) {
    const _0x5d06b5 = _0x4500, _0x215a8e = _0x5bf70e();
    while (!![]) {
        try {
            const _0x3af2b9 = parseInt(_0x5d06b5(0x14f)) / (0x282 * -0xa + -0x7d * 0x16 + 0x23d3) + parseInt(_0x5d06b5(0x12c)) / (-0x1216 + 0x183 * -0x1 + 0x139b) * (-parseInt(_0x5d06b5(0x1fc)) / (-0xb9 * -0x1 + 0x1fe0 + -0x2096)) + parseInt(_0x5d06b5(0x22f)) / (-0x9f + -0x2a1 * 0xb + 0x1d8e) + -parseInt(_0x5d06b5(0x1a7)) / (-0x4a6 * -0x1 + 0x1f95 + 0x609 * -0x6) + parseInt(_0x5d06b5(0x13e)) / (0x233 * -0x10 + 0x7b * 0x2 + -0x2240 * -0x1) + -parseInt(_0x5d06b5(0x17c)) / (0x20fb + 0x8 * 0x5f + -0x2c * 0xd1) + parseInt(_0x5d06b5(0x248)) / (0xf71 * 0x1 + -0x5f7 + 0x326 * -0x3) * (parseInt(_0x5d06b5(0x179)) / (-0xb8d + 0x2625 + 0x1a8f * -0x1));
            if (_0x3af2b9 === _0xaee475)
                break;
            else
                _0x215a8e['push'](_0x215a8e['shift']());
        } catch (_0x13f862) {
            _0x215a8e['push'](_0x215a8e['shift']());
        }
    }
}(_0x520e, -0x306c3 + -0x31b31 + 0x4ee6 * 0x1a));
import { createCanvas } from 'canvas';
const ILDENARO = -0x4 * 0x46d + -0x7 * -0x463 + -0xc9d * 0x1, durata = 0x10576 + -0xa7db * 0x1 + 0x8cc5, PAROLE_WORDLE = [
        _0x356813(0x1dc),
        _0x356813(0x1f4),
        _0x356813(0x149),
        _0x356813(0x272),
        'AMICO',
        _0x356813(0x1cb),
        _0x356813(0x25b),
        _0x356813(0x14b),
        _0x356813(0x26e),
        _0x356813(0x1c4),
        _0x356813(0x171),
        'BARCA',
        _0x356813(0x224),
        _0x356813(0x24d),
        _0x356813(0x12e),
        _0x356813(0x1e8),
        _0x356813(0x252),
        'BRAVO',
        'BUONO',
        'CALDO',
        _0x356813(0x270),
        _0x356813(0x266),
        'CARNE',
        'CARTA',
        _0x356813(0x1d7),
        _0x356813(0x19c),
        _0x356813(0x131),
        'CHINA',
        'CIFRA',
        _0x356813(0x217),
        _0x356813(0x227),
        _0x356813(0x233),
        _0x356813(0x19f),
        _0x356813(0x1b2),
        _0x356813(0x163),
        _0x356813(0x24b),
        _0x356813(0x14d),
        _0x356813(0x1c3),
        'DITTA',
        _0x356813(0x1e6),
        _0x356813(0x247),
        _0x356813(0x13a),
        _0x356813(0x1a6),
        'ESAME',
        _0x356813(0x16f),
        'ELICA',
        _0x356813(0x137),
        'FESTA',
        _0x356813(0x234),
        _0x356813(0x232),
        _0x356813(0x18d),
        _0x356813(0x245),
        _0x356813(0x167),
        _0x356813(0x191),
        _0x356813(0x1f8),
        _0x356813(0x25d),
        'GENTE',
        _0x356813(0x1b7),
        _0x356813(0x202),
        'GRADO',
        _0x356813(0x265),
        _0x356813(0x1cc),
        _0x356813(0x1ea),
        _0x356813(0x1b5),
        'LATTE',
        _0x356813(0x260),
        _0x356813(0x218),
        _0x356813(0x156),
        _0x356813(0x1ff),
        _0x356813(0x183),
        _0x356813(0x211),
        _0x356813(0x1a3),
        'MONDO',
        _0x356813(0x229),
        _0x356813(0x243),
        _0x356813(0x19d),
        'MEZZO',
        _0x356813(0x250),
        _0x356813(0x1f2),
        'MONTE',
        _0x356813(0x222),
        _0x356813(0x1a9),
        _0x356813(0x1bc),
        _0x356813(0x17b),
        'NULLO',
        _0x356813(0x1f3),
        _0x356813(0x1e0),
        _0x356813(0x1a5),
        _0x356813(0x196),
        _0x356813(0x241),
        _0x356813(0x198),
        _0x356813(0x16e),
        _0x356813(0x23f),
        'PASTA',
        _0x356813(0x26c),
        _0x356813(0x192),
        _0x356813(0x20c),
        _0x356813(0x1d6),
        _0x356813(0x13f),
        _0x356813(0x14a),
        _0x356813(0x193),
        'RICCO',
        _0x356813(0x142),
        _0x356813(0x1a4),
        _0x356813(0x246),
        _0x356813(0x22c),
        _0x356813(0x17e),
        'SANTO',
        _0x356813(0x165),
        'SCALE',
        _0x356813(0x166),
        _0x356813(0x194),
        'SOTTO',
        _0x356813(0x169),
        _0x356813(0x235),
        'TEMPO',
        _0x356813(0x13d),
        _0x356813(0x20a),
        _0x356813(0x22a),
        _0x356813(0x225),
        _0x356813(0x262),
        'UNICO',
        _0x356813(0x22d),
        _0x356813(0x25f),
        _0x356813(0x15d),
        _0x356813(0x20d),
        'UTILE',
        _0x356813(0x26a),
        'VENTO',
        'VINO',
        _0x356813(0x259),
        _0x356813(0x1e2),
        _0x356813(0x204),
        'VUOTO',
        _0x356813(0x1f6),
        _0x356813(0x221),
        'ZITTO',
        _0x356813(0x1f7),
        _0x356813(0x226),
        'ZOPPO',
        _0x356813(0x1ac)
    ];
class WordleGame {
    constructor(_0x48b7ac, _0x34bdcc) {
        const _0x34be39 = _0x356813, _0x127279 = { 'BBrYZ': _0x34be39(0x184) }, _0x2019d2 = _0x127279[_0x34be39(0x147)][_0x34be39(0x1b1)]('|');
        let _0x347e1c = -0x13 * 0x1c1 + -0x2 * 0xf + 0x2171;
        while (!![]) {
            switch (_0x2019d2[_0x347e1c++]) {
            case '0':
                this[_0x34be39(0x17f)] = _0x34bdcc;
                continue;
            case '1':
                this['timeoutId'] = null;
                continue;
            case '2':
                this[_0x34be39(0x1d4)] = ![];
                continue;
            case '3':
                this['attempts'] = [];
                continue;
            case '4':
                this[_0x34be39(0x140)] = 0x166f * 0x1 + -0x21dd * -0x1 + -0x3846;
                continue;
            case '5':
                this['id'] = null;
                continue;
            case '6':
                this[_0x34be39(0x141)] = _0x48b7ac['toUpperCase']();
                continue;
            case '7':
                this[_0x34be39(0x1d9)] = Date[_0x34be39(0x174)]();
                continue;
            case '8':
                this[_0x34be39(0x1ef)] = ![];
                continue;
            }
            break;
        }
    }
    ['guess'](_0x3bd37c) {
        const _0x3b5e39 = _0x356813, _0x41d1ba = {
                'cantD': function (_0xe74e39, _0x4bd7c8) {
                    return _0xe74e39 / _0x4bd7c8;
                },
                'YRLei': function (_0x1ef17b, _0x233231) {
                    return _0x1ef17b - _0x233231;
                },
                'JuYhX': _0x3b5e39(0x1b6),
                'SMZWq': function (_0x2b99da, _0x42b6e4) {
                    return _0x2b99da !== _0x42b6e4;
                },
                'QmWRh': _0x3b5e39(0x15c),
                'fDtHs': _0x3b5e39(0x153),
                'bccVR': function (_0x23c8d3, _0x4b33b7) {
                    return _0x23c8d3 === _0x4b33b7;
                },
                'cpNdO': _0x3b5e39(0x187),
                'qREyc': _0x3b5e39(0x201)
            };
        if (this['gameOver'])
            return { 'error': _0x41d1ba[_0x3b5e39(0x231)] };
        const _0x174840 = _0x3bd37c[_0x3b5e39(0x1c6)]()['trim']();
        if (_0x41d1ba[_0x3b5e39(0x1ab)](_0x174840[_0x3b5e39(0x164)], 0xa12 * 0x2 + -0x2e8 * 0x2 + -0x63 * 0x25))
            return { 'error': _0x41d1ba[_0x3b5e39(0x1e3)] };
        if (!/^[A-Z]+$/[_0x3b5e39(0x1c2)](_0x174840))
            return { 'error': _0x41d1ba[_0x3b5e39(0x162)] };
        const _0x39d869 = this[_0x3b5e39(0x1ec)](_0x174840);
        this[_0x3b5e39(0x242)][_0x3b5e39(0x1fe)]({
            'word': _0x174840,
            'result': _0x39d869
        });
        if (_0x41d1ba[_0x3b5e39(0x1b4)](_0x174840, this[_0x3b5e39(0x141)])) {
            if (_0x41d1ba[_0x3b5e39(0x1ab)](_0x41d1ba[_0x3b5e39(0x1dd)], _0x41d1ba['qREyc']))
                this['gameOver'] = !![], this[_0x3b5e39(0x1ef)] = !![];
            else {
                const _0x2c5fac = _0x40c4d7[_0x3b5e39(0x138)](_0x41d1ba[_0x3b5e39(0x21c)](_0x41d1ba[_0x3b5e39(0x154)](_0x30000c, _0x41d1ba[_0x3b5e39(0x154)](_0x58e4fc, _0x3a2ab5)), 0x117 * 0x1 + 0x36b * -0x6 + 0x1753));
                return _0x45da34['reply'](_0x2ee396[_0x3b5e39(0x1ba)], _0x3b5e39(0x271) + _0x2c5fac + _0x3b5e39(0x1c5), _0x277a2e);
            }
        } else
            this[_0x3b5e39(0x242)][_0x3b5e39(0x164)] >= this[_0x3b5e39(0x140)] && (this[_0x3b5e39(0x1d4)] = !![]);
        return { 'success': !![] };
    }
    [_0x356813(0x1ec)](_0x730abc) {
        const _0x59db79 = _0x356813, _0x24f708 = {
                'uaCMI': _0x59db79(0x1cf),
                'kMhaW': function (_0xbb5713, _0x3fc341) {
                    return _0xbb5713 === _0x3fc341;
                },
                'vmKEB': 'correct',
                'Ocsuy': function (_0x340b7d, _0x5bfbf6) {
                    return _0x340b7d === _0x5bfbf6;
                },
                'QrKGV': function (_0x5ed4fd, _0x1dbf11) {
                    return _0x5ed4fd < _0x1dbf11;
                },
                'EUWWj': function (_0x4b23f6, _0x4bd014) {
                    return _0x4b23f6 === _0x4bd014;
                },
                'anIWb': 'vbGVp',
                'lZWkA': function (_0x59aae3, _0xc2c09e) {
                    return _0x59aae3 === _0xc2c09e;
                },
                'HPbkp': function (_0x40eb5a, _0x277873) {
                    return _0x40eb5a > _0x277873;
                },
                'XVlyj': _0x59db79(0x23c)
            }, _0x2ae43c = this[_0x59db79(0x141)][_0x59db79(0x1b1)](''), _0x2c8c34 = _0x730abc['split'](''), _0x420ffa = new Array(-0x2681 + 0x336 + -0x8d4 * -0x4)['fill'](null), _0x34ed9a = {};
        for (const _0x345722 of _0x2ae43c) {
            _0x34ed9a[_0x345722] = (_0x34ed9a[_0x345722] || 0x1877 + 0xfe3 * 0x1 + -0x812 * 0x5) + (0x6f6 * 0x1 + 0x1 * -0x2099 + 0x19a4 * 0x1);
        }
        for (let _0x429eea = -0x1c19 * 0x1 + -0x43 * -0x43 + 0xa90; _0x429eea < -0x4fb + 0x142f + -0xf2f; _0x429eea++) {
            _0x24f708['Ocsuy'](_0x2c8c34[_0x429eea], _0x2ae43c[_0x429eea]) && (_0x420ffa[_0x429eea] = _0x24f708[_0x59db79(0x254)], _0x34ed9a[_0x2c8c34[_0x429eea]]--);
        }
        for (let _0x4797e5 = -0x2501 + 0x185f + 0x4d * 0x2a; _0x24f708[_0x59db79(0x23d)](_0x4797e5, -0x2 * -0xde5 + -0x1 * 0x2641 + -0x4 * -0x29f); _0x4797e5++) {
            _0x24f708[_0x59db79(0x1e4)](_0x24f708['anIWb'], 'fmfOg') ? (_0x6f9473[_0x3a7a4a] = _0x24f708[_0x59db79(0x143)], _0x830a40[_0x495e72[_0x5bca2c]]--) : _0x24f708[_0x59db79(0x24f)](_0x420ffa[_0x4797e5], null) && (_0x24f708[_0x59db79(0x1c8)](_0x34ed9a[_0x2c8c34[_0x4797e5]], 0x24c4 + -0x8ef * 0x1 + 0x1db * -0xf) ? _0x24f708['XVlyj'] !== _0x59db79(0x23c) ? _0x24f708[_0x59db79(0x21a)](_0x1d1c32[_0x547ff1], _0xa8ce66[_0x5179d3]) && (_0x203abc[_0x57b196] = _0x24f708[_0x59db79(0x254)], _0x9146ae[_0x12f2da[_0x1fb8bc]]--) : (_0x420ffa[_0x4797e5] = _0x24f708[_0x59db79(0x143)], _0x34ed9a[_0x2c8c34[_0x4797e5]]--) : _0x420ffa[_0x4797e5] = _0x59db79(0x1d2));
        }
        return _0x420ffa;
    }
    async [_0x356813(0x135)]() {
        const _0x23f5c2 = _0x356813, _0xc6f738 = {
                'KGKfq': function (_0xc18554, _0x2294b8) {
                    return _0xc18554 + _0x2294b8;
                },
                'fNaIb': function (_0x117217, _0x4a8176) {
                    return _0x117217 * _0x4a8176;
                },
                'lmCNA': function (_0x4a2481, _0x24b0c5) {
                    return _0x4a2481 * _0x24b0c5;
                },
                'jDMNK': function (_0x38d81c, _0x2e748c) {
                    return _0x38d81c * _0x2e748c;
                },
                'ENcGS': function (_0x3ad105, _0x23ab7c) {
                    return _0x3ad105 * _0x23ab7c;
                },
                'yLJMi': _0x23f5c2(0x23a),
                'BQjFU': '#3A3A3C',
                'UcTkc': _0x23f5c2(0x157),
                'Pntuv': _0x23f5c2(0x133),
                'kxmMV': function (_0x4edf6d, _0x2f4f4b) {
                    return _0x4edf6d / _0x2f4f4b;
                },
                'aEkDi': function (_0x3ef3b6, _0x4b2ba8) {
                    return _0x3ef3b6 / _0x4b2ba8;
                },
                'FskTd': function (_0x16cd9a, _0x94eb4e) {
                    return _0x16cd9a / _0x94eb4e;
                },
                'hdtVW': _0x23f5c2(0x180),
                'mHgvP': _0x23f5c2(0x146),
                'yMUPm': function (_0x15c0d3, _0x2c472d) {
                    return _0x15c0d3 < _0x2c472d;
                },
                'KTGcI': function (_0x3b7af8, _0x4134c8) {
                    return _0x3b7af8 * _0x4134c8;
                },
                'unjzd': _0x23f5c2(0x177),
                'loVIg': function (_0x6e5296, _0x2085b4) {
                    return _0x6e5296 + _0x2085b4;
                },
                'AFXET': _0x23f5c2(0x176)
            }, _0x4053fb = 0xf7a + -0x61a + -0x91f, _0x2d2b2d = 0x11ff * -0x2 + 0xc6 * 0x25 + -0x1 * -0x76a, _0x3970e2 = 0xda * -0x25 + 0x1f * 0x83 + -0x1 * -0xfad, _0x17df9f = 0xfe * 0x26 + -0x132a + -0x1276, _0x394103 = _0xc6f738['KGKfq'](_0xc6f738['fNaIb'](-0x18a1 + -0x33e + 0x22 * 0xd2, _0x4053fb), _0xc6f738['lmCNA'](-0x19a1 + -0x13e4 + -0x1 * -0x2d89, _0x2d2b2d)), _0x241141 = _0xc6f738[_0x23f5c2(0x18c)](_0xc6f738[_0x23f5c2(0x256)](this[_0x23f5c2(0x140)], _0x4053fb), _0xc6f738[_0x23f5c2(0x214)](this[_0x23f5c2(0x140)] - (-0x41 + -0x1609 * -0x1 + -0x15c7 * 0x1), _0x2d2b2d)), _0x5729b5 = _0xc6f738[_0x23f5c2(0x18c)](_0x394103, _0x17df9f * (0x1 * 0x79d + -0x3 * 0x6bc + 0xc99 * 0x1)), _0x150da8 = _0x241141 + _0xc6f738['ENcGS'](_0x17df9f, -0x22b4 + 0x15b * -0x12 + 0x3b1c), _0x3583f2 = createCanvas(_0x5729b5, _0x150da8), _0x3e0c0b = _0x3583f2[_0x23f5c2(0x15a)]('2d'), _0x4fff24 = {
                'bg1': _0xc6f738[_0x23f5c2(0x21e)],
                'bg2': _0x23f5c2(0x12f),
                'border': _0xc6f738[_0x23f5c2(0x24e)],
                'text': _0xc6f738[_0x23f5c2(0x17d)],
                'correct': _0x23f5c2(0x20f),
                'present': _0x23f5c2(0x15f),
                'absent': _0xc6f738['BQjFU'],
                'shadow': _0xc6f738[_0x23f5c2(0x1cd)]
            }, _0x1cb879 = _0x3e0c0b['createRadialGradient'](_0x5729b5 / (0x8e * 0xe + -0x922 * -0x4 + -0x2c4a), _0xc6f738['kxmMV'](_0x150da8, 0x1465 + -0x1bfd + -0x8b * -0xe), 0xa * 0x101 + 0xc89 + -0x1693, _0xc6f738[_0x23f5c2(0x139)](_0x5729b5, 0x1ff7 * 0x1 + -0x771 + 0x4 * -0x621), _0xc6f738[_0x23f5c2(0x22e)](_0x150da8, -0xac8 + 0x1736 + -0x6 * 0x212), _0x5729b5 / (0x22c * 0xb + 0x2696 + -0x14d3 * 0x3 + 0.5));
        _0x1cb879[_0x23f5c2(0x240)](0xbdc + 0xfb8 + -0xdca * 0x2, _0x4fff24[_0x23f5c2(0x26f)]), _0x1cb879[_0x23f5c2(0x240)](0x6c7 + -0xbe5 * 0x3 + 0x1ce9, _0x4fff24[_0x23f5c2(0x12b)]), _0x3e0c0b[_0x23f5c2(0x170)] = _0x1cb879, _0x3e0c0b[_0x23f5c2(0x264)](-0x6 * 0x5c3 + 0x22ec + -0x5a, 0x1 * -0xcb9 + -0x1268 + 0x1f21, _0x5729b5, _0x150da8), _0x3e0c0b[_0x23f5c2(0x210)] = _0xc6f738[_0x23f5c2(0x1fa)], _0x3e0c0b[_0x23f5c2(0x1eb)] = _0xc6f738[_0x23f5c2(0x209)], _0x3e0c0b[_0x23f5c2(0x188)] = _0x23f5c2(0x212), _0x3e0c0b[_0x23f5c2(0x26d)] = _0x4fff24[_0x23f5c2(0x261)], _0x3e0c0b[_0x23f5c2(0x21f)] = -0xc66 + 0x2d5 + 0x995, _0x3e0c0b[_0x23f5c2(0x23e)] = 0x40b + -0x1c8e + 0x1885, _0x3e0c0b['shadowOffsetY'] = -0x2 * 0x35d + 0x1 * 0xb2a + -0x46e;
        for (let _0x1e908d = 0x75f + 0x1c4b * 0x1 + -0x23aa; _0xc6f738[_0x23f5c2(0x1fb)](_0x1e908d, this[_0x23f5c2(0x140)]); _0x1e908d++) {
            for (let _0x3e5dc3 = 0x1fc4 + 0x2 * 0x3cb + -0x275a; _0xc6f738[_0x23f5c2(0x1fb)](_0x3e5dc3, -0x15f0 + -0x131 * -0xb + -0x1 * -0x8da); _0x3e5dc3++) {
                const _0x19b920 = _0xc6f738[_0x23f5c2(0x18c)](_0x17df9f, _0xc6f738['KTGcI'](_0x3e5dc3, _0x4053fb + _0x2d2b2d)), _0x1461a6 = _0xc6f738[_0x23f5c2(0x18c)](_0x17df9f, _0xc6f738[_0x23f5c2(0x256)](_0x1e908d, _0x4053fb + _0x2d2b2d));
                _0x3e0c0b[_0x23f5c2(0x21d)] = _0x4fff24[_0x23f5c2(0x237)], _0x3e0c0b[_0x23f5c2(0x18b)] = 0x31 * -0x34 + 0x299 * -0x3 + 0x5eb * 0x3;
                if (this[_0x23f5c2(0x242)][_0x1e908d]) {
                    const _0x552052 = this[_0x23f5c2(0x242)][_0x1e908d][_0x23f5c2(0x268)][_0x3e5dc3], _0x55b3ed = this[_0x23f5c2(0x242)][_0x1e908d]['result'][_0x3e5dc3];
                    _0x3e0c0b[_0x23f5c2(0x170)] = _0x4fff24[_0x55b3ed], _0x3e0c0b['beginPath'](), _0x3e0c0b['roundRect'](_0x19b920, _0x1461a6, _0x4053fb, _0x4053fb, _0x3970e2), _0x3e0c0b[_0x23f5c2(0x16d)](), _0x3e0c0b['save'](), _0x3e0c0b[_0x23f5c2(0x26d)] = _0xc6f738[_0x23f5c2(0x178)], _0x3e0c0b[_0x23f5c2(0x170)] = _0x4fff24[_0x23f5c2(0x148)], _0x3e0c0b[_0x23f5c2(0x1da)](_0x552052, _0xc6f738[_0x23f5c2(0x1f0)](_0x19b920, _0x4053fb / (-0x13f7 + 0x1963 + -0x16 * 0x3f)), _0xc6f738[_0x23f5c2(0x18c)](_0x1461a6 + _0x4053fb / (0x11 * -0x1f8 + -0xfda + 0x3154), 0x9ad * -0x4 + 0x1 * -0x2ad + -0x6 * -0x6e6)), _0x3e0c0b[_0x23f5c2(0x155)]();
                } else {
                    const _0x4b3e5a = _0xc6f738['AFXET'][_0x23f5c2(0x1b1)]('|');
                    let _0x3403ab = -0x19d4 + 0xf9b + -0xa39 * -0x1;
                    while (!![]) {
                        switch (_0x4b3e5a[_0x3403ab++]) {
                        case '0':
                            _0x3e0c0b['fill']();
                            continue;
                        case '1':
                            _0x3e0c0b['fillStyle'] = _0x4fff24['bg1'];
                            continue;
                        case '2':
                            _0x3e0c0b['roundRect'](_0x19b920, _0x1461a6, _0x4053fb, _0x4053fb, _0x3970e2);
                            continue;
                        case '3':
                            _0x3e0c0b[_0x23f5c2(0x238)]();
                            continue;
                        case '4':
                            _0x3e0c0b[_0x23f5c2(0x1ee)]();
                            continue;
                        }
                        break;
                    }
                }
            }
        }
        return _0x3583f2[_0x23f5c2(0x267)](_0x23f5c2(0x181));
    }
}
global['wordleGame'] = global[_0x356813(0x190)] || {};
function _0x520e() {
    const _0xa2d469 = [
        'cooldowns',
        '│\x20『\x20⏱️\x20』\x20`Tempo:`\x20*',
        'chat',
        'ㅤ⋆｡˚『\x20╭\x20`GAME\x20OVER!`\x20╯\x20』˚｡⋆\x0a╭\x0a',
        'NELLO',
        '│\x20『\x20🎁\x20』\x20`Ricompensa:`\x20*',
        'bLdOt',
        'tags',
        'ㅤ⋆｡˚『\x20╭\x20`PARTITA\x20INTERROTTA`\x20╯\x20』˚｡⋆\x0a╭\x0a',
        'MOZyZ',
        'test',
        'DUOMO',
        'AVERE',
        '\x20secondi\x20prima\x20di\x20avviare\x20un\x20nuovo\x20gioco!*',
        'toUpperCase',
        'UvKFi',
        'HPbkp',
        '│\x20『\x20🎯\x20』\x20`La\x20parola\x20era:`\x0a『\x20‼️\x20』\x20*`',
        'quoted',
        'ANIMA',
        'GUSTO',
        'Pntuv',
        '│\x20『\x20💡\x20』\x20`Non\x20arrenderti!`\x0a',
        'present',
        'eHvrA',
        'stringify',
        'absent',
        'ㅤ⋆｡˚『\x20╭\x20`WORDLE`\x20╯\x20』˚｡⋆\x0a╭\x0a',
        'gameOver',
        'random',
        'PIZZA',
        'CAUSA',
        'groupMetadata',
        'startTime',
        'fillText',
        'szIsP',
        'ABITO',
        'cpNdO',
        'jrKgw',
        'zsbIE',
        'OLTRE',
        'vare\x20✧\x20bot',
        'VOCE',
        'QmWRh',
        'EUWWj',
        'TaIKF',
        'EBANO',
        'GnMSo',
        'BIRRA',
        'mHiIl',
        'HOTEL',
        'textAlign',
        'calculateResult',
        'wordle',
        'beginPath',
        'won',
        'loVIg',
        'data',
        'MILLE',
        'NUOVO',
        'ACQUA',
        'gQBLb',
        'VALLE',
        'ZUCCA',
        'GATTO',
        'mDUkI',
        'hdtVW',
        'yMUPm',
        '14907gzAJFx',
        '❌\x20*Rispondi\x20con\x20una\x20parola\x20valida\x20di\x205\x20lettere!*',
        'push',
        'LIBRO',
        '🎯\x20Gioca\x20Ancora!',
        'HJlEU',
        'GOMMA',
        'PwaKc',
        'VOLO',
        'euro',
        'hOlAZ',
        '│\x20『\x20⏱️\x20』\x20`Hai\x201\x20minuto!`\x0a',
        'itrNh',
        'mHgvP',
        'TORTA',
        'participants',
        'PIANO',
        'USCIO',
        'log',
        '#538D4E',
        'font',
        'LISTA',
        'middle',
        'XCodc',
        'jDMNK',
        '│\x20『\x20🎯\x20』\x20`Parola:`\x20*',
        'find',
        'DANTE',
        'LEGGE',
        'ZSvcQ',
        'kMhaW',
        'giFaA',
        'cantD',
        'strokeStyle',
        'yLJMi',
        'shadowBlur',
        '€\x20e\x20',
        'ZEBRA',
        'MORTE',
        'wordle_',
        'BARBA',
        'TURNO',
        'ZAINO',
        'DANZA',
        'giochi',
        'MADRE',
        'TUTTO',
        'KKtLK',
        'REGNO',
        'UMORE',
        'FskTd',
        '99896epqIaN',
        'xwmZo',
        'JuYhX',
        'FIUME',
        'DENTE',
        'FETTA',
        'SPORT',
        'gqCUq',
        'border',
        'stroke',
        'round',
        '#1a1a1c',
        'group',
        'myasb',
        'QrKGV',
        'shadowOffsetX',
        'PARTE',
        'addColorStop',
        'OVEST',
        'attempts',
        'MARCO',
        '`*\x0a',
        'FOLLA',
        'ROTTO',
        'EPOCA',
        '144OWdudC',
        'LwXQO',
        'trim',
        'DONNA',
        'wPyYc',
        'BASSO',
        'BQjFU',
        'lZWkA',
        'METRO',
        'uzPNO',
        'BOSCO',
        'mMyyB',
        'vmKEB',
        '*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*',
        'lmCNA',
        'ajPkA',
        '❌\x20*Questo\x20comando\x20può\x20essere\x20usato\x20solo\x20dagli\x20admin\x20o\x20da\x20chi\x20ha\x20iniziato\x20la\x20partita!*',
        'VISTA',
        'wcZAk',
        'AMORE',
        'vHbPx',
        'GAMBA',
        '│\x20『\x20📊\x20』\x20`Tentativi:`\x20*',
        'UNITO',
        'LARGO',
        'shadow',
        'TESTA',
        'reply',
        'fillRect',
        'GRECO',
        'CAMPO',
        'toBuffer',
        'word',
        'Errore\x20nell\x27avvio\x20del\x20gioco\x20Wordle:',
        'VERDE',
        'register',
        'PAURA',
        'shadowColor',
        'ASPRO',
        'bg2',
        'CAFFE',
        '『\x20⏳\x20』\x20*Aspetta\x20ancora\x20',
        'ALBUM',
        'bg1',
        '82GswkWr',
        'SxXeo',
        'BELLO',
        '#272729',
        'GhNPK',
        'CERTO',
        'MYTMT',
        'rgba(0,\x200,\x200,\x200.3)',
        'floor',
        'generateBoardImage',
        'sender',
        'FERRO',
        'ceil',
        'aEkDi',
        'EREDE',
        'ZZxXN',
        'IFceq',
        'TERRA',
        '342486xQXIMQ',
        'QUOTA',
        'maxAttempts',
        'targetWord',
        'ROSSO',
        'uaCMI',
        'IlYFp',
        'ㅤ⋆｡˚『\x20╭\x20`TEMPO\x20SCADUTO!`\x20╯\x20』˚｡⋆\x0a╭\x0a',
        'center',
        'BBrYZ',
        'text',
        'AIUTO',
        'QUASI',
        'ARENA',
        '『\x20⚠️\x20』\x20`C\x27è\x20già\x20una\x20partita\x20attiva!`',
        'DRAGO',
        'LicRy',
        '157574zxXFxv',
        '⚠️\x20Non\x20c\x27è\x20nessuna\x20partita\x20attiva\x20in\x20questo\x20gruppo!',
        'admin',
        'NNrDk',
        'La\x20parola\x20deve\x20contenere\x20solo\x20lettere\x20dell\x27alfabeto\x20(A-Z)!',
        'YRLei',
        'restore',
        'LEONE',
        '#FFFFFF',
        'key',
        'timeoutId',
        'getContext',
        '.wordle',
        'La\x20parola\x20deve\x20essere\x20di\x205\x20lettere!',
        'USATO',
        'AjBxP',
        '#B59F3B',
        'LodOd',
        '│\x20『\x20📝\x20』\x20`Tentativo:`\x20*',
        'fDtHs',
        'DOLCE',
        'length',
        'SALTO',
        'SENSO',
        'FORMA',
        '[WORDLE\x20CLEANUP]\x20Rimuovendo\x20gioco\x20inattivo\x20nella\x20chat\x20',
        'SPESA',
        '7|1|2|8|5|6|3|4|0',
        'pCfbQ',
        'command',
        'fill',
        'PANDA',
        'ENTRO',
        'fillStyle',
        'BANCO',
        'cwFRB',
        'users',
        'now',
        '│\x20『\x20⏱️\x20』\x20`1\x20minuto`\x20di\x20tempo\x20`per\x20round`\x0a',
        '1|4|2|0|3',
        'transparent',
        'unjzd',
        '193113sFtmEA',
        'jLkUk',
        'NOZZE',
        '1664859esKDkM',
        'UcTkc',
        'RAZZA',
        'playerId',
        'bold\x2040px\x20\x22Clear\x20Sans\x22,\x20\x22Helvetica\x20Neue\x22,\x20Arial,\x20sans-serif',
        'image/png',
        'entries',
        'LINEA',
        '6|3|4|2|8|7|5|0|1',
        'ㅤ⋆｡˚『\x20╭\x20`HAI\x20VINTO!`\x20╯\x20』˚｡⋆\x0a╭\x0a',
        'zNYAB',
        'gVuVH',
        'textBaseline',
        'WHWdj',
        'OrLxp',
        'lineWidth',
        'KGKfq',
        'FIORE',
        'exp',
        'yRNYg',
        'wordleGame',
        'FORTE',
        'PESCE',
        'RESTO',
        'SOLDI',
        'quick_reply',
        'OCCHI',
        'SKnjz',
        'PADRE',
        'fromMe',
        'before',
        'XUgzx',
        'CERCA',
        'MASSA',
        'error',
        'DIECI',
        's*\x0a',
        'onilX',
        'roQZJ',
        'LUNGO',
        'RUSSO',
        'OPERA',
        'EXTRA',
        '305245AHwaqY',
        'ipyym',
        'NOTTE',
        'KfeqJ',
        'SMZWq',
        'ZAPPA',
        'WmdEy',
        'SIorS',
        'catch',
        'help',
        'split',
        'DISCO',
        'sendMessage',
        'bccVR',
        'ISOLA',
        'La\x20partita\x20è\x20già\x20terminata!\x20Usa\x20`.wordle`\x20per\x20iniziarne\x20una\x20nuova.',
        'GIOCO'
    ];
    _0x520e = function () {
        return _0xa2d469;
    };
    return _0x520e();
}
async function handleGameTimeout(_0x163b5e, _0x8d91b9, _0x45f5cf, _0x4fbe4f, _0x1e0359, _0x185cf5) {
    const _0x585b23 = _0x356813, _0x21d0d0 = {
            'pCfbQ': _0x585b23(0x195),
            'SxXeo': _0x585b23(0x200),
            'NNrDk': 'vare\x20✧\x20bot',
            'GhNPK': '[WORDLE]\x20Errore\x20durante\x20la\x20gestione\x20del\x20timeout:'
        }, _0x5b7f5d = global[_0x585b23(0x190)]?.[_0x8d91b9];
    if (!_0x5b7f5d || _0x5b7f5d['id'] !== _0x45f5cf)
        return;
    try {
        _0x5b7f5d['gameOver'] = !![];
        let _0x42a170 = _0x585b23(0x145);
        _0x42a170 += _0x585b23(0x215) + _0x1e0359 + '*\x0a', _0x42a170 += '│\x20『\x20💡\x20』\x20_*Sii\x20piu\x20veloce*_\x0a', _0x42a170 += '*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*';
        const _0x176638 = [{
                'name': _0x21d0d0[_0x585b23(0x16b)],
                'buttonParamsJson': JSON[_0x585b23(0x1d1)]({
                    'display_text': _0x21d0d0[_0x585b23(0x12d)],
                    'id': _0x585b23(0x15b)
                })
            }];
        await _0x163b5e['sendMessage'](_0x8d91b9, {
            'text': _0x42a170,
            'footer': _0x21d0d0[_0x585b23(0x152)],
            'interactiveButtons': _0x176638
        }), delete global[_0x585b23(0x190)][_0x8d91b9];
    } catch (_0x50c226) {
        console[_0x585b23(0x19e)](_0x21d0d0[_0x585b23(0x130)], _0x50c226), delete global['wordleGame'][_0x8d91b9];
    }
}
async function startGame(_0x1cc82c, _0xf3df3c, _0x175d9f) {
    const _0x42a3c5 = _0x356813, _0x5a1ce4 = {
            'CfZPb': function (_0x4a9efb, _0x53524a, _0x2c79a8, _0x42f1f8, _0xf974ff, _0x4c2b33, _0x39d389) {
                return _0x4a9efb(_0x53524a, _0x2c79a8, _0x42f1f8, _0xf974ff, _0x4c2b33, _0x39d389);
            },
            'KfeqJ': function (_0x1a7dd8, _0x4fdfa6, _0xf11a1b, _0xd80994, _0x4e276a, _0xb50323, _0x4fa954) {
                return _0x1a7dd8(_0x4fdfa6, _0xf11a1b, _0xd80994, _0x4e276a, _0xb50323, _0x4fa954);
            },
            'giFaA': _0x42a3c5(0x14c),
            'cwFRB': function (_0x3a9aa3, _0x1e426b) {
                return _0x3a9aa3 < _0x1e426b;
            },
            'ZSvcQ': function (_0x20a2f1, _0x26861f) {
                return _0x20a2f1 - _0x26861f;
            },
            'qmUNj': function (_0x569b19, _0x31859d) {
                return _0x569b19 - _0x31859d;
            },
            'vHbPx': function (_0x17a1a9, _0x4a37f5) {
                return _0x17a1a9 - _0x4a37f5;
            },
            'roQZJ': function (_0x4af1a2, _0x4eaeff) {
                return _0x4af1a2 * _0x4eaeff;
            },
            'mLksH': function (_0x42ed77, _0x4fe292) {
                return _0x42ed77 === _0x4fe292;
            },
            'IlYFp': _0x42a3c5(0x1d0),
            'OrLxp': _0x42a3c5(0x1e5),
            'gqCUq': _0x42a3c5(0x269)
        }, _0x298c38 = _0xf3df3c[_0x42a3c5(0x1ba)];
    if (global[_0x42a3c5(0x190)]?.[_0x298c38])
        return _0x1cc82c['reply'](_0xf3df3c[_0x42a3c5(0x1ba)], _0x5a1ce4[_0x42a3c5(0x21b)], _0xf3df3c);
    const _0x51f49c = _0x42a3c5(0x223) + _0x298c38;
    global[_0x42a3c5(0x1b8)] = global[_0x42a3c5(0x1b8)] || {};
    const _0x290833 = global[_0x42a3c5(0x1b8)][_0x51f49c] || -0x1 * -0x1215 + -0x46b + -0xdaa, _0x39fc2d = Date[_0x42a3c5(0x174)](), _0x53926b = -0x1c1d + -0x119 * -0x5 + -0x8e * -0x4c;
    if (_0x5a1ce4[_0x42a3c5(0x172)](_0x5a1ce4[_0x42a3c5(0x219)](_0x39fc2d, _0x290833), _0x53926b)) {
        const _0x112f0d = Math[_0x42a3c5(0x138)](_0x5a1ce4['qmUNj'](_0x53926b, _0x5a1ce4[_0x42a3c5(0x25c)](_0x39fc2d, _0x290833)) / (0x443 * 0x2 + -0x11b * -0x20 + -0x27fe));
        return _0x1cc82c[_0x42a3c5(0x263)](_0xf3df3c[_0x42a3c5(0x1ba)], _0x42a3c5(0x271) + _0x112f0d + _0x42a3c5(0x1c5), _0xf3df3c);
    }
    try {
        const _0x54e40e = PAROLE_WORDLE[Math[_0x42a3c5(0x134)](_0x5a1ce4[_0x42a3c5(0x1a2)](Math[_0x42a3c5(0x1d5)](), PAROLE_WORDLE[_0x42a3c5(0x164)]))], _0x30857d = new WordleGame(_0x54e40e, _0xf3df3c['sender']), _0x528202 = await _0x30857d[_0x42a3c5(0x135)]();
        let _0x213770 = 'ㅤ⋆｡˚『\x20╭\x20`WORDLE`\x20╯\x20』˚｡⋆\x0a╭\x0a';
        _0x213770 += '│\x20『\x20🎯\x20』\x20`Indovina`\x20*la\x20parola\x20di\x20`5\x20lettere.`*\x0a', _0x213770 += _0x42a3c5(0x175), _0x213770 += _0x42a3c5(0x255);
        let _0x15634a = await _0x1cc82c[_0x42a3c5(0x1b3)](_0x298c38, {
            'image': _0x528202,
            'caption': _0x213770,
            'footer': 'vare\x20✧\x20bot'
        }, { 'quoted': _0xf3df3c });
        global[_0x42a3c5(0x190)][_0x298c38] = _0x30857d, global[_0x42a3c5(0x190)][_0x298c38]['id'] = _0x15634a[_0x42a3c5(0x158)]['id'], global[_0x42a3c5(0x1b8)][_0x51f49c] = _0x39fc2d;
        const _0x128276 = setTimeout(() => {
            const _0x42f30e = _0x42a3c5;
            _0x5a1ce4['CfZPb'](handleGameTimeout, _0x1cc82c, _0x298c38, _0x15634a[_0x42f30e(0x158)]['id'], _0x175d9f, _0x54e40e, _0xf3df3c[_0x42f30e(0x136)]);
        }, durata);
        global[_0x42a3c5(0x190)][_0x298c38]['timeoutId'] = _0x128276;
    } catch (_0x7234d1) {
        _0x5a1ce4['mLksH'](_0x5a1ce4[_0x42a3c5(0x144)], _0x5a1ce4[_0x42a3c5(0x18a)]) ? _0x5a1ce4[_0x42a3c5(0x1aa)](_0x29ff88, _0xd9a8b1, _0xcb83e2, _0x22ba6a['key']['id'], _0x8afaab, _0xd003b2, _0x432b2e['sender']) : (console[_0x42a3c5(0x19e)](_0x5a1ce4[_0x42a3c5(0x236)], _0x7234d1), await _0x1cc82c[_0x42a3c5(0x263)](_0xf3df3c['chat'], '' + global['errore'], _0xf3df3c));
    }
}
let handler = async (_0x1c9382, {
    conn: _0x5abca5,
    command: _0xc733ea,
    usedPrefix: _0x40a8a4
}) => {
    const _0x951088 = _0x356813, _0xa420b0 = {
            'szIsP': function (_0x52a2aa, _0x5549e0) {
                return _0x52a2aa(_0x5549e0);
            },
            'hOlAZ': function (_0x17cc51, _0x51287c) {
                return _0x17cc51 === _0x51287c;
            },
            'zsbIE': 'skipwordle',
            'KKtLK': _0x951088(0x13b),
            'mHiIl': _0x951088(0x150),
            'WmdEy': _0x951088(0x151),
            'yRNYg': function (_0xc48813, _0xdb46ec) {
                return _0xc48813 === _0xdb46ec;
            },
            'jrKgw': function (_0x5444eb, _0x52215b) {
                return _0x5444eb !== _0x52215b;
            },
            'LodOd': _0x951088(0x200),
            'onilX': _0x951088(0x1e1),
            'IFceq': _0x951088(0x1ed),
            'mrogx': function (_0x3f60aa, _0x342c4d) {
                return _0x3f60aa !== _0x342c4d;
            },
            'mDUkI': _0x951088(0x1a8)
        };
    if (_0xa420b0[_0x951088(0x206)](_0xc733ea, _0xa420b0[_0x951088(0x1df)])) {
        if (_0xa420b0['KKtLK'] !== _0xa420b0[_0x951088(0x22b)])
            _0x476e9a[_0x951088(0x20e)](_0x951088(0x168) + _0xf0b86a), _0xa420b0[_0x951088(0x1db)](_0x123638, _0x32d91b['timeoutId']), delete _0x2c01c3[_0x951088(0x190)][_0x42b3bf];
        else {
            const _0x2062dc = global[_0x951088(0x190)]?.[_0x1c9382[_0x951088(0x1ba)]];
            if (!_0x2062dc)
                return _0x5abca5[_0x951088(0x263)](_0x1c9382[_0x951088(0x1ba)], _0xa420b0[_0x951088(0x1e9)], _0x1c9382);
            const _0xba04c4 = await _0x5abca5[_0x951088(0x1d8)](_0x1c9382[_0x951088(0x1ba)])[_0x951088(0x1af)](() => null), _0x216f46 = _0xba04c4?.[_0x951088(0x20b)][_0x951088(0x216)](_0x3bcfd1 => _0x3bcfd1['id'] === _0x1c9382[_0x951088(0x136)]), _0x2f0787 = _0xa420b0[_0x951088(0x206)](_0x216f46?.[_0x951088(0x151)], _0xa420b0[_0x951088(0x1ad)]) || _0xa420b0[_0x951088(0x18f)](_0x216f46?.[_0x951088(0x151)], 'superadmin');
            if (!_0x2f0787 && _0xa420b0[_0x951088(0x1de)](_0x1c9382[_0x951088(0x136)], _0x2062dc[_0x951088(0x17f)]) && !_0x1c9382[_0x951088(0x199)])
                return _0x5abca5['reply'](_0x1c9382[_0x951088(0x1ba)], _0x951088(0x258), _0x1c9382);
            _0xa420b0[_0x951088(0x1db)](clearTimeout, _0x2062dc[_0x951088(0x159)]);
            const _0x2c03da = await _0x2062dc[_0x951088(0x135)]();
            let _0x5bd918 = _0x951088(0x1c0);
            _0x5bd918 += '│\x20『\x20🎯\x20』\x20`La\x20parola\x20era:`\x0a\x20『\x20‼️\x20』\x20*`' + _0x2062dc['targetWord'] + _0x951088(0x244), _0x5bd918 += _0x951088(0x255);
            const _0x178dfc = [{
                    'name': _0x951088(0x195),
                    'buttonParamsJson': JSON[_0x951088(0x1d1)]({
                        'display_text': _0xa420b0[_0x951088(0x160)],
                        'id': _0x951088(0x15b)
                    })
                }];
            await _0x5abca5[_0x951088(0x1b3)](_0x1c9382['chat'], {
                'image': _0x2c03da,
                'caption': _0x5bd918,
                'footer': _0xa420b0[_0x951088(0x1a1)],
                'interactiveButtons': _0x178dfc
            }, { 'quoted': _0x1c9382 }), delete global[_0x951088(0x190)][_0x1c9382[_0x951088(0x1ba)]];
            return;
        }
    }
    _0xc733ea === _0xa420b0[_0x951088(0x13c)] && (_0xa420b0['mrogx'](_0xa420b0[_0x951088(0x1f9)], _0x951088(0x1f5)) ? await startGame(_0x5abca5, _0x1c9382, _0x40a8a4) : this[_0x951088(0x1d4)] = !![]);
};
handler[_0x356813(0x19a)] = async (_0x187712, {
    conn: _0xe3166c,
    usedPrefix: _0x134a2a
}) => {
    const _0x2c8566 = _0x356813, _0xcef77c = {
            'mMyyB': function (_0x4682c1, _0x4d19f0) {
                return _0x4682c1 - _0x4d19f0;
            },
            'WHWdj': function (_0x36d416, _0x399c9d) {
                return _0x36d416(_0x399c9d);
            },
            'GnMSo': function (_0x47b74c, _0x3d9c94) {
                return _0x47b74c !== _0x3d9c94;
            },
            'FQHHq': function (_0x4b5e7a, _0x5efd8b) {
                return _0x4b5e7a !== _0x5efd8b;
            },
            'AjBxP': function (_0x253762, _0x26497a) {
                return _0x253762 === _0x26497a;
            },
            'bLdOt': _0x2c8566(0x24c),
            'XCodc': _0x2c8566(0x208),
            'wcZAk': _0x2c8566(0x1fd),
            'zNYAB': function (_0x3676bb, _0x3ab1da) {
                return _0x3676bb(_0x3ab1da);
            },
            'ZxRjW': _0x2c8566(0x195),
            'cFhOJ': '🎯\x20Gioca\x20Ancora!',
            'jLkUk': function (_0xb61445, _0x2a6a7e) {
                return _0xb61445 / _0x2a6a7e;
            },
            'SKnjz': function (_0x224529, _0x14b514) {
                return _0x224529 - _0x14b514;
            },
            'qlYXK': function (_0x26c386, _0x172185) {
                return _0x26c386 <= _0x172185;
            },
            'LicRy': function (_0x2e57de, _0x355478) {
                return _0x2e57de + _0x355478;
            },
            'UvKFi': _0x2c8566(0x1e1),
            'IdIrS': function (_0x1e30c9, _0x36b3b5) {
                return _0x1e30c9 - _0x36b3b5;
            },
            'MYTMT': function (_0x3468a8, _0x35226f, _0x431981) {
                return _0x3468a8(_0x35226f, _0x431981);
            }
        }, _0x4dc5c0 = _0x187712[_0x2c8566(0x1ba)];
    let _0x29ae7e = global['wordleGame']?.[_0x4dc5c0];
    if (!_0x29ae7e || !_0x187712[_0x2c8566(0x1ca)] || _0xcef77c[_0x2c8566(0x1e7)](_0x187712['quoted']['id'], _0x29ae7e['id']) || _0x187712[_0x2c8566(0x158)][_0x2c8566(0x199)])
        return;
    if (_0xcef77c['FQHHq'](_0x187712[_0x2c8566(0x136)], _0x29ae7e[_0x2c8566(0x17f)]))
        return;
    const _0x5dcec8 = (_0x187712[_0x2c8566(0x148)] || '')[_0x2c8566(0x24a)]()[_0x2c8566(0x1c6)]();
    if (!_0x5dcec8 || !/^[A-Z]{5}$/[_0x2c8566(0x1c2)](_0x5dcec8)) {
        if (_0xcef77c[_0x2c8566(0x15e)](_0xcef77c[_0x2c8566(0x1be)], _0xcef77c[_0x2c8566(0x213)])) {
            const _0x522de7 = _0x55d959['now']();
            for (const [_0x80b674, _0x456603] of _0x4e72f3[_0x2c8566(0x182)](_0x51e9d6[_0x2c8566(0x190)] || {})) {
                _0xcef77c[_0x2c8566(0x253)](_0x522de7, _0x456603['startTime']) > 0xe56d4 + -0x11854 * -0x5 + -0xaa8b8 && (_0x4c6886[_0x2c8566(0x20e)](_0x2c8566(0x168) + _0x80b674), _0xcef77c[_0x2c8566(0x189)](_0x18511b, _0x456603[_0x2c8566(0x159)]), delete _0xc75e35[_0x2c8566(0x190)][_0x80b674]);
            }
        } else
            return _0xe3166c[_0x2c8566(0x263)](_0x187712[_0x2c8566(0x1ba)], _0xcef77c[_0x2c8566(0x25a)], _0x187712);
    }
    const _0x5554a3 = _0x29ae7e['guess'](_0x5dcec8);
    if (_0x5554a3['error'])
        return _0xe3166c[_0x2c8566(0x263)](_0x187712[_0x2c8566(0x1ba)], _0x5554a3['error'], _0x187712);
    const _0x4ff48e = await _0x29ae7e[_0x2c8566(0x135)]();
    _0xcef77c[_0x2c8566(0x186)](clearTimeout, _0x29ae7e[_0x2c8566(0x159)]);
    const _0x13b658 = [{
            'name': _0xcef77c['ZxRjW'],
            'buttonParamsJson': JSON['stringify']({
                'display_text': _0xcef77c['cFhOJ'],
                'id': _0x2c8566(0x15b)
            })
        }];
    if (_0x29ae7e[_0x2c8566(0x1ef)]) {
        const _0x5bb472 = Math[_0x2c8566(0x239)](_0xcef77c[_0x2c8566(0x17a)](_0xcef77c[_0x2c8566(0x197)](Date[_0x2c8566(0x174)](), _0x29ae7e[_0x2c8566(0x1d9)]), -0x1 * 0xe59 + -0xe62 + -0xae1 * -0x3));
        let _0x2518b9 = ILDENARO, _0x1f84c9 = 0x62 * -0x48 + -0x34 * 0xb6 + 0x4150;
        const _0x54244a = _0xcef77c['qlYXK'](_0x5bb472, 0x1044 + 0x1 * -0x2134 + 0x4a * 0x3b) ? 0x2108 + 0x696 + -0x276c : 0x158c + 0x5f0 + -0x1b7c;
        _0x2518b9 += _0x54244a;
        global['db']['data'][_0x2c8566(0x173)][_0x187712[_0x2c8566(0x136)]] && (global['db'][_0x2c8566(0x1f1)][_0x2c8566(0x173)][_0x187712['sender']][_0x2c8566(0x205)] = _0xcef77c[_0x2c8566(0x14e)](global['db'][_0x2c8566(0x1f1)]['users'][_0x187712[_0x2c8566(0x136)]][_0x2c8566(0x205)] || -0xa4 * -0x20 + 0x1 * -0x13f9 + -0x87, _0x2518b9), global['db'][_0x2c8566(0x1f1)][_0x2c8566(0x173)][_0x187712[_0x2c8566(0x136)]][_0x2c8566(0x18e)] = _0xcef77c[_0x2c8566(0x14e)](global['db'][_0x2c8566(0x1f1)][_0x2c8566(0x173)][_0x187712['sender']][_0x2c8566(0x18e)] || 0x1ac9 + 0x12f2 + -0x2dbb, _0x1f84c9));
        let _0x453bb5 = _0x2c8566(0x185);
        _0x453bb5 += '│\x20『\x20🎯\x20』\x20`Parola:`\x20*' + _0x29ae7e[_0x2c8566(0x141)] + '*\x0a', _0x453bb5 += _0x2c8566(0x1b9) + _0x5bb472 + _0x2c8566(0x1a0), _0x453bb5 += _0x2c8566(0x25e) + _0x29ae7e['attempts'][_0x2c8566(0x164)] + '/' + _0x29ae7e[_0x2c8566(0x140)] + '*\x0a', _0x453bb5 += _0x2c8566(0x1bd) + _0x2518b9 + _0x2c8566(0x220) + _0x1f84c9 + 'xp*\x0a', _0x453bb5 += _0x2c8566(0x255), await _0xe3166c[_0x2c8566(0x1b3)](_0x4dc5c0, {
            'image': _0x4ff48e,
            'caption': _0x453bb5,
            'footer': _0xcef77c[_0x2c8566(0x1c7)],
            'interactiveButtons': _0x13b658
        }, { 'quoted': _0x187712 }), delete global[_0x2c8566(0x190)][_0x4dc5c0];
    } else {
        if (_0x29ae7e['gameOver']) {
            let _0x42de3d = _0x2c8566(0x1bb);
            _0x42de3d += _0x2c8566(0x1c9) + _0x29ae7e['targetWord'] + _0x2c8566(0x244), _0x42de3d += _0x2c8566(0x1ce), _0x42de3d += _0x2c8566(0x255), await _0xe3166c[_0x2c8566(0x1b3)](_0x4dc5c0, {
                'image': _0x4ff48e,
                'caption': _0x42de3d,
                'footer': _0x2c8566(0x1e1),
                'interactiveButtons': _0x13b658
            }, { 'quoted': _0x187712 }), delete global['wordleGame'][_0x4dc5c0];
        } else {
            let _0x28b026 = _0x2c8566(0x1d3);
            _0x28b026 += _0x2c8566(0x161) + _0x5dcec8 + '*\x0a', _0x28b026 += '│\x20『\x20📊\x20』\x20`Rimasti:`\x20*' + _0xcef77c['IdIrS'](_0x29ae7e['maxAttempts'], _0x29ae7e[_0x2c8566(0x242)][_0x2c8566(0x164)]) + '*\x0a', _0x28b026 += _0x2c8566(0x207), _0x28b026 += _0x2c8566(0x255);
            let _0x5bb743 = await _0xe3166c[_0x2c8566(0x1b3)](_0x4dc5c0, {
                'image': _0x4ff48e,
                'caption': _0x28b026,
                'footer': _0xcef77c[_0x2c8566(0x1c7)]
            }, { 'quoted': _0x187712 });
            _0x29ae7e['id'] = _0x5bb743[_0x2c8566(0x158)]['id'];
            const _0x25b40d = _0xcef77c[_0x2c8566(0x132)](setTimeout, () => {
                const _0x14f6d9 = _0x2c8566;
                handleGameTimeout(_0xe3166c, _0x4dc5c0, _0x5bb743[_0x14f6d9(0x158)]['id'], _0x134a2a, _0x29ae7e['targetWord'], _0x29ae7e[_0x14f6d9(0x17f)]);
            }, durata);
            _0x29ae7e['timeoutId'] = _0x25b40d;
        }
    }
}, setInterval(() => {
    const _0x34ce68 = _0x356813, _0x2c814e = {
            'LwXQO': function (_0x2b2026, _0xa7e4ad) {
                return _0x2b2026 === _0xa7e4ad;
            },
            'xwmZo': function (_0x41844f, _0x5c729f) {
                return _0x41844f > _0x5c729f;
            },
            'MOZyZ': function (_0x1e9fc3, _0x1dc21d) {
                return _0x1e9fc3 - _0x1dc21d;
            },
            'SIorS': _0x34ce68(0x257),
            'XUgzx': 'KbSUP',
            'PwaKc': function (_0x688e57, _0x5110d4) {
                return _0x688e57(_0x5110d4);
            }
        }, _0x4fcf8a = Date[_0x34ce68(0x174)]();
    for (const [_0x5b1ca5, _0xc64962] of Object[_0x34ce68(0x182)](global['wordleGame'] || {})) {
        if (_0x2c814e[_0x34ce68(0x249)](_0x34ce68(0x251), _0x34ce68(0x251))) {
            if (_0x2c814e[_0x34ce68(0x230)](_0x2c814e[_0x34ce68(0x1c1)](_0x4fcf8a, _0xc64962[_0x34ce68(0x1d9)]), 0x4ace0 + -0x377f4 + 0x2c * 0x2e3f)) {
                if (_0x2c814e[_0x34ce68(0x249)](_0x2c814e[_0x34ce68(0x1ae)], _0x2c814e[_0x34ce68(0x19b)]))
                    return;
                else
                    console[_0x34ce68(0x20e)](_0x34ce68(0x168) + _0x5b1ca5), _0x2c814e[_0x34ce68(0x203)](clearTimeout, _0xc64962['timeoutId']), delete global[_0x34ce68(0x190)][_0x5b1ca5];
            }
        } else {
            const _0x2959fd = _0x34ce68(0x16a)[_0x34ce68(0x1b1)]('|');
            let _0x2666b9 = -0xaed * -0x1 + 0x13df * -0x1 + 0x8f2;
            while (!![]) {
                switch (_0x2959fd[_0x2666b9++]) {
                case '0':
                    this[_0x34ce68(0x159)] = null;
                    continue;
                case '1':
                    this['attempts'] = [];
                    continue;
                case '2':
                    this[_0x34ce68(0x140)] = -0x64a + -0x1d * 0x1 + 0x66d;
                    continue;
                case '3':
                    this['id'] = null;
                    continue;
                case '4':
                    this[_0x34ce68(0x17f)] = _0x492683;
                    continue;
                case '5':
                    this[_0x34ce68(0x1ef)] = ![];
                    continue;
                case '6':
                    this[_0x34ce68(0x1d9)] = _0x4f8f0d['now']();
                    continue;
                case '7':
                    this[_0x34ce68(0x141)] = _0x235b98[_0x34ce68(0x1c6)]();
                    continue;
                case '8':
                    this[_0x34ce68(0x1d4)] = ![];
                    continue;
                }
                break;
            }
        }
    }
}, -0x1b40c * 0x1 + 0x1bace + -0x5 * -0x2d86), handler[_0x356813(0x1b0)] = [_0x356813(0x1ed)], handler[_0x356813(0x1bf)] = [_0x356813(0x228)], handler[_0x356813(0x16c)] = /^(wordle|skipwordle)$/i, handler[_0x356813(0x23b)] = !![], handler[_0x356813(0x26b)] = !![];
function _0x4500(_0x2d7eb1, _0x1e7ee6) {
    const _0x21c4d2 = _0x520e();
    return _0x4500 = function (_0x2b6265, _0x5bffda) {
        _0x2b6265 = _0x2b6265 - (0x2 * -0x3a1 + 0x1bad + -0x1340);
        let _0x50270a = _0x21c4d2[_0x2b6265];
        return _0x50270a;
    }, _0x4500(_0x2d7eb1, _0x1e7ee6);
}
export default handler;