import { html, css, LitElement } from 'lit-element';
import { GestureEventListeners } from './utils/gesture-event-listeners.js';
import * as Gestures from './utils/gestures.js';
import '@material/mwc-top-app-bar-fixed/mwc-top-app-bar-fixed.js';
import '@material/mwc-tab';
import '@material/mwc-tab-bar';
import '@material/mwc-icon/mwc-icon.js';
import '@material/mwc-dialog';
import '@material/mwc-button';
import {ShapeInfo, Intersection} from 'kld-intersections';
import * as Y from 'yjs';
import { SVG } from '@svgdotjs/svg.js';
import { fileSave } from 'browser-nativefs';

import { DirewolfNodeMixin } from 'direwolf-elements/direwolf-node-mixin.js';
import BindingRegistry from '../binding-registry.js';
import '../element-properties-panel';
import './tree-view';

/**
 * `direwolf-modeler`
 *
 *
 * @customElement direwolf-modeler
 * @demo demo/index.html
 */
export class DirewolfModeler extends DirewolfNodeMixin(GestureEventListeners(LitElement)) {
  static get styles() {
    return css`
      :host {
        display: block;

        /* Default colour scheme */
        --light-gray: #383f52;
        --medium-gray: #2f3545;
        --dark-gray: #232733;
        --almost-black: #141720;
        --highlight-pink: #e91e63;
        --input-border-color: #596c7a;

        --mdc-theme-primary: #e91e63;
        --mdc-theme-on-primary: white;
      }

      #top-header {
        position: fixed;
        color: white;
        width: 100%;
        z-index: 100;
        --mdc-theme-primary: var(--almost-black);
        --mdc-theme-on-primary: white;
      }

      .logo {
        font-family: 'Slackey';
        letter-spacing: 1px;
        --app-toolbar-font-size: 25px;
      }

      .lite {
        font-weight: 100;
        opacity: 0.5;
      }

      .app-body {
        padding-top: 64px;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        height: 100vh;
      }

      .drawer {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 200px;
        width: 200px;
        height: 100%;
        overflow: hidden;
        background: var(--medium-gray);
        color: white;
        display: flex;
        flex-direction: column;
      }

      .drawer.wide {
        min-width: 270px;
        width: 270px;
      }

      .drawer-section {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }

      #preview-container {
        height: 100%;
        margin: 5px;
        padding: 10px;
        border: 1px solid var(--light-gray);
        background: white;
        color: black;
        -moz-box-shadow:    inset 0 0 10px #000000;
        -webkit-box-shadow: inset 0 0 10px #000000;
        box-shadow:         inset 0 0 10px #000000;
        overflow-y: scroll;
      }

      .main-view {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: auto;
        display: flex;
        flex-grow: 1;
        flex-direction: column;
      }

      .main-view > #header {
        display: block;
        position: absolute;
        text-align: right;
        height: 40px;
        width: 100%;
        z-index: 1;
        background-color: rgba(47, 53, 69, 0.2);
        /* deactivate selection when dragging */
        user-select: none;
      }

      .main-view > footer {
        position: absolute;
        bottom: 0;
        left: 0px; /*260px;*/
        right: 0px; /*270px;*/
        height: 25px;
        padding-left: 10px;
        line-height: 25px;
        z-index: 1;
        background-color: rgba(47, 53, 69, 0.2);
      }

      .tabs {
        width: 100%;
        --paper-tabs-selection-bar-color: var(--highlight-pink);
      }

      mwc-tab {
        text-transform: uppercase;
        font-weight: 500;
        font-size: 12px;
        color: white;
        --mdc-tab-text-label-color-default: white;
      }

      iron-pages {
        /*@apply(--layout-flex);*/
        overflow-y: scroll;
        background: var(--medium-gray);
        color: white;
      }

      #store-view, #tree-view {
        display: flex;
        overflow-y: scroll;
        flex-direction: column;
        align-items: center;
        width: 200px;
      }

      #tree-view {
        margin-top: 15px;
      }

      #palettes {
        width: 100%;
      }

      #palettes-slot::slotted(*) {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-top: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--light-gray);
      }

      .divider {
        width: 100%;
        height: 1px;
        margin-top: 15px;
        margin-bottom: 10px;
        background-color: var(--light-gray);
      }

      #model-canvas {
        outline: none;
      }

      .model-node {
        cursor: move; /* fallback if grab cursor is unsupported */
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
      }

      .model-node:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
      }

      .model-edge-hover {
        cursor: pointer;
      }

      .model-edge-hover:hover {
        stroke-opacity: 0.5;
      }

      @keyframes dash {
        to {
          stroke-dashoffset: -100;
        }
      }

      #manipulator-border {
        animation: dash 5s infinite linear;
      }

      #manipulator-n, #manipulator-s {
        cursor: ns-resize;
      }

      #manipulator-ne, #manipulator-sw {
        cursor: nesw-resize;
      }

      #manipulator-e, #manipulator-w {
        cursor: ew-resize;
      }

      #manipulator-se, #manipulator-nw {
        cursor: nwse-resize;
      }

      svg text {
        /* do not show text cursor when hovering */
        pointer-events: none;
        /* deactivate selection when dragging */
        user-select: none;
      }

      @keyframes blink {
        50% {
          stroke-opacity: 0.0;
        }
      }

      .blink {
        animation: blink 1.4s step-end 0s infinite;
      }

      #add-elements-button {
        margin-top: 20px;
        margin-bottom: 10px;

        --paper-button: {
          border-width: 1px;
          border-style: solid;
          border-color: var(--input-border-color);
        };
      }

      #add-elements-button iron-icon {
        margin-right: 6px;
      }

      #add-elements-dialog {
        max-width: 550px;
      }

      #add-elements-dialog p {
        margin-bottom: 0;
      }

      #add-elements-dialog paper-input {
        margin-top: 0;
      }

      element-properties-panel {
        margin-top: 10px;
        margin-bottom: 15px;
      }

      shared-properties-panel {
        border-top: 1px solid var(--light-gray);
        padding-top: 10px;
      }

      [hidden] {
        display: none;
      }

      #input-upload {
        margin-top: 10px;
      }

      #dialog-warning {
        display: none;
        margin-top: 10px;
        color: red;
        font-size: 11px;
      }
    `;
  }

  static get properties() {
    return {
      title: {
        type: String
      },
      /**
       * Defines whether an "Add Elements" button should be shown in the palette.
       */
      addPaletteEnabled: {
        type: Boolean,
      },
      activePaletteTabIndex: {
        type: Number,
      },
      selectedLeftDrawerTab: {
        type: String,
      },
      selectedRightDrawerTab: {
        type: String,
      },
      syncPrefix: {
        type: String,
        reflect: true
      },
      _currentDragPosition: {
        type: Object
      },
      /**
       * The model-node that is currently being manipulated (e.g. changed in size).
       */
      _currentManipulationTarget: {
        type: Object
      },
      _pendingPort: {
        type: Object
      },
      _pendingEdge: {
        type: Object
      },
      modelState: {
        type: String
      },
      /**
       * Stores the coordinates of the mouse at the start of the track.
       */
      _pointerOrigin: {
        type: Object
      },
      _modelNodes: {
        type: Object,
      },
      _modelNodesDataTree: {
        type: Array,
      },
      _syncedModelNodes: {
        type: Object
      },
      _modelEdges: {
        type: Object,
      },
      _syncedModelEdges: {
        type: Object
      },
      /**
       * The edge's source model node.
       */
      _edgeOrigin: {
        type: Object
      },
      _originalModelPortPositions: {
        type: Array
      },
      _viewPortTranslation: {
        type: Object,
      },
      _lastHoveredElement: {
        type: Object
      },
      /**
       * This property stores the last created element's ID. This is to ensure that incoming new elements from
       * remote are not showing the manipulators.
       */
      _lastLocallyCreatedElementId: {
        type: String
      },
      _draggedPaletteItem: {
        type: Object
      },
      /**
       * This property stores the last selected model element.
       */
      _lastSelectedModelElement: {
        type: Object
      },
      /**
       * This collection contains all model elements that are incoming but whose parents were not yet rendered.
       */
      _deferredModelElements: {
        type: Array,
      },
      /**
       * The title of the currently selected model element.
       */
      _selectedElementTitle: {
        type: String
      },
      /**
       * A reference to the SVG element.
       */
      _modelCanvas: {
        type: Object
      },
      /**
       * A reference to the delete model element.
       */
      _deleteButton: {
        type: Object
      },
      /**
       * A reference to the element properties panel.
       */
      _elementPropertiesPanel: {
        type: Object
      },
      /**
       * A reference to the HTML properties panel.
       */
      _htmlBindingPropertiesPanel: {
        type: Object
      },
      /**
       * A reference to the model viewport.
       */
      _modelViewport: {
        type: Object
      },
      /**
       * A reference to the model background grid.
       */
      _modelBackground: {
        type: Object
      },
      /**
       * A reference to the model manipulators.
       */
      _modelManipulators: {
        type: Object
      },
      _manipulatorBorder: {
        type: Object
      },
      _manipulatorN: {
        type: Object
      },
      _manipulatorNE: {
        type: Object
      },
      _manipulatorE: {
        type: Object
      },
      _manipulatorSE: {
        type: Object
      },
      _manipulatorS: {
        type: Object
      },
      _manipulatorSW: {
        type: Object
      },
      _manipulatorW: {
        type: Object
      },
      _manipulatorNW: {
        type: Object
      },
      _syncedModelNodesObserver: {
        type: Object
      },
      _syncedModelEdgesObserver: {
        type: Object
      },
      _sharedStatesObserver: {
        type: Object
      },
      _sharedStatesDeepObserver: {
        type: Object
      },
      _keydownListener: {
        type: Object
      },
      _loadedFile: {
        type: Object
      }
    };
  }

  constructor() {
    super();
    this.title = 'Interaction Flow Designer';
    this.addPaletteEnabled = false;
    this.activePaletteTabIndex = 0;
    this.selectedLeftDrawerTab = 'store';
    this.selectedRightDrawerTab = 'properties';
    this.syncPrefix = 'model';
    this._modelNodes = {}; //function() { return {}; }; //() => {};
    this._modelNodesDataTree = this._calculateModelNodesDataTree();
    this._modelEdges = {}; //() => {};
    this._viewPortTranslation = {x: 0, y: 0}; // () => {return {x: 0, y: 0}};
    this._deferredModelElements = [];

    this._syncedModelNodesObserver = this._handleModelNodesChanged.bind(this);
    this._syncedModelEdgesObserver = this._handleModelEdgesChanged.bind(this);
    this._sharedStatesObserver = this._handleSharedStatesChanged.bind(this);
    this._sharedStatesDeepObserver = this._handleSharedStatesDeepChanged.bind(this);
    this._keydownListener = this._handleKeydown.bind(this);

    this._loadedFile = null;
  }

