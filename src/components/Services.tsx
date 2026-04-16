import { useEffect, useState } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  price: string;
  duration: string;
  desc: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === "fabiiomarques10@gmail.com");
    });

    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'services'));

    return () => {
      unsubscribeAuth();
      unsubscribe();
    };
  }, []);

  const addService = async () => {
    const title = prompt("Título do Serviço:");
    const price = prompt("Preço (ex: R$ 65):");
    const duration = prompt("Duração (ex: 45 min):");
    const desc = prompt("Descrição:");
    if (title && price && duration && desc) {
      try {
        await addDoc(collection(db, 'services'), { title, price, duration, desc });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'services');
      }
    }
  };

  const deleteService = async (id: string) => {
    if (confirm("Excluir este serviço?")) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'services');
      }
    }
  };

  const editService = async (service: Service) => {
    const title = prompt("Título:", service.title);
    const price = prompt("Preço:", service.price);
    const duration = prompt("Duração:", service.duration);
    const desc = prompt("Descrição:", service.desc);
    if (title && price && duration && desc) {
      try {
        await updateDoc(doc(db, 'services', service.id), { title, price, duration, desc });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'services');
      }
    }
  };

  return (
    <div className="px-6 max-w-7xl mx-auto py-8">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <span className="text-primary font-label text-xs tracking-[0.3em] uppercase mb-2 block">Menu</span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-on-surface mb-2">Nossos Serviços</h1>
          <p className="text-on-surface-variant opacity-80">Experiências de grooming curadas para o cavalheiro moderno.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={addService}
            className="bg-primary text-on-primary p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Plus size={24} />
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.length === 0 ? (
          <p className="col-span-full text-center text-on-surface-variant italic">Nenhum serviço cadastrado.</p>
        ) : services.map((service) => (
          <div key={service.id} className="bg-surface-container-low p-6 md:p-8 rounded-lg hover:bg-surface-container-high transition-all group relative">
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => editService(service)} className="p-2 bg-surface-container-highest rounded-full text-primary hover:scale-110 transition-transform">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteService(service.id)} className="p-2 bg-red-500/10 rounded-full text-red-500 hover:scale-110 transition-transform">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-headline font-bold group-hover:text-primary transition-colors pr-12">{service.title}</h3>
              <span className="text-primary font-headline font-bold text-xl">{service.price}</span>
            </div>
            <p className="text-on-surface-variant mb-6 leading-relaxed">{service.desc}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">{service.duration}</span>
              <button className="text-primary font-headline font-bold text-sm tracking-widest hover:underline">AGENDAR AGORA</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
