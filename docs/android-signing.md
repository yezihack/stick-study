# Android 签名密钥与 GitHub Actions 配置指南

本文档说明如何为「学習打卡」生成 Android 签名密钥（keystore）、设置强密码，并配置 GitHub Actions 所需的环境变量（Secrets），以便 CI 自动打包 release APK。

---

## 一、背景

- Release APK 必须用同一个 keystore 签名。**一旦应用发布，keystore 不能更换**，否则用户无法覆盖安装更新。
- keystore 文件和密码属于机密，**绝不提交到 Git**。本仓库 `.gitignore` 已排除 `*.keystore`、`*.jks` 和 `android/keystore.properties`。
- 本地构建从 `android/keystore.properties` 读取签名信息；CI 构建从 GitHub Secrets 注入。

---

## 二、设置强密码

签名需要两个密码：**store 密码**（keystore 文件本身）和 **key 密码**（密钥条目）。建议两者使用不同的高强度密码。

强密码要求：
- 长度 ≥ 16 位
- 混合大小写字母、数字、符号
- 不含字典词、生日、项目名等可猜测内容
- 每个 keystore 独立，不复用其他账号密码

生成随机强密码：

Linux / macOS：

```bash
openssl rand -base64 24
```

Windows PowerShell：

```powershell
[Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Max 256 }))
```

把生成的两个密码先安全保存（密码管理器，如 Bitwarden / 1Password / KeePass）。**密码丢失 = keystore 作废**，无法找回。

---

## 三、生成 keystore

确保已安装 JDK（`keytool` 随 JDK 提供）。在项目根目录执行：

Linux / macOS：

```bash
keytool -genkeypair -v \
  -keystore android/stick-study.keystore \
  -alias stick-study \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass '你的STORE密码' \
  -keypass '你的KEY密码' \
  -dname "CN=Stick Study, OU=Dev, O=Stick Study, L=City, ST=State, C=CN"
```

Windows PowerShell：

```powershell
keytool -genkeypair -v `
  -keystore android\stick-study.keystore `
  -alias stick-study `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storepass "你的STORE密码" `
  -keypass "你的KEY密码" `
  -dname "CN=Stick Study, OU=Dev, O=Stick Study, L=City, ST=State, C=CN"
```

参数说明：

| 参数 | 含义 |
|------|------|
| `-alias stick-study` | 密钥别名，需与 `keystore.properties` 的 `keyAlias` 一致 |
| `-keyalg RSA -keysize 2048` | RSA 2048 位密钥（Google Play 推荐） |
| `-validity 10000` | 有效期约 27 年，确保覆盖应用生命周期 |
| `-storepass` / `-keypass` | 分别是 store 和 key 密码 |
| `-dname` | 证书主体信息，可按需修改 |

> 安全提示：命令行里直接写密码会留在 shell 历史中。更安全的做法是省略 `-storepass`/`-keypass`，让 `keytool` 交互式提示输入。

执行后会在 `android/stick-study.keystore` 生成密钥文件。

验证 keystore：

```bash
keytool -list -v -keystore android/stick-study.keystore -alias stick-study
```

---

## 四、本地构建配置

在 `android/keystore.properties` 写入（此文件已被 gitignore，不会提交）：

```properties
storeFile=stick-study.keystore
storePassword=你的STORE密码
keyAlias=stick-study
keyPassword=你的KEY密码
```

> `storeFile` 路径相对于 `android/` 目录。

之后本地即可打包：

```bash
npm run apk
```

输出位于 `android/app/build/outputs/apk/release/stick-study-<版本>-release.apk`。

---

## 五、GitHub Actions Secrets 配置

CI 工作流 `.github/workflows/build-apk.yml` 在 release 构建时，会从以下 4 个 Secrets 还原签名信息：

| Secret 名 | 内容 |
|-----------|------|
| `ANDROID_KEYSTORE_BASE64` | keystore 文件的 base64 编码（见下） |
| `ANDROID_KEYSTORE_PASSWORD` | 你的 STORE 密码 |
| `ANDROID_KEY_ALIAS` | `stick-study` |
| `ANDROID_KEY_PASSWORD` | 你的 KEY 密码 |

### 5.1 把 keystore 转成 base64

由于 keystore 是二进制文件，无法直接放进 Secret，需先转成 base64 文本。

Linux：

```bash
base64 -w 0 android/stick-study.keystore > keystore.b64
```

macOS：

```bash
base64 -i android/stick-study.keystore -o keystore.b64
```

Windows PowerShell：

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android\stick-study.keystore")) | Out-File keystore.b64 -NoNewline
```

> `-w 0`（Linux）和 `-NoNewline`（PowerShell）确保输出为不换行的单行字符串。

打开 `keystore.b64`，复制**全部内容**备用。

### 5.2 在 GitHub 添加 Secrets

1. 打开仓库 → **Settings** → 左侧 **Secrets and variables** → **Actions**
2. 点 **New repository secret**
3. 依次添加上表中的 4 个 Secret：
   - Name 填 Secret 名（如 `ANDROID_KEYSTORE_BASE64`）
   - Secret 填对应内容（base64 字符串 / 密码 / 别名）
4. 保存

### 5.3 用完删除临时文件

`keystore.b64` 含敏感数据，配置完成后删除：

```bash
rm keystore.b64        # Linux / macOS
del keystore.b64       # Windows
```

---

## 六、触发 CI 打包

工作流支持两种触发方式：

**方式 A — 推送 tag（自动打 release 并发布到 Release 页面）：**

```bash
git tag v1.0.7
git push origin v1.0.7
```

**方式 B — 手动触发：** 仓库 → **Actions** → 选择 **Build Android APK** → **Run workflow** → 选 `release` 或 `debug`。

> debug 构建不需要任何 Secret，可先用它验证流程是否跑通，再配置签名跑 release。

构建产物可在对应 workflow run 的 **Artifacts** 下载；tag 触发时还会自动发布到 GitHub Release。

---
