/*
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {openDB} from 'idb';

const databaseName = 'atlas';

/** IndexedDB database adapter */
export default class IndexedDBAdapter {
  /**
   * @param {object} config
   */
  constructor(config) {
    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
    } else {
      console.log('This browser supports IndexedDB');
      this.dbPromise = openDB(databaseName, 1, {
        upgrade(upgradeDb) {
          console.log('making a new object store');
          if (!upgradeDb.objectStoreNames.contains('guidebooks')) {
            console.log('creating a new store');
            upgradeDb.createObjectStore('guidebooks', {autoIncrement: true});
          }
        },
      });
    }
  }

  /**
   * Write the guidebook to IndexedDB.
   * @param {object} guidebook
   * @return {Promise} of a string ID
   */
  write(guidebook) {
    console.log('Writing guide book to IndexedDB');
    console.log(JSON.stringify(guidebook, undefined, 2));
    return this.dbPromise
        .then((db) => {
          const tx = db.transaction('guidebooks', 'readwrite');
          return tx.store.add(guidebook);
        })
        .then((result) => {
          console.log('Wrote guide book to with id ' + result);
          return result;
        });
  }

  /**
   * Read a guidebook from IndexedDB.
   * @param {string} id
   * @return {Promise} of a guidebook object
   */
  read(id) {
    console.log('Reading guide book from IndexedDB');
    return this.dbPromise
        .then((db) => {
          const tx = db.transaction('guidebooks', 'readonly');
          return tx.store.get(Number(id));
        });
  }
}
