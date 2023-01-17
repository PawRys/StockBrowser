<script setup>
import { ref, reactive, provide, watchEffect } from 'vue';

import Prices from './Browser__Prices.vue';
import Filters from './Browser__Filters.vue';
import Inventory from './Browser__Inventory.vue';
import Pagination from './Browser__Pagination.vue';
import Quantities from './Browser__Quantities.vue';
import ListSettings from './Browser__ListSettings.vue';
import { animateScrollTo } from '../utils/functions.js';

const unfilteredData_global = ref([]);
const filteredData_global = ref([]);
const sortedData_global = ref([]);
const pagedData_global = ref([]);
provide('unfilteredData_global', unfilteredData_global);
provide('filteredData_global', filteredData_global);
provide('sortedData_global', sortedData_global);
provide('pagedData_global', pagedData_global);

const pageSize_global = ref(localStorage.StockBrowser_PageSize || 20);
const pageCount_global = ref(1);
const pageNumber_global = ref(1);
provide('pageSize_global', pageSize_global);
provide('pageCount_global', pageCount_global);
provide('pageNumber_global', pageNumber_global);
watchEffect(() => {
	localStorage.StockBrowser_PageSize = pageSize_global.value;
});

const dataSet_global = ref('dataset-total');
provide('dataSet_global', dataSet_global);

const dataMode = ref(localStorage.StockBrowser_DataMode || 'dataMode__trade');
provide('dataMode', dataMode);
watchEffect(() => {
	localStorage.StockBrowser_DataMode = dataMode.value;
});

const vatVal = 1.23;
const vat = reactive({ m3: 1, m2: 1, szt: vatVal });
provide('vatVal', vatVal);
provide('vat', vat);

function wrapText(text) {
	return text.replace(/(\d+(,\d+)?x\d+x\d+)/gi, '<b>$1</b>');
}

function openListSettings() {
	const optionsEl = document.querySelector('.browser__settings');
	const overlayEl = document.querySelector('.browser__settingsOverlay');
	optionsEl.classList.add('browser__settings--opened');
	overlayEl.classList.add('browser__settingsOverlay--opened');
}
</script>

<template>
	<h2>Lista produktów</h2>

	<Filters />

	<section class="browser" :class="dataMode" id="results">
		<ListSettings class="browser__settings" />
		<Pagination class="browser__pagination-top" />
		<ul class="browser__list" v-if="pagedData_global && pagedData_global.length">
			<li class="browser__product" v-for="ply in pagedData_global" :key="ply.code">
				<div class="product__code">
					<b>{{ ply.code }}</b> - {{ ply.group }}
				</div>
				<div class="product__name" v-html="wrapText(ply.name)"></div>
				<div class="product__error" v-if="ply.errors?.length">
					<span v-for="error of ply.errors">{{ error }}</span>
				</div>

				<Inventory
					v-if="dataMode === 'dataMode__inventory'"
					:code="ply.code"
					:size="ply.size"
					:total="ply.tCub" />
				<Quantities
					v-if="dataMode === 'dataMode__trade'"
					:size="ply.size"
					:total="ply.tCub"
					:aviable="ply.aCub" />
				<Prices
					v-if="dataMode === 'dataMode__trade'"
					:plySize="ply.size"
					:buyPrice="ply.pCub" />
			</li>
		</ul>
		<p v-else class="browser__empty">Nie znaleziono produktów.</p>
		<Pagination class="browser__pagination-bottom" />
		<footer class="browser__stickyFooter">
			<!-- <button class="button accent" @click="animateScrollTo('#search')">
				<span>Szukaj...</span><i class="bi bi-search"></i>
			</button> -->
			<button class="button" id="browser__settingsOpenBtn" @click="openListSettings">
				<span>Ustawienia</span><i class="bi bi-gear"></i>
			</button>
		</footer>
	</section>
</template>

<style>
.browser__list {
	margin: 0;
	padding: 0;
	width: 100%;
}

