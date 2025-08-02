// Image cache utility to prevent flickering during category changes
class ImageCache {
  private cache = new Map<string, HTMLImageElement>()
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>()

  preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!)
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.cache.set(src, img)
        this.loadingPromises.delete(src)
        resolve(img)
      }
      img.onerror = () => {
        this.loadingPromises.delete(src)
        reject(new Error(`Failed to load image: ${src}`))
      }
      img.src = src
    })

    this.loadingPromises.set(src, promise)
    return promise
  }

  isImageCached(src: string): boolean {
    return this.cache.has(src)
  }

  getCachedImage(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null
  }
}

export const imageCache = new ImageCache()