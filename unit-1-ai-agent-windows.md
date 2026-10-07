# 單元 1：在 Windows 用終端機安裝 AI Agent

AI Agent 是在終端機裡讀寫你專案檔案、執行指令的 AI 程式設計助手。本單元在 Windows 10／11 的 PowerShell 安裝四種：**Claude Code、Codex CLI、OpenCode、Gemini CLI**。不需要先設定 WSL，每個工具約 5 分鐘（視網速）。四個工具彼此獨立，裝你需要的就好。

**前提**

- Windows 10 或 11，64 位元，能連外網。
- 每個工具都需要自己的帳號或金鑰，裝完才能用（見下表）。

## 流程總覽

```text
[1 開啟 PowerShell 與準備] → [2 先看腳本再執行] → [3 安裝 AI Agent]
                                                      │
                                                      ├─ 3.1 Claude Code
                                                      ├─ 3.2 Codex CLI
                                                      ├─ 3.3 OpenCode
                                                      └─ 3.4 Gemini CLI
                                                      │
                                   [4 驗證、啟動與更新] → [5 使用前注意]
```

| 工具 | 廠商 | 登入方式 | Windows 安裝方式 |
| --- | --- | --- | --- |
| Claude Code | Anthropic | Pro／Max／Team／Enterprise／Console 帳號（免費 claude.ai 方案不含） | PowerShell 腳本、CMD、WinGet、npm |
| Codex CLI | OpenAI | ChatGPT 帳號（Plus、Pro、Business、Edu、Enterprise）或 API key | PowerShell 腳本、npm |
| OpenCode | 開源（anomalyco） | 自備任一模型供應商的 API key | npm、Scoop、Chocolatey |
| Gemini CLI | Google | Google 帳號登入、Gemini API key 或 Vertex AI | npm、npx |

## 1. 開啟 PowerShell 與準備

開始功能表搜尋 `PowerShell`，開啟一般的 Windows PowerShell 即可，**不需要系統管理員**。提示符號是 `PS C:\Users\你的名稱>`。

> 提示符號沒有 `PS` 的是 CMD（命令提示字元）。PowerShell 與 CMD 的指令不同，下面每個指令都標明要在哪裡執行。

### 建議：安裝 Git for Windows

```powershell
winget install --id Git.Git -e --source winget
```

Claude Code 在 Windows 原生執行時，有 Git for Windows 就用 Git Bash 當 Bash 工具，沒有就用 PowerShell 當 shell 工具，兩者都能用，官方建議安裝。其他工具也常會呼叫 `git`。裝完**關掉 PowerShell 再開新的**。

### 視需要：安裝 Node.js

OpenCode（npm 方式）、Gemini CLI 需要 Node.js；Claude Code 與 Codex 的 npm 方式也要。檢查：

```powershell
node --version
npm --version
```

沒有的話安裝 LTS 版，裝完同樣重開 PowerShell：

```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget
```

> 各工具對 Node.js 版本的下限不同（Claude Code 的 npm 方式官方要求 Node.js 22 以上），請以官方文件為準。只用 Claude Code 或 Codex 的腳本安裝時，不需要 Node.js。

## 2. 先看安裝腳本，再執行

四個工具中，Claude Code 與 Codex 官方都提供「`irm 網址 | iex`」一行式安裝，會直接執行網路上的腳本。教學環境的做法是**先下載、看過、再執行**，並且遵守：

- 確認下載網址是官方網域。
- 不為了省事全域放寬 PowerShell 執行原則。
- 不明來源的指令不要直接貼進終端機。

## 3. 安裝 AI Agent

以下四個工具各自獨立，只裝你需要的。每個工具的方法擇一即可。

### 3.1 Claude Code

三種方法擇一。**推薦方法 A**：原生安裝，會在背景自動更新。

#### 方法 A：PowerShell 原生安裝（推薦）

```powershell
cd ~
irm https://claude.ai/install.ps1 -OutFile claude-install.ps1
(Get-Content .\claude-install.ps1 | Measure-Object -Line).Lines
notepad .\claude-install.ps1
```

我們審閱過的版本（2026-10-07 下載，約 110 行）做的事：

- 只支援 64 位元 Windows，依 CPU 選 `win32-x64` 或 `win32-arm64`。
- 從 `downloads.claude.ai/claude-code-releases` 取得最新版本號與 `manifest.json`。
- 下載 `claude.exe`，**比對 manifest 內的 SHA256 校驗碼**，不符就刪檔並中止。
- 執行 `claude.exe install` 設定啟動器與 shell 整合，然後刪除暫存的安裝檔。

確認網址都是 `downloads.claude.ai` 後執行：

```powershell
Get-Content .\claude-install.ps1 -Raw | Invoke-Expression
```

