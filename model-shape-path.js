import { ModelElement } from './model-element.js';
import { Array as YArray } from 'yjs';

export class ModelShapePath extends ModelElement {

  constructor(id, createdLocally, pathArray = []) {
    super(id, createdLocally);

    this._pathArray = pathArray;
  }

  get descriptiveName() {
    return 'Path';
  }

  createSVGElement(viewport) {
    let group = super.createSVGElement(viewport);
    group.addClass('model-edge');

    this.path = group.path().stroke({ width: 1, color: 'black' });

    this.hoverGroup = group.group();
    this.hoverGroup.addClass('model-edge-hover');
    this.hoverPath = this.hoverGroup.path().stroke({width:15, color: 'red', opacity: 0});

    this.rects = [];
    this.hoverGroup.mouseover(() => {
      this.rects.forEach(rect => rect.opacity(1));
    });

    this.hoverGroup.mouseout(() => {
      this.rects.forEach(rect => rect.opacity(0));
    });

    this.redrawPath();

    return this.element;
  }

  get properties() {
    return Object.assign(super.properties, {
      start: {
        type: Array,
        hidden: true
      },
      end: {
        type: Array,
        hidden: true
      },
      origin: {
        type: String,
        hidden: true
      },
      target: {
        type: String,
        hidden: true
      },
      points: {
        type: YArray,
        hidden: true
      }
    });
  }

  redrawPath() {
    let description;

    if (this._pathArray.length > 0) {
      let start = this._pathArray[0];
      description = 'M ' + start[0] + ' ' + start[1];

      for (let i = 1; i < this._pathArray.length; i += 1) {
        description += ` L ${this._pathArray[i][0]} ${this._pathArray[i][1]}`;

        if (i < (this._pathArray.length - 1)) {
          let rect;
          if (this.rects[i-1]) {
            rect = this.rects[i-1];
          } else {
            rect = this.hoverGroup.rect(10, 10).fill('black').opacity(0);
            rect.mousedown(this.handleRectMousedown.bind(this));
            rect.click(this.handleRectClick.bind(this));
            this.rects.push(rect);
          }
          rect.cx(this._pathArray[i][0]);
          rect.cy(this._pathArray[i][1]);
        }
      }
    }

    this.path.plot(description);
    this.hoverPath.plot(description);
  }

  handleRectMousedown(e) {
    const rectIndex = this.rects.indexOf(e.target.instance);
    this.lastRectPosition = this.points.get(rectIndex + 1);
  }

  handleRectClick(e) {
    const rectIndex = this.rects.indexOf(e.target.instance)
    if (this.lastRectPosition === this.points.get(rectIndex + 1)) {
      e.target.instance.remove();
      this.rects.splice(rectIndex, 1);
      this.points.delete(rectIndex + 1);
    }
    this.lastRectPosition = undefined;
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
    if (Array.isArray(this.points)) {
      // apparently we restored from file, so we need to convert to a YArray.
      const yarray = new YArray();
      yarray.push(this.points);
      this.points = yarray;
      this._pathArray = this.points.toArray();
    } else if (this.points !== undefined) {
      this._pathArray = this.points.toArray();
    } else {
      // support older versions that did not have the patharray as shared property
      this._pathArray.push(this.start);
      if (this.end !== undefined) {
        this._pathArray.push(this.end);
      }
      this.points = new YArray();
      this.points.push(this._pathArray);
    }
    this.points.observe(this.handlePointsChanged.bind(this));
    this.redrawPath();
  }

  handleSharedStateChanged(event) {
    event.keysChanged.forEach((key) => {
      switch (key) {
        case 'points':
          this._pathArray = event.target.get(key).toArray();
          this.redrawPath();
          break;
        case 'start':
          this.points.delete(0, 1);
          this.points.insert(0, [event.target.get(key)]);
          break;
        case 'end':
          if (this.points.length > 1) {
            const lastIndex = this.points.length - 1;
            this.points.delete(lastIndex, 1);
          }
          this.points.push([event.target.get(key)]);
          break;
      }
    });
  }

  handlePointsChanged(event) {
    this._pathArray = this.points.toArray();
    this.redrawPath();
  }

  getNewPointIndex(x, y) {
    if (this.points.length === 2) {
      return 1;
    }

    // visit each path segment
    let minIndex = 1;
    let minDistance = -1;
    for (let i = 1; i < this._pathArray.length; i += 1) {
      let x1, y1, x2, y2;
      [x1, y1] = this.points.get(i-1);
      [x2, y2] = this.points.get(i);

      // thx https://stackoverflow.com/questions/31494662/
      const distance = ((Math.abs((y2 - y1) * x - 
        (x2 - x1) * y + 
        x2 * y1 - 
        y2 * x1)) /
        (Math.pow((Math.pow(y2 - y1, 2) + 
        Math.pow(x2 - x1, 2)), 0.5)));
      if ((minDistance === -1) || (distance < minDistance)) {
        minIndex = i;
        minDistance = distance;
      }
    }

    return minIndex;
  }

}
