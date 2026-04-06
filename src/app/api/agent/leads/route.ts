import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { error: "缺少合伙人 ID" },
        { status: 400 }
      );
    }

    const leads = await prisma.lead.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
    });

    // 对手机号进行脱敏处理
    const sanitizedLeads = leads.map((lead) => ({
      ...lead,
      customerPhone: maskPhone(lead.customerPhone),
    }));

    return NextResponse.json({ leads: sanitizedLeads });
  } catch (error) {
    console.error("获取线索失败:", error);
    return NextResponse.json(
      { error: "获取线索失败" },
      { status: 500 }
    );
  }
}

function maskPhone(phone: string): string {
  if (phone.length === 11) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  }
  return phone;
}
