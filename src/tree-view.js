import { html, css, LitElement } from 'lit';
/**
 * `element-properties-panel`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TreeView extends LitElement {

  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
      }

      /**
       * Parts of the following CSS have been taken over from
       * https://github.com/PolymerLabs/wizzywid/blob/master/elements/tree-view.html
       */

      ul, li {
        list-style: none;
        margin: 0;
        padding: 0;
        line-height: 25px;
      }

      ul {
        padding-left: 8px;
      }

      li {
        padding-left: 8px;
        border: 1px solid silver;
        border-width: 0 0 1px 1px;
      }

      li.has-children {
        border-bottom: 0px;
      }

      li ul {
        margin-left: -10px;
        padding-left: 20px;
      }
    `;
  }

  static get properties() {
    /*
    return {
      data: {
        type: Array,
        value: [{
          name: 'main'
        }]
      }
    };
    */
    return {
      data: {
        type: Array,
      }
    };
  }

  constructor() {
    super();
    this.data = [{
      name: 'main',
      children: [{
        name: 'child',
        children: [{
          name: 'grandchild'
        }]
      }, {
        name: 'child2',
        children: [{
          name: 'grandchild2'
        }]
      }]
    }];
  }

  render() {
    return html`
      <ul>
        ${this.data.map(item => html`
          <li class="has-children">
            ${item.name}
            ${item.children ? html`<tree-view .data="${item.children}"></tree-view>` : html``}
          </li>
        `)}
      </ul>
    `;
  }

  _toDataArray(data) {
    let dataArray = [];

    Object.keys(data).forEach(key => {
      let dataEntry = {};

      dataEntry.name = data[key].name;

      dataArray.push(dataEntry);
    });

    return dataArray;
  }

  _hasChildren(item) {
    return item.children.length > 0;
  }
}

window.customElements.define('tree-view', TreeView);
