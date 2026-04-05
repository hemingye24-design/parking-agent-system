"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [leads, setLeads] = useState<LeadWithMaskedPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrcode, setQrcode] = useState<string>("");

  useEffect(() => {
    // 检查登录状态
    const storedAgent = localStorage.getItem("agent");
    if (!storedAgent) {
      router.push("/agent");
      return;
    }

    const agentData = JSON.parse(storedAgent);
    setAgent(agentData);

    // 生成二维码
    const referralLink = `${window.location.origin}/invite/${agentData.referralCode}`;
    QRCode.toDataURL(referralLink, {
      width: 200,
      margin: 1,
    })
      .then((url) => {
        setQrcode(url);
      })
      .catch((err) => {
        console.error("生成二维码失败:", err);
      });

    // 获取线索列表
    fetchLeads(agentData.id);
  }, [router]);

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

  const handleCopyLink = () => {
    if (!agent) return;
    
    const referralLink = `${window.location.origin}/invite/${agent.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    alert("推广链接已复制到剪贴板！");
  };

  const handleLogout = () => {
    localStorage.removeItem("agent");
    router.push("/agent");
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部欢迎信息 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                欢迎，{agent.name}
              </h1>
              <p className="text-gray-600">
                推广码：<span className="font-mono font-semibold text-blue-600">{agent.referralCode}</span>
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* 二维码 */}
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                {qrcode ? (
                  <img
                    src={qrcode}
                    alt="推广二维码"
                    className="w-32 h-32"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-sm">生成中...</span>
                  </div>
                )}
                <p className="text-xs text-center mt-2 text-gray-500">
                  扫码填写表单
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  复制推广链接
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 线索列表 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            我的线索 ({leads.length})
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-600">加载中...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p>暂无线索</p>
              <p className="text-sm mt-2">分享您的推广链接，获取客户线索</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {lead.customerName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {lead.customerPhone}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>项目类型：{lead.projectTypes}</p>
                        <p>项目地点：{lead.projectLocation}</p>
                        <p>车位缺口：{lead.parkingGap} 个</p>
                        <p className="text-xs text-gray-400">
                          提交时间：{new Date(lead.createdAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[lead.status]
                        }`}
                      >
                        {statusLabels[lead.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
