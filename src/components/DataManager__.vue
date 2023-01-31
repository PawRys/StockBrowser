<script setup>
import { ref, inject } from 'vue';

import { calcQuant, evalMath } from '../utils/functions.js';
import Dexie from 'dexie';
import { db as idb } from '../utils/dexiedb.js';
import { generateTimestamp } from './DataCollector__.js';
import { spreadsheetHeader, spreadsheetRow } from './DataManager__.js';
import { openDialog } from 'vue3-promise-dialog';
import Dialog_Confirm from '../utils/Dialog_Confirm.vue';

const globalEvent = inject('GlobalEvents');
const messageBox__database = ref('');

async function createInventorySpreadsheet() {
  const productsDB = await idb.products.toArray();
  let tableHead = spreadsheetHeader();
  let tableBody = '';
  let table = '';

  for (const row of productsDB) {
    tableBody += spreadsheetRow(row);
  }
  tableHead = tableHead.replace(/\t?([^\t\n]+)\t?/g, '<th>$1</th>');
  tableHead = tableHead.replace(/^(.+)$/gm, '<tr>$1</tr>');
  tableBody = tableBody.replace(/\t?([^\t\n]+)\t?/g, '<td>$1</td>');
  tableBody = tableBody.replace(/^(.+)$/gm, '<tr>$1</tr>');
  table = `<table><thead>${tableHead}</thead><tbody>${tableBody}</tbody></table>`;
  return table;
}

async function purgeInventory() {
  console.time('purgeInventory');
  let text = '<h3>Usuwasz inwentaryzację</h3>';
  text += '<p>Zostaną wyzerowane tylko dane ze zlicznia towaru.</p>';
  text += '<p>Akcja jest nieodwracalna. Czy usunąć?</p>';
  let answer = false || (await openDialog(Dialog_Confirm, { text }));
  if (answer === false) return;

  idb
    .transaction('rw', idb.products, async () => {
      await idb.products.toCollection().modify(row => {
        delete row.iCub;
        delete row.iSqr;
        delete row.iPcs;
      });
    })
    .catch(Dexie.ModifyError, error => {
      console.error(error.failures.length + ' items failed to modify');
    })
    .catch(error => {
      console.error('Generic error: ' + error);
    });
  console.timeEnd('purgeInventory');
}

async function purgeDataBase() {
  console.time('purgeProducts');
  let text = '<h3>Usuwasz bazę danych sklejki</h3>';
  text += '<p>Cała baza danych z tego urządzenia zostanie usunięta.</p>';
  text += '<p>Akcja jest nieodwracalna. Czy usunąć?</p>';
  let answer = false || (await openDialog(Dialog_Confirm, { text }));
  if (answer === false) return;
  await idb.products.clear();
  await idb.timestamps.clear();
  globalEvent.value = 'timestamps removed';
  console.timeEnd('purgeProducts');
}

// myFunction();
function userAgentName() {
  if ((navigator.userAgent.indexOf('Opera') || navigator.userAgent.indexOf('OPR')) != -1) {
    alert('Opera');
  } else if (navigator.userAgent.indexOf('Edg') != -1) {
    alert('Edge');
  } else if (navigator.userAgent.indexOf('Chrome') != -1) {
    alert('Chrome');
  } else if (navigator.userAgent.indexOf('Safari') != -1) {
    alert('Safari');
  } else if (navigator.userAgent.indexOf('Firefox') != -1) {
    alert('Firefox');
  } else if (navigator.userAgent.indexOf('MSIE') != -1 || !!document.documentMode == true) {
    //IF IE > 10
    alert('IE');
  } else {
    alert('unknown');
  }
}

async function exportInventory() {
  const file = `Inwentaryzacja-${new Date().toJSON().split('T')[0]}.xls`;
  const data = await createInventorySpreadsheet();
  const type = 'application/vnd.ms-excel; charset=UTF-8';
  createDownloadFile(file, data, type);
}

async function exportBackup() {
  const file = `StanyBackup-${new Date().toJSON().split('T')[0]}.json`;
  const data = JSON.stringify(await idb.products.toArray());
  const type = 'application/json; charset=UTF-8';
  createDownloadFile(file, data, type);
}

function createDownloadFile(file, data, type) {
  const blob = new Blob([data], { type: type });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = file;
  document.body.appendChild(link);
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );
  document.body.removeChild(link);
  URL.revokeObjectURL(blob);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async evt => {
    try {
      const result = JSON.parse(evt.target.result);
      await idb.products.clear();
      await idb.products.bulkAdd(result);
      generateTimestamp('code');
      globalEvent.value = 'timestamp updated';
      messageBox__database.value = `Baza danych z pliku ${file.name} przywrócona pomyślnie.`;
    } catch (error) {
      console.error('**importBackup()**', error);
      messageBox__database.value = `Błąd podczas przywracania danych.`;
    }
  };
  reader.readAsText(file);
}

function passClick(query) {
  const element = document.querySelector(query);
  element.click();
}
</script>

<template>
  <section>
    <h2>Zarządzanie bazą danych</h2>
    <p>
      <button class="exportBackup__button button accent" @click="exportBackup()">
        <i class="bi bi-file-earmark-arrow-down"></i>
        <span>Backup bazy danych</span>
      </button>
    </p>

    <p>
      <button for="backupImport" class="button" @click="passClick('#backupImport')">
        <i class="bi bi-file-arrow-up"></i>
        <span>Wczytaj backup</span>
      </button>
      <input type="file" name="backupImport" id="backupImport" @change="importBackup($event)" />
    </p>

    <p>
      <button class="accent2" @click="purgeDataBase">
        <i class="bi bi-file-earmark-x"></i>
        <span>Wyczyść bazę danych</span>
      </button>
    </p>
    <p class="messageBox__database">{{ messageBox__database }}</p>
  </section>

  <section class="exportInventory">
    <h2>Inwentaryzacja</h2>
    <p>
      <button class="exportInventory__button button accent" @click="exportInventory()">
        <i class="bi bi-file-earmark-spreadsheet"></i>
        <span>Eksport inwentaryzacji</span>
      </button>
      Eksportuj inwentaryzację do pliku .xls (Excel)
    </p>
    <p>
      <button class="accent2" @click="purgeInventory">
        <i class="bi bi-file-earmark-minus"></i>
        <span>Wyczyść inwentaryzację</span>
      </button>
      Usuń dane ze zlicznia towaru.
    </p>
  </section>
</template>

<style scoped>
#backupImport {
  display: none;
}
</style>
