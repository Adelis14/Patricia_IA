import React, { useState } from 'react';

const Dashboard = ({ consultas, user, onLogout }) => {
  const [seccion, setSeccion] = useState('inicio');
  const [pass, setPass] = useState('');
  const [color, setColor] = useState(user.colorTema || 'cyan');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user.avatarUrl);
  const [xmlCode, setXmlCode] = useState('');
  const [isXmlLoading, setIsXmlLoading] = useState(false);
  const [chatLogs, setChatLogs] = useState([]);

  React.useEffect(() => {
    if (seccion === 'editor') {
      setIsXmlLoading(true);
      fetch('http://localhost:3001/api/assistant-xml')
        .then(res => res.json())
        .then(data => {
          if (data.success) setXmlCode(data.content);
          setIsXmlLoading(false);
        })
        .catch(() => setIsXmlLoading(false));
    }
    if (seccion === 'historial') {
      fetch('http://localhost:3001/api/chatlogs')
        .then(res => res.json())
        .then(data => {
          if (data.success) setChatLogs(data.logs);
        });
    }
  }, [seccion]);

  const handleSaveXml = async () => {
    const resp = await fetch('http://localhost:3001/api/assistant-xml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: xmlCode })
    });
    const data = await resp.json();
    if (data.success) alert('¡Código XML actualizado correctamente!');
    else alert('Error al guardar el XML');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', user.username);
    if (pass) formData.append('newPassword', pass);
    formData.append('colorTema', color);
    if (file) formData.append('avatar', file);

    const resp = await fetch('http://localhost:3001/api/update-profile', {
      method: 'POST',
      body: formData
    });
    
    const data = await resp.json();
    if (data.success) {
      alert("¡Perfil actualizado con éxito!");
      if (data.avatarUrl) setPreview(data.avatarUrl);
    }
  };


  const themeColor = { 
    cyan: 'text-cyan-400', 
    green: 'text-green-400', 
    purple: 'text-purple-400',
    red: 'text-red-500' 
  }[color] || 'text-cyan-400';

  const themeBorder = { 
    cyan: 'border-cyan-500', 
    green: 'border-green-500', 
    purple: 'border-purple-500',
    red: 'border-red-500' 
  }[color] || 'border-cyan-500';

  const themeBg = {
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  }[color] || 'bg-cyan-500';

  const themeGlow = {
    cyan: 'shadow-cyan-500/20',
    green: 'shadow-green-500/20',
    purple: 'shadow-purple-500/20',
    red: 'shadow-red-500/20'
  }[color] || 'shadow-cyan-500/20';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden">
      
     
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-orange-600/5 blur-[120px]"></div>
        <div className={`absolute bottom-[-10%] right-[-5%] h-[700px] w-[700px] rounded-full blur-[140px] opacity-20 ${themeBg}`}></div>
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '50px 50px' }}>
        </div>
      </div>

      <div className="relative z-10">
        <nav className="bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/50 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`h-10 w-10 rounded-full border-2 ${themeBorder} overflow-hidden bg-slate-800 shadow-lg ${themeGlow}`}>
                <img src={preview || 'https://via.placeholder.com/150'} alt="User" className="h-full w-full object-cover" />
              </div>
              <span className={`font-black text-2xl tracking-tighter italic ${themeColor}`}>PATRICIA AI</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <button onClick={() => setSeccion('inicio')} className={`text-sm font-bold transition-all ${seccion === 'inicio' ? themeColor : 'text-slate-400 hover:text-white'}`}>Inicio</button>
              <button onClick={() => setSeccion('historial')} className={`text-sm font-bold transition-all ${seccion === 'historial' ? themeColor : 'text-slate-400 hover:text-white'}`}>Preguntas Frecuentes</button>
              <button onClick={() => setSeccion('editor')} className={`text-sm font-bold transition-all ${seccion === 'editor' ? themeColor : 'text-slate-400 hover:text-white'}`}>Editor XML</button>
              <button onClick={() => setSeccion('perfil')} className={`text-sm font-bold transition-all ${seccion === 'perfil' ? themeColor : 'text-slate-400 hover:text-white'}`}>Personalizar</button>
              <button onClick={onLogout} className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all">SALIR</button>
            </div>
          </div>
        </nav>

        <main className="p-8 md:p-16 max-w-7xl mx-auto">
          {seccion === 'inicio' ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <header>
                <h1 className="text-6xl font-black tracking-tighter text-white">Dashboard <span className={themeColor}>Patricia</span></h1>
                <p className="text-slate-400 mt-4 text-xl">Bienvenido, <span className="text-white font-semibold capitalize">{user.username}</span>.</p>
              </header>

              <div className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-md rounded-[3rem] border border-slate-800/50 shadow-2xl p-12 transition-all duration-500`}>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                  <div className="space-y-6">
                    <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${themeBorder} ${themeColor}`}>Métrica Institucional</div>
                    <h2 className="text-4xl font-bold text-white leading-tight">Interacciones totales del Asistente</h2>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed">Sincronizado con MongoDB.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-9xl font-black tracking-tighter leading-none transition-colors duration-500 ${themeColor}`}>{consultas.toLocaleString()}</span>
                    <div className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs mt-4">Consultas acumuladas</div>
                  </div>
                </div>
              </div>
            </div>
          ) : seccion === 'historial' ? (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/50 p-8 md:p-12 shadow-2xl">
                <header className="mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-white">Preguntas <span className={themeColor}>Frecuentes</span></h2>
                    <p className="text-slate-400 text-sm mt-1">Supervisa en tiempo real qué están preguntando los estudiantes.</p>
                  </div>
                  <div className={`text-sm font-bold ${themeColor} bg-slate-950/50 px-4 py-2 rounded-xl`}>
                    {chatLogs.length} registros cargados
                  </div>
                </header>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                  {chatLogs.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                      <p className="text-slate-500 font-bold">No hay preguntas que se hayan repetido más de 1 vez aún.</p>
                    </div>
                  ) : (
                    chatLogs.map((log, idx) => (
                      <div key={idx} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col hover:bg-slate-800/60 transition-colors">
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="flex items-center flex-wrap gap-3">
                              <span className="text-white font-bold bg-slate-900 px-4 py-2 rounded-xl text-sm inline-block shadow-sm">
                                👤 {log.questions && log.questions.length > 0 ? log.questions[0] : 'Sin pregunta'}
                              </span>
                              <span className="text-[10px] font-black px-2 py-1 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 uppercase tracking-widest">
                                {log.count} repeticiones
                              </span>
                            </div>
                            {log.questions && log.questions.length > 1 && (
                              <p className="text-xs text-slate-500 ml-2">
                                Otras formas en que preguntaron esto: <span className="italic text-slate-400">"{log.questions.slice(1).join('", "')}"</span>
                              </p>
                            )}
                          </div>
                          <span className="text-slate-500 text-xs font-mono font-bold bg-slate-950 px-3 py-1 rounded-lg shrink-0">
                            {new Date(log.date).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : seccion === 'editor' ? (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/50 p-8 md:p-12 shadow-2xl">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-white">Editor <span className={themeColor}>XML</span></h2>
                    <p className="text-slate-400 text-sm mt-1">Modifica la configuración del asistente en tiempo real.</p>
                  </div>
                  <button onClick={handleSaveXml} className={`${themeBg} text-slate-950 font-black px-8 py-3 rounded-2xl hover:brightness-110 transition-all shadow-xl active:scale-95`}>
                    GUARDAR XML
                  </button>
                </header>
                
                <div className={`relative rounded-3xl overflow-hidden border ${themeBorder} ${themeGlow}`}>
                  {isXmlLoading && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <span className={`text-lg font-bold ${themeColor} animate-pulse`}>Cargando XML...</span>
                    </div>
                  )}
                  <textarea 
                    value={xmlCode}
                    onChange={(e) => setXmlCode(e.target.value)}
                    spellCheck="false"
                    className="w-full h-[500px] bg-[#0f172a] text-slate-300 font-mono text-sm p-6 outline-none resize-none focus:ring-inset focus:ring-2 focus:ring-slate-700 transition-all leading-relaxed"
                    placeholder="<!-- El código XML aparecerá aquí -->"
                  ></textarea>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/50 p-12 shadow-2xl">
                <h2 className="text-3xl font-black mb-10 text-white">Configuración <span className={themeColor}>Personal</span></h2>
                <form onSubmit={handleSave} className="space-y-8">
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Esquema de Color Institucional</label>
                    <div className="relative">
                      <select 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)} 
                        className={`w-full bg-[#0f172a] p-4 rounded-2xl border ${themeBorder} text-white text-sm font-bold outline-none focus:ring-2 focus:ring-opacity-50 appearance-none cursor-pointer transition-colors duration-300`}
                      >
                        <option value="cyan" className="bg-slate-900 text-white">Azul Patricia (IUJO)</option>
                        <option value="green" className="bg-slate-900 text-white">Verde Operativo</option>
                        <option value="purple" className="bg-slate-900 text-white">Púrpura Sistemas</option>
                        <option value="red" className="bg-slate-900 text-white">Rojo Institucional (Fe y Alegría)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg className={`h-4 w-4 transition-colors duration-300 ${themeColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Imagen de Perfil Local</label>
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-slate-800 file:text-white border border-slate-800 rounded-2xl p-3 bg-slate-900/50" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Actualizar Contraseña</label>
                    <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full bg-slate-800/50 p-4 rounded-2xl border border-slate-800 text-sm outline-none" placeholder="Nueva clave de acceso" />
                  </div>

                  <button type="submit" className={`w-full ${themeBg} text-slate-950 font-black py-5 rounded-[1.5rem] hover:brightness-110 transition-all active:scale-[0.97] shadow-xl`}>GUARDAR CAMBIOS</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;