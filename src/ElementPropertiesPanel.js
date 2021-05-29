import { html, css, LitElement } from 'lit';
import { repeat } from 'lit-html/directives/repeat';

/**
 * `element-properties-panel`
 *
 *
 * @customElement element-properties-panel
 * @demo demo/index.html
 */
export class ElementPropertiesPanel extends LitElement {

  static get properties() {
    return {
      element: {
        type: Object
      },
      elementProperties: {
        type: Object,
        observer: '_handleElementPropertiesChanged'
      },
      propertiesTitle: {
        type: String
      }
    };
  }

  constructor() {
    super();
  }

  static get styles() {
    return css`
     :host {
        display: block;

        height: 100%;
        overflow: auto;
        box-sizing: border-box;
      }

      .content-wrapper {
        padding: .5em;
      }

      #title {
        display: flex;
        flex-direction: column;
        text-transform: uppercase;
        font-weight: 500;
        font-size: 12px;
        margin-bottom: 5px;
      }

      label, input, select, textarea {
        display: inline-block;
        color: white;
        background: transparent;
        height: 24px;
        margin: 2px 0;
        padding: 0 2px 0 4px;
        width: 110px;
      }

      label, .style-label {
        box-sizing: border-box;
        display: inline-block;
        margin-right: 20px;
        font-size: 13px;
        width: 90px;
      }

      input, select, textarea {
        border: 1px solid var(--input-border-color);
        border-radius: 5px;
        box-sizing: border-box;
        font-size: 11px;
      }

      input, textarea {
        margin-left: 4px;
      }

      input[disabled] {
        color: #BDBDBD;
      }

      select {
        background: transparent;
      }

      select:focus option {
        color: black;
      }

      textarea {
        resize: none;
        overflow: hidden;
        min-height: 24px;
        max-height: 100px;
      }
    `;
  }

  render() {
    return html`
    <div id="title">${this.propertiesTitle}</div>

    <div class="content-wrapper">
      <div>
        ${repeat(
          this._toPropertiesArray(this.elementProperties), // the array of items
          item => item.name, // the identify function
          (item, i) => {
            if ((item.type === 'text') && (item.multiline)) {
              return html`
                <label class="animated fadeIn">${item.name}</label>
                <textarea name=${item.name} @input=${this._handleInput} @change=${this._handleInput} @focus=${this._handleInput} class="animated fadeIn"
                          ?readonly=${item.readonly}>${this._getItemValue(item)}</textarea>
              `;
            } else {
              return html`
                <label class="animated fadeIn">${item.name}</label>
                <input name=${item.name} type=${item.type} value=${this._getItemValue(item)} ?checked=${this._getItemValue(item)} @input=${this._handleInput} @change=${this._handleInput} class="animated fadeIn" ?readonly=${item.readonly}>
              `;
            }
          } // the template for each item
        )}
      </div>
    </div>
    `;
  }

  _toPropertiesArray(elementProperties) {
    let propertiesArray = [];
    if (!elementProperties) {
      return propertiesArray;
    }

    Object.keys(elementProperties).forEach(key => {
      let property = {};
      property.name = key;
      property.value = elementProperties[key].value;
      switch (elementProperties[key].type) {
        case Boolean:
          property.type = 'checkbox';
          property.checked = elementProperties[key].value;
          break;
        default:
          property.type = 'text';
          property.value = elementProperties[key].value;
      }
      // readonly attribute
      property.readonly = (elementProperties[key].hasOwnProperty('readonly')) ? elementProperties[key].readonly : false;

      // multiLine attribute
      property.multiline = (elementProperties[key].hasOwnProperty('multiline')) ? elementProperties[key].multiline : false;

      // only show the property if it is not hidden
      if (!elementProperties[key].hasOwnProperty('hidden') || !elementProperties[key].hidden) {
        propertiesArray.push(property);
      }
    });

    return propertiesArray;
  }

  _getItemValue(item) {
    return this.element[item.name];
  }

  _handleInput(e) {
    if (e.target.type === 'checkbox') {
      this.element[e.target.name] = e.target.checked;
    } else {
      this.element[e.target.name] = e.target.value.trim();

      if (e.target.type === 'textarea') {
        e.target.style.height = '10px';
        e.target.style.height = (e.target.scrollHeight) + 5 + 'px';
      }
    }
    return true;
  }

  _handleElementPropertiesChanged(newValue) {
    if (Object.keys(newValue).length === 0) {
      this.$.title.style.visibility = 'hidden';
    } else {
      this.$.title.style.visibility = 'visible';
    }
  }

}