> 用 `Get-Content ... | Invoke-Expression`，是因為 Windows 預設的執行原則可能擋下直接執行下載的 `.ps1` 檔。想省略審閱，可直接用官方一行式 `irm https://claude.ai/install.ps1 | iex`。

#### 方法 B：CMD 安裝

在 CMD（提示符號沒有 `PS`）執行：

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

在 PowerShell 貼這行會出現 `The token '&&' is not a valid statement separator`；在 CMD 貼 `irm ...` 會出現 `'irm' is not recognized`。看到這兩個錯誤，就是用錯終端機了。

#### 方法 C：WinGet

```powershell
winget install Anthropic.ClaudeCode
```

WinGet 安裝**不會自動更新**，要定期執行 `winget upgrade Anthropic.ClaudeCode`。

#### 其他：npm

```powershell
npm install -g @anthropic-ai/claude-code
```

裝的是同一個原生執行檔。升級用 `npm install -g @anthropic-ai/claude-code@latest`，不要用 `npm update -g`。

### 3.2 Codex CLI

#### 方法 A：官方 PowerShell 腳本

官方 Windows 指令：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
```

這個腳本約 1200 行，不適合逐行手動審閱。我們掃過的內容：它從 `releases.openai.com`（失敗時退回 GitHub Releases）下載，**比對 SHA-256 摘要**，不符就中止。`-ExecutionPolicy ByPass` 只作用在這一次的 PowerShell 行程，不會改動系統設定。

想先留一份腳本備查，可以另外下載：

```powershell
cd ~
irm https://chatgpt.com/codex/install.ps1 -OutFile codex-install.ps1
```

#### 方法 B：npm（腳本太長不想用時）

```powershell
npm install -g @openai/codex
```

### 3.3 OpenCode

OpenCode 官方文件的 Windows 說明是：「可以直接在 Windows 上執行，但建議用 WSL 以獲得最佳體驗」。原生 Windows 的安裝方式：

| 方法 | 指令 | 前提 |
| --- | --- | --- |
| npm | `npm install -g opencode-ai` | 已安裝 Node.js |
| Scoop | `scoop install opencode` | 已安裝 Scoop |
| Chocolatey | `choco install opencode` | 已安裝 Chocolatey，需系統管理員 PowerShell |

官方文件另提到 Bun 在 Windows 的安裝支援還在進行中，不建議用 Bun。官方的 `curl ... | bash` 腳本是 Linux／macOS 用的，不能在 PowerShell 執行。

已有 Node.js 的人用 npm 最直接：

```powershell
npm install -g opencode-ai
```

啟動後用 `/connect` 設定供應商並輸入你自己的 API key。

### 3.4 Gemini CLI

```powershell
npm install -g @google/gemini-cli
```

不想全域安裝、只想試用：

```powershell
npx @google/gemini-cli
```

登入有三種：Google 帳號（OAuth）、Gemini API key（到 aistudio.google.com/apikey 取得）、Vertex AI（企業用，需計費帳戶）。免費額度與限制會變動，以官方 repo 說明為準。

## 4. 驗證、啟動與更新

**每個工具裝完，關掉 PowerShell 開新的**（讓 PATH 生效），再驗證：

```powershell
claude --version
codex --version
opencode --version
gemini --version
```

只會有你裝過的那幾個有輸出，沒裝的會顯示找不到指令，這是正常的。Claude Code 另有診斷指令：

```powershell
claude doctor
```

**啟動：** 一律先進入專用的練習資料夾，再執行指令。第一次啟動會引導登入（瀏覽器或貼上 API key）：

```powershell
mkdir ~\projects\demo
cd ~\projects\demo
claude     # 或 codex、opencode、gemini
```

| 工具 | 啟動 | 更新 |
| --- | --- | --- |
| Claude Code | `claude` | `claude update`（原生安裝會自動更新；WinGet 用 `winget upgrade Anthropic.ClaudeCode`） |
| Codex CLI | `codex` | 重跑安裝腳本，或 `npm install -g @openai/codex@latest` |
| OpenCode | `opencode` | `opencode upgrade`（npm 安裝亦可重跑 `npm install -g opencode-ai`） |
| Gemini CLI | `gemini` | `npm install -g @google/gemini-cli@latest` |

OpenCode 常用指令（來自 `opencode --help`）：

| 指令 | 用途 |
| --- | --- |
| `opencode` | 開啟 TUI（預設） |
| `opencode run "訊息"` | 不開 TUI，直接送出一則訊息 |
| `opencode providers` | 管理 AI 供應商與認證 |
| `opencode models` | 列出可用模型 |
| `opencode uninstall` | 移除 OpenCode 與相關檔案 |

## 5. 使用前請注意

- **Windows 原生的 AI Agent 看得到你的整個使用者資料夾。** 它們能讀寫檔案、也能執行指令。請只在專用的練習資料夾（例如 `~\projects\demo`）啟動，不要在家目錄或放機密資料的資料夾啟動；重要檔案先備份或用 Git 存版本。需要與 Windows 隔離時，改用單元 2 建立 Linux 環境。
- **內容會送給模型供應商。** 這些工具會把你的程式碼與提示傳給你選的供應商。教學時不要放機密資料。
- **API key 與登入資訊請自己保管。** 不要貼在聊天室、截圖或公開的程式碼庫。認證資料存放在哪裡，本文沒有逐一查證，使用前請先看各工具官方文件。
- **全域 npm 安裝不要用管理員權限硬裝。** 遇到權限錯誤，改用該工具的腳本、WinGet 或 Scoop。

## 常見問題

| 狀況 | 處理 |
| --- | --- |
| 指令找不到（`claude`、`codex`、`opencode`、`gemini`） | 關掉終端機開新的；仍找不到是 PATH 還沒包含安裝目錄，用 `where.exe 指令名` 確認 |
| `The token '&&' is not a valid statement separator` | 你在 PowerShell 貼了 CMD 的指令，改用方法 A |
| `'irm' is not recognized as an internal or external command` | 你在 CMD 貼了 PowerShell 的指令，改開 PowerShell |
| 安裝時出現 `403` 或連線錯誤 | 檢查網路、VPN 或公司代理是否擋住對應網域（`claude.ai`、`downloads.claude.ai`、`chatgpt.com`、`releases.openai.com`、`registry.npmjs.org`） |
| 提示所在地區不支援 | 各工具對國家與地區有各自限制，見官方文件（Claude Code 見 Anthropic supported countries） |
| 直接執行 `.ps1` 被擋（執行原則） | 用本文的 `Get-Content ... \| Invoke-Expression`，或官方指令的行程內 `-ExecutionPolicy ByPass`；不要全域放寬 |
| `npm` 找不到 | 先安裝 Node.js（第 1 節），並重開 PowerShell |
| `npm` 權限錯誤 | 不要用管理員權限硬裝；改用腳本、WinGet 或 Scoop |
| 想移除 Claude Code | WinGet 安裝用 `winget uninstall Anthropic.ClaudeCode`；原生安裝請照官方 Uninstall 章節，並先確認要刪的路徑 |

## 版本與驗證範圍

本單元依各工具官方文件（查閱日 2026-10-07）整理，並讀過 `https://claude.ai/install.ps1` 全文（約 110 行）與 `https://chatgpt.com/codex/install.ps1` 的關鍵段落（約 1200 行，只掃過，沒有逐行審閱）。**沒有執行任何安裝腳本。**

