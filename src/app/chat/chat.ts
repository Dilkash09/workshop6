import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../socket';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],

  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: string[] = [];
  newMessage: string = '';
  connectionStatus: string = 'Connecting...';
  private messageSubscription!: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    // Check connection status
    if (this.socketService.isConnected) {
      this.connectionStatus = 'Connected';
    }

    // Subscribe to incoming messages
    this.messageSubscription = this.socketService.getMessages().subscribe(
      (message: string) => {
        this.messages.push(message);
      },
      (error) => {
        console.error('Error receiving message:', error);
        this.connectionStatus = 'Connection error';
      }
    );
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.socketService.sendMessage(this.newMessage.trim());
      this.newMessage = '';
    }
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}