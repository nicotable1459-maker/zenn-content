---
title: "ChatGPT×スプレッドシートで業務効率10倍！実務で使える自動化レシピ5選"
emoji: "🤖"
type: "tech"
topics: ["ChatGPT", "GoogleAppsScript", "自動化", "業務効率化", "AI"]
slug: "ai-tips-jstx3n"
published: true
---

## はじめに：AIと表計算ツールの組み合わせが最強な理由

ChatGPTのAPIとGoogleスプレッドシートを組み合わせることで、日常業務の多くを自動化できることをご存知でしょうか？

この記事では、**実際に私が業務で活用している具体的な自動化レシピを5つ紹介**します。プログラミング初心者でも実装できるよう、コピペで動くサンプルコードと丁寧な解説を用意しました。

### この記事で得られること

- ChatGPT APIとスプレッドシートの連携方法
- すぐに使える5つの実用的な自動化事例
- 業務時間を劇的に削減するための具体的なテクニック
- API利用のコスト管理のコツ

それでは早速、実践的な活用方法を見ていきましょう！

## 準備：ChatGPT APIとスプレッドシートの連携設定

### 1. OpenAI APIキーの取得

まず、OpenAIの公式サイトでAPIキーを取得します。

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. アカウント作成後、API keysページでキーを生成
3. 生成されたキーを安全な場所にコピー

:::message
APIキーは絶対に公開しないでください。スクリプトに直接書き込む場合は、スクリプトプロパティに保存することを推奨します。
:::

### 2. Google Apps Scriptの基本設定

スプレッドシートから「拡張機能」→「Apps Script」を開き、以下の基本関数を追加します。

```javascript
// APIキーをスクリプトプロパティに保存（初回のみ実行）
function setApiKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('OPENAI_API_KEY', 'あなたのAPIキー');
}

// ChatGPT APIを呼び出す基本関数
function callChatGPT(prompt, model = "gpt-3.5-turbo") {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  const url = "https://api.openai.com/v1/chat/completions";
  
  const payload = {
    model: model,
    messages: [
      {role: "user", content: prompt}
    ],
    temperature: 0.7
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    return json.choices[0].message.content;
  } catch (e) {
    Logger.log("Error: " + e.toString());
    return "エラーが発生しました: " + e.toString();
  }
}
```

## レシピ1：顧客フィードバックの自動分類・感情分析

### 使用シーン

カスタマーサポートやアンケート結果の分析で、大量のテキストデータを手作業で分類していませんか？

### 実装方法

スプレッドシートのA列に顧客のコメントが入っている場合、B列に感情分析、C列にカテゴリを自動で入力します。

```javascript
function analyzeFeedback() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  // 2行目から開始（1行目はヘッダー）
  for (let i = 2; i <= lastRow; i++) {
    const feedback = sheet.getRange(i, 1).getValue();
    
    if (feedback && !sheet.getRange(i, 2).getValue()) {
      const prompt = `以下の顧客フィードバックを分析してください：
「${feedback}」

以下の形式で回答してください：
感情: [ポジティブ/ニュートラル/ネガティブ]
カテゴリ: [製品品質/価格/サポート/配送/その他]
要約: [30文字以内の要約]`;

      const result = callChatGPT(prompt);
      
      // 結果を解析してセルに入力
      const lines = result.split('\n');
      let sentiment = "";
      let category = "";
      let summary = "";
      
      lines.forEach(line => {
        if (line.includes("感情:")) sentiment = line.split(":")[1].trim();
        if (line.includes("カテゴリ:")) category = line.split(":")[1].trim();
        if (line.includes("要約:")) summary = line.split(":")[1].trim();
      });
      
      sheet.getRange(i, 2).setValue(sentiment);
      sheet.getRange(i, 3).setValue(category);
      sheet.getRange(i, 4).setValue(summary);
      
      // API制限対策で少し待機
      Utilities.sleep(1000);
    }
  }
}
```

### 活用のポイント

- **バッチ処理**：一度に処理する行数を制限することでタイムアウトを防止
- **プロンプト設計**：出力形式を明確に指定することで、後処理が簡単に
- **コスト管理**：gpt-3.5-turboを使用することでコストを抑制

## レシピ2：メール文章の自動生成

### 使用シーン

定型的だけど毎回少しずつ内容が変わるメール（お礼メール、提案書の送付状など）の作成を効率化します。

### 実装方法

```javascript
function generateEmail() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    const customerName = sheet.getRange(i, 1).getValue();
    const situation = sheet.getRange(i, 2).getValue();
    const purpose = sheet.getRange(i, 3).getValue();
    
    if (customerName && !sheet.getRange(i, 4).getValue()) {
      const prompt = `以下の情報をもとに、ビジネスメールを作成してください：

顧客名: ${customerName}
状況: ${situation}
目的: ${purpose}

要件:
- 丁寧で親しみやすいトーン
- 件名も含めて作成
- 300文字程度
- 署名は「[署名]」として残す`;

      const email = callChatGPT(prompt);
      sheet.getRange(i, 4).setValue(email);
      
      Utilities.sleep(1000);
    }
  }
}
```

