import 'direwolf-ifml-elements/ifml-palette.js';
import { IFMLViewContainer } from  'direwolf-ifml-elements/ifml-view-container';
import { IFMLAction } from  'direwolf-ifml-elements/ifml-action';
import { IFMLViewComponent } from  'direwolf-ifml-elements/ifml-view-component';
import { IFMLViewComponentForm } from  'direwolf-ifml-elements/ifml-view-component-form';
import { IFMLViewComponentList } from  'direwolf-ifml-elements/ifml-view-component-list';
import { IFMLEvent } from  'direwolf-ifml-elements/ifml-event';
import { IFMLParameter } from  'direwolf-ifml-elements/ifml-parameter';
import { IFMLNavigationFlow } from 'direwolf-ifml-elements/ifml-navigation-flow';
import { IFMLDataFlow } from 'direwolf-ifml-elements/ifml-data-flow';

import { IStarActor } from 'direwolf-istar-elements/istar-actor';
import { IStarRole } from 'direwolf-istar-elements/istar-role';
import { IStarAgent } from 'direwolf-istar-elements/istar-agent';
import { IStarBoundary } from 'direwolf-istar-elements/istar-boundary';
import { IStarGoal } from 'direwolf-istar-elements/istar-goal';
import { IStarQuality } from 'direwolf-istar-elements/istar-quality';
import { IStarTask } from 'direwolf-istar-elements/istar-task';
import { IStarResource } from 'direwolf-istar-elements/istar-resource';
import { IStarRefinementAnd } from 'direwolf-istar-elements/istar-refinement-and';
import { IStarRefinementOr } from 'direwolf-istar-elements/istar-refinement-or';
import { IStarAssociationIsA } from 'direwolf-istar-elements/istar-association-is-a';
import { IStarAssociationParticipatesIn } from 'direwolf-istar-elements/istar-association-participates-in';
import { IStarRelationshipNeededBy } from 'direwolf-istar-elements/istar-relationship-needed-by';
import { IStarDependency } from 'direwolf-istar-elements/istar-dependency';
import { IStarContribution } from 'direwolf-istar-elements/istar-contribution';
import { IStarQualification } from 'direwolf-istar-elements/istar-qualification';

export default class BindingRegistry {

  /**
   * This map defines the mapping from IFML node type to IFML object (which is responsible for managing the state and
   * drawing the SVG).
   *
   */
  static get modelIFMLTypeMap() {
    return {
      'view-container': IFMLViewContainer,
      'action': IFMLAction,
      'view-component': IFMLViewComponent,
      'view-component-form': IFMLViewComponentForm,
      'view-component-list': IFMLViewComponentList,
      'navigation-flow': IFMLNavigationFlow,
      'data-flow': IFMLDataFlow,
      'event': IFMLEvent,
      'ifml-parameter': IFMLParameter,
      'istar-actor': IStarActor,
      'istar-role': IStarRole,
      'istar-agent': IStarAgent,
      'istar-boundary': IStarBoundary,
      'istar-goal': IStarGoal,
      'istar-quality': IStarQuality,
      'istar-task': IStarTask,
      'istar-resource': IStarResource,
      'istar-refinement-and': IStarRefinementAnd,
      'istar-refinement-or': IStarRefinementOr,
      'istar-association-is-a': IStarAssociationIsA,
      'istar-association-participates-in': IStarAssociationParticipatesIn,
      'istar-relationship-needed-by': IStarRelationshipNeededBy,
      'istar-dependency': IStarDependency,
      'istar-contribution': IStarContribution,
      'istar-qualification': IStarQualification
      /*
      'material-toolbar': IFMLViewComponent,
      'material-textbox': IFMLViewComponent,
      'material-button': IFMLViewComponent,
      'material-image': IFMLViewComponent,
      'material-dropdown': IFMLViewComponent,
      'material-layout': IFMLViewContainer,
      'openapi-view-component-list': IFMLViewComponentList,
      'openapi-details-view-component': IFMLViewComponent,
      'openapi-ifml-action': IFMLAction,
      'asyncapi-ifml-view-component-form': IFMLAsyncAPIViewComponentForm,
      'asyncapi-ifml-action': IFMLAsyncAPIAction,
      'asyncapi-ifml-event': IFMLAsyncAPIEvent,
      */
    };
  }

  /**
   * This map defines the mapping from node model type to HTML custom element. Should be named modelHTMLTypeMap.
   *
   */
  static get modelTypeMap() {
    return {
      /*
      'view-component': IFML2HTMLViewComponent,
      'view-container': IFML2HTMLViewContainer,
      'material-toolbar': IFML2HTMLMaterialToolbar,
      'material-textbox': IFML2HTMLMaterialTextbox,
      'material-button': IFML2HTMLMaterialButton,
      'material-image': IFML2HTMLMaterialImage,
      'material-dropdown': IFML2HTMLMaterialDropdown,
      'material-layout': IFML2HTMLMaterialLayout,
      'openapi-view-component-list': IFML2HTMLOpenAPIViewComponentList,
      'openapi-details-view-component': IFML2HTMLOpenAPIDetailsViewComponent,
      'asyncapi-ifml-view-component-form': IFML2HTMLAsyncAPIViewComponentForm,
      'asyncapi-ifml-action': IFML2HTMLAsyncAPIAction,
      'asyncapi-ifml-event': IFML2HTMLAsyncAPIEvent,
      */
    };
  }

}
