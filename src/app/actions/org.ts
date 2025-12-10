"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { createOrgSchema } from "@/src/lib/validations/org.schema";
import { generateSlug, generateUniqueSlug } from "@/src/lib/utils";
import { revalidatePath } from "next/cache";

export async function createOrganization(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        success: false,
        error: "You must be logged in to create an organization",
      };
    }

    const name = formData.get("name") as string;

    const validatedData = createOrgSchema.parse({ name });

    const baseSlug = generateSlug(validatedData.name);

    const existingOrgs = await prisma.organization.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: { slug: true },
    });

    const existingSlugs = existingOrgs.map((org) => org.slug);
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    const org = await prisma.organization.create({
      data: {
        name: validatedData.name,
        slug: uniqueSlug,
        ownerId: session.user.id,
        memberships: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      orgSlug: org.slug,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to create organization",
    };
  }
}