.browser__empty {
	margin: 5rem;
	font-size: 1.4rem;
	text-align: center;
}
.browser__stickyFooter {
	position: sticky;
	bottom: 0.5rem;

	margin: 1rem;
	margin-inline: auto;
	padding: 0.3ch 0.4ch;
	width: fit-content;
	border-radius: 0.4rem;
	background: var(--bg-shade);
}

.browser__product {
	margin-block: 1rem 2rem;
}
.browser__product:is(:hover, :focus-within) {
	box-shadow: inset 0px 0px 0px 100rem var(--bg-shade), 0px 0px 0px 0.5rem var(--bg-shade);
}

:is(.product__code, .product__name) > b {
	font-weight: 600;
}
.product__code {
	font-size: 0.9em;
}
.product__name {
	font-size: 1.1em;
}
.product__error {
	color: crimson;
}

/* @MEDIA DEPENDENT */
/********/ /********/ /********/ /********/ /********/
@media (max-width: 100vw) {
	.browser {
		display: grid;
		justify-items: center;
		gap: 0.8rem;

		grid-template-columns: 8fr minmax(max-content, 3fr);
		grid-template-areas:
			'page-top        settings     '
			'browser         settings     '
			'page-bottom     settings     '
			'sticky-footer   sticky-footer';
	}
	#browser__settingsOpenBtn,
	#browser__settingsCloseBtn {
		display: none;
	}
}
@media (max-width: 1080px) {
	.browser {
		grid-template-columns: 1fr;
		grid-template-areas:
			'settings     '
			'page-top     '
			'browser      '
			'page-bottom  '
			'sticky-footer';
	}

	#browser__settingsOpenBtn,
	#browser__settingsCloseBtn {
		display: inline-grid;
	}

	.browser__settings {
		position: fixed;
		z-index: 2;
		right: 0;
		top: 0;
		transform: translateX(100%);
		transition: var(--transition-duration) all;
	}
	.browser__settings--opened {
		transform: translateX(0%);
	}
}

@media (max-width: 100vw) {
	.browser__product {
		display: grid;
		align-items: baseline;
		justify-content: space-evenly;
		gap: 0.5ch;

		grid-template-columns: repeat(6, minmax(auto, 14ch));
		grid-template-areas:
			'code code code tCub tSqr tPcs'
			'name name name aCub aSqr aPcs'
			'name name name pCub pSqr pPcs'
			'erro erro erro buyp marg perc';
	}
}
@media (max-width: 720px) {
	.browser__product {
		grid-template-columns: repeat(3, minmax(auto, 14ch));
		grid-template-areas:
			'code code code'
			'name name name'
			'erro erro erro'
			'tCub tSqr tPcs'
			'aCub aSqr aPcs'
			'pCub pSqr pPcs'
			'buyp marg perc';
	}
}

/* GRID-AREA: NAMES */
/********/ /********/ /********/ /********/ /********/
.browser__list,
.browser__empty {
	grid-area: browser;
}
.browser__settings {
	grid-area: settings;
}
.browser__pagination-top {
	grid-area: page-top;
}
.browser__pagination-bottom {
	grid-area: page-bottom;
}
.browser__stickyFooter {
	grid-area: sticky-footer;
}

.product__code {
	grid-area: code;
}
.product__name {
	grid-area: name;
}
.product__error {
	grid-area: erro;
}

.product__tCub {
	grid-area: tCub;
}
.product__tSqr {
	grid-area: tSqr;
}
.product__tPcs {
	grid-area: tPcs;
}

.product__aCub {
	grid-area: aCub;
}
.product__aSqr {
	grid-area: aSqr;
}
.product__aPcs {
	grid-area: aPcs;
}

.product__pCub {
	grid-area: pCub;
}
.product__pSqr {
	grid-area: pSqr;
}
.product__pPcs {
	grid-area: pPcs;
}
</style>
