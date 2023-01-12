import { calcQuant, evalMath } from '../utils/functions.js';

export function spreadsheetHeader() {
	let result = 'Kod';
	result += '\tNazwa';
	result += '\tStatus';
	result += '\tRóżnica m3';
	result += '\tRóżnica m2';
	result += '\tRóżnica szt';
	result += '\tMagazyn m3';
	result += '\tMagazyn m2';
	result += '\tMagazyn szt';
	result += '\tSymfonia m3';
	result += '\tSymfonia m2';
	result += '\tSymfonia szt';
	result += '\n';
	return result;
}

export function spreadsheetRow(row) {
	const size = row.size;
	let iCub = row.iCub;
	let iSqr = row.iSqr;
	let iPcs = row.iPcs;
	let tCub = calcQuant(size, row.tCub, 'm3', 'm3', 3);
	let tSqr = calcQuant(size, row.tCub, 'm3', 'm2', 4);
	let tPcs = calcQuant(size, row.tCub, 'm3', 'szt', 1);
	let iSum = 0;

	iCub = evalMath(iCub);
	iSqr = evalMath(iSqr);
	iPcs = evalMath(iPcs);
	iCub = calcQuant(size, iCub, 'm3', 'm3');
	iSqr = calcQuant(size, iSqr, 'm2', 'm3');
	iPcs = calcQuant(size, iPcs, 'szt', 'm3');
	iSum = iCub + iSqr + iPcs;
	iCub = calcQuant(size, iSum, 'm3', 'm3', 3);
	iSqr = calcQuant(size, iSum, 'm3', 'm2', 4);
	iPcs = calcQuant(size, iSum, 'm3', 'szt', 1);
	let dCub = iCub - tCub;
	let dSqr = iSqr - tSqr;
	let dPcs = iPcs - tPcs;

	let status = 'pusty';
	if (dPcs <= -1) status = 'MANKO';
	if (dPcs >= 1) status = 'NADMIAR';
	if (1 > dPcs && dPcs > -1 && tPcs >= 1) status = 'OK';
	if (1 > tPcs && tPcs > 0 && iPcs < 1) status = 'ZERO';

	let string = `${row.code}`;
	string += `\t${row.name}`;
	string += `\t${status}`;
	string += `\t${dCub.toFixed(3)}`;
	string += `\t${dSqr.toFixed(4)}`;
	string += `\t${dPcs.toFixed(1)}`;
	string += `\t${iCub.toFixed(3)}`;
	string += `\t${iSqr.toFixed(4)}`;
	string += `\t${iPcs.toFixed(1)}`;
	string += `\t${tCub.toFixed(3)}`;
	string += `\t${tSqr.toFixed(4)}`;
	string += `\t${tPcs.toFixed(1)}`;
	string += `\n`;
	return string;
}
