import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 公开接口：通过推广码获取合伙人姓名（用于客户留资页面展示）
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "缺少推广码" }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({
      where: { referralCode: code },
      select: { name: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "未找到合伙人" }, { status: 404 });
    }

    return NextResponse.json({ name: agent.name });
  } catch {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
