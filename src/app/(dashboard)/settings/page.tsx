import { syncStripeSession } from "@/app/actions/stripe"
import { redirect } from "next/navigation"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; success?: string; canceled?: string; session_id?: string }>
}) {
  const { success, canceled, session_id } = await searchParams

  // Attempt to sync session if we just returned from Stripe
  if (success === "true" && session_id) {
    await syncStripeSession(session_id)
  }

  // If returning from Stripe, go to billing
  if (success === "true" || canceled === "true") {
      const params = new URLSearchParams()
      if (success) params.set("success", success)
      if (canceled) params.set("canceled", canceled)
      redirect(`/settings/billing?${params.toString()}`)
  }

  // Default redirect
  redirect("/settings/general")
}