**尚未在乾淨的 Windows 上實測，請照做時留意**：

- Claude Code 方法 A 的「先下載、審閱，再用 `Invoke-Expression` 執行」流程（官方只給一行式）、方法 B（CMD）、方法 C（WinGet）。
- Codex CLI 的腳本與 npm 方式、Gemini CLI 的 npm 與 npx、OpenCode 的 npm／Scoop／Chocolatey。
- 各工具在 Windows Terminal 下的顯示效果，以及登入與供應商連線流程。
- 各工具的更新指令（Codex、Gemini CLI 的更新方式是依 npm 慣例推定，官方頁面未逐項列出）。
- 各工具的 Node.js 版本下限（只有 Claude Code 的 npm 方式官方明確寫 Node.js 22 以上）。

## 出處

- [Claude Code：Advanced setup](https://code.claude.com/docs/en/setup)：系統需求、Windows 原生安裝（PowerShell、CMD、WinGet、npm）、Git for Windows、驗證、登入、更新與移除。
- [Claude Code：Troubleshoot installation and login](https://code.claude.com/docs/en/troubleshoot-install)：PATH、`403`、各種安裝錯誤。
- [OpenAI Codex CLI（GitHub）](https://github.com/openai/codex)：Windows 安裝指令、npm 安裝、登入方式。
- [OpenCode：Install](https://opencode.ai/docs/)：npm、Scoop、Chocolatey 等安裝方式、Windows 注意事項。
- [OpenCode：Windows (WSL)](https://opencode.ai/docs/windows-wsl/)：Windows 建議使用 WSL。
- [Gemini CLI（GitHub）](https://github.com/google-gemini/gemini-cli)：npm、npx 安裝與登入方式。
- 本機審閱：`https://claude.ai/install.ps1`（2026-10-07，全文）、`https://chatgpt.com/codex/install.ps1`（2026-10-07，關鍵段落）。

## 下一單元

要在與 Windows 隔離、可隨時還原的環境練習，繼續[單元 2：安裝 AlmaLinux 10](https://ryan-chpeng.github.io/alma-wsl-training/unit-2.html)。

## 授權

本文內容以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權，轉載或改作請標示出處。
