# 單元 1：在 Windows 安裝 AI Agent（Claude Code / OpenCode）

AI Agent 是在終端機裡讀寫你專案檔案、執行指令的 AI 助手。本單元直接裝在 Windows 10／11 上，不需要先設定 WSL，約 5 到 10 分鐘（視網速）。單元 2 再建立隔離的 AlmaLinux 環境，之後想把 Agent 放進去練習時使用。

**前提**

- Windows 10 版本 1809 以上，或 Windows 11（Claude Code 官方需求）；64 位元，RAM 4 GB 以上，能連外網。
- 會用到的帳號：
  - **Claude Code**：需要 Pro、Max、Team、Enterprise 或 Console 帳號，免費的 claude.ai 方案不含 Claude Code。
  - **OpenCode**：需要你自己的模型供應商 API key。

兩個工具擇一或都裝皆可，彼此獨立。

## 流程總覽

```text
[1 開啟 PowerShell] → [2 安裝 Claude Code] → [3 驗證與登入]
                              │
                              └─(或)→ [4 安裝 OpenCode] → [5 啟動與連線]

Windows 原生 vs WSL（單元 2）：

Windows 原生 ── 安裝最簡單、可直接處理 C:、D: 的檔案   ── 本單元
WSL + Alma  ── 與 Windows 隔離、可重置、有 Linux 工具  ── 單元 2
```

| 項目 | Windows 原生（本單元） | WSL 內（單元 2） |
| --- | --- | --- |
| 安裝難度 | 一行指令 | 要先完成 WSL 與 Alma 設定 |
| 檔案存取 | 直接讀寫 Windows 檔案 | 預設隔離，需從檔案總管拖進去 |
| 打錯指令的影響範圍 | 你的 Windows 使用者資料 | 限制在 Linux 環境內，可還原 |
| Claude Code 沙盒功能（sandboxing） | 不支援 | WSL 2 支援 |

## 1. 開啟 PowerShell

開始功能表搜尋 `PowerShell`，開啟一般的 Windows PowerShell 即可，**不需要系統管理員**。提示符號是 `PS C:\Users\你的名稱>`。

> 如果提示符號沒有 `PS`，你開的是 CMD（命令提示字元）。PowerShell 與 CMD 的安裝指令不同，請照下面對應的方法做。

確認 Windows 版本：

```powershell
winver
```

### 建議：安裝 Git for Windows

Claude Code 在 Windows 原生執行時，**有 Git for Windows 就用 Git Bash 當 Bash 工具，沒有就用 PowerShell 當 shell 工具**。兩者都能用，官方建議安裝。

```powershell
winget install --id Git.Git -e --source winget
```

裝完關掉 PowerShell 再開新的，之後才找得到 `git`。

## 2. 安裝 Claude Code

下面三種方法擇一。**推薦方法 A**：原生安裝，會在背景自動更新。

### 方法 A：PowerShell 原生安裝（推薦）

官方文件給的一行式安裝是 `irm https://claude.ai/install.ps1 | iex`，會直接執行網路上的腳本。教學環境建議先下載、看過再執行：

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

審閱時請確認下載網址都是 `downloads.claude.ai`。確認後執行：

```powershell
Get-Content .\claude-install.ps1 -Raw | Invoke-Expression
```

> 這裡用 `Get-Content ... | Invoke-Expression`，是因為 Windows 預設的 PowerShell 執行原則可能擋下直接執行下載的 `.ps1` 檔。不要為了省事去全域放寬執行原則。
>
> 想省略審閱，可以直接用官方一行式：`irm https://claude.ai/install.ps1 | iex`。

### 方法 B：CMD 安裝

在 CMD（提示符號沒有 `PS`）執行，官方指令：

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

在 PowerShell 貼這行會出現 `The token '&&' is not a valid statement separator`；在 CMD 貼 `irm ...` 會出現 `'irm' is not recognized`。看到這兩個錯誤，就是用錯終端機了。

### 方法 C：WinGet

```powershell
winget install Anthropic.ClaudeCode
```

WinGet 安裝**不會自動更新**，要定期執行 `winget upgrade Anthropic.ClaudeCode`。

### 其他方式

已有 Node.js 22 以上時也能用 `npm install -g @anthropic-ai/claude-code`。它裝的是同一個原生執行檔。升級用 `npm install -g @anthropic-ai/claude-code@latest`，不要用 `npm update -g`。

## 3. 驗證與登入

**關掉 PowerShell，開一個新的**（讓 PATH 生效），然後：

```powershell
claude --version
claude doctor
```

預期 `--version` 顯示版本號，例如 `2.1.211 (Claude Code)`（你看到的版本可能更新）。`claude doctor` 只印出安裝與設定的診斷，不會開啟對話。

接著進入你的專案資料夾啟動，第一次會開瀏覽器登入：

```powershell
mkdir ~\projects\demo
cd ~\projects\demo
claude
```

照瀏覽器的提示登入帳號。若環境變數 `ANTHROPIC_API_KEY` 已設定，Claude Code 會改為詢問是否使用該 key。

## 4. 安裝 OpenCode（可選）

OpenCode 官方文件的 Windows 說明是：「可以直接在 Windows 上執行，但建議用 WSL 以獲得最佳體驗」。原生 Windows 的安裝方式有下面幾種：

