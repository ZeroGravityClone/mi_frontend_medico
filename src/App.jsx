import { useState, useEffect } from "react";
import axios from "axios";
// Importamos iconos médicos y de control
import { 
  Stethoscope, Users, Bot, LogOut, Plus, Calendar, 
  Phone, Mail, FileText, Activity, User, MessageSquare, Send, ShieldAlert
} from "lucide-react";

function App() {
  // --- Estados de Autenticación ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Estados del Dashboard ---
  const [activeTab, setActiveTab] = useState("patients");
  const [patients, setPatients] = useState([]);

  // --- Estados del Formulario de Pacientes ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [medHistory, setMedHistory] = useState("");

  // --- Estados del Chat de IA ---
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  useEffect(() => {
    if (user && activeTab === "patients") {
      fetchPatients();
    }
  }, [user, activeTab]);

  // --- Lógica de Login ---
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
      setError("Credenciales incorrectas o servidor inactivo.");
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
    setPatients([]);
    setChatHistory([]);
  };

  // --- Lógica de Pacientes ---
  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:8000/patients/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(response.data);
    } catch (err) {
      console.error("Error al traer pacientes", err);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const newPatient = {
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      phone: phone,
      email: patientEmail || null,
      medical_history: medHistory || null,
    };

    try {
      await axios.post("http://localhost:8000/patients/", newPatient, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFirstName("");
      setLastName("");
      setBirthDate("");
      setPhone("");
      setPatientEmail("");
      setMedHistory("");
      fetchPatients();
    } catch (err) {
      alert("Error al registrar paciente.");
    }
  };

  // --- Lógica del Chat con IA ---
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
      setChatHistory((prev) => [...prev, { role: "ai", text: "Error de comunicación con la IA médica." }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      
      {!user ? (
        // === PANTALLA DE LOGIN CLINICO ===
        <div style={styles.loginWrapper}>
          <form onSubmit={handleLogin} style={styles.loginCard}>
            <div style={styles.loginHeader}>
              <div style={styles.logoIconBg}>
                <Stethoscope size={32} color="#0d9488" />
              </div>
              <h2 style={styles.loginTitle}>Clínica Conectada</h2>
              <p style={styles.loginSubtitle}>Ingreso para personal médico autorizado</p>
            </div>

            {error && <div style={styles.alertError}>{error}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Identificación de Usuario (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.formInput}
                placeholder="doctor@clinicaconectada.com"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Contraseña de Acceso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.formInput}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? "Verificando credenciales..." : "Iniciar Sesión Clínica"}
            </button>
          </form>
        </div>
      ) : (
        // === PANEL DE CONTROL PRINCIPAL (DASHBOARD) ===
        <div style={styles.dashboardContainer}>
          
          {/* Header Superior */}
          <header style={styles.header}>
            <div style={styles.brand}>
              <Stethoscope size={28} color="#0d9488" />
              <span style={styles.brandText}>HOSPITAL CONTROL</span>
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

          {/* Tarjetas de Estadísticas Rápidas (Wow Factor para RRHH) */}
          <section style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIconBox}><Users size={24} color="#0d9488" /></div>
              <div>
                <h4 style={styles.kpiValue}>{patients.length}</h4>
                <p style={styles.kpiLabel}>Pacientes Registrados</p>
              </div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIconBox}><Bot size={24} color="#3b82f6" /></div>
              <div>
                <h4 style={styles.kpiValue}>Llama 3.1</h4>
                <p style={styles.kpiLabel}>Asistente de IA Activo</p>
              </div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIconBox}><Activity size={24} color="#10b981" /></div>
              <div>
                <h4 style={{...styles.kpiValue, color: "#10b981"}}>En Línea</h4>
                <p style={styles.kpiLabel}>Estatus de la Base de Datos</p>
              </div>
            </div>
          </section>

          {/* Navegación por pestañas */}
          <div style={styles.tabBar}>
            <button
              onClick={() => setActiveTab("patients")}
              style={{ ...styles.tabLink, borderBottom: activeTab === "patients" ? "3px solid #0d9488" : "3px solid transparent", color: activeTab === "patients" ? "#fff" : "#94a3b8" }}
            >
              <Users size={18} style={{marginRight: "8px"}} />
              Expedientes de Pacientes
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              style={{ ...styles.tabLink, borderBottom: activeTab === "ai" ? "3px solid #0d9488" : "3px solid transparent", color: activeTab === "ai" ? "#fff" : "#94a3b8" }}
            >
              <Bot size={18} style={{marginRight: "8px"}} />
              Consultor de IA Clínica
            </button>
          </div>

          {/* CONTENIDO PESTAÑA: PACIENTES */}
          {activeTab === "patients" && (
            <div style={styles.splitLayout}>
              
              {/* Formulario Izquierda (Solo si es ADMIN) */}
              {user.role === "ADMIN" ? (
                <div style={styles.leftCol}>
                  <form onSubmit={handleCreatePatient} style={styles.medicalForm}>
                    <h3 style={styles.sectionTitle}>
                      <Plus size={18} style={{marginRight: "8px"}} />
                      Nuevo Registro Médico
                    </h3>
                    
                    <div style={styles.grid2Col}>
                      <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={styles.formInput} required />
                      <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} style={styles.formInput} required />
                    </div>

                    <div style={styles.grid2Col}>
                      <div style={styles.inputWithIcon}>
                        <Calendar size={16} style={styles.innerIcon} />
                        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} required />
                      </div>
                      <div style={styles.inputWithIcon}>
                        <Phone size={16} style={styles.innerIcon} />
                        <input type="text" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} />
                      </div>
                    </div>

                    <div style={styles.inputWithIcon}>
                      <Mail size={16} style={styles.innerIcon} />
                      <input type="email" placeholder="Correo Electrónico" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} />
                    </div>

                    <div style={styles.inputWithIcon}>
                      <FileText size={16} style={{...styles.innerIcon, top: "15px"}} />
                      <textarea placeholder="Síntomas iniciales e historial médico..." value={medHistory} onChange={(e) => setMedHistory(e.target.value)} style={{...styles.formInput, height: "100px", paddingLeft: "35px", paddingTop: "10px"}} />
                    </div>

                    <button type="submit" style={styles.btnPrimary}>Guardar en Historial</button>
                  </form>
                </div>
              ) : (
                <div style={styles.leftCol}>
                  <div style={styles.guestAlert}>
                    <ShieldAlert size={24} color="#f59e0b" style={{marginBottom: "10px"}} />
                    <p style={{margin: 0, fontWeight: "bold"}}>Modo Invitado</p>
                    <p style={{margin: "5px 0 0 0", fontSize: "14px", color: "#94a3b8"}}>No posees privilegios de administrador para registrar o modificar expedientes clínicos.</p>
                  </div>
                </div>
              )}

              {/* Lista Derecha */}
              <div style={styles.rightCol}>
                <h3 style={styles.sectionTitle}>Carpeta de Expedientes</h3>
                <div style={styles.patientsFeed}>
                  {patients.length === 0 ? (
                    <p style={{color: "#64748b", textAlign: "center", marginTop: "30px"}}>No hay pacientes en la base de datos.</p>
                  ) : (
                    patients.map((p) => (
                      <div key={p.id} style={styles.medicalCard}>
                        <div style={styles.cardHeader}>
                          <h4 style={styles.patientName}>{p.first_name} {p.last_name}</h4>
                          <span style={styles.patientIdBadge}>ID: {p.id}</span>
                        </div>
                        <div style={styles.cardDetails}>
                          <div style={styles.detailRow}>
                            <Calendar size={14} color="#0d9488" /> <span>Nacimiento: {p.birth_date}</span>
                          </div>
                          <div style={styles.detailRow}>
                            <Phone size={14} color="#0d9488" /> <span>{p.phone || "Sin teléfono registrado"}</span>
                          </div>
                          {p.email && (
                            <div style={styles.detailRow}>
                              <Mail size={14} color="#0d9488" /> <span>{p.email}</span>
                            </div>
                          )}
                          <div style={styles.historyBox}>
                            <strong style={{color: "#fff", display: "block", marginBottom: "3px", fontSize: "13px"}}>Historial Clínico:</strong>
                            <p style={{margin: 0, color: "#cbd5e1", fontSize: "13px"}}>{p.medical_history || "Sin reportes iniciales"}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CONTENIDO PESTAÑA: IA */}
          {activeTab === "ai" && (
            <div style={styles.aiContainer}>
              <div style={styles.aiHeader}>
                <Bot size={32} color="#0d9488" />
                <div>
                  <h3 style={{margin: 0}}>Asistente Médico Groq</h3>
                  <p style={{margin: "3px 0 0 0", color: "#94a3b8", fontSize: "14px"}}>Asesoría de diagnóstico rápido basada en Llama 3.1 (Uso reservado para personal médico)</p>
                </div>
              </div>

              <div style={styles.chatWrapper}>
                {chatHistory.length === 0 ? (
                  <div style={styles.chatPlaceholder}>
                    <MessageSquare size={48} color="#334155" style={{marginBottom: "15px"}} />
                    <p style={{margin: 0, fontWeight: "bold", color: "#94a3b8"}}>¿En qué puedo asistirte, doctor?</p>
                    <p style={{margin: "5px 0 0 0", fontSize: "13px", color: "#64748b", maxWidth: "300px", textAlign: "center"}}>Prueba consultando interacciones farmacológicas, análisis de síntomas o protocolos clínicos.</p>
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
                        {msg.role === "user" ? "Consulta Médica" : "Sugerencia Clínica IA"}
                      </strong>
                      <p style={{ margin: 0, fontSize: "14.5px", lineHeight: "1.5", whiteSpace: "pre-line" }}>{msg.text}</p>
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div style={{...styles.chatBubble, alignSelf: "flex-start", backgroundColor: "#334155", borderBottomLeftRadius: 0}}>
                    <div style={styles.loaderContainer}>
                      <div style={styles.pulseDot}></div>
                      <span style={{fontSize: "13px", color: "#94a3b8"}}>Analizando síntomas clínicos...</span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendAiMessage} style={styles.chatForm}>
                <input
                  type="text"
                  placeholder="Ej: Interacción entre Ibuprofeno y Enalapril, o síntomas de Apendicitis..."
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

// === ESTILOS PREMIUM (Diseño Clínico SaaS Dark) ===
const styles = {
  appContainer: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    backgroundColor: "#0f172a", // Slate 900
    color: "#f1f5f9",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box"
  },
  loginWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
    maxWidth: "420px",
  },
  loginCard: {
    backgroundColor: "#1e293b", // Slate 800
    padding: "40px 30px",
    borderRadius: "16px",
    width: "100%",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  loginHeader: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px"
  },
  logoIconBg: {
    backgroundColor: "#0f172a",
    padding: "12px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  loginTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
    color: "#fff"
  },
  loginSubtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#94a3b8"
  },
  alertError: {
    backgroundColor: "#7f1d1d",
    color: "#fca5a5",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "14px",
    textAlign: "center",
    border: "1px solid #b91c1c"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  inputLabel: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "600"
  },
  formInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#fff",
    boxSizing: "border-box",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s"
  },
  btnPrimary: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0d9488", // Teal 600
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },

  // === DASHBOARD ESTILOS ===
  dashboardContainer: {
    width: "100%",
    maxWidth: "960px",
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
    boxSizing: "border-box"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #334155",
    paddingBottom: "20px",
    marginBottom: "20px"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  brandText: {
    fontSize: "18px",
    fontWeight: "800",
    letterSpacing: "1px",
    color: "#fff"
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  avatar: {
    backgroundColor: "#0f172a",
    padding: "8px",
    borderRadius: "50%",
    display: "flex"
  },
  userDetail: {
    display: "flex",
    flexDirection: "column"
  },
  userName: {
    fontSize: "13px",
    fontWeight: "bold"
  },
  userRoleBadge: {
    fontSize: "10px",
    backgroundColor: "#0369a1", // Sky 700
    padding: "1px 6px",
    borderRadius: "4px",
    alignSelf: "flex-start",
    marginTop: "2px",
    fontWeight: "bold"
  },
  btnLogout: {
    backgroundColor: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex"
  },

  // KPIs
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginBottom: "25px"
  },
  kpiCard: {
    backgroundColor: "#0f172a",
    padding: "15px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  kpiIconBox: {
    backgroundColor: "#1e293b",
    padding: "10px",
    borderRadius: "8px",
    display: "flex"
  },
  kpiValue: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold",
    color: "#fff"
  },
  kpiLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b"
  },

  // Tabs
  tabBar: {
    display: "flex",
    gap: "20px",
    borderBottom: "1px solid #334155",
    marginBottom: "20px"
  },
  tabLink: {
    backgroundColor: "transparent",
    border: "none",
    padding: "12px 6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },

  // Split Layout
  splitLayout: {
    display: "grid",
    gridTemplateColumns: "40% 60%",
    gap: "25px",
    alignItems: "start"
  },
  leftCol: {
    display: "flex",
    flexDirection: "column"
  },
  rightCol: {
    display: "flex",
    flexDirection: "column"
  },
  sectionTitle: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    color: "#fff",
    display: "flex",
    alignItems: "center"
  },
  medicalForm: {
    backgroundColor: "#0f172a",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  grid2Col: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  inputWithIcon: {
    position: "relative",
    width: "100%"
  },
  innerIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b"
  },
  guestAlert: {
    backgroundColor: "#1e1b4b",
    border: "1px solid #312e81",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#e0e7ff"
  },

  // Carpeta de Expedientes
  patientsFeed: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "440px",
    overflowY: "auto"
  },
  medicalCard: {
    backgroundColor: "#0f172a",
    padding: "18px",
    borderRadius: "12px",
    borderLeft: "4px solid #0d9488"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  patientName: {
    margin: 0,
    fontSize: "16px",
    color: "#fff"
  },
  patientIdBadge: {
    fontSize: "11px",
    backgroundColor: "#1e293b",
    padding: "2px 8px",
    borderRadius: "12px",
    color: "#94a3b8"
  },
  cardDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#94a3b8"
  },
  historyBox: {
    backgroundColor: "#1e293b",
    padding: "10px",
    borderRadius: "6px",
    marginTop: "8px"
  },

  // IA Chat
  aiContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  aiHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    backgroundColor: "#0f172a",
    padding: "15px",
    borderRadius: "12px"
  },
  chatWrapper: {
    height: "320px",
    backgroundColor: "#0f172a",
    borderRadius: "12px",
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  chatPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%"
  },
  chatBubble: {
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: "12px",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  loaderContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#10b981",
    borderRadius: "50%",
    animation: "pulse 1.5s infinite"
  },
  chatForm: {
    display: "flex",
    gap: "10px"
  },
  chatInput: {
    flex: 1,
    padding: "14px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "1px solid #334155",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none"
  },
  chatSubmitBtn: {
    backgroundColor: "#0d9488",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0 18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

export default App;