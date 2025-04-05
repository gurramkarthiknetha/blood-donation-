import React, { Component, ErrorInfo, ReactNode } from 'react';
import { wsService } from '../services/websocketService';
import { toastService } from '../services/toastService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WebSocketErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebSocket error:', error, errorInfo);
    wsService.disconnect();
    toastService.error('Connection error. Attempting to reconnect...');
    
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
      wsService.connect();
      this.setState({ hasError: false });
    }, 5000);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="websocket-error">
          <h3>Connection Error</h3>
          <p>Attempting to reconnect...</p>
        </div>
      );
    }

    return this.props.children;
  }
}