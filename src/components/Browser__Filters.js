import { animateScrollTo } from '../utils/functions.js';

export const columnNames = {
	group: 'Grupa',
	thick: 'Grubość',
	sizeA: 'Wymiar A',
	sizeB: 'Wymiar B',
	grade: 'Klasa',
	words: 'Opis',
};

export function getProductGrades(input) {
	const className = 'KILO|BB|B|CP|CC|C|WGE|WG|PQF|PQ|PF|F|WH|W|M';
	const pattern = `\\b(${className}){1}(\/(${className})){0,1}(?!\\.)\\b`;
	const grade = input.toUpperCase().match(new RegExp(pattern, 'gi'));
	return grade;
}

export function addListener(evName, el) {
	// listner added to onUpdated hook because when regular 'click' happens
	// #results.offsetTop changes height what is resulting in scrolling to wrong position.
	el.addEventListener(
		evName,
		() => {
			animateScrollTo('#results');
		},
		{ once: true }
	);
}

export function convertStringToRegexp(str) {
	return str
		.split(' ')
		.map(filter => {
			const trimPipes = /^\|+|\|+$/g;
			const isPlywoodSize = /\d*x[\d\|]*x\d*/i.test(filter);
			const wholeWordsOnly = /=/.test(filter);
			let subQuery = '';
			let lookahead = '';
			let lookbehind = '';
			if (wholeWordsOnly) {
				lookahead = `(?!\\S)\\b`;
				lookbehind = `\\b(?<!\\S)`;
			}

			filter = filter.replace('=', '');
			filter = filter.replace(trimPipes, '');
			filter = filter.replace(/([\?])/g, '\\$1');
			if (isPlywoodSize) {
				filter = filter
					.split('x')
					.map(sizeFilter => {
						sizeFilter = sizeFilter.replace(trimPipes, '');
						return sizeFilter.length > 0 ? `(${sizeFilter})` : '(\\d+(,\\d+)?)';
					})
					.join('x');
				filter = `${filter}(mm)?`;
				// filter = `(?<!,)${filter}(mm)?`;
			}
			subQuery = `(?=.*${lookbehind}(${filter})${lookahead})`;
			return subQuery;
		})
		.join('');
}
