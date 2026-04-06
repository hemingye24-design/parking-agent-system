import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    }

    const currentPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (oldPassword !== currentPassword) {
      return NextResponse.json({ error: "原密码错误" }, { status: 401 });
    }

    // 管理员密码存在环境变量中，运行时修改 process.env
    // 注意：重新部署后会恢复为环境变量中设置的值
    process.env.ADMIN_PASSWORD = newPassword;

    return NextResponse.json({ success: true, message: "密码已修改（重新部署后需在Zeabur环境变量中同步更新）" });
  } catch (error) {
    console.error("修改密码失败:", error);
    return NextResponse.json({ error: "修改密码失败" }, { status: 500 });
  }
}
