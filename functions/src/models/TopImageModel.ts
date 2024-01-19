import BaseModel from "./BaseModel";

export default interface TopImageModel extends BaseModel {
  image: {
    name: string;
  };
  thumbnailImage: {
    name: string;
  };
  description?: string;
  order: number;
}
