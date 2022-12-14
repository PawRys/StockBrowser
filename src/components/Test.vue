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
	expression = expression.replace(/,/gi, '.');
	expression = expression.replace(/-\+/gi, '-');
	expression = expression.replace(/--/gi, '+');
	expression = expression.replace(/\++/gi, '+');
	expression = expression.replace(/\B\.\B/gi, '0');
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
</script>

<template>
	<h1>Test Tab</h1>
	<p><input type="text" v-model="exp" /></p>
	<p>{{ evalMath(exp) }}</p>
</template>
