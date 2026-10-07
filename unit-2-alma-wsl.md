# 單元 2：安裝 AlmaLinux 10（Windows + WSL2）

> **ver. 1.0** ｜ **Last edited: 2026-10-07** ｜ 預估 15–20 分鐘 ｜ Windows 10／11 ｜ WSL2 ｜ AlmaLinux 10

> [!IMPORTANT]
> 第 8 步的 `--unregister` 會**永久刪除**環境與裡面所有資料：先把需要的檔案複製出來，再還原。
> 要停止單一環境只用 `wsl --terminate <名稱>`，不要停掉整個 WSL（理由見常見問題下方的警告）。

---

## 💡 這個單元在做什麼

在自己的 Windows 電腦上建立**獨立、可重置**的 AlmaLinux 10 練習環境 `Alma-Training`。全程在 PowerShell 操作，約 15 到 20 分鐘（下載約 1 分鐘，視網速）。

**前提**：Windows 10／11 電腦。單元 1 的 AI Agent 是裝在 Windows 上；本單元是另外建立一個與 Windows 隔離、可隨時還原的 Linux 練習環境，兩個單元互相獨立。

WSL 提供的是現成的系統映像，不需要安裝光碟、不需要分割磁碟、不需要安裝開機程式，kernel 由 WSL 提供。

```text
[1 檢查環境] → [2 安裝 WSL 本體] → [3 更新 WSL] → [4 安裝 AlmaLinux 10]
                                                         │
[8 日常使用 / 還原] ← [7 存乾淨基準] ← [6 加固] ← [5 建立使用者]

安裝後的檔案配置（本文用 D:\WSL_Training，可改成任何有空間的磁碟）：

D:\WSL_Training\
 ├─ system\ext4.vhdx   ← 你的 AlmaLinux（虛擬硬碟，會隨使用變大）
 └─ backup\            ← 乾淨基準備份 (.tar)，弄壞時用來還原
```

- 適合練習：指令、套件管理（dnf）、使用者與權限、systemd 與服務設定。
- 不適合練習：自己安裝作業系統、分割磁碟、開機載入程式（GRUB）、kernel 本身，這些需要完整虛擬機。

---

## 🚀 1. 環境檢查

需求三項：

- Windows 11，或 Windows 10 版本 2004（Build 19041）以上。
- 磁碟至少預留 3 GB（安裝約 0.4 GB，使用與備份會增加；基準備份檔約 0.3 GB）。
- BIOS/UEFI 已啟用虛擬化（多數電腦預設已開）。

開啟 PowerShell（開始功能表搜尋 `PowerShell`），檢查 Windows 版本與 WSL 是否已安裝：

```powershell
winver
wsl --version
```

`wsl --version` 有顯示版本資訊就跳到第 3 步；顯示說明文字或找不到指令，做第 2 步。

## 📦 2. 安裝 WSL 本體（只在從未裝過 WSL 時做）

用系統管理員身分開啟 PowerShell（右鍵 → 以系統管理員身分執行）：

```powershell
wsl --install --no-distribution
```

完成後重新啟動電腦，重開後回到一般的 PowerShell 繼續。

## 🔄 3. 更新 WSL（一定要做）

```powershell
wsl --update
wsl --version
```

後面會用到 `--name` 與 `--location` 兩個旗標，舊版 WSL 可能不支援，先更新可避免「無法辨識的選項」錯誤。

## 🐧 4. 安裝 AlmaLinux 10

**設定變數並建立資料夾：**

```powershell
$Name = "Alma-Training"
$Root = "D:\WSL_Training"        # 改成你要放的磁碟與資料夾
New-Item -ItemType Directory -Force "$Root\system","$Root\backup" | Out-Null
```

**安裝（約 1 分鐘）：**

```powershell
wsl --install AlmaLinux-10 --name $Name --location "$Root\system" --no-launch
```

- 選 `AlmaLinux-10`（穩定版），不要選 `AlmaLinux-Kitten-10`（開發預覽版）。
- `--no-launch`：安裝後先不進入，下一步自己建立使用者。
- 成功訊息：「已成功安裝發佈。可以透過 『wsl.exe -d Alma-Training' 啟動」。

卡在 0.0% 時，改加 `--web-download` 重試：

```powershell
wsl --install AlmaLinux-10 --name $Name --location "$Root\system" --no-launch --web-download
```

**確認版本：**

```powershell
wsl -l -v
wsl -d $Name -u root --exec /usr/bin/cat /etc/almalinux-release
```

