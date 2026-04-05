import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 品牌头部 */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-white"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            泊库云街 - 城市停车空间方案提供商
          </h1>
          <p className="text-gray-600 text-lg">
            厦门泊库智能科技有限公司
          </p>
          <p className="text-gray-500 text-sm mt-2">
            专注二层立体车库，服务医院、老旧小区、城投公司
          </p>
        </div>

        {/* 功能入口 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* 客户留资入口 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              客户留资
            </h2>
            <p className="text-gray-600 mb-4">
              客户通过代理商推广链接访问的留资落地页
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
              路由：/invite/[agentCode]
            </div>
          </div>

          {/* 代理商入口 */}
          <Link href="/agent" className="group">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow cursor-pointer">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                代理商看板
              </h2>
              <p className="text-gray-600 mb-4">
                代理商登录后查看自己的推广链接和客户线索
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
                路由：/agent
              </div>
            </div>
          </Link>

          {/* 管理员入口 */}
          <Link href="/admin" className="group">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow cursor-pointer">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                管理后台
              </h2>
              <p className="text-gray-600 mb-4">
                总部管理员进行代理商管理和线索跟进
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
                路由：/admin
              </div>
            </div>
          </Link>
        </div>

        {/* 底部信息 */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>代理商营销裂变与留资追踪系统</p>
          <p className="mt-2">科技 · 专业 · 简约 · 商务</p>
        </div>
      </div>
    </div>
  );
}
