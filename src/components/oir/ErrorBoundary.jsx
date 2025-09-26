import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong with this component
          </h2>
          <p className="text-red-700 mb-4">
            An error occurred while rendering the question. This might be due to invalid data format.
          </p>
          
          {this.props.showDetails && (
            <details className="mb-4">
              <summary className="cursor-pointer text-red-600 font-medium">
                Technical Details (Click to expand)
              </summary>
              <div className="mt-2 p-3 bg-red-100 rounded text-sm">
                <p className="font-medium">Error:</p>
                <pre className="text-xs overflow-auto mb-2">
                  {this.state.error && this.state.error.toString()}
                </pre>
                <p className="font-medium">Stack Trace:</p>
                <pre className="text-xs overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}
          
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;