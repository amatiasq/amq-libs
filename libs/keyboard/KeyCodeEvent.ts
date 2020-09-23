import { KeyCode } from './KeyCode';

export type KeyCodeEvent = KeyboardEvent & { code: KeyCode };
