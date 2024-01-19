export default interface TopImageGetResponse {
  id: string;
  image: {
    name: string;
    url: string;
  };
  thumbnailImage: {
    name: string;
    url: string;
  };
  description?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}
