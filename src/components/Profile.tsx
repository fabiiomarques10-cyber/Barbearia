import { motion } from 'motion/react';
import { CheckCircle, Plus, Pentagon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Profile() {
  const [settings, setSettings] = useState({
    shopName: 'MONARCH ATELIER',
    location: 'Mayfair, Londres',
    logoScale: 115,
    accentColor: '#f2ca50'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === "fabiiomarques10@gmail.com");
    });

    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as any);
      }
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/global'));

    return () => {
      unsubscribeAuth();
      unsubscribe();
    };
  }, []);

  const handleSave = async () => {
    if (!isAdmin) return alert("Apenas administradores podem alterar as configurações.");
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert("Configurações aplicadas com sucesso!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/global');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="px-6 max-w-5xl mx-auto py-8">
      <section className="mb-12">
        <span className="text-primary font-label text-xs tracking-[0.3em] uppercase mb-2 block">Centro de Controle</span>
        <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface">Personalização</h2>
        <p className="text-on-surface-variant mt-4 max-w-xl text-lg">Defina a assinatura visual do seu estabelecimento. Cada detalhe aqui molda a entrada digital do cliente em seu santuário.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Brand Identity */}
        <div className="md:col-span-8 bg-surface-container-low rounded-lg p-6 md:p-8 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h3 className="text-xl font-headline font-bold text-on-surface">Identidade da Marca</h3>
                <p className="text-on-surface-variant text-sm mt-1">Carregue e ajuste sua marca principal</p>
              </div>
              <button className="bg-surface-container-highest px-4 py-2 rounded-full text-xs font-label uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors">
                Alterar Ativo
              </button>
            </div>
            
            <div className="aspect-video bg-[#0e0e0e] rounded-md flex items-center justify-center relative border border-outline-variant/10">
              <div className="w-48 h-48 flex items-center justify-center relative" style={{ transform: `scale(${settings.logoScale / 100})` }}>
                <Pentagon className="text-primary opacity-20 fill-primary" size={160} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h4 className="text-3xl font-headline font-black tracking-[0.4em] text-primary">MONARCH</h4>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] font-label text-outline-variant uppercase">Current: monarch_gold_vector.svg</div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-label text-on-surface-variant uppercase tracking-wider">Escala do Logo</label>
                <span className="text-primary font-bold">{settings.logoScale}%</span>
              </div>
              <input 
                type="range" 
                className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer" 
                min="50" max="200" 
                value={settings.logoScale}
                onChange={(e) => setSettings({ ...settings, logoScale: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Identity Info */}
        <div className="md:col-span-4 bg-surface-container-low rounded-lg p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Identidade</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-[0.2em] mb-2 block">Nome do Estabelecimento</label>
                <input 
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-primary font-headline font-bold" 
                  type="text" 
                  value={settings.shopName}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-[0.2em] mb-2 block">Tag de Localização</label>
                <input 
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-primary" 
                  type="text" 
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs text-primary-container leading-relaxed italic">"O nome exibido no portal do cliente e recibos digitais."</p>
          </div>
        </div>

        {/* Palette */}
        <div className="md:col-span-12 bg-surface-container-low rounded-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-xl font-headline font-bold text-on-surface">Paleta de Assinatura</h3>
              <p className="text-on-surface-variant text-sm mt-1">Selecione o acento metálico que define a atmosfera da sua marca. Isso afeta todos os CTAs e estados ativos.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {['#f2ca50', '#b87333', '#e5e4e2', '#50c878'].map((color) => (
                <button 
                  key={color}
                  onClick={() => setSettings({ ...settings, accentColor: color })}
                  className={`w-16 h-16 rounded-full border-4 transition-transform active:scale-90 ${settings.accentColor === color ? 'border-surface-bright ring-2 ring-primary' : 'border-transparent hover:border-surface-bright'}`}
                  style={{ backgroundColor: color }}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="md:col-span-12 bg-surface-container-high rounded-lg p-1 border border-outline-variant/10">
          <div className="bg-surface rounded-md p-8 flex flex-col md:flex-row items-center justify-center gap-12 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full" style={{ background: `radial-gradient(circle_at_50%_50%, ${settings.accentColor} 0%, transparent 70%)` }}></div>
            </div>
            <div className="relative z-10 text-center md:text-left">
              <p className="text-[10px] font-label text-primary uppercase tracking-[0.4em] mb-4">Prévia da Interface</p>
              <h4 className="text-2xl font-headline font-bold text-on-surface">Experimente o Polimento</h4>
              <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="text-on-primary font-label text-xs font-bold px-8 py-3 rounded-full uppercase tracking-widest shadow-xl shadow-black/40" style={{ backgroundColor: settings.accentColor }}>Botão de Ação</button>
                <button className="border border-outline-variant/40 text-primary font-label text-xs font-bold px-8 py-3 rounded-full uppercase tracking-widest hover:bg-white/5 transition-colors">Secundário</button>
              </div>
            </div>
            <div className="w-64 h-40 bg-[#0e0e0e] rounded-xl border border-outline-variant/10 shadow-2xl relative p-4 flex flex-col gap-3">
              <div className="w-1/2 h-2 rounded-full" style={{ backgroundColor: `${settings.accentColor}33` }}></div>
              <div className="w-3/4 h-2 bg-surface-container-high rounded-full"></div>
              <div className="w-1/4 h-2 rounded-full mt-2" style={{ backgroundColor: settings.accentColor }}></div>
              <div className="mt-auto flex justify-between">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `${settings.accentColor}1a` }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `${settings.accentColor}1a` }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `${settings.accentColor}1a` }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: settings.accentColor }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      {isAdmin && (
        <button 
          onClick={handleSave}
          disabled={saving}
          className="fixed bottom-28 right-8 z-[60] gradient-gold text-on-primary font-bold px-8 py-4 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 group disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
          <span className="font-headline uppercase tracking-widest text-sm">Aplicar Alterações</span>
        </button>
      )}
    </div>
  );
}
