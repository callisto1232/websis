import React, { useState, useEffect } from 'react';

export default function App() {
  const [stats, setStats] = useState({
    cpu_overall: 0,
    cpu_cores: [],
    cpu_count: 0,
    cpu_freq_ghz: 0,
    cpu_temp: 0,
    ram: 0,
    ram_used_gb: 0,
    ram_total_gb: 0,
    swap: 0,
    disk_percent: 0,
    disk_free_gb: 0,
    net_down_mbs: 0,
    net_up_mbs: 0,
    top_processes: []
  });
  const [isOnline, setIsOnline] = useState(false);
  const [cpuHistory, setCpuHistory] = useState(Array(30).fill(0));

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/telemetry');
        const data = await response.json();
        setStats(data);
        setIsOnline(true);

        setCpuHistory(prev => {
          const updated = [...prev, data.cpu_overall];
          if (updated.length > 30) updated.shift();
          return updated;
        });
      } catch (err) {
        setIsOnline(false);
      }
    };

    fetchMetrics();
    const clockLoop = setInterval(fetchMetrics, 1000);
    return () => clearInterval(clockLoop);
  }, []);

  // --- GRAPH MATHEMATICS ---
  const graphWidth = 300;
  const pointsString = cpuHistory
      .map((val, index) => {
        const x = (index / (cpuHistory.length - 1)) * graphWidth;
        const y = 100 - val;
        return `${x},${y}`;
      })
      .join(' ');

  // --- RADIAL RAM DIAL MATHEMATICS ---
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.ram / 100) * circumference;

  return (
      <div style={{ padding: '30px', background: '#0e1013', color: '#fff', minHeight: '100vh', fontFamily: 'monospace' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isOnline ? '#00f2fe' : '#ff3366', boxShadow: isOnline ? '0 0 8px #00f2fe' : 'none' }} />
          <h2 style={{ margin: 0, letterSpacing: '1px' }}>H.A.M.S. // COMPLETE TELEMETRY MATRIX</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ROW 1: GRAPH & RADIAL MEMORY DIAL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

            {/* CPU HISTORICAL GRAPH */}
            <div style={cardStyle}>
              <p style={labelStyle}>OVERALL CPU ACTIVITY TIMELINE (30s ROLL)</p>
              <h2 style={{ margin: '10px 0', color: '#00f2fe' }}>{stats.cpu_overall}% <span style={{fontSize: '12px', color: '#6b7280'}}>Avg Load</span></h2>
              <div style={{ background: '#0e1013', padding: '10px', borderRadius: '6px', border: '1px solid #1c1f26' }}>
                <svg viewBox="0 0 300 100" style={{ width: '100%', height: '120px', overflow: 'visible' }}>
                  <line x1="0" y1="25" x2="300" y2="25" stroke="#1c1f26" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#1c1f26" strokeWidth="0.5" />
                  <line x1="0" y1="75" x2="300" y2="75" stroke="#1c1f26" strokeWidth="0.5" />
                  <polyline fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pointsString} style={{ transition: 'all 0.3s ease' }} />
                </svg>
              </div>
            </div>

            {/* RADIAL MEMORY DIAL */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={labelStyle}>RANDOM ACCESS MEMORY VOLUMETRICS</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px', margin: 'auto 0' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#1c1f26" strokeWidth="8" />
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke={stats.ram > 80 ? '#ff3366' : '#00f2fe'} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', fontSize: '14px' }}>
                    {stats.ram}%
                  </div>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#00f2fe' }}>Allocated Space</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>{stats.ram_used_gb} GB Used</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>Swap Load: {stats.swap}%</p>
                </div>
              </div>
            </div>

          </div>

          {/* ROW 2: MULTI-CORE METER BLOCKS */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #242936', paddingBottom: '10px' }}>
              <span style={labelStyle}>PROCESSOR MULTI-CORE ARRAY ({stats.cpu_count} Cores @ {stats.cpu_freq_ghz} GHz)</span>
              <span style={{ color: '#00f2fe', fontWeight: 'bold' }}>{stats.cpu_temp ? `${stats.cpu_temp}°C` : 'N/A'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {stats.cpu_cores.map((coreLoad, index) => (
                  <div key={index} style={coreBoxStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                      <span>CORE_{index}</span>
                      <span>{coreLoad}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: '#1c1f26', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${coreLoad}%`, height: '100%', background: coreLoad > 75 ? '#ff3366' : '#00f2fe', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* ROW 3: STORAGE, NETWORK INTERFACE & TOP PROCESSES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

            {/* File Storage Tracker */}
            <div style={cardStyle}>
              <p style={labelStyle}>FILE SYSTEM STORAGE ( root / )</p>
              <h2 style={{ margin: '14px 0 6px 0', color: '#00f2fe' }}>USED: {stats.disk_percent}%</h2>
              <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#a1a1aa' }}>Available Headroom: {stats.disk_free_gb} GB free</p>
              <div style={{ width: '100%', height: '6px', background: '#1c1f26', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.disk_percent}%`, height: '100%', background: '#00f2fe' }} />
              </div>
            </div>

            {/* Network Throughput Speed Card */}
            <div style={cardStyle}>
              <p style={labelStyle}>IO NETWORK INTERFACE SPEED</p>
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '13px' }}>📥 DOWNLOAD:</span>
                  <span style={{ color: '#00f2fe', fontWeight: 'bold', fontSize: '18px' }}>{stats.net_down_mbs} MB/s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '13px' }}>📤 UPLOAD:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>{stats.net_up_mbs} MB/s</span>
                </div>
              </div>
            </div>

            {/* Top Host Processes Monitor Card */}
            <div style={cardStyle}>
              <p style={labelStyle}>TOP APPLICATION WORKLOADS</p>
              <div style={{ marginTop: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                  <tr style={{ color: '#6b7280', borderBottom: '1px solid #1c1f26', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '6px' }}>NAME</th>
                    <th style={{ paddingBottom: '6px' }}>CPU%</th>
                    <th style={{ paddingBottom: '6px' }}>MEM%</th>
                  </tr>
                  </thead>
                  <tbody>
                  {stats.top_processes.map((proc, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #1c1f26', color: '#e1e1e6' }}>
                        <td style={{ padding: '6px 0', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proc.name}</td>
                        <td style={{ color: '#00f2fe', fontWeight: 'bold' }}>{proc.cpu}%</td>
                        <td>{proc.mem}%</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
  );
}

const cardStyle = { background: '#161920', padding: '20px', borderRadius: '8px', border: '1px solid #242936' };
const coreBoxStyle = { background: '#0e1013', padding: '10px', borderRadius: '4px', border: '1px solid #1c1f26' };
const labelStyle = { margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 'bold', letterSpacing: '0.5px' };