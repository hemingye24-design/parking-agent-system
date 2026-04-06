import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        referralCode: true,
        accessToken: true,
        createdAt: true,
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("获取合伙人列表失败:", error);
    return NextResponse.json(
      { error: "获取合伙人列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "请填写姓名和手机号" },
        { status: 400 }
      );
    }

    // 检查手机号是否已存在
    const existingAgent = await prisma.agent.findUnique({
      where: { phone },
    });

    if (existingAgent) {
      return NextResponse.json(
        { error: "该手机号已被注册" },
        { status: 400 }
      );
    }

    // 自动生成推广码：BK0001, BK0002, ...
    const lastAgent = await prisma.agent.findFirst({
      where: { referralCode: { startsWith: "BK" } },
      orderBy: { referralCode: "desc" },
    });

    let nextNum = 1;
    if (lastAgent) {
      const num = parseInt(lastAgent.referralCode.replace("BK", ""), 10);
      if (!isNaN(num)) nextNum = num + 1;
    }
    const referralCode = `BK${String(nextNum).padStart(4, "0")}`;

    const agent = await prisma.agent.create({
      data: { name, phone, referralCode },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("创建合伙人失败:", error);
    return NextResponse.json(
      { error: "创建合伙人失败: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "缺少合伙人 ID" },
        { status: 400 }
      );
    }

    // 先删除关联的线索，再删除合伙人
    await prisma.lead.deleteMany({
      where: { agentId: id },
    });
    await prisma.agent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除合伙人失败:", error);
    return NextResponse.json(
      { error: "删除合伙人失败" },
      { status: 500 }
    );
  }
}
