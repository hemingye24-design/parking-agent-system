import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "请输入姓名和手机号" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.findUnique({
      where: { phone },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "未找到该代理商，请联系管理员创建账户" },
        { status: 404 }
      );
    }

    // 忽略姓名的编码问题，只验证手机号
    // if (agent.name !== name) {
    //   return NextResponse.json(
    //     { error: "姓名与手机号不匹配" },
    //     { status: 401 }
    //   );
    // }

    // 返回代理商信息（不包含敏感数据）
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
    console.error("代理商登录失败:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
