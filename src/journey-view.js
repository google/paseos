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
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-fab/paper-fab.js';
import '@polymer/iron-icons/iron-icons.js';
import 'macro-carousel/dist/macro-carousel.min.js';

/** Displays and interactive journey */
export class JourneyView extends LitElement {
  /**
   * Decide if the element should render at all.
   * @return {boolean}
   */
  shouldUpdate() {
    return this.active;
  }

  /**
   * Define properties. Properties defined here will be automatically
   * observed.
   */
  static get properties() {
    return {
      guidebook: {type: Object},
      active: {type: Boolean},
    };
  }


  /**
   * In the element constructor, assign default property values.
   */
  constructor() {
    // Must call superconstructor first.
    super();
    this.active = false;
    this.guidebook = {
      title: 'Loading...',
      description: '',
      destinations: [],
    };
  }

  /**
   * Runs only once the first time the element updates.
   * @param {object} changedProperties
   */
  firstUpdated(changedProperties) {
    this.setupServiceWorker();
  }

  /**
   * Handle a message from the service worker.
   * @param {object} event
   */
  handleSWMessage(event) {
    const journey = this.shadowRoot.getElementById('journey');
    console.log('Got event from SW');

    if (journey) {
      if (event.data.action == 'next') {
        journey.next();
      } else if (event.data.action == 'previous') {
        journey.previous();
      }
    } else {
      console.log('journey element not found');
    }
  }

  /**
   * Handle the registration of the service worker.
   * @param {object} reg
   */
  handleSWRegistration(reg) {
    // registration worked
    console.log('Registration succeeded. Scope is ' + reg.scope);
    navigator.serviceWorker.addEventListener('message',
        this.handleSWMessage.bind(this));
  }

