import { getExportData } from "@/app/(dashboard)/export/actions"
import { getOrganizationContext } from "@/lib/auth-context"
import { format } from "date-fns"
import { CheckCircle2 } from "lucide-react"
import { PrintButton } from "./print-button"

export default async function CertificationReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; indication?: string }>
}) {
  const { from, to, indication } = await searchParams
  const [data, ctx] = await Promise.all([
    getExportData(),
    getOrganizationContext()
  ])

  if (!ctx) return <div>Unauthorized</div>

  // Filter Data
  const fromDate = from ? new Date(from) : null
  const toDate = to ? new Date(to) : null
  
  const filteredData = data.filter(r => {
    const d = new Date(r.treatment_date)
    if (fromDate && d < fromDate) return false
    if (toDate && d > toDate) return false
    if (indication && indication !== 'all' && r.indication !== indication) return false
    return true
  })

  // Sort: Patient Code ASC, then Date ASC (Oldest First)
  // This satisfies "Chronologische Reihenfolge" within "Mehrfachbehandlungen" (Patient grouping)
  filteredData.sort((a, b) => {
    const pA = a.patients?.patient_code || ''
    const pB = b.patients?.patient_code || ''
    const patientCompare = pA.localeCompare(pB, undefined, { numeric: true, sensitivity: 'base' })
    if (patientCompare !== 0) return patientCompare
    
    return new Date(a.treatment_date).getTime() - new Date(b.treatment_date).getTime()
  })

  // Summary Stats
  const stats = {
    total: filteredData.length,
    spasticity: filteredData.filter(r => r.indication === 'spastik').length,
    dystonia: filteredData.filter(r => r.indication === 'dystonie').length,
    headache: filteredData.filter(r => r.indication === 'kopfschmerz').length,
    autonomic: filteredData.filter(r => r.indication === 'autonom').length,
    other: filteredData.filter(r => !['spastik', 'dystonie', 'kopfschmerz', 'autonom'].includes(r.indication)).length
  }

  const doctorName = ctx.membership.user.displayName || "Unknown Provider"
  const orgName = ctx.organization.name

  return (
    <div className="min-h-screen bg-white p-8 text-black print:p-0 font-sans">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold mb-2">Behandlungsdokumentation</h1>
                <p className="text-sm text-gray-600 uppercase tracking-wider">AK Botulinumtoxin Zertifizierung " Qualifizierte Botulinumtoxintherapie"</p>
            </div>
            <div className="text-right text-sm">
                <p className="font-bold">{doctorName}</p>
                <p>{orgName}</p>
                <p className="text-gray-500 mt-1">Generated: {format(new Date(), 'dd.MM.yyyy')}</p>
            </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg border print:border-gray-200 print:bg-white">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Zusammenfassung der Diagnosegruppen</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 bg-white rounded border print:border-gray-200">
                <span className="block text-2xl font-bold">{stats.total}</span>
                <span className="text-xs text-gray-500">Gesamt</span>
            </div>
            <div className="p-3 bg-white rounded border print:border-gray-200">
                <span className="block text-xl font-semibold">{stats.spasticity}</span>
                <span className="text-xs text-gray-500">Spastik</span>
            </div>
            <div className="p-3 bg-white rounded border print:border-gray-200">
                <span className="block text-xl font-semibold">{stats.dystonia}</span>
                <span className="text-xs text-gray-500">Dystonie</span>
            </div>
            <div className="p-3 bg-white rounded border print:border-gray-200">
                <span className="block text-xl font-semibold">{stats.headache}</span>
                <span className="text-xs text-gray-500">Kopfschmerz</span>
            </div>
            <div className="p-3 bg-white rounded border print:border-gray-200">
                <span className="block text-xl font-semibold">{stats.autonomic}</span>
                <span className="text-xs text-gray-500">Autonom</span>
            </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 italic">
            * Diese Zusammenfassung dient der Übersicht "Aufteilung / Zuordnung der Diagnosegruppen".
        </p>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 font-semibold print:bg-gray-50">
                <tr>
                    <th className="p-3 border-b">Datum</th>
                    <th className="p-3 border-b">Patient ID</th>
                    <th className="p-3 border-b">Indikation</th>
                    <th className="p-3 border-b">Region / Muskeln</th>
                    <th className="p-3 border-b">Präparat</th>
                    <th className="p-3 border-b text-right">Dosis (U)</th>
                    <th className="p-3 border-b">Verdünnung</th>
                    <th className="p-3 border-b">Info</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {filteredData.map((row) => (
                    <tr key={row.id} className="break-inside-avoid hover:bg-gray-50">
                        <td className="p-3 whitespace-nowrap align-top">
                            {format(new Date(row.treatment_date), 'dd.MM.yyyy')}
                        </td>
                        <td className="p-3 font-mono text-xs align-top">
                            {row.patients?.patient_code || 'N/A'}
                            <div className="text-[10px] text-gray-400">JG {row.patients?.birth_year || '?'}</div>
                        </td>
                        <td className="p-3 align-top">
                            <span className="capitalize px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium border print:border-gray-300 print:bg-white">
                                {row.indication}
                            </span>
                        </td>
                        <td className="p-3 max-w-[200px] text-xs align-top">
                            {row.treatment_site}
                        </td>
                        <td className="p-3 align-top">
                            {row.product}
                        </td>
                        <td className="p-3 text-right font-mono align-top">
                            {row.total_units}
                        </td>
                        <td className="p-3 text-xs text-gray-500 align-top">
                            {row.dilution || '-'}
                        </td>
                        <td className="p-3 text-xs align-top">
                            {row.is_supervised && (
                                <div className="flex items-center gap-1 text-blue-600 print:text-black">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Supervised</span>
                                </div>
                            )}
                            {row.supervisor && (
                                <div className="text-[9px] text-gray-400 truncate max-w-[100px]">
                                    {row.supervisor}
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t text-center text-xs text-gray-400 print:fixed print:bottom-0 print:left-0 print:w-full print:bg-white print:pb-4">
        <p>Dokumentation erstellt mit InjexPro Docs. Anonymisierte Daten gemäß Datenschutzbestimmungen.</p>
      </div>

      <PrintButton />
    </div>
  )
}
