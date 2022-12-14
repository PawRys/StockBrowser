<script setup>
import { onBeforeUpdate, onUpdated, provide, ref } from 'vue';
// import Test2 from './Test2.vue';
// import Test3 from './Test3.vue';

const exp = ref();
onBeforeUpdate(() => {
	console.clear();
});

function evalMath(expression) {
	expression = expression ? expression : '';
	// console.log(expression);
	expression = expression.replace(/,/gi, '.');
	expression = expression.replace(/-\+/gi, '-');
	expression = expression.replace(/--/gi, '+');
	expression = expression.replace(/\++/gi, '+');
	expression = expression.replace(/\B\.\B/gi, '0');
	expression = expression.replace(/(\d)(\()/gi, '$1*$2');
	expression = expression.replace(/(\))(\d)/gi, '$1*$2');
	expression = expression.replace(/(\))(\()/gi, '$1*$2');
	const regexpBracket = /\(([^\(\)]+)\)/i;
	const regexpMultiDiv = /\d+(\.\d+)?[\*\/]-?\d+(\.\d+)?/i;
	const regexpAddSub = /[\+\-]?\d+(\.\d+)?/gi;
	const isBracket = expression.match(regexpBracket);
	const is2ndLevel = expression.match(regexpMultiDiv);
	const is1stLevel = expression.match(regexpAddSub);
	console.log(expression);

	if (isBracket) {
		let evalBracket = expression.replace(regexpBracket, evalMath(isBracket[1]));
		return evalMath(evalBracket);
	}

	if (is2ndLevel) {
		let evalMultiDiv = expression.replace(regexpMultiDiv, calcMultiDiv(is2ndLevel[0]));
		return evalMath(evalMultiDiv);
	}

	const finalResult = is1stLevel
		? is1stLevel.reduce((acc, curr) => curr * 1 + acc * 1)
		: 0;
	return finalResult * 1;

	function calcMultiDiv(exp) {
		let [a, b] = exp.split(/[\*\/]/);
		// console.log(exp);
		// console.log(a);
		// console.log(b);
		a *= 1;
		b *= 1;
		let result = /\*/.test(exp) ? a * b : a / b;
		return result;
	}
}
</script>

<template>
	<h1>Test Tab</h1>
	<p><input type="text" v-model="exp" /></p>
	<p>{{ evalMath(exp) }}</p>
</template>
