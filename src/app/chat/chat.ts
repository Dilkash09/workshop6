import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageModel } from '../models/message.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  changeDetection: ChangeDetectionStrategy.OnPush // 👈 Add this line
})
export class ChatComponent {
  private authService = inject(AuthService);

  @Input() currentChannel: any = null;
  @Input() messages: MessageModel[] = [];
  @Input() isLoading = false;
  @Output() sendMessage = new EventEmitter<string>();
  @Output() leaveChannel = new EventEmitter<void>();

  newMessage = '';

  onSendMessage() {
    if (this.newMessage.trim()) {
      this.sendMessage.emit(this.newMessage.trim());
      this.newMessage = '';
    }
  }

  onLeaveChannel() {
    this.leaveChannel.emit();
  }

  isCurrentUser(message: MessageModel): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? message.userId === currentUser.id : false;
  }
}