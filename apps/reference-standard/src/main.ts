import './styles.css';
import {
  StandardReferenceApplication,
  type StandardReferenceApplicationState,
} from './reference-application.js';
import { StandardDomRenderer } from './dom-renderer.js';

export function renderReferenceSkeleton(root: HTMLElement): () => void {
  const application = new StandardReferenceApplication();
  const heading = document.createElement('h1');
  heading.textContent = 'Schema Engine Standard reference';
  const summary = document.createElement('p');
  const result = document.createElement('p');
  result.dataset['testid'] = 'compile-status';
  result.setAttribute('role', 'status');
  const formHost = document.createElement('section');
  formHost.dataset['testid'] = 'form-preview';
  root.replaceChildren(heading, summary, result, formHost);

  let activeDefinition: StandardReferenceApplicationState['definition'];
  let renderer: StandardDomRenderer | undefined;
  let releaseRenderer: (() => void) | undefined;
  const render = (state: StandardReferenceApplicationState): void => {
    const status = state.definition
      ? 'Public core compilation succeeded.'
      : 'Public core compilation failed.';
    summary.textContent = state.scenario.summary;
    result.textContent = status;

    if (state.definition !== activeDefinition) {
      releaseRenderer?.();
      renderer = undefined;
      activeDefinition = state.definition;
      const runtime = application.getRuntime();
      if (state.definition !== undefined && runtime !== undefined) {
        const nextRenderer = new StandardDomRenderer(
          formHost,
          state.definition,
          runtime,
        );
        renderer = nextRenderer;
        releaseRenderer = application.registerBindingCleanup(() =>
          nextRenderer.dispose(),
        );
      } else {
        formHost.replaceChildren();
        releaseRenderer = undefined;
      }
    }
    if (state.snapshot !== undefined) renderer?.reconcile(state.snapshot);
  };
  const unsubscribe = application.subscribeState(render);
  return () => {
    releaseRenderer?.();
    unsubscribe();
    application.dispose();
    root.replaceChildren();
  };
}

const root = document.querySelector<HTMLElement>('#app');
if (root !== null) {
  const dispose = renderReferenceSkeleton(root);
  const handlePageHide = (): void => {
    window.removeEventListener('pagehide', handlePageHide);
    dispose();
  };
  window.addEventListener('pagehide', handlePageHide);
}
