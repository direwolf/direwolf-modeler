import { ModelShapeRect } from './model-shape-rect.js';
import {ShapeInfo} from 'kld-intersections';

export class ModelShapeHexagon extends ModelShapeRect {

  constructor(id, createdLocally) {
    super(id, createdLocally);

    this._minWidth = 70;
    this._minHeight = 40;
    this._width = 70;
    this._height = 40;
  }

  get descriptiveName() {
    return 'Hexagon';
  }

  createSVGElement(viewport) {
    let group = super.createSVGElement(viewport);

    this.rect.attr({'fill-opacity': 0}).stroke({width: 0});

    this.polygon = group.polygon('10,0 0,20 10,40 60,40 70,20 60,0').fill('lightgray').stroke({width: 1, color: 'black'});

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

  getOuterShape(offset) {
    offset.x += this.x;
    offset.y += this.y;
    // '10,0 0,20 10,40 60,40 70,20 60,0'
    return ShapeInfo.polygon([offset.x + 10, offset.y + 0, offset.x + 0, offset.y + (this.height / 2), offset.x + 10, offset.y + this.height, offset.x + (this.width - 10), offset.y + this.height, offset.x + this.width, offset.y + (this.height / 2), offset.x + (this.width - 10), offset.y + 0]);
    //return ShapeInfo.polygon([offset.x + 10, offset.y + 0, offset.x + 0, offset.y + 20, offset.x + 10, offset.y + 40, offset.x + 60, offset.y + 40, offset.x + 70, offset.y + 20, offset.x + 60, offset.y + 0]);
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
