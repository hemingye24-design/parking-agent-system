"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import QRCode from "qrcode";

interface Agent {
  id: string;
  name: string;
  phone: string;
  referralCode: string;
  accessToken: string;
  createdAt: string;
  _count: {
    leads: number;
  };
}

interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  projectTypes: string;
  projectLocation: string;
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
  });
  const [copiedId, setCopiedId] = useState<string>("");
  const [showLoginQr, setShowLoginQr] = useState(false);
  const [loginQrUrl, setLoginQrUrl] = useState("");
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdError, setPwdError] = useState("");

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
      if (!response.ok) throw new Error(data.error || "创建失败");

      setShowAddAgent(false);
      setNewAgent({ name: "", phone: "" });
      fetchData();
      alert(`合伙人创建成功！推广码：${data.agent.referralCode}，初始密码：123456`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "创建失败");
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("确定要删除该合伙人吗？")) return;
    try {
      const response = await fetch(`/api/admin/agents?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("删除失败");
      fetchData();
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
      if (!response.ok) throw new Error("更新失败");
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新失败");
    }
  };

  const copyAgentDashboardLink = (agent: Agent) => {
    const link = `${window.location.origin}/agent/dashboard?token=${agent.accessToken}`;
    navigator.clipboard.writeText(link);
    setCopiedId(agent.id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const copyAgentInviteLink = (agent: Agent) => {
    const link = `${window.location.origin}/invite/${agent.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedId(`invite-${agent.id}`);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const showAgentLoginQr = async () => {
    const link = `${window.location.origin}/agent`;
    try {
      const url = await QRCode.toDataURL(link, { width: 300, margin: 2 });
      setLoginQrUrl(url);
      setShowLoginQr(true);
    } catch (err) {
      console.error("生成二维码失败:", err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("两次输入的新密码不一致");
      return;
    }
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "修改失败");
      alert("密码修改成功！");
      setShowPwdModal(false);
      setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : "修改失败");
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

  const totalLeads = leads.length;
  const signedLeads = leads.filter((l) => l.status === "SIGNED").length;
  const pendingLeads = leads.filter((l) => l.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
              <p className="text-gray-500 text-xs mt-1">厦门泊库智能科技有限公司</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={showAgentLoginQr}
                className="text-sm text-green-600 hover:text-green-800"
              >
                合伙人登录码
              </button>
              <button
                onClick={() => setShowPwdModal(true)}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                改密码
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                退出
              </button>
            </div>
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-purple-600">{agents.length}</div>
              <div className="text-xs text-purple-500 mt-1">合伙人</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{totalLeads}</div>
              <div className="text-xs text-blue-500 mt-1">总线索</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{pendingLeads}</div>
              <div className="text-xs text-yellow-500 mt-1">待跟进</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-green-600">{signedLeads}</div>
              <div className="text-xs text-green-500 mt-1">已签约</div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("agents")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "agents"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              合伙人 ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "leads"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              线索 ({leads.length})
            </button>
          </div>

          {/* 合伙人管理 */}
          {activeTab === "agents" && (
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-gray-900">合伙人列表</h2>
                <button
                  onClick={() => setShowAddAgent(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  + 添加
                </button>
              </div>

              {agents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">暂无合伙人</div>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{agent.name}</span>
                            <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              {agent.referralCode}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {agent.phone}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {agent._count.leads} 条线索
                          </span>
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            删除
                          </button>
                        </div>
                      </div>

                      {/* 快捷操作：复制链接 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyAgentDashboardLink(agent)}
                          className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
                            copiedId === agent.id
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {copiedId === agent.id ? "已复制 ✓" : "复制看板链接"}
                        </button>
                        <button
                          onClick={() => copyAgentInviteLink(agent)}
                          className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
                            copiedId === `invite-${agent.id}`
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {copiedId === `invite-${agent.id}` ? "已复制 ✓" : "复制推广链接"}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        将「看板链接」发给合伙人，他在微信中打开即可免登录查看线索
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 线索总览 */}
          {activeTab === "leads" && (
            <div className="p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">所有线索</h2>

              {leads.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">暂无线索</div>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <div key={lead.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-semibold text-gray-900 text-sm">{lead.customerName}</span>
                          <span className="text-xs text-gray-400 ml-2">{lead.customerPhone}</span>
                        </div>
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className={`text-xs px-2 py-1 rounded-lg border-0 font-medium ${statusColors[lead.status]}`}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p>项目：{lead.projectTypes} · {lead.projectLocation}</p>
                        <p>车位需求：{lead.parkingGap} 个</p>
                        <p className="text-gray-400">
                          合伙：{lead.agent.name}（{lead.agent.referralCode}）·{" "}
                          {new Date(lead.createdAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 合伙人登录二维码弹窗 */}
        {showLoginQr && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowLoginQr(false)}>
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">合伙人登录二维码</h2>
              <p className="text-xs text-gray-500 mb-4">合伙人扫码即可进入登录页面</p>
              {loginQrUrl && (
                <img src={loginQrUrl} alt="合伙人登录二维码" className="w-56 h-56 mx-auto rounded-lg" />
              )}
              <p className="text-xs text-gray-400 mt-3 mb-4">可截图放入合伙人海报中</p>
              <button
                onClick={() => setShowLoginQr(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200"
              >
                关闭
              </button>
            </div>
          </div>
        )}

        {/* 修改密码弹窗 */}
        {showPwdModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowPwdModal(false)}>
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">修改管理员密码</h2>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">原密码</label>
                  <input
                    type="password"
                    required
                    value={pwdForm.oldPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                    placeholder="请输入原密码"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                  <input
                    type="password"
                    required
                    value={pwdForm.newPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                    placeholder="请输入新密码"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                  <input
                    type="password"
                    required
                    value={pwdForm.confirmPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                    placeholder="再次输入新密码"
                  />
                </div>
                {pwdError && <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs">{pwdError}</div>}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowPwdModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">取消</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium">确认修改</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 添加合伙人弹窗 */}
        {showAddAgent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">添加合伙人</h2>

              <form onSubmit={handleAddAgent} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                  <input
                    type="text"
                    required
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号 *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{11}"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="11位手机号"
                  />
                </div>

                <p className="text-xs text-gray-400">推广码将自动生成（BK0001格式），初始密码为 123456</p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAgent(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700"
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
