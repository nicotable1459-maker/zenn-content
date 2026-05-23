---
title: "2024年注目のAI規制法案を技術者視点で解説：EU AI Act施行で何が変わるのか"
emoji: "⚖️"
type: "tech"
topics: ["AI", "法律", "EUAIACT", "機械学習", "コンプライアンス"]
slug: "news-analysis-o5cwfk"
published: true
---

## はじめに

2024年、AI技術を取り巻く法的環境が大きく変わろうとしています。特に注目すべきは、EU（欧州連合）で正式に施行された「AI Act（AI規制法）」です。この法律は世界初の包括的なAI規制法として、グローバルなテクノロジー業界に大きな影響を与えています。

「うちは日本企業だから関係ない」と思っている方も多いかもしれませんが、実はそうではありません。EUのGDPRが世界中のウェブサービスに影響を与えたように、AI Actも日本を含む世界中の企業に影響を及ぼす可能性があります。

本記事では、エンジニアや技術リーダーの皆さんが知っておくべきAI Act の要点と、実務への影響、そして今後取るべきアクションについて解説します。

## EU AI Actとは何か

### 法律の基本構造

EU AI Actは、AIシステムをそのリスクレベルに応じて4つのカテゴリーに分類し、それぞれに異なる規制を適用するリスクベースのアプローチを採用しています。

**リスク分類の4段階：**

1. **禁止されるAI（Unacceptable Risk）**
2. **高リスクAI（High Risk）**
3. **限定的リスクAI（Limited Risk）**
4. **最小リスクAI（Minimal Risk）**

この分類は、開発者や提供者にとって最も重要な判断基準となります。

### 禁止されるAIシステム

以下のようなAIシステムは原則として禁止されます：

- **社会信用スコアシステム**：中国の社会信用システムのような、個人の社会的行動を包括的に評価するシステム
- **リアルタイム遠隔生体認証**：公共の場での法執行目的のリアルタイム顔認証（一部例外あり）
- **感情認識システム**：職場や教育機関での感情認識技術の使用
- **脆弱性を悪用するAI**：子供や障害者の脆弱性を悪用するシステム

```python
# 禁止される可能性のあるシステムの例（概念コード）
class EmotionRecognitionInWorkplace:
    """
    職場での従業員の感情を継続的に監視・評価するシステム
    → EU AI Actで禁止される可能性が高い
    """
    def __init__(self):
        self.camera_feed = None
        self.emotion_model = None
    
    def analyze_employee_emotions(self, employee_id):
        # このような実装は規制対象
        emotions = self.emotion_model.predict(self.camera_feed)
        self.store_emotion_data(employee_id, emotions)
        return emotions
```

### 高リスクAIシステム

高リスクAIには厳格な要件が課されます。以下が該当します：

- **重要インフラ**（交通、電力、水道など）
- **教育・職業訓練**（試験の採点、入学審査など）
- **雇用管理**（採用、昇進、解雇の判断）
- **必須サービス**（信用スコアリング、緊急サービス）
- **法執行**（証拠評価、犯罪予測など）
- **移民・難民管理**
- **司法・民主的プロセス**

これらのシステムには以下の義務が課されます：

1. **リスク管理システムの構築**
2. **データガバナンス**：高品質で偏りのないデータセットの使用
3. **技術文書の作成と保管**
4. **透明性とログの記録**
5. **人間による監視（Human Oversight）**
6. **正確性、堅牢性、サイバーセキュリティ**
7. **適合性評価の実施**

## 実務への影響：開発者が考えるべきこと

### 1. システム分類の判断

まず、自社のAIシステムがどのカテゴリーに該当するかを判断する必要があります。

