import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiBase = 'http://localhost:3000/api';
  private apiUrl = 'http://localhost:3000/api/users';

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<any[]>(`${this.apiBase}/users`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(users => users.map(user => UserModel.fromJSON(user)))
    );
  }

  promoteUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiBase}/users/${userId}/promote`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Add this method
  getUserGroups(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/groups`);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/users/${userId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}