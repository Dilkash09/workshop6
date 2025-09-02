export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  groups: string[];
  createdAt?: Date;
}

export class UserModel implements User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public roles: string[] = ['user'],
    public groups: string[] = [],
    public createdAt?: Date
  ) {}

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  isMemberOfGroup(groupId: string): boolean {
    return this.groups.includes(groupId);
  }

  static fromJSON(json: any): UserModel {
    return new UserModel(
      json.id,
      json.username,
      json.email,
      json.roles,
      json.groups || [],
      json.createdAt ? new Date(json.createdAt) : undefined
    );
  }
}