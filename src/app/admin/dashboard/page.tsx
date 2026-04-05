"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@prisma/client";

interface Agent {
  id: string;
  name: string;
  phone: string;
  referralCode: string;
  _count: {
    leads: number;
  };
}

interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  projectName: string;
  parkingGap: number;
  status: LeadStatus;
  createdAt: string;
  agent: {
    name: string;
    phone: string;
    referralCode: string;
  };
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"agents" | "leads">("agents");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    phone: "",
    referralCode: "",
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");
    if (!isAdmin) {
      router.push("/admin");
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, leadsRes] = await Promise.all([
        fetch("/api/admin/agents"),
        fetch("/api/admin/leads"),
      ]);

      const agentsData = await agentsRes.json();
      const leadsData = await leadsRes.json();

      if (agentsRes.ok) setAgents(agentsData.agents);
      if (leadsRes.ok) setLeads(leadsData.leads);
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgent),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "创建失败");
      }

      setShowAddAgent(false);
      setNewAgent({ name: "", phone: "", referralCode: "" });
      fetchData();
      alert("代理商创建成功！");
    } catch (err) {
      alert(err instanceof Error ? err.message : "创建失败");
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("确定要删除该代理商吗？")) return;

    try {
      const response = await fetch(`/api/admin/agents?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      fetchData();
      alert("删除成功！");
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: LeadStatus) => {
    try {
      const response = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status }),
      });

      if (!response.ok) {
        throw new Error("更新失败");
      }

      fetchData();
      alert("状态更新成功！");
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新失败");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                总部管理员后台
              </h1>
              <p className="text-gray-600 text-sm">
                厦门泊库智能科技有限公司
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("agents")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "agents"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              代理商管理 ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "leads"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              线索总览 ({leads.length})
            </button>
          </div>

          {/* 代理商管理 */}
          {activeTab === "agents" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  代理商列表
                </h2>
                <button
                  onClick={() => setShowAddAgent(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  添加代理商
                </button>
              </div>

              {agents.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  暂无代理商
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          姓名
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          手机号
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          推广码
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          线索数量
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          创建时间
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {agents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {agent.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {agent.phone}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="font-mono text-blue-600">
                              {agent.referralCode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {agent._count.leads}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(agent.createdAt).toLocaleString("zh-CN")}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleDeleteAgent(agent.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 线索总览 */}
          {activeTab === "leads" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                所有线索
              </h2>

              {leads.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  暂无线索
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                          推荐代理：{lead.agent.name}（{lead.agent.referralCode}）
                        </p>
                        <p className="text-xs text-gray-400">
                          提交时间：{new Date(lead.createdAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleUpdateLeadStatus(
                                lead.id,
                                e.target.value as LeadStatus
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
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
          )}
        </div>

        {/* 添加代理商弹窗 */}
        {showAddAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                添加新代理商
              </h2>

              <form onSubmit={handleAddAgent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgent.name}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    手机号
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{11}"
                    value={newAgent.phone}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入 11 位手机号"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    推广码
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgent.referralCode}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, referralCode: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：A1001"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAgent(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
