import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "请输入手机号和密码" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.findUnique({
      where: { phone },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "未找到该合伙人，请联系管理员创建账户" },
        { status: 404 }
      );
    }

    if (agent.password !== password) {
      return NextResponse.json(
        { error: "密码错误" },
        { status: 401 }
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
    console.error("合伙人登录失败:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
