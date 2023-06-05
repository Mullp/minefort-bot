export type Player = {
  id: string;
  name: string;
  properties?: [
    {
      name: string;
      value: string;
      signature?: string;
    }
  ];
};
