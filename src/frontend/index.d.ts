import { ArtnetSenderApi } from './preload'

declare global {
  interface Window {
    ArtnetSenderApi: typeof ArtnetSenderApi
  }
}

export {}