export interface Block1 {
  __component: 'text.block1';
  id: number;
  text_1: string;
  text_2: string;
  words: { id: number; word: string }[];
}

export interface Block2 {
  __component: 'text.block2';
  id: number;
  title: string;
  text: string;
  background: {
    id: number;
    documentId: string;
    url: string;
    mime: string;
  };
}

export interface Block3 {
  __component: 'text.block3';
  id: number;
  quote: string;
  name: string;
  title: string;
}
