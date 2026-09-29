import React from 'react';

/**
 * R5 (F4): reusable error boundary for heavy views (WebGL atlas, lazy labs).
 * A throw inside the wrapped subtree degrades to a graceful card instead of
 * blanking the whole app — and points learners at the accessible 2D mode,
 * which is the app's built-in degraded route.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', this.props.label || 'view', error, info?.componentStack);
  }

  reset() {
    this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="error-boundary-fallback" role="alert">
        <span className="eyebrow">VIEW PROTECTED · {String(this.props.label || 'THIS VIEW').toUpperCase()}</span>
        <strong>This view hit an unexpected error.</strong>
        <p>{String(this.state.error?.message || this.state.error)}</p>
        <div className="error-boundary-actions">
          <button type="button" className="primary-cta" onClick={this.reset}>Try this view again</button>
          <button type="button" className="outline-button" onClick={() => window.location.reload()}>Reload the lab</button>
        </div>
        <small>If the 3D atlas keeps failing, its “Accessible 2D mode” toggle provides a keyboard-ready view.</small>
      </div>
    );
  }
}