  /** Setup the service worker. */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
          .then(this.handleSWRegistration.bind(this))
          .catch(function(error) {
            // registration failed
            console.log('Registration failed with ' + error);
          });
    }
  }

  /**
   * Display a browser notification describing the destination.
   * @param {string} id
   * @param {string} title
   * @param {string} message
   * @param {boolean} hasPrevious
   * @param {boolean} hasNext
   */
  notify(id, title, message, hasPrevious, hasNext) {
    const options = {
      tag: id,
      body: message,
      icon: '/images/paseos-icon.png',
      renotify: true,
      requireInteraction: true,
      actions: [],
    };
    if (hasPrevious) {
      options.actions.push({action: 'previous', title: 'Previous'});
    }
    if (hasNext) {
      options.actions.push({action: 'next', title: 'Next'});
    }

    Notification.requestPermission(function(result) {
      if (result === 'granted') {
        navigator.serviceWorker.ready.then(function(registration) {
          registration.showNotification(title, options);
        });
      }
    });
  }

  /**
   * Open a destination in a new window.
   * @param {string} id
   * @param {string} title
   * @param {string} url
   * @param {string} description
   * @param {boolean} hasPrevious
   * @param {boolean} hasNext
   */
  openDestination(id, title, url, description, hasPrevious, hasNext) {
    if (url == '') {
      if (document.hasFocus()) {
        console.log('Window has focus. Skip notification.');
      } else {
        this.notify(id, title, description, hasPrevious, hasNext);
      }
    } else {
      window.open(url, id + '-destination').focus();
      this.notify(id, title, description, hasPrevious, hasNext);
    }
  }

  /**
   * Open the first destination when a journey first loads.
   * @param {object} guidebook
   * @param {string} id
   */
  preloadJourney(guidebook) {
    const destinations = guidebook.destinations;
    let hasNext = true;
    if (destinations.length == 1) {
      hasNext = false;
    }
    this.openDestination(guidebook.id, guidebook.title, destinations[0].url,
        destinations[0].description, false, hasNext);
  }

  /**
   * Handle newly destination selection.
   * @param {object} event
   */
  handleSelectionChange(event) {
    const selectedIndex = event.detail;
    console.log('selected index ' + selectedIndex);
    let hasPrevious = true;
    let hasNext = true;
    const backButton = this.shadowRoot.getElementById('back-button');
    backButton.style.display = 'block';
    const nextButton = this.shadowRoot.getElementById('next-button');
    nextButton.style.display = 'block';

    if (selectedIndex == 0) {
      hasPrevious = false;
      backButton.style.display = 'none';
      console.log('hide back button');
    }

    if (selectedIndex == this.guidebook.destinations.length) {
      hasNext = false;
      nextButton.style.display = 'none';
      console.log('hide next button');
      this.openDestination(this.guidebook.id, this.guidebook.title,
          '', 'It\'s the end of the journey!', hasPrevious, hasNext);
    } else {
      const destination = this.guidebook.destinations[selectedIndex];
      console.log(JSON.stringify(destination));
      this.openDestination(this.guidebook.id, this.guidebook.title,
          destination.url, destination.description, hasPrevious, hasNext);
    }
  }

  /**
   * Render a destination.
   * @param {object} destination
   * @param {number} index
   * @return {object}
   */
  renderDestination(destination, index) {
    return html`
      <div>
        <p class='destination-description'>${destination.description}</p>
      </div>
      `;
  }

  /**
   * Define the CSS of this element.
   */
  static get styles() {
    return [
      css`
        #journey-container {
          display: flex;
          flex-flow: column;
          height: 100vh;
        }

        #journey {
          flex-grow: 1;
        }

        #journey-description {
          display: block;
          flex-grow: 1;
          margin: 5vmax;
          font-family: Roboto;
          font-weight: bold;
          font-size: 2em;
          white-space: pre-wrap;
        }

        paper-button {
          display: block;
          background: #4285f4;
          color: white;
          text-align: center;
          font-weight: bold;
          font-size: 1.7em;
        }

        #back-button {
          margin-left: 5vmax;
          margin-right: auto;
          margin-bottom: 5vmax;
        }

        #next-button {
          margin-left: auto;
          margin-right: 5vmax;
          margin-bottom: 5vmax;
        }

        #bottom-buttons {
          display: flex;
          width: 100vw;
        }

        .destination-description {
          font-family: Roboto;
          font-size: 2em;
          margin: 5vmax;
          white-space: pre-wrap;
        }

        #end-container {
          display: flex;
        }

        #end-destination {
          display: flex;
          flex: 1;
          padding: 5vmax;
        }

        #end-image {
          flex: 1;
        }
      `,
    ];
  }

  /**
   * Handle edit click.
   */
  handleEditClick() {
    console.log('Edit button clicked');
    const editEvent = new CustomEvent('editGuidebook', {
      detail: this.guidebook,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(editEvent);
  }

  /**
   * Go to next destination.
   */
  next() {
    const journey = this.shadowRoot.getElementById('journey');
    journey.next();
  }

  /**
   * Go to previous destination.
   */
  back() {
    const journey = this.shadowRoot.getElementById('journey');
    journey.previous();
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   * @return {object}
   */
  render() {
    const handleSelectionChange = this.handleSelectionChange.bind(this);
    return html`
      <div id='journey-container'>
      <macro-carousel id='journey'
        @macro-carousel-selected-changed=${handleSelectionChange}>
        ${this.guidebook.destinations.map(this.renderDestination)}
        <div id='end-container'>
        <div id='end-destination'>
        <img id='end-image' src='/images/beach-island-svgrepo-com.svg'/>
        </div>
        </div>
      </macro-carousel>
      <div id='bottom-buttons'>
      <paper-button id='back-button' @click='${this.back.bind(this)}'>
        Back
      </paper-button>
      <paper-button id='next-button' @click='${this.next.bind(this)}'>
        Next
      </paper-button>
      </div>
      </div>
    `;
  }
}

// Register the element with the browser
customElements.define('journey-view', JourneyView);
