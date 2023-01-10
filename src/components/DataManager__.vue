<script setup>
try {
	// const blob = await db.export({ prettyJson: true, progressCallback });
	browser.downloads.download('blob', 'dexie-export.json', 'application/json');
} catch (error) {
	console.error('' + error);
}
</script>

<template>
	<h2>Zarządzanie bazą danych</h2>
	<section>
		<h3>Export do pliku (kopia zapasowa)</h3>
		<h3>Import z pliku</h3>
	</section>

	<section>
		<h3>Wymazywanie</h3>
		<p>- całej bazy danych</p>
		<p>- inwentaryzacji</p>
	</section>
</template>

<style scoped></style>
