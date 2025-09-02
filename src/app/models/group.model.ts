export interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt?: Date;
}

export class GroupModel implements Group {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public createdBy: string,
    public members: string[] = [],
    public createdAt?: Date
  ) {}

  static fromJSON(json: any): GroupModel {
    return new GroupModel(
      json.id,
      json.name,
      json.description,
      json.createdBy,
      json.members || [],
      json.createdAt ? new Date(json.createdAt) : undefined
    );
  }
}