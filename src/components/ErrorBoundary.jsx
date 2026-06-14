import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * React class-based error boundary that catches rendering errors
 * and displays a graceful fallback UI instead of a blank screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send to an error monitoring service
    console.error('[EcoStep ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen bg-slate-950 flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full text-center bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-5xl mb-4">🌿</div>
            <h1 className="text-2xl font-extrabold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              EcoStep encountered an unexpected error. Your tracked data is safe
              in your browser.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-400/70 bg-red-500/5 border border-red-500/10 rounded-xl p-3 mb-6 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold hover:bg-white/10 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
