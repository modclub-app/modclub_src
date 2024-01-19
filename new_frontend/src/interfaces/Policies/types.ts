export type ListItem = {
  title: string;
  alias: string;
  paragraph: Paragraph[];
};

export type Paragraph = {
  title?: string | null;
  label?: string | null;
  text: string;
  list?: string[] | null;
};

export type Data = {
  title: string;
  subTitle: string;
  paragraph?: Paragraph[] | null;
  list: ListItem[];
};
