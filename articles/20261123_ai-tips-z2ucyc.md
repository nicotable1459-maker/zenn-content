---
title: "ChatGPT APIを使った日報自動生成ツールの作り方【Python実装】"
emoji: "🤖"
type: "tech"
topics: ["ChatGPT", "Python", "AI", "OpenAI", "自動化"]
slug: "ai-tips-z2ucyc"
published: true
---

## はじめに

毎日の日報作成、面倒だと感じたことはありませんか?

この記事では、ChatGPT APIを活用して日報を自動生成するPythonツールの作り方を解説します。GitHubのコミット履歴やカレンダー予定を元に、AIが自然な文章で日報を作成してくれる実用的なツールです。

**この記事で得られること:**
- ChatGPT APIの基本的な使い方
- 実務で使える日報自動生成ツールの実装方法
- プロンプトエンジニアリングのベストプラクティス
- コスト最適化のテクニック

所要時間: 約30分で実装可能です。

## 前提条件

以下の環境を想定しています:

- Python 3.8以上
- OpenAI APIキー（取得方法は後述）
- 基本的なPythonの知識

## OpenAI APIキーの取得

まず、OpenAIのアカウントを作成し、APIキーを取得します。

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. アカウント作成またはログイン
3. API keysセクションから新しいキーを生成
4. 生成されたキーを安全に保管（二度と表示されません）

:::message
APIキーは絶対にGitHubなどに公開しないでください。環境変数や`.env`ファイルで管理しましょう。
:::

## 環境構築

必要なライブラリをインストールします。

```bash
pip install openai python-dotenv requests
```

`.env`ファイルを作成し、APIキーを設定:

```
OPENAI_API_KEY=your-api-key-here
```

## 基本実装: シンプルな日報生成

まずは最もシンプルな実装から始めましょう。

```python
import os
from openai import OpenAI
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

# OpenAIクライアントの初期化
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_daily_report(tasks: list[str]) -> str:
    """
    タスクリストから日報を生成
    
    Args:
        tasks: 本日完了したタスクのリスト
        
    Returns:
        生成された日報テキスト
    """
    # タスクを箇条書きに変換
    task_list = "\n".join([f"- {task}" for task in tasks])
    
    # プロンプトの構築
    prompt = f"""
以下のタスクを元に、ビジネスで使える日報を作成してください。

【完了したタスク】
{task_list}

【要件】
- 簡潔で読みやすい文章
- 成果や学びを強調
- 明日への展望を含める
- 200文字程度
"""
    
    # API呼び出し
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "あなたは優秀なビジネスライターです。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    return response.choices[0].message.content

# 使用例
if __name__ == "__main__":
    today_tasks = [
        "ユーザー認証機能の実装",
        "データベース設計レビュー",
        "チームミーティング参加"
    ]
    
    report = generate_daily_report(today_tasks)
    print(report)
```

**実行結果例:**

```
本日は、ユーザー認証機能の実装を完了し、セキュアなログイン機構を構築しました。
また、データベース設計レビューではパフォーマンス改善の提案を行い、チーム全体で
方針を確認できました。明日はフロントエンドとの統合テストを実施し、
ユーザビリティの検証を進めます。
```

## 高度な実装: GitHubコミット連携

実際の開発作業から自動的に日報を生成する、より実用的な実装を見ていきましょう。

```python
import os
import requests
from datetime import datetime, timedelta
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class DailyReportGenerator:
    def __init__(self, openai_api_key: str, github_token: str):
        self.client = OpenAI(api_key=openai_api_key)
        self.github_token = github_token
        self.github_headers = {
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    def fetch_github_commits(self, username: str, days: int = 1) -> list[dict]:
        """
        指定ユーザーの直近のコミットを取得
        """
        since = (datetime.now() - timedelta(days=days)).isoformat()
        url = f"https://api.github.com/users/{username}/events"
        
        response = requests.get(
            url,
            headers=self.github_headers,
            params={"per_page": 100}
        )
        
        if response.status_code != 200:
            raise Exception(f"GitHub API Error: {response.status_code}")
        
        events = response.json()
        commits = []
        
        for event in events:
            if event["type"] == "PushEvent":
                for commit in event["payload"]["commits"]:
                    commits.append({
                        "repo": event["repo"]["name"],
                        "message": commit["message"],
                        "timestamp": event["created_at"]
                    })
        
        return commits
    
    def generate_report_from_commits(self, commits: list[dict]) -> str:
        """
        コミット情報から日報を生成
        """
        if not commits:
            return "本日は作業記録がありません。"
        
        # コミット情報を整形
        commit_summary = "\n".join([
            f"- [{c['repo']}] {c['message']}"
            for c in commits[:10]  # 最大10件
        ])
        
        prompt = f"""
以下のGitコミット履歴から、技術的な日報を作成してください。

【コミット履歴】
{commit_summary}

【要件】
1. 技術的な成果を明確に記載
2. 実装した機能や修正したバグを要約
3. 専門用語は適度に使用
4. 300-400文字程度
5. 以下の構成で記載:
   - 本日の作業概要
   - 主な成果
   - 技術的な学び（あれば）
   - 明日の予定
"""
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "あなたは経験豊富なソフトウェアエンジニアです。技術的な日報を簡潔にまとめることが得意です。"
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        return response.choices[0].message.content
    
    def generate_full_report(self, username: str) -> dict:
        """
        完全な日報を生成（コミット情報含む）
        """
        commits = self.fetch_github_commits(username)
        report = self.generate_report_from_commits(commits)
        
        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "commits_count": len(commits),
            "report": report,
            "commits": commits[:5]  # 詳細は5件まで
        }

# 使用例
if __name__ == "__main__":
    generator = DailyReportGenerator(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        github_token=os.getenv("GITHUB_TOKEN")
    )
    
    result = generator.generate_full_report("your-github-username")
    
    print(f"日報 ({result['date']})")
    print("=" * 50)
    print(result['report'])
    print(f"\n総コミット数: {result['commits_count']}件")
```

