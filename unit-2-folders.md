# 單元 2：開局前環境配置（工作資料夾規劃）

> **ver. 1.0** ｜ **Last edited: 2026-10-10** ｜ 預估 10 分鐘 ｜ Windows 10／11 ｜ PowerShell

> [!IMPORTANT]
> AI Agent 讀得到、改得到的範圍，就是你啟動它的那個資料夾。**先決定資料夾，再啟動 Agent。**
> 本單元只用到「建立資料夾」與「建立連結」，不會刪除任何東西；要移除連結時的注意事項見第 5 節。

---

## 💡 這個單元在做什麼

單元 1 裝好了工具。在開始用之前，先決定「Agent 要在哪個資料夾工作」，因為：

- Agent 讀規則檔、記憶、Skill，全部是從**啟動時的工作目錄**往下找。開錯資料夾，就讀不到你寫好的規則。
- 同時用多個 Agent 時，各自的規則檔名稱與設定位置不同，混在同一個資料夾容易互相覆蓋。

**先判斷你屬於哪一種：**

```text
你會同時用 2 個以上的 AI Agent 嗎？
 ├─ 否 → 【方案 A：單一資料夾】建一個資料夾就好，做完第 1–2 節即可跳到單元 3 或開局包
 └─ 是 → 【方案 B：每個 Agent 一個資料夾，共用一份規則與記憶】做完第 1–5 節
```

---

## 🚀 1. 工作資料夾的命名

建議放在使用者家目錄下，**純英文、無空格**的路徑，避免部分工具對中文或空格路徑處理不一致。

本教學採用 `00_project_<縮寫>` 的命名；開頭的 `00_` 讓它們在檔案總管排在前面。

| 縮寫 | 對應工具 | 資料夾 |
| --- | --- | --- |
| `cld` | Claude Code | `00_project_cld` |
| `cdx` | Codex | `00_project_cdx` |
| `opc` | OpenCode | `00_project_opc` |
| `agy` | Google Antigravity | `00_project_agy` |

縮寫只是你自己辨認用的標籤，工具不會讀它。只用其中幾個，就只建那幾個。

---

## 🚀 2. 建立資料夾

在 PowerShell 執行（只建你用得到的；已存在的資料夾不會被改動）：

```powershell
cd $HOME
"cld","cdx","opc","agy" | ForEach-Object { New-Item -ItemType Directory -Path "00_project_$_" -ErrorAction SilentlyContinue | Out-Null }
Get-ChildItem -Directory -Filter "00_project_*" | Select-Object Name
```

**預期結果**：列出你剛建立（或原本就有）的 `00_project_*` 資料夾。

> **方案 A（只用一個 Agent）** 到此為止：用其中一個資料夾，之後都在這裡啟動。

---

## 🚀 3. 方案 B：共用一份規則與記憶

多個資料夾若各存一份規則與記憶，用一陣子就會互相不一致。做法是：**只在一個資料夾放真正的 `000_Agent`，其他資料夾用「連結」指過去**。

```text
$HOME\
 ├─ 00_project_cld\
 │    ├─ 000_Agent\        ← 真正的內容（規則以外的知識、記憶、Skill）
 │    └─ AGENTS.md
 ├─ 00_project_cdx\
 │    ├─ 000_Agent\  ──┐   ← 連結（Junction），指向上面那份
 │    └─ AGENTS.md      │
 ├─ 00_project_opc\     │
 │    └─ 000_Agent\  ──┤
 └─ 00_project_agy\     │
      └─ 000_Agent\  ──┘
```

連結有兩種，建議用 **Junction**：

| 類型 | 需要的權限 | 限制 |
| --- | --- | --- |
| **Junction**（建議） | 一般使用者即可 | 只能指向本機磁碟的資料夾，不能指向網路磁碟 |
| SymbolicLink | 需開啟「開發人員模式」或以系統管理員執行 | 可指向檔案與網路路徑 |

先在主資料夾（本例 `00_project_cld`）建立真正的 `000_Agent`，再建立連結：

```powershell
cd $HOME
New-Item -ItemType Directory -Path "00_project_cld\000_Agent" -ErrorAction SilentlyContinue | Out-Null
"cdx","opc","agy" | ForEach-Object {
    New-Item -ItemType Junction -Path "00_project_$_\000_Agent" -Target "$HOME\00_project_cld\000_Agent"
}
```

