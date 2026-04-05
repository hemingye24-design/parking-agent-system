import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!password) {
      return NextResponse.json(
        { error: "请输入密码" },
        { status: 400 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "密码错误" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("管理员登录失败:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