## プロンプトエンジニアリングのコツ

効果的な日報を生成するためのプロンプト設計のポイント:

### 1. 役割を明確に定義する

```python
system_message = """
あなたは10年以上の経験を持つシニアエンジニアです。
日報では技術的な成果を明確に、かつ非エンジニアにも
理解できる言葉で説明することが求められます。
"""
```

### 2. 出力形式を具体的に指定する

```python
prompt = """
以下の形式で出力してください:

## 本日の成果
- 箇条書きで3-5項目

## 技術的な課題と解決策
- 1-2項目

## 明日の予定
- 箇条書きで2-3項目
"""
```

### 3. Few-shot learningを活用する

```python
prompt = f"""
以下は良い日報の例です:

【例】
本日はユーザー認証APIの実装を完了しました。
JWT認証を採用し、セキュリティレベルを向上させています。
テストカバレッジは95%を達成しました。

あなたのタスク: {task_list}
上記の例のような日報を作成してください。
"""
```

## コスト最適化のテクニック

ChatGPT APIは従量課金制です。コストを抑えるテクニックを紹介します。

### 1. モデルの選択

```python
# コスト重視
model = "gpt-3.5-turbo"  # 安価で高速

# 品質重視
model = "gpt-4"  # 高品質だが高価

# バランス重視
model = "gpt-3.5-turbo-16k"  # 長文対応
```

### 2. max_tokensの制限

```python
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    max_tokens=500,  # 出力を制限してコスト削減
    temperature=0.7
)
```

### 3. キャッシング戦略

```python
import hashlib
import json
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_generate_report(tasks_hash: str) -> str:
    """同じタスクリストには同じ結果を返す"""
    tasks = json.loads(tasks_hash)
    return generate_daily_report(tasks)

# 使用例
tasks_json = json.dumps(sorted(tasks))  # ソートで一貫性を保つ
report = cached_generate_report(tasks_json)
```

## 実践的な改善案

### カスタマイズ可能なテンプレート

```python
class ReportTemplate:
    TEMPLATES = {
        "engineering": """
技術的な成果を中心に、以下の観点で日報を作成:
- 実装した機能
- 解決した技術課題
- コードレビューでの学び
        """,
        "management": """
マネージャー向けに、以下の観点で日報を作成:
- プロジェクトの進捗状況
- チームの課題と対応
- リスク管理
        """,
        "simple": """
シンプルに今日やったことを3行で要約してください。
        """
    }
    
    @classmethod
    def get_prompt(cls, template_type: str, tasks: list[str]) -> str:
        base_template = cls.TEMPLATES.get(template_type, cls.TEMPLATES["simple"])
        task_list = "\n".join([f"- {task}" for task in tasks])
        return f"{base_template}\n\n【タスク】\n{task_list}"
```

### Slack自動投稿機能

```python
import requests

def post_to_slack(webhook_url: str, report: str):
    """
    生成した日報をSlackに投稿
    """
    payload = {
        "text": f"📝 本日の日報\n\n{report}"
    }
    
    response = requests.post(webhook_url, json=payload)
    return response.status_code == 200

# 使用例
if __name__ == "__main__":
    report = generate_daily_report(tasks)
    slack_webhook = os.getenv("SLACK_WEBHOOK_URL")
    
    if post_to_slack(slack_webhook, report):
        print("Slackに投稿しました!")
```

## エラーハンドリングとリトライ戦略

本番運用では堅牢なエラー処理が必要です。

```python
import time
from typing import Optional

def generate_report_with_retry(
    tasks: list[str],
    max_retries: int = 3,
    retry_delay: int = 2
) -> Optional[str]:
    """
    リトライ機能付き日報生成
    """
    for attempt in range(max_retries):
        try:
            return generate_daily_report(tasks)
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"エラー発生 (試行 {attempt + 1}/{max_retries}): {e}")
                time.sleep(retry_delay * (attempt + 1))  # 指数バックオフ
            else:
                print(f"最大リトライ回数に達しました: {e}")
                return None
    
    return None
```

## セキュリティのベストプラクティス