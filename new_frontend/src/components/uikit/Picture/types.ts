type Sources = {
  srcSet: string;
  media: string;
  type: string;
};

export type PictureProps = {
  src: string;
  alt: string;
  sources?: Sources[];
  className?: string;
};
