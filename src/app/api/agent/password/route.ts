import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, oldPassword, newPassword } = body;

    if (!agentId || !oldPassword || !newPassword) {
      return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(newPassword)) {
      return NextResponse.json({ error: "新密码必须为6位数字" }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });

    if (!agent) {
      return NextResponse.json({ error: "合伙人不存在" }, { status: 404 });
    }

    if (agent.password !== oldPassword) {
      return NextResponse.json({ error: "原密码错误" }, { status: 401 });
    }

    await prisma.agent.update({
      where: { id: agentId },
      data: { password: newPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("修改密码失败:", error);
    return NextResponse.json({ error: "修改密码失败" }, { status: 500 });
  }
}
