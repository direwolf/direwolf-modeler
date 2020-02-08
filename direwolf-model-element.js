import 'direwolf-elements/direwolf-node-mixin.js';

class DirewolfModelElement extends DirewolfNodeMixin(Object) {

  constructor(id) {
    super();

    this._id = id;
  }

  get id() {
    return this._id;
  }

  get draggedEdgeType() {
    return null;
  }

  createSVGElement(viewport) {
    let group = viewport.group();
    group.addClass('model-element');

    this.element = group;
    this.element.node.id = this.id;

    return this.element;
  }

}