**預期結果**：每個資料夾的 `000_Agent` 在檔案總管內顯示為帶捷徑箭頭的資料夾；在任何一個資料夾裡改檔案，其他資料夾都看得到。

> [!IMPORTANT]
> `-Path` 指定的位置如果**已經有同名資料夾**，指令會報錯而不會覆蓋。先確認那個資料夾是空的或不要了，由你自己處理，不要為了建連結去強制刪除。

---

## 🚀 4. 每個資料夾放自己的規則檔

各工具讀的規則檔名稱不同，**規則檔不要用連結共用**（每個工具的設定與安全規則常有差異），每個資料夾各放一份：

| 工具 | 讀取的規則檔 | 備註 |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` | 內容可只寫一行 `@AGENTS.md`，把主要內容放在 `AGENTS.md` |
| Codex | `AGENTS.md` | |
| OpenCode | `AGENTS.md` | |
| Antigravity | `AGENTS.md` 或 `GEMINI.md` | 官方 Rules 文件列出兩者皆可 |

每份 `AGENTS.md` 開頭建議加三行，讓 Agent 與你自己都清楚這個資料夾的定位：

```markdown
# 本資料夾定位
- 對應工具：OpenCode（`00_project_opc`）
- 共用知識、記憶、Skill：`000_Agent\`（連結到 `00_project_cld\000_Agent`，內容是同一份）
```

---

## 🚀 5. 驗證與注意事項

在每個資料夾**各開一個新對話**，問 Agent：

```text
請回報：1. 你目前的工作目錄；2. 你讀到了哪個規則檔（完整路徑）；3. 列出 000_Agent 底下的第一層內容。
```

**預期結果**：工作目錄是該資料夾；規則檔路徑在該資料夾內；`000_Agent` 的內容與主資料夾相同。

> [!IMPORTANT]
> **移除連結時，不要對連結用 `Remove-Item -Recurse`。** 舊版 PowerShell 可能會順著連結刪到真正的內容。要移除連結，請在檔案總管對那個帶箭頭的資料夾按 Delete（只會移除連結本身），或先確認連結目標沒有內容被牽連再處理。

| 狀況 | 原因與處理 |
| --- | --- |
| Agent 說讀不到規則檔？ | 多半是啟動位置不對；先要它回報工作目錄，再 `cd` 到正確資料夾重開。 |
| `New-Item -ItemType Junction` 失敗？ | 目標不在本機磁碟，或 `-Path` 已存在同名項目；改選本機路徑或換名稱。 |
| 工具用相對路徑載入記憶卻讀不到？ | 相對路徑是以工作目錄為準；在不是預期的資料夾啟動就會失敗。 |
| 資料夾放在 OneDrive 內？ | 同步行為對連結的支援不一，建議連結與真實資料夾都放在 OneDrive 之外，除非你已確認自己的同步設定。 |

---

## 📋 版本與驗證範圍

- 命令以 PowerShell 5.1 與 PowerShell 7 的 `New-Item -ItemType Junction` 說明為準；**尚未在乾淨的 Windows 上由他人實測**。
- 各工具的規則檔名稱依官方文件整理（查閱日 2026-10-10）。

## 📚 出處

- [Microsoft Learn：New-Item](https://learn.microsoft.com/powershell/module/microsoft.powershell.management/new-item)：`-ItemType` 的 `Junction` 與 `SymbolicLink`。
- [Claude Code：Memory（CLAUDE.md）](https://code.claude.com/docs/en/memory)：`CLAUDE.md` 載入位置與 `@` 匯入。
- [AGENTS.md](https://agents.md/)：`AGENTS.md` 格式說明。
- [Google Antigravity：Rules](https://antigravity.google/docs/rules/)：`AGENTS.md`、`GEMINI.md` 與 `.agents/rules/` 的位置。
- [OpenCode：Rules](https://opencode.ai/docs/rules/)：`AGENTS.md` 與 `instructions` 設定。

> **授權與來源**：本文內容以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權，轉載或改作請標示出處。上一步：[單元 1：在 Windows 用終端機安裝 AI Agent](https://ryan-chpeng.github.io/AI-agent-start/)；下一步：[單元 3：安裝 AlmaLinux 10](https://ryan-chpeng.github.io/AI-agent-start/unit-3.html)，或直接進行開局包。