```python
from enum import Enum
from typing import List

class AIRiskLevel(Enum):
    UNACCEPTABLE = "unacceptable"
    HIGH = "high"
    LIMITED = "limited"
    MINIMAL = "minimal"

class AISystemClassifier:
    """AI Actに基づくシステム分類の支援クラス"""
    
    HIGH_RISK_CATEGORIES = [
        "biometric_identification",
        "critical_infrastructure",
        "education_vocational_training",
        "employment_management",
        "essential_services",
        "law_enforcement",
        "migration_asylum",
        "justice_democratic_processes"
    ]
    
    def classify_system(
        self, 
        purpose: str,
        domain: str,
        uses_biometric_data: bool = False,
        affects_human_rights: bool = False
    ) -> AIRiskLevel:
        """
        AIシステムのリスクレベルを分類
        
        実際の分類には法務部門との連携が必須
        """
        # 禁止されるシステムのチェック
        if self._is_prohibited(purpose):
            return AIRiskLevel.UNACCEPTABLE
        
        # 高リスクシステムのチェック
        if domain in self.HIGH_RISK_CATEGORIES:
            return AIRiskLevel.HIGH
        
        if uses_biometric_data or affects_human_rights:
            return AIRiskLevel.HIGH
        
        # 限定的リスク（透明性義務あり）
        if self._requires_transparency(purpose):
            return AIRiskLevel.LIMITED
        
        return AIRiskLevel.MINIMAL
    
    def _is_prohibited(self, purpose: str) -> bool:
        prohibited_keywords = [
            "social_scoring",
            "realtime_biometric_surveillance",
            "emotion_recognition_workplace",
            "exploit_vulnerabilities"
        ]
        return any(keyword in purpose.lower() for keyword in prohibited_keywords)
    
    def _requires_transparency(self, purpose: str) -> bool:
        transparency_keywords = [
            "chatbot",
            "deepfake",
            "content_generation",
            "emotion_recognition"
        ]
        return any(keyword in purpose.lower() for keyword in transparency_keywords)

# 使用例
classifier = AISystemClassifier()

# ケース1: 採用支援AIシステム
recruitment_ai = classifier.classify_system(
    purpose="candidate_screening",
    domain="employment_management",
    affects_human_rights=True
)
print(f"採用AIのリスクレベル: {recruitment_ai.value}")  # 出力: high

# ケース2: カスタマーサポートチャットボット
chatbot = classifier.classify_system(
    purpose="chatbot_customer_support",
    domain="customer_service",
    affects_human_rights=False
)
print(f"チャットボットのリスクレベル: {chatbot.value}")  # 出力: limited
```

### 2. 技術文書とログの整備

高リスクAIシステムの場合、包括的な技術文書の作成が義務付けられます。

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional
import json

@dataclass
class AISystemDocumentation:
    """AI Act準拠の技術文書構造"""
    
    # 基本情報
    system_name: str
    version: str
    provider: str
    intended_purpose: str
    risk_level: str
    
    # データガバナンス
    training_data_description: str
    data_sources: List[str]
    data_quality_measures: str
    bias_mitigation_strategy: str
    
    # モデル情報
    model_architecture: str
    training_methodology: str
    performance_metrics: Dict[str, float]
    
    # リスク管理
    identified_risks: List[str]
    risk_mitigation_measures: List[str]
    
    # 人間による監視
    human_oversight_measures: str
    override_capability: bool
    
    # 透明性
    transparency_measures: str
    user_information_provided: str
    
    # 記録とモニタリング
    logging_capability: bool
    monitoring_procedures: str
    
    # コンプライアンス
    conformity_assessment_body: Optional[str]
    assessment_date: Optional[datetime]
    certification_number: Optional[str]
    
    def to_json(self) -> str:
        """JSON形式でエクスポート"""
        data = self.__dict__.copy()
        if data.get('assessment_date'):
            data['assessment_date'] = data['assessment_date'].isoformat()
        return json.dumps(data, indent=2, ensure_ascii=False)
    
    def generate_compliance_report(self) -> str:
        """コンプライアンスレポートの生成"""
        report = f"""
# AI System Compliance Report

## System Information
- Name: {self.system_name}
- Version: {self.version}
- Provider: {self.provider}
- Risk Level: {self.risk_level}

## Purpose
{self.intended_purpose}

## Data Governance
- Training Data: {self.training_data_description}
- Data Sources: {', '.join(self.data_sources)}
- Quality Measures: {self.data_quality_measures}
- Bias Mitigation: {self.bias_mitigation_strategy}

## Risk Management
### Identified Risks
{self._format_list(self.identified_risks)}

### Mitigation Measures
{self._format_list(self.risk_mitigation_measures)}

## Human Oversight
{self.human_oversight_measures}
Override Capability: {'Yes' if self.override_capability else 'No'}

## Performance Metrics
{self._format_metrics(self.performance_metrics)}

## Compliance Status
Conformity Assessment: {self.conformity_assessment_body or 'Pending'}
Assessment Date: {self.assessment_date.strftime('%Y-%m-%d') if self.assessment_date else 'Not yet assessed'}
        """
        return report
    
    def _format_list(self, items: List[str]) -> str:
        return '\n'.join(f"- {item}" for item in items)
    
    def _format_metrics(self, metrics: Dict[str, float]) -> str:
        return '\n'.join(f"- {key}: {value:.4f}" for key, value in metrics.items())

