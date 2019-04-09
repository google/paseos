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
import './departure-view.js';
import './guide-book.js';
import './journey-view.js';
import {installRouter} from 'pwa-helpers/router.js';
import FirebaseAdapter from './firebase-adapter.js';
import IndexedDBAdapter from './indexeddb-adapter.js';

/** Application shell */
export class PaseoApp extends LitElement {
  /**
   * Define properties. Properties defined here will be automatically
   * observed.
   */
  static get properties() {
    return {
      activePage: {type: String},
      guidebook: {type: Object},
    };
  }

  /**
   * In the element constructor, assign default property values.
   */
  constructor() {
    // Must call superconstructor first.
    super();

    this.activePage = 'guide-book';
    this.guidebook = {
      title: '',
      description: '',
      destinations: [
        {
          url: '',
          description: '',
        },
      ],
    };

    // Replace ./data.json with your JSON feed
    fetch('../firebase-config.json')
        .then((response) => {
          return response.json();
        })
        .then((config) => {
          // Work with JSON data here
          console.log(JSON.stringify(config));
          this.databaseAdapter = new FirebaseAdapter(config);
          installRouter((location) => this.navigate(location));
        })
        .catch((err) => {
          // Do something for an error here
          this.databaseAdapter = new IndexedDBAdapter();
          installRouter((location) => this.navigate(location));
        });
  }

  /**
   * Define the CSS of this element.
   */
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

  /**
   * Change browser URL.
   * @param {string} location
   */
  navigate(location) {
    const currentPath = location.pathname.split('/');
    if (currentPath.length > 1 && currentPath[1] == 'journey') {
      const id = currentPath[2];
      this.activePage = 'departure-view';
      this.databaseAdapter.read(id).then((guidebook) => {
        guidebook.id = id;
        this.guidebook = guidebook;
      });
    } else {
      this.activePage = 'guide-book';
    }
  }

  /**
   * Handle writeGuidebook event.
   * @param {object} e
   */
  handleWriteGuidebook(e) {
    const guidebook = e.detail;
    this.databaseAdapter.write(guidebook)
        .then(function(id) {
          console.log('Wrote guidebook with id: ', id);
          window.open('/journey/' + id, '_self');
        })
        .catch(function(error) {
          console.error('Error writing guidebook: ', error);
        });
  }

  /**
   * Handle editGuidebook event.
   * @param {object} e
   */
  handleEditGuidebook(e) {
    console.log('handle edit guidebook');
    this.guidebook = e.detail;
    window.history.pushState('', '', '/');
    const top = new URL('/', window.location.href);
    this.navigate(top);
  }

  /**
   * Handle engageJourney event.
   * @param {object} e
   */
  handleEngageJourney(e) {
    console.log('handle engage journey');
    this.guidebook = e.detail;
    this.activePage = 'journey-view';
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   * @return {object}
   */
  render() {
    const handleWriteGuidebook = this.handleWriteGuidebook.bind(this);
    const handleEditGuidebook = this.handleEditGuidebook.bind(this);
    const handleEngageJourney = this.handleEngageJourney.bind(this);
    return html`
      <departure-view class='page' guidebook='${JSON.stringify(this.guidebook)}'
        @editGuidebook='${handleEditGuidebook}'
        @engageJourney='${handleEngageJourney}'
        ?active="${this.activePage === 'departure-view'}">
      </departure-view>
      <journey-view class='page' guidebook='${JSON.stringify(this.guidebook)}'
        ?active="${this.activePage === 'journey-view'}">
      </journey-view>
      <guide-book class='page' guidebook='${JSON.stringify(this.guidebook)}'
        @writeGuidebook='${handleWriteGuidebook}'
        ?active="${this.activePage === 'guide-book'}">
      </guide-book>
    `;
  }
}

// Register the element with the browser
customElements.define('paseos-app', PaseoApp);
