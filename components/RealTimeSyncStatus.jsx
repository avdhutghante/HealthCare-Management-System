import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import realTimeSync from './utils/realTimeSync';

const RealTimeSyncStatus = ({ className = "" }) => {
  const [status, setStatus] = useState({
    connected: false,
    user: null,
    reconnectAttempts: 0
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update status periodically
    const updateStatus = () => {
      setStatus(realTimeSync.getStatus());
    };

    // Initial status check
    updateStatus();
    const statusInterval = setInterval(updateStatus, 2000);

    // Listen for sync events
    const handleConnected = () => {
      setStatus(realTimeSync.getStatus());
      setLastUpdate(new Date());
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 3000);
    };

    const handleDisconnected = () => {
      setStatus(realTimeSync.getStatus());
      setIsVisible(true);
    };

    const handleError = () => {
      setStatus(realTimeSync.getStatus());
      setIsVisible(true);
    };

    const handleAppointmentUpdate = () => {
      setLastUpdate(new Date());
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 2000);
    };

    realTimeSync.on('sync:connected', handleConnected);
    realTimeSync.on('sync:disconnected', handleDisconnected);
    realTimeSync.on('sync:error', handleError);
    realTimeSync.on('appointment:updated', handleAppointmentUpdate);

    return () => {
      clearInterval(statusInterval);
      realTimeSync.off('sync:connected', handleConnected);
      realTimeSync.off('sync:disconnected', handleDisconnected);
      realTimeSync.off('sync:error', handleError);
      realTimeSync.off('appointment:updated', handleAppointmentUpdate);
    };
  }, []);

  const getStatusIcon = () => {
    if (status.connected) {
      return <Wifi className="w-4 h-4 text-green-500" />;
    } else if (status.reconnectAttempts > 0) {
      return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
    } else {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (status.connected) {
      return 'Real-time sync active';
    } else if (status.reconnectAttempts > 0) {
      return 'Reconnecting...';
    } else {
      return 'Real-time sync offline';
    }
  };

  const getStatusColor = () => {
    if (status.connected) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (status.reconnectAttempts > 0) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const handleReconnect = () => {
    realTimeSync.reconnect();
    setIsVisible(true);
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Always visible status indicator */}
      <motion.div
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {getStatusIcon()}
        <span className="hidden sm:inline">{getStatusText()}</span>
        {!status.connected && (
          <button
            onClick={handleReconnect}
            className="ml-2 p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
            title="Retry connection"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </motion.div>

      {/* Notification popup */}
      {isVisible && (
        <motion.div
          className="mt-2 p-3 bg-white rounded-lg shadow-lg border max-w-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start space-x-2">
            {status.connected ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : status.reconnectAttempts > 0 ? (
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                {status.connected ? 'Connected!' : status.reconnectAttempts > 0 ? 'Reconnecting...' : 'Disconnected'}
              </p>
              <p className="text-sm text-gray-600">
                {status.connected 
                  ? 'Cross-device sync is active. Appointments will sync in real-time.'
                  : status.reconnectAttempts > 0
                  ? `Attempting to reconnect (${status.reconnectAttempts}/5)`
                  : 'Appointments will only sync locally on this device.'
                }
              </p>
              {lastUpdate && (
                <p className="text-xs text-gray-500 mt-1">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeSyncStatus;