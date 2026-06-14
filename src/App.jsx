import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FolderArchive, Users, Bot, LogOut, Plus, Calendar, 
  Phone, Mail, FileText, Activity, User, MessageSquare, Send, 
  ShieldAlert, FileDigit, Trash2, Edit, RefreshCw, X, Search, Zap, MapPin, CreditCard
} from "lucide-react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("archive");
  const [workers, setWorkers] = useState([]);
  const [recordsLoaded, setRecordsLoaded] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(""); 

  // --- Estados del Formulario de Digitalización ---
  const [editingWorkerId, setEditingWorkerId] = useState(null); 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cedula, setCedula] = useState(""); // <-- NUEVO
  const [address, setAddress] = useState(""); // <-- NUEVO
  const [entryDate, setEntryDate] = useState("");
  const [phone, setPhone] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [workStatus, setWorkStatus] = useState("ACTIVO");
  const [archiveNotes, setArchiveNotes] = useState("");

  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    try {
      const response = await axios.post("http://localhost:8000/auth/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      await fetchUserProfile(token);
    } catch (err) {
      setError("Credenciales incorrectas o servidor de base de datos inactivo.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (err) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setWorkers([]);
    setRecordsLoaded(false);
    setChatHistory([]);
    handleCancelEdit();
  };

  // --- OBTENER EXPEDIENTES ---
  const fetchWorkers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:8000/patients/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkers(response.data);
      setRecordsLoaded(true); 
    } catch (err) {
      alert("Error al cargar los registros desde el servidor.");
    }
  };

  // --- BOTÓN DE AUTOCOMPLETADO RÁPIDO ---
  const handleAutofill = () => {
    const nombresPrueba = ["Carlos", "María Teresa", "Pedro Luis", "Ana Isabel", "Francisco"];
    const apellidosPrueba = ["Gómez", "Rodríguez", "Mendoza", "Silva", "Hernández"];
    const fechasIngreso = ["2015-04-12", "1998-10-24", "2010-06-15", "2020-02-01"];
    const estatusOptions = ["ACTIVO", "JUBILADO", "VACACIONES", "PENSIONADO"];
    const direccionesPrueba = [
      "Av. Principal Sabana Grande, Edif. El Sol, Apto 4B",
      "Sector Centro, Calle Libertad, Casa Nro. 45",
      "Urb. Las Acacias, Vereda 12, Casa 3",
      "Av. Francisco de Miranda, Res. Avila, Piso 10"
    ];
    const notasPrueba = [
      "Expediente físico completo. Caja de archivo A-12, carpeta marrón.",
      "Expediente en transición de jubilación. Falta firma de Talento Humano.",
      "Carpeta digitalizada parcialmente. Folios del 1 al 15 validados.",
      "Trabajador de vacaciones. Registro de nómina digitalizado correctamente."
    ];

    const randomName = nombresPrueba[Math.floor(Math.random() * nombresPrueba.length)];
    const randomLastName = apellidosPrueba[Math.floor(Math.random() * apellidosPrueba.length)];
    const randomDate = fechasIngreso[Math.floor(Math.random() * fechasIngreso.length)];
    const randomStatus = estatusOptions[Math.floor(Math.random() * estatusOptions.length)];
    const randomNotes = notasPrueba[Math.floor(Math.random() * notasPrueba.length)];
    const randomAddress = direccionesPrueba[Math.floor(Math.random() * direccionesPrueba.length)];

    setFirstName(randomName);
    setLastName(randomLastName);
    setCedula("V-" + Math.floor(10000000 + Math.random() * 20000000)); // Cédula aleatoria realista
    setAddress(randomAddress);
    setEntryDate(randomDate);
    setPhone("0412-555" + Math.floor(1000 + Math.random() * 9000));
    setWorkEmail(`${randomName.toLowerCase().replace(" ", "")}.${randomLastName.toLowerCase()}@hospital.com`);
    setWorkStatus(randomStatus);
    setArchiveNotes(randomNotes);
  };

  // --- CREAR O EDITAR EXPEDIENTE ---
  const handleDigitalize = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formattedNotes = `[ESTADO: ${workStatus}] - ${archiveNotes}`;

    const workerData = {
      first_name: firstName,
      last_name: lastName,
      cedula: cedula,       // <-- ENVIAR AL BACKEND
      address: address,     // <-- ENVIAR AL BACKEND
      birth_date: entryDate,
      phone: phone,
      email: workEmail || null,
      medical_history: formattedNotes,
    };

    try {
      if (editingWorkerId) {
        await axios.put(`http://localhost:8000/patients/${editingWorkerId}`, workerData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Expediente modificado con éxito.");
        handleCancelEdit();
      } else {
        await axios.post("http://localhost:8000/patients/", workerData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Expediente físico digitalizado y guardado.");
        setFirstName("");
        setLastName("");
        setCedula("");
        setAddress("");
        setEntryDate("");
        setPhone("");
        setWorkEmail("");
        setArchiveNotes("");
        setWorkStatus("ACTIVO");
      }
      
      if (recordsLoaded) {
        fetchWorkers();
      }
    } catch (err) {
      alert("Error al procesar el expediente: " + (err.response?.data?.detail || "Datos inválidos o cédula duplicada."));
    }
  };

  const handleSelectEdit = (worker) => {
    setEditingWorkerId(worker.id);
    setFirstName(worker.first_name);
    setLastName(worker.last_name);
    setCedula(worker.cedula || ""); // <-- ASIGNAR PARA EDITAR
    setAddress(worker.address || ""); // <-- ASIGNAR PARA EDITAR
    setEntryDate(worker.birth_date);
    setPhone(worker.phone || "");
    setWorkEmail(worker.email || "");

    const matches = worker.medical_history ? worker.medical_history.match(/^\[ESTADO: (.*?)\] - (.*)$/) : null;
    if (matches) {
      setWorkStatus(matches[1]);
      setArchiveNotes(matches[2]);
    } else {
      setWorkStatus("ACTIVO");
      setArchiveNotes(worker.medical_history || "");
    }
  };

  const handleCancelEdit = () => {
    setEditingWorkerId(null);
    setFirstName("");
    setLastName("");
    setCedula("");
    setAddress("");
    setEntryDate("");
    setPhone("");
    setWorkEmail("");
    setWorkStatus("ACTIVO");
    setArchiveNotes("");
  };

  const handleDeleteWorker = async (workerId) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm("¿Está seguro de que desea eliminar permanentemente este expediente?");
    
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/patients/${workerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Expediente eliminado de la base de datos.");
      fetchWorkers();
    } catch (err) {
      alert("Error al intentar eliminar el registro.");
    }
  };

  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const token = localStorage.getItem("token");
    const userPrompt = aiMessage;
    setAiMessage("");
    setAiLoading(true);

    setChatHistory((prev) => [...prev, { role: "user", text: userPrompt }]);

    try {
      const response = await axios.post(
        "http://localhost:8000/ai/chat",
        { message: userPrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatHistory((prev) => [...prev, { role: "ai", text: response.data.response }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: "ai", text: "Error de comunicación con el servicio de archivo IA." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // --- FILTRO INTELIGENTE EXPANDIDO (Busca también por Cédula) ---
  const filteredWorkers = workers.filter((w) => {
    const fullName = `${w.first_name} ${w.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      w.id.toString() === query ||
      (w.cedula && w.cedula.toLowerCase().includes(query)) ||
      (w.email && w.email.toLowerCase().includes(query))
    );
  });

  return (
    <div style={styles.appContainer}>
      
      {!user ? (
        // === LOGIN ===
        <div style={styles.loginWrapper}>
          <form onSubmit={handleLogin} style={styles.loginCard}>
            <div style={styles.loginHeader}>
              <div style={styles.logoIconBg}>
                <FolderArchive size={32} color="#0d9488" />
              </div>
              <h2 style={styles.loginTitle}>SAD-TH</h2>
              <p style={styles.loginSubtitle}>Sistema de Archivo Digital - Talento Humano</p>
            </div>

            {error && <div style={styles.alertError}>{error}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Usuario de Archivo (Email)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.formInput} placeholder="archivo@hospital.com" required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Clave de Acceso</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.formInput} placeholder="••••••••" required />
            </div>

            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? "Autenticando..." : "Ingresar al Archivo Digital"}
            </button>
          </form>
        </div>
      ) : (
        // === DASHBOARD ===
        <div style={styles.dashboardContainer}>
          
          <header style={styles.header}>
            <div style={styles.brand}>
              <FolderArchive size={28} color="#0d9488" />
              <span style={styles.brandText}>SAD-TH / ARCHIVO GENERAL</span>
            </div>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                <User size={18} color="#0d9488" />
              </div>
              <div style={styles.userDetail}>
                <span style={styles.userName}>{user.email}</span>
                <span style={styles.userRoleBadge}>{user.role}</span>
              </div>
              <button onClick={handleLogout} style={styles.btnLogout} title="Cerrar Sesión">
                <LogOut size={18} />
              </button>
            </div>
          </header>

          {/* KPIs */}
          <section style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIconBox}><FileDigit size={24} color="#0d9488" /></div>
              <div>
                <h4 style={styles.kpiValue}>{recordsLoaded ? filteredWorkers.length : "-"}</h4>
                <p style={styles.kpiLabel}>Expedientes Visibles</p>
              </div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIconBox}><Bot size={24} color="#3b82f6" /></div>
              <div>
                <h4 style={styles.kpiValue}>Llama 3.1</h4>
                <p style={styles.kpiLabel}>IA Analista de Archivo</p>
              </div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIconBox}><Activity size={24} color="#10b981" /></div>
              <div>
                <h4 style={{...styles.kpiValue, color: "#10b981"}}>PostgreSQL</h4>
                <p style={styles.kpiLabel}>Estado del Servidor</p>
              </div>
            </div>
          </section>

          {/* Pestañas */}
          <div style={styles.tabBar}>
            <button onClick={() => setActiveTab("archive")} style={{ ...styles.tabLink, borderBottom: activeTab === "archive" ? "3px solid #0d9488" : "3px solid transparent", color: activeTab === "archive" ? "#fff" : "#94a3b8" }} >
              <FolderArchive size={18} style={{marginRight: "8px"}} />
              Digitalización de Carpetas
            </button>
            <button onClick={() => setActiveTab("ai")} style={{ ...styles.tabLink, borderBottom: activeTab === "ai" ? "3px solid #0d9488" : "3px solid transparent", color: activeTab === "ai" ? "#fff" : "#94a3b8" }} >
              <Bot size={18} style={{marginRight: "8px"}} />
              Asistente de Archivo
            </button>
          </div>

          {/* CONTENIDO: DIGITALIZACIÓN */}
          {activeTab === "archive" && (
            <div style={styles.splitLayout}>
              
              {/* Formulario (Creación y Edición) */}
              {user.role === "ADMIN" ? (
                <div style={styles.leftCol}>
                  <form onSubmit={handleDigitalize} style={{...styles.medicalForm, border: editingWorkerId ? "2px solid #0d9488" : "none"}}>
                    
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                      <h3 style={{...styles.sectionTitle, margin: 0, color: editingWorkerId ? "#0d9488" : "#fff"}}>
                        {editingWorkerId ? <Edit size={18} style={{marginRight: "8px"}} /> : <Plus size={18} style={{marginRight: "8px"}} />}
                        {editingWorkerId ? `Modificando ID: ${editingWorkerId}` : "Ingreso de Carpeta Física"}
                      </h3>
                      
                      <div style={{display: "flex", gap: "5px"}}>
                        {!editingWorkerId && (
                          <button type="button" onClick={handleAutofill} style={styles.btnAutofill} title="Rellenar con plantilla de prueba">
                            <Zap size={14} style={{marginRight: "4px"}} />
                            Carga Rápida
                          </button>
                        )}
                        {editingWorkerId && (
                          <button type="button" onClick={handleCancelEdit} style={styles.btnCancelEdit} title="Cancelar edición">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div style={styles.grid2Col}>
                      <input type="text" placeholder="Nombres" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={styles.formInput} required />
                      <input type="text" placeholder="Apellidos" value={lastName} onChange={(e) => setLastName(e.target.value)} style={styles.formInput} required />
                    </div>

                    {/* NUEVO CAMPO: CÉDULA */}
                    <div style={styles.inputWithIcon}>
                      <CreditCard size={16} style={styles.innerIcon} />
                      <input type="text" placeholder="Cédula de Identidad (Ej: V-12345678)" value={cedula} onChange={(e) => setCedula(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} required />
                    </div>

                    <div style={styles.grid2Col}>
                      <div style={styles.inputWithIcon}>
                        <Calendar size={16} style={styles.innerIcon} />
                        <input type="date" title="Fecha de Ingreso al Hospital" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} required />
                      </div>
                      <div style={styles.inputWithIcon}>
                        <Phone size={16} style={styles.innerIcon} />
                        <input type="text" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} />
                      </div>
                    </div>

                    <input type="email" placeholder="Correo Institucional" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} style={styles.formInput} />

                    {/* NUEVO CAMPO: DIRECCIÓN */}
                    <div style={styles.inputWithIcon}>
                      <MapPin size={16} style={styles.innerIcon} />
                      <input type="text" placeholder="Dirección de Habitación Completa" value={address} onChange={(e) => setAddress(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>Estatus Laboral en el Expediente</label>
                      <select value={workStatus} onChange={(e) => setWorkStatus(e.target.value)} style={styles.formInput}>
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="JUBILADO">JUBILADO</option>
                        <option value="VACACIONES">EN VACACIONES</option>
                        <option value="FALLECIDO">FALLECIDO</option>
                        <option value="PENSIONADO">PENSIONADO</option>
                      </select>
                    </div>

                    <div style={styles.inputWithIcon}>
                      <FileText size={16} style={{...styles.innerIcon, top: "15px"}} />
                      <textarea placeholder="Notas sobre el estado físico de la carpeta..." value={archiveNotes} onChange={(e) => setArchiveNotes(e.target.value)} style={{...styles.formInput, height: "100px", paddingLeft: "35px", paddingTop: "10px"}} required />
                    </div>

                    <button type="submit" style={{...styles.btnPrimary, backgroundColor: editingWorkerId ? "#0f766e" : "#0d9488"}}>
                      {editingWorkerId ? "Guardar Cambios" : "Guardar en Archivo Histórico"}
                    </button>
                  </form>
                </div>
              ) : (
                <div style={styles.leftCol}>
                  <div style={styles.guestAlert}>
                    <ShieldAlert size={24} color="#f59e0b" style={{marginBottom: "10px"}} />
                    <p style={{margin: 0, fontWeight: "bold"}}>Modo Consulta (Invitado)</p>
                    <p style={{margin: "5px 0 0 0", fontSize: "14px", color: "#94a3b8"}}>No posees permisos de transcriptor. Solo puedes revisar expedientes digitalizados.</p>
                  </div>
                </div>
              )}

              {/* Bóveda de Archivo */}
              <div style={styles.rightCol}>
                
                <div style={styles.searchHeader}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                    <h3 style={{margin: 0, fontSize: "16px"}}>Bóveda Digital</h3>
                    <button onClick={fetchWorkers} style={styles.btnLoadRecords}>
                      <RefreshCw size={14} style={{marginRight: "6px"}} />
                      {recordsLoaded ? "Sincronizar Bóveda" : "Cargar Expedientes"}
                    </button>
                  </div>
                  
                  {recordsLoaded && (
                    <div style={styles.searchBarWrapper}>
                      <Search size={16} style={styles.searchIcon} />
                      <input
                        type="text"
                        placeholder="Buscar por Cédula, Nombre o ID de Expediente..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={styles.searchInputField}
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} style={styles.btnClearSearch}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div style={styles.patientsFeed}>
                  {!recordsLoaded ? (
                    <div style={styles.placeholderBox}>
                      <FolderArchive size={40} color="#334155" style={{marginBottom: "10px"}} />
                      <p style={{margin: 0, color: "#94a3b8", fontWeight: "bold"}}>Bóveda Digital Cerrada</p>
                      <p style={{margin: "5px 0 0 0", fontSize: "12.5px", color: "#64748b", textAlign: "center"}}>Por políticas de seguridad, presione "Cargar Expedientes" para desencriptar y visualizar la información.</p>
                    </div>
                  ) : filteredWorkers.length === 0 ? (
                    <p style={{color: "#64748b", textAlign: "center", marginTop: "30px"}}>Ningún expediente coincide con la búsqueda.</p>
                  ) : (
                    filteredWorkers.map((w) => {
                      const matches = w.medical_history ? w.medical_history.match(/^\[ESTADO: (.*?)\] - (.*)$/) : null;
                      const status = matches ? matches[1] : "N/A";
                      const notes = matches ? matches[2] : w.medical_history;

                      return (
                        <div key={w.id} style={styles.medicalCard}>
                          <div style={styles.cardHeader}>
                            <h4 style={styles.patientName}>{w.first_name} {w.last_name}</h4>
                            <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
                              <span 
                                style={{
                                  ...styles.patientIdBadge, 
                                  backgroundColor: status === "ACTIVO" ? "#10b981" : status === "FALLECIDO" ? "#ef4444" : "#f59e0b",
                                  color: "#fff",
                                  fontWeight: "bold"
                                }}
                              >
                                {status}
                              </span>
                              
                              {user.role === "ADMIN" && (
                                <div style={styles.crudActionGroup}>
                                  <button onClick={() => handleSelectEdit(w)} style={styles.btnIconEdit} title="Editar expediente">
                                    <Edit size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteWorker(w.id)} style={styles.btnIconDelete} title="Eliminar expediente">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div style={styles.cardDetails}>
                            {/* MOSTRAR CÉDULA Y DIRECCIÓN EN LA TARJETA */}
                            <div style={styles.detailRow}>
                              <CreditCard size={14} color="#0d9488" /> <span><strong>Cédula:</strong> {w.cedula || "No registrada"}</span>
                            </div>
                            <div style={styles.detailRow}>
                              <Calendar size={14} color="#0d9488" /> <span><strong>Fecha Ingreso:</strong> {w.birth_date}</span>
                            </div>
                            <div style={styles.detailRow}>
                              <Phone size={14} color="#0d9488" /> <span><strong>Telf:</strong> {w.phone || "No registrado"}</span>
                            </div>
                            {w.email && (
                              <div style={styles.detailRow}>
                                <Mail size={14} color="#0d9488" /> <span><strong>Email:</strong> {w.email}</span>
                              </div>
                            )}
                            {w.address && (
                              <div style={styles.detailRow}>
                                <MapPin size={14} color="#0d9488" /> <span><strong>Dirección:</strong> {w.address}</span>
                              </div>
                            )}
                            <div style={styles.historyBox}>
                              <strong style={{color: "#fff", display: "block", marginBottom: "3px", fontSize: "13px"}}>Descripción del Expediente:</strong>
                              <p style={{margin: 0, color: "#cbd5e1", fontSize: "13px"}}>{notes || "Sin observaciones físicas"}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CONTENIDO: IA DE ARCHIVO */}
          {activeTab === "ai" && (
            <div style={styles.aiContainer}>
              <div style={styles.aiHeader}>
                <Bot size={32} color="#0d9488" />
                <div>
                  <h3 style={{margin: 0}}>Asistente de Gestión de Archivo SAD-TH</h3>
                  <p style={{margin: "3px 0 0 0", color: "#94a3b8", fontSize: "14px"}}>Consultor experto en organización, digitalización y leyes de conservación de expedientes del personal</p>
                </div>
              </div>

              <div style={styles.chatWrapper}>
                {chatHistory.length === 0 ? (
                  <div style={styles.chatPlaceholder}>
                    <MessageSquare size={48} color="#334155" style={{marginBottom: "15px"}} />
                    <p style={{margin: 0, fontWeight: "bold", color: "#94a3b8"}}>¿Qué duda tienes hoy?</p>
                    <p style={{margin: "5px 0 0 0", fontSize: "13px", color: "#64748b", maxWidth: "400px", textAlign: "center"}}>Pregúntame sobre cómo archivar carpetas de jubilados, protocolos de expedientes o tiempos de retención de nóminas físicas.</p>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        ...styles.chatBubble, 
                        alignSelf: msg.role === "user" ? "flex-end" : "flex-start", 
                        backgroundColor: msg.role === "user" ? "#0d9488" : "#334155",
                        borderBottomRightRadius: msg.role === "user" ? "0" : "12px",
                        borderBottomLeftRadius: msg.role === "ai" ? "0" : "12px"
                      }}
                    >
                      <strong style={{fontSize: "13px", color: msg.role === "user" ? "#e0f2fe" : "#93c5fd", display: "block", marginBottom: "4px"}}>
                        {msg.role === "user" ? "Transcriptor de Archivo" : "Consultor IA de Archivo"}
                      </strong>
                      <p style={{ margin: 0, fontSize: "14.5px", lineHeight: "1.5", whiteSpace: "pre-line" }}>{msg.text}</p>
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div style={{...styles.chatBubble, alignSelf: "flex-start", backgroundColor: "#334155", borderBottomLeftRadius: 0}}>
                    <div style={styles.loaderContainer}>
                      <div style={styles.pulseDot}></div>
                      <span style={{fontSize: "13px", color: "#94a3b8"}}>Analizando normativas de archivo...</span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendAiMessage} style={styles.chatForm}>
                <input
                  type="text"
                  placeholder="Ej: ¿Cuánto tiempo se debe guardar el expediente de un jubilado?"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  style={styles.chatInput}
                  disabled={aiLoading}
                />
                <button type="submit" style={styles.chatSubmitBtn} disabled={aiLoading}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// === ESTILOS PREMIUM ===
const styles = {
  appContainer: { fontFamily: "'Inter', sans-serif", backgroundColor: "#0f172a", color: "#f1f5f9", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", boxSizing: "border-box" },
  loginWrapper: { display: "flex", alignItems: "center", justifyContext: "center", justifyContent: "center", flex: 1, width: "100%", maxWidth: "420px" },
  loginCard: { backgroundColor: "#1e293b", padding: "40px 30px", borderRadius: "16px", width: "100%", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)", display: "flex", flexDirection: "column", gap: "20px" },
  loginHeader: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  logoIconBg: { backgroundColor: "#0f172a", padding: "12px", borderRadius: "50%", display: "flex" },
  loginTitle: { margin: 0, fontSize: "28px", fontWeight: "900", color: "#fff", letterSpacing: "1px" },
  loginSubtitle: { margin: 0, fontSize: "12.5px", color: "#94a3b8", textAlign: "center" },
  alertError: { backgroundColor: "#7f1d1d", color: "#fca5a5", padding: "10px", borderRadius: "6px", fontSize: "14px", textAlign: "center", border: "1px solid #b91c1c" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  inputLabel: { fontSize: "13px", color: "#94a3b8", fontWeight: "600" },
  formInput: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", boxSizing: "border-box", fontSize: "14px", outline: "none" },
  btnPrimary: { width: "100%", padding: "12px", backgroundColor: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" },

  // Dashboard
  dashboardContainer: { width: "100%", maxWidth: "960px", backgroundColor: "#1e293b", borderRadius: "16px", padding: "25px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)", boxSizing: "border-box" },
  header: { display: "flex", justifyContext: "space-between", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "20px", marginBottom: "20px" },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  brandText: { fontSize: "18px", fontWeight: "800", letterSpacing: "1px", color: "#fff" },
  userInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { backgroundColor: "#0f172a", padding: "8px", borderRadius: "50%", display: "flex" },
  userDetail: { display: "flex", flexDirection: "column" },
  userName: { fontSize: "13px", fontWeight: "bold" },
  userRoleBadge: { fontSize: "10px", backgroundColor: "#0369a1", padding: "1px 6px", borderRadius: "4px", alignSelf: "flex-start", marginTop: "2px", fontWeight: "bold" },
  btnLogout: { backgroundColor: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "6px", display: "flex" },

  // KPIs
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" },
  kpiCard: { backgroundColor: "#0f172a", padding: "15px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "15px" },
  kpiIconBox: { backgroundColor: "#1e293b", padding: "10px", borderRadius: "8px", display: "flex" },
  kpiValue: { margin: 0, fontSize: "20px", fontWeight: "bold", color: "#fff" },
  kpiLabel: { margin: 0, fontSize: "12px", color: "#64748b" },

  // Tabs
  tabBar: { display: "flex", gap: "20px", borderBottom: "1px solid #334155", marginBottom: "20px" },
  tabLink: { backgroundColor: "transparent", border: "none", padding: "12px 6px", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center" },

  // Split Layout
  splitLayout: { display: "grid", gridTemplateColumns: "40% 60%", gap: "25px", alignItems: "start" },
  leftCol: { display: "flex", flexDirection: "column" },
  rightCol: { display: "flex", flexDirection: "column" },
  sectionTitle: { margin: "0 0 15px 0", fontSize: "16px", color: "#fff", display: "flex", alignItems: "center" },
  medicalForm: { backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px", transition: "border 0.2s" },
  grid2Col: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  inputWithIcon: { position: "relative", width: "100%" },
  innerIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  guestAlert: { backgroundColor: "#1e1b4b", border: "1px solid #312e81", padding: "20px", borderRadius: "12px", textAlign: "center", color: "#e0e7ff" },
  btnCancelEdit: { backgroundColor: "transparent", border: "none", color: "#f43f5e", cursor: "pointer", display: "flex" },
  btnAutofill: { display: "flex", alignItems: "center", padding: "4px 8px", backgroundColor: "#334155", color: "#eab308", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" },

  // Bóveda de Archivo y Buscador
  searchHeader: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" },
  searchBarWrapper: { position: "relative", width: "100%" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  searchInputField: { width: "100%", padding: "10px 35px 10px 35px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", boxSizing: "border-box", fontSize: "13.5px", outline: "none" },
  btnClearSearch: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer" },

  patientsFeed: { display: "flex", flexDirection: "column", gap: "12px", maxHeight: "440px", overflowY: "auto" },
  placeholderBox: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", border: "1px dashed #334155", borderRadius: "12px", backgroundColor: "#0f172a" },
  btnLoadRecords: { display: "flex", alignItems: "center", padding: "6px 12px", backgroundColor: "#0d9488", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", cursor: "pointer" },
  
  medicalCard: { backgroundColor: "#0f172a", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #0d9488" },
  cardHeader: { display: "flex", justifyContext: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  patientName: { margin: 0, fontSize: "16px", color: "#fff" },
  patientIdBadge: { fontSize: "11px", padding: "2px 8px", borderRadius: "12px" },
  cardDetails: { display: "flex", flexDirection: "column", gap: "6px" },
  detailRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#94a3b8" },
  historyBox: { backgroundColor: "#1e293b", padding: "10px", borderRadius: "6px", marginTop: "8px" },

  // CRUD Actions
  crudActionGroup: { display: "flex", gap: "4px" },
  btnIconEdit: { padding: "4px", backgroundColor: "#334155", color: "#38bdf8", border: "none", borderRadius: "4px", cursor: "pointer", display: "flex" },
  btnIconDelete: { padding: "4px", backgroundColor: "#334155", color: "#f43f5e", border: "none", borderRadius: "4px", cursor: "pointer", display: "flex" },

  // IA Chat
  aiContainer: { display: "flex", flexDirection: "column", gap: "20px" },
  aiHeader: { display: "flex", alignItems: "center", gap: "15px", backgroundColor: "#0f172a", padding: "15px", borderRadius: "12px" },
  chatWrapper: { height: "320px", backgroundColor: "#0f172a", borderRadius: "12px", padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" },
  chatPlaceholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContext: "center", justifyContent: "center", height: "100%" },
  chatBubble: { maxWidth: "75%", padding: "12px 16px", borderRadius: "12px", color: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  loaderContainer: { display: "flex", alignItems: "center", gap: "10px" },
  pulseDot: { width: "8px", height: "8px", backgroundColor: "#10b981", borderRadius: "50%", animation: "pulse 1.5s infinite" },
  chatForm: { display: "flex", gap: "10px" },
  chatInput: { flex: 1, padding: "14px", backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155", borderRadius: "8px", fontSize: "14px", outline: "none" },
  chatSubmitBtn: { backgroundColor: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", padding: "0 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContext: "center", justifyContent: "center" }
};

export default App;