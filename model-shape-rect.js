import { ModelElement } from './model-element.js';
import {ShapeInfo} from 'kld-intersections';

export class ModelShapeRect extends ModelElement {

  constructor(id, createdLocally) {
    super(id, createdLocally);

    this._minWidth = 150;
    this._minHeight = 80;
    this._width = 156;
    this._height = 126;
  }

  createSVGElement(viewport) {
    let group = super.createSVGElement(viewport);
    group.addClass('model-node');

    this.rect = group.rect(this._width, this._height).stroke({ width: 1, color: 'black' });

    return this.element;
  }

  get properties() {
    return Object.assign(super.properties, {
      x: {
        type: Number
      },
      y: {
        type: Number
      },
      height: {
        type: Number
      },
      width: {
        type: Number
      }
    });
  }

  get resizable() {
    return true;
  }

  showPortOnHover() {
    return false;
  }

  get minWidth() {
    return this._minWidth;
  }

  get minHeight() {
    return this._minHeight;
  }

  getOuterShape(offset) {
    return ShapeInfo.rectangle({x: (offset.x + this.x), y: (offset.y + this.y), width: this.width, height: this.height});
  }


  /**
   * Direwolf-specific methods
   */

  sharedStateAvailable(sharedState) {
    super.sharedStateAvailable(sharedState);

    if (this._createdLocally) {
      if (this.width === undefined) {
        this.width = this._width;
      }
      if (this.height === undefined) {
        this.height = this._height;
      }
    }

    this.element.transform({translateX: this.x, translateY: this.y});
    this.rect.width(this.width);
    this.rect.height(this.height);
  }

  handleSharedStateChanged(event) {
    event.keysChanged.forEach((key) => {
      switch (key) {
        case 'x':
          this.element.transform({translateX: event.target.get(key), translateY: this.y});
          break;
        case 'y':
          this.element.transform({translateX: this.x, translateY: event.target.get(key)});
          break;
        case 'width':
          this.rect.width(event.target.get(key));
          break;
        case 'height':
          this.rect.height(event.target.get(key));
          break;
      }
    });
  }

}
