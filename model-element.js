import { DirewolfNodeMixin } from 'direwolf-elements/direwolf-node-mixin.js';

export class ModelElement extends DirewolfNodeMixin(Object) {

  constructor(id, createdLocally) {
    super();

    this._id = id;
    this._createdLocally = createdLocally;
    this._parentId = 'root';

    Object.keys(this.properties).forEach(key => {
      Object.defineProperty(this, key, {
        get: function() {
          return this.sharedState.get(key);
        },
        set: function(value) {
          this.sharedState.set(key, value);
        }
      });
    });
  }

  get properties() {
    return {};
  }

  get id() {
    return this._id;
  }

  getChildrenArray() {
    return [];
  }

  get draggedEdgeType() {
    return null;
  }

  acceptsChild(modelElementType) {
    return false;
  }

  modelElementDragOver(modelElementType) {
    return this.acceptsChild(modelElementType);
  }

  appendModelChild(modelElement) {
    modelElement.createSVGElement(this.element);
  }

  createSVGElement(viewport) {
    let group = viewport.group();
    group.node.id = this.id;
    group.addClass('model-element');

    this.element = group;

    return this.element;
  }

  toJSON() {
    return {id: this.id};
  }

  set parentId(value) {
    this.sharedState.set('parentId', value);
  }

  get parentId() {
    return this.sharedState.get('parentId');
  }

  /**
   * Direwolf-specific methods
   */

  sharedStateAvailable(sharedState) {
    if (this._createdLocally) {
      this.parentId = this._parentId;
    }
  }

}
