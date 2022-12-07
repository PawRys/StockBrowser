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
	window.scrollTo({
		top: el.offsetTop,
		behavior: 'smooth',
	});
}
