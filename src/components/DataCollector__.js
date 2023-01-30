import { ref } from 'vue';
import { db as idb } from '../utils/dexiedb.js';
import { calcQuant, calcPrice } from '../utils/functions.js';
import { openDialog } from 'vue3-promise-dialog';
import Dialog_MergeFetchedData from '../utils/Dialog_MergeFetchedData.vue';

export function defineDataType(input) {
  let dataType, message;
  if (!input) {
    dataType = null;
    message = ``;
  } else {
    dataType = false;
    message = `Nie rozpoznano danych. ❌`;
  }
  const isStocks = /Stany i rezerwacje towarów/i.test(input);
  const isCorrectStockColumns =
    /Kod towaru		nazwa towaru		jm		stan handlowy	rezerwacje R	rezerwacje A		stan  całkowity	/i.test(input);
  if (isStocks && isCorrectStockColumns) {
    dataType = 'stocks';
    message = `📦 Rozpoznano stany i rezerwacje towarów.`;
  }

  const isPrices = /Stany magazynowe towarów/i.test(input);
  const isCorrectPriceColumns = /Kod towaru		nazwa towaru		jm		stan	cena	wartość		/i.test(input);
  if (isPrices && isCorrectPriceColumns) {
    dataType = 'prices';
    message = `💵 Rozpoznano ceny zakupowe towarów.`;
  }

  const isProdutsList = /Kod	Nazwa/i.test(input);
  const isProdutsItem = /\d+s\d+\/\d+/i.test(input);
  if (isProdutsList && isProdutsItem) {
    // dataType = 'products';
    // message = `📜 Rozpoznano listę produktów.`;
  }

  const isFullExchangeCode = /^\d{4}$/i.test(input);
  if (isFullExchangeCode) {
    dataType = 'code';
    message = `🔢 Rozpoznano kod wymiany danych.`;
  }

  const isPartExchangeCode = /^\d{1,3}$/i.test(input);
  if (isPartExchangeCode) {
    dataType = null;
    message = ``;
  }

  return { data: dataType, message: message };
}

export async function fetchProducts(fetchURL, pinCode) {
  const URLparams = {
    action: 'request',
    pin: pinCode,
  };

  const fetchSettings = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: new URLSearchParams(URLparams).toString(),
  };

  try {
    let response = await fetch(fetchURL, fetchSettings);
    return await response.json();
  } catch (error) {
    console.error(error);
    return { message: 'Problem z połączeniem ❌' };
  }
}

export function formatToArray(data) {
  const lines = data.match(/[^\r\n]+/g);
  let result = [];
  for (let line of lines) {
    // const row = line.match(/[^\t]+/g);
    const row = line.split(/\t/);
    result.push(row);
  }
  return result;
}

export function removeGarbage(data, dataType) {
  const forbidden = /(stany|kod|podsumowanie|dostawa|transport|usługa|zamówienie)/gi;
  let result = [];

  for (let row of data) {
    if (row.length === 0) continue;
    if (!!row.find(item => item.match(forbidden))) continue;
    if (dataType === 'prices' && row.filter(item => item.length > 0).length !== 6) continue;
    if (dataType === 'stocks' && row.filter(item => item.length > 0).length !== 7) continue;
    // if (dataType === 'products' && row.length !== 2) continue;
    result.push(row);
  }
  return result;
}

export function jettisonUnusedProperties(data) {
  const excludes = [
    'code',
    'name',
    'size',
    'group',
    'errors',
    'tCub',
    'aCub',
    'pCub',
    'iCub',
    'iSqr',
    'iPcs',
    'unit',
    'sizeGroup',
  ];

  for (const rowIndex in data) {
    const keys = Object.keys(data[rowIndex]);
    for (const key of keys) {
      if (excludes.findIndex(i => i === key) < 0) {
        delete data[rowIndex][key];
      }
    }
  }

  return data;
}

export function formatToNamedArray(data, dataType) {
  let result = [];
  for (const row of data) {
    let product = {};
    let productCode = row[0] || null;
    let productName = row[2] || 'Brak opisu towaru';
    let productUnit = /^(m3|m2|szt)$/.test(row[4]) ? row[4] : null;
    let productTotal = null;
    let productAvabl = null;
    let productPrice = null;

    const productSize = getProductSize(productName);
    const productGroup = getProductGroup(`${productCode} ${productName}`);
    const productSizeGroup = getproductSizeGroup(productSize);

    Object.assign(product, {
      code: productCode,
      name: productName,
      size: productSize,
      unit: productUnit,
      group: productGroup,
      sizeGroup: productSizeGroup,
    });
    if (dataType.match(/stocks|code/i)) {
      productTotal = row[10]?.replace(',', '.') * 1;
      productAvabl = row[6]?.replace(',', '.') * 1;
      Object.assign(product, {
        tCub: calcQuant(productSize, productTotal, productUnit, 'm3'),
        aCub: calcQuant(productSize, productAvabl, productUnit, 'm3'),
      });
    }
    if (dataType.match(/prices|code/i)) {
      productTotal = row[6]?.replace(',', '.') * 1;
      productPrice = row[7]?.replace(',', '.') * 1;
      Object.assign(product, {
        tCub: calcQuant(productSize, productTotal, productUnit, 'm3'),
        pCub: calcPrice(productSize, productPrice, productUnit, 'm3'),
      });
    }
    result.push(product);
  }
  return result;
}

