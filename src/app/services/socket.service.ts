import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { MessageModel } from '../models/message.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private authService = inject(AuthService);
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket) return;

    this.socket = io();

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(channelId: string, text: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    this.socket.emit('send-message', {
      channelId,
      userId: user.id,
      text
    });
  }

  joinChannel(channelId: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    this.socket.emit('join-channel', {
      channelId,
      userId: user.id
    });
  }

  leaveChannel(channelId: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    this.socket.emit('leave-channel', {
      channelId,
      userId: user.id
    });
  }

  onMessage(callback: (message: MessageModel) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.on('new-message', (data: any) => {
      callback(MessageModel.fromJSON(data));
    });
  }

  onError(callback: (error: any) => void): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.on('error', (error: any) => {
      callback(error);
    });
  }
}