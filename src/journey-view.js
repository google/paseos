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
import './guide-book.js';

export class JourneyView extends LitElement {
  // Only render this page if it's actually visible.
  shouldUpdate() {
    return this.active;
  }

  /**
   * Define properties. Properties defined here will be automatically
   * observed.
   */
  static get properties() {
    return {
      journeyID: {type: String},
      engaged: {type: Boolean},
      editing: {type: Boolean},
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
    this.journeyID = '';
    this.engaged = false;
    this.editing = false;
    this.guidebook = {
      destinations: [],
    };
  }

  firstUpdated(changedProperties) {
    this.setupServiceWorker();
  }

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

  handleSWRegistration(reg) {
    // registration worked
    console.log('Registration succeeded. Scope is ' + reg.scope);
    navigator.serviceWorker.addEventListener('message',
        this.handleSWMessage.bind(this));
  }

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

  openStop(id, title, url, description, hasPrevious, hasNext) {
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

  preloadJourney(guidebook, id) {
    const destinations = guidebook.destinations;
    let hasNext = true;
    if (destinations.length == 1) {
      hasNext = false;
    }
    this.openStop(id, guidebook.title, destinations[0].url, destinations[0].description, false,
        hasNext);
  }

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
      this.openStop(this.journeyID, this.guidebook.title,
          '', 'It\'s the end of the journey!', hasPrevious, hasNext);
    } else {
      const destination = this.guidebook.destinations[selectedIndex];
      console.log(JSON.stringify(destination));
      this.openStop(this.journeyID, this.guidebook.title, destination.url,
          destination.description, hasPrevious, hasNext);
    }
  }

  renderStop(destination, index) {
    return html`
      <div><p class='destination-description'>${destination.description}</p></div>
      `;
  }

  readFromFirebase(id) {
    const db = firebase.firestore();
    const guidebookPromise = db.collection('guidebooks').doc(id).get().then((doc) => {
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

  async performUpdate() {
    if (this.journeyID) {
      console.log('getting guidebook');
      await this.readFromFirebase(this.journeyID).then((guidebook) => {
        console.log('got guidebook');
        console.log(JSON.stringify(guidebook));
        this.guidebook = guidebook;
      });
    }
    super.performUpdate();
  }

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

        #departure-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        #title {
          display: block;
          flex-grow: 1;
          margin-left: 5vmax;
          margin-top: 5vmax;
        	font-family: Roboto;
          font-weight: bold;
        	font-size: 4em;
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

        #engage-button {
          margin-left: auto;
          margin-right: 5vmax;
          margin-bottom: 5vmax;
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

        #title-container {
          display: flex;
          width: 100vw;
        }

        #bottom-buttons {
          display: flex;
          width: 100vw;
        }

        #edit-button {
          display: block;
          margin-top: 5vmax;
          margin-right: 5vmax;
        }

        .destination-description {
        	font-family: Roboto;
        	font-size: 2em;
          margin: 5vmax;
          white-space: pre-wrap;
        }

        #edit-view {
          display: block;
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

  engage() {
    console.log('engage');
    this.engaged = true;
    this.preloadJourney(this.guidebook, this.journeyID);
  }

  edit() {
    console.log('edit');
    this.editing = true;
  }

  next() {
    const journey = this.shadowRoot.getElementById('journey');
    journey.next();
  }

  back() {
    const journey = this.shadowRoot.getElementById('journey');
    journey.previous();
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   */
  render() {
    if (this.engaged) {
      return html`
        <div id='journey-container'>
        <macro-carousel id='journey' @macro-carousel-selected-changed=${this.handleSelectionChange.bind(this)}>
          ${this.guidebook.destinations.map(this.renderStop)}
          <div id='end-container'><div id='end-destination'><img id='end-image' src='/images/beach-island-svgrepo-com.svg'/></div></div>
        </macro-carousel>
        <div id='bottom-buttons'>
        <paper-button id='back-button' @click='${this.back.bind(this)}'>Back</paper-button>
        <paper-button id='next-button' @click='${this.next.bind(this)}'>Next</paper-button>
        </div>
        </div>
      `;
    } else if (this.editing) {
      return html`
        <guide-book id='edit-view' guidebook='${JSON.stringify(this.guidebook)}' active></guide-book>
      `;
    } else {
      return html`
        <div id='departure-container'>
        <div id='title-container'>
        <p id='title'>${this.guidebook.title}</p>
        <paper-fab id='edit-button' icon='create' @click='${this.edit}'></paper-fab>
        </div>
        <div id='journey-description'>
        <p>${this.guidebook.description}</p>
        </div>
        <div id='bottom-buttons'>
        <paper-button id='engage-button' @click='${this.engage}'>Engage!</paper-button>
        </div>
        </div>
      `;
    }
  }
}

// Register the element with the browser
customElements.define('journey-view', JourneyView);
