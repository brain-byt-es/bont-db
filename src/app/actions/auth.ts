"use server"

import prisma from "@/lib/prisma"

export async function verifyEmailAction(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token }
    })

    if (!verificationToken) {
        return { error: "Invalid token" }
    }

    if (new Date() > verificationToken.expires) {
        return { error: "Token expired" }
    }

    const existingUser = await prisma.user.findFirst({
        where: { email: verificationToken.identifier }
    })

    if (!existingUser) {
        return { error: "User not found" }
    }

    await prisma.user.update({
        where: { id: existingUser.id },
        data: { emailVerified: new Date() }
    })

    await prisma.verificationToken.delete({
        where: { token }
    })

    return { success: true }
}
