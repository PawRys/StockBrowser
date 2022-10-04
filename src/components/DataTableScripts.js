const products = ref()
const pageSize = ref(10)
const pagesLength = ref()
const pageNumber = ref(1)

const data = ref()
async function fetchData() {
	data.value = await idb.products.toArray()
}
fetchData()

async function updatePage() {
	console.time('page update')
	const data = await idb.products.toArray()
	// products.value = await idb.products.where('total').above(0).sortBy('id')
	// products.value = await idb.products.where('aviable').above(0).sortBy('id')
	products.value = data.slice(
		(pageNumber.value - 1) * pageSize.value,
		pageNumber.value * pageSize.value
	)
	pagesLength.value = Math.ceil(data.length / pageSize.value)
	console.timeEnd('page update')
}

updatePage()
watch(pageNumber, updatePage)

function recalc(data) {
	return (data = data * 2)
}
