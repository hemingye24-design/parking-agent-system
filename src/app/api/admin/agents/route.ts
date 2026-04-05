import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("获取代理商列表失败:", error);
    return NextResponse.json(
      { error: "获取代理商列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, referralCode } = body;

    if (!name || !phone || !referralCode) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
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

    // 检查推广码是否已存在
    const existingCode = await prisma.agent.findUnique({
      where: { referralCode },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "该推广码已被使用" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: { name, phone, referralCode },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("创建代理商失败:", error);
    return NextResponse.json(
      { error: "创建代理商失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "缺少代理商 ID" },
        { status: 400 }
      );
    }

    await prisma.agent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除代理商失败:", error);
    return NextResponse.json(
      { error: "删除代理商失败" },
      { status: 500 }
    );
  }
}
