import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';

const C = {
  bg: '#050a0f', surface: '#0d1821', card: '#111c27',
  border: '#1a2d40', accent: '#00d4ff', accent2: '#00ff88',
  accent3: '#ff6b35', text: '#e8f4f8', muted: '#5a7a8a',
  success: '#00ff88', error: '#ff4444',
};

const styles = {
  app: { minHeight: '100vh', background: C.bg, fontFamily: "'Syne', sans-serif", color: C.text },
  header: { borderBottom: `1px solid ${C.border}`, padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `linear-gradient(180deg, #0a1520 0%, ${C.bg} 100%)` },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  logo: { width: 40, height: 40, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  title: { margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' },
  subtitle: { margin: 0, fontSize: 12, color: C.muted, fontFamily: "'Space Mono', monospace" },
  badge: { padding: '4px 10px', borderRadius: 99, background: 'rgba(0,212,255,0.1)', border: `1px solid ${C.accent}`, fontSize: 11, color: C.accent, fontFamily: "'Space Mono', monospace" },
  main: { maxWidth: 1200, margin: '0 auto', padding: '32px 40px' },
  grid: { display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 },
  cardTitle: { fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.accent, margin: '0 0 20px', fontFamily: "'Space Mono', monospace" },
  label: { fontSize: 12, color: C.muted, marginBottom: 6, display: 'block', fontFamily: "'Space Mono', monospace" },
  input: { width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14, fontFamily: "'Space Mono', monospace", outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', color: C.text, fontSize: 14, fontFamily: "'Space Mono', monospace", outline: 'none', boxSizing: 'border-box', cursor: 'pointer' },
  formGroup: { marginBottom: 16 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btn: { width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#050a0f', letterSpacing: '0.05em', transition: 'opacity 0.2s, transform 0.1s', fontFamily: "'Syne', sans-serif" },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  btnSecondary: { padding: '8px 16px', background: 'transparent', border: `1px solid ${C.accent2}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, color: C.accent2, fontFamily: "'Space Mono', monospace", transition: 'all 0.2s' },
  presetWrap: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  preset: { padding: '5px 12px', borderRadius: 99, background: C.surface, border: `1px solid ${C.border}`, fontSize: 11, cursor: 'pointer', color: C.muted, transition: 'all 0.2s', fontFamily: "'Space Mono', monospace" },
  presetActive: { background: 'rgba(0,212,255,0.1)', border: `1px solid ${C.accent}`, color: C.accent },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', textAlign: 'center' },
  statVal: { fontSize: 28, fontWeight: 800, margin: '4px 0 2px', fontFamily: "'Space Mono', monospace" },
  statLabel: { fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: "'Space Mono', monospace" },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: `1px solid ${C.border}`, color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' },
  td: { padding: '10px 12px', borderBottom: `1px solid ${C.border}` },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 },
  spinner: { width: 48, height: 48, borderRadius: '50%', border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, animation: 'spin 0.8s linear infinite' },
  loadingText: { color: C.muted, fontFamily: "'Space Mono', monospace", fontSize: 13 },
  errorBox: { background: 'rgba(255,68,68,0.08)', border: `1px solid ${C.error}`, borderRadius: 10, padding: '16px 20px', color: C.error, fontFamily: "'Space Mono', monospace", fontSize: 13 },
  warningBox: { background: 'rgba(255,107,53,0.08)', border: `1px solid ${C.accent3}`, borderRadius: 10, padding: '12px 16px', color: C.accent3, fontFamily: "'Space Mono', monospace", fontSize: 12, marginBottom: 16 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12, color: C.muted, textAlign: 'center' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ margin: 0, color: C.muted, fontSize: 11, fontFamily: "'Space Mono', monospace" }}>Cloudlet {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '4px 0 0', color: p.color, fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
          {p.name}: {p.value}s
        </p>
      ))}
    </div>
  );
};

