declare module 'turndown-plugin-gfm' {
  import TurndownService from 'turndown'
  export function gfm(service: TurndownService): void
  export function tables(service: TurndownService): void
  export function strikethrough(service: TurndownService): void
  export function taskListItems(service: TurndownService): void
}

declare module 'mammoth' {
  export interface Message {
    type: string
    message: string
    paragraph?: unknown
  }

  export interface ConversionResult {
    value: string
    messages: Message[]
  }

  export interface ConvertOptions {
    buffer?: Buffer
    path?: string
  }

  export function convertToHtml(input: ConvertOptions): Promise<ConversionResult>
  export function extractRawText(input: ConvertOptions): Promise<ConversionResult>
}