預期：`Alma-Training` 的 VERSION 是 2，系統顯示 `AlmaLinux release 10.x`（小版本號會隨映像更新而不同）。

## 👤 5. 建立使用者

先決定使用者名稱（小寫英文字母開頭，例如 `student`），建立後確認：

```powershell
$User = "student"                # 改成你的名稱
wsl -d $Name -u root --exec /usr/sbin/useradd -m -G wheel -s /bin/bash $User
wsl -d $Name -u root --exec /usr/bin/id $User
```

預期看到 `uid=1000(...)` 且 groups 包含 `10(wheel)`。

**設密碼（建議）**：之後要用 `sudo` 安裝套件，帳號必須有密碼。

```powershell
wsl -d $Name -u root --exec /usr/bin/passwd $User
```

依提示輸入兩次密碼（輸入時畫面不會顯示字元，這是正常的）。

> [!NOTE]
> 不設密碼的話：帳號是鎖定狀態，在本機用 `wsl -d Alma-Training` 仍可進入，但無法使用 `sudo`；需要管理員權限時改用 `wsl -d Alma-Training -u root`。

## 🛡️ 6. 設定預設使用者與加固（建議做）

進入 root 的 Linux 終端機：

```powershell
wsl -d $Name -u root
```

出現 Linux 提示符號後，整段貼上（把 `student` 換成你的使用者名稱）：

```bash
cat > /etc/wsl.conf <<'EOF'
[boot]
systemd=true

[user]
default=student

[automount]
enabled=false

[interop]
enabled=false
appendWindowsPath=false
EOF
cat /etc/wsl.conf
exit
```

| 設定 | 效果 |
| --- | --- |
| `[boot] systemd=true` | 啟用 systemd（練習服務管理需要） |
| `[user] default` | 之後直接以你的使用者進入，不用每次指定 |
| `[automount] enabled=false` | Linux 內看不到、也無法修改你的 Windows 磁碟（C:、D:） |
| `[interop] enabled=false` | Linux 內不能執行 Windows 程式（例如 `powershell.exe`） |
| `appendWindowsPath=false` | 不把 Windows 的 PATH 併入 Linux |

為什麼要關：練習時會執行各種指令與腳本，打錯（例如 `rm -rf`）或執行了不明腳本時，影響範圍被限制在這個 Linux 內，不會碰到 Windows 的檔案。

> [!NOTE]
> 若課程需要在 Linux 內讀寫 Windows 檔案，略過 automount 與 interop 兩段，只保留 `[boot]` 與 `[user]`。

回到 PowerShell 讓設定生效並驗證：

```powershell
wsl --terminate $Name
wsl -d $Name --exec /usr/bin/id                    # 應顯示你的使用者，不是 root
wsl -d $Name --exec /usr/bin/ls -A /mnt/c          # 應為空
wsl -d $Name --exec /usr/bin/bash -c "command -v powershell.exe || echo 'powershell.exe: not found'"
```

## 💾 7. 存一份「乾淨基準」（強烈建議）

先停止，再匯出（約 300 MB，需要幾分鐘）：

```powershell
wsl --terminate $Name
wsl --export $Name "$Root\backup\$Name-baseline.tar"
Get-Item "$Root\backup\$Name-baseline.tar" | Select-Object Name,@{n='MB';e={[math]::Round($_.Length/1MB,1)}}
```

可選：記下檔案雜湊，日後核對備份沒被改動：

```powershell
(Get-FileHash "$Root\backup\$Name-baseline.tar" -Algorithm SHA256).Hash
```

## 🔁 8. 日常使用、傳檔與還原

