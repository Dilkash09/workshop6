import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChannelModel } from '../models/channel.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiBase = 'http://localhost:3000/api';

  getChannelsForGroup(groupId: string): Observable<ChannelModel[]> {
    return this.http.get<any[]>(`${this.apiBase}/groups/${groupId}/channels`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(channels => channels.map(channel => ChannelModel.fromJSON(channel)))
    );
  }

  createChannel(groupId: string, name: string): Observable<ChannelModel> {
    return this.http.post<any>(`${this.apiBase}/groups/${groupId}/channels`, { name }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(channel => ChannelModel.fromJSON(channel))
    );
  }

  deleteChannel(channelId: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/channels/${channelId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}