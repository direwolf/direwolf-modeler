import { ModelElement } from './model-element.js';
import {ShapeInfo} from 'kld-intersections';

export class ModelShapeCircle extends ModelElement {

  constructor(id, createdLocally) {
    super(id, createdLocally);

    this._minDiameter = 80;
    this._diameter = 80;
  }

  createSVGElement(viewport) {
    let group = super.createSVGElement(viewport);
    group.addClass('model-node');

    this.circle = group.circle(this._diameter).stroke({ width: 1, color: 'black' });

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
      diameter: {
        type: Number
      }
    });
  }

  get descriptiveName() {
    return 'Circle';
  }

  get resizable() {
    return true;
  }

  showPortOnHover() {
    return false;
  }

  get minDiameter() {
    return this._minDiameter;
  }

  set width(width) {
    this.diameter = width;
  }

  get width() {
    return this.diameter;
  }

  set height(height) {
    this.diameter = height;
  }

  get height() {
    return this.diameter;
  }

  getOuterShape(offset) {
    return ShapeInfo.circle({cx: (offset.x + this.x + this.circle.attr('cx')), cy: (offset.y + this.y + this.circle.attr('cy')), r: this.circle.attr('r')});
  }


  /**
   * Direwolf-specific methods
   */

  sharedStateAvailable(sharedState) {
    super.sharedStateAvailable(sharedState);

    if (this._createdLocally) {
      if (this.diameter === undefined) {
        this.diameter = this._diameter;
      }
    }

    this.element.transform({translateX: this.x, translateY: this.y});
    this.circle.radius(this.diameter / 2);
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
        case 'diameter':
          this.circle.radius(event.target.get(key) / 2);
          break;
      }
    });
  }

}
