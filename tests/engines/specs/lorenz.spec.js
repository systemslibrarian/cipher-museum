'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

require('../helpers/contracts').defineContractSpec('lorenz');

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const ITA2 = {
	A:3, B:25, C:14, D:9, E:1, F:13, G:26, H:20, I:6, J:11, K:15,
	L:18, M:28, N:12, O:24, P:22, Q:23, R:10, S:5, T:16, U:7,
	V:30, W:19, X:29, Y:21, Z:17
};

function referenceLorenz(text, key) {
	const clean = value => value.toUpperCase().replace(/[^A-Z]/g, '');
	const makeWheel = (size, initialSeed) => {
		let seed = initialSeed & 0x7fffffff;
		return Array.from({ length: size }, () => {
			seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
			return (seed >>> 30) & 1;
		});
	};
	const seed = clean(key || 'LORENZ').split('')
		.reduce((value, character) => (Math.imul(value, 31) + character.charCodeAt(0)) & 0x7fffffff, 7);
	const chiLengths = [41, 31, 29, 26, 23];
	const psiLengths = [43, 47, 51, 53, 59];
	const chi = chiLengths.map((length, index) => makeWheel(length, seed + index));
	const psi = psiLengths.map((length, index) => makeWheel(length, seed + 5 + index));
	const motor37 = makeWheel(37, seed + 10);
	const motor61 = makeWheel(61, seed + 11);
	const chiPosition = [0, 0, 0, 0, 0];
	const psiPosition = [0, 0, 0, 0, 0];
	let motor37Position = 0;
	let motor61Position = 0;
	let result = '';

	for (const character of clean(text)) {
		let keyValue = 0;
		for (let bit = 0; bit < 5; bit++) {
			keyValue |= ((chi[bit][chiPosition[bit]] ^ psi[bit][psiPosition[bit]]) << bit);
		}
		result += GLYPHS[ITA2[character] ^ keyValue];

		for (let bit = 0; bit < 5; bit++) chiPosition[bit] = (chiPosition[bit] + 1) % chiLengths[bit];
		const stepMotor61 = motor37[motor37Position] === 1;
		motor37Position = (motor37Position + 1) % motor37.length;
		if (stepMotor61) {
			const stepPsi = motor61[motor61Position] === 1;
			motor61Position = (motor61Position + 1) % motor61.length;
			if (stepPsi) {
				for (let bit = 0; bit < 5; bit++) psiPosition[bit] = (psiPosition[bit] + 1) % psiLengths[bit];
			}
		}
	}
	return result;
}

test('lorenz: matches independent 12-wheel ITA2 derivation', () => {
	const plaintext = 'ATTACKATDAWN';
	const key = 'LORENZ';
	assert.equal(engines.lorenz.encode(plaintext, key), referenceLorenz(plaintext, key));
});