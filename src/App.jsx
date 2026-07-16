import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  FolderArchive, User, LogOut, Plus, Calendar, 
  Phone, Mail, FileText, Edit, RefreshCw, X, Search, 
  MapPin, CreditCard, Bot, Send, ShieldAlert,
  Printer, FileDown, FileSpreadsheet, Paperclip, Eye, Trash2,
  PieChart, Settings, Images, Clock, Upload, File, ExternalLink, CheckCircle, Users,
  ArrowRightLeft, AlertCircle, QrCode, Brain, Briefcase
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// --- ESTILOS GLOBALES ---
const globalCss = `
  .btn-interactive { transition: all 0.2s ease-in-out; transform-origin: center; }
  .btn-interactive:hover { transform: scale(1.03); filter: brightness(1.15); box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10; }
  .btn-interactive:active { transform: scale(0.97); }
  
  .btn-danger:hover { color: #fff !important; background-color: #ef4444 !important; }
  .btn-warning:hover { color: #fff !important; background-color: #f59e0b !important; }
  .btn-info:hover { color: #fff !important; background-color: #3b82f6 !important; }

  .card-interactive { transition: all 0.3s ease; border-left: 4px solid #0d9488; }
  .card-interactive:hover { transform: translateX(6px); background-color: #1e293b !important; box-shadow: 0 8px 20px rgba(0,0,0,0.4); border-left: 4px solid #34d399; }
  
  .input-interactive { transition: all 0.3s ease; box-sizing: border-box; }
  .input-interactive:focus { border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25); outline: none; transform: scale(1.01); }
  
  .tab-item { transition: all 0.2s ease; padding: 10px 15px; border-radius: 8px 8px 0 0; }
  .tab-item:hover { background-color: rgba(13, 148, 136, 0.1); color: #2dd4bf !important; transform: translateY(-2px); }
  
  @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  .modal-animate { animation: fadeInScale 0.2s ease-out forwards; }

  /* Animación del Pie Chart SVG */
  .pie-slice { transition: stroke-width 0.2s ease, opacity 0.2s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; transform-origin: center; }
  .pie-slice:hover { stroke-width: 7; opacity: 0.95; filter: drop-shadow(0px 0px 6px rgba(255,255,255,0.3)); }

  /* Escáner & Láser QR Animación */
  @keyframes laserScan { 
    0% { top: 0%; } 
    50% { top: 100%; } 
    100% { top: 0%; } 
  }
  .laser-line { 
    position: absolute; left: 0; right: 0; height: 3px; 
    background-color: #10b981; box-shadow: 0 0 12px #10b981; 
    animation: laserScan 2s linear infinite; 
  }

  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0f172a; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #475569; }

  /* FASE 2: Personalidad visual de los botones "Auditar con IA" y "Ficha" */
  .btn-ai-audit { background-color: rgba(99, 102, 241, 0.15) !important; color: #a5b4fc !important; border: 1px solid rgba(99, 102, 241, 0.4) !important; }
  .btn-ai-audit:hover { background-color: #6366f1 !important; color: #fff !important; transform: translateY(-2px) scale(1.03); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5); filter: brightness(1.1); }

  .btn-print-ficha { background-color: rgba(16, 185, 129, 0.15) !important; color: #6ee7b7 !important; border: 1px solid rgba(16, 185, 129, 0.4) !important; }
  .btn-print-ficha:hover { background-color: #10b981 !important; color: #fff !important; transform: translateY(-2px) scale(1.03); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5); filter: brightness(1.1); }

  /* FASE 3: Botón "PDF" con rojo suave por defecto y transición a rojo intenso en hover */
  .btn-pdf-soft { background-color: rgba(239, 68, 68, 0.15) !important; color: #fca5a5 !important; border: 1px solid rgba(239, 68, 68, 0.4) !important; }
  .btn-pdf-soft:hover { background-color: #ef4444 !important; color: #fff !important; transform: translateY(-2px) scale(1.03); box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5); filter: brightness(1.1); }
`;

