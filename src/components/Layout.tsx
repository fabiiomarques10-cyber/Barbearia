import { ReactNode, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Home, Scissors, Calendar, User, LogIn, LogOut } from 'lucide-react';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <Menu className="text-primary cursor-pointer hover:opacity-80 transition-opacity" size={24} />
        </div>
        <div className="font-headline tracking-[0.2em] font-black text-primary text-xl md:text-2xl uppercase">
          MONARCH
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-surface-container-high animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-on-surface truncate max-w-[100px]">{user.displayName}</p>
                <button onClick={logout} className="text-[10px] text-primary uppercase tracking-widest hover:underline">Sair</button>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-primary/20 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={logout}>
                <img 
                  className="w-full h-full object-cover" 
                  src={user.photoURL || "https://picsum.photos/seed/user/100/100"} 
                  alt={user.displayName || "User"}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-all"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow pb-32 pt-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-6 pb-8 pt-4 bg-[#131313]/70 backdrop-blur-2xl z-50 rounded-t-[2rem] shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-primary bg-primary/10 rounded-full px-4 py-1' : 'text-on-surface/60 hover:text-primary'}`}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Início</span>
        </NavLink>
        
        <NavLink 
          to="/services" 
          className={({ isActive }) => `flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-primary bg-primary/10 rounded-full px-4 py-1' : 'text-on-surface/60 hover:text-primary'}`}
        >
          <Scissors size={20} />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Serviços</span>
        </NavLink>

        <NavLink 
          to="/schedule" 
          className={({ isActive }) => `flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-primary bg-primary/10 rounded-full px-4 py-1' : 'text-on-surface/60 hover:text-primary'}`}
        >
          <Calendar size={20} />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Agenda</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-primary bg-primary/10 rounded-full px-4 py-1' : 'text-on-surface/60 hover:text-primary'}`}
        >
          <User size={20} />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Perfil</span>
        </NavLink>
      </nav>
    </div>
  );
}
