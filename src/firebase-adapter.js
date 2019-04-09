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

/** Firebase database adapter */
export default class FirebaseAdapter {
  /**
   * @param {object} config
   */
  constructor(config) {
    firebase.initializeApp(config);
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
      } else {
        firebase.auth().signInWithRedirect(provider);
      }
    });
  }

  /**
   * Write the guidebook to the database.
   * @param {object} guidebook
   * @return {Promise}
   */
  write(guidebook) {
    console.log('Writing guide book');
    console.log(JSON.stringify(guidebook, undefined, 2));
    return new Promise((resolve, reject) => {
      firebase.firestore().collection('guidebooks').add(guidebook)
          .then(function(ref) {
            resolve(ref.id);
          })
          .catch(function(error) {
            reject(error);
          });
    });
  }

  /**
   * Read a guidebook from firebase database.
   * @param {string} id
   * @return {Promise}
   */
  read(id) {
    const db = firebase.firestore();
    const guidebookPromise = db.collection('guidebooks').doc(id).get()
        .then((doc) => {
          if (doc.exists) {
            console.log(`${doc.id} => ${doc.data().title}`);
            return doc.data();
          } else {
            // doc.data() will be undefined in this case
            console.log('No such journey!');
          }
        }).catch(function(error) {
          console.log('Error getting document:', error);
        });

    return guidebookPromise;
  }
}
