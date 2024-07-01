export {}
declare global {
  interface Console {
    success: (message: any, ...optionalParams: any[]) => void
  }
}
