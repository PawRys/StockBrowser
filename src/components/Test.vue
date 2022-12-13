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
	console.log(expression);

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
	<h1>Test Tab</h1>
	<p><input type="text" v-model="exp" /></p>
	<p>{{ evalMath(exp) }}</p>
</template>
