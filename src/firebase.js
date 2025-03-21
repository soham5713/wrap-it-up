// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from "firebase/auth"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
let app
let auth
let db
let googleProvider

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
} catch (error) {
  console.error("Error initializing Firebase", error)
}

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error("Error signing in with Google", error)
    throw error
  }
}

export const logOut = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Error signing out", error)
    throw error
  }
}

// User profile functions
export const updateUserProfile = async (profileData) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user is signed in")

    await updateProfile(user, profileData)

    // Also update the user document in Firestore if it exists
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      await updateDoc(userDocRef, {
        displayName: profileData.displayName || user.displayName,
        photoURL: profileData.photoURL || user.photoURL,
        updatedAt: serverTimestamp(),
      })
    } else {
      // Create user document if it doesn't exist
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: profileData.displayName || user.displayName,
        photoURL: profileData.photoURL || user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    return true
  } catch (error) {
    console.error("Error updating user profile", error)
    throw error
  }
}

// User settings functions
export const getUserSettings = async (userId) => {
  try {
    const settingsDocRef = doc(db, "userSettings", userId)
    const settingsDoc = await getDoc(settingsDocRef)

    if (settingsDoc.exists()) {
      return settingsDoc.data()
    } else {
      // Return default settings if none exist
      const defaultSettings = {
        defaultPriority: "medium",
        defaultView: "all",
        enableNotifications: false,
        compactMode: false,
      }

      // Create settings document with defaults
      await setDoc(settingsDocRef, {
        ...defaultSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return defaultSettings
    }
  } catch (error) {
    console.error("Error getting user settings", error)
    throw error
  }
}

export const updateUserSettings = async (userId, settings) => {
  try {
    const settingsDocRef = doc(db, "userSettings", userId)
    const settingsDoc = await getDoc(settingsDocRef)

    if (settingsDoc.exists()) {
      await updateDoc(settingsDocRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      })
    } else {
      await setDoc(settingsDocRef, {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    return true
  } catch (error) {
    console.error("Error updating user settings", error)
    throw error
  }
}

// Firestore functions for tasks
export const addTask = async (userId, taskData) => {
  try {
    const taskToAdd = {
      userId,
      text: taskData.text,
      notes: taskData.notes || "",
      priority: taskData.priority || "medium",
      dueDate: taskData.dueDate || null,
      completed: false,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "tasks"), taskToAdd)

    // Return the task with a local timestamp since serverTimestamp isn't available immediately
    return {
      id: docRef.id,
      ...taskToAdd,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error adding task", error)
    throw error
  }
}

export const getUserTasks = async (userId) => {
  try {
    // First try with the compound query (requires index)
    const q = query(collection(db, "tasks"), where("userId", "==", userId))

    // We'll sort the results in JavaScript if the index doesn't exist
    const querySnapshot = await getDocs(q)
    const tasks = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tasks.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string if it exists
        createdAt: data.createdAt
          ? typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString()
          : new Date().toISOString(),
      })
    })

    // Sort tasks by createdAt in descending order (newest first)
    return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error("Error getting tasks", error)
    throw error
  }
}

export const updateTaskStatus = async (taskId, completed) => {
  try {
    const taskRef = doc(db, "tasks", taskId)
    await updateDoc(taskRef, { completed })
    return true
  } catch (error) {
    console.error("Error updating task status", error)
    throw error
  }
}

export const updateTask = async (taskId, taskData) => {
  try {
    const taskRef = doc(db, "tasks", taskId)
    await updateDoc(taskRef, taskData)
    return true
  } catch (error) {
    console.error("Error updating task", error)
    throw error
  }
}

export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, "tasks", taskId)
    await deleteDoc(taskRef)
    return true
  } catch (error) {
    console.error("Error deleting task", error)
    throw error
  }
}

export const deleteCompletedTasks = async (userId) => {
  try {
    const q = query(collection(db, "tasks"), where("userId", "==", userId), where("completed", "==", true))

    const querySnapshot = await getDocs(q)
    let deleteCount = 0

    const deletePromises = []
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, "tasks", document.id)))
      deleteCount++
    })

    await Promise.all(deletePromises)
    return deleteCount // Return number of deleted tasks
  } catch (error) {
    console.error("Error deleting completed tasks", error)
    throw error
  }
}

export { auth, db }

