import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle, X, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface Appointment {
  id: string;
  time: string;
  date: string;
  name: string;
  service: string;
  status: 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado';
  uid: string;
}

export default function Schedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2023-10-04'); // Mock date for demo

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === "fabiiomarques10@gmail.com");
    });

    const q = query(collection(db, 'appointments'), orderBy('time', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'appointments'));

    return () => {
      unsubscribeAuth();
      unsubscribe();
    };
  }, []);

  const addAppointment = async () => {
    if (!user) return alert("Faça login para agendar.");
    const time = prompt("Horário (HH:mm):", "09:00");
    const name = prompt("Seu Nome:", user.displayName || "");
    const service = prompt("Serviço:");
    if (time && name && service) {
      try {
        await addDoc(collection(db, 'appointments'), {
          time,
          date: selectedDate,
          name,
          service,
          status: 'Pendente',
          uid: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'appointments');
      }
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'appointments');
    }
  };

  const deleteAppointment = async (id: string) => {
    if (confirm("Excluir este agendamento?")) {
      try {
        await deleteDoc(doc(db, 'appointments', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'appointments');
      }
    }
  };

  const filteredAppointments = isAdmin 
    ? appointments 
    : appointments.filter(a => a.uid === user?.uid);

  const revenue = appointments
    .filter(a => a.status === 'Concluído')
    .length * 70; // Mock average price

  return (
    <div className="px-6 max-w-7xl mx-auto py-8">
      <header className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-on-surface mb-2">Agenda Mestra</h1>
        <p className="text-on-surface-variant opacity-80">Gerencie o ritmo da sua barbearia e o fluxo de clientes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Section */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container-low p-8 rounded-lg">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline text-xl font-bold uppercase tracking-widest text-primary">Outubro 2023</h2>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-highest text-on-surface hover:text-primary transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-highest text-on-surface hover:text-primary transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 text-center text-[10px] md:text-xs font-bold text-on-surface-variant/50 uppercase mb-4 tracking-widest">
              <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
            </div>
            
            <div className="grid grid-cols-7 gap-y-1 md:gap-y-2">
              {[25, 26, 27, 28, 29, 30].map(d => (
                <span key={d} className="p-2 md:p-3 text-on-surface/20 text-center text-sm md:text-base">{d}</span>
              ))}
              {[1, 2, 3].map(d => (
                <button key={d} className="p-2 md:p-3 rounded-full hover:bg-surface-container-high transition-colors text-center text-sm md:text-base">{d}</button>
              ))}
              <button className="p-2 md:p-3 rounded-full bg-primary text-on-primary font-bold shadow-[0_0_20px_rgba(242,202,80,0.3)] text-center text-sm md:text-base">4</button>
              {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(d => (
                <button key={d} className="p-2 md:p-3 rounded-full hover:bg-surface-container-high transition-colors text-center text-sm md:text-base">{d}</button>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 p-6 md:p-8 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-primary/70 font-bold mb-1">Carga de Hoje</p>
              <h3 className="text-2xl md:text-3xl font-headline font-extrabold text-primary">{filteredAppointments.length} Agendamentos</h3>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant mb-1">Est. Receita</p>
              <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface">R$ {revenue},00</h3>
            </div>
          </div>
        </section>

        {/* Appointments List */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-2xl font-bold">Hoje, 4 de Out</h2>
            <div className="flex gap-2">
              <span className="px-4 py-1 rounded-full bg-surface-container-highest text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-surface-bright transition-colors">Todos</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredAppointments.length === 0 ? (
              <p className="text-on-surface-variant italic text-center py-12">Nenhum agendamento encontrado.</p>
            ) : filteredAppointments.map((apt) => (
              <AppointmentCard 
                key={apt.id}
                appointment={apt}
                isAdmin={isAdmin}
                onUpdateStatus={updateStatus}
                onDelete={() => deleteAppointment(apt.id)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={addAppointment}
        className="fixed bottom-24 md:bottom-12 right-6 w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center text-on-primary shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-90 transition-all z-40 group"
      >
        <Plus size={32} />
      </button>
    </div>
  );
}

function AppointmentCard({ appointment, isAdmin, onUpdateStatus, onDelete }: any) {
  const { time, name, service, status, id } = appointment;
  const completed = status === 'Concluído';
  const cancelled = status === 'Cancelado';

  const statusColors: any = {
    'Pendente': 'bg-yellow-500/10 text-yellow-500',
    'Confirmado': 'bg-blue-500/10 text-blue-500',
    'Concluído': 'bg-green-500/10 text-green-500',
    'Cancelado': 'bg-red-500/10 text-red-500',
  };

  return (
    <motion.article 
      whileHover={{ x: 5 }}
      className={`bg-surface-container-low p-6 rounded-lg transition-all group ${completed || cancelled ? 'opacity-60' : ''} ${cancelled ? 'border-l-4 border-red-500/50' : ''}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="text-center min-w-[64px]">
            <p className={`font-headline font-black text-xl ${completed || cancelled ? 'line-through text-on-surface-variant' : 'text-primary'}`}>{time}</p>
            <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold">HORA</p>
          </div>
          <div className="w-[2px] h-12 bg-outline-variant/30 hidden md:block"></div>
          <div>
            <h3 className={`font-headline text-2xl font-bold mb-1 ${cancelled ? 'line-through' : ''} group-hover:text-primary transition-colors`}>{name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-on-surface-variant font-medium">{service}</span>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[status]}`}>{status}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
          {!completed && !cancelled && (
            <>
              <button 
                onClick={() => onUpdateStatus(id, status === 'Pendente' ? 'Confirmado' : 'Concluído')}
                className="px-4 py-2 rounded-full text-xs font-bold bg-primary text-on-primary hover:scale-105 active:scale-95 transition-all"
              >
                {status === 'Pendente' ? 'Confirmar' : 'Concluir'}
              </button>
              <button 
                onClick={() => onUpdateStatus(id, 'Cancelado')}
                className="p-2 rounded-full text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <X size={16} />
              </button>
            </>
          )}
          {isAdmin && (
            <button 
              onClick={onDelete}
              className="p-2 rounded-full text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
