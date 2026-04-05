"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
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
      setFormData({
        customerName: "",
        customerPhone: "",
        projectTypes: [],
        projectLocation: "",
        parkingGap: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">提交成功！</h2>
          <p className="text-gray-600 mb-6">
            感谢您的留资，我们的专业顾问将尽快与您联系
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* 品牌头部 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            泊库云街 - 城市停车空间方案提供商
          </h1>
          <p className="text-gray-600 text-sm">
            专注二层立体车库，服务医院、老旧小区、城投公司
          </p>
        </div>

        {/* 留资表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            免费获取停车解决方案
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                姓名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="customerName"
                  required
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入您的姓名"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                手机
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  id="customerPhone"
                  required
                  pattern="[0-9]{11}"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入您的手机号"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标项目 *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                你拥有什么项目资源可以推荐合作建造车库呢？
              </p>
              <div className="space-y-2">
                {[
                  { value: "老旧小区", label: "老旧小区" },
                  { value: "医院", label: "医院" },
                  { value: "商场", label: "商场" },
                  { value: "城投", label: "城投" },
                  { value: "其他", label: "其他" },
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`project-${option.value}`}
                      checked={formData.projectTypes.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            projectTypes: [...formData.projectTypes, option.value],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            projectTypes: formData.projectTypes.filter(
                              (type) => type !== option.value
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`project-${option.value}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="projectLocation"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                项目所在地 *
              </label>
              <select
                id="projectLocation"
                required
                value={formData.projectLocation}
                onChange={(e) =>
                  setFormData({ ...formData, projectLocation: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">请选择省 / 市 / 区县</option>
                <option value="北京市">北京市</option>
                <option value="天津市">天津市</option>
                <option value="河北省">河北省</option>
                <option value="山西省">山西省</option>
                <option value="内蒙古自治区">内蒙古自治区</option>
                <option value="辽宁省">辽宁省</option>
                <option value="吉林省">吉林省</option>
                <option value="黑龙江省">黑龙江省</option>
                <option value="上海市">上海市</option>
                <option value="江苏省">江苏省</option>
                <option value="浙江省">浙江省</option>
                <option value="安徽省">安徽省</option>
                <option value="福建省">福建省</option>
                <option value="江西省">江西省</option>
                <option value="山东省">山东省</option>
                <option value="河南省">河南省</option>
                <option value="湖北省">湖北省</option>
                <option value="湖南省">湖南省</option>
                <option value="广东省">广东省</option>
                <option value="广西壮族自治区">广西壮族自治区</option>
                <option value="海南省">海南省</option>
                <option value="重庆市">重庆市</option>
                <option value="四川省">四川省</option>
                <option value="贵州省">贵州省</option>
                <option value="云南省">云南省</option>
                <option value="西藏自治区">西藏自治区</option>
                <option value="陕西省">陕西省</option>
                <option value="甘肃省">甘肃省</option>
                <option value="青海省">青海省</option>
                <option value="宁夏回族自治区">宁夏回族自治区</option>
                <option value="新疆维吾尔自治区">新疆维吾尔自治区</option>
                <option value="香港特别行政区">香港特别行政区</option>
                <option value="澳门特别行政区">澳门特别行政区</option>
                <option value="台湾省">台湾省</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="parkingGap"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                预计车位需求数量 *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                按车位数填写（双层按两个）
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <input
                  type="number"
                  id="parkingGap"
                  required
                  min="1"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  value={formData.parkingGap}
                  onChange={(e) =>
                    setFormData({ ...formData, parkingGap: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入预计车位需求数量"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "提交中..." : "提交"}
            </button>
          </form>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>厦门泊库智能科技有限公司</p>
          <p className="mt-1">专业提供千万级客单价特种设备解决方案</p>
        </div>
      </div>
    </div>
  );
}
