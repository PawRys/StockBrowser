<script setup>
import { ref, watchEffect } from 'vue';
import BrowserTab from './components/Browser_.vue';
import DataCollectorTab from './components/DataCollector_.vue';
import DataShareTab from './components/DataShare_.vue';
import TestTab from './components/Test.vue';

const lasttab = localStorage.StockBrowser_LastUsedPanel || 0;
const currentTab = ref(lasttab);
const tabs = [
	{ id: BrowserTab, name: 'Lista', icon: 'bi bi-list-ul' },
	{ id: DataCollectorTab, name: 'Załadauj', icon: 'bi bi-download' },
	{ id: DataShareTab, name: 'Udostępnij', icon: 'bi bi-cloud-arrow-up' },
	// { id: TestTab, name: 'Test', icon: 'bi bi-bug-fill' },
];

watchEffect(() => {
	localStorage.StockBrowser_LastUsedPanel = currentTab.value;
});

console.time('evalMath');
// for (let index = 0; index < 1000; index++) {
let expression = '3+-2';
let evl = evalMath(expression);
// }
// console.clear();
console.timeEnd('evalMath');
console.log(`wynik: ${evl}`);

function evalMath(expression) {
	// console.log(expression);
	expression = expression.replace(/,/gi, '.');
	expression = expression.replace(/\B\.\B/gi, '0');
	expression = expression.replace(/(\d)(\()/gi, '$1*$2');
	expression = expression.replace(/(\))(\d)/gi, '$1*$2');
	expression = expression.replace(/(\))(\()/gi, '$1*$2');
	const regexpBracket = /\(([^\(\)]+)\)/i;
	const regexpMultiDiv = /-?\d+(\.\d+)?[\*\/]-?\d+(\.\d+)?/i;
	const regexpAddSub = /[\+\-]?\d+(\.\d+)?/gi;
	const isBracket = expression.match(regexpBracket);
	const isMultiDiv = expression.match(regexpMultiDiv);
	const isAddSub = expression.match(regexpAddSub);
	// console.log(expression);

	if (isBracket) {
		let evalBracket = expression.replace(regexpBracket, evalMath(isBracket[1]));
		return evalMath(evalBracket);
	}

	if (isMultiDiv) {
		let evalMultiDiv = expression.replace(regexpMultiDiv, calcMultiDiv(isMultiDiv[0]));
		return evalMath(evalMultiDiv);
	}

	return !isAddSub ? 0 : isAddSub.reduce((acc, curr) => curr * 1 + acc * 1);

	function calcMultiDiv(exp) {
		let [a, b] = exp.split(/[\*\/]/);
		a *= 1;
		b *= 1;
		return /\*/.test(exp) ? a * b : a / b;
	}
}
</script>

<template>
	<nav class="tab-switch">
		<button
			v-for="(tab, i) of tabs"
			:key="i"
			:class="['button', { active: currentTab == i }]"
			@click="currentTab = i">
			{{ tab.name }}
			<i :class="tab.icon"></i>
		</button>
	</nav>

	<main>
		<Suspense>
			<component :is="tabs[currentTab].id"></component>
			<template #fallback>Loading...</template>
		</Suspense>
	</main>

	<footer>
		<p>Wszelkie prawa zastrzeżone - Paweł Ryszkowski</p>
		<p>
			Uwagi i pomoc techniczna - Paweł:
			<a href="mailto:pawrys.kontakt@gmail.com">pawrys.kontakt@gmail.com</a>
		</p>
	</footer>
</template>

<style scoped>
.tab-switch {
	display: flex;
	gap: 1ch;
}
.tab-switch .button > i {
	font-size: 1.1em;
}
footer {
	margin-top: 3rem;
	border-top: solid 1px var(--accent-shade);
}
</style>
