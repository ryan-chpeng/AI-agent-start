# 單元 2：在 AlmaLinux 10 安裝 OpenCode

OpenCode 是終端機裡的 AI 程式設計助手。本單元帶你在單元 1 建好的 `Alma-OpenCode` 內安裝它，約 5 分鐘（下載約 1 分鐘，視網速）。

**前提**

- 已完成[單元 1](https://ryan-chpeng.github.io/alma-wsl-training/)，能用 `wsl -d Alma-OpenCode` 進入環境。
- 環境能連外網（安裝要從 GitHub 下載）。
- 使用 OpenCode 需要你自己的模型供應商 API key。官方文件的需求是「現代終端機」與「你要用的 LLM 供應商的 API key」。

## 流程總覽

```text
[1 進入環境與檢查] → [2 下載並審閱腳本] → [3 執行安裝] → [4 驗證] → [5 啟動與連線]

安裝後多了這些東西（都在你的 home 內，不需要 root）：

~/opencode-install.sh     ← 你下載的安裝腳本（可留著核對，也可自行移除）
~/.opencode/bin/opencode  ← OpenCode 執行檔
~/.bashrc                 ← 多一行 PATH 設定
```

## 1. 進入環境並檢查

在 PowerShell 進入環境：

```powershell
wsl -d Alma-OpenCode
```

出現 Linux 提示符號後，檢查工具與網路：

```bash
whoami
uname -m
curl --version | head -1
tar --version | head -1
curl -s -o /dev/null -w '%{http_code}\n' -I https://api.github.com/repos/anomalyco/opencode/releases/latest
```

預期：`whoami` 是你的使用者（不是 root）、`uname -m` 是 `x86_64`、`curl` 與 `tar` 都有版本資訊、最後一行是 `200`。

## 2. 下載並審閱安裝腳本

官方文件給的一行式安裝是 `curl -fsSL https://opencode.ai/install | bash`，會直接執行網路上的腳本。我們改成先下載、看過再執行：

```bash
cd ~
curl -fsSL https://opencode.ai/install -o opencode-install.sh
wc -l opencode-install.sh
bash -n opencode-install.sh && echo "語法檢查通過"
less opencode-install.sh
```

`less` 裡按空白鍵翻頁、按 `q` 離開。`bash -n` 只檢查語法，不會執行腳本。

我們審閱過的版本做的事只有三件：

- 偵測作業系統與 CPU 架構，選對應的下載檔。
- 從 `github.com/anomalyco/opencode` 的 release 下載壓縮檔，解壓到 `~/.opencode/bin`。
- 在 `~/.bashrc` 加一行 `export PATH=...`。

> 這個腳本不會比對下載檔的校驗碼。審閱時請確認下載網址是 `github.com/anomalyco/opencode`。
>
> 想核對你拿到的是不是同一份：2026-10-05 下載到的腳本，`sha256sum opencode-install.sh` 結果是 `fc3c1b2123f49b6df545a7622e5127d21cd794b15134fc3b66e1ca49f7fb297e`。若你的結果不同，代表官方更新過腳本，請重新審閱，這不一定是壞事。

## 3. 執行安裝

```bash
bash opencode-install.sh
```

過程會顯示進度條，結尾會看到：

```text
Successfully added opencode to $PATH in /home/<你的使用者名稱>/.bashrc
```

以及 OpenCode 的字樣標誌。安裝不需要 root，也不會動到 Windows。

## 4. 驗證

```bash
source ~/.bashrc
command -v opencode
opencode --version
```

預期 `command -v` 顯示 `/home/<你的使用者名稱>/.opencode/bin/opencode`，`--version` 顯示版本號。我們測試時是 `1.18.34`，你看到的版本可能更新。

## 5. 啟動與連線

OpenCode 要在專案資料夾內啟動：

```bash
mkdir -p ~/projects/demo
cd ~/projects/demo
opencode
```

進入畫面後，依官方文件的做法用 `/connect` 設定供應商，並輸入你自己的 API key。

常用的指令（來自 `opencode --help`）：

| 指令 | 用途 |
| --- | --- |
| `opencode` | 開啟 TUI（預設） |
| `opencode run "訊息"` | 不開 TUI，直接送出一則訊息 |
| `opencode providers` | 管理 AI 供應商與認證 |
| `opencode models` | 列出可用模型 |
| `opencode upgrade` | 升級到最新或指定版本 |
| `opencode uninstall` | 移除 OpenCode 與相關檔案 |

## 6. 使用前請注意

- **內容會送給模型供應商。** OpenCode 會把你的程式碼與提示傳給你選的供應商。教學時不要放機密資料。
- **API key 請自己保管。** 不要貼在聊天室、截圖或公開的程式碼庫。認證資料存放在哪裡，本文沒有查證，使用前請先看官方文件。
- **它只看得到 Linux 內的檔案。** 單元 1 關閉了 automount 與 interop，OpenCode 讀不到你的 Windows 磁碟。要讓它處理 Windows 的檔案，請用 `\\wsl.localhost\Alma-OpenCode\home\<你的使用者名稱>\` 把檔案拖進去。
- **`opencode serve` 與 `opencode web` 會啟動伺服器。** 它們預設綁定到哪個位址，本文沒有查證，沒有需要時不要啟用。

## 7. 存一份含 OpenCode 的基準（可選）

單元 1 存的基準是安裝 OpenCode 之前的狀態，還原後 OpenCode 會消失，需要重做本單元。想省下重裝時間，可以另存一份：

```powershell
wsl --terminate $Name
wsl --export $Name "$Root\backup\$Name-opencode-baseline.tar"
```

這裡的 `$Name`、`$Root` 是單元 1 設定的變數。**請在連線供應商、輸入 API key 之前存**，否則你的認證資料會被一起存進備份檔。

## 常見問題

| 狀況 | 處理 |
| --- | --- |
| `curl: (6) Could not resolve host` 或逾時 | 這是網路問題：檢查 Windows 是否能上網，以及 VPN 或公司代理是否擋住 GitHub |
| `opencode: command not found` | 執行 `source ~/.bashrc`，或關掉終端機重開；確認 `ls ~/.opencode/bin` 有 `opencode` |
| 腳本顯示 `Unsupported OS/Arch` | 腳本只支援特定組合（Linux 的 x64 與 arm64 等），請確認 `uname -m` |
| 你的 CPU 沒有 AVX2 | 腳本會自動改選 baseline 版本，不需要處理 |
| 畫面顯示亂碼或排版錯位 | 官方文件要求現代終端機，請改用 Windows Terminal 等支援完整色彩與 Unicode 的終端機（我們未實測） |

## 版本與驗證範圍

本單元在 AlmaLinux 10.2、WSL 2.7.14.0、OpenCode 1.18.34 實際執行過。

**已實測**：

- 環境檢查指令（工具、CPU、網路）。
- 在 Linux 內用 `curl -fsSL -o` 下載腳本，雜湊與我們審閱過的版本一致，`bash -n` 語法檢查通過。
- 執行腳本安裝（實測時是從 Windows 端把同一份檔案放進環境後執行，內容與你下載的相同）。
- 安裝結果：執行檔為 x86-64 ELF，`--version` 正常、新開的 shell 找得到、`--help` 指令清單正常。
- 單元 1 的 Windows 隔離在安裝後仍有效（`/mnt/c` 為空、不能呼叫 `powershell.exe`）。

**未實測，請照做時留意**：

- TUI 的互動畫面，以及 Windows Terminal 下的顯示效果。
- `/connect` 與任何模型供應商的連線。
- `opencode run`、`opencode upgrade`、`opencode uninstall`。
- 官方日後更新安裝腳本後的行為。

## 出處

- [OpenCode 官方文件](https://opencode.ai/docs/)：安裝腳本 `curl -fsSL https://opencode.ai/install | bash`、需求（現代終端機與供應商 API key）、`opencode` 啟動方式、`/connect` 設定。
- [anomalyco/opencode（GitHub）](https://github.com/anomalyco/opencode)：官方 repository，安裝腳本下載的 release 來源。
- 本機實測：`opencode --help` 的指令清單、安裝腳本全文審閱（`https://opencode.ai/install`，2026-10-05）。
- 未查證：認證資料的存放位置、`opencode serve` 與 `opencode web` 的預設綁定位址。

## 授權

本文內容以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權，轉載或改作請標示出處。
