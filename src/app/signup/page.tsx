import { Logo } from "@/components/logo"
import { SignupForm } from "@/components/signup-form"
import { AuthFooter } from "@/components/auth-footer"
import Image from 'next/image';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams
  return (
    <div className="flex min-h-svh flex-col">
      <div className="grid flex-1 lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Logo />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <SignupForm message={message} />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <Image
            src="/welcome-light.png"
            alt="Image"
            fill
            priority
            quality={100}
            className="absolute inset-0 h-full w-full object-cover block dark:hidden"
          />
          <Image
            src="/welcome-dark.png"
            alt="Image"
            fill
            priority
            quality={100}
            className="absolute inset-0 h-full w-full object-cover hidden dark:block"
          />
        </div>
      </div>
      <div className="px-6 md:px-10">
        <AuthFooter />
      </div>
    </div>
  )
}