  render() {
    return html`
      <mwc-top-app-bar-fixed id="top-header">
        <span slot="title"><span class="logo">Direwolf </span><span class="lite">// ${this.title}</span></span>
      </mwc-top-app-bar-fixed>

      <div class="app-body">
        <div class="drawer">
          <mwc-tab-bar class="tabs" @MDCTabBar:activated=${e => (this.activePaletteTabIndex = e.detail.index)}>
            <mwc-tab label="Store"></mwc-tab>
            <mwc-tab label="Tree"></mwc-tab>
          </mwc-tab-bar>
          ${this.renderPaletteTabContent()}
        </div>

        <div class="main-view">
          <div id="header">
            <mwc-icon-button icon="save" @click=${this._handleSave} title="Save model as file"></mwc-icon-button>
            <mwc-icon-button icon="open_in_browser" @click=${this._handleFile} title="Load model from file"></mwc-icon-button>
            <mwc-icon-button icon="image" @click=${this._handleExportSVG} title="Export model as SVG file"></mwc-icon-button>
            <mwc-icon-button icon="zoom_in" @click=${this._handleZoomIn} title="Zoom in"></mwc-icon-button>
            <mwc-icon-button icon="zoom_out" @click=${this._handleZoomOut} title="Zoom out"></mwc-icon-button>
            <mwc-icon-button id="delete-button" icon="delete" @click=${this._handleDelete} disabled title="Delete model element"></mwc-icon-button>
            <mwc-icon-button icon="delete_forever" @click=${this._handleDeleteModel} title="Reset entire direwolf space. Refresh page then!"></mwc-icon-button>
          </div>

          <svg id="model-canvas" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
            style="width:100%;height:100%;position:relative;top:0;left:0;bottom:0;right:0;"
            @click=${this._handleModelClick}
            @mousemove=${this._handleModelMove}
            @drop=${this._handleDrop}
            @dragover=${this._handleDragOver}>
            <defs>
              <marker id="arrow" markerWidth="25" markerHeight="25" refX="8" refY="3" orient="auto" markerUnits="strokeWidth" viewBox="0 0 15 15">
                <path d="M0,0 L0,6 L9,3 z" fill="black"></path>
              </marker>

              <pattern id="background-pattern" x="0" y="0" width="0.1" height="0.1">
                <g fill-rule="evenodd">
                  <g fill="#bbbbbb" fill-opacity="0.4">
                    <path opacity=".5" d="M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z"></path>
                    <path d="M6 5V0H5v5H0v1h5v94h1V6h94V5H6z"></path>
                  </g>
                </g>
              </pattern>
            </defs>
            <g id="model-viewport" transform="translate(0,0) scale(1)">
              <rect id="model-background" fill="url(#background-pattern)" width="1000" height="1000" x="0" y="0"></rect>
              <g id="model-manipulators" visibility="hidden" class="animated fadeIn">
                <rect id="manipulator-border" x="5" y="5" stroke="black" stroke-width="1" stroke-dasharray="5, 5" fill="none" shape-rendering="crispEdges"></rect>
                <rect id="manipulator-n" class="model-manipulator" width="10" height="10" fill="blue"></rect>
                <rect id="manipulator-ne" class="model-manipulator" width="10" height="10" fill="blue"></rect>
                <rect id="manipulator-e" class="model-manipulator" width="10" height="10" fill="blue"></rect>
                <rect id="manipulator-se" class="model-manipulator" width="10" height="10" fill="blue"></rect>
                <rect id="manipulator-s" class="model-manipulator" width="10" height="10" fill="blue"></rect>
                <rect id="manipulator-sw" class="model-manipulator" width="10" height="10" fill="blue"></rect>
                <rect id="manipulator-w" class="model-manipulator" width="10" height="10" fill="blue"></rect>
                <rect id="manipulator-nw" class="model-manipulator" width="10" height="10" fill="blue"></rect>
              </g>
            </g>
          </svg>

          <footer>${this._selectedElementTitle}</footer>
        </div>

        <div class="drawer wide">
          <div class="drawer-section">
            <mwc-tab-bar class="tabs">
              <mwc-tab label="Properties"></mwc-tab>
            </mwc-tab-bar>
<!--
            <iron-pages attr-for-selected="name" selected-attribute="visible" selected="[[selectedRightDrawerTab]]">
-->
              <div id="properties-view" name="properties">
                <element-properties-panel id="element-properties-panel" properties-title="IFML" hidden=""></element-properties-panel>
                <shared-properties-panel id="html-binding-properties-panel" properties-title="HTML Binding" hidden=""></shared-properties-panel>
              </div>
<!--
              <div id="bindings-view" name="bindings">
                Bindings
              </div>
            </iron-pages>
-->
          </div>

          <slot name="drawer-right" class="drawer-section"></slot>
        </div>

      </div>

      <mwc-dialog id="dialog-open" heading="Open file..." @closing=${this._handleFileDialogClosing}>
        <div>Select a file from your local file system to load its content into the modeler.</div>
        <input type="file" id="input-upload" accept="application/json" @change=${this._handleFileChange}>
        <div id="dialog-warning">The file does not contain a Direwolf model. Please select a different file.</div>
        <mwc-button slot="primaryAction" dialogAction="ok" disabled>Load</mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="cancel">Cancel</mwc-button>
      </mwc-dialog>
    `;
  }

  renderPaletteTabContent() {
    if (this.activePaletteTabIndex === 0) return this.renderPalettes();
    else if (this.activePaletteTabIndex === 1) return this.renderTree();
  }

  renderPalettes() {
    return html`
      <div id="store-view">
        <div id="palettes">
          <slot name="palettes" id="palettes-slot" @slotchange=${this._handleSlotChange}></slot>
          ${this.addPaletteEnabled ? html`
            <paper-button id="add-elements-button" on-tap="_handleAddElementsButtonTap" raised=""><iron-icon icon="add"></iron-icon> Add Elements</paper-button>
          ` : html``}
        </div>
      </div>
    `
  }

  renderTree() {
    return html`
      <div id="tree-view">
        <tree-view .data="${this._modelNodesDataTree}"></tree-view>
      </div>
    `;
  }

  firstUpdated(changedProperties) {
    this._modelCanvas = this.shadowRoot.getElementById('model-canvas');
    Gestures.addListener(this._modelCanvas, 'track', this._handleModelTrack.bind(this));
    Gestures.addListener(this._modelCanvas, 'down', this._handleModelDown.bind(this));
    Gestures.addListener(this._modelCanvas, 'up', this._handleModelUp.bind(this));
    this._deleteButton = this.shadowRoot.getElementById('delete-button');
    this._elementPropertiesPanel = this.shadowRoot.getElementById('element-properties-panel');
    this._htmlBindingPropertiesPanel = this.shadowRoot.getElementById('html-binding-properties-panel');
    this._modelViewport = this.shadowRoot.getElementById('model-viewport');
    this._modelBackground = this.shadowRoot.getElementById('model-background');
    this._modelManipulators = this.shadowRoot.getElementById('model-manipulators');
    this._manipulatorBorder = this.shadowRoot.getElementById('manipulator-border');
    this._manipulatorN = this.shadowRoot.getElementById('manipulator-n');
    this._manipulatorNE = this.shadowRoot.getElementById('manipulator-ne');
    this._manipulatorE = this.shadowRoot.getElementById('manipulator-e');
    this._manipulatorSE = this.shadowRoot.getElementById('manipulator-se');
    this._manipulatorS = this.shadowRoot.getElementById('manipulator-s');
    this._manipulatorSW = this.shadowRoot.getElementById('manipulator-sw');
    this._manipulatorW = this.shadowRoot.getElementById('manipulator-w');
    this._manipulatorNW = this.shadowRoot.getElementById('manipulator-nw');

    // set background size
    window.addEventListener('resize', this._updateModelBackgroundSize.bind(this));
    this._updateModelBackgroundSize();

    this.fireDirewolfChange();
  }

  connectedCallback() {
    super.connectedCallback();
    // listening to the delete key
    window.addEventListener('keydown', this._keydownListener);
    /*this._observer = new FlattenedNodesObserver(this.$['palettes-slot'], (info) => {
      this._processNewPaletteNodes(info.addedNodes);
      this._processRemovedPaletteNodes(info.removedNodes);
    });
    */
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._keydownListener);
    //this._observer.disconnect();

