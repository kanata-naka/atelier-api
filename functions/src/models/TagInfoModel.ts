import BaseModel from "./BaseModel";

export interface TagInfoModel extends BaseModel {
  info: TagInfoModel.TagInfo[];
}

export namespace TagInfoModel {
  export interface TagInfo {
    name: string;
    count: number;
  }
}

export default TagInfoModel;
