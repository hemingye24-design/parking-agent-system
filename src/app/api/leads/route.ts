import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, projectTypes, projectLocation, parkingGap, agentCode } = body;

    // 验证必填字段
    if (!customerName || !customerPhone || !projectTypes || !projectLocation || !parkingGap || !agentCode) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 查找对应的代理商
    const agent = await prisma.agent.findUnique({
      where: { referralCode: agentCode },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "无效的推广码" },
        { status: 404 }
      );
    }

    // 创建线索
    const lead = await prisma.lead.create({
      data: {
        customerName,
        customerPhone,
        projectTypes,
        projectLocation,
        parkingGap: parseInt(parkingGap),
        agentId: agent.id,
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("创建线索失败:", error);
    return NextResponse.json(
      { error: "提交失败，请稍后重试: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