    // remove Yjs listeners
    this._syncedModelNodes.unobserve(this._syncedModelNodesObserver);
    this._syncedModelEdges.unobserve(this._syncedModelEdgesObserver);
    this.direwolfSpace.sharedStates.unobserve(this._sharedStatesObserver);
    this.direwolfSpace.sharedStates.unobserveDeep(this._sharedStatesDeepObserver);
  }

  _handleKeydown(e) {
    if (!(['INPUT', 'TEXTAREA'].includes(e.path[0].nodeName)) && ([8, 46].includes(e.keyCode))) {
      // backspace or delete key pressed
      this._removeSelectedElement();
    }
  }

  /**
   * Handles adding new palette nodes by adding event listeners to them.
   *
   */
  _handleSlotChange(e) {
    e.target.assignedNodes().forEach(node => {
      if (!node.setup) {
        node.addEventListener('dragitemstart', this._handleDragItemStart.bind(this));
        node.addEventListener('dragitemtrack', this._handleDragItemTrack.bind(this));
        node.addEventListener('dragitemend', this._handleDragItemEnd.bind(this));
        node.addEventListener('itemclick', this._handlePaletteItemClick.bind(this));
        node.setup = true;
      }
    });
  }

  _processRemovedPaletteNodes(removedNodes) {
  }

  _handleDragItemStart(e) {
    this._draggedPaletteItem = e.detail;
  }

  _handleDragItemTrack(e) {
    // deactivate any previously set manipulators
    this._modelManipulators.setAttribute('visibility', 'hidden');
    this._modelManipulators.classList.add('animated');
    this._currentManipulationTarget = null;
    this._elementPropertiesPanel.elementProperties = {};
    this._elementPropertiesPanel.hidden = true;
    this._htmlBindingPropertiesPanel.elementProperties = {};
    this._htmlBindingPropertiesPanel.hidden = true;
    this._deleteButton.disabled = true;
    this._selectedElementTitle = '';

    let match = false;
    let nodeAtPoint = this._getTopmostModelNodeAtPoint(e.detail.x, e.detail.y);
    if (nodeAtPoint) {
      let closestModelNode = nodeAtPoint.closest('.model-node');
      if (closestModelNode) {
        let modelElement = this._modelNodes[closestModelNode.id];
        let dataType = this._draggedPaletteItem.type;
        modelElement.modelElementDragOver(dataType);
        match = true;
        if (this._lastHoveredElement && (this._lastHoveredElement !== modelElement)) {
          this._lastHoveredElement.modelElementDragOver(null);
        }
        this._lastHoveredElement = modelElement;
      }
    }
    if (!match && this._lastHoveredElement) {
      this._lastHoveredElement.modelElementDragOver(null);
      this._lastHoveredElement = null;
    }
  }

  /**
   * This method handles the drag-item-end event from palette items. It finds out the drop position and creates a
   * new map with the model state and syncs it.
   *
   */
  _handleDragItemEnd(e) {
    if (this._lastHoveredElement) {
      this._lastHoveredElement.modelElementDragOver(null);
      this._lastHoveredElement = null;
    }

    // the element type is the model type (e.g. "view-container")
    let elementType = this._draggedPaletteItem.type;

    let modelViewport = SVG(this._modelViewport);
    let viewport = modelViewport;
    viewport.node.id = 'root';
    let point = viewport.point(e.detail.x, e.detail.y);
    point.x = point.x - this._draggedPaletteItem.offsetX - 0.5;
    point.y = point.y - this._draggedPaletteItem.offsetY - 0.5;

    let nodeAtPoint = this._getTopmostModelNodeAtPoint(e.detail.x, e.detail.y);
    // go up the hierarchy to find a node that accepts this child
    while (nodeAtPoint && (nodeAtPoint !== this._modelViewport)) {
      if (this._modelNodes[nodeAtPoint.id].acceptsChild(elementType)) {
        viewport = nodeAtPoint.instance;
        point = viewport.point(e.detail.x, e.detail.y);
        point.x = point.x - this._draggedPaletteItem.offsetX - 0.5;
        point.y = point.y - this._draggedPaletteItem.offsetY - 0.5;
        break;
      }
      nodeAtPoint = nodeAtPoint.parentNode;
    }

    // share the main info about the model element
    let syncedModelNode = {};
    syncedModelNode.id = this.uuidv4(); // generate new random ID
    syncedModelNode.parentId = viewport.node.id;
    syncedModelNode.dataType = elementType;

    // remember the ID so we do not show the manipulators when the event is coming back from synchronization
    this._lastLocallyCreatedElementId = syncedModelNode.id;

    // first create a shared state map that gets propagated to the peers
    let sharedState = new Y.Map();
    sharedState.set('x', point.x);
    sharedState.set('y', point.y);
    sharedState.set('parentId', viewport.node.id);
    this.direwolfSpace.sharedStates.set(syncedModelNode.id, sharedState);
    //TODO: the following approach needs to be generalized...
    if (this._draggedPaletteItem.title) {
      sharedState.set('title', this._draggedPaletteItem.title);
    }
    if (this._draggedPaletteItem.specificationUrl) {
      sharedState.set('specificationUrl', this._draggedPaletteItem.specificationUrl);
    }
    if (this._draggedPaletteItem.schema) {
      sharedState.set('schema', this._draggedPaletteItem.schema);
    }
    if (this._draggedPaletteItem.topic) {
      sharedState.set('topic', this._draggedPaletteItem.topic);
    }
    if (this._draggedPaletteItem.path) {
      sharedState.set('path', this._draggedPaletteItem.path);
    }

    // create a shared state map for the HTML binding
    const stateHTMLBinding = new Y.Map();
    const stateHTMLBindingId = this.direwolfSpace.getFreshId();
    this.direwolfSpace.sharedStates.set(stateHTMLBindingId, stateHTMLBinding);
    syncedModelNode.htmlBindingId = stateHTMLBindingId;
    stateHTMLBinding.set('children', new Y.Array());
    if (this._draggedPaletteItem.specificationUrl) {
      stateHTMLBinding.set('specificationUrl', this._draggedPaletteItem.specificationUrl);
    }
    if (this._draggedPaletteItem.schema) {
      stateHTMLBinding.set('schema', this._draggedPaletteItem.schema);
    }
    if (this._draggedPaletteItem.topic) {
      stateHTMLBinding.set('topic', this._draggedPaletteItem.topic);
    }
    if (this._draggedPaletteItem.path) {
      stateHTMLBinding.set('path', this._draggedPaletteItem.path);
    }

    // update the children array of the parent element
    let htmlBindings = this.globalState.get('htmlBindings');
    if (htmlBindings.get(syncedModelNode.id) === undefined) {
      htmlBindings.set(syncedModelNode.id, stateHTMLBindingId);
    }
    let parentStateHTMLBinding;
    if (syncedModelNode.parentId === 'root') {
      parentStateHTMLBinding = this.direwolfSpace.sharedStates.get(htmlBindings.get('root'));
    } else {
      let syncedParentNode = this._syncedModelNodes.get(syncedModelNode.parentId);
      parentStateHTMLBinding = this.direwolfSpace.sharedStates.get(syncedParentNode.htmlBindingId);
    }
    parentStateHTMLBinding.get('children').push([syncedModelNode.id]);

    // share the newly created model node object
    this._syncedModelNodes.set(syncedModelNode.id, syncedModelNode);
  }

  /**
   * Handles clicking items in the palette. If both the currently selected model element and the clicked item are
   * edges, it is replaced.
   *
   */
  _handlePaletteItemClick(e) {
    if (this._lastSelectedModelElement) {
      let syncedEdge = this._syncedModelEdges.get(this._lastSelectedModelElement.id);
      syncedEdge.dataType = e.detail.type;
      this._syncedModelEdges.set(syncedEdge.id, syncedEdge);
      //TODO: get ID, then fined shared instance, remove the object from canvas and add the SharedInstance of predecessor.
    }
  }

  /**
   * Removes the currently selected element from the screen and the data model. Takes care to also remove edges
   * originating from or leading to the selected element.
   *
   */
  _removeSelectedElement() {
    // check if a node is selected
    if (this._currentManipulationTarget) {
      // delete all direct and indirect children
      let deleteNodeIds = [this._currentManipulationTarget.id];

      let affectedNodes = [...this._currentManipulationTarget.querySelectorAll('.model-node')];
      affectedNodes.forEach(item => deleteNodeIds.push(item.id));

      // remove affected nodes
      deleteNodeIds.forEach(item => {
        this._syncedModelNodes.delete(item);
        this.direwolfSpace.sharedStates.delete(item);

        // delete nodes from HTML binding
        let htmlBindings = this.globalState.get('htmlBindings');
        htmlBindings.delete(item);
      });

      // remove edges
      let deleteEdgeIds = [];
      Object.keys(this._modelEdges).forEach(key => {
        let modelEdge = this._modelEdges[key];
        if ((deleteNodeIds.indexOf(modelEdge.origin) > -1) || (deleteNodeIds.indexOf(modelEdge.target) > -1)) {
          deleteEdgeIds.push(this._syncedModelEdges.get(key).id);
        }
      });

      // remove affected edges
      deleteEdgeIds.forEach(item => {
        this._syncedModelEdges.delete(item);
        this.direwolfSpace.sharedStates.delete(item);
      });
    }

    // check if an edge is selected
    if (this._lastSelectedModelElement) {
      this._syncedModelEdges.delete(this._lastSelectedModelElement.element.node.id);
      this.direwolfSpace.sharedStates.delete(this._lastSelectedModelElement.element.node.id);
    }
  }

  /**
   * This method transforms the map of model nodes to an array that can be fed into the tree view.
   */
  _calculateModelNodesDataTree() {
    // inspired by https://stackoverflow.com/a/41145788
    let keys = Object.keys(this._modelNodes);
    // filters all nodes whose parentId does not match an existing node (e.g. 'root')
    let roots = Object.values(this._modelNodes).map(x => {
      let dataEntry = {};
      dataEntry.id = x.id;
      dataEntry.parentId = x.parentId;
      dataEntry.name = x.descriptiveName;
      dataEntry.children = [];
      return dataEntry;
    }).filter(x => {
      return keys.indexOf(x['parentId']) === -1;
    });
    let nodes = [];
    roots.forEach(x => {
      nodes.push(x);
    });
    while (nodes.length > 0) {
      let node = nodes.pop();
      let children = Object.values(this._modelNodes).filter(x => {
        return x['parentId'] === node['id'];
      });
      children.map(x => {
        let dataEntry = {};
        dataEntry.id = x.id;
        dataEntry.name = x.descriptiveName;
        dataEntry.children = [];
        node.children.push(dataEntry);
        nodes.push(dataEntry);
      });
    }
    return roots;
  }

  /**
   * Deletes the entire model. Handle with care.
   *
   */
  _handleDeleteModel(e) {
    console.log('deleting entire model');
    this._globalState.forEach((value, key, map) => {map.delete(key)});
    this.direwolfSpace.sharedStates.forEach((value, key, map) => {map.delete(key)});
  }

  /**
   * Handles tapping the save button in the app bar.
   *
   */
  async _handleSave(e) {
    let jsonFile = {};
    jsonFile.space = this.direwolfSpace.space;
    jsonFile.type = 'iStar 2.0';
    jsonFile.version = '0.0.6';

    // save nodes
    jsonFile.nodes = [];
    this._syncedModelNodes.forEach(item => {
      // combine global and shared state
      const modelNode = {...item, 'properties': {...this._modelNodes[item.id].sharedState.toJSON()}};
      jsonFile.nodes.push(modelNode);
    });

    // save edges
    jsonFile.edges = [];
    this._syncedModelEdges.forEach(item => {
      // combine global and shared state
      const modelEdge = {...item, 'properties': {...this._modelEdges[item.id].sharedState.toJSON()}};
      jsonFile.edges.push(modelEdge);
    });

    // download file
    const data = new Blob([JSON.stringify(jsonFile)], { type: "application/json" });
    const options = {
      fileName: `Direwolf-${this.direwolfSpace.space}.json`,
    };
    await fileSave(data, options);
  }

  /**
   * Handles uploading a JSON file with a model.
   * 
   * @param {*} e 
   */
  _handleFile(e) {
    const warning = this.shadowRoot.getElementById('dialog-warning');
    if (Object.keys(this._modelNodes).length > 0) {
      warning.innerText = 'The canvas is not empty. Please choose a different space or delete all elements.';
      warning.style.display = 'block';
    } else {
      warning.style.display = 'none';
    }
    const dialog = this.shadowRoot.getElementById('dialog-open');
    dialog.open = true;
  }

  _handleFileChange(e) {
    var reader = new FileReader();
    reader.onload = (event) => {
      if (Object.keys(this._modelNodes).length > 0) {
        const warning = this.shadowRoot.getElementById('dialog-warning');
        warning.innerText = 'The canvas is not empty. Please choose a different space or delete all elements.';
        warning.style.display = 'block';
      } else {
        const jsonFile = JSON.parse(event.target.result);
        // check file integrity, i.e. if the file format is correct
        const requiredKeys = ['nodes', 'edges'];
        if (requiredKeys.every(key => Object.keys(jsonFile).includes(key))) {
          this._loadedFile = jsonFile;
          const warning = this.shadowRoot.getElementById('dialog-warning');
          warning.style.display = 'none';
          const dialog = this.shadowRoot.getElementById('dialog-open');
          dialog.primaryButton.removeAttribute('disabled');
        } else {
          const warning = this.shadowRoot.getElementById('dialog-warning');
          warning.innerText = 'The file does not contain a Direwolf model. Please select a different file.';
          warning.style.display = 'block';
          const dialog = this.shadowRoot.getElementById('dialog-open');
          dialog.primaryButton.setAttribute('disabled', true);
        }
      }
    };
    reader.readAsText(e.target.files[0]);
  }

  _handleFileDialogClosing(e) {
    if (e.detail.action === 'ok') {
      // load file
      
      // nodes
      let deferredNodes = [...this._loadedFile.nodes];
      let action = true;
      while (action && (deferredNodes.length > 0)) {
        action = false;
        deferredNodes.some(node => {
          if ((node.parentId !== 'root') && !this._syncedModelNodes.get(node.parentId)) {
            // the parent has not yet been rendered
          } else {
            let sharedState = new Y.Map();
            Object.keys(node.properties).forEach(key => {
              sharedState.set(key, node.properties[key]);
            });
            this.direwolfSpace.sharedStates.set(node.id, sharedState);

            // share the main info about the model element
            delete node.properties;
            this._syncedModelNodes.set(node.id, node);

            deferredNodes.splice(deferredNodes.indexOf(node), 1);
            action = true;
            return true;
          }
        });
      }

      // edges
      this._loadedFile.edges.forEach(edge => {
        let sharedState = new Y.Map();
        Object.keys(edge.properties).forEach(key => {
          sharedState.set(key, edge.properties[key]);
        });
        this.direwolfSpace.sharedStates.set(edge.id, sharedState);

        // share the main info about the model element
        delete edge.properties;
        this._syncedModelEdges.set(edge.id, edge);
      });
    }

    // reset form
    this._loadedFile = null;
    this.shadowRoot.getElementById('input-upload').value = null;
  }

  /**
   * Handles tapping the export button in the app bar.
   *
   */
  _handleExportSVG(e) {
    var clone = this._modelCanvas.cloneNode(true);

    // remove model background
    clone.querySelector('#model-background').remove()
    // remove manipulators
    clone.querySelector('#model-manipulators').remove();

    // KUDOS to https://stackoverflow.com/posts/38481556/
    // though we removed the parseStyles part as we do not use CSS classes in our SVG.

    // create a doctype
    var svgDocType = document.implementation.createDocumentType('svg', "-//W3C//DTD SVG 1.1//EN", "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd");
    // a fresh svg document
    var svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);
    // replace the documentElement with our clone
    svgDoc.replaceChild(clone, svgDoc.documentElement);
    // get the data
    var svgData = (new XMLSerializer()).serializeToString(svgDoc);

    var a = document.createElement('a');
    a.style.visibility = 'hidden';
    a.href = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgData.replace(/></g, '>\n\r<'));
    a.download = `Direwolf-${this.direwolfSpace.space}.exported.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  _handleZoomIn(e) {
    let viewport = SVG(this._modelViewport);
    viewport.transform({ scale: viewport.transform('scaleX') + 0.25 });
  }

  _handleZoomOut(e) {
    let viewport = SVG(this._modelViewport);
    viewport.transform({ scale: viewport.transform('scaleX') - 0.25 });
  }

  _handleDelete(e) {
    this._removeSelectedElement();
  }

  /**
   * Event listener for when the mouse or finger is 'down'.
   *
   */
  _handleModelDown(e) {
    if (e.target === this._modelCanvas) {
      // no object was tapped, deactivated the selection
      // this code is only reached if the click happened outside the background grid
      this._modelManipulators.setAttribute('visibility', 'hidden');
      this._modelManipulators.classList.add('animated');
      this._currentManipulationTarget = null;
      this._elementPropertiesPanel.elementProperties = {};
      this._elementPropertiesPanel.hidden = true;
      this._htmlBindingPropertiesPanel.elementProperties = {};
      this._htmlBindingPropertiesPanel.hidden = true;
      if (this._lastSelectedModelElement) {
        this._lastSelectedModelElement.handleUp();
        this._lastSelectedModelElement = null;
      }
      this._deleteButton.disabled = true;
      this._selectedElementTitle = '';
    } else {
      // a model element was tapped, check if an edge was tapped or a node
      let closestModelEdge = e.target.closest('.model-edge');
      if (closestModelEdge) {
        let modelElement = this._modelEdges[closestModelEdge.id];

        if (this._lastSelectedModelElement && (this._lastSelectedModelElement !== modelElement)) {
          this._lastSelectedModelElement.handleUp();
        }

        // propagate event
        modelElement.handleDown(e);

        this._lastSelectedModelElement = modelElement;
      } else {
        if (this._lastSelectedModelElement) {
          this._lastSelectedModelElement.handleUp();
          this._lastSelectedModelElement = null;
        }
      }

      // check if a node was clicked
      let closestModelNode = e.target.closest('.model-node');
      if (!closestModelNode && !e.target.classList.contains('model-manipulator')) {
        this._modelManipulators.setAttribute('visibility', 'hidden');
        this._modelManipulators.classList.add('animated');
        this._currentManipulationTarget = null;
        this._elementPropertiesPanel.elementProperties = {};
        this._elementPropertiesPanel.hidden = true;
        this._htmlBindingPropertiesPanel.elementProperties = {};
        this._htmlBindingPropertiesPanel.hidden = true;
        this._deleteButton.disabled = true;
        this._selectedElementTitle = '';
      }
    }
  }

  /**
   * Event handler for clicking on a model element in the canvas.
   *
   */
  _handleModelClick(e) {
    // check if an edge was clicked
    let closestModelEdge = e.target.closest('.model-edge');
    if (closestModelEdge) {
      // show properties
      this._elementPropertiesPanel.element = this._modelEdges[closestModelEdge.id];
      this._elementPropertiesPanel.elementProperties = this._modelEdges[closestModelEdge.id].properties;
      this._elementPropertiesPanel.hidden = false;
    }

    // now check if it was a node
    let closestModelNode = e.target.closest('.model-node');
    if (closestModelNode) {

      // remove animation if it was already shown
      if (this._currentManipulationTarget === closestModelNode) {
        this._modelManipulators.classList.remove('animated');
      }

      let parentNode = closestModelNode.parentNode.closest('.model-node');
      if (!parentNode) {
        parentNode = this._modelViewport;
      }

      // move node as last child to stack on top
      let modelNodeParent = closestModelNode;
      do {
        modelNodeParent.instance.front();
        modelNodeParent = modelNodeParent.parentNode.closest('.model-node');
      } while (modelNodeParent);

      // check if there are any edges from/to this model node
      var affectedNodes = Array.from(closestModelNode.querySelectorAll('.model-node'));
      affectedNodes.unshift(closestModelNode);

      affectedNodes.forEach(node => {
        // remove animation
        node.classList.remove('animated');
      });

      let affectedNodesKeys = affectedNodes.map(function(item) { return item.id; });

      // check if there are any edges from/to this model node, bring them to front
      Object.keys(this._modelEdges).forEach(key => {
        let modelEdge = this._modelEdges[key];
        modelEdge.element.front();
        /*
        if (affectedNodesKeys.indexOf(modelEdge.origin) > -1) {
          modelEdge.element.front();
        } else if (affectedNodesKeys.indexOf(modelEdge.target) > -1) {
          modelEdge.element.front();
        }
        */
      });

      // show manipulators
      this._activateNodeManipulators(closestModelNode);
    }
  }

  _handleModelUp(e) {
    /*
    if (e.target.classList.contains('model-port')) {
      // make port persistent
      this._pendingPort = null;
    }
    */
  }

  /**
   * This is a Polymer-specific event for handling mouse/finger movements aka dragging. Here, it handles panning
   * the viewport as well as dragging model nodes and edges.
   */
  _handleModelTrack(e) {
    var modelViewport = SVG(this._modelViewport);
    var point = modelViewport.point(e.detail.x, e.detail.y);
    var scale = modelViewport.transform('scaleX');

    if (e.detail.state === 'start') {

      if ((e.target === this._modelBackground) || (e.target === this._modelCanvas)) {

        // move whole model
        modelViewport.transform({translateX: this._viewPortTranslation.x + e.detail.dx, translateY: this._viewPortTranslation.y + e.detail.dy});

      } else if (e.target.classList.contains('model-port')) {

        // start connecting state
        this.modelState = 'CONNECTING-INTERACTION-FLOW';

        // fix port
        //this._pendingPort = null;
        // get the center of the port
        var cx = parseInt(e.target.getAttribute('cx'));
        var cy = parseInt(e.target.getAttribute('cy'));

        let edge = modelViewport.line(cx, cy, point.x, point.y).stroke({ width: 1, color: 'black' })

        edge.marker('end', 15, 15, function(add) {
          add.path('M0,0 L0,6 L9,3 z').attr({
            markerUnits: 'strokeWidth',
            orient: 'auto'
          });
          this.ref(8, 3);
          this.size(25, 25);
        });

        this._pendingEdge = edge;
        // swap with pending port to display port on top of line
        this._pendingEdge.node.parentNode.insertBefore(this._pendingEdge.node, this._pendingPort);

      } else if (e.target.classList.contains('model-manipulator')) {
        // we are dragging a manipulator

        this._modelManipulators.classList.remove('animated');
        this._currentDragPosition = this._getRectInSVGCoordinates(this._currentManipulationTarget);

        // cache port positions
        this._originalModelPortPositions = [];
        Object.keys(this._modelEdges).forEach(key => {
          let modelEdge = this._modelEdges[key];
          if (modelEdge.origin === this._currentManipulationTarget) {
            var portPosition = {};
            portPosition.port = modelEdge.port;
            portPosition.line = modelEdge.line;
            portPosition.x = parseInt(modelEdge.port.getAttribute('cx'));
            portPosition.y = parseInt(modelEdge.port.getAttribute('cy'));
            this._originalModelPortPositions.push(portPosition);
          }
        });

      } else {
        // check if the drag was started from a model node
        var closestModelNode = e.target.closest('.model-node');
        if (closestModelNode) {
          this._edgeOrigin = closestModelNode;

          if (this._currentManipulationTarget === closestModelNode) {
            // start connecting state
            this.modelState = 'DRAGGING-NODE';

            var modelNode = SVG(closestModelNode);

            this._modelManipulators.classList.remove('animated');

            this._currentDragPosition = {x: modelNode.transform('translateX'), y: modelNode.transform('translateY')};

            this._originalModelPortPositions = [];
            //var affectedNodes = Array.from(this._currentManipulationTarget.querySelectorAll('.model-node'));
            let affectedNodes = Array.from(closestModelNode.querySelectorAll('.model-node')).map(function(item) { return item.id; });
            affectedNodes.unshift(this._currentManipulationTarget.id);
            Object.keys(this._modelEdges).forEach(key => {
              let modelEdge = this._modelEdges[key];
              if (affectedNodes.indexOf(modelEdge.origin) > -1) {
                let portPosition = {};
                portPosition.id = key;
                portPosition.start = modelEdge.start;
                this._originalModelPortPositions.push(portPosition);
              }
            });
          } else {
            // TODO: eliminate this binary option, ask for default connection type of a model element
            // instead, use .draggedEdgeType()
            if (this._modelNodes[closestModelNode.id].draggedEdgeType === 'data-flow') {
              this.modelState = 'CONNECTING-DATA-FLOW';
            } else {
              this.modelState = 'CONNECTING-INTERACTION-FLOW';
            }

            let edge = modelViewport.line(point.x, point.y, point.x, point.y).stroke({ width: 1, color: 'black' });

            if (this.modelState === 'CONNECTING-DATA-FLOW') {
              edge.attr({'stroke-dasharray': '7.5,7.5'});
            }

            edge.marker('end', 15, 15, function(add) {
              add.path('M0,0 L0,6 L9,3 z').attr({
                markerUnits: 'strokeWidth',
                orient: 'auto'
              });
              this.ref(8, 3);
              this.size(25, 25);
            });

            this._pendingEdge = edge;
          }
        }
      }

    } else if (e.detail.state === 'track') {
      // we are moving while finger/button is down

      if ((e.target === this._modelBackground) || (e.target === this._modelCanvas)) {

        // move whole viewport
        modelViewport.transform({translateX: this._viewPortTranslation.x + e.detail.dx, translateY: this._viewPortTranslation.y + e.detail.dy});
        // move background
        let offsetX = (this._viewPortTranslation.x + e.detail.dx) / scale;
        let offsetY= (this._viewPortTranslation.y + e.detail.dy) / scale;
        this._modelBackground.setAttribute('x', Math.ceil(offsetX / 100) * -100);
        this._modelBackground.setAttribute('y', Math.ceil(offsetY / 100) * -100);

      } else if ((this.modelState === 'CONNECTING-INTERACTION-FLOW') || (this.modelState === 'CONNECTING-DATA-FLOW')) {

        this._pendingEdge.plot([[this._pendingEdge.node.getAttribute('x1'), this._pendingEdge.node.getAttribute('y1')], [point.x, point.y]]);

      } else if (e.target.classList.contains('model-manipulator')) {

        // manipulate node

        var modelInstance = this._modelNodes[this._currentManipulationTarget.id];

        if (e.target === this._manipulatorN) {

          // fix x, change y and height
          var newHeight = this._currentDragPosition.height - (e.detail.dy / scale);
          if (newHeight < modelInstance.minHeight) {
            return;
          }

          modelInstance.y = this._currentDragPosition.y + (e.detail.dy / scale);
          modelInstance.height = newHeight;

          // check if there are any edges from/to this model node
          Object.keys(this._modelEdges).forEach(key => {
            let modelEdge = this._modelEdges[key];
            if (modelEdge.origin === this._currentManipulationTarget) {
              // translate port and edge start
              this._originalModelPortPositions.forEach(portPosition => {

                if ((portPosition.x === this._currentDragPosition.x) || (portPosition.x === (this._currentDragPosition.x + this._currentDragPosition.width))) {
                  var newPortPosition = this._currentDragPosition.y + (e.detail.dy / scale) + (this._currentDragPosition.height - (e.detail.dy / scale)) * (portPosition.y - this._currentDragPosition.y) / this._currentDragPosition.height;
                  portPosition.port.setAttribute('cy', newPortPosition);
                  portPosition.line.setAttribute('y1', newPortPosition);
                } else if (portPosition.y === this._currentDragPosition.y) {
                  var newPortPosition = this._currentDragPosition.y + (e.detail.dy / scale);
                  portPosition.port.setAttribute('cy', newPortPosition);
                  portPosition.line.setAttribute('y1', newPortPosition);
                }

              });
            }
          });

        } else if (e.target === this._manipulatorE) {

          // fix x, change width
          var newWidth = this._currentDragPosition.width + (e.detail.dx / scale);
          if (newWidth < modelInstance.minWidth) {
            return;
          }

          modelInstance.width = newWidth;

          // check if there are any edges from/to this model node
          Object.keys(this._modelEdges).forEach(key => {
            let modelEdge = this._modelEdges[key];
            if (modelEdge.origin === this._currentManipulationTarget) {
              // translate port and edge start
              this._originalModelPortPositions.forEach(portPosition => {

                var newPortPosition = this._currentDragPosition.x + (this._currentDragPosition.width + (e.detail.dx / scale)) * (portPosition.x - this._currentDragPosition.x) / this._currentDragPosition.width;
                portPosition.port.setAttribute('cx', newPortPosition);
                portPosition.line.setAttribute('x1', newPortPosition);

              });
            }
          });

        } else if (e.target === this._manipulatorSE) {

          // fix x and y, change width and height
          var newWidth = this._currentDragPosition.width + (e.detail.dx / scale);
          if (newWidth < modelInstance.minWidth) {
            return;
          }
          var newHeight = this._currentDragPosition.height + (e.detail.dy / scale);
          if (newHeight < modelInstance.minHeight) {
            return;
          }

          modelInstance.width = newWidth;
          modelInstance.height = newHeight;

          //TODO: adjust ports

        } else if (e.target === this._manipulatorS) {

          // fix y, change height
          var newHeight = this._currentDragPosition.height + (e.detail.dy / scale);
          if (newHeight < modelInstance.minHeight) {
            return;
          }

          modelInstance.height = newHeight;

          // check if there are any edges from/to this model node
          Object.keys(this._modelEdges).forEach(key => {
            let modelEdge = this._modelEdges[key];
            if (modelEdge.origin === this._currentManipulationTarget.id) {
              // translate port and edge start
              this._originalModelPortPositions.forEach(portPosition => {

                var newPortPosition = this._currentDragPosition.y + (this._currentDragPosition.height + (e.detail.dy / scale)) * (portPosition.y - this._currentDragPosition.y) / this._currentDragPosition.height;
                portPosition.port.setAttribute('cy', newPortPosition);
                portPosition.line.setAttribute('y1', newPortPosition);

              });
            }
          });

        } else if (e.target === this._manipulatorW) {

          // fix y, change x and width
          var newWidth = this._currentDragPosition.width - (e.detail.dx / scale);
          if (newWidth < modelInstance.minWidth) {
            return;
          }

          modelInstance.x = this._currentDragPosition.x + (e.detail.dx / scale);
          modelInstance.width = newWidth;

          // check if there are any edges from/to this model node
          Object.keys(this._modelEdges).forEach(key => {
            let modelEdge = this._modelEdges[key];
            if (modelEdge.origin === this._currentManipulationTarget) {
              // translate port and edge start
              this._originalModelPortPositions.forEach(portPosition => {

                if ((portPosition.y === this._currentDragPosition.y) || (portPosition.y === (this._currentDragPosition.y + this._currentDragPosition.height))) {
                  var newPortPosition = this._currentDragPosition.x + (e.detail.dx / scale) + (this._currentDragPosition.width - (e.detail.dx / scale)) * (portPosition.x - this._currentDragPosition.x) / this._currentDragPosition.width;
                  portPosition.port.setAttribute('cx', newPortPosition);
                  portPosition.line.setAttribute('x1', newPortPosition);
                } else if (portPosition.x === this._currentDragPosition.x) {
                  var newPortPosition = this._currentDragPosition.x + (e.detail.dx / scale);
                  portPosition.port.setAttribute('cx', newPortPosition);
                  portPosition.line.setAttribute('x1', newPortPosition);
                }

              });
            }
          });

        }

        // translate edge ends
        Object.keys(this._modelEdges).forEach(key => {
          let modelEdge = this._modelEdges[key];
          if (modelEdge.target === this._currentManipulationTarget) {
            // translate edge end
            var nodeCenter = this._getNodeCenter(SVG(this._currentManipulationTarget));
            var line = {};
            line.x1 = parseInt(modelEdge.line.getAttribute('x1'));
            line.y1 = parseInt(modelEdge.line.getAttribute('y1'));
            line.x2 = nodeCenter.x;
            line.y2 = nodeCenter.y;

            var intersection = this._getLineNodeIntersection(line, this._currentManipulationTarget);

            // intersection is undefined if the line is within the rectangle
            if (intersection) {
              modelEdge.line.setAttribute('x2', intersection.x);
              modelEdge.line.setAttribute('y2', intersection.y);
            }
          }
        });

        // realign manipulators
        this._activateNodeManipulators(this._currentManipulationTarget);

      } else if (this.modelState === 'DRAGGING-NODE') {

        // translate model

        let closestModelNode = e.target.closest('.model-node');
        if (closestModelNode) {
          let modelNode = this._modelNodes[closestModelNode.id];
          modelNode.x = this._currentDragPosition.x + (e.detail.dx / scale);
          modelNode.y = this._currentDragPosition.y + (e.detail.dy / scale);

          // get all contained children nodes that we are moving together with the parent
          let affectedNodes = Array.from(closestModelNode.querySelectorAll('.model-node')).map(function(item) { return item.id; });
          affectedNodes.unshift(closestModelNode.id);


          // TODO: iterate through all edges and collect all that are affected. Then adjust the start and ends of the ones affected.
          let affectedEdges = [];
          // first, collect all edges that are linking from or to any affected nodes
          Object.keys(this._modelEdges).forEach(key => {
            let modelEdge = this._modelEdges[key];
            if ((affectedNodes.indexOf(modelEdge.origin) > -1) || (affectedNodes.indexOf(modelEdge.target) > -1)) {
              affectedEdges.push(modelEdge);
            }
          });
          // second, reposition all affected edges
          affectedEdges.forEach(affectedEdge => {
            const originNode = this._modelNodes[affectedEdge.origin];
            const originCenter = this._getNodeCenter(originNode.element);
            // now get the absolute position of the node the edge is starting at
            let originOffset = {x: 0, y: 0};
            let currentParentId = originNode.parentId;
            while (currentParentId !== 'root') {
              const currentParent = this._modelNodes[currentParentId];
              originOffset.x += currentParent.x;
              originOffset.y += currentParent.y;
              currentParentId = this._modelNodes[currentParentId].parentId;
            }
            const originShape = originNode.getOuterShape(originOffset);

            const targetNode = this._modelNodes[affectedEdge.target];
            const targetCenter = this._getNodeCenter(targetNode.element);
            // now get the absolute position of the node the edge is starting at
            let targetOffset = {x: 0, y: 0};
            currentParentId = targetNode.parentId;
            while (currentParentId !== 'root') {
              const currentParent = this._modelNodes[currentParentId];
              targetOffset.x += currentParent.x;
              targetOffset.y += currentParent.y;
              currentParentId = this._modelNodes[currentParentId].parentId;
            }
            const targetShape = targetNode.getOuterShape(targetOffset);

            const line = ShapeInfo.line([originCenter.x, originCenter.y, targetCenter.x, targetCenter.y]);

            const originIntersections = Intersection.intersect(originShape, line);
            // there are no intersections if the line is within the edge
            if (originIntersections.status !== 'Inside') {
              let intersection = {};
              intersection.x = originIntersections.points[0].x;
              intersection.y = originIntersections.points[0].y;
              affectedEdge.start = [intersection.x, intersection.y];
            }

            const targetIntersections = Intersection.intersect(targetShape, line);
            // there are no intersections if the line is within the edge
            if (targetIntersections.status !== 'Inside') {
              let intersection = {};
              intersection.x = targetIntersections.points[0].x;
              intersection.y = targetIntersections.points[0].y;
              affectedEdge.end = [intersection.x, intersection.y];
            }

            affectedEdge.element.front();
          });


          /*
          // check if there are any edges from/to this model node and its children
          Object.keys(this._modelEdges).forEach(key => {
            let modelEdge = this._modelEdges[key];
            if (affectedNodes.indexOf(modelEdge.origin) > -1) {
              // translate port and edge start
              this._originalModelPortPositions.forEach(portPosition => {

                // portPosition.id describes the id of the edge the port is sitting on
                //TODO: remove the "port" behavior and make ports a property of a special edge
                let edgeWithPort = this._modelEdges[portPosition.id];
                var pointArray = [];
                pointArray[0] = portPosition.start[0] + (e.detail.dx / scale);
                pointArray[1] = portPosition.start[1] + (e.detail.dy / scale);
                edgeWithPort.start = pointArray;
                edgeWithPort.element.front();

                // translate edge start
                const originNode = this._modelNodes[modelEdge.origin];
                var nodeCenter = this._getNodeCenter(originNode.element);
                var line = {};
                line.x1 = nodeCenter.x;
                line.y1 = nodeCenter.y;
                line.x2 = parseInt(modelEdge.end[0]);
                line.y2 = parseInt(modelEdge.end[1]);

                // now get the absolute position of the node the edge is starting at
                let offset = {x: 0, y: 0};
                let currentParentId = originNode.parentId;
                while (currentParentId !== 'root') {
                  const currentParent = this._modelNodes[currentParentId];
                  offset.x += currentParent.x;
                  offset.y += currentParent.y;
                  currentParentId = this._modelNodes[currentParentId].parentId;
                }

                const targetShape = originNode.getOuterShape(offset);
                const line2 = ShapeInfo.line([line.x1, line.y1, line.x2, line.y2]);
                const intersections = Intersection.intersect(targetShape, line2);

                // there are no interesctions if the line is within the edge
                if (intersections.status !== 'Inside') {
                  let intersection = {};
                  intersection.x = intersections.points[0].x;
                  intersection.y = intersections.points[0].y;
                  modelEdge.start = [intersection.x, intersection.y];
                }

                modelEdge.element.front();

              });
            } else if (affectedNodes.indexOf(modelEdge.target) > -1) {
              // translate edge end
              var nodeCenter = this._getNodeCenter(this._modelNodes[modelEdge.target].element);
              var line = {};
              line.x1 = parseInt(modelEdge.start[0]);
              line.y1 = parseInt(modelEdge.start[1]);
              line.x2 = nodeCenter.x;
              line.y2 = nodeCenter.y;

              var targetNode = this._modelNodes[modelEdge.target];
              //var intersection = this._getLineNodeIntersection(line, targetNode.element);

              let offset = {x: 0, y: 0};
              let currentParentId = targetNode.parentId;
              while (currentParentId !== 'root') {
                const currentParent = this._modelNodes[currentParentId];
                offset.x += currentParent.x;
                offset.y += currentParent.y;
                currentParentId = this._modelNodes[currentParentId].parentId;
              }

              const targetShape = targetNode.getOuterShape(offset);
              const line2 = ShapeInfo.line([line.x1, line.y1, line.x2, line.y2]);
              const intersections = Intersection.intersect(targetShape, line2);

              // there are no interesctions if the line is within the edge
              if (intersections.status !== 'Inside') {
                let intersection = {};
                intersection.x = intersections.points[0].x;
                intersection.y = intersections.points[0].y;
                modelEdge.end = [intersection.x, intersection.y];
              }

              modelEdge.element.front();
            }
          });
          */

          // move manipulators

          //var modelNode = closestModelNode.instance;
          let x = 0;
          let y = 0;
          let parent = modelNode.element;
          while (parent = parent.parent()) {
            if (parent.node.classList && (parent.node.classList.contains('model-node'))) {
              x += parent.transform('translateX');
              y += parent.transform('translateY');
            } else {
              break;
            }
          }
          this._modelManipulators.setAttribute('transform', 'translate(' + (this._currentDragPosition.x + x + (e.detail.dx / scale) - 20) + ',' + (this._currentDragPosition.y + y + (e.detail.dy / scale) - 20) + ')');

          // show parent marker when dragging over another model node
          let match = false;
          let nodeAtPoint = this._getTopmostModelNodeAtPoint(e.detail.x, e.detail.y, closestModelNode);
          if (nodeAtPoint) {
            let closestModelNode = nodeAtPoint.closest('.model-node');
            if (closestModelNode) {
              let modelElement = this._modelNodes[closestModelNode.id];
              // the data transfer data is not available in the dragover event handler.
              //var dataType = e.dataTransfer.getData('type');
              let dataType = 'ifml-action';//this._draggedModelElementType;
              modelElement.modelElementDragOver(dataType);
              match = true;
              if (this._lastHoveredElement && (this._lastHoveredElement !== modelElement)) {
                this._lastHoveredElement.modelElementDragOver(null);
              }
              this._lastHoveredElement = modelElement;
            }
          }
          if (!match && this._lastHoveredElement) {
            this._lastHoveredElement.modelElementDragOver(null);
            this._lastHoveredElement = null;
          }

        }
      }

    } else if (e.detail.state === 'end') {
      if ((e.target === this._modelBackground) || (e.target === this._modelCanvas)) {
        // store viewport translation, i.e. how much the viewport was moved in total
        this._viewPortTranslation.x = this._viewPortTranslation.x + e.detail.dx;
        this._viewPortTranslation.y = this._viewPortTranslation.y + e.detail.dy;
      } else if (this.modelState === 'CONNECTING-INTERACTION-FLOW') {

        // get the topmost model node at this position
        var nodeAtPoint = this._getTopmostModelNodeAtPoint(e.detail.x, e.detail.y);

        if (nodeAtPoint) {
          // the edge was ended on a model node: connect nodes!
          const originNode = this._modelNodes[this._edgeOrigin.id];
          const originCenter = this._getNodeCenter(originNode.element);
          // now get the absolute position of the node the edge is starting at
          let originOffset = {x: 0, y: 0};
          let currentParentId = originNode.parentId;
          while (currentParentId !== 'root') {
            const currentParent = this._modelNodes[currentParentId];
            originOffset.x += currentParent.x;
            originOffset.y += currentParent.y;
            currentParentId = this._modelNodes[currentParentId].parentId;
          }
          const originShape = originNode.getOuterShape(originOffset);

          const targetNode = this._modelNodes[nodeAtPoint.id];
          const targetCenter = this._getNodeCenter(targetNode.element);
          // now get the absolute position of the node the edge is starting at
          let targetOffset = {x: 0, y: 0};
          currentParentId = targetNode.parentId;
          while (currentParentId !== 'root') {
            const currentParent = this._modelNodes[currentParentId];
            targetOffset.x += currentParent.x;
            targetOffset.y += currentParent.y;
            currentParentId = this._modelNodes[currentParentId].parentId;
          }
          const targetShape = targetNode.getOuterShape(targetOffset);

          const line = ShapeInfo.line([originCenter.x, originCenter.y, targetCenter.x, targetCenter.y]);

          const originIntersections = Intersection.intersect(originShape, line);
          // there are no intersections if the line is within the edge
          let start = {x: originCenter.x, y: originCenter.y};
          if (originIntersections.status !== 'Inside') {
            start.x = originIntersections.points[0].x;
            start.y = originIntersections.points[0].y;
          }

          const targetIntersections = Intersection.intersect(targetShape, line);
          // there are no intersections if the line is within the edge
          let end = {x: targetCenter.x, y: targetCenter.y};
          if (targetIntersections.status !== 'Inside') {
            end.x = targetIntersections.points[0].x;
            end.y = targetIntersections.points[0].y;
          }

          //affectedEdge.element.front();


          /*
          let line = {};
          line.x1 = parseInt(this._pendingEdge.node.getAttribute('x1'));
          line.y1 = parseInt(this._pendingEdge.node.getAttribute('y1'));
          line.x2 = parseInt(this._pendingEdge.node.getAttribute('x2'));
          line.y2 = parseInt(this._pendingEdge.node.getAttribute('y2'));

          let intersection = this._getLineNodeIntersection(line, nodeAtPoint.instance);
          */

          // share state
          let syncedNavigationFlow = {};
          syncedNavigationFlow.id = this.uuidv4(); // generate new id
          syncedNavigationFlow.dataType = 'istar-refinement-or'; //'navigation-flow';
          syncedNavigationFlow.origin = this._edgeOrigin.id;
          syncedNavigationFlow.target = nodeAtPoint.id;

          // first create a shared state map that gets propagated to the peers
          let sharedState = this.direwolfSpace.sharedStates.set(syncedNavigationFlow.id, new Y.Map());
          sharedState.set('start', [start.x, start.y]);
          sharedState.set('end', [end.x, end.y]);
          // if (intersection) {
          //   sharedState.set('end', [intersection.x, intersection.y]);
          // }

          this._syncedModelEdges.set(syncedNavigationFlow.id, syncedNavigationFlow);

          // remove pending port
          if (this._pendingPort) {
            this._pendingPort.parentNode.removeChild(this._pendingPort);
            this._pendingPort = null;
          }
        }

        // delete pending edge
        this._pendingEdge.remove();//parentNode.removeChild(this._pendingEdge);
        this._pendingEdge = null;

        // reset state
        this.modelState = null;
      } else if (this.modelState === 'CONNECTING-DATA-FLOW') {

        this._pendingEdge.plot([[this._pendingEdge.node.getAttribute('x1'), this._pendingEdge.node.getAttribute('y1')], [point.x, point.y]]);

        // get the topmost model node at this position
        let closestModelNode = e.target.closest('.model-node');
        var nodeAtPoint = this._getTopmostModelNodeAtPoint(e.detail.x, e.detail.y);

        if (nodeAtPoint && (nodeAtPoint !== closestModelNode)) {
          // the edge was ended on a model node: connect nodes!

          let line = {};
          line.x1 = parseInt(this._pendingEdge.node.getAttribute('x1'));
          line.y1 = parseInt(this._pendingEdge.node.getAttribute('y1'));
          line.x2 = parseInt(this._pendingEdge.node.getAttribute('x2'));
          line.y2 = parseInt(this._pendingEdge.node.getAttribute('y2'));

          let intersectionOrigin = this._getLineNodeIntersection(line, closestModelNode.instance);
          let intersectionTarget = this._getLineNodeIntersection(line, nodeAtPoint.instance);

          // share state
          let syncedDataFlow = {};
          syncedDataFlow.id = this.uuidv4(); // generate new id
          syncedDataFlow.dataType = 'data-flow';
          syncedDataFlow.origin = this._edgeOrigin.id;
          syncedDataFlow.target = nodeAtPoint.id;

          // first create a shared state map that gets propagated to the peers
          let sharedState = this.direwolfSpace.sharedStates.set(syncedDataFlow.id, new Y.Map());
          if (intersectionOrigin) {
            sharedState.set('start', [intersectionOrigin.x, intersectionOrigin.y]);
          }
          if (intersectionTarget) {
            sharedState.set('end', [intersectionTarget.x, intersectionTarget.y]);
          }

          this._syncedModelEdges.set(syncedDataFlow.id, syncedDataFlow);

        }

        // delete pending edge
        this._pendingEdge.node.parentNode.removeChild(this._pendingEdge.node);
        this._pendingEdge = null;

        // reset state
        this.modelState = null;
      } else if (this.modelState === 'DRAGGING-NODE') {
        let closestModelNode = e.target.closest('.model-node');
        let modelNode = this._modelNodes[closestModelNode.id];
        let clickPosition = closestModelNode.instance.point(e.detail.x, e.detail.y);

        if (this._lastHoveredElement && (modelNode.id !== this._lastHoveredElement.id)) {
          // get the position within the node the node was last hovered on
          let point = this._lastHoveredElement.element.point(e.detail.x - (clickPosition.x * scale), e.detail.y - (clickPosition.y * scale));
          modelNode.x = point.x;
          modelNode.y = point.y;
          modelNode.parentId = this._lastHoveredElement.id;

          this._lastHoveredElement.modelElementDragOver(null);
          this._lastHoveredElement = null;
        } else {
          // the node is on the root
          let point = modelViewport.point(e.detail.x - (clickPosition.x * scale), e.detail.y - (clickPosition.y * scale));
          modelNode.x = point.x;
          modelNode.y = point.y;
          modelNode.parentId = 'root';
        }

        let syncedModelNode = this._syncedModelNodes.get(modelNode.id);
        syncedModelNode.parentId = modelNode.parentId;
        this._syncedModelNodes.set(modelNode.id, syncedModelNode);

        // update tree
        this._modelNodesDataTree = this._calculateModelNodesDataTree();
        // reset state
        this.modelState = null;
      }
    }
  }

  _handleModelMove(e) {
    if ((this.modelState === 'CONNECTING-INTERACTION-FLOW') || (this.modelState === 'CONNECTING-DATA-FLOW')) {
      return;
    }

    var nodeOnTop = e.target;

    // check SVG element from last item to first item to find overlaps with objects, then break out of the loop.
    // Save the last circle and move it on consequent mousemove events if the position has changed
    var nodeArray = Array.from(this._modelCanvas.querySelectorAll('.model-node'));
    // go from top layer to bottom which is the node order in SVG
    nodeArray.reverse();
    // saves whether a pending port was found
    var match = false;

    nodeArray.some(item => {
      var modelNode = SVG(item);
      var pointInNodeCoordinates = modelNode.point(e.x, e.y);
      var boundingBox = item.getBBox();
      var rect = {min: {x: boundingBox.x, y: boundingBox.y}, max: {x: boundingBox.x + boundingBox.width, y: boundingBox.y + boundingBox.height}};
      var modelViewport = SVG(this._modelViewport);
      var scale = modelViewport.transform('scaleX');
      var nearestPoint = this._getNearestPointOnRect(rect, pointInNodeCoordinates.x, pointInNodeCoordinates.y);

      if (nearestPoint.distance < 10) {
        match = true;

        // only show ports if the node in question is on top
        //var nodeOnTop = Polymer.Gestures.deepTargetFind(e.x, e.y);
        var closestModelNode = nodeOnTop.closest('.model-node');
        if (closestModelNode && (closestModelNode !== item)) {
          // the model node is not on top, break the loop...
          return true;
        }

        // only show port if node in question allows it
        if (!this._modelNodes[item.id] || !this._modelNodes[item.id].showPortOnHover()) {
          return true;
        }

        var boundingRect = item.getBoundingClientRect();
        var point = this._modelCanvas.createSVGPoint();
        point.x = boundingRect.left + (nearestPoint.x * scale);
        point.y = boundingRect.top + (nearestPoint.y * scale);
        var viewPortPoint = point.matrixTransform(this._modelViewport.getScreenCTM().inverse());

        if (this._pendingPort) {
          // we already have a port, move it
          this._pendingPort.setAttribute('cx', viewPortPoint.x);
          this._pendingPort.setAttribute('cy', viewPortPoint.y);
        } else {
          // create a new port
          // in case we start drawing a port, store the origin
          this._edgeOrigin = item;

          var uri = 'http://www.w3.org/2000/svg';
          var circle = document.createElementNS(uri, 'circle');
          circle.classList.add('model-port');
          circle.setAttribute('cx', viewPortPoint.x);
          circle.setAttribute('cy', viewPortPoint.y);
          circle.setAttribute('r', 10);
          circle.setAttribute('fill', 'white');
          circle.setAttribute('stroke', 'black');
          circle.setAttribute('stroke-width', '1');
          this._modelViewport.appendChild(circle);

          this._pendingPort = circle;
        }

        return true;
      }
    });

    if (!match && this._pendingPort) {
      this._modelViewport.removeChild(this._pendingPort);
      this._pendingPort = null;
    }
  }

  _getNearestPointOnRect(rect, x, y) {
    var nearest = {x: x, y: y};
    if (x < rect.min.x) {
      nearest.x = rect.min.x;
    } else if (x > rect.max.x) {
      nearest.x = rect.max.x;
    }

    if (y < rect.min.y) {
      nearest.y = rect.min.y;
    } else if (y > rect.max.y) {
      nearest.y = rect.max.y;
    }

    // handle the case that the nearest point is within the rectangle
    if ((nearest.x > rect.min.x && nearest.x < rect.max.x) && (nearest.y > rect.min.y && nearest.y < rect.max.y)) {
      if (nearest.x < (rect.min.x + (rect.max.x - rect.min.x) / 2)) {
        if (nearest.y < (rect.min.y + (rect.max.y - rect.min.y) / 2)) {
          if ((x - rect.min.x) < (y - rect.min.y)) {
            nearest.x = rect.min.x;
            nearest.y = y;
          } else {
            nearest.x = x;
            nearest.y = rect.min.y;
          }
        } else {
          if ((x - rect.min.x) < (rect.max.y - y)) {
            nearest.x = rect.min.x;
            nearest.y = y;
          } else {
            nearest.x = x;
            nearest.y = rect.max.y;
          }
        }
      } else {
        if (nearest.y < (rect.min.y + (rect.max.y - rect.min.y) / 2)) {
          if ((rect.max.x - x) < (y - rect.min.y)) {
            nearest.x = rect.max.x;
            nearest.y = y;
          } else {
            nearest.x = x;
            nearest.y = rect.min.y;
          }
        } else {
          if ((rect.max.x - x) < (rect.max.y - y)) {
            nearest.x = rect.max.x;
            nearest.y = y;
          } else {
            nearest.x = x;
            nearest.y = rect.max.y;
          }
        }
      }
    }

    var dx = x - nearest.x;
    var dy = y - nearest.y;
    var distance = Math.floor(Math.sqrt(dx * dx + dy * dy));
    var best = {x: nearest.x, y: nearest.y, distance: distance};
    return best;
  }

  _getTopmostModelNodeAtPoint(x, y, exclude) {
    var nodeAtPoint;
    //var svg = this.$.modelCanvas;
    var nodeArray = Array.from(this.shadowRoot.querySelectorAll('.model-node'));

    // go from top layer to bottom which is the node order in SVG
    nodeArray.reverse();

    nodeArray.some(item => {

      if (item !== exclude) {
        var modelNode = SVG(item);
        var boundingBox = item.getBBox();
        var point = modelNode.point(x, y); // in node coordinates
        //var rect = {x: boundingBox.x, y: boundingBox.y};
        let rect = {x: 0, y: 0};
        boundingBox.width = this._modelNodes[item.id].width;
        boundingBox.height = this._modelNodes[item.id].height;

        if ((point.x >= rect.x) && (point.x <= (rect.x + boundingBox.width))) {
          if ((point.y >= rect.y) && (point.y <= (rect.y + boundingBox.height))) {
            // match!
            nodeAtPoint = item;
            return true;
          }
        }
      }
    });

    return nodeAtPoint;
  }

  _getLineIntersection(line1, line2) {
    // credits to https://stackoverflow.com/a/38977789
    var ua, ub, denom = (line2.y2 - line2.y1) * (line1.x2 - line1.x1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1);
    if (denom == 0) {
      return null;
    }
    ua = ((line2.x2 - line2.x1) * (line1.y1 - line2.y1) - (line2.y2 - line2.y1) * (line1.x1 - line2.x1)) / denom;
    ub = ((line1.x2 - line1.x1) * (line1.y1 - line2.y1) - (line1.y2 - line1.y1) * (line1.x1 - line2.x1)) / denom;
    return {
      x: line1.x1 + ua * (line1.x2 - line1.x1),
      y: line1.y1 + ua * (line1.y2 - line1.y1),
      seg1: ua >= 0 && ua <= 1,
      seg2: ub >= 0 && ub <= 1
    };
  }

  _getLineNodeIntersection(line, modelNode) {
    var intersection, line2 = {};

    var boundingBox = modelNode.node.getBBox();

    var x = modelNode.transform('translateX');
    var y = modelNode.transform('translateY');
    var parent = modelNode;
    while (parent = parent.parent()) {
      if (parent.node.classList && (parent.node.classList.contains('model-node'))) {
        x += parent.transform('translateX');
        y += parent.transform('translateY');
      } else {
        break;
      }
    }

    var rect = {x: x, y: y};

    // check all four sides of the rectangle
    for (var i=0; i<4; i++) {
      if (i === 0) {
        line2.x1 = rect.x;
        line2.y1 = rect.y;
        line2.x2 = rect.x;
        line2.y2 = rect.y + boundingBox.height;
      } else if (i === 1) {
        line2.x1 = rect.x;
        line2.y1 = rect.y + boundingBox.height;
        line2.x2 = rect.x + boundingBox.width;
        line2.y2 = rect.y + boundingBox.height;
      } else if (i === 2) {
        line2.x1 = rect.x + boundingBox.width;
        line2.y1 = rect.y + boundingBox.height;
        line2.x2 = rect.x + boundingBox.width;
        line2.y2 = rect.y;
      } else if (i === 3) {
        line2.x1 = rect.x + boundingBox.width;
        line2.y1 = rect.y;
        line2.x2 = rect.x;
        line2.y2 = rect.y;
      }

      var localIntersection = this._getLineIntersection(line, line2);
      if (localIntersection && localIntersection.seg1 && localIntersection.seg2) {
        intersection = localIntersection;
        break;
      }
    }

    return intersection;
  }

  _getNodeCenter(modelNode) {
    var boundingBox = modelNode.node.getBBox();

    var x = modelNode.transform('translateX');
    var y = modelNode.transform('translateY');
    var parent = modelNode;
    while (parent = parent.parent()) {
      if (parent.node.classList && (parent.node.classList.contains('model-node'))) {
        x += parent.transform('translateX');
        y += parent.transform('translateY');
      } else {
        break;
      }
    }

    var center = {};
    center.x = x + (boundingBox.width / 2);
    center.y = y + (boundingBox.height / 2);
    return center;
  }

  _getRectInSVGCoordinates(node) {
    var modelNode = SVG(node);
    var boundingBox = node.getBBox();

    var rect = {};
    rect.x = modelNode.transform('translateX');
    rect.y = modelNode.transform('translateY');
    rect.width = boundingBox.width;
    rect.height = boundingBox.height;

    return rect;
  }

  /**
   * Shows the selection of a node visually. The boxes can be used to change the size of the node.
   *
   */
  _activateNodeManipulators(node) {
    this._currentManipulationTarget = node;
    var bbox = node.getBBox();

    var modelNode = node.instance;
    var x = modelNode.transform('translateX');
    var y = modelNode.transform('translateY');
    var parent = modelNode;
    while (parent = parent.parent()) {
      if (parent.node.classList && (parent.node.classList.contains('model-node'))) {
        x += parent.transform('translateX');
        y += parent.transform('translateY');
      } else {
        break;
      }
    }

    let opacity = this._modelNodes[node.id].resizable ? 1 : 0;
    [...this._modelManipulators.querySelectorAll('.model-manipulator')].forEach(item => item.style.opacity = opacity);

    var modelManipulators = SVG(this._modelManipulators);

    this._manipulatorBorder.setAttribute('width', bbox.width + 30);
    this._manipulatorBorder.setAttribute('height', bbox.height + 30);
    this._manipulatorN.setAttribute('x', ((bbox.width + 40) / 2) - 5);
    this._manipulatorNE.setAttribute('x', bbox.width + 29);
    this._manipulatorE.setAttribute('x', bbox.width + 29);
    this._manipulatorE.setAttribute('y', ((bbox.height + 40) / 2) - 5);
    this._manipulatorSE.setAttribute('x', bbox.width + 29);
    this._manipulatorSE.setAttribute('y', bbox.height + 29);
    this._manipulatorS.setAttribute('x', ((bbox.width + 40) / 2) - 5);
    this._manipulatorS.setAttribute('y', bbox.height + 29);
    this._manipulatorSW.setAttribute('y', bbox.height + 29);
    this._manipulatorW.setAttribute('y', ((bbox.height + 40) / 2) - 5);
    modelManipulators.transform({translateX: (x - 20), translateY: (y - 20)});

    // bring to front and make visible
    SVG(this._modelManipulators).front();
    this._modelManipulators.setAttribute('visibility', 'visible');

    // show properties
    this._elementPropertiesPanel.element = this._modelNodes[node.id];
    this._elementPropertiesPanel.elementProperties = this._modelNodes[node.id].properties;
    this._elementPropertiesPanel.hidden = false;
    // show binding properties
    let syncedModelNode = this._syncedModelNodes.get(node.id);
    // check if the node has a HTML type; if yes, show the attributes in the panel.
    let modelTypeMap = BindingRegistry.modelTypeMap;
    if (modelTypeMap[syncedModelNode.dataType]) {
      let htmlBindingId = syncedModelNode.htmlBindingId;
      this._htmlBindingPropertiesPanel.sharedState = this.direwolfSpace.sharedStates.get(htmlBindingId);
      this._htmlBindingPropertiesPanel.elementProperties = modelTypeMap[syncedModelNode.dataType].properties;
      this._htmlBindingPropertiesPanel.hidden = !(Object.keys(this._htmlBindingPropertiesPanel.elementProperties).length > 0);
    }

    // activate toolbar buttons
    this._deleteButton.disabled = false;

    this._selectedElementTitle = this._modelNodes[node.id].title;
  }

  _handleDragstart(e) {
    console.log('dragging');
  }

  _handleDrop(e) {
    console.log('drop over SVG');
    this._handleDragItemEnd(e);
  }

  _handleDragOver(e) {
    console.log('drag over SVG');
    e.preventDefault();
  }

  _updateModelBackgroundSize() {
    const pattern = this.shadowRoot.getElementById('background-pattern');
    const bbox = this._modelCanvas.getBoundingClientRect();
    const dimension = Math.max(bbox.width, bbox.height);

    // 100 is the max offset of the pattern
    const repetitions = Math.ceil((dimension + 100) / 1000);
    pattern.setAttribute('width', 0.1 / repetitions);
    pattern.setAttribute('height', 0.1 / repetitions)
    this._modelBackground.setAttribute('width', 1000 * repetitions);
    this._modelBackground.setAttribute('height', 1000 * repetitions);
  }

  uuidv4() {
    // Credits to https://stackoverflow.com/a/2117523/7248033
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  }

  /**
   * Direwolf-specific methods
   */

  globalStateAvailable(globalState) {
    // initialize model nodes
    let modelNodes;
    if (globalState.get(this.syncPrefix + 'Nodes') === undefined) {
      // create a new Y.Map type
      modelNodes = globalState.set(this.syncPrefix + 'Nodes', new Y.Map());
    } else {
      // late join
      modelNodes = globalState.get(this.syncPrefix + 'Nodes');
    }
    this._syncedModelNodes = modelNodes;
    this._syncedModelNodes.observe(this._syncedModelNodesObserver);

    // initialize model edges
    let modelEdges;
    if (globalState.get(this.syncPrefix + 'Edges') === undefined) {
      // create a new Y.Map type
      modelEdges = globalState.set(this.syncPrefix + 'Edges', new Y.Map());
    } else {
      // late join
      modelEdges = globalState.get(this.syncPrefix + 'Edges');
    }
    this._syncedModelEdges = modelEdges;
    this._syncedModelEdges.observe(this._syncedModelEdgesObserver);

    // initialize HTML binding
    if (globalState.get('htmlBindings') === undefined) {
      let htmlBindings = globalState.set('htmlBindings', new Y.Map());
    }

    // initialize preview
    //this.$.preview.direwolfSpace = this.direwolfSpace;
    //this.$.preview.globalState = globalState;
  }

  handleGlobalStateChanged(event) {
    if (event.type === 'add') {
      if (event.name === this.syncPrefix + 'Nodes') {
        //event.object.get(event.name).observe(this._handleModelNodesChanged.bind(this));
      }
    }
  }

  sharedStateAvailable(sharedState) {
    this.direwolfSpace.sharedStates.observe(this._sharedStatesObserver);
    this.direwolfSpace.sharedStates.observeDeep(this._sharedStatesDeepObserver);

    // add existing nodes to the model
    this._syncedModelNodes.forEach(item => {
      this._deferredModelElements.push(item);
    });

    // now render the deferred elements
    // there were so many cases during development, in which this while loop turned into a magical infinite loop,
    // that it needs some action to prevent this from happening...
    let action = true;
    while (action && (this._deferredModelElements.length > 0)) {
      action = false;
      this._deferredModelElements.some(element => {
        if (element && element.parentId && (element.parentId !== 'root') && !this._modelNodes[element.parentId]) {
          // the parent has not yet been rendered
        } else {
          this._addModelNode(element);
          this._deferredModelElements.splice(this._deferredModelElements.indexOf(element), 1);
          action = true;
          return true;
        }
      });
    }

    // add existing edges to the model
    this._syncedModelEdges.forEach(item => {
      this._addModelEdge(item);
    });

    // initialize HTML bindings
    let htmlBindings = this.globalState.get('htmlBindings');
    if (htmlBindings.get('root') === undefined) {
      let rootBindingId = this.direwolfSpace.getFreshId();
      let rootHTMLBinding = this.direwolfSpace.sharedStates.set(rootBindingId, new Y.Map());
      rootHTMLBinding.set('children', new Y.Array());
      htmlBindings.set('root', rootBindingId);
    }

    // initialize preview
    //this.$.preview.sharedState = this.direwolfSpace.sharedStates.set(this.direwolfSpace.getFreshId(), Y.Map);
  }

  /**
   * This is the listener to all the shared states of the children nodes.
   *
   * @param event
   * @private
   */
  _handleSharedStatesChanged(event) {
    if ((event.type === 'add') || (event.type === 'update')) {
      // check if the incoming shared state is already assigned; if not, assign it
      let modelNode = this._modelNodes[event.name];
      if (modelNode && (modelNode.sharedState === undefined)) {
        modelNode.sharedState = event.value;
      }
    }
  }

  /**
   * This is the listener to all the shared states of the children nodes. It listens to changes of the parameters
   * and adjusts the manipulators. This is to prevent the selection manipulators to remain fixed while the element
   * is being changed.
   *
   * It also listens to changes of the parentId, so that nodes are moved between parent nodes.
   *
   * @param event
   * @private
   */
  _handleSharedStatesDeepChanged(e) {
    e.forEach(event => {
      event.changes.keys.forEach((value, key, map) => {
        if (key === 'parentId') {
          if (value.oldValue !== event.target.get('parentId')) {
            let modelNode = this._modelNodes[event.path[0]];
            if (event.target.get('parentId') === 'root') {
              this._modelViewport.appendChild(modelNode.element.node);
            } else {
              let parentNode = this._modelNodes[event.target.get('parentId')];
              parentNode.element.node.appendChild(modelNode.element.node);
            }
          }
        }

        // the following lines make sure that the selection manipulators adjust to the selected node's properties
        var manipulatorVisibility = this._modelManipulators.getAttribute('visibility');
        if (this._currentManipulationTarget && (event.path[0] === this._currentManipulationTarget.id) && (manipulatorVisibility === 'visible')) {
          this._activateNodeManipulators(this._currentManipulationTarget);
        }
      });
    });
  }

  /**
   * The event handler handling Yjs events of the _syncedModelNodes shared object.
   *
   * @param event
   */
  _handleModelNodesChanged(event) {
    event.changes.keys.forEach( (value, key) => {
      if (value.action === 'add') {
        let syncedModelNode = event.currentTarget.get(key);// event.object.get(key);
        let modelNodeElement = this._addModelNode(syncedModelNode);

        // check if the node was created locally
        if (this._lastLocallyCreatedElementId === syncedModelNode.id) {
          // check if we have children to sync
          let childrenArray = modelNodeElement.getChildrenArray();
          childrenArray.forEach(item => {
            if (this._syncedModelNodes.get(item.id) === undefined) {
              //let sharedState = this.direwolfSpace.sharedStates.set(item.id, Y.Map);
              //item.sharedState = sharedState;
              this._syncedModelNodes.set(item.id, item);
            }
          });

          // activate manipulators
          this._activateNodeManipulators(modelNodeElement.element.node);
          modelNodeElement.element.node.classList.add('animated');
          modelNodeElement.element.node.classList.add('fadeIn');
        }
      } else if (value.action === 'delete') {
        // delete
        let modelNode = this._modelNodes[key];
        //TODO: add animation
        modelNode.element.remove();
        delete this._modelNodes[key];
        this._modelNodesDataTree = this._calculateModelNodesDataTree();
        // hide manipulators
        this._modelManipulators.setAttribute('visibility', 'hidden');
        this._elementPropertiesPanel.elementProperties = {};
        this._elementPropertiesPanel.hidden = true;
        this._htmlBindingPropertiesPanel.elementProperties = {};
        this._htmlBindingPropertiesPanel.hidden = true;
        this._deleteButton.disabled = true;
        this._selectedElementTitle = '';
      }
    });
  }

  _addModelNode(modelNode) {
    let createdLocally = (this._lastLocallyCreatedElementId === modelNode.id) || (this._lastLocallyCreatedElementId === modelNode.parentId);

    let modelTypeMap = BindingRegistry.modelIFMLTypeMap;

    let modelNodeElement = new modelTypeMap[modelNode.dataType](modelNode.id, createdLocally);
    modelNodeElement.direwolfSpace = this.direwolfSpace;
    modelNodeElement._parentId = modelNode.parentId;

    if (modelNode.parentId === 'root') {
      modelNodeElement.createSVGElement(SVG(this._modelViewport));
    } else {
      this._modelNodes[modelNode.parentId].appendModelChild(modelNodeElement);
    }

    if (this.direwolfSpace.sharedStates.get(modelNode.id)) {
      modelNodeElement.sharedState = this.direwolfSpace.sharedStates.get(modelNode.id);
    }

    this._modelNodes[modelNode.id] = modelNodeElement;
    this._modelNodesDataTree = this._calculateModelNodesDataTree();

    return modelNodeElement;
  }

  /**
   * A Yjs map observer for the edges Y-Map.
   *
   * @param event
   * @private
   */
  _handleModelEdgesChanged(event) {
    event.changes.keys.forEach( (value, key) => {
      if (value.action === 'add') {
        const syncedModelEdge = event.currentTarget.get(key);
        this._addModelEdge(syncedModelEdge);
      } else if (value.action === 'update') {
        // handle update of an edge's data type
        // remove edge from canvas
        const modelEdge = this._modelEdges[key];
        modelEdge.element.remove();
        // re-add edge
        const syncedModelEdge = event.currentTarget.get(key);
        this._addModelEdge(syncedModelEdge);
      } else if (value.action === 'delete') {
        const modelEdge = this._modelEdges[key];
        //TODO: add animation
        modelEdge.element.remove();
        delete this._modelEdges[key];
      }
    });
  }

  _addModelEdge(modelEdge) {
    let createdLocally = true;//(this._lastLocallyCreatedElementId === modelEdge.id) || (this._lastLocallyCreatedElementId === modelEdge.parentId);

    let viewport = SVG(this._modelViewport);

    let modelTypeMap = BindingRegistry.modelIFMLTypeMap;

    let modelEdgeElement = new modelTypeMap[modelEdge.dataType](modelEdge.id, createdLocally);
    modelEdgeElement.direwolfSpace = this.direwolfSpace;
    modelEdgeElement.createSVGElement(viewport);

    //TODO: for cloning functionality we need to decouple the IDs of element and shared state...
    let sharedState;
    if (this.direwolfSpace.sharedStates.get(modelEdge.id) === undefined) {
      sharedState = this.direwolfSpace.sharedStates.set(modelEdge.id, new Y.Map());
    } else {
      sharedState = this.direwolfSpace.sharedStates.get(modelEdge.id);
    }
    modelEdgeElement.sharedState = sharedState;

    modelEdgeElement.origin = modelEdge.origin;
    modelEdgeElement.target = modelEdge.target;
    this._modelEdges[modelEdge.id] = modelEdgeElement;
  }

}
