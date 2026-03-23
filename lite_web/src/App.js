import React, {useEffect, useMemo, useState} from "react";
import {BrowserRouter, Link, Navigate, Route, Routes, useLocation} from "react-router-dom";
import {getApplicationByName, getApplicationLogin, getOAuthGetParameters, login, signup} from "./api/auth";

function Field({type = "text", value, onChange, autoComplete = "off", placeholder}) {
  return (
    <input
      className="h-12 w-full rounded-full border border-transparent bg-[#f5f5f7] px-5 text-base text-slate-800 outline-none transition focus:border-[#ffccd7] focus:bg-white focus:ring-2 focus:ring-[#ffe3ea]"
      type={type}
      value={value}
      autoComplete={autoComplete}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function isProviderVisibleForSignIn(providerItem) {
  if (!providerItem || !providerItem.provider) {
    return false;
  }
  if (providerItem.canSignIn === false) {
    return false;
  }

  const category = providerItem.provider.category;
  if (!["OAuth", "SAML", "Web3"].includes(category)) {
    return false;
  }
  if (providerItem.provider.type === "WeChatMiniProgram") {
    return false;
  }
  return true;
}

function getProviderHintAuthorizeUrl(search, providerName) {
  const params = new URLSearchParams(search || "");
  params.set("provider_hint", providerName);
  return `/login/oauth/authorize?${params.toString()}`;
}

function getProviderLogoUrl(provider) {
  if (!provider) {
    return "";
  }
  if (provider.type?.startsWith("Custom") && provider.customLogo) {
    return provider.customLogo;
  }
  if (provider.category === "OAuth" && provider.type) {
    return `/img/social_${provider.type.toLowerCase()}.png`;
  }
  return "";
}

function OtherLoginIcon({provider, search}) {
  const logo = getProviderLogoUrl(provider);
  const displayName = provider?.displayName || provider?.type || "Provider";
  return (
    <a
      href={getProviderHintAuthorizeUrl(search, provider.name)}
      className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white"
      aria-label={displayName}
      title={displayName}
    >
      {logo ? (
        <img src={logo} alt={displayName} className="h-6 w-6 object-contain" />
      ) : (
        <span className="text-xs text-slate-600">{displayName.slice(0, 2)}</span>
      )}
    </a>
  );
}

function SigninPanel({
  appInfo,
  location,
  loadingApp,
  error,
  setError,
  submitting,
  username,
  setUsername,
  password,
  setPassword,
  agreement,
  setAgreement,
  onSubmit,
  visibleProviderItems,
}) {
  const [loginMode, setLoginMode] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [smsCode, setSmsCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const availableSigninModes = useMemo(() => {
    if (!Array.isArray(appInfo?.signinMethods)) {
      return [
        {key: "password", label: "账号密码"},
        {key: "sms", label: "验证码"},
      ];
    }

    const modes = [];
    appInfo.signinMethods.forEach((signinMethod) => {
      if (!signinMethod || signinMethod.rule === "Hide password") {
        return;
      }
      if (signinMethod.name === "Password" && !modes.find((item) => item.key === "password")) {
        modes.push({key: "password", label: signinMethod.displayName || "账号密码"});
      }
      if (signinMethod.name === "Verification code" && !modes.find((item) => item.key === "sms")) {
        modes.push({key: "sms", label: signinMethod.displayName || "验证码"});
      }
    });

    if (modes.length === 0) {
      return [{key: "password", label: "账号密码"}];
    }
    return modes;
  }, [appInfo]);

  useEffect(() => {
    if (!availableSigninModes.find((item) => item.key === loginMode)) {
      setLoginMode(availableSigninModes[0]?.key || "password");
    }
  }, [availableSigninModes, loginMode]);

  const showLoginModeSwitch = availableSigninModes.length > 1;

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleGetSmsCode = () => {
    if (!username) {
      setError("请先输入手机号/邮箱");
      return;
    }
    if (countdown > 0) {
      return;
    }
    setError("");
    setCountdown(60);
  };

  const onSmsLogin = (e) => {
    e.preventDefault();
    if (!username || !smsCode) {
      setError("请输入手机号/邮箱和验证码");
      return;
    }
    setError("当前版本暂未接入短信验证码登录，请使用账号密码登录。");
  };

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <div className="pt-6 pb-8">
          <h1 className="text-center text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p className="mt-2 text-center text-gray-500">请输入您的账号信息以继续</p>
          <p className="mt-2 text-center text-sm text-gray-400">{appInfo?.displayName || "Casdoor Lite"}</p>
        </div>

        <div className="flex-1">
          {showLoginModeSwitch ? (
            <div className="mx-auto mb-8 flex w-full max-w-xs rounded-lg bg-gray-100 p-1">
              {availableSigninModes.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setLoginMode(item.key);
                    setError("");
                  }}
                  className={`flex-1 rounded-md px-4 py-2 text-center transition-colors ${loginMode === item.key ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}

          {loadingApp ? <p className="mb-3 text-sm text-slate-500">正在加载应用配置...</p> : null}
          {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p> : null}

          {!loadingApp && appInfo ? (
            <form className="space-y-6" onSubmit={loginMode === "password" ? onSubmit : onSmsLogin}>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="手机号/邮箱"
                  className="w-full border-b border-gray-200 py-3 pr-4 pl-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {loginMode === "password" ? (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="密码"
                    className="w-full border-b border-gray-200 py-3 pr-12 pl-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500"
                  >
                    {showPassword ? "隐藏" : "显示"}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="验证码"
                    className="w-full border-b border-gray-200 py-3 pr-28 pl-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGetSmsCode}
                    disabled={countdown > 0}
                    className={`absolute inset-y-0 right-0 flex items-center pr-2 text-sm ${countdown > 0 ? "text-gray-400" : "text-blue-500"}`}
                  >
                    {countdown > 0 ? `${countdown}s后重发` : "获取验证码"}
                  </button>
                </div>
              )}

              {loginMode === "password" ? (
                <>
                  <label className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-200"
                      checked={agreement}
                      onChange={(e) => setAgreement(e.target.checked)}
                    />
                    <span>
                      我已阅读并同意
                      {" "}
                      <a href="/" className="text-blue-600">《隐私政策》</a>
                    </span>
                  </label>

                  <div className="flex justify-end">
                    <button type="button" className="text-sm text-blue-500 hover:text-blue-700">忘记密码？</button>
                  </div>
                </>
              ) : null}

              <button
                type="submit"
                disabled={submitting || loadingApp}
                className="mt-4 w-full rounded-xl bg-blue-600 py-4 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting && loginMode === "password" ? "登录中..." : loginMode === "password" ? "登录" : "验证登录"}
              </button>
            </form>
          ) : null}

          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-sm text-gray-500">其他登录方式</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {visibleProviderItems.length > 0 ? (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
              {visibleProviderItems.map((providerItem) => (
                <OtherLoginIcon
                  key={providerItem?.provider?.name || providerItem?.provider?.type}
                  provider={providerItem.provider}
                  search={location.search}
                />
              ))}
            </div>
          ) : (
            <div className="mb-4 flex justify-center gap-8">
              <button type="button" className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-700">微信</div>
                <span className="mt-2 text-xs text-gray-600">微信</span>
              </button>
              <button type="button" className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">QQ</div>
                <span className="mt-2 text-xs text-gray-600">QQ</span>
              </button>
              <button type="button" className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">Apple</div>
                <span className="mt-2 text-xs text-gray-600">Apple</span>
              </button>
            </div>
          )}
        </div>

        <div className="py-8 text-center text-gray-600">
          还没有账号？
          {" "}
          <Link to={`/signup${location.search}`} className="ml-1 text-blue-500 hover:underline">立即注册</Link>
        </div>
      </div>
    </main>
  );
}

function AuthCard({mode}) {
  const [appInfo, setAppInfo] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [agreement, setAgreement] = useState(false);
  const location = useLocation();
  const oAuthParams = useMemo(() => getOAuthGetParameters(location.search), [location.search]);
  const visibleProviderItems = useMemo(() => {
    if (!Array.isArray(appInfo?.providers)) {
      return [];
    }
    return appInfo.providers.filter((item) => isProviderVisibleForSignIn(item));
  }, [appInfo]);
  const resolvedAppName = useMemo(() => {
    const queryApp = new URLSearchParams(location.search).get("app");
    if (queryApp && queryApp.trim()) {
      return queryApp.trim();
    }
    return process.env.REACT_APP_DEFAULT_CASDOOR_APP_NAME || process.env.REACT_APP_CASDOOR_APP_NAME || "";
  }, [location.search]);

  useEffect(() => {
    let active = true;
    const loadApp = async() => {
      setLoadingApp(true);
      setError("");
      try {
        const appName = resolvedAppName;
        const res = oAuthParams ? await getApplicationLogin(oAuthParams) : appName ? await getApplicationByName(appName) : null;
        if (!active) {
          return;
        }
        if (!res) {
          setError("请在 URL 传 app 参数，或配置 REACT_APP_DEFAULT_CASDOOR_APP_NAME。");
          return;
        }
        if (res.status !== "ok") {
          setError(res.msg || "加载应用信息失败");
          return;
        }
        setAppInfo(res.data);
      } catch (e) {
        setError("网络异常，无法加载应用配置");
      } finally {
        if (active) {
          setLoadingApp(false);
        }
      }
    };

    loadApp();
    return () => {
      active = false;
    };
  }, [oAuthParams, resolvedAppName]);

  const onSubmit = async(e) => {
    e.preventDefault();
    setError("");
    if (!appInfo) {
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (mode === "signin" && !agreement) {
      setError("请先阅读并同意隐私政策");
      return;
    }

    const values = {
      application: appInfo.name,
      organization: appInfo.organization,
      username,
      password,
    };
    if (email) {
      values.email = email;
    }

    setSubmitting(true);
    try {
      const result = mode === "signin" ? await login(values, oAuthParams) : await signup(values, oAuthParams);
      if (result.status !== "ok") {
        setError(result.msg || `${mode === "signin" ? "登录" : "注册"}失败`);
        return;
      }

      if (oAuthParams?.redirectUri) {
        if (typeof result.data === "string" && !result.data.includes("/")) {
          const redirectUrl = `${oAuthParams.redirectUri}${oAuthParams.redirectUri.includes("?") ? "&" : "?"}code=${result.data}&state=${oAuthParams.state || ""}`;
          window.location.href = redirectUrl;
          return;
        }
      }
      window.location.href = "/";
    } catch (e2) {
      setError("网络异常，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "signin") {
    return (
      <SigninPanel
        appInfo={appInfo}
        location={location}
        loadingApp={loadingApp}
        error={error}
        setError={setError}
        submitting={submitting}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        agreement={agreement}
        setAgreement={setAgreement}
        onSubmit={onSubmit}
        visibleProviderItems={visibleProviderItems}
      />
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 pb-8 pt-4 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <div className="mb-8 mt-8 flex flex-col items-center">
          <h1 className="text-lg font-medium text-slate-800">{appInfo?.displayName || "Casdoor Lite"}</h1>
          <p className="mt-2 text-sm text-slate-500">创建新账号</p>
        </div>

        {loadingApp ? <p className="mb-3 text-sm text-slate-500">正在加载应用配置...</p> : null}
        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p> : null}

        {!loadingApp && appInfo ? (
          <form className="space-y-3" onSubmit={onSubmit}>
            <Field value={username} onChange={setUsername} autoComplete="username" placeholder="请输入用户名" />
            <Field value={email} onChange={setEmail} autoComplete="email" placeholder="请输入邮箱" />
            <Field type="password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="请输入密码" />
            <Field type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" placeholder="请再次输入密码" />

            <button
              type="submit"
              disabled={submitting || loadingApp}
              className="mt-2 h-12 w-full rounded-full bg-blue-600 px-4 text-base font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "提交中..." : "注册"}
            </button>
          </form>
        ) : null}

        <div className="mt-6 text-center text-sm text-slate-500">
          已有账号？
          {" "}
          <Link className="text-blue-600" to={`/signin${location.search}`}>去登录</Link>
        </div>

        <div className="mt-auto pb-2 pt-10">
          {visibleProviderItems.length > 0 ? (
            <>
              <p className="mb-5 text-center text-sm text-slate-400">其他登录方式</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {visibleProviderItems.map((providerItem) => (
                  <OtherLoginIcon
                    key={providerItem?.provider?.name || providerItem?.provider?.type}
                    provider={providerItem.provider}
                    search={location.search}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<AuthCard mode="signin" />} />
        <Route path="/signup" element={<AuthCard mode="signup" />} />
      </Routes>
    </BrowserRouter>
  );
}
