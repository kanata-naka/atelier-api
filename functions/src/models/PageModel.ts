import BaseModel from "./BaseModel";

export interface PageModel extends BaseModel {
  no: number;
  image: PageModel.Image;
}

export namespace PageModel {
  export interface Image {
    name: string;
  }
}

export default PageModel;