# 使用例
doc = AISystemDocumentation(
    system_name="SmartRecruit AI",
    version="2.0.1",
    provider="TechCorp Inc.",
    intended_purpose="採用候補者のスクリーニングと評価支援",
    risk_level="HIGH",
    training_data_description="過去5年間の採用データ（匿名化済み）、10万件のCV",
    data_sources=["社内HRデータベース", "公開求人情報", "業界標準スキルデータベース"],
    data_quality_measures="データクリーニング、異常値除去、代表性検証",
    bias_mitigation_strategy="性別・年齢・人種による偏りの検出と補正、定期的なフェアネス監査",
    model_architecture="Transformer-based NLP model + XGBoost classifier",
    training_methodology="教師あり学習、交差検証、ハイパーパラメータチューニング",
    performance_metrics={
        "accuracy": 0.87,
        "precision": 0.85,
        "recall": 0.89,
        "f1_score": 0.87,
        "demographic_parity_difference": 0.03
    },
    identified_risks=[
        "性別による偏った評価の可能性",
        "特定の教育背景への過度な重み付け",
        "少数派グループの過小評価"
    ],
    risk_mitigation_measures=[
        "保護属性の除外",
        "フェアネスメトリクスの継続的モニタリング",
        "多様な評価者によるモデル検証"
    ],
    human_oversight_measures="全ての採用推奨は人事担当者による最終確認が必須。AIは補助ツールとして位置づけ。",
    override_capability=True,
    transparency_measures="候補者には AI による評価が行われることを事前通知",
    user_information_provided="システムの動作原理、使用されるデータ、意思決定への影響について説明文書を提供",
    logging_capability=True,
    monitoring_procedures="月次でのモデル性能評価、四半期ごとのバイアス監査",
    conformity_assessment_body="EU Notified Body XYZ",
    assessment_date=datetime(2024, 3, 15),
    certification_number="EU-AI-2024-12345"
)

# レポート生成
print(doc.generate_compliance_report())
```

### 3. バイアス検出と公平性の確保

AI Actではデータとモデルの公平性が重視されます。

```python
import numpy as np
from typing import Dict, Tuple
from sklearn.metrics import confusion_matrix

class FairnessAuditor:
    """AI システムの公平性を監査するクラス"""
    
    def __init__(self, protected_attributes: List[str]):
        """
        Args:
            protected_attributes: 保護属性のリスト（性別、年齢、人種など）
        """
        self.protected_attributes = protected_attributes
        self.audit_results = {}
    
    def demographic_parity(
        self, 
        predictions: np.ndarray, 
        protected_group: np.ndarray
    ) -> Dict[str, float]:
        """
        Demographic Parity（統計的パリティ）の計算
        
        異なるグループ間で肯定的な予測の割合が同じかを検証
        """
        unique_groups = np.unique(protected_group)
        positive_rates = {}
        
        for group in unique_groups:
            group