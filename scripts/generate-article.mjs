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

// 記事生成の対象ジャンル一覧（英語スラッグプレフィックス付き）
const GENRES = [
  { label: "AI活用術",    prefix: "ai-tips"       },
  { label: "仕事効率化",  prefix: "work-hack"     },
  { label: "お金と副業",  prefix: "money-side"    },
  { label: "住宅と不動産", prefix: "housing"      },
  { label: "時事解説",    prefix: "news-analysis" },
  { label: "思考とマインド", prefix: "mindset"    },
];

// ジャンルをランダムに1つ選ぶ
function pickRandomGenre() {
  const index = Math.floor(Math.random() * GENRES.length);
  return GENRES[index]; // { label, prefix }
}

// 日付文字列を YYYYMMDD 形式で返す
function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// ジャンルプレフィックス + ランダム英数字でスラッグを生成
// 例: "ai-tips-a3f9k2"
function buildSlug(prefix) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const rand = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `${prefix}-${rand}`;
}

// Anthropic APIを使って記事を生成する
async function generateArticle(genre) {
  const client = new Anthropic({ apiKey });

  console.log(`\n📝 ジャンル「${genre.label}」の記事を生成中...`);

  const systemPrompt = `あなたはZennで人気の技術・ライフスタイル系ライターです。
読者に価値ある情報を分かりやすく伝える、質の高い記事を書いてください。
記事は必ずZennのMarkdown形式（frontmatter付き）で出力してください。`;

  const userPrompt = `以下の条件でZenn記事を生成してください。

【ジャンル】${genre.label}

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

// frontmatterのslugフィールドを挿入または上書きする
// AIが生成したfrontmatterにslugが含まれていても強制的に置き換える
function injectSlug(markdown, slug) {
  // frontmatter内にすでにslugがあれば置換
  if (/^slug:/m.test(markdown)) {
    return markdown.replace(/^slug:.+$/m, `slug: "${slug}"`);
  }
  // なければ published: true の直前に挿入
  if (/^published:/m.test(markdown)) {
    return markdown.replace(/^(published:)/m, `slug: "${slug}"\n$1`);
  }
  // どちらもなければfrontmatter終端 "---" の直前に挿入
  return markdown.replace(/^---\s*$/m, `slug: "${slug}"\n---`);
}

// 記事をファイルに保存する（slugをファイル名とfrontmatterに反映）
function saveArticle(content, genre) {
  const date = getTodayString();
  const slug = buildSlug(genre.prefix);       // 例: "mindset-a3f9k2"
  const filename = `${date}_${slug}.md`;      // 例: "20260503_mindset-a3f9k2.md"

  // frontmatterにslugを注入してからファイルに書き込む
  const finalContent = injectSlug(content, slug);
  const filepath = path.join(PROJECT_ROOT, "articles", filename);

  fs.writeFileSync(filepath, finalContent, "utf-8");
  console.log(`\n✅ 記事を保存しました: articles/${filename}`);
  console.log(`   slug: ${slug}`);
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
  console.log(`🎲 選択されたジャンル: ${genre.label} (prefix: ${genre.prefix})`);

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
