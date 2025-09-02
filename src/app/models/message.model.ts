export interface Message {
  id: string;
  text: string;
  userId: string;
  channelId: string;
  timestamp: string;
  username?: string;
  userRoles?: string[];
}

export class MessageModel implements Message {
  constructor(
    public id: string,
    public text: string,
    public userId: string,
    public channelId: string,
    public timestamp: string,
    public username?: string,
    public userRoles?: string[]
  ) {}

  static fromJSON(json: any): MessageModel {
    return new MessageModel(
      json.id,
      json.text,
      json.userId,
      json.channelId,
      json.timestamp,
      json.username,
      json.userRoles
    );
  }
}