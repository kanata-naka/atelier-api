export interface PageCreateRequest {
  comicId: string;
  episodeId: string;
  id: string;
  no: number;
  image: PageCreateRequest.Image;
}

export namespace PageCreateRequest {
  export interface Image {
    name: string;
  }
}

export default PageCreateRequest;
