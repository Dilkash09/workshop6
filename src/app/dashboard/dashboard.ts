import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupModel } from '../models/group.model';
import { ChannelModel } from '../models/channel.model';
import { MessageModel } from '../models/message.model';
import { AuthService } from '../services/auth.service';
import { GroupService } from '../services/group.service';
import { ChannelService } from '../services/channel.service';
import { MessageService } from '../services/message.service';
import { ChatComponent } from '../chat/chat';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Make authService public so it can be accessed from the template
  public authService = inject(AuthService); 
  private groupService = inject(GroupService);
  private channelService = inject(ChannelService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  currentGroup: GroupModel | null = null;
  currentChannel: ChannelModel | null = null;
  groups: GroupModel[] = [];
  channels: ChannelModel[] = [];
  messages: MessageModel[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.loadGroups();
    this.messageService.connect();
    this.messageService.onMessage((message) => this.handleNewMessage(message));
    this.messageService.onError((error) => this.handleSocketError(error));
  }

  ngOnDestroy() {
    if (this.currentChannel) {
      this.messageService.leaveChannel(this.currentChannel.id);
    }
    this.messageService.disconnect();
  }

  async loadGroups() {
    this.isLoading = true;
    try {
      this.groups = await this.groupService.getAllGroups().toPromise() || [];
    } catch (error: any) {
      console.error('Error loading groups:', error);
      this.errorMessage = error.error?.error || 'Failed to load groups';
    } finally {
      this.isLoading = false;
    }
  }

  async selectGroup(group: GroupModel) {
    this.currentGroup = group;
    this.currentChannel = null;
    this.messages = [];
    await this.loadChannelsForGroup(group.id);
  }

  async loadChannelsForGroup(groupId: string) {
    this.isLoading = true;
    try {
      this.channels = await this.channelService.getChannelsForGroup(groupId).toPromise() || [];
    } catch (error: any) {
      console.error('Error loading channels:', error);
      this.errorMessage = error.error?.error || 'Failed to load channels';
    } finally {
      this.isLoading = false;
    }
  }

  async selectChannel(channel: ChannelModel) {
    if (this.currentChannel) {
      this.messageService.leaveChannel(this.currentChannel.id);
    }

    this.currentChannel = channel;
    this.messageService.joinChannel(channel.id);
    await this.loadMessagesForChannel(channel.id);
  }

  async loadMessagesForChannel(channelId: string) {
    this.isLoading = true;
    try {
      this.messages = await this.messageService.getMessagesForChannel(channelId).toPromise() || [];
    } catch (error: any) {
      console.error('Error loading messages:', error);
      this.errorMessage = error.error?.error || 'Failed to load messages';
    } finally {
      this.isLoading = false;
    }
  }

  handleNewMessage(message: MessageModel) {
    if (this.currentChannel && message.channelId === this.currentChannel.id) {
      this.messages = [...this.messages, message];
      setTimeout(() => {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 100);
    }
  }

  handleSocketError(error: any) {
    console.error('Socket error:', error);
    this.errorMessage = error.message || 'Connection error';
  }

  onSendMessage(message: string) {
    if (!message || !this.currentChannel) return;

    try {
      this.messageService.sendMessage(this.currentChannel.id, message);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to send message';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }

  createNewGroup() {
    const groupName = prompt('Enter name for new group:');
    if (!groupName) return;

    const groupDescription = prompt('Enter description for new group:') || '';

    this.groupService.createGroup(groupName, groupDescription).subscribe({
      next: (group) => {
        this.groups = [...this.groups, group];
        alert(`Group "${groupName}" created successfully`);
      },
      error: (error: any) => {
        alert('Failed to create group: ' + (error.error?.error || error.message));
      }
    });
  }

  createNewChannel() {
    if (!this.currentGroup) {
      alert('Please select a group first');
      return;
    }

    const channelName = prompt('Enter name for new channel:');
    if (!channelName) return;

    this.channelService.createChannel(this.currentGroup.id, channelName).subscribe({
      next: (channel) => {
        this.channels = [...this.channels, channel];
        alert(`Channel "${channelName}" created successfully`);
      },
      error: (error: any) => {
        alert('Failed to create channel: ' + (error.error?.error || error.message));
      }
    });
  }

  showAvailableGroups() {
    alert('This feature will be implemented in Phase 2. Users will be able to request to join groups.');
  }
}