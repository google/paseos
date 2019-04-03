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

/** Displays the departure view for a journey */
export class DepartureView extends LitElement {
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
   * Define the CSS of this element.
   */
  static get styles() {
    return [
      css`
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
   * Handle engage click.
   */
  handleEngageClick() {
    console.log('Engage button clicked');
    const engageEvent = new CustomEvent('engageJourney', {
      detail: this.guidebook,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(engageEvent);
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   * @return {object}
   */
  render() {
    const handleEditClick = this.handleEditClick.bind(this);
    const handleEngageClick = this.handleEngageClick.bind(this);
    return html`
      <div id='departure-container'>
      <div id='title-container'>
      <p id='title'>${this.guidebook.title}</p>
      <paper-fab id='edit-button' icon='create' @click='${handleEditClick}'>
      </paper-fab>
      </div>
      <div id='journey-description'>
      <p>${this.guidebook.description}</p>
      </div>
      <div id='bottom-buttons'>
      <paper-button id='engage-button' @click='${handleEngageClick}'>
        Engage!
      </paper-button>
      </div>
      </div>
    `;
  }
}

// Register the element with the browser
customElements.define('departure-view', DepartureView);
