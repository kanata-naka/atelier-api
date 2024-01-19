import BaseModel from "./BaseModel";

export default interface TagInfoModel extends BaseModel {
  info: {
    name: string;
    count: number;
  }[];
}
