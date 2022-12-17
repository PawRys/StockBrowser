export function calcQuant(size, value, from, to) {
	if (!size) return 0;
	if (!value) return 0;
	if (!from) return 0;
	if (!to) return 0;
	size = size.split('x');
	const a = size[0] / 1000;
	const b = size[1] / 1000;
	const c = size[2] / 1000;
	if (from === 'm3') {
		if (to === 'm2') value = value / a;
		if (to === 'szt') value = value / a / b / c;
	}
	if (from === 'm2') {
		if (to === 'm3') value = value * a;
		if (to === 'szt') value = value / b / c;
	}
	if (from === 'szt') {
		if (to === 'm3') value = value * a * b * c;
		if (to === 'm2') value = value * b * c;
	}
	return value * 1;
}

export function calcPrice(size, value, from, to) {
	if (!size) return 0;
	if (!value) return 0;
	if (!from) return 0;
	if (!to) return 0;
	size = size.split('x');
	const a = size[0] / 1000;
	const b = size[1] / 1000;
	const c = size[2] / 1000;
	if (from === 'm3') {
		if (to === 'm2') value = value * a;
		if (to === 'szt') value = value * a * b * c;
	}

	if (from === 'm2') {
		if (to === 'm3') value = value / a;
		if (to === 'szt') value = value * b * c;
	}

	if (from === 'szt') {
		if (to === 'm3') value = value / a / b / c;
		if (to === 'm2') value = value / b / c;
	}
	return value * 1;
}

export function animateScrollTo(input) {
	const el = document.querySelector(input);
	// console.log(input);
	// console.log(el);
	// console.log(el.offsetTop);
	window.scrollTo({
		top: el.offsetTop,
		behavior: 'smooth',
	});
}

export function evalMath(expression) {
	expression = expression ? expression : '';
	expression = expression.replace(/,/gi, '.');
	expression = expression.replace(/-\+/gi, '-');
	expression = expression.replace(/--/gi, '+');
	expression = expression.replace(/\++/gi, '+');
	expression = expression.replace(/\B\.\B/gi, '0');
	expression = expression.replace(/\B(\.)/gi, '0$1');
	expression = expression.replace(/(\d)(\()/gi, '$1*$2');
	expression = expression.replace(/(\))(\d)/gi, '$1*$2');
	expression = expression.replace(/(\))(\()/gi, '$1*$2');
	const regexpParenthesis = /\(([^\(\)]+)\)/i;
	const regexpMultiply = /\d+(\.\d+)?[\*\/]-?\d+(\.\d+)?/i;
	const regexpAddition = /[\+\-]?\d+(\.\d+)?/gi;
	const isParenthesis = expression.match(regexpParenthesis);
	const isMultiply = expression.match(regexpMultiply);
	const isAddition = expression.match(regexpAddition);
	// console.log(`Exp: ${expression}`);

	if (isParenthesis) {
		let evalParenthesis = expression.replace(
			regexpParenthesis,
			evalMath(isParenthesis[1])
		);
		return evalMath(evalParenthesis);
	}

	if (isMultiply) {
		let evalMultiply = expression.replace(regexpMultiply, calcMultiply(isMultiply[0]));
		return evalMath(evalMultiply);
	}

	const finalResult = isAddition
		? isAddition.reduce((acc, curr) => curr * 1 + acc * 1)
		: 0;
	return finalResult * 1;

	function calcMultiply(exp) {
		let [a, b] = exp.split(/[\*\/]/);
		a *= 1;
		b *= 1;
		return /\*/.test(exp) ? a * b : a / b;
	}
}
