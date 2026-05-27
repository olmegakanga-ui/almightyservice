declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string)
    start(
      cameraIdOrConfig: string | { facingMode: string },
      config: {
        fps?: number
        qrbox?: { width: number; height: number }
        aspectRatio?: number
      },
      onSuccess: (decodedText: string) => void,
      onError?: (error: string) => void
    ): Promise<void>
    stop(): Promise<void>
    clear(): void
  }
}