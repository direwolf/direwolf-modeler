import { ModelShapeRect } from './model-shape-rect.js';

export class ModelShapeHexagon extends ModelShapeRect {

  constructor(id, createdLocally) {
    super(id, createdLocally);

    this._minWidth = 70;
    this._minHeight = 40;
    this._width = 70;
    this._height = 40;
  }

  createSVGElement(viewport) {
    let group = super.createSVGElement(viewport);

    this.rect.attr({'fill-opacity': 0}).stroke({ width: 0});

    this.polygon = group.polygon('10,0 0,20 10,40 60,40 70,20 60,0').fill('lightgray').stroke({width: 1});

    return group;
  }

  get properties() {
    return Object.assign(super.properties, {
    });
  }

  showPortOnHover() {
    return false;
  }

  _resize() {
    let width = this.width;
    let height = this.height;

    // a resize only makes sense if both width and height are already defined...
    if (width && height) {
      this.polygon.plot([[10,0], [0,(height / 2)], [10,height], [(width - 10),height], [width,(height / 2)], [(width - 10),0]]);
    }
  }

  modelElementDragOver(modelElementType) {
    return this.acceptsChild(modelElementType);
  }

  /**
   * Direwolf-specific methods
   */

  sharedStateAvailable(sharedState) {
    super.sharedStateAvailable(sharedState);

    this._resize();
  }

  handleSharedStateChanged(event) {
    super.handleSharedStateChanged(event);

    event.keysChanged.forEach((key) => {
      switch (key) {
        case 'width':
          this._resize();
          break;
        case 'height':
          this._resize();
          break;
      }
    });
  }

}
