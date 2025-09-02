export interface Channel {
  id: string;
  name: string;
  groupId: string;
  createdBy: string;
  createdAt?: Date;
}

export class ChannelModel implements Channel {
  constructor(
    public id: string,
    public name: string,
    public groupId: string,
    public createdBy: string,
    public createdAt?: Date
  ) {}

  static fromJSON(json: any): ChannelModel {
    return new ChannelModel(
      json.id,
      json.name,
      json.groupId,
      json.createdBy,
      json.createdAt ? new Date(json.createdAt) : undefined
    );
  }
}