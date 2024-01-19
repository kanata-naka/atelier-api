export default interface TopImageCreateRequest {
  image: {
    name: string;
  };
  thumbnailImage: {
    name: string;
  };
  description?: string;
  order: number;
}
