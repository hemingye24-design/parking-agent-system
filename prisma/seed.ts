import "dotenv/config";

async function main() {
  console.log("开始创建种子数据...");

  // 使用 fetch API 直接调用后端接口创建数据
  const baseUrl = "http://localhost:3000";

  // 创建合伙人
  const agent1 = await fetch(`${baseUrl}/api/admin/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "张三",
      phone: "13800138001",
      referralCode: "A1001",
    }),
  }).then((res) => res.json());

  const agent2 = await fetch(`${baseUrl}/api/admin/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "李四",
      phone: "13900139002",
      referralCode: "A1002",
    }),
  }).then((res) => res.json());

  console.log("已创建合伙人:", agent1.agent?.name, agent2.agent?.name);
  console.log("种子数据创建完成！请启动开发服务器后运行此脚本。");
}

main().catch(console.error);
