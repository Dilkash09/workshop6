import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Connect to the server
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });
  }

  // Send message to server
  sendMessage(message: string): void {
    this.socket.emit('chatMessage', message);
  }

  // Listen for incoming messages
  getMessages(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('message', (data: string) => {
        observer.next(data);
      });

      // Cleanup function
      return () => {
        this.socket.off('message');
      };
    });
  }

  // Get socket connection status
  get isConnected(): boolean {
    return this.socket.connected;
  }
}