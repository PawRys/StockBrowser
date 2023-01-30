<script setup>
import { ref, inject } from 'vue';
import { db as idb } from '../utils/dexiedb.js';
import {
  defineDataType,
  fetchProducts,
  formatToArray,
  removeGarbage,
  formatToNamedArray,
  jettisonUnusedProperties,
  findProductErrors,
  mergeWithLocalData,
} from './DataCollector__.js';
import ExampleData from './DataCollector__ExampleData.vue';

const importedData = ref();
const importedDataType = ref(null);
const messageBox = ref('');
const globalEvent = inject('GlobalEvents');
const currentAppTab = inject('currentAppTab');

function checkDataType() {
  const { message, data } = defineDataType(importedData.value);
  messageBox.value = message;
  importedDataType.value = data;
}

function textareaClear() {
  importedData.value = '';
  checkDataType();
}

async function textareaPaste(e) {
  const permission = await navigator.permissions.query({ name: 'clipboard-read' }).catch(err => {
    messageBox.value = `🥺 Funkcja wklejania ze schowka jest zablokowana. Wklej dane w pole tekstowe ręcznie.`;
    console.error('PERMISSION ERROR', err);
  });
  if (permission.state == 'denied') {
    alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`);
    return;
  } else {
    console.log(await navigator.clipboard.read());
    const clipboardData = await navigator.clipboard
      .readText()
      .catch(reason => console.error(reason));
    importedData.value = clipboardData;
    checkDataType();
  }
}

async function importData() {
  console.time('importData()');
  const importedDataRef = importedData.value;
  const importedDataTypeRef = importedDataType.value;
  let data, message, server_msg;
  messageBox.value = 'Loading... ⏳';

  // IMPORT FROM CLOUD
  if (importedDataTypeRef.match(/code/i)) {
    const fetchURL = 'https://bossman.hekko24.pl/stock_browser_server/index.php';
    const response = await fetchProducts(fetchURL, importedDataRef);
    data = response.data;
    server_msg = response.message;
    if (server_msg === 'positive') server_msg = '📜 Pobrano dane z chmury ✔';
    if (server_msg === 'negative') server_msg = 'Podany kod jest nieaktualny. ❌';
  }

  // IMPORT LOCAL
  if (importedDataTypeRef.match(/stocks|prices/i)) {
    data = importedDataRef;
    data = formatToArray(data);
    data = removeGarbage(data, importedDataTypeRef);
    data = formatToNamedArray(data, importedDataTypeRef);
  }

  if (data) {
    message = await mergeWithLocalData(data, importedDataTypeRef);
    generateTimestamp(importedDataTypeRef);
  }

  messageBox.value = server_msg || message;
  console.timeEnd('importData()');
}

async function generateTimestamp(dataType) {
  if (dataType.match(/stocks|code/i)) {
    await idb.timestamps.put({
      id: 'stocks',
      timestamp: new Date(),
    });
    globalEvent.value = 'stocks updated';
  }
  if (dataType.match(/prices|code/i)) {
    await idb.timestamps.put({
      id: 'prices',
      timestamp: new Date(),
    });
    globalEvent.value = 'prices updated';
  }
}
</script>

<template>
  <section class="data-collector" id="data-collector">
    <h2>Wczytaj dane</h2>
    <textarea
      id="datainsert"
      name="datainsert"
      rows="10"
      placeholder="Tutaj wklej dane ze schowka"
      v-model="importedData"
      @input="checkDataType">
    </textarea>

    <p class="messageBox" :class="{ visible: messageBox, hidden: !messageBox }">
      {{ messageBox }}
    </p>

    <p class="buttons">
      <button class="button" @click="textareaClear">
        <span>Wyczyść</span>
        <i class="bi bi-backspace"></i>
      </button>

      <button class="button" @click="textareaPaste">
        <span>Wklej schowek</span>
        <i class="bi bi-save"></i>
      </button>

      <button class="button accent" @click="importData" v-if="importedDataType">
        <span>Zatwierdź</span>
        <i class="bi bi-check2"></i>
      </button>
    </p>
  </section>

  <example-data />

  <section class="data-collector__manual">
    <h3>Instrukcja wprowadzania danych magazynowych z Symfonii</h3>
    <input class="openclose__input" type="checkbox" id="manual-symfonia" />
    <label class="openclose__label" for="manual-symfonia"></label>
    <ol>
      <li>
        Wyszukaj kolejno: <b>Kartoteki</b> > <b>Towary</b> > <b>Zestawienia</b>
        <ul>
          <li>Dla wczytania cen 💵 towarów wybierz <b>Stany magazynowe towarów...</b></li>
          <li>Dla wczytania stanów 📦 towarów wybierz <b>Stany i rezerwacje towarów...</b></li>
        </ul>
      </li>
      <li>
        Należy wybrać poniższe ustawienia:
        <ul>
          <li>
            <b>Zestawienie dla magazynu: </b><i>dowolny magazyn</i><br />
            Uwaga. Jeśli wybierzesz <i>wszystkie</i> będziesz widział stany wszystkich magazynów, do
            których masz uprawnienia w Symfonii.
          </li>
          <li><b>Podsumowanie co: </b> <i>brak</i></li>
          <li>
            <b>Zestawienie dla jednostki: </b>
            <i><u>ewidencyjna</u>, dodatkowa1, dodatkowa2 lub domyślna</i>
          </li>
          <li><b>Prezentuj stany zerowe: </b><i>zaznaczone 🗹</i></li>
          <li>Niewymienione wyżej opcje: <i>najbezpieczniej odznaczyć ☐</i></li>
        </ul>
      </li>
      <li>Kliknij <b>schowek</b></li>
      <li>Wklej dane ze schowka w <a href="#datainsert">pole tekstowe</a> na górze strony</li>
      <li>Jeśli wprowadzone dane są poprawne pojawi się przycisk <b>Zatwierdź</b></li>
      <li>
        Przejdź na stronę
        <a href="#app" @click="currentAppTab = 'BrowserTab'">Lista</a>, aby móc przeglądać stany
        magazynowe
      </li>
    </ol>

    <h3>Instrukcja wymiany danych za pomocą chmury</h3>
    <input class="openclose__input" type="checkbox" id="manual-chmura" />
    <label class="openclose__label" for="manual-chmura"></label>
    <ul>
      <li>Wpisz 4-cyfrowy kod w <a href="#datainsert">pole tekstowe</a>.</li>
      <li>
        Ważne! Wpolu tekstowym nie wpisuj przypadkowych spacji i innych znaków. Inaczej kod "nie
        wejdzie"
      </li>
      <li>Kod jest jednorazowy i ważny przez 2 minuty od wygenerowania.</li>
    </ul>
  </section>
</template>

<style scoped>
.data-collector > * {
  width: 100%;
}

.messageBox {
  margin: 0;
  transition-property: height, scale;
  transition-duration: var(--transition-duration);
}

.messageBox.hidden {
  height: 0ch;
  scale: 1 0;
}

.messageBox.visible {
  height: 2.5ch;
  scale: 1 1;
}

.openclose__input {
  display: none;
}
.openclose__label {
  color: var(--accent-color);
}
.openclose__input + *::after {
  content: 'rozwiń';
}
.openclose__input:checked + *::after {
  content: 'zwiń';
}
.openclose__input + * + * {
  display: none;
}
.openclose__input:checked + * + * {
  display: block;
}
</style>
