"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function InvitePage() {
  const params = useParams();
  const agentCode = params.agentCode as string;

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    projectTypes: [] as string[],
    projectLocation: "",
    parkingGap: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agentName, setAgentName] = useState("");

  useEffect(() => {
    // 获取代理人名称用于展示
    fetch(`/api/agent/info?code=${agentCode}`)
      .then((r) => r.json())
      .then((d) => { if (d.name) setAgentName(d.name); })
      .catch(() => {});
  }, [agentCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          projectTypes: formData.projectTypes.join(","),
          projectLocation: formData.projectLocation,
          parkingGap: formData.parkingGap,
          agentCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "提交失败");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">提交成功！</h2>
          <p className="text-gray-500 text-sm">
            感谢您的留资，我们的专业顾问将尽快与您联系。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 品牌头部 */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            泊库云街
          </h1>
          <p className="text-gray-500 text-xs">
            城市停车空间方案提供商 · 专注二层立体车库
          </p>
          {agentName && (
            <p className="text-blue-600 text-xs mt-2">
              {agentName} 为您推荐
            </p>
          )}
        </div>

        {/* 留资表单 */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            免费获取停车解决方案
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1.5">
                姓名 *
              </label>
              <input
                type="text"
                id="customerName"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="请输入您的姓名"
              />
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
                手机 *
              </label>
              <input
                type="tel"
                id="customerPhone"
                required
                pattern="[0-9]{11}"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="请输入11位手机号"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                目标项目类型 *
              </label>
              <div className="flex flex-wrap gap-2">
                {["老旧小区", "医院", "商场", "城投", "其他"].map((option) => {
                  const checked = formData.projectTypes.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          projectTypes: checked
                            ? formData.projectTypes.filter((t) => t !== option)
                            : [...formData.projectTypes, option],
                        });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        checked
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="projectLocation" className="block text-sm font-medium text-gray-700 mb-1.5">
                项目所在地 *
              </label>
              <select
                id="projectLocation"
                required
                value={formData.projectLocation}
                onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">请选择省/市</option>
                {[
                  "北京市", "天津市", "河北省", "山西省", "内蒙古自治区",
                  "辽宁省", "吉林省", "黑龙江省", "上海市", "江苏省",
                  "浙江省", "安徽省", "福建省", "江西省", "山东省",
                  "河南省", "湖北省", "湖南省", "广东省", "广西壮族自治区",
                  "海南省", "重庆市", "四川省", "贵州省", "云南省",
                  "西藏自治区", "陕西省", "甘肃省", "青海省",
                  "宁夏回族自治区", "新疆维吾尔自治区",
                  "香港特别行政区", "澳门特别行政区", "台湾省",
                ].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="parkingGap" className="block text-sm font-medium text-gray-700 mb-1.5">
                预计车位需求数量 *
              </label>
              <input
                type="number"
                id="parkingGap"
                required
                min="1"
                inputMode="numeric"
                value={formData.parkingGap}
                onChange={(e) => setFormData({ ...formData, parkingGap: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="双层按两个车位计算"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? "提交中..." : "免费获取方案"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>厦门泊库智能科技有限公司</p>
        </div>
      </div>
    </div>
  );
}
