export interface Message<Type extends string | number, Data = void> {
  type: Type;
  data: Data;
}

export type MessageData<
  Msg extends Message<any, any>,
  Type extends Msg['type']
> = Extract<Msg, { type: Type }>['data'];
