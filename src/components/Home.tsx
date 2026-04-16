import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Share2, Globe, Mail, MapPin, Phone, Plus, Trash2, Edit2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface Master {
  id: string;
  name: string;
  role: string;
  img: string;
}

interface PortfolioItem {
  id: string;
  image: string;
  category: string;
}

export default function Home() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Listen for auth changes to check admin status
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === "fabiiomarques10@gmail.com");
    });

    // Listen for Masters
    const qMasters = query(collection(db, 'masters'));
    const unsubscribeMasters = onSnapshot(qMasters, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Master));
      setMasters(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'masters'));

    // Listen for Portfolio
    const qPortfolio = query(collection(db, 'portfolio'));
    const unsubscribePortfolio = onSnapshot(qPortfolio, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
      setPortfolio(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'portfolio'));

    return () => {
      unsubscribeAuth();
      unsubscribeMasters();
      unsubscribePortfolio();
    };
  }, []);

  const addMaster = async () => {
    const name = prompt("Nome do Barbeiro:");
    const role = prompt("Cargo (ex: Senior Stylist):");
    const img = prompt("URL da Imagem:");
    if (name && role && img) {
      try {
        await addDoc(collection(db, 'masters'), { name, role, img });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'masters');
      }
    }
  };

  const deleteMaster = async (id: string) => {
    if (confirm("Excluir este mestre?")) {
      try {
        await deleteDoc(doc(db, 'masters', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'masters');
      }
    }
  };

  const addPortfolioItem = async () => {
    const image = prompt("URL da Imagem do Portfólio:");
    const category = prompt("Categoria:");
    if (image) {
      try {
        await addDoc(collection(db, 'portfolio'), { image, category: category || "Geral" });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'portfolio');
      }
    }
  };

  const deletePortfolioItem = async (id: string) => {
    if (confirm("Excluir esta imagem do portfólio?")) {
      try {
        await deleteDoc(doc(db, 'portfolio', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'portfolio');
      }
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsjHKofvJhkFfDpXosXZg82460CA-F_cq5CrZ_y6G4kyQrBnKWw_0ppEHGrqVm-4IVRvbP5jWXPXJOZz9CRqVWjQCWp6XebOgp7PQeMEbW-HtZC5CnuvithJHsu29Cgl-CIzfANKmNNRfODRoO9IGT4pFaJQ0qznW0GmbvJPCNAoVPCkIBJAHFkQQeBbEMC2YBZYQ3r6XQwaDx0L-auOFHEcZ7x_0tv0pqRi00lolSYzxxISVp-ndMAcNuqze30g7jTKEOWkANtlXp" 
            alt="Barbershop Interior"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 h-full flex flex-col justify-end items-center px-8 pb-24 text-center max-w-5xl mx-auto"
        >
          <h2 className="font-headline text-primary text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-4">Obsidian Atelier</h2>
          <h1 className="font-headline text-4xl md:text-7xl font-extrabold tracking-[-0.02em] text-on-surface mb-6">Elevando a Masculinidade</h1>
          <p className="font-body text-on-surface-variant text-base md:text-xl max-w-2xl mb-10 leading-relaxed">Experimente um novo padrão de cuidados onde o artesanato tradicional encontra a precisão contemporânea.</p>
          <button className="gradient-gold text-on-primary px-8 md:px-12 py-4 md:py-5 rounded-full font-headline font-bold text-base md:text-lg tracking-wide shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all duration-300">
            AGENDAR AGORA
          </button>
        </motion.div>
      </section>

      {/* Our Masters Section */}
      <section className="py-24 px-6 md:px-12 bg-surface-container-low">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-primary font-headline font-bold uppercase tracking-widest text-xs mb-2 block">A Arte</span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Nossos Mestres</h2>
          </div>
          <div className="flex gap-4">
            {isAdmin && (
              <button 
                onClick={addMaster}
                className="w-12 h-12 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all"
              >
                <Plus size={20} />
              </button>
            )}
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex gap-8 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 md:mx-0 md:px-0">
          {masters.length === 0 ? (
            <p className="text-on-surface-variant italic">Nenhum mestre cadastrado.</p>
          ) : masters.map((master) => (
            <motion.div 
              key={master.id}
              whileHover={{ y: -10 }}
              className="min-w-[320px] group flex-shrink-0"
            >
              <div className="relative h-[480px] w-full rounded-lg overflow-hidden mb-6">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  src={master.img} 
                  alt={master.name}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-headline font-bold text-sm tracking-widest active:scale-95 transition-transform">AGENDAR</button>
                  {isAdmin && (
                    <button 
                      onClick={() => deleteMaster(master.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-headline font-bold">{master.name}</h3>
              <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest mt-1">{master.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visual Portfolio */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <span className="text-primary font-headline font-bold uppercase tracking-[0.4em] text-xs mb-4 block">A Galeria</span>
          <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Portfólio Visual</h2>
          {isAdmin && (
            <button 
              onClick={addPortfolioItem}
              className="absolute right-0 top-0 bg-primary text-on-primary p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          {portfolio.length === 0 ? (
            <p className="col-span-full text-center text-on-surface-variant italic">Galeria vazia.</p>
          ) : portfolio.map((item, idx) => (
            <div 
              key={item.id} 
              className={`rounded-lg overflow-hidden group relative ${idx === 0 ? 'md:col-span-1 md:row-span-2' : idx === 3 ? 'md:col-span-2' : ''}`}
            >
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                src={item.image} 
                alt={`Portfolio ${idx}`}
                referrerPolicy="no-referrer"
              />
              {isAdmin && (
                <button 
                  onClick={() => deletePortfolioItem(item.id)}
                  className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Our Heritage Section */}
      <section className="py-24 px-6 md:px-12 bg-surface-container-low overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="relative z-10 rounded-lg overflow-hidden border border-outline-variant/20 shadow-2xl">
              <img 
                className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFcQfqsgQTCPr_2khjDt2MCxkwz-qvb3khlbHqUscH3FyZvsZa1FoeonEmg25SH8GasWoxnNCn4JNorUrbB47fandZmHToRA8OIog_HKq5dXt3MOc-T1pRMvQyRmnwRh8tm8XL5EQ7vVhfIpphWtm0Ukofb985Z8WV26G4xUnZjy13MGwW-jCEcOjLhrN7evHIm7ptqG9YtYjjl16pSvKxC-wr3eSE55f-22k1-c4URjBVSa3TzM8Z4sNb5n4MhnqydiKGJxy6TWpf" 
                alt="Heritage"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <span className="text-primary font-headline font-bold uppercase tracking-[0.4em] text-xs">Desde 1924</span>
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter">Nossa Herança</h2>
            <p className="font-body text-on-surface-variant text-lg leading-[1.8] tracking-wide">
              O Obsidian Atelier foi fundado na crença de que um corte de cabelo é mais do que um simples serviço — é um rito de passagem. Enraizados nas tradições atemporais do grooming artesanal, combinamos técnicas centenárias com a visão ousada do estilo moderno.
            </p>
            <p className="font-body text-on-surface-variant text-lg leading-[1.8] tracking-wide">
              Em nosso santuário de aço e sombra, honramos o legado do mestre barbeiro, proporcionando um ambiente de relaxamento refinado e qualidade intransigente para o homem moderno.
            </p>
            <div className="pt-4">
              <a className="inline-flex items-center gap-2 text-primary font-headline font-bold tracking-widest text-sm hover:gap-4 transition-all" href="#">
                EXPLORE NOSSAS ORIGENS <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-40 px-6 md:px-12 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-headline tracking-[0.2em] font-black text-primary text-3xl uppercase mb-8">MONARCH</h2>
            <p className="font-body text-on-surface-variant max-w-sm mb-8">
              O destino final para o cavalheiro exigente. Experimente o ápice do grooming profissional e do estilo de vida de luxo.
            </p>
            <div className="flex gap-6">
              <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors" href="#">
                <Share2 size={20} />
              </a>
              <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors" href="#">
                <Globe size={20} />
              </a>
              <a className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors" href="#">
                <Mail size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-widest text-sm mb-8">Localização</h3>
            <ul className="space-y-4 text-on-surface-variant font-body">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary mt-1" size={16} />
                <span>72nd Madison Avenue,<br/>New York, NY 10021</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-primary mt-1" size={16} />
                <span>+1 (212) 555-0198</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface uppercase tracking-widest text-sm mb-8">Horários</h3>
            <ul className="space-y-4 text-on-surface-variant font-body">
              <li className="flex justify-between">
                <span>Seg - Sex</span>
                <span className="text-on-surface">9:00 - 21:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sábado</span>
                <span className="text-on-surface">10:00 - 20:00</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo</span>
                <span className="text-on-surface">Fechado</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-outline-variant/10 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-label uppercase tracking-widest text-on-surface-variant/50">
          <span>© 2024 Obsidian Atelier. Todos os direitos reservados.</span>
          <div className="flex gap-8">
            <a className="hover:text-primary transition-colors" href="#">Política de Privacidade</a>
            <a className="hover:text-primary transition-colors" href="#">Termos de Serviço</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
