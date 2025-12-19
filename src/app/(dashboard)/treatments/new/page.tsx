import { RecordForm } from "@/components/record-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function NewTreatmentPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { subjectId } = await searchParams

  const { data: patients } = await supabase
    .from('patients')
    .select('id, patient_code')
    .order('patient_code', { ascending: true })

  return (
    <div className="mx-auto max-w-4xl p-4">
       <Card>
        <CardHeader>
          <CardTitle>New Treatment Record</CardTitle>
          <CardDescription>Enter details for the new procedure.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecordForm patients={patients || []} defaultSubjectId={subjectId} />
        </CardContent>
       </Card>
    </div>
  )
}
