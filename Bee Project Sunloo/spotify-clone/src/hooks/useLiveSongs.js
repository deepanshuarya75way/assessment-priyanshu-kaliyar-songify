import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

/**
 * Hook that wires up a socket.io listener for `song:new` events.
 * @param {string} token - The JWT used for authenticating the socket connection.
 * @param {(song: object) => void} onSongReceived - Callback invoked whenever a new song broadcast arrives.
 */
export default function useLiveSongs(token, onSongReceived) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return undefined;
    }

    if (socketRef.current && socketRef.current.__authToken !== token) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (!socketRef.current) {
      socketRef.current = io(API_URL, {
        transports: ['websocket'],
        auth: { token },
      });
      socketRef.current.__authToken = token;
    }

    const socket = socketRef.current;

    const handler = (song) => {
      if (typeof onSongReceived === 'function') {
        onSongReceived(song);
      }
    };

    socket.on('song:new', handler);

    return () => {
      socket.off('song:new', handler);
    };
  }, [token, onSongReceived]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);
}


