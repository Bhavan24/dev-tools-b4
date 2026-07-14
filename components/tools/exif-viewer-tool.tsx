'use client'
import { useState, useRef } from 'react'
import { Upload, Copy, Check } from 'lucide-react'

// ─── Minimal EXIF parser (JPEG/TIFF only, browser-side) ──────────────────────

const EXIF_TAGS: Record<number, string> = {
  0x010F: 'Make', 0x0110: 'Model', 0x0112: 'Orientation',
  0x011A: 'XResolution', 0x011B: 'YResolution', 0x0128: 'ResolutionUnit',
  0x0131: 'Software', 0x0132: 'DateTime', 0x013B: 'Artist',
  0x013E: 'WhitePoint', 0x013F: 'PrimaryChromaticities',
  0x0211: 'YCbCrCoefficients', 0x0213: 'YCbCrPositioning',
  0x0214: 'ReferenceBlackWhite', 0x8298: 'Copyright',
  0x8769: 'ExifIFDPointer', 0x8825: 'GPSIFDPointer',
  // ExifIFD
  0x829A: 'ExposureTime', 0x829D: 'FNumber',
  0x8822: 'ExposureProgram', 0x8824: 'SpectralSensitivity',
  0x8827: 'ISOSpeedRatings', 0x9000: 'ExifVersion',
  0x9003: 'DateTimeOriginal', 0x9004: 'DateTimeDigitized',
  0x9201: 'ShutterSpeedValue', 0x9202: 'ApertureValue',
  0x9203: 'BrightnessValue', 0x9204: 'ExposureBiasValue',
  0x9205: 'MaxApertureValue', 0x9206: 'SubjectDistance',
  0x9207: 'MeteringMode', 0x9208: 'LightSource',
  0x9209: 'Flash', 0x920A: 'FocalLength',
  0x927C: 'MakerNote', 0x9286: 'UserComment',
  0xA000: 'FlashPixVersion', 0xA001: 'ColorSpace',
  0xA002: 'PixelXDimension', 0xA003: 'PixelYDimension',
  0xA005: 'InteroperabilityIFDPointer',
  0xA20E: 'FocalPlaneXResolution', 0xA20F: 'FocalPlaneYResolution',
  0xA210: 'FocalPlaneResolutionUnit',
  0xA215: 'ExposureIndex', 0xA217: 'SensingMethod',
  0xA300: 'FileSource', 0xA301: 'SceneType',
  0xA302: 'CFAPattern',
  0xA401: 'CustomRendered', 0xA402: 'ExposureMode',
  0xA403: 'WhiteBalance', 0xA404: 'DigitalZoomRatio',
  0xA405: 'FocalLengthIn35mmFilm', 0xA406: 'SceneCaptureType',
  0xA407: 'GainControl', 0xA408: 'Contrast',
  0xA409: 'Saturation', 0xA40A: 'Sharpness',
  0xA40C: 'SubjectDistanceRange',
  0xA420: 'ImageUniqueID',
  // GPS
  0x0000: 'GPSVersionID', 0x0001: 'GPSLatitudeRef',
  0x0002: 'GPSLatitude', 0x0003: 'GPSLongitudeRef',
  0x0004: 'GPSLongitude', 0x0005: 'GPSAltitudeRef',
  0x0006: 'GPSAltitude', 0x0007: 'GPSTimeStamp',
  0x0008: 'GPSSatellites', 0x0009: 'GPSStatus',
  0x000A: 'GPSMeasureMode', 0x000B: 'GPSDOP',
  0x0010: 'GPSImgDirectionRef', 0x0011: 'GPSImgDirection',
  0x0012: 'GPSMapDatum', 0x0013: 'GPSDestLatitudeRef',
  0x0014: 'GPSDestLatitude', 0x0015: 'GPSDestLongitudeRef',
  0x0016: 'GPSDestLongitude', 0x001D: 'GPSDateStamp',
  0x001F: 'GPSProcessingMethod',
}

const TYPE_SIZES = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8]