### 実例

**入力データ：**
- 顧客名：田中様
- 状況：先日の商談で新プランに興味を示された
- 目的：詳細資料の送付と次回ミーティングの提案

**出力例：**
```
件名：【資料送付】新プランのご提案について

田中様

いつもお世話になっております。

先日はお時間をいただき、誠にありがとうございました。
商談でご興味をお持ちいただいた新プランについて、
詳細資料を添付いたしましたのでご確認ください。

ご不明点やご質問がございましたら、
お気軽にお申し付けください。
また、詳細なご説明の機会をいただけましたら幸いです。

引き続きよろしくお願いいたします。

[署名]
```

## レシピ3：多言語翻訳＋文化的配慮の追加

### 使用シーン

海外顧客とのやり取りで、単なる翻訳ではなく文化的に適切な表現に変換したい場合に活用します。

### 実装方法

```javascript
function translateWithCulturalContext() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    const japaneseText = sheet.getRange(i, 1).getValue();
    const targetLanguage = sheet.getRange(i, 2).getValue(); // 例: "英語（アメリカ）"
    
    if (japaneseText && targetLanguage && !sheet.getRange(i, 3).getValue()) {
      const prompt = `以下の日本語テキストを${targetLanguage}に翻訳してください。
ただし、単純な直訳ではなく、対象文化圏で自然で適切な表現に調整してください：

「${japaneseText}」

翻訳後のテキストと、文化的配慮のポイントを簡潔に説明してください。`;

      const result = callChatGPT(prompt);
      sheet.getRange(i, 3).setValue(result);
      
      Utilities.sleep(1000);
    }
  }
}
```

### 活用例

日本語の「お世話になっております」は、そのまま英訳しても不自然です。ChatGPTは文脈に応じて"Thank you for your continued support"や"I hope this email finds you well"など、適切な表現を選択してくれます。

## レシピ4：データの要約とインサイト抽出

### 使用シーン

会議の議事録、調査レポート、長文記事などから重要なポイントを自動抽出します。

### 実装方法

```javascript
function summarizeAndExtractInsights() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    const longText = sheet.getRange(i, 1).getValue();
    
    if (longText && !sheet.getRange(i, 2).getValue()) {
      const prompt = `以下のテキストを分析し、要約とインサイトを抽出してください：

${longText}

以下の形式で出力してください：
【3行要約】
（ここに要約）

【重要なインサイト】
1. 
2. 
3. 

【アクションアイテム】
- `;

      const result = callChatGPT(prompt, "gpt-4-turbo-preview"); // 長文処理にはGPT-4推奨
      sheet.getRange(i, 2).setValue(result);
      
      Utilities.sleep(1000);
    }
  }
}
```

### コスト最適化のコツ

- **短いテキストはGPT-3.5を使用**：1,000文字以下ならGPT-3.5でも十分
- **事前にテキストを整形**：不要な空白や重複を除去してトークン数を削減
- **バッチ処理**：複数の短文を1つのプロンプトにまとめる

## レシピ5：データ検証・異常値の検出

### 使用シーン

入力データの妥当性チェックや、異常なパターンの検出を自動化します。

### 実装方法

```javascript
function validateData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    const data = {
      name: sheet.getRange(i, 1).getValue(),
      email: sheet.getRange(i, 2).getValue(),
      phone: sheet.getRange(i, 3).getValue(),
      address: sheet.getRange(i, 4).getValue()
    };
    
    if (data.name && !sheet.getRange(i, 5).getValue()) {
      const prompt = `以下のデータを検証し、問題があれば指摘してください：

名前: ${data.name}
メールアドレス: ${data.email}
電話番号: ${data.phone}
住所: ${data.address}

以下の観点でチェックしてください：
- 各項目の形式は正しいか
- 矛盾や不自然な点はないか
- ビジネス上のリスクはあるか

問題なければ「OK」、問題があれば具体的に指摘してください。`;

      const validation = callChatGPT(prompt);
      sheet.getRange(i, 5).setValue(validation);
      
      // 問題がある場合は背景色を変更
      if (!validation.includes("OK")) {
        sheet.getRange(i, 1, 1, 5).setBackground("#ffcccc");
      }
      
      Utilities.sleep(1000);
    }
  }
}
```

### 実用例

- **メールアドレス形式チェック**：@の有無だけでなく、実在しそうなドメインかも判断
- **住所の妥当性**：存在しない地名や番地の組み合わせを検出
- **電話番号の地域整合性**：住所と電話番号の市外局番が一致しているか確認

## 実装時の注意点とベストプラクティス

### 1. API使用量の管理

```javascript
// 使用トークン数を記録する関数
function logApiUsage(prompt, response) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("APIログ");
  if (!logSheet) return;
  
  const estimatedTokens = Math.ceil((prompt.length + response.length) / 4);
  const cost = estimatedTokens * 0.002 / 1000; // GPT-3.5の概算コスト
  
  logSheet.appendRow([