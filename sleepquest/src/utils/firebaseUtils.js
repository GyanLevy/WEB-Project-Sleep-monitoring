import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
export { db };


export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

export const createDocument = async (collectionName, data) => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    
    console.log(`Document created in ${collectionName} with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

export const setDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Document set in ${collectionName} with ID: ${docId}`);
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Document updated in ${collectionName} with ID: ${docId}`);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};


export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    
    console.log(`Document deleted from ${collectionName} with ID: ${docId}`);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};



export const getAllDocuments = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting all documents from ${collectionName}:`, error);
    throw error;
  }
};


export const queryDocuments = async (collectionName, field, operator, value) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};


export const queryDocumentsAdvanced = async (collectionName, conditions = [], options = {}) => {
  try {
    const collectionRef = collection(db, collectionName);
    
    // Build query constraints
    const constraints = conditions.map(({ field, operator, value }) => 
      where(field, operator, value)
    );
    
    // Add orderBy if specified
    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
    }
    
    // Add limit if specified
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

export const getSubcollectionDocument = async (parentCollection, parentDocId, subCollection, docId) => {
  try {
    const docRef = doc(db, parentCollection, parentDocId, subCollection, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error(`Error getting subcollection document:`, error);
    throw error;
  }
};


export const getSubcollectionDocuments = async (parentCollection, parentDocId, subCollection) => {
  try {
    const collectionRef = collection(db, parentCollection, parentDocId, subCollection);
    const snapshot = await getDocs(collectionRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting subcollection documents:`, error);
    throw error;
  }
};


export const createSubcollectionDocument = async (parentCollection, parentDocId, subCollection, data) => {
  try {
    const collectionRef = collection(db, parentCollection, parentDocId, subCollection);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    
    console.log(`Document created in subcollection with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error creating subcollection document:`, error);
    throw error;
  }
};


export const getDocumentsByIds = async (collectionName, docIds) => {
  try {
    const docs = await Promise.all(
      docIds.map(id => getDocument(collectionName, id))
    );
    
    // Filter out null values (non-existent documents)
    return docs.filter(doc => doc !== null);
  } catch (error) {
    console.error(`Error getting documents by IDs from ${collectionName}:`, error);
    throw error;
  }
};

export const documentExists = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error(`Error checking document existence:`, error);
    throw error;
  }
};


export const countDocuments = async (collectionName, field = null, operator = null, value = null) => {
  try {
    let q;
    const collectionRef = collection(db, collectionName);
    
    if (field && operator && value !== null) {
      q = query(collectionRef, where(field, operator, value));
    } else {
      q = collectionRef;
    }
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error(`Error counting documents in ${collectionName}:`, error);
    throw error;
  }
};

export const getServerTimestamp = () => serverTimestamp();