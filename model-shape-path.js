import { ModelElement } from './model-element.js';

export class ModelShapePath extends ModelElement {

  constructor(id, createdLocally, pathArray = []) {
    super(id, createdLocally);

    this._pathArray = pathArray;
  }

  createSVGElement(viewport) {
    let group = super.createSVGElement(viewport);
    group.addClass('model-edge');

    this.path = group.path().stroke({ width: 1, color: 'black' });

    this.hoverPath = group.path().stroke({width:15, color: 'red', opacity: 0});
    this.hoverPath.addClass('model-edge-hover');

    this.redrawPath();

    return this.element;
  }

  get properties() {
    return Object.assign(super.properties, {
      start: {
        type: Number,
        hidden: true
      },
      end: {
        type: Number,
        hidden: true
      },
      origin: {
        type: Number,
        hidden: true
      },
      target: {
        type: Number,
        hidden: true
      }
    });
  }

  redrawPath() {
    let description;

    if (this._pathArray.length > 0) {
      let start = this._pathArray[0];
      description = 'M ' + start[0] + ',' + start[1];

      if (this._pathArray.length > 1) {
        let end = this._pathArray[this._pathArray.length - 1];
        description += ' L ' + end[0] + ',' + end[1];
      }
    }

    this.path.plot(description);
    this.hoverPath.plot(description);
  }

  handleDown() {
    this.hoverPath.stroke({color: 'gray', opacity: 0.5}).addClass('blink');
  }

  handleUp() {
    this.hoverPath.stroke({color: 'red', opacity: 0}).removeClass('blink');
  }

  /**
   * Direwolf-specific methods
   */

  sharedStateAvailable(sharedState) {
    this._pathArray[0] = this.start;
    if (this.end !== undefined) {
      this._pathArray.push(this.end);
    }
    this.redrawPath();
  }

  handleSharedStateChanged(event) {
    event.keysChanged.forEach((key) => {
      switch (key) {
        case 'start':
            this._pathArray[0] = event.target.get(key);
            this.redrawPath();
          break;
        case 'end':
          if (this._pathArray.length > 1) {
            this._pathArray[this._pathArray.length - 1] = event.target.get(key);
          } else {
            this._pathArray.push(event.target.get(key));
          }
          this.redrawPath();
          break;
      }
    });
  }

}
