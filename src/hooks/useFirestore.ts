import { useState, useEffect, useCallback } from "react";
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  QueryConstraint, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export function useCollection<T extends { id: string }>(
  collectionName: string,
  extraConstraints: QueryConstraint[] = []
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setData([]); setLoading(false); return; }
    const q = query(
      collection(db, collectionName),
      where("userId", "==", user.uid),
      ...extraConstraints
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
      setData(items);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user, collectionName]);

  const add = useCallback(async (item: Omit<T, "id">) => {
    if (!user) return;
    await addDoc(collection(db, collectionName), { ...item, userId: user.uid });
  }, [user, collectionName]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    await updateDoc(doc(db, collectionName, id), updates as any);
  }, [collectionName]);

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(db, collectionName, id));
  }, [collectionName]);

  return { data, loading, add, update, remove };
}