| 目的 | 指令 |
| --- | --- |
| 進入環境 | `wsl -d Alma-Training` |
| 查看狀態 | `wsl -l -v` |
| 停止這個環境 | `wsl --terminate Alma-Training` |
| 在 Windows 檔案總管看 Linux 檔案 | 網址列輸入 `\\wsl.localhost\Alma-Training\home\<你的使用者名稱>\` |

**傳檔**：由 Windows 檔案總管把檔案拖進 `\\wsl.localhost\...` 的資料夾，或從裡面拖出來。關閉 automount 後，Linux 不會主動讀寫 Windows，所以傳檔一律從 Windows 端操作。

從 Windows 傳進來的腳本在 Linux 內執行出現 `$'\r': command not found`，表示檔案是 Windows 換行（CRLF），轉換：

```bash
sed -i 's/\r$//' 檔名
```

**弄壞了怎麼還原**

> [!WARNING]
> `--unregister` 會永久刪除目前的 Alma-Training 與裡面所有資料。先把需要的檔案經 `\\wsl.localhost\...` 複製出來。

```powershell
wsl --terminate $Name
wsl --unregister $Name
wsl --import $Name "$Root\system" "$Root\backup\$Name-baseline.tar" --version 2
```

還原後的預設使用者以 `/etc/wsl.conf` 的 `[user] default` 為準，基準檔已包含第 5、6 步的設定。

> [!IMPORTANT]
> 🎉 **完成條件**：`wsl -l -v` 顯示 `Alma-Training` 的 VERSION 為 2、`id` 顯示你的使用者（不是 root）、`/mnt/c` 為空、基準 `.tar` 已匯出。

---

## ❓ 常見問題

| 問題 | 回答 |
|:--|:--|
| `--name`、`--location` 無法辨識？ | 執行 `wsl --update` 後重試。 |
| ⏳ 安裝卡在 0.0%？ | 加上 `--web-download` 重試。 |
| `wsl --install` 只顯示說明文字？ | 代表 WSL 已安裝；用 `wsl --list --online` 確認名稱，再用 `wsl --install AlmaLinux-10 ...`。 |
| 提示需要啟用虛擬化？ | 重開機進 BIOS/UEFI 啟用虛擬化技術（Intel VT-x 或 AMD-V），細節見 Microsoft 疑難排解文件。 |
| 想改安裝位置？ | 先用第 7 步備份，`--unregister` 後用第 8 步的 `--import` 指到新資料夾。 |
| 想完全移除？ | 備份後 `wsl --unregister Alma-Training`，再自行刪除 `$Root` 資料夾。 |

> [!WARNING]
> 請勿隨意使用 `wsl --shutdown`：它會立即關閉所有 WSL 發行版與整個 WSL2 虛擬機，同一台電腦上其他 WSL 環境的未存檔工作都會中斷。要停止單一環境只用 `wsl --terminate <名稱>`。

---

## 📋 版本與驗證範圍

本文在 Windows 11 Pro（10.0.26200）、WSL 2.7.14.0、核心 6.18.33.2 實際執行過，安裝出的系統為 AlmaLinux 10.2。

**已實測**：安裝、使用者建立、`wsl.conf` 加固、停用 Windows 磁碟與 interop、匯出基準（291.6 MB），以及用基準 tar `--import` 還原：匯入為另一個名稱與資料夾後，雜湊與備份時一致，系統為 AlmaLinux 10.2、預設使用者正確、`wsl.conf` 完整保留、`/mnt/c` 與 `/mnt/d` 為空、沒有 interop、systemd 為 `running`。

**未實測，請照做時留意**：

- 第 5 步設定密碼後的 `sudo` 行為（標準做法，但沒有跑過）。
- 第 8 步「先 `--unregister` 再以同名、同資料夾 `--import`」的完整順序；實測是匯入成不同名稱、不同資料夾。
- 在尚未安裝 WSL 的電腦上做第 2 步（依官方文件，非實測）。
- `--name` 旗標需要的最低 WSL 版本（官方文件未記載，僅依本機 `wsl --help`）。

## 📚 出處

- [Microsoft Learn, Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install)：系統需求、`wsl --install`、`--no-distribution`、`wsl --list --online`、`--web-download`。
- [Microsoft Learn, Basic commands for WSL](https://learn.microsoft.com/en-us/windows/wsl/basic-commands)：`--no-launch`、`--location`、`--terminate`、`--shutdown`、`--export`、`--import ... --version 2`、`--unregister` 的永久刪除警告、`wsl --update`。
- [Microsoft Learn, Advanced settings configuration in WSL](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)：`wsl.conf` 的 `[boot]`、`[user]`、`[automount]`、`[interop]`；設定需重啟 distro 才生效。
- [AlmaLinux 官方 WSL 文件](https://wiki.almalinux.org/documentation/wsl.html)：`wsl --install AlmaLinux-10`、Kitten 為開發預覽版。
- 未查證：`--name` 旗標在 Microsoft 官方 Basic commands 的 `--install` 選項清單中未列出，依本機 `wsl --help` 確認存在。

> **授權與來源**：本文內容以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權，轉載或改作請標示出處。上一步：[單元 1：在 Windows 用終端機安裝 AI Agent](https://ryan-chpeng.github.io/AI-agent-start/)。