function readRational(view: DataView, offset: number, le: boolean): string {
  const n = view.getUint32(offset, le)
  const d = view.getUint32(offset + 4, le)
  if (d === 0) return '0'
  if (n % d === 0) return String(n / d)
  return `${n}/${d}`
}

function readIfd(
  view: DataView,
  ifdOffset: number,
  le: boolean,
  tiffStart: number,
  depth = 0
): Record<string, string> {
  if (depth > 3 || ifdOffset <= 0 || ifdOffset + 2 > view.byteLength) return {}
  const result: Record<string, string> = {}

  const count = view.getUint16(ifdOffset, le)
  for (let i = 0; i < count; i++) {
    const entryOffset = ifdOffset + 2 + i * 12
    if (entryOffset + 12 > view.byteLength) break
    const tag = view.getUint16(entryOffset, le)
    const type = view.getUint16(entryOffset + 2, le)
    const numValues = view.getUint32(entryOffset + 4, le)
    const valueOffset = entryOffset + 8

    const typeSize = TYPE_SIZES[type] ?? 1
    const totalSize = typeSize * numValues
    const dataStart = totalSize > 4
      ? view.getUint32(valueOffset, le) + tiffStart
      : valueOffset

    if (dataStart + totalSize > view.byteLength) continue

    const name = EXIF_TAGS[tag]
    if (!name) continue

    if (name === 'ExifIFDPointer' || name === 'GPSIFDPointer' || name === 'InteroperabilityIFDPointer') {
      const ptr = view.getUint32(dataStart, le) + tiffStart
      Object.assign(result, readIfd(view, ptr, le, tiffStart, depth + 1))
      continue
    }

    if (name === 'MakerNote' || name === 'UserComment' || name === 'CFAPattern') continue

    let value = ''
    if (type === 2) {
      // ASCII
      const bytes: number[] = []
      for (let j = 0; j < numValues; j++) {
        const b = view.getUint8(dataStart + j)
        if (b === 0) break
        bytes.push(b)
      }
      value = new TextDecoder('ascii', { fatal: false }).decode(new Uint8Array(bytes)).trim()
    } else if (type === 5 || type === 10) {
      // RATIONAL / SRATIONAL
      const parts: string[] = []
      for (let j = 0; j < Math.min(numValues, 4); j++) {
        parts.push(readRational(view, dataStart + j * 8, le))
      }
      value = parts.join(', ')
    } else if (type === 3) {
      // SHORT
      const parts: number[] = []
      for (let j = 0; j < Math.min(numValues, 4); j++) {
        parts.push(view.getUint16(dataStart + j * 2, le))
      }
      value = parts.join(', ')
    } else if (type === 4) {
      // LONG
      const parts: number[] = []
      for (let j = 0; j < Math.min(numValues, 4); j++) {
        parts.push(view.getUint32(dataStart + j * 4, le))
      }
      value = parts.join(', ')
    } else if (type === 1 || type === 7) {
      if (numValues <= 8) {
        const hex: string[] = []
        for (let j = 0; j < numValues; j++) hex.push(view.getUint8(dataStart + j).toString(16).padStart(2, '0'))
        value = '0x' + hex.join('')
      } else {
        value = `[${numValues} bytes]`
      }
    }

    if (value) result[name] = value
  }
  return result
}

function parseExif(buffer: ArrayBuffer): Record<string, string> {
  const view = new DataView(buffer)

  // Check JPEG SOI marker
  if (view.getUint16(0) !== 0xFFD8) {
    // Try TIFF
    const magic = view.getUint16(0)
    if (magic !== 0x4949 && magic !== 0x4D4D) return {}
    const le = magic === 0x4949
    if (view.getUint16(2, le) !== 42) return {}
    const ifd0 = view.getUint32(4, le)
    return readIfd(view, ifd0, le, 0)
  }

  // Scan JPEG APP1 segment
  let offset = 2
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset)
    if (marker === 0xFFE1) {
      // APP1 - look for Exif header
      const segLen = view.getUint16(offset + 2)
      const exifHeader = view.getUint32(offset + 4)
      if (exifHeader === 0x45786966) { // 'Exif'
        const tiffStart = offset + 10 // skip APP1 marker (2) + length (2) + 'Exif\0\0' (6)
        const magic = view.getUint16(tiffStart)
        const le = magic === 0x4949
        if (view.getUint16(tiffStart + 2, le) !== 42) return {}
        const ifd0 = view.getUint32(tiffStart + 4, le)
        return readIfd(view, tiffStart + ifd0, le, tiffStart)
      }
      offset += 2 + segLen
    } else if ((marker & 0xFF00) === 0xFF00) {
      const segLen = view.getUint16(offset + 2)
      offset += 2 + segLen
    } else {
      break
    }
  }
  return {}
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ExifEntry { tag: string; value: string }