export function findProductErrors(data) {
  let result = [];
  for (let product of data) {
    let errors = [];
    if (!product.unit?.match(/m3|m2|szt/i)) {
      errors.push(`Nieznana jednostka miary "${product.unit}". Obliczenia niemożliwe.`);
    }
    if (!product.unit) {
      errors.push(`Nie znaleziono jednostki miary. Obliczenia niemożliwe.`);
    }
    if (!product.size) {
      errors.push('Brak prawidłowego wymiaru w opisie. Obliczenia niemożliwe.');
    }

    if (!!errors.length) {
      const appendRrror = product.group + ' ERROR';
      Object.assign(product, { errors: errors, group: appendRrror });
    } else {
      Object.assign(product, { errors: [] });
    }
    result.push(product);
  }
  return result;
}

function getProductSize(line) {
  const fullSizeB = line?.match(/\d+[,\.]?\d*x\d+x\d+/i);
  return fullSizeB ? fullSizeB[0].replace(',', '.') : null;
}

function getproductSizeGroup(size) {
  if (!size) return 0;
  let num = size.split('x');
  return `${Math.round(num[1] / 305)}x${Math.round(num[2] / 305)}'`;
}

function getProductGroup(input) {
  let group = [];

  if (/error/i.test(input)) group.push('ERROR');
  // if (/ppl/i.test(input)) group.push('PPL');
  // if (/hpl/i.test(input)) group.push('HPL');
  if (/osb/i.test(input)) group.push('OSB');
  if (/topol/i.test(input)) group.push('China');
  // if (/honey/i.test(input)) group.push('Honey');
  // if (/PF|poli/i.test(input)) group.push('Poliform');
  if (/RP|radiata/i.test(input)) group.push('RP');
  if (/EUK|eukaliptus/i.test(input)) group.push('EUK');
  if (/wodo|wd|ext|\bE\b/i.test(input)) group.push('WD');
  if (/such|mr|int/i.test(input)) group.push('MR');
  if (/mel|\bM\/M\b/i.test(input)) group.push('MM');
  // if (/heksa|F\/WH/i.test(input)) group.push('Heksa');
  // if (/less|transpa/i.test(input)) group.push('C.less');
  if (/folio|lamino|\bF\/F\b/i.test(input)) group.push('FF');
  if (/anty|\bF\/W\b|\bW\/W\b/i.test(input)) group.push('FW');
  if (!group.length) group.push('??');

  group.sort();
  const result = group.reduce((a, c) => `${a} ${c}`, '');
  return result.trim();
}

export async function mergeWithLocalData(importedData, dataType) {
  let message = 'Zapisuję...';
  let answer = false;
  let localData = await idb.products.toArray();
  localData = findProductErrors(localData);
  localData = jettisonUnusedProperties(localData);
  importedData = findProductErrors(importedData);
  importedData = jettisonUnusedProperties(importedData);

  const hasNewInventory = hasInventory(importedData);
  if (hasNewInventory) {
    answer = await openDialog(Dialog_MergeFetchedData);
    // if (answer === 'merge') data = await mergeInventory(data);
    if (answer === 'local') importedData = await clearAllInventory(importedData);
    if (answer === 'cloud') localData = await clearAllInventory(localData);
  }

  if (dataType.match(/stocks|code/i)) {
    clearAllStocks(localData);
  }
  if (dataType.match(/prices|code/i)) {
    clearAllPrices(localData);
  }

  for (const importedProduct of importedData) {
    const localProductIndex = localData.findIndex(row => row.code === importedProduct.code);
    const isNewProduct = localProductIndex < 0 ? true : false;
    const localProduct = isNewProduct ? undefined : localData[localProductIndex];
    const currentProduct = isNewProduct ? importedProduct : localProduct;

    // Merge inventory data
    if (isNewProduct === false && answer === 'merge') {
      if (!!importedProduct.iCub)
        importedProduct.iCub = `${localProduct.iCub || '0'} + ${importedProduct.iCub || '0'}`;

      if (!!importedProduct.iSqr)
        importedProduct.iSqr = `${localProduct.iSqr || '0'} + ${importedProduct.iSqr || '0'}`;

      if (!!importedProduct.iPcs)
        importedProduct.iPcs = `${localProduct.iPcs || '0'} + ${importedProduct.iPcs || '0'}`;
    }

    // Update with imported data
    if (isNewProduct === false) {
      Object.assign(currentProduct, importedProduct);
    }

    const cursor = isNewProduct ? localData.length : localProductIndex;
    const replace = isNewProduct ? 0 : 1;
    localData.splice(cursor, replace, currentProduct);
  }

  try {
    await idb.products.clear();
    await idb.products.bulkAdd(localData);
    if (dataType === 'products') message = '📜 Zaktualizowano produkty ✔';
    if (dataType === 'stocks') message = '📦 Zaktualizowano ilości ✔';
    if (dataType === 'prices') message = '💵 Zaktualizowano ceny ✔';
    if (dataType === 'code') message = '📜 Pobrano dane z chmury ✔';
  } catch (err) {
    console.error(err);
    message = 'Coś poszło nie tak ❗';
  }

  return message;
}

function clearAllStocks(data) {
  for (const row of data) {
    row.tCub = 0;
    row.aCub = 0;
  }
}
function clearAllPrices(data) {
  for (const row of data) {
    row.pCub = 0;
  }
}
async function clearAllInventory(data) {
  return new Promise((resolve, reject) => {
    for (const row of data) {
      delete row.iCub;
      delete row.iSqr;
      delete row.iPcs;
    }
    resolve(data);
  });
}
function hasInventory(data) {
  // console.log(data);
  if (!data) return;
  let result = false;
  for (const row of data) {
    if (row?.iCub || row?.iSqr || row?.iPcs) {
      result = true;
      break;
    }
  }
  return result;
}