// ── CSV Export helper ──────────────────────────────────────────────────────
function exportCSV(cloudlets, summary) {
  const rows = [
    ['cloudlet_id', 'vm_id', 'status', 'start_time', 'finish_time', 'exec_time', 'length'],
    ...cloudlets.map(c => [c.cloudlet_id, c.vm_id, c.status, c.start_time, c.finish_time, c.exec_time, c.length])
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulation_results_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [config, setConfig] = useState({
    numVMs: 3, numCloudlets: 10, mips: 1000,
    ram: 2048, bw: 1000, cloudletLength: 10000,
    schedulingPolicy: 'TimeShared'
  });
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [backendOk, setBackendOk] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');

  // Check backend health on mount
  useEffect(() => {
    axios.get('/health', { timeout: 3000 })
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
    axios.get('/presets').then(r => setPresets(r.data)).catch(() => {});
  }, []);

  const applyPreset = (preset, idx) => {
    const { name, ...cfg } = preset;
    setConfig(cfg);
    setActivePreset(idx);
  };

  const handleChange = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    setActivePreset(null);
  };

  const runSimulation = async () => {
    // Check backend first
    if (backendOk === false) {
      setError('Backend is not running! Please start start_backend.bat first, then refresh this page.');
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const resp = await axios.post('/simulate', config, { timeout: 120000 });
      setResults(resp.data);
      setActiveTab('chart');
    } catch (e) {
      if (e.code === 'ECONNREFUSED' || e.message.includes('Network Error')) {
        setError('Cannot connect to backend! Make sure start_backend.bat is running on port 5000.');
      } else {
        setError(e.response?.data?.error || e.message || 'Simulation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const chartData = results?.cloudlets?.map(c => ({
    name: `#${c.cloudlet_id}`,
    'Exec Time': parseFloat(c.exec_time.toFixed(1)),
    VM: c.vm_id,
  })) || [];

  const vmColors = [C.accent, C.accent2, C.accent3, '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=range] { -webkit-appearance: none; height: 4px; background: #1a2d40; border-radius: 2px; outline: none; width: 100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #00d4ff; cursor: pointer; }
        input:focus { border-color: #00d4ff !important; }
        select option { background: #111c27; }
        .run-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .tab-btn { padding: 8px 18px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; font-family: 'Space Mono', monospace; font-size: 12px; transition: all 0.2s; }
        .preset-pill:hover { background: rgba(0,212,255,0.08) !important; color: #00d4ff !important; border-color: #00d4ff !important; }
        .export-btn:hover { background: rgba(0,255,136,0.1) !important; }
        tr:hover td { background: rgba(0,212,255,0.03); }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>☁</div>
          <div>
            <h1 style={styles.title}>Cloud Simulation Platform</h1>
            <p style={styles.subtitle}>Based on CloudSim Express · Hewage et al. 2024</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Backend status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: backendOk === true ? C.success : backendOk === false ? C.error : C.muted }} />
            <span style={{ color: C.muted }}>{backendOk === true ? 'Backend Online' : backendOk === false ? 'Backend Offline' : 'Checking...'}</span>
          </div>
          <span style={styles.badge}>v1.0 · Java + Flask + React</span>
        </div>
      </header>

      <main style={styles.main}>
        {/* Backend offline warning */}
        {backendOk === false && (
          <div style={styles.warningBox}>
            ⚠ Backend not detected at localhost:5000 — run <strong>start_backend.bat</strong> then refresh.
          </div>
        )}

        <div style={styles.grid}>
          {/* ── LEFT: Config Panel ── */}
          <div>
            <div style={styles.card}>
              <p style={styles.cardTitle}>⚙ Simulation Config</p>

              {presets.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <span style={{ ...styles.label, marginBottom: 8 }}>Quick Presets</span>
                  <div style={styles.presetWrap}>
                    {presets.map((p, i) => (
                      <button key={i} className="preset-pill"
                        onClick={() => applyPreset(p, i)}
                        style={{ ...styles.preset, ...(activePreset === i ? styles.presetActive : {}) }}>
                        {p.name.split('—')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ ...styles.label, margin: 0 }}>Virtual Machines</label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: "'Space Mono', monospace" }}>{config.numVMs}</span>
                </div>
                <input type="range" min="1" max="10" value={config.numVMs}
                  onChange={e => handleChange('numVMs', +e.target.value)} />
              </div>

              <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ ...styles.label, margin: 0 }}>Cloudlets (Tasks)</label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: "'Space Mono', monospace" }}>{config.numCloudlets}</span>
                </div>
                <input type="range" min="1" max="30" value={config.numCloudlets}
                  onChange={e => handleChange('numCloudlets', +e.target.value)} />
              </div>

              <div style={styles.row2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>MIPS / VM</label>
                  <input type="number" style={styles.input} value={config.mips}
                    onChange={e => handleChange('mips', +e.target.value)} min="100" max="10000" step="100" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>RAM (MB)</label>
                  <input type="number" style={styles.input} value={config.ram}
                    onChange={e => handleChange('ram', +e.target.value)} min="512" max="16384" step="512" />
                </div>
              </div>

              <div style={styles.row2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Bandwidth (Mbps)</label>
                  <input type="number" style={styles.input} value={config.bw}
                    onChange={e => handleChange('bw', +e.target.value)} min="100" max="10000" step="100" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Task Length (MI)</label>
                  <input type="number" style={styles.input} value={config.cloudletLength}
                    onChange={e => handleChange('cloudletLength', +e.target.value)} min="1000" max="100000" step="1000" />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Scheduling Policy</label>
                <select style={styles.select} value={config.schedulingPolicy}
                  onChange={e => handleChange('schedulingPolicy', e.target.value)}>
                  <option value="TimeShared">Time Shared — VMs share CPU time</option>
                  <option value="SpaceShared">Space Shared — VMs get dedicated cores</option>
                </select>
              </div>

              <button className="run-btn" onClick={runSimulation} disabled={loading}
                style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}>
                {loading ? '⟳  Simulating...' : '▶  Run Simulation'}
              </button>
            </div>

            {results && (
              <div style={{ ...styles.card, marginTop: 16 }}>
                <p style={styles.cardTitle}>📋 Last Run</p>
                {[
                  ['VMs', results.summary.num_vms],
                  ['Tasks', results.summary.total_cloudlets],
                  ['Policy', results.summary.scheduling_policy],
                  ['Sim Time', `${results.summary.total_sim_time}s`],
                  ['API Time', `${results.summary.processing_time_s}s`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: C.muted, fontSize: 12, fontFamily: "'Space Mono', monospace" }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Results Panel ── */}
          <div>
            {!loading && !results && !error && (
              <div style={styles.card}>
                <div style={styles.emptyState}>
                  <div style={{ fontSize: 48 }}>☁️</div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Ready to Simulate</h3>
                  <p style={{ margin: 0, fontSize: 13, maxWidth: 320 }}>Configure your cloud environment and click Run Simulation.</p>
                </div>
              </div>
            )}

            {loading && (
              <div style={styles.card}>
                <div style={styles.loadingWrap}>
                  <div style={styles.spinner} />
                  <p style={styles.loadingText}>Running CloudSim simulation...</p>
                  <p style={{ ...styles.loadingText, fontSize: 11 }}>{config.numVMs} VMs · {config.numCloudlets} Tasks · {config.schedulingPolicy}</p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div style={styles.card}>
                <div style={styles.errorBox}><strong>Error</strong><br />{error}</div>
              </div>
            )}

            {results && !loading && (
              <>
                {/* Stats */}
                <div style={styles.statsGrid}>
                  {[
                    { val: results.summary.total_cloudlets, label: 'Total Tasks', color: C.accent },
                    { val: results.summary.successful, label: 'Successful', color: C.success },
                    { val: results.summary.failed, label: 'Failed', color: C.error },
                    { val: `${results.summary.avg_exec_time}s`, label: 'Avg Exec Time', color: C.accent },
                    { val: `${results.summary.total_sim_time}s`, label: 'Sim Duration', color: C.accent2 },
                    { val: results.summary.num_vms, label: 'VMs Used', color: C.accent3 },
                  ].map((s, i) => (
                    <div key={i} style={styles.statCard}>
                      <div style={{ ...styles.statVal, color: s.color }}>{s.val}</div>
                      <div style={styles.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Tabs + Export */}
                <div style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['chart', 'timeline', 'table'].map(tab => (
                        <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                          style={{ background: activeTab === tab ? 'rgba(0,212,255,0.1)' : 'transparent', borderColor: activeTab === tab ? C.accent : C.border, color: activeTab === tab ? C.accent : C.muted }}>
                          {tab === 'chart' ? '📊 Bar Chart' : tab === 'timeline' ? '📈 Timeline' : '📋 Table'}
                        </button>
                      ))}
                    </div>
                    {/* ✅ CSV Export Button */}
                    <button className="export-btn" onClick={() => exportCSV(results.cloudlets, results.summary)}
                      style={styles.btnSecondary}>
                      ⬇ Export CSV
                    </button>
                  </div>

                  {activeTab === 'chart' && (
                    <>
                      <p style={styles.cardTitle}>Execution Time per Cloudlet</p>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                          <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11, fontFamily: 'Space Mono' }} />
                          <YAxis tick={{ fill: C.muted, fontSize: 11, fontFamily: 'Space Mono' }} unit="s" />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="Exec Time" radius={[4, 4, 0, 0]}>
                            {chartData.map((e, i) => <Cell key={i} fill={vmColors[e.VM % vmColors.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                        {[...new Set(results.cloudlets.map(c => c.vm_id))].map(vmId => (
                          <div key={vmId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: vmColors[vmId % vmColors.length] }} />
                            <span style={{ fontSize: 11, color: C.muted, fontFamily: 'Space Mono' }}>VM {vmId}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'timeline' && (
                    <>
                      <p style={styles.cardTitle}>Cloudlet Finish Timeline</p>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart
                          data={[...results.cloudlets].sort((a, b) => a.finish_time - b.finish_time)
                            .map(c => ({ name: `#${c.cloudlet_id}`, 'Finish Time': parseFloat(c.finish_time.toFixed(1)) }))}
                          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                          <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11, fontFamily: 'Space Mono' }} />
                          <YAxis tick={{ fill: C.muted, fontSize: 11, fontFamily: 'Space Mono' }} unit="s" />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="Finish Time" stroke={C.accent2} strokeWidth={2} dot={{ fill: C.accent2, r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  )}

                  {activeTab === 'table' && (
                    <>
                      <p style={styles.cardTitle}>Cloudlet Results Detail</p>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                          <thead>
                            <tr>{['ID', 'VM', 'Status', 'Start (s)', 'Finish (s)', 'Exec (s)', 'Length (MI)'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {results.cloudlets.map(c => (
                              <tr key={c.cloudlet_id}>
                                <td style={styles.td}>{c.cloudlet_id}</td>
                                <td style={{ ...styles.td, color: vmColors[c.vm_id % vmColors.length] }}>VM {c.vm_id}</td>
                                <td style={{ ...styles.td, color: c.status === 'SUCCESS' ? C.success : C.error }}>
                                  {c.status === 'SUCCESS' ? '✓' : '✗'} {c.status}
                                </td>
                                <td style={styles.td}>{c.start_time.toFixed(1)}</td>
                                <td style={styles.td}>{c.finish_time.toFixed(1)}</td>
                                <td style={{ ...styles.td, color: C.accent, fontWeight: 700 }}>{c.exec_time.toFixed(1)}</td>
                                <td style={styles.td}>{c.length.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
