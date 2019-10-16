import { ModelElement } from './model-element.js';

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

  get resizable() {
    return true;
  }

  showPortOnHover() {
    return false;
  }

  get minDiameter() {
    return this._minDiameter;
  }

  get width() {
    return this.diameter;
  }

  get height() {
    return this.diameter;
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

    this.element.transform({x: this.x});
    this.element.transform({y: this.y});
    this.circle.radius(this.diameter / 2);
  }

  handleSharedStateChanged(event) {
    event.keysChanged.forEach((key) => {
      switch (key) {
        case 'x':
          this.element.transform({x: event.target.get(key)});
          break;
        case 'y':
          this.element.transform({y: event.target.get(key)});
          break;
        case 'diameter':
          this.circle.radius(event.target.get(key) / 2);
          break;
      }
    });
  }

}
