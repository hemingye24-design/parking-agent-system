"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lead, LeadStatus } from "@prisma/client";
import QRCode from "qrcode";

interface Agent {
  id: string;
  name: string;
  phone: string;
  referralCode: string;
}

interface LeadWithMaskedPhone extends Omit<Lead, "customerPhone"> {
  customerPhone: string;
}

const statusLabels: Record<LeadStatus, string> = {
  PENDING: "待联系",
  CONTACTED: "已初步沟通",
  PROPOSAL: "方案已出",
  SIGNED: "已签约",
  FAILED: "战败",
};

const statusColors: Record<LeadStatus, string> = {
  PENDING: "bg-gray-100 text-gray-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  PROPOSAL: "bg-yellow-100 text-yellow-800",
  SIGNED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function AgentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    }>
      <AgentDashboardContent />
    </Suspense>
  );
}

function AgentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [leads, setLeads] = useState<LeadWithMaskedPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrcode, setQrcode] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // token 方式免登录访问
      verifyToken(token);
    } else {
      // 传统 localStorage 方式
      const storedAgent = localStorage.getItem("agent");
      if (!storedAgent) {
        router.push("/agent");
        return;
      }
      const agentData = JSON.parse(storedAgent);
      initAgent(agentData);
    }
  }, [router, searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`/api/agent/verify?token=${token}`);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("agent", JSON.stringify(data.agent));
        localStorage.setItem("agentToken", token);
        initAgent(data.agent);
      } else {
        router.push("/agent");
      }
    } catch {
      router.push("/agent");
    }
  };

  const initAgent = (agentData: Agent) => {
    setAgent(agentData);
    generateQRCode(agentData);
    fetchLeads(agentData.id);
  };

  const generateQRCode = async (agentData: Agent) => {
    const referralLink = `${window.location.origin}/invite/${agentData.referralCode}`;
    try {
      const url = await QRCode.toDataURL(referralLink, {
        width: 400,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrcode(url);
    } catch (err) {
      console.error("生成二维码失败:", err);
    }
  };

  const fetchLeads = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agent/leads?agentId=${agentId}`);
      const data = await response.json();
      if (response.ok) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error("获取线索失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 生成带标注的推广二维码图片（可保存）
  const generatePosterQR = () => {
    if (!agent || !qrcode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 400;
    const h = 520;
    canvas.width = w;
    canvas.height = h;

    // 白色背景
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // 顶部蓝色条
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(0, 0, w, 60);

    // 公司名
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("泊库云街", w / 2, 38);

    // 绘制二维码
    const img = new Image();
    img.onload = () => {
      const qrSize = 280;
      const qrX = (w - qrSize) / 2;
      const qrY = 80;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // 代理人信息
      ctx.fillStyle = "#374151";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`推荐人：${agent.name}`, w / 2, qrY + qrSize + 30);

      ctx.fillStyle = "#6b7280";
      ctx.font = "14px sans-serif";
      ctx.fillText("长按识别二维码 · 免费获取停车方案", w / 2, qrY + qrSize + 58);

      // 底部
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px sans-serif";
      ctx.fillText("厦门泊库智能科技有限公司", w / 2, h - 15);

      // 触发下载
      const link = document.createElement("a");
      link.download = `泊库云街-${agent.name}-推广码.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = qrcode;
  };

  const handleCopyLink = () => {
    if (!agent) return;
    const referralLink = `${window.location.origin}/invite/${agent.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("agent");
    localStorage.removeItem("agentToken");
    router.push("/agent");
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  const signedCount = leads.filter((l) => l.status === "SIGNED").length;
  const pendingCount = leads.filter((l) => l.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* 隐藏的 canvas 用于生成图片 */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* 头部欢迎 */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {agent.name}，您好
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                推广码：<span className="font-mono font-semibold text-blue-600">{agent.referralCode}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              退出
            </button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{leads.length}</div>
              <div className="text-xs text-blue-500 mt-1">总线索</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-xs text-yellow-500 mt-1">待跟进</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{signedCount}</div>
              <div className="text-xs text-green-500 mt-1">已签约</div>
            </div>
          </div>
        </div>

        {/* 推广工具 */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">推广工具</h2>

          {/* 二维码预览 */}
          <div
            className="flex flex-col items-center mb-4 cursor-pointer"
            onClick={() => setShowQrModal(true)}
          >
            {qrcode ? (
              <img src={qrcode} alt="推广二维码" className="w-48 h-48 rounded-lg shadow-sm" />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">生成中...</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">点击查看大图</p>
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={generatePosterQR}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              保存二维码
            </button>
            <button
              onClick={handleCopyLink}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copied ? "已复制" : "复制链接"}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            保存二维码图片到相册，发送到微信群/朋友圈即可推广
          </p>
        </div>

        {/* 线索列表 */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            我的线索 ({leads.length})
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm">加载中...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">暂无线索</p>
              <p className="text-gray-400 text-xs mt-1">分享推广二维码，等待客户留资</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">{lead.customerName}</span>
                      <span className="text-xs text-gray-400 ml-2">{lead.customerPhone}</span>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>项目：{lead.projectTypes} · {lead.projectLocation}</p>
                    <p>车位需求：{lead.parkingGap} 个</p>
                    <p className="text-gray-400">
                      {new Date(lead.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 二维码大图弹窗 */}
        {showQrModal && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowQrModal(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">我的推广二维码</h3>
                <p className="text-sm text-gray-500 mb-4">客户扫码即可填写留资表单</p>
                {qrcode && (
                  <img src={qrcode} alt="推广二维码" className="w-64 h-64 mx-auto rounded-lg" />
                )}
                <p className="text-xs text-gray-400 mt-3 mb-4">推荐人：{agent.name}（{agent.referralCode}）</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={generatePosterQR}
                    className="bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700"
                  >
                    保存图片
                  </button>
                  <button
                    onClick={() => setShowQrModal(false)}
                    className="bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
