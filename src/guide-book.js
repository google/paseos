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
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-fab/paper-fab.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/font-roboto/roboto.js';

/** Creates and edits guidebooks */
export class GuideBook extends LitElement {
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

    // Initialize properties
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
  }

  /**
   * Add a destination to the guidebook.
   */
  addDestination() {
    this.guidebook.destinations.push({
      url: '',
      description: '',
    });
    this.requestUpdate();
  }

  /**
   * Handle write button click.
   */
  handleWriteClick() {
    const writeEvent = new CustomEvent('writeGuidebook', {
      detail: this.guidebook,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(writeEvent);
  }

  /**
   * Render a single destination editor.
   * @param {object} destination
   * @param {number} index
   * @return {object}
   */
  renderDestination(destination, index) {
    const guidebook = this.guidebook;
    /**
     * Handle a change in the description text.
     * @param {object} e
     */
    function handleDescriptionChange(e) {
      guidebook.destinations[index].description = e.target.value;
    }

    /**
     * Handle a change in the URL.
     * @param {object} e
   */
    function handleURLChange(e) {
      guidebook.destinations[index].url = e.target.value;
    }

    return html`
      <paper-card>
      <paper-input label='URL' no-label-float value='${destination.url}'
        @change='${handleURLChange}'>
      </paper-input>
      <paper-textarea label='Description' value='${destination.description}'
        @value-changed='${handleDescriptionChange}'>
      </paper-textarea>
      </paper-card>
      `;
  }

  /**
   * Define the CSS of this element.
   */
  static get styles() {
    return [
      css`
        paper-card {
          padding: 2vmax;
          margin-top: 2vmax;
          margin-bottom: 2vmax;
        }

        #inputs {
          display: flex;
          flex-direction: column;
          margin-top: 0;
          margin-left: 5vmax;
          margin-right: 5vmax;
          margin-bottom: 5vmax;
        }

        #add-button {
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        #write-button {
          display: block;
          margin-left: auto;
          background: #4285f4;
          color: white;
          text-align: center;
          font-weight: bold;
        }

        #title {
          font-family: Roboto;
          font-size: 2em;
          margin-top: 5vmax;
          margin-left: 5vmax;
          margin-right: 5vmax;
          margin-bottom: 1vmax;
        }

        paper-button {
          display: block;
          background: #4285f4;
          color: white;
          text-align: center;
          font-weight: bold;
          font-size: 1.7em;
        }

        :host { display: block; }

        :host([hidden]) { display: none; }
      `,
    ];
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   * @return {object}
   */
  render() {
    const guidebook = this.guidebook;

    /**
     * Handle a change in the title.
     * @param {object} e
     */
    function handleTitleChange(e) {
      guidebook.title = e.target.value;
    }

    /**
     * Handle a change in the description.
     * @param {object} e
     */
    function handleDescriptionChange(e) {
      guidebook.description = e.target.value;
    }

    const handleWriteClick = this.handleWriteClick.bind(this);

    return html`
      <p id='title'>Create a new journey</p>

      <div id='inputs'>
      <paper-card>
      <paper-input label='Title' no-label-float value='${guidebook.title}'
        @change='${handleTitleChange}'>
     </paper-input>
      <paper-textarea label='Description' value='${guidebook.description}'
        @value-changed='${handleDescriptionChange}'>
      </paper-textarea>
      </paper-card>

      ${guidebook.destinations.map(this.renderDestination.bind(this))}
      <paper-fab id='add-button' icon='add' @click='${this.addDestination}'>
      </paper-fab>
      <paper-button id='write-button' @click='${handleWriteClick}'>
        Go
      </paper-button>
      </div>
    `;
  }
}

// Register the element with the browser
customElements.define('guide-book', GuideBook);
