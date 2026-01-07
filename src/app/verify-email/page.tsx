import { verifyEmailAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const token = params.token as string

    if (!token) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <XCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold">Invalid Request</h1>
                <p>No token provided.</p>
                <Button asChild>
                    <Link href="/login">Go to Login</Link>
                </Button>
            </div>
        )
    }

    const result = await verifyEmailAction(token)

    if (result.error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <XCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold">Verification Failed</h1>
                <p>{result.error}</p>
                <Button asChild>
                    <Link href="/login">Go to Login</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <h1 className="text-2xl font-bold">Email Verified</h1>
            <p>Your email has been successfully verified.</p>
            <Button asChild>
                <Link href="/login">Go to Login</Link>
            </Button>
        </div>
    )
}
