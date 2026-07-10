const DB_NAME = 'travel-globe-db'
const DB_VERSION = 1
const STORE_NAME = 'app-state'
const LOCAL_BACKUP_KEY = 'travel-globe-places-backup'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readFromIndexedDB(key) {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(key)

    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => database.close()
  })
}

async function writeToIndexedDB(key, value) {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(value, key)

    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function loadPlaces() {
  try {
    const storedPlaces = await readFromIndexedDB('places')
    if (Array.isArray(storedPlaces)) return storedPlaces
  } catch (error) {
    console.warn('IndexedDB read failed, trying localStorage backup.', error)
  }

  try {
    const backup = localStorage.getItem(LOCAL_BACKUP_KEY)
    return backup ? JSON.parse(backup) : null
  } catch (error) {
    console.warn('localStorage backup could not be read.', error)
    return null
  }
}

export async function savePlaces(places) {
  localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(places))

  try {
    await writeToIndexedDB('places', places)
  } catch (error) {
    console.warn('IndexedDB save failed. localStorage backup is still available.', error)
  }
}

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false

  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}
