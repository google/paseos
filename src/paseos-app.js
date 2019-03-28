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

// Import LitElement base class and html helper function
import {LitElement, html, css} from 'lit-element';
import './guide-book.js';
import './journey-view.js';
import config from '/configure.js';
import {installRouter} from 'pwa-helpers/router.js';

export class PaseoApp extends LitElement {
  /**
   * Define properties. Properties defined here will be automatically
   * observed.
   */
  static get properties() {
    return {
      activePage: {type: String},
      journeyID: {type: String},
    };
  }

  /**
   * In the element constructor, assign default property values.
   */
  constructor() {
    // Must call superconstructor first.
    super();

    this.activePage = 'guide-book';
    this.journeyID = '';

    firebase.initializeApp(config);
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log('user signed in ' + JSON.stringify(user));
      } else {
        console.log('signing in user');
        firebase.auth().signInWithRedirect(provider);
      }
    });

    installRouter((location) => this.navigate(location));
  }

  static get styles() {
    return [
      css`
        .page {
          display: none;
        }

        .page[active] {
          display: block;
        }
      `,
    ];
  }

  navigate(location) {
    console.log('navigate()');
    console.log(location.pathname);
    const currentPath = location.pathname.split('/');
    if (currentPath.length > 1 && currentPath[1] == 'journey') {
      const id = currentPath[2];
      console.log('id: ' + id);
      this.activePage = 'journey-view';
      this.journeyID = id;
    }
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   */
  render() {
    return html`
      <journey-view class='page' journeyID="${this.journeyID}" ?active="${this.activePage === 'journey-view'}"></journey-view>
      <guide-book class='page' ?active="${this.activePage === 'guide-book'}"></guide-book>
    `;
  }
}

// Register the element with the browser
customElements.define('paseos-app', PaseoApp);