const GPS_TAGS = new Set(['GPSLatitudeRef', 'GPSLatitude', 'GPSLongitudeRef', 'GPSLongitude', 'GPSAltitude', 'GPSAltitudeRef', 'GPSTimeStamp', 'GPSDateStamp', 'GPSSatellites'])
const CAMERA_TAGS = new Set(['Make', 'Model', 'Software', 'DateTime', 'DateTimeOriginal', 'DateTimeDigitized'])
const EXPOSURE_TAGS = new Set(['ExposureTime', 'FNumber', 'ISOSpeedRatings', 'ShutterSpeedValue', 'ApertureValue', 'ExposureBiasValue', 'ExposureMode', 'ExposureProgram', 'MeteringMode', 'Flash', 'FocalLength', 'FocalLengthIn35mmFilm', 'WhiteBalance', 'LightSource'])

function groupEntries(raw: Record<string, string>): { group: string; entries: ExifEntry[] }[] {
  const camera: ExifEntry[] = [], exposure: ExifEntry[] = [], gps: ExifEntry[] = [], other: ExifEntry[] = []
  for (const [tag, value] of Object.entries(raw)) {
    const entry = { tag, value }
    if (CAMERA_TAGS.has(tag)) camera.push(entry)
    else if (EXPOSURE_TAGS.has(tag)) exposure.push(entry)
    else if (GPS_TAGS.has(tag)) gps.push(entry)
    else other.push(entry)
  }
  const groups = []
  if (camera.length) groups.push({ group: 'Camera & Date', entries: camera })
  if (exposure.length) groups.push({ group: 'Exposure & Optics', entries: exposure })
  if (gps.length) groups.push({ group: 'GPS', entries: gps })
  if (other.length) groups.push({ group: 'Other', entries: other })
  return groups
}

export function ExifViewerTool() {
  const [groups, setGroups] = useState<{ group: string; entries: ExifEntry[] }[] | null>(null)
  const [filename, setFilename] = useState('')
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    setError('')
    setGroups(null)
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const buf = e.target?.result as ArrayBuffer
      try {
        const raw = parseExif(buf)
        if (Object.keys(raw).length === 0) {
          setError('No EXIF data found in this file. Only JPEG and TIFF files with embedded EXIF are supported.')
          return
        }
        setGroups(groupEntries(raw))
      } catch (err: any) {
        setError(err.message || 'Failed to parse EXIF data')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const copyAll = async () => {
    if (!groups) return
    const lines = groups.flatMap((g) => [`# ${g.group}`, ...g.entries.map((e) => `${e.tag}: ${e.value}`), ''])
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f) }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input ref={fileRef} type="file" accept="image/jpeg,image/tiff,.jpg,.jpeg,.tif,.tiff" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
        <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium">Drop a JPEG or TIFF file here, or click to browse</p>
        <p className="text-sm text-muted-foreground mt-1">All parsing runs in your browser - no file is uploaded</p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {groups && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{filename}</p>
              <p className="text-xs text-muted-foreground">
                {groups.reduce((n, g) => n + g.entries.length, 0)} EXIF fields found
              </p>
            </div>
            <button onClick={copyAll} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy all'}
            </button>
          </div>

          {groups.map(({ group, entries }) => (
            <div key={group} className="card-base overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border">
                {group}
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {entries.map(({ tag, value }) => (
                    <tr key={tag} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 font-medium text-muted-foreground w-48 shrink-0 align-top">{tag}</td>
                      <td className="px-4 py-2 font-mono text-xs break-all">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
