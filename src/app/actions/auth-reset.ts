"use server"

import prisma from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { z } from "zod"

export async function requestPasswordReset(email: string) {
    const emailSchema = z.string().email()
    const result = emailSchema.safeParse(email)

    if (!result.success) {
        return { error: "Invalid email address" }
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findFirst({
        where: { email: normalizedEmail }
    })

    if (!user) {
        // Return success even if user not found to prevent enumeration
        return { success: true }
    }

    // Generate token
    const token = crypto.randomUUID()
    const expires = new Date(new Date().getTime() + 1 * 60 * 60 * 1000) // 1 hour

    // Delete existing tokens for this user/email to be safe
    // Note: VerificationToken primary key is not just identifier, so we delete by identifier
    // But schema says @@unique([identifier, token]), so we can have multiple tokens for same identifier?
    // Let's check schema: @@unique([identifier, token]), but also @unique on token.
    // So we can have multiple tokens for same identifier. 
    // To prevent spam, we could delete old ones, but it's okay to keep them or cleanup.
    // Let's just create a new one.

    await prisma.verificationToken.create({
        data: {
            identifier: normalizedEmail,
            token,
            expires
        }
    })

    // Send email
    // Fire and forget
    void sendPasswordResetEmail(normalizedEmail, token)

    return { success: true }
}

export async function resetPassword(token: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
        return { error: "Passwords do not match" }
    }

    if (password.length < 8) {
        return { error: "Password must be at least 8 characters" }
    }

    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token }
    })

    if (!verificationToken) {
        return { error: "Invalid or expired token" }
    }

    if (new Date() > verificationToken.expires) {
        return { error: "Token expired" }
    }

    const user = await prisma.user.findFirst({
        where: { email: verificationToken.identifier }
    })

    if (!user) {
        return { error: "User not found" }
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
    })

    await prisma.verificationToken.delete({
        where: { token }
    })

    return { success: true }
}
