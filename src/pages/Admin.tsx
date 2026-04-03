import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const ADMIN_EMAIL = "brenoalves18110@gmail.com";

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  const load = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    load();
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) load();
  }, [user]);

  if (user?.email !== ADMIN_EMAIL) {
    return <div className="p-10 text-center">ACESSO NEGADO</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Clientes</h1>

      {users.map((u) => (
        <div
          key={u.id}
          className="border p-3 rounded mb-2 flex justify-between"
        >
          <div>
            <p>{u.fullName}</p>
            <p className="text-sm">{u.email}</p>
          </div>

          <button onClick={() => remove(u.id)}>Apagar</button>
        </div>
      ))}
    </div>
  );
}
