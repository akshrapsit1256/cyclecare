import React, { useState } from 'react';
import { Cpu, X, Terminal, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function OllamaStatusBadge({ statusInfo, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const isOnline = statusInfo?.status === 'online';
  const modelName = statusInfo?.active_model || 'gemma2:2b';

  return (
    <>
      <button 
        type="button"
        className={`ollama-badge ${isOnline ? 'online' : 'offline'}`}
        onClick={() => setShowModal(true)}
        title="Click for local AI details"
      >
        <span className={`dot-indicator ${isOnline ? 'online' : 'offline'}`} />
        <Cpu size={14} />
        <span>{isOnline ? `Local AI: ${modelName}` : 'AI: Offline Mode'}</span>
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={20} color={isOnline ? '#5e8c75' : '#bf616a'} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Local AI Engine (Ollama)</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem', padding: '0.85rem', borderRadius: 'var(--radius-md)', background: isOnline ? 'var(--sage-soft)' : '#fff3f3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: isOnline ? 'var(--sage-accent)' : '#b33939' }}>
                {isOnline ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>Status: {isOnline ? 'Connected to local Ollama' : 'Ollama is not running locally'}</span>
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.35rem', color: 'var(--text-main)' }}>
                {isOnline 
                  ? `Active open-source model: ${modelName}. All inference runs 100% on your machine with total privacy.` 
                  : 'CycleCare seamlessly uses its built-in offline wellness knowledge base so you never miss a suggestion.'}
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.4rem' }}>How to run with local Gemma on Ollama:</h4>
              <ol style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                <li>Install Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" style={{ color: 'var(--rose-primary)', fontWeight: 600 }}>ollama.com</a></li>
                <li>Open your terminal and run:
                  <div style={{ background: '#2d2d3a', color: '#8be9fd', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', margin: '0.35rem 0', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    ollama run gemma2:2b
                  </div>
                </li>
                <li>Your local AI is now ready to generate private, offline wellness advice!</li>
              </ol>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onRefresh}
                style={{ fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} /> Refresh Connection
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setShowModal(false)}
                style={{ fontSize: '0.85rem' }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
