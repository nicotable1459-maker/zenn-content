/**
 * Zenn記事自動生成スクリプト
 * claude-sonnet-4-5を使ってランダムなジャンルの記事を生成し、
 * articlesフォルダに保存してgit push まで自動実行する
 */

import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// __dirname をESMで再現
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");

// MoneyProjectの.envからAPIキーを読み込む
dotenv.config({ path: "C:\\Users\\user\\Desktop\\MoneyProject\\.env" });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("エラー: ANTHROPIC_API_KEYが見つかりません");
  console.error("C:\\Users\\user\\Desktop\\MoneyProject\\.env を確認してください");
  process.exit(1);
}

// 記事生成の対象ジャンル一覧
const GENRES = [
  "AI活用術",
  "仕事効率化",
  "お金と副業",
  "住宅と不動産",
  "時事解説",
  "思考とマインド",
];

// ジャンルをランダムに1つ選ぶ
function pickRandomGenre() {
  const index = Math.floor(Math.random() * GENRES.length);
  return GENRES[index];
}

// 日付文字列を YYYYMMDD 形式で返す
function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// タイトルからファイル名用スラッグを生成（日本語はそのまま使用）
function titleToSlug(title) {
  return title
    .replace(/[\\/:*?"<>|]/g, "") // ファイル名に使えない文字を除去
    .replace(/\s+/g, "_")
    .slice(0, 50); // 長すぎる場合は切り詰め
}

// Anthropic APIを使って記事を生成する
async function generateArticle(genre) {
  const client = new Anthropic({ apiKey });

  console.log(`\n📝 ジャンル「${genre}」の記事を生成中...`);

  const systemPrompt = `あなたはZennで人気の技術・ライフスタイル系ライターです。
読者に価値ある情報を分かりやすく伝える、質の高い記事を書いてください。
記事は必ずZennのMarkdown形式（frontmatter付き）で出力してください。`;

  const userPrompt = `以下の条件でZenn記事を生成してください。

【ジャンル】${genre}

【要件】
- frontmatterを必ず含める（title, emoji, type: "tech"または"idea", topics, published: true）
- 本文は2000文字以上
- 読者が実際に役立てられる具体的な内容
- 見出し（##, ###）を使って読みやすく構成する
- 冒頭に記事の概要・読者への価値を示す導入文
- 具体例やコード（必要に応じて）を含める
- まとめセクションで要点を整理する

【frontmatterの例】
\`\`\`
---
title: "記事タイトル"
emoji: "🚀"
type: "idea"
topics: ["トピック1", "トピック2"]
published: true
---
\`\`\`

記事全体をMarkdownで出力してください（frontmatterから本文まで）。`;

  // ストリーミングで生成（長い出力に対応するため）
  let fullContent = "";

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  // ストリームからテキストを逐次出力
  process.stdout.write("生成中: ");
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullContent += event.delta.text;
      process.stdout.write(".");
    }
  }
  console.log(" 完了！");

  return fullContent;
}

// frontmatterからタイトルを抽出する
function extractTitle(markdown) {
  const match = markdown.match(/^---[\s\S]*?title:\s*["']?(.+?)["']?\s*\n/m);
  if (match) {
    return match[1].trim();
  }
  // frontmatterにタイトルがない場合は最初のH1を探す
  const h1Match = markdown.match(/^#\s+(.+)/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  return "generated-article";
}

// 記事をファイルに保存する
function saveArticle(content, genre) {
  const date = getTodayString();
  const title = extractTitle(content);
  const slug = titleToSlug(title);
  const filename = `${date}_${slug}.md`;
  const filepath = path.join(PROJECT_ROOT, "articles", filename);

  fs.writeFileSync(filepath, content, "utf-8");
  console.log(`\n✅ 記事を保存しました: articles/${filename}`);
  return filepath;
}

// git add, commit, push を実行する
function gitCommitAndPush(filepath) {
  const filename = path.basename(filepath);
  const today = getTodayString();

  try {
    console.log("\n🔄 Gitへコミット中...");

    // git addで変更をステージング
    execSync("git add .", { cwd: PROJECT_ROOT, stdio: "inherit" });

    // コミットメッセージを作成
    const commitMessage = `📝 AI生成記事を追加: ${filename} (${today})`;
    execSync(`git commit -m "${commitMessage}"`, {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
    });

    console.log("\n🚀 GitHubへプッシュ中...");
    execSync("git push", { cwd: PROJECT_ROOT, stdio: "inherit" });

    console.log("\n🎉 完了！記事がGitHubへ公開されました。");
  } catch (error) {
    console.error("\n❌ Gitエラー:", error.message);
    console.error("手動でgit push してください。");
  }
}

// メイン処理
async function main() {
  console.log("=== Zenn記事自動生成スクリプト ===");

  // ランダムにジャンルを選択
  const genre = pickRandomGenre();
  console.log(`🎲 選択されたジャンル: ${genre}`);

  // 記事を生成
  const content = await generateArticle(genre);

  // 記事の文字数を確認
  const charCount = content.length;
  console.log(`\n📊 生成された記事: ${charCount}文字`);

  if (charCount < 1000) {
    console.warn("⚠️  記事が短すぎます。再生成を検討してください。");
  }

  // ファイルに保存
  const filepath = saveArticle(content, genre);

  // git commit & push
  gitCommitAndPush(filepath);
}

// スクリプトを実行
main().catch((error) => {
  console.error("予期せぬエラーが発生しました:", error);
  process.exit(1);
});
