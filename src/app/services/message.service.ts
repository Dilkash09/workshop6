import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageModel } from '../models/message.model';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private socketService = inject(SocketService);
  private apiBase = 'http://localhost:3000/api';

  getMessagesForChannel(channelId: string): Observable<MessageModel[]> {
    return this.http.get<any[]>(`${this.apiBase}/channels/${channelId}/messages`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(messages => messages.map(message => MessageModel.fromJSON(message)))
    );
  }

  sendMessage(channelId: string, text: string): void {
    this.socketService.sendMessage(channelId, text);
  }

  joinChannel(channelId: string): void {
    this.socketService.joinChannel(channelId);
  }

  leaveChannel(channelId: string): void {
    this.socketService.leaveChannel(channelId);
  }

  onMessage(callback: (message: MessageModel) => void): void {
    this.socketService.onMessage(callback);
  }

  connect(): void {
    this.socketService.connect();
  }

  disconnect(): void {
    this.socketService.disconnect();
  }

  onError(callback: (error: any) => void): void {
    this.socketService.onError(callback);
  }
}