'use client'
import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'

// ─── Web Crypto helpers ───────────────────────────────────────────────────────

async function generateRsaKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt']
  )
  const pubDer = await crypto.subtle.exportKey('spki', keyPair.publicKey)
  const privDer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
  return {
    publicKey: `-----BEGIN PUBLIC KEY-----\n${chunk(btoa(ab2str(pubDer)))}\n-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----\n${chunk(btoa(ab2str(privDer)))}\n-----END PRIVATE KEY-----`,
  }
}

function ab2str(buf: ArrayBuffer): string {
  return String.fromCharCode(...new Uint8Array(buf))
}

function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < str.length; i++) view[i] = str.charCodeAt(i)
  return buf
}

function chunk(b64: string, size = 64): string {
  return b64.match(/.{1,64}/g)?.join('\n') ?? b64
}

function stripPem(pem: string): string {
  return pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
}

async function rsaEncrypt(publicKeyPem: string, plaintext: string): Promise<string> {
  const der = str2ab(atob(stripPem(publicKeyPem)))
  const key = await crypto.subtle.importKey('spki', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
  const enc = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, new TextEncoder().encode(plaintext))
  return btoa(ab2str(enc))
}

async function rsaDecrypt(privateKeyPem: string, ciphertext: string): Promise<string> {
  const der = str2ab(atob(stripPem(privateKeyPem)))
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt'])
  const dec = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, str2ab(atob(ciphertext)))
  return new TextDecoder().decode(dec)
}

async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function aesEncrypt(passphrase: string, plaintext: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveAesKey(passphrase, salt)
  const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext))
  // Pack: salt(16) + iv(12) + ciphertext, then base64
  const buf = new Uint8Array(salt.byteLength + iv.byteLength + enc.byteLength)
  buf.set(salt, 0)
  buf.set(iv, 16)
  buf.set(new Uint8Array(enc), 28)
  return btoa(ab2str(buf.buffer))
}

async function aesDecrypt(passphrase: string, ciphertext: string): Promise<string> {
  const buf = new Uint8Array(str2ab(atob(ciphertext)))
  const salt = buf.slice(0, 16)
  const iv = buf.slice(16, 28)
  const data = buf.slice(28)
  const key = await deriveAesKey(passphrase, salt)
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return new TextDecoder().decode(dec)
}

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = 'rsa' | 'aes'
type Direction = 'encrypt' | 'decrypt'

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <><Check size={12} className="text-green-500" />Copied</> : <><Copy size={12} />Copy</>}
    </button>
  )
}

export function RsaAesTool() {
  const [tab, setTab] = useState<Tab>('rsa')
  const [direction, setDirection] = useState<Direction>('encrypt')

  // RSA state
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [rsaInput, setRsaInput] = useState('')
  const [rsaOutput, setRsaOutput] = useState('')
  const [generatingKeys, setGeneratingKeys] = useState(false)

  // AES state
  const [passphrase, setPassphrase] = useState('')
  const [aesInput, setAesInput] = useState('')
  const [aesOutput, setAesOutput] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setError('')
    setLoading(true)
    try {
      if (tab === 'rsa') {
        if (direction === 'encrypt') {
          if (!publicKey) throw new Error('Public key is required for encryption')
          setRsaOutput(await rsaEncrypt(publicKey, rsaInput))
        } else {
          if (!privateKey) throw new Error('Private key is required for decryption')
          setRsaOutput(await rsaDecrypt(privateKey, rsaInput))
        }
      } else {
        if (!passphrase) throw new Error('Passphrase is required')
        if (direction === 'encrypt') {
          setAesOutput(await aesEncrypt(passphrase, aesInput))
        } else {
          setAesOutput(await aesDecrypt(passphrase, aesInput))
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const genKeys = async () => {
    setGeneratingKeys(true)
    setError('')
    try {
      const { publicKey: pub, privateKey: priv } = await generateRsaKeyPair()
      setPublicKey(pub)
      setPrivateKey(priv)
    } catch {
      setError('Failed to generate key pair')
    } finally {
      setGeneratingKeys(false)
    }
  }

  const input = tab === 'rsa' ? rsaInput : aesInput
  const setInput = tab === 'rsa' ? setRsaInput : setAesInput
  const output = tab === 'rsa' ? rsaOutput : aesOutput

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border">
        {(['rsa', 'aes'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError('') }}
            className={`px-6 py-3 text-sm font-medium uppercase tracking-wide transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'rsa' ? 'RSA-OAEP' : 'AES-GCM'}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {(['encrypt', 'decrypt'] as Direction[]).map((d) => (
          <button
            key={d}
            onClick={() => setDirection(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              direction === d ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {tab === 'rsa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">RSA Keys (2048-bit)</h3>
            <button
              onClick={genKeys}
              disabled={generatingKeys}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <RefreshCw size={14} className={generatingKeys ? 'animate-spin' : ''} />
              {generatingKeys ? 'Generating...' : 'Generate Key Pair'}
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Public Key</label>
                {publicKey && <CopyBtn text={publicKey} />}
              </div>
              <textarea
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="-----BEGIN PUBLIC KEY-----&#10;Paste or generate...&#10;-----END PUBLIC KEY-----"
                className="input-base h-40 font-mono text-xs resize-none"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Private Key</label>
                {privateKey && <CopyBtn text={privateKey} />}
              </div>
              <textarea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="-----BEGIN PRIVATE KEY-----&#10;Paste or generate...&#10;-----END PRIVATE KEY-----"
                className="input-base h-40 font-mono text-xs resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'aes' && (
        <div>
          <label className="block text-sm font-medium mb-2">Passphrase</label>
          <input
            type="text"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter a strong passphrase..."
            className="input-base w-full max-w-sm font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            AES-256-GCM with PBKDF2 key derivation (100k iterations, SHA-256)
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            {direction === 'encrypt' ? 'Plaintext' : 'Ciphertext (Base64)'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'encrypt' ? 'Enter text to encrypt...' : 'Paste base64 ciphertext...'}
            className="input-base h-48 font-mono text-sm resize-none"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">
              {direction === 'encrypt' ? 'Ciphertext (Base64)' : 'Plaintext'}
            </label>
            {output && <CopyBtn text={output} />}
          </div>
          <div className="input-base h-48 overflow-auto bg-muted">
            {output ? (
              <pre className="font-mono text-sm break-all whitespace-pre-wrap">{output}</pre>
            ) : (
              <span className="text-muted-foreground text-sm">Output will appear here</span>
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <button
        onClick={run}
        disabled={loading}
        className="btn-primary flex items-center justify-center gap-2 w-full max-w-xs"
      >
        {loading ? 'Processing...' : direction === 'encrypt' ? 'Encrypt' : 'Decrypt'}
      </button>

      <p className="text-xs text-muted-foreground">
        All cryptographic operations run entirely in your browser using the Web Crypto API. No data leaves your device.
      </p>
    </div>
  )
}
