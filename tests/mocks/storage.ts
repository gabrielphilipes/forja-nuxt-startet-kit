// Mock to useStorage in tests
const storage = new Map<string, unknown>()

export const useStorage = () => {
  return {
    getItem: async (key: string) => {
      return storage.get(key) || null
    },
    setItem: async (key: string, value: unknown) => {
      storage.set(key, value)
    },
    removeItem: async (key: string) => {
      storage.delete(key)
    },
    clear: async () => {
      storage.clear()
    }
  }
}
