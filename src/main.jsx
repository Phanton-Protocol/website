import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Component } from 'react'

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '16px', fontFamily: 'monospace', color: '#fff', background: '#2a0000' }}>
          <h2 style={{ margin: 0, marginBottom: '8px' }}>Runtime Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error?.stack || this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

function installGlobalErrorOverlay() {
  const ensure = () => {
    let el = document.getElementById('runtime-global-error-overlay')
    if (!el) {
      el = document.createElement('pre')
      el.id = 'runtime-global-error-overlay'
      el.style.position = 'fixed'
      el.style.left = '0'
      el.style.right = '0'
      el.style.bottom = '0'
      el.style.maxHeight = '40vh'
      el.style.overflow = 'auto'
      el.style.margin = '0'
      el.style.padding = '10px'
      el.style.zIndex = '999999'
      el.style.background = 'rgba(90,0,0,0.95)'
      el.style.color = '#fff'
      el.style.fontFamily = 'monospace'
      el.style.fontSize = '12px'
      document.body.appendChild(el)
    }
    return el
  }

  window.addEventListener('error', (e) => {
    const el = ensure()
    el.textContent = `window.error: ${e.message}\n${e.error?.stack || ''}`
  })
  window.addEventListener('unhandledrejection', (e) => {
    const el = ensure()
    const reason = e.reason
    el.textContent = `unhandledrejection: ${String(reason?.stack || reason)}`
  })
}

installGlobalErrorOverlay()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RootErrorBoundary>
  </StrictMode>,
)
