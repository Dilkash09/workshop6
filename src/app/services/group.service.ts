import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroupModel } from '../models/group.model';
import { AuthService } from './auth.service';
import { UserModel } from '../models/user.model';
import {  HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiBase = 'http://localhost:3000/api';
    private apiUrl = 'http://localhost:3000/api/groups';

  getAllGroups(): Observable<GroupModel[]> {
    return this.http.get<any[]>(`${this.apiBase}/groups`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(groups => groups.map(group => GroupModel.fromJSON(group)))
    );
  }

  createGroup(name: string, description: string = ''): Observable<GroupModel> {
    return this.http.post<any>(`${this.apiBase}/groups`, { name, description }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(group => GroupModel.fromJSON(group))
    );
  }


// Add these methods
  addUserToGroup(groupId: string, userId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${groupId}/members`, 
      { userId },
      {headers: this.authService.getAuthHeaders() }
    );
  }

    removeUserFromGroup(groupId: string, userId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${groupId}/members/${userId}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

   getGroupMembers(groupId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${groupId}/members`,
      { headers: this.authService.getAuthHeaders() }
    );
  }


  deleteGroup(groupId: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/groups/${groupId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}