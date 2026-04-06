import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 通过 accessToken 验证合伙人身份（免登录）
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "缺少访问令牌" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.findUnique({
      where: { accessToken: token },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "无效的访问令牌" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        phone: agent.phone,
        referralCode: agent.referralCode,
      },
    });
  } catch (error) {
    console.error("验证令牌失败:", error);
    return NextResponse.json(
      { error: "验证失败，请稍后重试" },
      { status: 500 }
    );
  }
}
