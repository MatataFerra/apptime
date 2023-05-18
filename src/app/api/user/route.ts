/* eslint-disable no-console */
import prisma from "#/prisma/client";
import { Data, TypeData } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, res: NextApiResponse<TypeData>) {
  try {
    const user = await prisma.user.findFirst({
      include: {
        shifts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
          response: false,
        },
        { status: 400 }
      );
    }

    const parsedData = Data.safeParse({
      message: "success",
      response: true,
      user,
    });

    if (!parsedData.success) {
      console.log(
        "🚀 ~ file: route.ts:30 ~ GET ~ parsedData:",
        parsedData.error
      );
      return NextResponse.json(
        {
          message: parsedData.error.issues
            .map((issue) => issue.message)
            .join(","),
          response: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: parsedData.data.message,
        response: parsedData.data.response,
        user: parsedData.data.user,
      },
      { status: 200 }
    );
  } catch (error) {
    // Manejar errores de forma adecuada
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
        response: false,
      },
      { status: 500 }
    );
  }
}