| 方法 | 指令 | 前提 |
| --- | --- | --- |
| npm | `npm install -g opencode-ai` | 已安裝 Node.js |
| Scoop | `scoop install opencode` | 已安裝 Scoop |
| Chocolatey | `choco install opencode` | 已安裝 Chocolatey，需系統管理員 PowerShell |

官方文件另提到 Bun 在 Windows 的安裝支援還在進行中，不建議用 Bun。

已有 Node.js 的人用 npm 最直接：

```powershell
node --version
npm install -g opencode-ai
```

驗證（開新的 PowerShell）：

```powershell
opencode --version
```

> 想用 OpenCode 的完整體驗，建議照官方做法裝在 WSL 內，步驟見單元 2 第 9 節。官方的 `curl ... | bash` 安裝腳本是 Linux 用的，不能在 PowerShell 執行。

## 5. 啟動與連線

在專案資料夾內啟動：

```powershell
cd ~\projects\demo
opencode
```

進入畫面後，依官方文件用 `/connect` 設定供應商，並輸入你自己的 API key。

常用指令（來自 `opencode --help`）：

| 指令 | 用途 |
| --- | --- |
| `opencode` | 開啟 TUI（預設） |
| `opencode run "訊息"` | 不開 TUI，直接送出一則訊息 |
| `opencode providers` | 管理 AI 供應商與認證 |
| `opencode models` | 列出可用模型 |
| `opencode upgrade` | 升級到最新或指定版本 |
| `opencode uninstall` | 移除 OpenCode 與相關檔案 |

Claude Code 常用：`claude`（開啟互動對話）、`claude update`（手動更新）、`claude doctor`（診斷）。

## 6. 使用前請注意

- **Windows 原生的 Agent 看得到你的整個使用者資料夾。** 它能讀寫、也能執行指令。請只在專用的練習資料夾（例如 `~\projects\demo`）啟動，不要在家目錄或放機密資料的資料夾啟動；重要檔案先備份或用 Git 存版本。需要隔離時，用單元 2 的環境。
- **內容會送給模型供應商。** Agent 會把你的程式碼與提示傳給對應的供應商。教學時不要放機密資料。
- **API key 與登入資訊請自己保管。** 不要貼在聊天室、截圖或公開的程式碼庫。
- **審閱再執行。** 安裝腳本一律先下載、看過再跑；不明來源的指令不要直接貼進終端機。

## 常見問題

| 狀況 | 處理 |
| --- | --- |
| `claude` 或 `opencode` 找不到 | 關掉終端機開新的；仍找不到是 PATH 還沒包含安裝目錄，見 Claude Code 官方 Troubleshoot installation |
| `The token '&&' is not a valid statement separator` | 你在 PowerShell 貼了 CMD 的指令，改用方法 A |
| `'irm' is not recognized as an internal or external command` | 你在 CMD 貼了 PowerShell 的指令，改用方法 B，或另開 PowerShell |
| 安裝時出現 `403` 或 curl 錯誤 | 檢查網路、VPN 或公司代理是否擋住 `claude.ai` 與 `downloads.claude.ai`；官方有對照表 |
| 提示所在地區不支援 | Claude Code 只在 Anthropic 支援的國家與地區提供，見官方 supported countries |
| 直接執行 `.ps1` 被擋（執行原則） | 用本文的 `Get-Content ... \| Invoke-Expression`，不要全域放寬執行原則 |
| `npm` 權限錯誤 | 不要用管理員權限硬裝；改用 Scoop 或方法 A／C |
| 想移除 Claude Code | WinGet 安裝用 `winget uninstall Anthropic.ClaudeCode`；原生安裝請照官方 Uninstall 章節，並且先確認要刪的路徑 |

## 版本與驗證範圍

本單元依官方文件（查閱日 2026-10-07）整理，並實際讀過 `https://claude.ai/install.ps1` 全文（110 行，只讀沒有執行）。

**尚未在乾淨的 Windows 上完整實測，請照做時留意**：

- 方法 A 的「先下載、審閱，再用 `Invoke-Expression` 執行」流程（官方只給一行式）。
- 方法 B（CMD）與方法 C（WinGet）。
- OpenCode 在 Windows 原生的三種安裝方式，以及 TUI 在 Windows Terminal 下的顯示。
- 本機已有 Claude Code 時再次安裝的行為。
- `/connect` 與任何模型供應商的連線、登入流程。

## 出處

- [Claude Code 官方文件：Advanced setup](https://code.claude.com/docs/en/setup)：系統需求、Windows 原生安裝（PowerShell、CMD、WinGet）、Git for Windows、驗證、登入、更新與移除。
- [Claude Code 官方文件：Troubleshoot installation and login](https://code.claude.com/docs/en/troubleshoot-install)：PATH、`403`、各種安裝錯誤。
- [OpenCode 官方文件：Install](https://opencode.ai/docs/)：npm、Scoop、Chocolatey 等安裝方式，Windows 注意事項。
- [OpenCode 官方文件：Windows (WSL)](https://opencode.ai/docs/windows-wsl/)：Windows 建議使用 WSL。
- 本機實測：安裝腳本全文審閱（`https://claude.ai/install.ps1`，2026-10-07）。

## 下一單元

要在與 Windows 隔離、可隨時還原的環境練習，繼續[單元 2：安裝 AlmaLinux 10](https://ryan-chpeng.github.io/alma-wsl-training/unit-2.html)。

## 授權

本文內容以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權，轉載或改作請標示出處。