// --- COMPONENTE: GRÁFICO CIRCULAR INTERACTIVO (SVG Puro, 0 librerías extra) ---
const DonutChart = ({ data, title }) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [animated, setAnimated] = useState(false);

  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  const radius = 15.915494309189533; 
  let cumulativePercent = 0;
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const safeTotal = total === 0 ? 1 : total; 

  const handleMouseMove = (e, slice) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHoveredSlice(slice);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", flex: 1, backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px dashed #334155", position: "relative" }}>
      <h4 style={{ margin: 0, color: "#fff", fontSize: "15px" }}>{title}</h4>
      
      <div style={{ position: "relative", width: "170px", height: "180px" }}>
        <svg viewBox="0 0 42 42" width="100%" height="100%" style={{ transform: "rotate(-90deg)", filter: "drop-shadow(0px 6px 8px rgba(0,0,0,0.5))" }}>
          <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#1e293b" strokeWidth="5" />
          {data.map(slice => {
            const percent = (slice.value / safeTotal) * 100;
            const dashArray = animated ? `${percent} ${100 - percent}` : `0 100`;
            const dashOffset = -cumulativePercent;
            cumulativePercent += percent;
            
            const isHovered = hoveredSlice?.label === slice.label;
            const expansion = isHovered ? 1.08 : 1;

            return (
              <circle 
                key={slice.label} cx="21" cy="21" r={radius} fill="transparent" stroke={slice.color} 
                strokeWidth={isHovered ? "7" : "5"} strokeDasharray={dashArray} strokeDashoffset={dashOffset} 
                className="pie-slice" style={{ transform: `scale(${expansion})` }}
                onMouseMove={(e) => handleMouseMove(e, slice)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold", color: "#fff" }}>
            {hoveredSlice ? hoveredSlice.value : total}
          </span>
          <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>
            {hoveredSlice ? "Selección" : "Total"}
          </span>
        </div>
      </div>

      {hoveredSlice && (
        <div style={{ position: "absolute", top: tooltipPos.y - 35, left: tooltipPos.x + 20, backgroundColor: "rgba(15, 23, 42, 0.95)", border: `1px solid ${hoveredSlice.color}`, padding: "6px 10px", borderRadius: "6px", pointerEvents: "none", zIndex: 100, color: "#fff", fontSize: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.5)" }}>
          <strong>{hoveredSlice.label}</strong>: {hoveredSlice.value} ({Math.round((hoveredSlice.value/safeTotal)*100)}%)
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "5px" }}>
        {data.map(slice => (
          <div key={slice.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#cbd5e1" }}>
            <div style={{ width: "10px", height: "10px", backgroundColor: slice.color, borderRadius: "50%" }}></div>
            {slice.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
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
  const [today] = useState(new Date().toISOString().split('T')[0]); 

  // FORMULARIO DIGITALIZACION
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [isAutoRegistering, setIsAutoRegistering] = useState(false); // <-- FASE 1: Auto-Registro Inteligente con IA
  const [autoRegisterSuccessMsg, setAutoRegisterSuccessMsg] = useState("");
  const autoRegisterInputRef = useRef(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cedula, setCedula] = useState(""); 
  const [address, setAddress] = useState(""); 
  const [entryDate, setEntryDate] = useState("");
  const [phone, setPhone] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [workCargo, setWorkCargo] = useState(""); // <-- FASE 1: Cargo / Posición Laboral
  const [workStatus, setWorkStatus] = useState("ACTIVO");
  const [docStatus, setDocStatus] = useState("COMPLETO"); 
  const [archiveNotes, setArchiveNotes] = useState("");

  // MODAL ARCHIVOS
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerDocs, setWorkerDocs] = useState([]);
  const [fileUpload, setFileUpload] = useState(null);
  const [fileDesc, setFileDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [scanAnalysisMode, setScanAnalysisMode] = useState("fast"); // <-- FASE 1: Modo de análisis IA ("fast" | "full")

  // MODAL DE USUARIOS
  const [showUserModal, setShowUserModal] = useState(false);
  const [systemUsers, setSystemUsers] = useState([]);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("GUEST");
  const [userSuccessMsg, setUserSuccessMsg] = useState(""); // <-- Banner de éxito interno (reemplaza alert nativo)

  // ESTADOS REALES DE PRÉSTAMOS
  const [loans, setLoans] = useState([]);
  const [borrowerName, setBorrowerName] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [loanSearchQuery, setLoanSearchQuery] = useState("");
  const [loanStatusFilter, setLoanStatusFilter] = useState("TODOS");
  const [alertsSummary, setAlertsSummary] = useState({ overdue: [], due_soon: [], purges: [] }); // <-- FASE 6: Centro de Alertas real

  const [alertTypeFilter, setAlertTypeFilter] = useState("TODAS");
  const [alertPriorityFilter, setAlertPriorityFilter] = useState("TODAS");

  // --- ESTADOS DE LA PESTAÑA "PDF ESCANEADOS" ---
  const [scannerConnected, setScannerConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [qrInputManual, setQrInputManual] = useState("");
  const [selectedPatientForScan, setSelectedPatientForScan] = useState("");
  const [scanFolderNum, setScanFolderNum] = useState("");
  const [selectedScanCategory, setSelectedCategory] = useState("Cédula");
  const [searchDocCategory, setSearchDocCategory] = useState("TODAS");
  const [searchDocFolder, setSearchDocFolder] = useState("");
  
  // Lista global conectada al backend
  const [globalDocsList, setGlobalDocsList] = useState([]);

  // FASE 5: MODIFICAR/ELIMINAR DOCUMENTOS DESDE EL VISOR GLOBAL
  const [showEditDocModal, setShowEditDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editDocCategory, setEditDocCategory] = useState("");
  const [editDocFileName, setEditDocFileName] = useState("");
  const [editDocStatus, setEditDocStatus] = useState("");

  const [digitalizationHistory, setDigitalizationHistory] = useState([
    { id: 1, transcriptor: "archivo@hospital.com", date: "2026-06-18 09:30 AM", doc: "Copia de Cédula", worker: "Gómez, Carlos" },
    { id: 2, transcriptor: "archivo@hospital.com", date: "2026-06-18 11:15 AM", doc: "Contrato de Trabajo", worker: "Rodríguez, María" }
  ]);

  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // --- ESTADOS DE NOTIFICACIONES INTERNAS (REEMPLAZAN ALERTS NATIVOS) ---
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "info" });
  const [confirm, setConfirm] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  // --- FASE 2: ESTADO LOCAL DE AUDITORÍA EN VIVO ---
  const [auditingWorkerId, setAuditingWorkerId] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ isOpen: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isOpen: false }));
    }, 4000);
  };

  const triggerConfirm = (title, message, callback) => {
    setConfirm({ isOpen: true, title, message, onConfirm: () => { callback(); handleCloseConfirm(); } });
  };

  const handleCloseConfirm = () => {
    setConfirm({ isOpen: false, title: "", message: "", onConfirm: null });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchUserProfile(token);
  }, []);

  // EFECTO CORE DE CARGA DE DATOS
  useEffect(() => {
    if (user) {
      fetchSystemUsers(); 
      if (activeTab === "loans" || activeTab === "calendar" || activeTab === "stats" || activeTab === "pdf_scans") {
        fetchLoans();
        fetchWorkers();
        if (activeTab === "pdf_scans") {
          fetchGlobalDocs();
        }
        if (activeTab === "calendar") {
          fetchAlertsSummary();
        }
      }
    }
  }, [user, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    const params = new URLSearchParams();
    params.append("username", email); params.append("password", password);
    try {
      const response = await axios.post("/auth/login", params, { headers: { "Content-Type": "application/x-www-form-urlencoded" }});
      localStorage.setItem("token", response.data.access_token);
      await fetchUserProfile(response.data.access_token);
    } catch (err) { setError("Credenciales incorrectas."); } finally { setLoading(false); }
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get("/users/me", { headers: { Authorization: `Bearer ${token}` }});
      setUser(response.data);
    } catch (err) { handleLogout(); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null); setWorkers([]); setRecordsLoaded(false); setChatHistory([]);
    handleCancelEdit(); handleCloseDocs(); setShowUserModal(false);
  };

  // GESTIÓN DE USUARIOS
  const fetchSystemUsers = async () => {
    try {
      const res = await axios.get("/users/", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});
      setSystemUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if(!newUserName || !newUserPassword) return alert("Faltan credenciales");
    try {
      await axios.post("/users/", { username: newUserName, password: newUserPassword, role: newUserRole });
      setUserSuccessMsg("Usuario creado exitosamente.");
      setTimeout(() => setUserSuccessMsg(""), 4000);
      setNewUserName(""); setNewUserPassword("");
      fetchSystemUsers();
    } catch (err) { alert("Error al crear usuario."); }
  };

  const handleDeleteUser = async (userId) => {
    if(userId === user.id) return showToast("No puedes eliminar tu propia sesión activa.", "warning");
    triggerConfirm(
      "Eliminar Acceso de Usuario",
      "¿Confirma la eliminación permanente de este usuario? Perderá acceso inmediato al sistema.",
      async () => {
        try {
          await axios.delete(`/users/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});
          showToast("Usuario eliminado correctamente.", "success");
          fetchSystemUsers();
        } catch(err) { showToast("Error al eliminar el usuario.", "error"); }
      }
    );
  };

  const handleOpenUserModal = () => { setShowUserModal(true); fetchSystemUsers(); };

  // EXPEDIENTES (BÓVEDA DIGITAL)
  const fetchWorkers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("/patients/", { headers: { Authorization: `Bearer ${token}` }});
      setWorkers(response.data); setRecordsLoaded(true); 
    } catch (err) { showToast("Error al cargar los registros desde el servidor.", "error"); }
  };

  const handleDigitalize = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formattedNotes = `[ESTADO: ${workStatus}] [DOCS: ${docStatus}] - ${archiveNotes}`;
    
    const workerData = {
      first_name: firstName, last_name: lastName, cedula, address,
      birth_date: entryDate, phone, email: workEmail || null, cargo: workCargo || null, medical_history: formattedNotes,
    };

    try {
      if (editingWorkerId) {
        await axios.put(`/patients/${editingWorkerId}`, workerData, { headers: { Authorization: `Bearer ${token}` }});
        showToast("Expediente modificado con éxito.", "success");
      } else {
        await axios.post("/patients/", workerData, { headers: { Authorization: `Bearer ${token}` }});
        showToast("Expediente digitalizado y guardado con éxito.", "success");
      }
      handleCancelEdit(); if (recordsLoaded) fetchWorkers();
    } catch (err) { showToast("Error al procesar el expediente. Cédula duplicada o campos inválidos.", "error"); }
  };

  // FASE 1: AUTO-REGISTRO INTELIGENTE (Crea expediente + primer documento desde un solo PDF)
  const handleAutoRegisterWorker = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsAutoRegistering(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/patients/auto-register", formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }});
      setAutoRegisterSuccessMsg("Expediente y documento registrados automáticamente con IA.");
      setTimeout(() => setAutoRegisterSuccessMsg(""), 4000);
      if (recordsLoaded) fetchWorkers();
    } catch (err) {
      showToast("Error al auto-registrar el expediente con IA.", "error");
    } finally {
      setIsAutoRegistering(false);
      if (autoRegisterInputRef.current) autoRegisterInputRef.current.value = "";
    }
  };

  const handleSelectEdit = (worker) => {
    setEditingWorkerId(worker.id); setFirstName(worker.first_name); setLastName(worker.last_name);
    setCedula(worker.cedula || ""); setAddress(worker.address || "");
    setEntryDate(worker.birth_date); setPhone(worker.phone || ""); setWorkEmail(worker.email || "");
    setWorkCargo(worker.cargo || "");
    
    const matches = worker.medical_history ? worker.medical_history.match(/^\[ESTADO: (.*?)\] \[DOCS: (.*?)\] - (.*)$/) : null;
    const oldMatches = worker.medical_history ? worker.medical_history.match(/^\[ESTADO: (.*?)\] - (.*)$/) : null;

    if (matches) { setWorkStatus(matches[1]); setDocStatus(matches[2]); setArchiveNotes(matches[3]); } 
    else if (oldMatches) { setWorkStatus(oldMatches[1]); setDocStatus("PENDIENTE"); setArchiveNotes(oldMatches[2]); } 
    else { setWorkStatus("ACTIVO"); setDocStatus("PENDIENTE"); setArchiveNotes(worker.medical_history || ""); }
  };

  const handleCancelEdit = () => {
    setEditingWorkerId(null); setFirstName(""); setLastName(""); setCedula(""); setAddress("");
    setEntryDate(""); setPhone(""); setWorkEmail(""); setWorkCargo(""); setWorkStatus("ACTIVO"); setDocStatus("COMPLETO"); setArchiveNotes("");
  };

  const handleDeleteWorker = async (workerId) => {
    triggerConfirm(
      "Eliminar Expediente",
      "¿Está seguro de eliminar permanentemente este expediente? Esta acción es irreversible.",
      async () => {
        try { 
          await axios.delete(`/patients/${workerId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}); 
          showToast("Expediente eliminado de la base de datos.", "success");
          fetchWorkers(); 
        } catch (err) { showToast("Error al intentar eliminar el expediente.", "error"); }
      }
    );
  };

  // --- FASE 2: BOTÓN "AUDITAR CON IA" EN BÓVEDA DIGITAL ---
  const handleAuditWorker = async (workerId) => {
    const token = localStorage.getItem("token");
    setAuditingWorkerId(workerId);
    try {
      const res = await axios.post(`/patients/${workerId}/audit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Actualizamos únicamente la tarjeta afectada
      setWorkers(prev => prev.map(w => w.id === workerId ? res.data : w));
      showToast("Auditoría de IA completada y estado de carpeta actualizado.", "success");
    } catch (err) {
      showToast("Error al ejecutar auditoría automática en el servidor.", "error");
    } finally {
      setAuditingWorkerId(null);
    }
  };

  // ARCHIVOS INDIVIDUALES POR TRABAJADOR
  const handleOpenDocs = (worker) => { setSelectedWorker(worker); setShowDocModal(true); fetchWorkerDocs(worker.id); };
  const handleCloseDocs = () => { setShowDocModal(false); setSelectedWorker(null); setWorkerDocs([]); setFileUpload(null); setFileDesc(""); };
  const fetchWorkerDocs = async (workerId) => {
    try { const res = await axios.get(`/patients/${workerId}/documents`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }); setWorkerDocs(res.data); } catch (err) {}
  };

  // FASE 4: ELIMINACIÓN PERMANENTE DE DOCUMENTOS (Disco + BD)
  const handleDeleteDocument = (documentId) => {
    triggerConfirm(
      "Eliminar Documento",
      "¿Confirma la eliminación permanente de este documento? Esta acción borrará el archivo del disco del servidor y no se puede deshacer.",
      async () => {
        try {
          await axios.delete(`/patients/documents/${documentId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
          showToast("Documento eliminado permanentemente.", "success");
          if (selectedWorker) fetchWorkerDocs(selectedWorker.id);
        } catch (err) {
          showToast("Error al eliminar el documento del servidor.", "error");
        }
      }
    );
  };

  // FASE 1: CARGA CONECTADA AL ENDPOINT REAL DE AUTO-CLASIFICACIÓN IA
  const handleUploadDoc = async (e) => {
    e.preventDefault(); if (!fileUpload) return showToast("Selecciona un archivo escaneado primero.", "warning");
    setIsUploading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", fileUpload);

    try {
      const res = await axios.post(`/patients/${selectedWorker.id}/documents/auto?mode=${scanAnalysisMode}`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }});
      // Actualizamos únicamente el estado local workerDocs con el documento devuelto por la IA
      setWorkerDocs(prev => [...prev, res.data]);
      setFileUpload(null); setFileDesc("");
      showToast(`Documento clasificado por IA como: ${res.data.category || "Otros"}.`, "success");
    } catch (err) { showToast("Error al procesar el archivo.", "error"); } finally { setIsUploading(false); }
  };

  // --- LÓGICA DE ESCANEO FÍSICO Y QR ---
  const handleConnectScanner = () => {
    setScannerConnected(!scannerConnected);
    showToast(scannerConnected ? "Escáner físico desconectado." : "Escáner USB 3.0 conectado correctamente.", "info");
  };

  const handleSimulateScan = () => {
    if(!scannerConnected) return showToast("Conecte el dispositivo físico de escáner primero.", "warning");
    if(!selectedPatientForScan) return showToast("Seleccione un expediente para asociar el escaneo.", "warning");
    
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const target = workers.find(w => w.id === parseInt(selectedPatientForScan));
      const mockName = `[${selectedScanCategory}] - Escaneo de ${selectedScanCategory} Oficial`;
      
      const newScan = {
        id: Date.now(),
        fileName: mockName,
        category: selectedScanCategory,
        workerName: target ? `${target.last_name}, ${target.first_name}` : "Externo",
        date: today,
        folder: scanFolderNum || "S/N",
        status: "COMPLETO",
        path: "uploads/mock_scanned.pdf"
      };

      setGlobalDocsList(prev => [newScan, ...prev]);
      setDigitalizationHistory(prev => [{ id: Date.now(), transcriptor: user.email, date: new Date().toLocaleString(), doc: selectedScanCategory, worker: target ? `${target.last_name}, ${target.first_name}` : "S/N" }, ...prev]);
      showToast("Foliado físico digitalizado con éxito mediante ADF.", "success");
    }, 2500);
  };

  const handleSimulateQR = () => {
    setIsScanningQR(true);
    setTimeout(() => {
      setIsScanningQR(false);
      const randomTarget = workers[Math.floor(Math.random() * workers.length)];
      if (randomTarget) {
        const fakeFolder = Math.floor(100 + Math.random() * 800).toString();
        setSelectedPatientForScan(randomTarget.id.toString());
        setScanFolderNum(fakeFolder);
        setQrInputManual(`SAD-TH-C${fakeFolder}`);
        showToast(`Código QR leído con éxito. Vinculado a: ${randomTarget.last_name}.`, "success");
      } else {
        showToast("No hay registros en bóveda para asociar QR.", "warning");
      }
    }, 2000);
  };

  // --- FASE 1: CONEXIÓN REAL DEL BOTÓN AL ENDPOINT /auto ---
  const handleManualUploadPDF = async (e) => {
    e.preventDefault();
    if(!selectedPatientForScan || !fileUpload) return showToast("Seleccione un expediente y el PDF.", "warning");

    setIsUploading(true);
    const token = localStorage.getItem("token");
    
    const formData = new FormData();
    formData.append("file", fileUpload);
    formData.append("description", fileDesc || `Digitalización de ${selectedScanCategory}`);
    formData.append("category", selectedScanCategory);
    formData.append("folder_number", scanFolderNum);
    formData.append("document_status", "digitalizado");
    formData.append("qr_code", qrInputManual || "");

    try {
      const res = await axios.post(`/patients/${selectedPatientForScan}/documents/auto`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      // Refrescamos el visor global (Fase 2)
      fetchGlobalDocs();
      
      setFileUpload(null); setFileDesc(""); setScanFolderNum(""); setQrInputManual("");
      showToast(`PDF indexado con éxito. Clasificado como: ${res.data.category}`, "success");
    } catch(err) {
      showToast("Error al subir el archivo al servidor.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // --- FASE 2: CONECTAR VISOR GLOBAL DE DOCUMENTOS REALES ---
  const fetchGlobalDocs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("/patients/documents/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGlobalDocsList(res.data);
    } catch (err) {
      console.error("Error al sincronizar documentos del servidor", err);
    }
  };

  // FASE 5: MODIFICAR METADATA DE DOCUMENTOS (Visor Global)
  const handleOpenEditDoc = (doc) => {
    setEditingDoc(doc);
    setEditDocCategory(doc.category || "");
    setEditDocFileName(doc.file_name || "");
    setEditDocStatus(doc.document_status || "");
    setShowEditDocModal(true);
  };

  const handleCloseEditDoc = () => {
    setShowEditDocModal(false); setEditingDoc(null); setEditDocCategory(""); setEditDocFileName(""); setEditDocStatus("");
  };

  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    if (!editingDoc) return;
    try {
      await axios.put(`/patients/documents/${editingDoc.id}`, {
        category: editDocCategory,
        file_name: editDocFileName,
        document_status: editDocStatus
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      showToast("Documento modificado con éxito.", "success");
      fetchGlobalDocs();
      handleCloseEditDoc();
    } catch (err) {
      showToast("Error al modificar la metadata del documento.", "error");
    }
  };

  // FASE 5: ELIMINAR DOCUMENTOS (Visor Global)
  const handleDeleteGlobalDocument = (documentId) => {
    triggerConfirm(
      "Eliminar Documento",
      "¿Confirma la eliminación permanente de este documento? Esta acción borrará el archivo del disco del servidor y no se puede deshacer.",
      async () => {
        try {
          await axios.delete(`/patients/documents/${documentId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
          showToast("Documento eliminado permanentemente.", "success");
          fetchGlobalDocs();
        } catch (err) {
          showToast("Error al eliminar el documento del servidor.", "error");
        }
      }
    );
  };

  // PRÉSTAMOS (MÓDULO REAL)
  const fetchLoans = async () => {
    try {
      const res = await axios.get("/loans/", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setLoans(res.data);
    } catch (err) { console.error(err); }
  };

  // FASE 6: CENTRO DE ALERTAS EN VIVO
  const fetchAlertsSummary = async () => {
    try {
      const res = await axios.get("/alerts/summary", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setAlertsSummary({
        overdue: res.data.overdue || [],
        due_soon: res.data.due_soon || [],
        purges: res.data.purges || []
      });
    } catch (err) {
      console.error("Error al sincronizar el centro de alertas", err);
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if(!selectedPatientId || !borrowerName || !expectedReturnDate) return showToast("Faltan datos del préstamo.", "warning");
    try {
      await axios.post("/loans/", {
        patient_id: parseInt(selectedPatientId),
        borrower_name: borrowerName,
        checkout_date: checkoutDate || today,
        expected_return_date: expectedReturnDate
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      showToast("Préstamo de carpeta física registrado.", "success");
      setBorrowerName(""); setSelectedPatientId(""); setExpectedReturnDate("");
      fetchLoans();
    } catch (err) {
      const backendDetail = err.response?.data?.detail;
      showToast(backendDetail || "Error al registrar préstamo.", "error");
    }
  };

  const handleReturnLoan = async (loanId) => {
    try {
      await axios.put(`/loans/${loanId}/return`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      showToast("Retorno de expediente físico procesado.", "success");
      fetchLoans();
    } catch (err) { showToast("Error al procesar el retorno.", "error"); }
  };

  // FASE 5: ELIMINACIÓN DE REGISTROS DE LA BITÁCORA DE PRÉSTAMOS
  const handleDeleteLoan = (loanId) => {
    triggerConfirm(
      "Eliminar Registro de Préstamo",
      "¿Confirma la eliminación permanente de este registro de la bitácora de préstamos? Esta acción no se puede deshacer.",
      async () => {
        try {
          await axios.delete(`/loans/${loanId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
          showToast("Registro de préstamo eliminado.", "success");
          fetchLoans();
        } catch (err) {
          showToast("Error al eliminar el registro de préstamo.", "error");
        }
      }
    );
  };

  // IMPRIMIR Y PDF
  const handlePrintCard = (worker) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Ficha - ${worker.first_name} ${worker.last_name}</title><style>body { font-family: Arial, sans-serif; padding: 30px; } h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;} .detail { margin-bottom: 15px; font-size: 16px; } .label { font-weight: bold; width: 150px; display: inline-block; color: #333;}</style></head>
      <body><h1>Ficha de Personal - SAD-TH</h1><div class="detail"><span class="label">Nombres:</span> ${worker.first_name}</div><div class="detail"><span class="label">Apellidos:</span> ${worker.last_name}</div><div class="detail"><span class="label">Cédula:</span> ${worker.cedula}</div><div class="detail"><span class="label">Cargo:</span> ${worker.cargo || "No especificado"}</div><div class="detail"><span class="label">F. Ingreso:</span> ${worker.birth_date}</div><div class="detail"><span class="label">Teléfono:</span> ${worker.phone || "N/A"}</div><div class="detail"><span class="label">Dirección:</span> ${worker.address || "N/A"}</div><div class="detail"><span class="label">Observaciones:</span> ${worker.medical_history || "N/A"}</div><script>window.onload = function() { window.print(); window.close(); }</script></body></html>
    `); printWindow.document.close();
  };

  const handleExportIndividualPDF = (worker) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, pageWidth, 25, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SAD-TH | SISTEMA DE ARCHIVO DIGITAL", 15, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("HOSPITAL GENERAL DEL SUR - TALENTO HUMANO", pageWidth - 15, 16, { align: "right" });

    doc.setDrawColor(20, 184, 166);
    doc.setLineWidth(1.5);
    doc.line(0, 25, pageWidth, 25);

    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("FICHA INDIVIDUAL DEL TRABAJADOR", 15, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, pageWidth - 15, 42, { align: "right" });

    const drawSectionHeader = (title, y) => {
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, pageWidth - 30, 8, "F");
      doc.setTextColor(13, 148, 136);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(title.toUpperCase(), 18, y + 6);
    };

    drawSectionHeader("1. Datos de Identidad y Registro", 52);
    doc.setFontSize(10); doc.setTextColor(71, 85, 105);

    doc.setFont("helvetica", "bold"); doc.text("Nombres del Empleado:", 20, 70);
    doc.setFont("helvetica", "normal"); doc.text(`${worker.first_name}`, 65, 70);

    doc.setFont("helvetica", "bold"); doc.text("Apellidos del Empleado:", 20, 78);
    doc.setFont("helvetica", "normal"); doc.text(`${worker.last_name}`, 65, 78);

    doc.setFont("helvetica", "bold"); doc.text("Cédula de Identidad:", 20, 86);
    doc.setFont("helvetica", "bold"); doc.setTextColor(13, 148, 136);
    doc.text(`${worker.cedula}`, 65, 86);

    doc.setFont("helvetica", "bold"); doc.setTextColor(71, 85, 105);
    doc.text("Cargo / Posición:", 20, 94);
    doc.setFont("helvetica", "normal"); doc.text(`${worker.cargo || "No especificado"}`, 65, 94);

    drawSectionHeader("2. Información de Contacto y Ubicación", 102);
    doc.setTextColor(71, 85, 105);

    doc.setFont("helvetica", "bold"); doc.text("Teléfono Celular:", 20, 120);
    doc.setFont("helvetica", "normal"); doc.text(`${worker.phone || "No registrado"}`, 65, 120);

    doc.setFont("helvetica", "bold"); doc.text("Correo Electrónico:", 20, 128);
    doc.setFont("helvetica", "normal"); doc.text(`${worker.email || "No registrado"}`, 65, 128);

    doc.setFont("helvetica", "bold"); doc.text("Dirección de Habitación:", 20, 136);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(worker.address || "No registrada", 125);
    doc.text(addressLines, 65, 136);

    drawSectionHeader("3. Estatus de Expediente y Control Físico", 154);
    doc.setTextColor(71, 85, 105);

    doc.setFont("helvetica", "bold"); doc.text("Fecha de Ingreso:", 20, 172);
    doc.setFont("helvetica", "normal"); doc.text(`${worker.birth_date}`, 65, 172);

    const fullMatch = worker.medical_history ? worker.medical_history.match(/^\[ESTADO: (.*?)\] \[DOCS: (.*?)\] - (.*)$/) : null;
    const partialMatch = worker.medical_history ? worker.medical_history.match(/^\[ESTADO: (.*?)\] - (.*)$/) : null;

    let workStatus = "ACTIVO", docStatusPdf = "PENDIENTE", notes = worker.medical_history || "Sin observaciones.";
    if (fullMatch) {
      workStatus = fullMatch[1];
      docStatusPdf = fullMatch[2];
      notes = fullMatch[3];
    } else if (partialMatch) {
      workStatus = partialMatch[1];
      notes = partialMatch[2];
    }

    doc.setFont("helvetica", "bold"); doc.text("Estatus Laboral:", 20, 180);
    doc.setFont("helvetica", "normal"); doc.text(workStatus, 65, 180);

    doc.setFont("helvetica", "bold"); doc.text("Estatus Documental:", 20, 188);
    doc.setFont("helvetica", "bold");
    if (docStatusPdf === "COMPLETO") doc.setTextColor(16, 185, 129);
    else if (docStatusPdf === "CRITICO") doc.setTextColor(239, 68, 68);
    else doc.setTextColor(245, 158, 11);
    doc.text(docStatusPdf, 65, 188);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 198, pageWidth - 40, 42, "FD");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Bitácora de Observaciones Físicas y Documentos Faltantes:", 24, 206);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const notesLines = doc.splitTextToSize(notes, pageWidth - 48);
    doc.text(notesLines, 24, 214);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Documento confidencial generado por SAD-TH para uso exclusivo del Hospital General del Sur.", pageWidth / 2, 280, { align: "center" });

    doc.save(`Ficha_SAD-TH_${worker.cedula}.pdf`);
  };

  // --- FILTROS DE EXPEDIENTES (CONSOLIDADOS) ---
  const filteredWorkersList = workers.filter((w) => {
    const query = searchQuery.toLowerCase();
    return (`${w.first_name} ${w.last_name}`.toLowerCase().includes(query) || (w.cedula && w.cedula.toLowerCase().includes(query)));
  });

  const exportToPDF = () => { const doc = new jsPDF(); doc.text("Reporte General", 14, 15); const tableRows = filteredWorkersList.map(w => [w.cedula, w.first_name, w.last_name, w.birth_date, w.phone || "N/A"]); doc.autoTable({ head: [["Cédula", "Nombre", "Apellido", "F. Ingreso", "Teléfono"]], body: tableRows, startY: 20 }); doc.save("Reporte_SAD-TH.pdf"); };
  const exportToExcel = () => { const ws = XLSX.utils.json_to_sheet(filteredWorkersList.map(w => ({ "Nombres": w.first_name, "Cédula": w.cedula }))); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Expedientes"); XLSX.writeFile(wb, "Reporte.xlsx"); };

  // --- FILTROS DE LA PESTAÑA "PDF ESCANEADOS" ---
  const filteredScannedDocsList = globalDocsList.filter(d => {
    const query = searchQuery.toLowerCase();
    
    const fileNameSafe = d.file_name ? d.file_name.toLowerCase() : "";
    const folderSafe = d.folder_number ? d.folder_number.toString() : "";
    
    // Obtener nombre del trabajador asociado
    const targetWorker = workers.find(w => w.id === d.patient_id);
    const workerNameSafe = targetWorker ? `${targetWorker.last_name}, ${targetWorker.first_name}`.toLowerCase() : "";

    const matchQuery = fileNameSafe.includes(query) || workerNameSafe.includes(query) || folderSafe.includes(query);
    const matchCategory = searchDocCategory === "TODAS" || d.category === searchDocCategory;
    const matchFolder = !searchDocFolder || folderSafe.includes(searchDocFolder);
    return matchQuery && matchCategory && matchFolder;
  });

  // --- CALCULAR ESTADO VISUAL DE CADA PRÉSTAMO (Verde, Amarillo, Rojo, Azul) ---
  const getLoanStatusAndColor = (loan) => {
    if (!loan || !loan.expected_return_date) {
      return { label: "ACTIVO", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", priority: "BAJA" };
    }
    if (loan.status === "DEVUELTO") {
      return { label: "DEVUELTO", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", priority: "BAJA" };
    }
    const tDate = new Date(); tDate.setHours(0,0,0,0);
    const lDate = new Date(loan.expected_return_date); lDate.setHours(0,0,0,0);
    const diff = lDate.getTime() - tDate.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: "VENCIDO", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", priority: "ALTA", delay: Math.abs(diffDays) };
    } else if (diffDays <= 2) {
      return { label: "PRÓXIMO A VENCER", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", priority: "MEDIA", remaining: diffDays };
    }
    return { label: "ACTIVO", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", priority: "BAJA" };
  };

  // --- CONSTRUCCIÓN DINÁMICA DE ALERTAS (FASE 6: fuente real /alerts/summary) ---
  const overdueAlerts = alertsSummary.overdue.map(l => {
    const worker = workers.find(w => w.id === l.patient_id);
    const lDate = new Date(l.expected_return_date); lDate.setHours(0,0,0,0);
    const tDate = new Date(); tDate.setHours(0,0,0,0);
    const delay = Math.abs(Math.ceil((lDate.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      id: `venc-${l.id}`,
      type: "VENCIDO",
      priority: "ALTA",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.08)",
      border: "#ef4444",
      title: `Préstamo Crítico: ${l.borrower_name}`,
      desc: `Tiene fuera de bóveda el expediente de ${worker ? `${worker.last_name}, ${worker.first_name}` : `ID: ${l.patient_id}`}${worker?.cedula ? ` (C.I: ${worker.cedula})` : ""}.`,
      meta: `Fecha límite venció el: ${l.expected_return_date} (${delay} días de retraso)`
    };
  });

  const dueSoonAlerts = alertsSummary.due_soon.map(l => {
    const worker = workers.find(w => w.id === l.patient_id);
    const lDate = new Date(l.expected_return_date); lDate.setHours(0,0,0,0);
    const tDate = new Date(); tDate.setHours(0,0,0,0);
    const remaining = Math.ceil((lDate.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      id: `prox-${l.id}`,
      type: "POR_VENCER",
      priority: "MEDIA",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.08)",
      border: "#f59e0b",
      title: `Préstamo por Vencer: ${l.borrower_name}`,
      desc: `Tiene el expediente de ${worker ? `${worker.last_name}, ${worker.first_name}` : `ID: ${l.patient_id}`}${worker?.cedula ? ` (C.I: ${worker.cedula})` : ""}.`,
      meta: `Debe retornar en: ${remaining <= 0 ? "Hoy" : `${remaining} días`} (${l.expected_return_date})`
    };
  });

  const expurgoAlerts = alertsSummary.purges.map(w => {
    const years = w.birth_date ? new Date().getFullYear() - new Date(w.birth_date).getFullYear() : "N/D";
    return {
      id: `exp-${w.id}`,
      type: "EXPURGO",
      priority: "BAJA",
      color: "#64748b",
      bg: "rgba(100, 116, 139, 0.1)",
      border: "#64748b",
      title: `Sugerencia de Expurgo: ${w.last_name}, ${w.first_name}`,
      desc: `La carpeta física (C.I: ${w.cedula}) cumplió ${years} años en archivo activo.`,
      meta: `Acción sugerida: Archivar en pasivo definitivo o destruir foliado innecesario.`
    };
  });

  const allAlerts = [...overdueAlerts, ...dueSoonAlerts, ...expurgoAlerts];

  const filteredAlerts = allAlerts.filter(a => {
    const matchType = alertTypeFilter === "TODAS" || a.type === alertTypeFilter;
    const matchPriority = alertPriorityFilter === "TODAS" || a.priority === alertPriorityFilter;
    return matchType && matchPriority;
  });

  // FILTROS DE PRÉSTAMOS
  const filteredLoans = loans.filter(l => {
    const query = loanSearchQuery.toLowerCase();
    const bName = l.borrower_name ? l.borrower_name.toLowerCase() : "";
    const pId = l.patient_id ? l.patient_id.toString() : "";
    const matchesQuery = bName.includes(query) || pId.includes(query);
    if (loanStatusFilter === "TODOS") return matchesQuery;
    if (loanStatusFilter === "ACTIVOS") return matchesQuery && l.status === "ACTIVO";
    if (loanStatusFilter === "DEVUELTOS") return matchesQuery && l.status === "DEVUELTO";
    return matchesQuery;
  });

  // --- CÁLCULOS PARA ESTADÍSTICAS ---
  const statsData = {
    total: workers.length,
    activos: workers.filter(w => w.medical_history?.includes('[ESTADO: ACTIVO]')).length,
    egresados: workers.filter(w => w.medical_history?.includes('[ESTADO: EGRESADO]')).length,
    seguroSocial: workers.filter(w => w.medical_history?.includes('[ESTADO: SEGURO SOCIAL]')).length,
    jubilados: workers.filter(w => w.medical_history?.includes('[ESTADO: JUBILADO]')).length,
    completos: workers.filter(w => w.medical_history?.includes('[DOCS: COMPLETO]')).length,
    pendientes: workers.filter(w => w.medical_history?.includes('[DOCS: PENDIENTE]') || w.medical_history?.includes('[DOCS: CRITICO]')).length,
  };

  const donutLaboral = [
    { label: 'Activos', value: statsData.activos, color: '#3b82f6' },
    { label: 'Egresados', value: statsData.egresados, color: '#8b5cf6' },
    { label: 'Seguro Social', value: statsData.seguroSocial, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  const donutDocumental = [
    { label: 'Completos', value: statsData.completos, color: '#10b981' },
    { label: 'Incompletos', value: statsData.pendientes, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <>
      <style>{globalCss}</style>
      <div style={styles.appContainer}>
        
        {/* === SATEFUL TOAST NOTIFICATION === */}
        {toast.isOpen && (
          <div style={{
            position: "fixed", bottom: "25px", right: "25px", backgroundColor: "#1e293b",
            borderLeft: `5px solid ${toast.type === "success" ? "#10b981" : toast.type === "error" ? "#ef4444" : toast.type === "warning" ? "#f59e0b" : "#3b82f6"}`,
            padding: "15px 20px", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 10000,
            display: "flex", alignItems: "center", gap: "12px", color: "#fff", minWidth: "320px", justifyContent: "space-between"
          }} className="modal-animate">
            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
              {toast.type === "success" && <CheckCircle size={18} color="#10b981" />}
              {toast.type === "error" && <ShieldAlert size={18} color="#ef4444" />}
              {toast.type === "warning" && <Clock size={18} color="#f59e0b" />}
              {toast.type === "info" && <File size={18} color="#3b82f6" />}
              <span style={{fontSize: "14px", fontWeight: "500"}}>{toast.message}</span>
            </div>
            <button onClick={() => setToast(prev => ({ ...prev, isOpen: false }))} style={{background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex"}}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* === STATEFUL CONFIRMATION MODAL === */}
        {confirm.isOpen && (
          <div style={{...styles.modalOverlay, zIndex: 10005}}> {/* <-- Z-Index elevado para quedar por encima del modal de Gestión de Accesos (9999) */}
            <div style={{...styles.modalContent, maxWidth: "420px"}} className="modal-animate">
              <div style={styles.modalHeader}>
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                  <ShieldAlert size={22} color="#f59e0b" />
                  <h3 style={styles.modalTitle}>{confirm.title}</h3>
                </div>
                <button onClick={handleCloseConfirm} style={styles.btnCancelEdit} className="btn-interactive"><X size={18} /></button>
              </div>
              <p style={{color: "#94a3b8", fontSize: "14px", margin: "10px 0", lineHeight: "1.5"}}>{confirm.message}</p>
              <div style={{display: "flex", gap: "10px", marginTop: "10px"}}>
                <button onClick={handleCloseConfirm} style={{...styles.btnPrimary, backgroundColor: "#334155", color: "#fff"}} className="btn-interactive">Cancelar</button>
                <button onClick={confirm.onConfirm} style={{...styles.btnPrimary, backgroundColor: "#ef4444"}} className="btn-interactive">Confirmar</button>
              </div>
            </div>
          </div>
        )}

        {/* FASE 5: MODAL DE MODIFICACIÓN DE METADATA (Visor Global "PDF Escaneados") */}
        {showEditDocModal && editingDoc && (
          <div style={styles.modalOverlay}>
            <div style={{...styles.modalContent, maxWidth: "420px"}} className="modal-animate">
              <div style={styles.modalHeader}>
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                  <Edit size={20} color="#3b82f6" />
                  <h3 style={styles.modalTitle}>Modificar Documento</h3>
                </div>
                <button onClick={handleCloseEditDoc} style={styles.btnCancelEdit} className="btn-interactive"><X size={18} /></button>
              </div>
              <form onSubmit={handleUpdateDocument} style={{display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px"}}>
                <div style={styles.inputGroup}>
                  <label style={{fontSize: "11px", color: "#94a3b8", marginLeft: "5px"}}>Nombre del Archivo</label>
                  <input type="text" value={editDocFileName} onChange={(e) => setEditDocFileName(e.target.value)} style={styles.formInput} className="input-interactive" required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={{fontSize: "11px", color: "#94a3b8", marginLeft: "5px"}}>Categoría</label>
                  <select value={editDocCategory} onChange={(e) => setEditDocCategory(e.target.value)} style={styles.formInput} className="input-interactive">
                    <option value="Cédula">Cédula</option>
                    <option value="Título">Título</option>
                    <option value="Contrato">Contrato</option>
                    <option value="Certificado Médico">Certificado Médico</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={{fontSize: "11px", color: "#94a3b8", marginLeft: "5px"}}>Estado Documental</label>
                  <select value={editDocStatus} onChange={(e) => setEditDocStatus(e.target.value)} style={styles.formInput} className="input-interactive">
                    <option value="digitalizado">Digitalizado</option>
                    <option value="COMPLETO">Completo</option>
                    <option value="PENDIENTE">Pendiente</option>
                  </select>
                </div>
                <div style={{display: "flex", gap: "10px", marginTop: "5px"}}>
                  <button type="button" onClick={handleCloseEditDoc} style={{...styles.btnPrimary, backgroundColor: "#334155", color: "#fff"}} className="btn-interactive">Cancelar</button>
                  <button type="submit" style={styles.btnPrimary} className="btn-interactive">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* === MODAL DE ARCHIVOS ESCANEADOS === */}
        {showDocModal && selectedWorker && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent} className="modal-animate">
              <div style={styles.modalHeader}>
                <div><h3 style={styles.modalTitle}>Archivos Escaneados</h3><p style={{margin: "3px 0 0 0", color: "#94a3b8", fontSize: "13px"}}>{selectedWorker.first_name} {selectedWorker.last_name}</p></div>
                <button onClick={handleCloseDocs} style={styles.btnCancelEdit} className="btn-interactive"><X size={20} /></button>
              </div>
              {user?.role === "ADMIN" && (
                <form onSubmit={handleUploadDoc} style={styles.uploadBox}>
                  <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
                    <input type="text" placeholder="Descripción (opcional)" value={fileDesc} onChange={(e) => setFileDesc(e.target.value)} style={styles.formInput} className="input-interactive" />
                    <input type="file" onChange={(e) => setFileUpload(e.target.files[0])} style={{color: "#94a3b8", fontSize: "13px", width: "180px"}} required />
                  </div>
                  {/* FASE 1: Toggle de Modo de Análisis IA */}
                  <div style={{display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8"}}>
                    <Bot size={14} color="#0d9488" /> <span>Modo de Análisis:</span>
                    <button type="button" onClick={() => setScanAnalysisMode("fast")} style={{padding: "4px 10px", borderRadius: "6px", border: "1px solid #334155", cursor: "pointer", fontSize: "12px", backgroundColor: scanAnalysisMode === "fast" ? "#0d9488" : "#1e293b", color: "#fff"}} className="btn-interactive">Rápido</button>
                    <button type="button" onClick={() => setScanAnalysisMode("full")} style={{padding: "4px 10px", borderRadius: "6px", border: "1px solid #334155", cursor: "pointer", fontSize: "12px", backgroundColor: scanAnalysisMode === "full" ? "#0d9488" : "#1e293b", color: "#fff"}} className="btn-interactive">Completo</button>
                  </div>
                  <button type="submit" style={{...styles.btnPrimary, display: "flex", justifyContent: "center", gap: "8px"}} className="btn-interactive" disabled={isUploading}><Upload size={16} /> {isUploading ? "Analizando con IA..." : "Subir Escaneo"}</button>
                </form>
              )}
              
              {/* --- FASE 3: DETALLE DOCUMENTAL CON METADATA ENRIQUECIDA NATIVA --- */}
              <div style={styles.docList}>
                {workerDocs.length === 0 ? <p style={{color: "#64748b", textAlign: "center", fontStyle: "italic", fontSize: "13px"}}>Sin archivos.</p> : 
                  workerDocs.map(doc => {
                    const uploader = systemUsers.find(u => u.id === doc.uploaded_by);
                    const uploaderName = uploader ? uploader.username : `ID: ${doc.uploaded_by}`;
                    return (
                      <div key={doc.id} style={{...styles.docItem, flexDirection: "column", alignItems: "stretch", gap: "6px"}}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                          <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                            <File size={16} color="#38bdf8" />
                            <span style={{fontSize: "14px", color: "#f1f5f9", fontWeight: "bold"}}>{doc.file_name}</span>
                          </div>
                          <div style={{display: "flex", gap: "6px", alignItems: "center"}}>
                            <a href={`/${doc.file_path}`} target="_blank" rel="noreferrer" style={styles.btnDocLink} className="btn-interactive"><ExternalLink size={14} /> Ver</a>
                            {user?.role === "ADMIN" && (
                              <button type="button" onClick={() => handleDeleteDocument(doc.id)} style={styles.btnActionIcon} className="btn-interactive btn-danger" title="Eliminar Documento"><Trash2 size={14} /></button>
                            )}
                          </div>
                        </div>
                        {/* FASE 3: Fila de metadata nativa debajo del título */}
                        <div style={{display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "#94a3b8", paddingLeft: "26px", borderTop: "1px dashed #1e293b", paddingTop: "6px"}}>
                          <span>📁 <strong>Cat:</strong> {doc.category}</span>
                          <span>📦 <strong>Carpeta:</strong> {doc.folder_number || "S/N"}</span>
                          <span>Estatus: <strong style={{color: doc.document_status === "COMPLETO" || doc.document_status === "digitalizado" ? "#10b981" : "#f59e0b"}}>{doc.document_status}</strong></span>
                          <span>👤 <strong>Por:</strong> {uploaderName}</span>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE GESTIÓN DE USUARIOS */}
        {showUserModal && (
          <div style={styles.modalOverlay}>
            <div style={{...styles.modalContent, maxWidth: "700px"}} className="modal-animate">
              <div style={styles.modalHeader}>
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}><Users size={24} color="#0d9488" /><h3 style={styles.modalTitle}>Gestión de Accesos</h3></div>
                <button onClick={() => setShowUserModal(false)} style={styles.btnCancelEdit} className="btn-interactive"><X size={20} /></button>
              </div>
              
              {userSuccessMsg && <div style={styles.alertSuccess}>{userSuccessMsg}</div>}

              <form onSubmit={handleCreateUser} style={{display: "flex", gap: "10px", marginBottom: "15px"}}>
                <input 
                  type="text" // <-- CAMBIADO: De "email" a "text"
                  placeholder="Nombre de usuario..." // <-- ACTUALIZADO: Más intuitivo
                  value={newUserName} 
                  onChange={e => setNewUserName(e.target.value)} // <-- CORREGIDO: "N" Mayúscula para evitar crasheos
                  style={styles.formInput} 
                  className="input-interactive" 
                  required
                />
                <input type="password" placeholder="Clave..." value={newUserPassword} onChange={e=>setNewUserPassword(e.target.value)} style={{...styles.formInput, width: "150px"}} className="input-interactive" required/>
                <select value={newUserRole} onChange={e=>setNewUserRole(e.target.value)} style={{...styles.formInput, width: "120px"}} className="input-interactive"><option value="GUEST">GUEST</option><option value="ADMIN">ADMIN</option></select>
                <button type="submit" style={{...styles.btnPrimary, width: "auto", display: "flex", gap: "5px", alignItems: "center"}} className="btn-interactive"><Plus size={16}/> Crear</button>
              </form>
              
              <div style={{backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155"}}>
                <div style={{display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: "1px solid #334155", color: "#94a3b8", fontSize: "13px", fontWeight: "bold"}}><span style={{flex: 2}}>Usuario</span><span style={{flex: 1}}>Rol</span><span style={{flex: 1, textAlign: "right"}}>Acciones</span></div>
                {systemUsers.map(su => (
                  <div key={su.id} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", borderBottom: "1px solid #1e293b"}}>
                    <span style={{flex: 2, color: "#fff", display: "flex", alignItems: "center", gap: "8px"}}>{su.id === user.id ? <CheckCircle size={16} color="#10b981"/> : <User size={16} color="#94a3b8"/>} {su.username}</span>
                    <span style={{flex: 1}}><span style={{...styles.userRoleBadge, backgroundColor: su.role === "ADMIN" ? "#0369a1" : "#475569"}}>{su.role}</span></span>
                    <div style={{flex: 1, textAlign: "right"}}><button onClick={() => handleDeleteUser(su.id)} style={{...styles.btnActionIcon, opacity: su.id === user.id ? 0.3 : 1}} className="btn-interactive btn-danger" disabled={su.id === user.id}><Trash2 size={14}/></button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!user ? (
          // === LOGIN ===
          <div style={styles.loginWrapper}>
            <form onSubmit={handleLogin} style={styles.loginCard} className="card-interactive">
              <div style={styles.loginHeader}><div style={styles.logoIconBg}><FolderArchive size={32} color="#0d9488" /></div><h2 style={styles.loginTitle}>SAD-TH</h2><p style={styles.loginSubtitle}>Sistema de Archivo Digital - Talento Humano</p></div>
              {error && <div style={styles.alertError}>{error}</div>}
              
              {/* --- LÍNEA MODIFICADA AQUÍ --- */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={styles.formInput} 
                  className="input-interactive" 
                  placeholder="Ej: jose_ochoa" 
                  required 
                />
              </div>
              {/* ----------------------------- */}

              <div style={styles.inputGroup}><label style={styles.inputLabel}>Clave de Acceso</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.formInput} className="input-interactive" required /></div>
              <button type="submit" style={styles.btnPrimary} className="btn-interactive" disabled={loading}>{loading ? "Autenticando..." : "Ingresar"}</button>
            </form>
          </div>
        ) : (
          // === DASHBOARD ===
          <div style={styles.dashboardContainer}>
            <header style={styles.header}>
              <div style={styles.brand}><FolderArchive size={28} color="#0d9488" /><span style={styles.brandText}>SAD-TH / ARCHIVO GENERAL</span></div>
              <div style={styles.userInfo}><div style={styles.avatar}><User size={18} color="#0d9488" /></div><div style={styles.userDetail}><span style={styles.userName}>{user.email}</span><span style={styles.userRoleBadge}>{user.role}</span></div><button onClick={handleLogout} style={styles.btnLogout} className="btn-interactive" title="Cerrar Sesión"><LogOut size={18} /></button></div>
            </header>

            {/* BARRA DE PESTAÑAS (Asistente IA deshabilitado visualmente) */}
            <div style={styles.tabBar}>
              {[
                { id: "archive", icon: <FolderArchive size={16} />, label: "Digitalización" },
                { id: "pdf_scans", icon: <Images size={16} />, label: "PDF Escaneados" }, 
                { id: "loans", icon: <ArrowRightLeft size={16} />, label: "Préstamos" },
                { id: "calendar", icon: <ShieldAlert size={16} />, label: "Alertas" },
                { id: "stats", icon: <PieChart size={16} />, label: "Estadísticas" },
                ...(user.role === "ADMIN" ? [{ id: "settings", icon: <Settings size={16} />, label: "Configuración" }] : [])
                // Omitimos "ai" visualmente, toda su lógica y estados permanecen intactos abajo
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="tab-item"
                  style={{ ...styles.tabLink, borderBottom: activeTab === tab.id ? "3px solid #0d9488" : "3px solid transparent", color: activeTab === tab.id ? "#fff" : "#64748b" }} >
                  <span style={{marginRight: "6px", display: "flex"}}>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* PESTAÑA 1: DIGITALIZACIÓN */}
            {activeTab === "archive" && (
              <div style={styles.splitLayout}>
                {user.role === "ADMIN" ? (
                  <div style={styles.leftCol}>
                    <form onSubmit={handleDigitalize} style={{...styles.medicalForm, border: editingWorkerId ? "2px solid #0d9488" : "1px solid #1e293b"}}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <h3 style={{...styles.sectionTitle, margin: 0, color: editingWorkerId ? "#0d9488" : "#fff"}}>{editingWorkerId ? <Edit size={18} style={{marginRight: "8px"}} /> : <Plus size={18} style={{marginRight: "8px"}} />} {editingWorkerId ? `Modificando ID: ${editingWorkerId}` : "Ingreso de Carpeta"}</h3>
                        {editingWorkerId && (<button type="button" onClick={handleCancelEdit} style={styles.btnCancelEdit} className="btn-interactive btn-danger"><X size={16} /></button>)}
                      </div>
                      <div style={styles.grid2Col}>
                        <input type="text" placeholder="Nombres" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={styles.formInput} className="input-interactive" required />
                        <input type="text" placeholder="Apellidos" value={lastName} onChange={(e) => setLastName(e.target.value)} style={styles.formInput} className="input-interactive" required />
                      </div>
                      <div style={styles.inputWithIcon}><CreditCard size={16} style={styles.innerIcon} /><input type="text" placeholder="Cédula (Ej: V-12345678)" value={cedula} onChange={(e) => setCedula(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} className="input-interactive" required /></div>
                      <div style={styles.inputWithIcon}><Mail size={16} style={styles.innerIcon} /><input type="email" placeholder="Correo Electrónico" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} className="input-interactive" /></div>
                      <div style={styles.grid2Col}>
                        <div style={styles.inputWithIcon}><Calendar size={16} style={styles.innerIcon} /><input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} className="input-interactive" required /></div>
                        <div style={styles.inputWithIcon}><Phone size={16} style={styles.innerIcon} /><input type="text" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} className="input-interactive" /></div>
                      </div>
                      <div style={styles.inputWithIcon}><MapPin size={16} style={styles.innerIcon} /><input type="text" placeholder="Dirección Completa" value={address} onChange={(e) => setAddress(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} className="input-interactive" /></div>
                      <div style={styles.inputWithIcon}><Briefcase size={16} style={styles.innerIcon} /><input type="text" placeholder="Cargo / Posición Laboral" value={workCargo} onChange={(e) => setWorkCargo(e.target.value)} style={{...styles.formInput, paddingLeft: "35px"}} className="input-interactive" /></div>
                      
                      <div style={styles.grid2Col}>
                        <div style={styles.inputGroup}>
                          <label style={{fontSize:"11px", color:"#94a3b8", marginLeft:"5px"}}>Estatus Laboral</label>
                          <select value={workStatus} onChange={(e) => setWorkStatus(e.target.value)} style={styles.formInput} className="input-interactive">
                            <option value="ACTIVO">ACTIVO</option><option value="EGRESADO">EGRESADO</option><option value="SEGURO SOCIAL">SEGURO SOCIAL</option><option value="JUBILADO">JUBILADO</option><option value="VACACIONES">VACACIONES</option><option value="FALLECIDO">FALLECIDO</option>
                          </select>
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={{fontSize:"11px", color:"#94a3b8", marginLeft:"5px"}}>Estado Documental</label>
                          <select value={docStatus} onChange={(e) => setDocStatus(e.target.value)} style={styles.formInput} className="input-interactive">
                            <option value="COMPLETO">Expediente Completo</option><option value="PENDIENTE">Faltan Documentos</option><option value="CRITICO">Faltan Docs. Críticos</option>
                          </select>
                        </div>
                      </div>

                      <div style={styles.inputWithIcon}>
                        <FileText size={16} style={{...styles.innerIcon, top: "15px"}} />
                        <textarea placeholder="Faltan copias de cédula..." value={archiveNotes} onChange={(e) => setArchiveNotes(e.target.value)} style={{...styles.formInput, height: "70px", paddingLeft: "35px", paddingTop: "10px"}} className="input-interactive" required />
                      </div>
                      {autoRegisterSuccessMsg && <div style={styles.alertSuccess}>{autoRegisterSuccessMsg}</div>}
                      <div style={{display: "flex", gap: "10px"}}>
                        <button type="submit" style={{...styles.btnPrimary, backgroundColor: editingWorkerId ? "#0f766e" : "#0d9488"}} className="btn-interactive">{editingWorkerId ? "Guardar Cambios" : "Guardar Expediente"}</button>
                        {!editingWorkerId && (
                          <button type="button" onClick={() => autoRegisterInputRef.current && autoRegisterInputRef.current.click()} style={{...styles.btnPrimary, backgroundColor: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"}} className="btn-interactive" disabled={isAutoRegistering} title="Crea el expediente automáticamente a partir de un PDF/Imagen escaneado">
                            <Upload size={16} /> {isAutoRegistering ? "Analizando con Llama 4..." : "Subir Carpeta Escaneada"}
                          </button>
                        )}
                        <input type="file" ref={autoRegisterInputRef} onChange={handleAutoRegisterWorker} accept=".pdf,image/*" style={{display: "none"}} />
                      </div>
                    </form>
                  </div>
                ) : (
                  <div style={styles.leftCol}><div style={styles.guestAlert}><ShieldAlert size={24} color="#f59e0b" style={{marginBottom: "10px"}} /><p style={{margin: 0, fontWeight: "bold"}}>Modo Consulta (Invitado)</p></div></div>
                )}

                <div style={styles.rightCol}>
                  <div style={styles.searchHeader}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "10px"}}>
                      <h3 style={{margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "10px"}}>Bóveda Digital {recordsLoaded && <span style={styles.recordBadge}>{filteredWorkersList.length} Registros</span>}</h3>
                      <div style={{display: "flex", gap: "8px"}}>
                        {recordsLoaded && filteredWorkersList.length > 0 && (<><button onClick={exportToPDF} style={styles.btnExport} className="btn-interactive"><FileDown size={14} color="#ef4444" /> Lista</button><button onClick={exportToExcel} style={styles.btnExport} className="btn-interactive"><FileSpreadsheet size={14} color="#10b981" /> Excel</button></>)}
                        <button onClick={fetchWorkers} style={styles.btnLoadRecords} className="btn-interactive"><RefreshCw size={14} style={{marginRight: "6px"}} /> Sincronizar</button>
                      </div>
                    </div>
                    {recordsLoaded && (<div style={styles.searchBarWrapper}><Search size={16} style={styles.searchIcon} /><input type="text" placeholder="Buscar por Cédula o Nombre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInputField} className="input-interactive" /></div>)}
                  </div>

                  <div style={styles.patientsFeed}>
                    {!recordsLoaded ? (
                      <div style={styles.placeholderBox}><FolderArchive size={40} color="#334155" style={{marginBottom: "10px"}} /><p style={{margin: 0, color: "#94a3b8", fontWeight: "bold"}}>Bóveda Cerrada</p></div>
                    ) : filteredWorkersList.map((w) => {
                        const fullMatch = w.medical_history ? w.medical_history.match(/^\[ESTADO: (.*?)\] \[DOCS: (.*?)\] - (.*)$/) : null;
                        const partialMatch = w.medical_history ? w.medical_history.match(/^\[ESTADO: (.*?)\] - (.*)$/) : null;
                        
                        let status = "N/A", docSt = "PENDIENTE", notes = w.medical_history;
                        if (fullMatch) { status = fullMatch[1]; docSt = fullMatch[2]; notes = fullMatch[3]; }
                        else if (partialMatch) { status = partialMatch[1]; docSt = "PENDIENTE"; notes = partialMatch[2]; }

                        const getDocColor = (s) => {
                          if(s === "COMPLETO") return { bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", text: "#34d399", icon: <CheckCircle size={14}/> };
                          if(s === "CRITICO") return { bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", text: "#f87171", icon: <ShieldAlert size={14}/> };
                          return { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", text: "#fbbf24", icon: <Clock size={14}/> };
                        };
                        const dColor = getDocColor(docSt);

                        return (
                          <div key={w.id} style={styles.medicalCard} className="card-interactive">
                            <div style={styles.cardHeader}>
                              <h4 style={styles.patientName}>{w.first_name} {w.last_name}</h4>
                              <span style={{ ...styles.patientIdBadge, backgroundColor: status === "ACTIVO" ? "#0ea5e9" : status === "EGRESADO" ? "#8b5cf6" : status === "SEGURO SOCIAL" ? "#f43f5e" : "#475569" }}>{status}</span>
                            </div>
                            <div style={styles.cardDetails}>
                              <div style={styles.detailRow}><CreditCard size={14} color="#0d9488" /> <span><strong>Cédula:</strong> {w.cedula}</span></div>
                              <div style={styles.detailRow}><Briefcase size={14} color="#0d9488" /> <span><strong>Cargo:</strong> {w.cargo || "No especificado"}</span></div>
                              {w.email && <div style={styles.detailRow}><Mail size={14} color="#0d9488" /> <span><strong>Email:</strong> {w.email}</span></div>}
                              <div style={{display: "flex", flexDirection: "column", gap: "5px", padding: "10px", backgroundColor: dColor.bg, borderLeft: `3px solid ${dColor.border}`, borderRadius: "4px", marginTop: "8px"}}>
                                <div style={{display: "flex", alignItems: "center", gap: "6px", color: dColor.text, fontWeight: "bold", fontSize: "12px"}}>{dColor.icon} {docSt === "COMPLETO" ? "Expediente Completo" : docSt === "CRITICO" ? "Faltan Documentos Críticos" : "Documentos Pendientes"}</div>
                                <p style={{margin: 0, color: "#cbd5e1", fontSize: "13px"}}>{notes}</p>
                              </div>
                            </div>
                            <div style={styles.cardActionsBar}>
                              <div style={{display: "flex", gap: "6px"}}>
                                <button onClick={() => handleOpenDocs(w)} style={styles.btnActionSecondary} className="btn-interactive btn-info" title="Ver Archivos Físicos"><Paperclip size={14} /> Archivos</button>
                                <button onClick={() => handlePrintCard(w)} style={styles.btnActionSecondary} className="btn-interactive btn-print-ficha" title="Imprimir Plantilla"><Printer size={14} /> Ficha</button>
                                <button onClick={() => handleExportIndividualPDF(w)} style={styles.btnActionSecondary} className="btn-interactive btn-pdf-soft" title="Descargar PDF Indiv."><FileDown size={14} /> PDF</button>
                                {user.role === "ADMIN" && (
                                  <button onClick={() => handleAuditWorker(w.id)} style={styles.btnActionSecondary} className="btn-interactive btn-ai-audit" title="Auditar Expediente con IA" disabled={auditingWorkerId === w.id}>
                                    <Brain size={14} /> {auditingWorkerId === w.id ? "Auditando..." : "Auditar con IA"}
                                  </button>
                                )}
                              </div>
                              {user.role === "ADMIN" && (
                                <div style={{display: "flex", gap: "6px"}}>
                                  <button onClick={() => handleSelectEdit(w)} style={styles.btnActionIcon} className="btn-interactive btn-info"><Edit size={14} /></button>
                                  <button onClick={() => handleDeleteWorker(w.id)} style={styles.btnActionIcon} className="btn-interactive btn-danger"><Trash2 size={14} /></button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA "PDF ESCANEADOS" */}
            {activeTab === "pdf_scans" && (
              <div style={styles.splitLayout}>
                <div style={styles.leftCol}>
                  <div style={styles.medicalForm}>
                    <h3 style={{...styles.sectionTitle, color: "#10b981", margin: 0}}>
                      <Upload size={18} style={{marginRight: "8px"}} /> Terminal de Escáner
                    </h3>
                    
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", padding: "10px 15px", borderRadius: "8px", border: "1px solid #334155"}}>
                      <span style={{fontSize: "13px", color: "#94a3b8"}}>Estado del Dispositivo:</span>
                      <span style={{fontSize: "12px", padding: "3px 10px", borderRadius: "10px", fontWeight: "bold", backgroundColor: scannerConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: scannerConnected ? "#34d399" : "#f87171"}}>
                        {scannerConnected ? "CONECTADO" : "DESCONECTADO"}
                      </span>
                    </div>

                    <div style={styles.grid2Col}>
                      <button type="button" onClick={handleConnectScanner} style={{...styles.btnPrimary, backgroundColor: "#334155", color: "#fff"}} className="btn-interactive">
                        {scannerConnected ? "Desconectar" : "Conectar Escáner"}
                      </button>
                      <button type="button" onClick={handleSimulateScan} style={{...styles.btnPrimary, backgroundColor: "#10b981"}} className="btn-interactive" disabled={isScanning}>
                        {isScanning ? "Escaneando..." : "Escanear Físico"}
                      </button>
                    </div>

                    <div style={{position: "relative", height: "160px", backgroundColor: "#0f172a", borderRadius: "8px", border: "1px dashed #334155", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden"}}>
                      {isScanning ? (
                        <>
                          <Clock size={32} color="#10b981" className="btn-interactive" style={{animation: "spin 2s linear infinite"}} />
                          <span style={{fontSize: "13px", color: "#94a3b8", marginTop: "10px"}}>ADF Procesando Hojas...</span>
                        </>
                      ) : isScanningQR ? (
                        <>
                          <QrCode size={32} color="#10b981" style={{animation: "pulse 1.5s infinite"}} />
                          <span style={{fontSize: "13px", color: "#94a3b8", marginTop: "10px"}}>Escaneando Código QR de Carpeta...</span>
                        </>
                      ) : (
                        <>
                          <Eye size={32} color="#334155" />
                          <span style={{fontSize: "13px", color: "#64748b", marginTop: "10px"}}>Cámara de alineación lista</span>
                        </>
                      )}
                    </div>

                    <button type="button" onClick={handleSimulateQR} style={{...styles.btnPrimary, backgroundColor: "#8b5cf6"}} className="btn-interactive">
                      Asociar vía Código QR
                    </button>
                  </div>

                  {/* FASE 1: ACTUALIZACIÓN FORM DATA DEL MANUAL CON METADATA NATIVA */}
                  <form onSubmit={handleManualUploadPDF} style={{...styles.medicalForm, marginTop: "20px", border: "1px solid #1e293b"}}>
                    <h4 style={{margin: "0 0 10px 0", color: "#fff", fontSize: "14px"}}>Asociación Manual de PDF</h4>
                    <select value={selectedPatientForScan} onChange={e=>setSelectedPatientForScan(e.target.value)} style={styles.formInput} className="input-interactive" required>
                      <option value="">Seleccionar Expediente...</option>
                      {workers.map(w => (
                        <option key={w.id} value={w.id}>{w.last_name}, {w.first_name} ({w.cedula})</option>
                      ))}
                    </select>
                    <div style={styles.grid2Col}>
                      <select value={selectedScanCategory} onChange={e=>setSelectedCategory(e.target.value)} style={styles.formInput} className="input-interactive">
                        <option value="Cédula">Cédula</option>
                        <option value="Contrato">Contrato</option>
                        <option value="Constancia">Constancia</option>
                        <option value="Certificado">Certificado</option>
                        <option value="Título">Título</option>
                        <option value="Seguro Social">Seguro Social</option>
                      </select>
                      <input type="text" placeholder="Carpeta Nro." value={scanFolderNum} onChange={e=>setScanFolderNum(e.target.value)} style={styles.formInput} className="input-interactive" required />
                    </div>
                    <input type="file" onChange={e=>setFileUpload(e.target.files[0])} style={{color: "#94a3b8", fontSize: "13px"}} required />
                    <button type="submit" style={styles.btnPrimary} className="btn-interactive" disabled={isUploading}>Indexar Documento PDF</button>
                  </form>
                </div>

                <div style={styles.rightCol}>
                  <div style={styles.searchHeader}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                      <h3 style={{margin: 0, fontSize: "16px", display: "flex", gap: "10px", alignItems: "center"}}>
                        Bóveda Documental
                        <span style={styles.recordBadge}>{filteredScannedDocsList.length} PDFs</span>
                      </h3>
                      
                      {/* Filtros avanzados de documentos */}
                      <div style={{display: "flex", gap: "5px"}}>
                        <select value={searchDocCategory} onChange={e=>setSearchDocCategory(e.target.value)} style={{...styles.formInput, width: "130px", padding: "5px"}} className="input-interactive">
                          <option value="TODAS">Categorías</option>
                          <option value="Cédula">Cédula</option>
                          <option value="Contrato">Contrato</option>
                          <option value="Seguro Social">Seguro Social</option>
                          <option value="Egresado">Egresado</option>
                        </select>
                      </div>
                    </div>
                    <div style={styles.searchBarWrapper}>
                      <Search size={16} style={styles.searchIcon} />
                      <input type="text" placeholder="Buscar por Nombre del Trabajador..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={styles.searchInputField} className="input-interactive" />
                    </div>
                  </div>

                  {/* FASE 2: CONECTAR VISOR GLOBAL DE DOCUMENTOS REALES */}
                  <div style={styles.patientsFeed}>
                    {filteredScannedDocsList.map(doc => {
                      const targetWorker = workers.find(w => w.id === doc.patient_id);
                      const workerName = targetWorker ? `${targetWorker.last_name}, ${targetWorker.first_name}` : `ID: ${doc.patient_id}`;
                      const uploader = systemUsers.find(u => u.id === doc.uploaded_by);
                      const uploaderName = uploader ? uploader.username : `ID: ${doc.uploaded_by}`;
                      
                      return (
                        <div key={doc.id} style={{...styles.medicalCard, borderLeft: "4px solid #3b82f6"}} className="card-interactive">
                          <div style={styles.cardHeader}>
                            <h4 style={styles.patientName}>{doc.file_name}</h4>
                            <span style={{...styles.patientIdBadge, backgroundColor: "#3b82f6"}}>{doc.category}</span>
                          </div>
                          <div style={styles.cardDetails}>
                            <div style={styles.detailRow}><User size={14} color="#3b82f6" /> <span><strong>Trabajador:</strong> {workerName}</span></div>
                            <div style={styles.detailRow}><CreditCard size={14} color="#3b82f6" /> <span><strong>Cédula:</strong> {targetWorker ? targetWorker.cedula : "N/D"}</span></div>
                            <div style={styles.detailRow}><FolderArchive size={14} color="#3b82f6" /> <span><strong>Ubicación Física:</strong> Carpeta Nro. {doc.folder_number || "S/N"}</span></div>
                            <div style={styles.detailRow}><Clock size={14} color="#3b82f6" /> <span><strong>Digitalizado el:</strong> {new Date(doc.uploaded_at).toLocaleDateString()}</span></div>
                            <div style={styles.detailRow}><CheckCircle size={14} color="#3b82f6" /> <span><strong>Estatus:</strong> {doc.document_status}</span></div>
                            <div style={styles.detailRow}><User size={14} color="#3b82f6" /> <span><strong>Por:</strong> {uploaderName}</span></div>
                          </div>
                          <div style={{...styles.cardActionsBar, marginTop: "10px", paddingTop: "10px"}}>
                            <a href={`/${doc.file_path}`} target="_blank" rel="noreferrer" style={styles.btnDocLink} className="btn-interactive">
                              <Eye size={14} /> Ver PDF
                            </a>
                            {user.role === "ADMIN" && (
                              <div style={{display: "flex", gap: "6px"}}>
                                <button onClick={() => handleOpenEditDoc(doc)} style={styles.btnActionIcon} className="btn-interactive btn-info" title="Modificar Metadata"><Edit size={14} /></button>
                                <button onClick={() => handleDeleteGlobalDocument(doc.id)} style={styles.btnActionIcon} className="btn-interactive btn-danger" title="Eliminar Documento"><Trash2 size={14} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Historial de Digitalización en vivo */}
                  <div style={{...styles.medicalForm, marginTop: "20px"}}>
                    <h4 style={{margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: "8px"}}><Clock size={16} color="#10b981"/> Historial de Digitalización Reciente</h4>
                    <div style={{display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px"}}>
                      {digitalizationHistory.map(h => (
                        <div key={h.id} style={{fontSize: "12.5px", color: "#94a3b8", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: "5px"}}>
                          <span>{h.date} - <strong>{h.transcriptor}</strong> digitalizó <strong>{h.doc}</strong> de {h.worker}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* PESTAÑA 2: PRÉSTAMOS */}
            {activeTab === "loans" && (
              <div style={styles.splitLayout}>
                <div style={styles.leftCol}>
                  <form onSubmit={handleCreateLoan} style={{...styles.medicalForm, border: "1px solid #1e293b"}}>
                    <h3 style={styles.sectionTitle}><RefreshCw size={18} style={{marginRight: "8px"}} /> Registrar Salida</h3>
                    <div style={styles.inputGroup}><label style={styles.inputLabel}>Funcionario Solicitante / Dpto.</label><input type="text" placeholder="Ej: Dr. Ramírez (Legal)" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} style={styles.formInput} className="input-interactive" required /></div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>Expediente Requerido</label>
                      <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} style={styles.formInput} className="input-interactive" required>
                        <option value="">-- Seleccionar Trabajador --</option>
                        {workers.map(w => (
                          <option key={w.id} value={w.id}>{w.last_name}, {w.first_name} ({w.cedula})</option>
                        ))}
                      </select>
                    </div>
                    <div style={styles.grid2Col}>
                      <div style={styles.inputGroup}><label style={styles.inputLabel}>Fecha de Salida</label><input type="date" value={checkoutDate || today} onChange={(e) => setCheckoutDate(e.target.value)} style={styles.formInput} className="input-interactive" required /></div>
                      <div style={styles.inputGroup}><label style={styles.inputLabel}>Retorno Esperado</label><input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} style={styles.formInput} className="input-interactive" required /></div>
                    </div>
                    <button type="submit" style={styles.btnPrimary} className="btn-interactive">Procesar Préstamo</button>
                  </form>
                  <div style={{...styles.medicalForm, marginTop: "20px", border: "1px solid #1e293b"}}>
                    <h4 style={{margin: "0 0 10px 0", color: "#fff", fontSize: "14px"}}>Filtros Avanzados</h4>
                    <input type="text" placeholder="Filtrar por solicitante..." value={loanSearchQuery} onChange={(e) => setLoanSearchQuery(e.target.value)} style={{...styles.formInput, marginBottom: "10px"}} className="input-interactive" />
                    <select value={loanStatusFilter} onChange={(e) => setLoanStatusFilter(e.target.value)} style={styles.formInput} className="input-interactive">
                      <option value="TODOS">Todos los Estados</option>
                      <option value="ACTIVOS">ACTIVOS (Fuera de Bóveda)</option>
                      <option value="DEVUELTOS">DEVUELTOS</option>
                    </select>
                  </div>
                </div>
                <div style={styles.rightCol}>
                  <h3 style={{margin: "0 0 15px 0", fontSize: "16px", color: "#fff", display: "flex", alignItems: "center"}}><Clock size={18} style={{marginRight: "8px"}} /> Bitácora Histórica</h3>
                  <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
                    {filteredLoans.length === 0 ? <p style={{color: "#64748b", textAlign: "center"}}>No hay registros de préstamos.</p> : 
                      filteredLoans.map((loan) => {
                        const lColor = getLoanStatusAndColor(loan);
                        const targetWorker = workers.find(w => w.id === loan.patient_id);
                        const workerLabel = targetWorker ? `${targetWorker.last_name}, ${targetWorker.first_name}` : `Expediente ID: ${loan.patient_id}`;

                        return (
                          <div key={loan.id} style={{backgroundColor: "#0f172a", padding: "15px", borderRadius: "8px", borderLeft: `4px solid ${lColor.border}`, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <div>
                              <strong style={{color: "#fff", display: "block", fontSize: "14px"}}>{loan.borrower_name}</strong>
                              <span style={{color: "#94a3b8", fontSize: "13px"}}>Expediente: {workerLabel} | Retorno: {loan.expected_return_date}</span>
                            </div>
                            <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px"}}>
                               <span style={{backgroundColor: lColor.bg, color: lColor.color, padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold"}}>{lColor.label}</span>
                               <div style={{display: "flex", gap: "6px"}}>
                                 {loan.status === "ACTIVO" && (
                                   <button onClick={() => handleReturnLoan(loan.id)} style={styles.btnActionSecondary} className="btn-interactive btn-info">Devolución</button>
                                 )}
                                 {user.role === "ADMIN" && (
                                   <button onClick={() => handleDeleteLoan(loan.id)} style={styles.btnActionIcon} className="btn-interactive btn-danger" title="Eliminar Registro"><Trash2 size={14} /></button>
                                 )}
                               </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: ALERTAS VISUALES DINÁMICAS */}
            {activeTab === "calendar" && (
              <div style={{display: "flex", flexDirection: "column", gap: "25px"}}>
                <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px"}}>
                  <div style={{backgroundColor: "#0f172a", padding: "15px", borderRadius: "12px", borderTop: "4px solid #ef4444"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94a3b8", fontSize: "13px"}}><span>Vencidos</span><ShieldAlert size={16} color="#ef4444"/></div>
                    <h3 style={{margin: "5px 0 0 0", color: "#fff", fontSize: "28px"}}>{overdueAlerts.length}</h3>
                  </div>
                  <div style={{backgroundColor: "#0f172a", padding: "15px", borderRadius: "12px", borderTop: "4px solid #f59e0b"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94a3b8", fontSize: "13px"}}><span>Por Vencer</span><Clock size={16} color="#f59e0b"/></div>
                    <h3 style={{margin: "5px 0 0 0", color: "#fff", fontSize: "28px"}}>{dueSoonAlerts.length}</h3>
                  </div>
                  <div style={{backgroundColor: "#0f172a", padding: "15px", borderRadius: "12px", borderTop: "4px solid #64748b"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94a3b8", fontSize: "13px"}}><span>Expurgos</span><FileText size={16} color="#64748b"/></div>
                    <h3 style={{margin: "5px 0 0 0", color: "#fff", fontSize: "28px"}}>{expurgoAlerts.length}</h3>
                  </div>
                </div>

                <div style={{display: "flex", gap: "10px", backgroundColor: "#0f172a", padding: "12px 20px", borderRadius: "10px", border: "1px solid #334155"}}>
                  <div style={{display: "flex", alignItems: "center", gap: "8px", fontSize: "14px"}}><Search size={16} color="#0d9488"/> Filtros:</div>
                  <select value={alertTypeFilter} onChange={e=>setAlertTypeFilter(e.target.value)} style={{...styles.formInput, width: "180px", padding: "6px"}} className="input-interactive">
                    <option value="TODAS">Todos los tipos</option>
                    <option value="VENCIDO">Préstamos Vencidos</option>
                    <option value="POR_VENCER">Próximos a Vencer</option>
                    <option value="EXPURGO">Expurgos Legales</option>
                  </select>
                  <select value={alertPriorityFilter} onChange={e=>setAlertPriorityFilter(e.target.value)} style={{...styles.formInput, width: "180px", padding: "6px"}} className="input-interactive">
                    <option value="TODAS">Todas las prioridades</option>
                    <option value="ALTA">Prioridad Alta</option>
                    <option value="MEDIA">Prioridad Media</option>
                    <option value="BAJA">Prioridad Baja</option>
                  </select>
                </div>

                <div style={{display: "flex", flexDirection: "column", gap: "15px", maxHeight: "400px", overflowY: "auto", paddingRight: "5px"}}>
                  {filteredAlerts.length === 0 ? (
                    <div style={{...styles.placeholderBox, borderStyle: "solid"}}><CheckCircle size={36} color="#10b981"/><p style={{marginTop: "10px", color: "#94a3b8"}}>No hay alertas pendientes para los criterios seleccionados.</p></div>
                  ) : (
                    filteredAlerts.map(alert => (
                      <div key={alert.id} style={{backgroundColor: "#0f172a", borderLeft: `5px solid ${alert.border}`, padding: "20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.15)"}}>
                        <div style={{display: "flex", gap: "15px", alignItems: "start"}}>
                          <div style={{marginTop: "2px"}}>{alert.icon}</div>
                          <div>
                            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                              <h4 style={{margin: 0, color: "#fff", fontSize: "15px"}}>{alert.title}</h4>
                              <span style={{backgroundColor: alert.priority === "ALTA" ? "rgba(239,68,68,0.2)" : alert.priority === "MEDIA" ? "rgba(245,158,11,0.2)" : "rgba(100,116,139,0.2)", color: alert.color, fontSize: "10px", fontWeight: "bold", padding: "2px 8px", borderRadius: "10px"}}>Prioridad {alert.priority}</span>
                            </div>
                            <p style={{margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "14px"}}>{alert.desc}</p>
                            <span style={{display: "block", marginTop: "4px", color: "#64748b", fontSize: "12px"}}>{alert.meta}</span>
                            {alert.actions && alert.actions}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 4: ESTADÍSTICAS DASHBOARD CON ANIMACIONES SVG */}
            {activeTab === "stats" && (
              <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px"}}>
                  <div style={{backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", borderTop: "4px solid #0d9488"}}><p style={{margin: 0, color: "#94a3b8", fontSize: "13px", fontWeight: "bold"}}>Total Expedientes</p><h2 style={{margin: "5px 0 0 0", color: "#fff", fontSize: "32px"}}>{statsData.total}</h2></div>
                  <div style={{backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", borderTop: "4px solid #3b82f6"}}><p style={{margin: 0, color: "#94a3b8", fontSize: "13px", fontWeight: "bold"}}>Personal Activo</p><h2 style={{margin: "5px 0 0 0", color: "#3b82f6", fontSize: "32px"}}>{statsData.activos}</h2></div>
                  <div style={{backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", borderTop: "4px solid #8b5cf6"}}><p style={{margin: 0, color: "#94a3b8", fontSize: "13px", fontWeight: "bold"}}>Egresados</p><h2 style={{margin: "5px 0 0 0", color: "#8b5cf6", fontSize: "32px"}}>{statsData.egresados}</h2></div>
                  <div style={{backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", borderTop: "4px solid #f43f5e"}}><p style={{margin: 0, color: "#94a3b8", fontSize: "13px", fontWeight: "bold"}}>Seguro Social / Jub.</p><h2 style={{margin: "5px 0 0 0", color: "#f43f5e", fontSize: "32px"}}>{statsData.seguroSocial + statsData.jubilados}</h2></div>
                </div>
                
                {/* GRÁFICOS CIRCULARES SVG PURO */}
                <div style={{display: "flex", gap: "20px", width: "100%"}}>
                  <DonutChart data={donutLaboral} title="Demografía Laboral" />
                  <DonutChart data={donutDocumental} title="Estado Físico del Archivo" />
                </div>
              </div>
            )}

            {/* PESTAÑA 5: CONFIGURACIÓN (Solo ADMIN) */}
            {activeTab === "settings" && user.role === "ADMIN" && (
              <div style={{backgroundColor: "#0f172a", borderRadius: "16px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", border: "1px dashed #334155"}}>
                <Settings size={48} color="#64748b" style={{marginBottom: "15px"}} />
                <h2 style={{color: "#fff", margin: "0 0 10px 0"}}>Panel Administrativo</h2>
                <p style={{color: "#94a3b8", maxWidth: "500px", textAlign: "center"}}>Gestiona los permisos de los transcriptores y personal de consulta.</p>
                <button onClick={handleOpenUserModal} style={{...styles.btnPrimary, width: "250px", marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px"}} className="btn-interactive"><Users size={18}/> Administrar Usuarios</button>
              </div>
            )}

            {/* PESTAÑA 6: IA CHAT */}
            {activeTab === "ai" && (
              <div style={styles.aiContainer}>
                <div style={styles.aiHeader}>
                  <Bot size={32} color="#0d9488" />
                  <div>
                    <h3 style={{margin: 0}}>Asistente de Gestión de Archivo SAD-TH</h3>
                    <p style={{margin: "3px 0 0 0", color: "#94a3b8", fontSize: "14px"}}>Consultor experto en organización e interpretación de leyes laborales.</p>
                  </div>
                </div>
                <div style={styles.chatWrapper}>
                  {chatHistory.length === 0 ? (
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5}}>
                      <Bot size={48} color="#0d9488" />
                      <p style={{marginTop: "10px"}}>Pregúntame sobre gestión de archivo...</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, index) => (
                      <div key={index} style={{ ...styles.chatBubble, alignSelf: msg.role === "user" ? "flex-end" : "flex-start", backgroundColor: msg.role === "user" ? "#0d9488" : "#334155" }}>
                        <strong style={{fontSize: "12px", color: msg.role === "user" ? "#ccfbf1" : "#cbd5e1", display: "block", marginBottom: "4px"}}>{msg.role === "user" ? "Tú" : "IA"}</strong>
                        <p style={{ margin: 0, fontSize: "14px", whiteSpace: "pre-line" }}>{msg.text}</p>
                      </div>
                    ))
                  )}
                  {aiLoading && <div style={{...styles.chatBubble, alignSelf: "flex-start", backgroundColor: "#334155"}}><span style={{fontSize: "13px", color: "#94a3b8"}}>Pensando...</span></div>}
                </div>
                <form onSubmit={handleSendAiMessage} style={styles.chatForm}>
                  <input type="text" placeholder="Ej: ¿Cuáles son las reglas de conservación?" value={aiMessage} onChange={(e) => setAiMessage(e.target.value)} style={styles.chatInput} className="input-interactive" disabled={aiLoading} />
                  <button type="submit" style={styles.chatSubmitBtn} className="btn-interactive" disabled={aiLoading}><Send size={18} /></button>
                </form>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}

// === ESTILOS CSS IN-JS ===
const styles = {
  appContainer: { fontFamily: "'Inter', sans-serif", backgroundColor: "#0f172a", color: "#f1f5f9", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", boxSizing: "border-box" },
  loginWrapper: { display: "flex", alignItems: "center", justifyContent: "center", flex: 1, width: "100%", maxWidth: "400px" },
  loginCard: { backgroundColor: "#1e293b", padding: "40px 30px", borderRadius: "16px", width: "100%", display: "flex", flexDirection: "column", gap: "20px" },
  loginHeader: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  logoIconBg: { backgroundColor: "#0f172a", padding: "12px", borderRadius: "50%", display: "flex" },
  loginTitle: { margin: 0, fontSize: "28px", fontWeight: "900", color: "#fff" },
  loginSubtitle: { margin: 0, fontSize: "12px", color: "#94a3b8" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  inputLabel: { fontSize: "13px", color: "#94a3b8", fontWeight: "600" },
  formInput: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", boxSizing: "border-box", fontSize: "14px" },
  btnPrimary: { width: "100%", padding: "12px", backgroundColor: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" },
  
  dashboardContainer: { width: "100%", maxWidth: "1150px", backgroundColor: "#1e293b", borderRadius: "16px", padding: "25px", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", position: "relative" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "20px", marginBottom: "20px" },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  brandText: { fontSize: "18px", fontWeight: "800", color: "#fff" },
  userInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { backgroundColor: "#0f172a", padding: "8px", borderRadius: "50%" },
  userDetail: { display: "flex", flexDirection: "column" },
  userName: { fontSize: "13px", fontWeight: "bold" },
  userRoleBadge: { fontSize: "10px", backgroundColor: "#0369a1", padding: "2px 6px", borderRadius: "4px", color: "#fff", fontWeight: "bold" },
  btnLogout: { backgroundColor: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "6px" },

  tabBar: { display: "flex", gap: "5px", flexWrap: "wrap", borderBottom: "1px solid #334155", marginBottom: "20px" },
  tabLink: { backgroundColor: "transparent", border: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center" },

  splitLayout: { display: "grid", gridTemplateColumns: "35fr 65fr", gap: "25px", alignItems: "start", width: "100%" },
  leftCol: { display: "flex", flexDirection: "column" },
  rightCol: { display: "flex", flexDirection: "column", width: "100%", minWidth: 0 }, 
  
  sectionTitle: { margin: "0 0 15px 0", fontSize: "16px", color: "#fff", display: "flex", alignItems: "center" },
  medicalForm: { backgroundColor: "#0f172a", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" },
  grid2Col: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  inputWithIcon: { position: "relative", width: "100%" },
  innerIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  btnCancelEdit: { padding: "4px 8px", backgroundColor: "transparent", border: "1px solid #f43f5e", color: "#f43f5e", borderRadius: "6px", cursor: "pointer" },
  guestAlert: { backgroundColor: "#1e1b4b", padding: "20px", borderRadius: "12px", textAlign: "center", color: "#e0e7ff", border: "1px solid #312e81" },

  searchHeader: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px", width: "100%" },
  recordBadge: { fontSize: "12px", backgroundColor: "#0d9488", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontWeight: "normal" },
  btnExport: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" },
  btnLoadRecords: { display: "flex", alignItems: "center", padding: "6px 12px", backgroundColor: "#0d9488", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", cursor: "pointer" },
  searchBarWrapper: { position: "relative", width: "100%" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  searchInputField: { width: "100%", padding: "10px 10px 10px 35px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", fontSize: "13.5px", boxSizing: "border-box" },

  patientsFeed: { display: "flex", flexDirection: "column", gap: "12px", maxHeight: "540px", overflowY: "auto", paddingRight: "5px" },
  placeholderBox: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", border: "1px dashed #334155", borderRadius: "12px", backgroundColor: "#0f172a" },
  medicalCard: { backgroundColor: "#0f172a", padding: "18px", borderRadius: "12px" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  patientName: { margin: 0, fontSize: "16px", color: "#fff", fontWeight: "bold" },
  patientIdBadge: { fontSize: "11px", padding: "2px 8px", borderRadius: "12px", color: "#fff", fontWeight: "bold" },
  cardDetails: { display: "flex", flexDirection: "column", gap: "6px" },
  detailRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#94a3b8" },
  historyBox: { backgroundColor: "#1e293b", padding: "10px", borderRadius: "6px", marginTop: "8px" },
  
  cardActionsBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "12px", borderTop: "1px solid #1e293b" },
  btnActionSecondary: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", backgroundColor: "#334155", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  btnActionIcon: { padding: "6px", backgroundColor: "#334155", color: "#94a3b8", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex" },

  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, backdropFilter: "blur(4px)" },
  alertSuccess: { backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#6ee7b7", padding: "10px 15px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", marginBottom: "10px" },
  modalContent: { backgroundColor: "#1e293b", padding: "25px", borderRadius: "16px", width: "90%", maxWidth: "550px", border: "1px solid #334155", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", gap: "15px" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "15px" },
  modalTitle: { margin: 0, color: "#fff", fontSize: "18px", fontWeight: "bold" },
  uploadBox: { display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#0f172a", padding: "18px", borderRadius: "12px", border: "1px dashed #3b82f6" },
  docList: { display: "flex", flexDirection: "column", gap: "10px", maxHeight: "220px", overflowY: "auto", paddingRight: "5px" },
  docItem: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" },
  btnDocLink: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", backgroundColor: "#0ea5e9", color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" },

  aiContainer: { display: "flex", flexDirection: "column", gap: "20px" },
  aiHeader: { display: "flex", alignItems: "center", gap: "15px", backgroundColor: "#0f172a", padding: "15px", borderRadius: "12px" },
  chatWrapper: { height: "350px", backgroundColor: "#0f172a", borderRadius: "12px", padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" },
  chatBubble: { maxWidth: "75%", padding: "12px 16px", borderRadius: "12px", color: "#fff" },
  chatForm: { display: "flex", gap: "10px" },
  chatInput: { flex: 1, padding: "14px", backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155", borderRadius: "8px" },
  chatSubmitBtn: { backgroundColor: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", padding: "0 20px", cursor: "pointer" }
};

export default App;